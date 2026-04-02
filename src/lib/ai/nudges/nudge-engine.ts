/**
 * SKIDS Smart Nudges — Nudge Engine
 *
 * Generates proactive, personalized nudges for parents.
 * The wire speaks: "Aarav is entering the 18-month window —
 * first words expected. Keep an ear out this week!"
 *
 * Nudges are computed on-demand (not pre-generated) and
 * filtered against dismissed nudges. This ensures nudges
 * are always current with the latest life record state.
 *
 * Nudge sources:
 * 1. Milestone windows — developmental windows approaching or open
 * 2. Observation gaps — domains with no recent observations
 * 3. Pattern alerts — repeated observations in same domain
 * 4. Celebrations — recently achieved milestones
 * 5. Vaccination reminders — overdue or upcoming
 * 6. Screening due — age-based screening schedule
 *
 * NOT included: streak shame, "you missed a day!", gamification pressure.
 */

import type { LifeRecordContext } from '../life-record/types'
import type { Nudge, NudgeType } from './types'
import { getPromptsForAge } from '../life-record/domain-prompts'

// ============================================
// PUBLIC API
// ============================================

/**
 * Generate all applicable nudges for a child.
 * Caller should filter against nudge_dismissals table.
 */
export async function generateNudges(
  context: LifeRecordContext,
  db: any
): Promise<Nudge[]> {
  const nudges: Nudge[] = []
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const name = context.child.name
  const age = context.child.ageMonths

  // 1. Milestone window nudges
  const approachingMilestones = context.milestones.notStarted
    .filter(m => m.expectedAgeMax > 0 && m.expectedAgeMax - age <= 2 && m.expectedAgeMax >= age)

  for (const ms of approachingMilestones.slice(0, 2)) {
    const monthsLeft = ms.expectedAgeMax - age
    const timeText = monthsLeft <= 0 ? 'right now' : monthsLeft === 1 ? 'this month' : `in the next ${monthsLeft} months`

    nudges.push({
      key: `mw_${ms.key}_${age}`,
      id: `mw_${ms.key}`,
      type: 'milestone_window',
      title: `${ms.category} milestone approaching`,
      body: `${name} is entering the window for "${ms.key}" ${timeText}. Watch for progress!`,
      emoji: CATEGORY_EMOJI[ms.category] || '🎯',
      actionType: 'add_observation',
      actionData: ms.category,
      priority: 1,
    })
  }

  // 2. Delayed milestone alerts
  for (const ms of context.milestones.delayed.slice(0, 2)) {
    nudges.push({
      key: `md_${ms.key}_${age}`,
      id: `md_${ms.key}`,
      type: 'milestone_window',
      title: `${ms.category} milestone delayed`,
      body: `"${ms.key}" was expected by ${ms.expectedAgeMax} months. Discuss with your pediatrician at the next visit.`,
      emoji: '⚠️',
      actionType: 'open_chat',
      actionData: `${name}'s "${ms.key}" milestone seems delayed. It was expected by ${ms.expectedAgeMax} months and ${name} is now ${age} months. What should I do?`,
      priority: 1,
    })
  }

  // 3. Observation gaps
  if (db) {
    try {
      const agePrompts = getPromptsForAge(age)
      const relevantDomains = [...new Set(agePrompts.map(p => p.domain))]

      const { results: recentObs } = await db.prepare(
        `SELECT DISTINCT category FROM parent_observations
         WHERE child_id = ? AND date >= ?`
      ).bind(context.child.id, ninetyDaysAgo).all()

      const recentlyObserved = new Set(
        (recentObs || []).map((r: any) => r.category).filter(Boolean)
      )

      // Clinical priority for gap nudges
      const priorityDomains = ['vision', 'hearing', 'language', 'motor', 'neurological', 'growth']
      const gapDomains = relevantDomains.filter(d =>
        !recentlyObserved.has(d) && !recentlyObserved.has(DOMAIN_TO_CATEGORY[d] || d)
      )

      const topGap = priorityDomains.find(d => gapDomains.includes(d)) || gapDomains[0]
      if (topGap) {
        const displayName = DOMAIN_DISPLAY[topGap] || topGap
        nudges.push({
          key: `gap_${topGap}_${Math.floor(age / 3)}`, // Refresh quarterly
          id: `gap_${topGap}`,
          type: 'observation_gap',
          title: `How is ${name}'s ${displayName.toLowerCase()}?`,
          body: `No ${displayName.toLowerCase()} observations in 3 months. Quick check-in helps keep the record complete.`,
          emoji: DOMAIN_EMOJI[topGap] || '👁',
          actionType: 'add_observation',
          actionData: topGap,
          priority: 2,
        })
      }

      // 4. Pattern alerts (3+ observations in same domain in 30 days)
      const { results: patternObs } = await db.prepare(
        `SELECT category, COUNT(*) as cnt FROM parent_observations
         WHERE child_id = ? AND date >= ?
         GROUP BY category HAVING cnt >= 3`
      ).bind(context.child.id, thirtyDaysAgo).all()

      for (const p of (patternObs || []).slice(0, 1) as any[]) {
        if (!p.category) continue
        const displayName = DOMAIN_DISPLAY[p.category] || p.category
        nudges.push({
          key: `pat_${p.category}_${now.toISOString().split('T')[0].substring(0, 7)}`, // Monthly
          id: `pat_${p.category}`,
          type: 'pattern_alert',
          title: `${p.cnt} ${displayName.toLowerCase()} notes this month`,
          body: `You've been noting ${displayName.toLowerCase()} things frequently. Worth mentioning to your pediatrician.`,
          emoji: '📊',
          actionType: 'open_chat',
          actionData: `I've had ${p.cnt} observations about ${name}'s ${displayName.toLowerCase()} this month. Should I be concerned?`,
          priority: 2,
        })
      }

      // 5. Celebrations (milestones achieved in last 7 days)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { results: recentMilestones } = await db.prepare(
        `SELECT milestone_key, title FROM milestones
         WHERE child_id = ? AND status = 'achieved' AND updated_at >= ?
         ORDER BY updated_at DESC LIMIT 3`
      ).bind(context.child.id, sevenDaysAgo).all()

      for (const ms of (recentMilestones || []) as any[]) {
        nudges.push({
          key: `cel_${ms.milestone_key}`,
          id: `cel_${ms.milestone_key}`,
          type: 'celebration',
          title: `${name} achieved a milestone!`,
          body: `"${ms.title}" — wonderful progress! Every milestone matters.`,
          emoji: '🎉',
          actionType: 'view_milestone',
          priority: 1,
        })
      }
    } catch (err) {
      console.error('[Nudges] DB query error:', err)
    }
  }

  // 6. Vaccination reminders
  if (context.vaccinations.overdue.length > 0) {
    nudges.push({
      key: `vax_overdue_${Math.floor(age / 1)}`,
      id: 'vax_overdue',
      type: 'vaccination_reminder',
      title: 'Vaccination overdue',
      body: `${name} has ${context.vaccinations.overdue.length} overdue vaccination${context.vaccinations.overdue.length > 1 ? 's' : ''}. Schedule a visit with your pediatrician.`,
      emoji: '💉',
      actionType: 'view_vaccination',
      priority: 1,
    })
  }

  // 7. Age-based screening nudges
  const screeningNudge = getScreeningNudge(age, name)
  if (screeningNudge) {
    nudges.push(screeningNudge)
  }

  // Sort by priority
  nudges.sort((a, b) => a.priority - b.priority)

  return nudges
}

