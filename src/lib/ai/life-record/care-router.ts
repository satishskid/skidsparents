/**
 * SKIDS Care Continuity Engine — Pathway Router
 *
 * Takes projection results and routes to the appropriate care pathway.
 * The system RECOMMENDS the pathway — the parent confirms.
 *
 * Five pathways:
 *   1_observe       → All clear. Parent educated, home activities, follow-up scheduled.
 *   2_ped_initiated → Parent satisfied but system flags for pediatrician silently.
 *   3_econsult      → System recommends doctor review. Async text response.
 *   4_tele          → Needs real-time doctor conversation. Video consultation.
 *   5_inperson      → Physical examination needed or emergency.
 *
 * This is a pure function — no DB access, no side effects.
 * Deterministic decision tree, not AI-generated.
 */

import type { ProjectionResult, ObservationProjection, Urgency } from './types'

// ============================================
// TYPES
// ============================================

export type CarePathway = '1_observe' | '2_ped_initiated' | '3_econsult' | '4_tele' | '5_inperson'
export type PedAlertLevel = 'none' | 'info' | 'review' | 'urgent' | 'emergency'

export interface CareRouterInput {
  /** Full projection result from the probability engine */
  projectionResult: ProjectionResult
  /** Child's age in months */
  childAgeMonths: number
  /** Whether the child has an assigned pediatrician */
  hasPediatrician: boolean
  /** Number of care episodes for this child in the past 30 days */
  recentEpisodeCount?: number
}

export interface CareRouterOutput {
  /** Which care pathway to follow */
  pathway: CarePathway
  /** Alert level for the pediatrician dashboard */
  pedAlertLevel: PedAlertLevel
  /** Initial status for the care episode */
  initialStatus: 'open' | 'awaiting_ped'
  /** Warm, conversational summary for the parent */
  parentSummary: string
  /** Structured guidance: home activities, watch-list, next steps */
  parentGuidance: string
  /** Days until follow-up check-in (null = immediate or no follow-up) */
  followUpDays: number | null
  /** Internal reasoning for audit */
  routingReason: string
}

// ============================================
// PATHWAY ROUTER
// ============================================

