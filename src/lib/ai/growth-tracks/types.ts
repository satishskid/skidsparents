/**
 * Growth Track Types — Developmental Nurturing (Layer 1)
 *
 * Growth tracks are universal, continuous developmental guidance
 * baked into the life engine. Every child gets them, automatically
 * activated by age period. This is "growing the child" — not intervention.
 *
 * 8 domains × 10 age periods = ~80 tracks covering 0-18 years.
 */

// ── Domain Types ──

export type GrowthTrackDomain =
  | 'emotional'          // Emotional intelligence & regulation
  | 'behavioral'         // Behavioral development & discipline
  | 'nutrition_habits'   // Healthy eating as life habit
  | 'physical_activity'  // Movement & physical development
  | 'sleep_hygiene'      // Sleep routines & quality
  | 'social'             // Social development & relationships
  | 'digital_wellness'   // Screen time, social media, technology
  | 'parental_coping'    // Parent wellbeing & education

// ── Age Periods ──

export type AgePeriod =
  | '0-3mo'
  | '3-6mo'
  | '6-12mo'
  | '12-24mo'
  | '2-3yr'
  | '3-5yr'
  | '5-8yr'
  | '8-12yr'
  | '12-15yr'
  | '15-18yr'

// ── Growth Track Definition ──

export interface GrowthTrack {
  id: string
  domain: GrowthTrackDomain
  ageMinMonths: number
  ageMaxMonths: number
  agePeriod: AgePeriod
  title: string                           // "Understanding Tantrums (18-36 months)"
  whatToExpect: string                     // Normalize: "Tantrums are NORMAL at this age..."
  parentGuidance: ParentGuidance
  coachingPlaybook: CoachingPlaybook       // Same format as intervention playbooks
  milestones: DevelopmentalMilestone[]     // Emotional/social milestones to observe
  redFlags: RedFlag[]                      // When normal becomes concerning → nudge to ped
  parentalCoping: ParentalCopingGuidance   // Parent's own emotional guidance
  evidenceBase: string                     // Brazelton, AAP Bright Futures, WHO, Piaget, Erikson, Bowlby
  region: string                           // 'global' | 'india' | 'usa' | 'gcc'
  protocolAuthority: string                // WHO, AAP, IAP, etc.
}

export interface ParentGuidance {
  dailyTips: string[]                      // 3-5 actionable daily tips
  doList: string[]                         // "Do" recommendations
  dontList: string[]                       // "Don't" anti-patterns
  activities: GuidedActivity[]             // Suggested activities
  keyMessage: string                       // The ONE thing to remember this period
}

export interface GuidedActivity {
  name: string
  description: string
  ageAppropriate: boolean
  durationMinutes: number
  frequency: string                        // "daily", "2-3 times/week"
}

// ── Coaching Playbook (shared format with interventions) ──

export interface CoachingPlaybook {
  [topic: string]: CoachingTopic
}

export interface CoachingTopic {
  questionPatterns: string[]               // Keywords/patterns that trigger this topic
  response: string                         // The coaching response (with {{child_name}} etc.)
  followUp?: string                        // Optional follow-up question
  boundary: boolean                        // true = "ask your doctor" topic
}

// ── Milestones & Red Flags ──

export interface DevelopmentalMilestone {
  id: string
  description: string                      // "Can name 3+ emotions"
  domain: GrowthTrackDomain
  typicalAgeMonths: number
  isObservable: boolean                    // Can parent observe at home?
  observationPrompt: string               // "Does [child] name feelings like happy, sad, angry?"
}

export interface RedFlag {
  id: string
  description: string                      // "No words at 2 + aggression + no eye contact"
  severity: 'monitor' | 'discuss_with_ped' | 'urgent_referral'
  conditions: RedFlagCondition[]           // ALL must be true to trigger
  suggestedAction: string
  referralSpecialty?: string               // Which subspecialty if referral needed
}

export interface RedFlagCondition {
  type: 'observation_pattern' | 'milestone_absent' | 'behavior_frequency' | 'parent_concern'
  pattern: string                          // Keyword pattern or milestone key
  threshold?: number                       // For frequency: how many in how many days
}

// ── Parental Coping ──

export interface ParentalCopingGuidance {
  normalizations: string[]                 // "It's normal to feel exhausted by tantrums"
  copingStrategies: string[]               // "Step away for 30 seconds when overwhelmed"
  selfCareReminders: string[]              // "You matter too. A 10-minute break is not selfish"
  partnerCommunication?: string            // Advice for co-parenting through this phase
  warningSignsForParent: string[]          // When parent needs their own support
}

// ── Track Progress (per-child) ──

export interface GrowthTrackProgress {
  id: string
  childId: string
  trackId: string
  status: 'active' | 'completed' | 'flagged'
  parentEngagementScore: number
  insightsViewed: number
  coachSessions: number
  flaggedForPed: number
  startedAt: string
  updatedAt: string
}

// ── Display Helpers ──

export const DOMAIN_DISPLAY: Record<GrowthTrackDomain, string> = {
  emotional: 'Emotional Intelligence',
  behavioral: 'Behavioral Development',
  nutrition_habits: 'Healthy Eating',
  physical_activity: 'Physical Activity',
  sleep_hygiene: 'Sleep & Rest',
  social: 'Social Skills',
  digital_wellness: 'Digital Wellness',
  parental_coping: 'Parent Wellbeing',
}

export const DOMAIN_EMOJI: Record<GrowthTrackDomain, string> = {
  emotional: '💛',
  behavioral: '🧠',
  nutrition_habits: '🥗',
  physical_activity: '🏃',
  sleep_hygiene: '😴',
  social: '🤝',
  digital_wellness: '📱',
  parental_coping: '🫂',
}

export const DOMAIN_COLORS: Record<GrowthTrackDomain, string> = {
  emotional: 'amber',
  behavioral: 'purple',
  nutrition_habits: 'green',
  physical_activity: 'blue',
  sleep_hygiene: 'indigo',
  social: 'pink',
  digital_wellness: 'cyan',
  parental_coping: 'rose',
}
