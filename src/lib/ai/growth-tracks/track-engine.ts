/**
 * Growth Track Engine — Activates age-appropriate tracks, generates guidance,
 * detects red flags, feeds into daily insights and nudges.
 *
 * Growth tracks are universal (every child), continuous, and automatic.
 * They represent "growing the child" — not intervention for a condition.
 */

import type {
  GrowthTrack,
  GrowthTrackDomain,
  RedFlag,
  RedFlagCondition,
  CoachingTopic,
} from './types'

// ── Core Functions ──

/**
 * Get all active growth tracks for a child's current age.
 * Returns tracks where ageMinMonths <= childAgeMonths < ageMaxMonths.
 */
export function getActiveTracksForAge(
  allTracks: GrowthTrack[],
  childAgeMonths: number,
  region: string = 'global'
): GrowthTrack[] {
  return allTracks.filter(track =>
    track.ageMinMonths <= childAgeMonths &&
    childAgeMonths < track.ageMaxMonths &&
    track.region === region
  )
}

/**
 * Get tracks for a specific domain at a given age.
 */
export function getTracksForDomain(
  allTracks: GrowthTrack[],
  childAgeMonths: number,
  domain: GrowthTrackDomain,
  region: string = 'global'
): GrowthTrack[] {
  return getActiveTracksForAge(allTracks, childAgeMonths, region)
    .filter(t => t.domain === domain)
}

/**
 * Get the guidance text for a track — the daily tip and key message.
 * Used by daily insights generator to create growth-track-based insights.
 */
export function getTrackGuidance(track: GrowthTrack): {
  title: string
  whatToExpect: string
  keyMessage: string
  dailyTip: string
  activities: string[]
} {
  const tipIndex = Math.floor(Math.random() * track.parentGuidance.dailyTips.length)
  return {
    title: track.title,
    whatToExpect: track.whatToExpect,
    keyMessage: track.parentGuidance.keyMessage,
    dailyTip: track.parentGuidance.dailyTips[tipIndex] || track.parentGuidance.keyMessage,
    activities: track.parentGuidance.activities.map(a => a.name),
  }
}

/**
 * Detect red flags from recent observations and milestone data.
 * Returns triggered red flags with severity for doctor alerting.
 */
export function detectRedFlags(
  track: GrowthTrack,
  context: RedFlagContext
): TriggeredRedFlag[] {
  const triggered: TriggeredRedFlag[] = []

  for (const redFlag of track.redFlags) {
    const allConditionsMet = redFlag.conditions.every(condition =>
      evaluateRedFlagCondition(condition, context)
    )

    if (allConditionsMet) {
      triggered.push({
        redFlag,
        trackId: track.id,
        trackDomain: track.domain,
        trackTitle: track.title,
        triggeredAt: new Date().toISOString(),
      })
    }
  }

  return triggered
}

/**
 * Find the best coaching response for a parent's question within a track's playbook.
 * Returns the matched topic or null if no match (boundary case).
 */
