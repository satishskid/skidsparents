/**
 * SKIDS Daily Insights — Type Definitions
 *
 * Daily personalized insights are the parent's "morning briefing" —
 * generated from the child's life record + knowledge graph, not generic blogs.
 * Every insight is tied to THIS child's actual data.
 */

export type InsightType =
  | 'milestone_watch'     // Approaching a developmental window
  | 'observation_gap'     // No observations in a domain for a while
  | 'pattern_alert'       // Multiple observations in same domain
  | 'celebration'         // Milestone achieved, growth on track, etc.
  | 'age_insight'         // General age-appropriate guidance
  | 'screening_due'       // Screening or vaccination coming up
  | 'growth_update'       // Growth trend noteworthy

export interface DailyInsight {
  /** Unique ID for this insight */
  id: string
  /** Type determines card styling and priority */
  type: InsightType
  /** Short title (1 line) */
  title: string
  /** Body text (2-3 sentences, warm and parent-friendly) */
  body: string
  /** The question to seed into chat when parent taps "Ask Dr. SKIDS" */
  deepQueryPrompt: string
  /** Which body system domain this relates to */
  domain: string
  /** Priority: 1 = show first, 5 = background */
  priority: number
  /** Emoji for the card */
  emoji: string
}

export interface InsightGenerationContext {
  childName: string
  ageMonths: number
  gender: 'male' | 'female' | 'other'
  /** Domains with recent observations (within 30 days) */
  recentDomains: string[]
  /** Domains with NO observations in 90+ days */
  gapDomains: string[]
  /** Domains with 3+ observations in 30 days */
  patternDomains: Array<{ domain: string; count: number }>
  /** Milestones approaching their expected window */
  approachingMilestones: Array<{ key: string; category: string; expectedAgeMax: number }>
  /** Recently achieved milestones (last 7 days) */
  recentAchievements: Array<{ key: string; title: string }>
  /** Overdue vaccinations */
  overdueVaccinations: string[]
  /** Growth trend */
  growthTrend?: 'stable' | 'upward' | 'downward'
  /** Active conditions */
  activeConditions: string[]
  /** Birth history flags */
  isPreterm: boolean
  hadNicuStay: boolean
  /** Delayed milestones */
  delayedMilestones: Array<{ key: string; category: string }>
  /** Active growth tracks for the child's current age */
  activeGrowthTracks: Array<{ domain: string; title: string; keyMessage?: string; flaggedForPed: number }>
  /** Active interventions with compliance */
  activeInterventions: Array<{ protocolName: string; category: string; conditionName?: string; compliancePct?: number; currentStreak: number }>
}