/**
 * Filter nudges against dismissed nudge keys.
 */
export async function filterDismissedNudges(
  nudges: Nudge[],
  parentId: string,
  db: any
): Promise<Nudge[]> {
  if (!db || nudges.length === 0) return nudges

  try {
    const { results: dismissed } = await db.prepare(
      'SELECT nudge_key FROM nudge_dismissals WHERE parent_id = ?'
    ).bind(parentId).all()

    const dismissedKeys = new Set(
      (dismissed || []).map((d: any) => d.nudge_key)
    )

    return nudges.filter(n => !dismissedKeys.has(n.key))
  } catch {
    return nudges
  }
}

// ============================================
// SCREENING NUDGES
// ============================================

function getScreeningNudge(ageMonths: number, childName: string): Nudge | null {
  const screenings: Array<{ ageMin: number; ageMax: number; key: string; title: string; body: string; domain: string }> = [
    { ageMin: 9, ageMax: 11, key: 'dev_9', title: 'Developmental screening due', body: `At 9-12 months, a developmental screening is recommended for ${childName}. Early detection means early support.`, domain: 'general' },
    { ageMin: 17, ageMax: 19, key: 'dev_18', title: '18-month screening (includes autism)', body: `The 18-month screening includes autism screening (M-CHAT). This is routine and gives peace of mind.`, domain: 'general' },
    { ageMin: 23, ageMax: 25, key: 'dev_24', title: 'Two-year developmental check', body: `${childName} is due for a comprehensive 2-year developmental screening.`, domain: 'general' },
    { ageMin: 35, ageMax: 37, key: 'vision_3', title: 'Vision screening time', body: `Age 3 is the recommended time for ${childName}'s first formal vision screening. Early detection is key.`, domain: 'vision' },
    { ageMin: 47, ageMax: 49, key: 'school_4', title: 'Pre-school health check', body: `Before school, ${childName} should have vision, hearing, and dental checks.`, domain: 'general' },
  ]

  const screening = screenings.find(s => ageMonths >= s.ageMin && ageMonths <= s.ageMax)
  if (!screening) return null

  return {
    key: `scr_${screening.key}`,
    id: `scr_${screening.key}`,
    type: 'screening_due',
    title: screening.title,
    body: screening.body,
    emoji: '🩺',
    actionType: 'open_chat',
    actionData: `What does the ${screening.title.toLowerCase()} involve for ${childName}?`,
    priority: 2,
  }
}

// ============================================
// DISPLAY HELPERS
// ============================================

const DOMAIN_DISPLAY: Record<string, string> = {
  motor: 'Movement', vision: 'Vision', hearing: 'Hearing',
  language: 'Speech', neurological: 'Neurological',
  behavioral: 'Behavior', emotional: 'Emotional',
  cognitive: 'Learning', growth: 'Growth', skin: 'Skin',
  gi_nutrition: 'Eating', respiratory: 'Breathing',
  cardiac: 'Heart', dental: 'Dental', general: 'Health',
}

const DOMAIN_EMOJI: Record<string, string> = {
  motor: '🏃', vision: '👁', hearing: '👂', language: '🗣',
  neurological: '🧠', behavioral: '😊', emotional: '💙',
  cognitive: '🧩', growth: '📏', skin: '🩹', gi_nutrition: '🍽',
  respiratory: '🫁', cardiac: '❤️', dental: '🦷', general: '✨',
}

const CATEGORY_EMOJI: Record<string, string> = {
  motor: '🏃', language: '🗣', social: '👫', cognitive: '🧩',
  self_care: '🧸', emotional: '💙', sensory: '👁',
}

const DOMAIN_TO_CATEGORY: Record<string, string> = {
  motor: 'Development', language: 'Development', cognitive: 'Development',
  behavioral: 'Behavior', emotional: 'Behavior',
  vision: 'Health', hearing: 'Health', skin: 'Health',
  gi_nutrition: 'Eating', growth: 'Health', general: 'General',
}