export function findCoachingResponse(
  playbook: Record<string, CoachingTopic>,
  parentMessage: string
): { topic: string; coaching: CoachingTopic } | null {
  const messageLower = parentMessage.toLowerCase()

  let bestMatch: { topic: string; coaching: CoachingTopic; score: number } | null = null

  for (const [topic, coaching] of Object.entries(playbook)) {
    let score = 0
    for (const pattern of coaching.questionPatterns) {
      if (messageLower.includes(pattern.toLowerCase())) {
        score += 1
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { topic, coaching, score }
    }
  }

  return bestMatch ? { topic: bestMatch.topic, coaching: bestMatch.coaching } : null
}

/**
 * Build the system prompt for growth track coaching.
 * This is a lighter version of intervention coaching — no compliance tracking,
 * no prescribed protocol, just developmental guidance from the playbook.
 */
export function buildGrowthTrackSystemPrompt(
  tracks: GrowthTrack[],
  childName: string,
  childAgeMonths: number
): string {
  const parts: string[] = []

  parts.push(GROWTH_COACH_PERSONA)

  parts.push(`CHILD: ${childName}, ${formatAge(childAgeMonths)}`)

  // Include all active track playbooks
  for (const track of tracks) {
    parts.push(`\n--- ${track.title} ---`)
    parts.push(`CONTEXT: ${track.whatToExpect}`)
    parts.push(`KEY MESSAGE: ${track.parentGuidance.keyMessage}`)
    parts.push(`\nCOACHING TOPICS:`)
    for (const [topic, entry] of Object.entries(track.coachingPlaybook)) {
      const truncated = entry.response.length > 300
        ? entry.response.substring(0, 300) + '...'
        : entry.response
      parts.push(`- ${topic}: ${truncated}`)
      if (entry.boundary) parts.push(`  [BOUNDARY: Direct to doctor]`)
    }

    // Include parental coping
    if (track.parentalCoping) {
      parts.push(`\nPARENTAL SUPPORT:`)
      for (const norm of track.parentalCoping.normalizations) {
        parts.push(`- ${norm}`)
      }
    }
  }

  parts.push(GROWTH_COACH_GUARDRAILS)

  return parts.join('\n')
}

// ── Internal Helpers ──

function evaluateRedFlagCondition(
  condition: RedFlagCondition,
  context: RedFlagContext
): boolean {
  switch (condition.type) {
    case 'observation_pattern': {
      const patternLower = condition.pattern.toLowerCase()
      return context.recentObservations.some(obs =>
        obs.text.toLowerCase().includes(patternLower)
      )
    }
    case 'milestone_absent': {
      return context.absentMilestones.includes(condition.pattern)
    }
    case 'behavior_frequency': {
      if (!condition.threshold) return false
      const patternLower = condition.pattern.toLowerCase()
      const count = context.recentObservations.filter(obs =>
        obs.text.toLowerCase().includes(patternLower)
      ).length
      return count >= condition.threshold
    }
    case 'parent_concern': {
      return context.parentConcernLevel >= (condition.threshold || 3)
    }
    default:
      return false
  }
}

function formatAge(months: number): string {
  if (months < 1) return 'newborn'
  if (months < 12) return `${months} months`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years}y ${rem}mo` : `${years} years`
}

// ── Types ──

export interface RedFlagContext {
  recentObservations: Array<{ text: string; domain?: string; date: string }>
  absentMilestones: string[]              // Milestone keys not achieved by expected age
  parentConcernLevel: number              // 1-5 scale
  childAgeMonths: number
}

export interface TriggeredRedFlag {
  redFlag: RedFlag
  trackId: string
  trackDomain: GrowthTrackDomain
  trackTitle: string
  triggeredAt: string
}

// ── Prompts ──

const GROWTH_COACH_PERSONA = `You are a developmental growth coach for parents. You help parents understand and nurture their child's emotional, behavioral, social, and physical development using evidence-based guidance from pediatric science and developmental psychology.

COMMUNICATION STYLE:
- Warm, reassuring, non-judgmental
- Always normalize first, then guide
- Short responses (2-3 paragraphs max)
- Use the child's name
- Acknowledge the parent's effort and feelings
- Indian family context where relevant (joint family, academic pressure)

YOUR ROLE:
- Help parents understand what's NORMAL at each developmental stage
- Provide practical, daily-life guidance
- Support the parent's own emotional wellbeing
- You are NOT a doctor. You do NOT diagnose.
- You answer from developmental science, not internet trends or hearsay.`

const GROWTH_COACH_GUARDRAILS = `

CRITICAL RULES:
1. ONLY answer from the coaching topics above. If a question is not covered, say: "That's beyond what I can help with. Let's discuss this with your pediatrician."
2. ALWAYS normalize before guiding. "This is very common at this age" before "Here's what helps."
3. NEVER diagnose or label the child (e.g., never say "your child has ADHD" or "this might be autism").
4. If a parent describes concerning symptoms that match a RED FLAG, say: "I want to make sure your pediatrician knows about this. It's worth discussing at your next visit." Flag as boundary hit.
5. NEVER guilt-trip. "You're doing great by even asking this question" is always appropriate.
6. NEVER search the internet. All your knowledge comes from the developmental science in your playbook.
7. Include parental coping in your responses when the parent seems stressed: "This is hard. Your feelings matter too."
8. When you don't know something, say so honestly. Don't make up advice.`