export function routeCarePathway(input: CareRouterInput): CareRouterOutput {
  const { projectionResult, childAgeMonths, hasPediatrician, recentEpisodeCount = 0 } = input
  const projections = projectionResult.projections

  if (projections.length === 0) {
    return {
      pathway: '1_observe',
      pedAlertLevel: 'none',
      initialStatus: 'open',
      parentSummary: buildParentSummary(projections, childAgeMonths, 'no_projections'),
      parentGuidance: buildParentGuidance(projections, 'no_projections'),
      followUpDays: null,
      routingReason: 'No projections matched — insufficient data for routing',
    }
  }

  // ── Classify projections by urgency ──
  const emergencies = projections.filter(p => p.urgency === 'emergency')
  const urgentMustNotMiss = projections.filter(p => p.urgency === 'urgent' && p.mustNotMiss && p.matchSource === 'pattern')
  const urgentOther = projections.filter(p => p.urgency === 'urgent' && !p.mustNotMiss)
  const soonItems = projections.filter(p => p.urgency === 'soon' && p.matchSource === 'pattern')
  const normalVariants = projections.filter(p => p.category === 'normal_variant' && p.adjustedProbability > 0.3)
  const nonNormalRoutine = projections.filter(p =>
    p.category !== 'normal_variant' && p.urgency === 'routine' && p.matchSource === 'pattern'
  )

  // ── Decision tree ──
  let pathway: CarePathway
  let pedAlertLevel: PedAlertLevel
  let followUpDays: number | null
  let routingReason: string

  // Rule 1: Emergency → immediately in-person
  if (emergencies.length > 0) {
    pathway = '5_inperson'
    pedAlertLevel = 'emergency'
    followUpDays = null // immediate
    routingReason = `Emergency projection: ${emergencies.map(e => e.conditionName).join(', ')}`
  }
  // Rule 2: Urgent must-not-miss → tele or in-person depending on probability
  else if (urgentMustNotMiss.length > 0) {
    const highProbUrgent = urgentMustNotMiss.some(p => p.adjustedProbability > 0.3)
    pathway = highProbUrgent ? '5_inperson' : '4_tele'
    pedAlertLevel = 'urgent'
    followUpDays = 1
    routingReason = `Urgent must-not-miss: ${urgentMustNotMiss.map(u => `${u.conditionName} (${(u.adjustedProbability * 100).toFixed(1)}%)`).join(', ')}`
  }
  // Rule 3: Urgent non-must-not-miss → e-consult
  else if (urgentOther.length > 0) {
    pathway = '3_econsult'
    pedAlertLevel = 'urgent'
    followUpDays = 2
    routingReason = `Urgent conditions (not must-not-miss): ${urgentOther.map(u => u.conditionName).join(', ')}`
  }
  // Rule 4: Soon urgency → e-consult with review
  else if (soonItems.length > 0) {
    pathway = '3_econsult'
    pedAlertLevel = 'review'
    followUpDays = 7
    routingReason = `Soon-urgency conditions: ${soonItems.map(s => s.conditionName).join(', ')}`
  }
  // Rule 5: All normal variants, high confidence → observe
  else if (normalVariants.length > 0 && nonNormalRoutine.length === 0) {
    pathway = '1_observe'
    pedAlertLevel = 'none'
    followUpDays = 30
    routingReason = `All normal variants: ${normalVariants.map(n => n.conditionName).join(', ')}`
  }
  // Rule 6: Routine with non-normal conditions → observe but flag info
  else if (nonNormalRoutine.length > 0) {
    pathway = '1_observe'
    pedAlertLevel = 'info'
    followUpDays = 14
    routingReason = `Routine non-normal conditions: ${nonNormalRoutine.map(n => n.conditionName).join(', ')}`
  }
  // Fallback: safe default → e-consult
  else {
    pathway = '3_econsult'
    pedAlertLevel = 'review'
    followUpDays = 7
    routingReason = 'Fallback: could not classify confidently, defaulting to e-consult'
  }

  // ── Edge case overrides ──

  // Neonatal safety net: any urgent in child < 3 months → in-person
  if (childAgeMonths < 3 && pedAlertLevel === 'urgent') {
    pathway = '5_inperson'
    followUpDays = null
    routingReason += ' | Neonatal override: child < 3 months with urgent concern'
  }

  // Recurrent concern escalation: 3+ episodes in 30 days → bump pathway
  if (recentEpisodeCount >= 3) {
    pedAlertLevel = bumpAlertLevel(pedAlertLevel)
    if (pathway === '1_observe') {
      pathway = '3_econsult'  // skip ped-initiated, go straight to econsult for recurrent concerns
      routingReason += ' | Recurrent concern: 3+ episodes in 30 days, escalating to e-consult'
    }
  }

  // Must-not-miss safety net: even if pathway is observe, if there's a safety-net must-not-miss, flag for ped
  const safetyNetMustNotMiss = projections.filter(p => p.mustNotMiss && p.matchSource === 'safety-net')
  if (safetyNetMustNotMiss.length > 0 && pathway === '1_observe') {
    pathway = '2_ped_initiated'
    if (pedAlertLevel === 'none') pedAlertLevel = 'info'
    routingReason += ` | Safety-net must-not-miss flagged: ${safetyNetMustNotMiss.map(s => s.conditionName).join(', ')}`
  }

  // ── Determine initial status ──
  const initialStatus = pedAlertLevel !== 'none' ? 'awaiting_ped' as const : 'open' as const

  return {
    pathway,
    pedAlertLevel,
    initialStatus,
    parentSummary: buildParentSummary(projections, childAgeMonths, pathway),
    parentGuidance: buildParentGuidance(projections, pathway),
    followUpDays,
    routingReason,
  }
}

// ============================================
// PARENT SUMMARY GENERATOR
// ============================================

function buildParentSummary(
  projections: ObservationProjection[],
  ageMonths: number,
  pathway: CarePathway | 'no_projections'
): string {
  if (pathway === 'no_projections') {
    return "I wasn't able to find specific guidance for what you described. Could you try telling me a bit more about what you're noticing?"
  }

  const normals = projections.filter(p => p.category === 'normal_variant' && p.adjustedProbability > 0.3)
  const topProjection = projections[0]
  const ageText = ageMonths < 12 ? `${ageMonths}-month-old` : `${Math.floor(ageMonths / 12)}-year-old`

  if (pathway === '1_observe' || pathway === '2_ped_initiated') {
    if (normals.length > 0) {
      return `What you're describing is very common for a ${ageText}. ${normals[0].parentExplanation} You're doing great by paying attention — that's exactly what helps your child thrive.`
    }
    return `Thank you for sharing this. For a ${ageText}, this is something worth keeping an eye on, but it's manageable. ${topProjection?.parentExplanation || ''}`
  }

  if (pathway === '3_econsult') {
    return `Thank you for sharing this. I've looked into it carefully, and I think it would be helpful to have your pediatrician take a quick look. The good news is you don't need to rush in — your doctor can review your child's record and respond with guidance.`
  }

  if (pathway === '4_tele') {
    return `I've looked into what you described, and I think a quick video call with your pediatrician would be helpful. They'll already have your child's full record, so the conversation can focus on what matters most.`
  }

  if (pathway === '5_inperson') {
    const emergencies = projections.filter(p => p.urgency === 'emergency')
    if (emergencies.length > 0) {
      return `I want to be upfront with you — what you're describing needs prompt medical attention. Please head to your nearest hospital or call your pediatrician right away.`
    }
    return `Based on what you've described, I'd recommend having your pediatrician see your child in person. This will allow them to do a proper examination and give you the clearest guidance.`
  }

  return `Thank you for sharing this. I've noted everything and your pediatrician will be able to review it.`
}

// ============================================
// PARENT GUIDANCE GENERATOR
// ============================================

function buildParentGuidance(
  projections: ObservationProjection[],
  pathway: CarePathway | 'no_projections'
): string {
  if (pathway === 'no_projections') {
    return JSON.stringify({ activities: [], watchFor: [], escalateIf: [] })
  }

  const allNextSteps = projections
    .filter(p => p.matchSource === 'pattern' || !p.matchSource)
    .flatMap(p => p.parentNextSteps)
    .filter((s, i, arr) => arr.indexOf(s) === i) // dedupe
    .slice(0, 6)

  // Build watch-for list from non-normal projections
  const watchItems = projections
    .filter(p => p.category !== 'normal_variant' && p.urgency !== 'emergency')
    .map(p => p.parentExplanation)
    .slice(0, 3)

  // Build escalation triggers
  const escalateIf: string[] = []
  if (pathway === '1_observe' || pathway === '2_ped_initiated') {
    escalateIf.push('If your child seems to be getting worse rather than better')
    escalateIf.push('If you notice new symptoms you haven\'t seen before')
    escalateIf.push('If you\'re still worried — trust your instincts')
  }
  if (pathway === '5_inperson') {
    const emergencies = projections.filter(p => p.urgency === 'emergency')
    if (emergencies.length > 0) {
      escalateIf.push('Go to the nearest emergency room now')
      escalateIf.push('Call your pediatrician on the way')
    }
  }

  return JSON.stringify({
    activities: allNextSteps,
    watchFor: watchItems,
    escalateIf,
  })
}

// ============================================
// HELPERS
// ============================================

function bumpAlertLevel(level: PedAlertLevel): PedAlertLevel {
  const hierarchy: PedAlertLevel[] = ['none', 'info', 'review', 'urgent', 'emergency']
  const idx = hierarchy.indexOf(level)
  return idx < hierarchy.length - 1 ? hierarchy[idx + 1] : level
}

// ============================================
// PATHWAY DISPLAY HELPERS
// ============================================

export const PATHWAY_LABELS: Record<CarePathway, { label: string; description: string; icon: string }> = {
  '1_observe': {
    label: 'Continue at home',
    description: 'Follow the activities above and keep observing',
    icon: 'home',
  },
  '2_ped_initiated': {
    label: 'Continue at home',
    description: 'Your pediatrician has been notified and may reach out',
    icon: 'home',
  },
  '3_econsult': {
    label: 'Send to doctor for review',
    description: 'Your doctor gets your child\'s full record and responds via message',
    icon: 'mail',
  },
  '4_tele': {
    label: 'Book a video consultation',
    description: 'Talk to your doctor face-to-face from home',
    icon: 'video',
  },
  '5_inperson': {
    label: 'Visit your doctor in person',
    description: 'We recommend an in-person visit for this',
    icon: 'location',
  },
}

export const ALERT_LEVEL_LABELS: Record<PedAlertLevel, { label: string; color: string }> = {
  'none': { label: 'No alert', color: 'gray' },
  'info': { label: 'For awareness', color: 'blue' },
  'review': { label: 'Review recommended', color: 'amber' },
  'urgent': { label: 'Urgent review', color: 'orange' },
  'emergency': { label: 'Emergency', color: 'red' },
}
