/**
 * Intervention Assistant Types — Doctor-Prescribed Protocols (Layer 2)
 *
 * When a pediatrician diagnoses a condition, they prescribe a structured
 * intervention. 99% of pediatric treatment happens at HOME. These types
 * define the data structures for AI-guided home therapy protocols.
 *
 * NOT diagnosis — adherence. The ped prescribes, the parent executes,
 * SKIDS coaches and tracks, the doctor monitors.
 */

// ── Subspecialty Mapping ──

export type SubspecialtyId =
  | 'vision_ai'
  | 'hearing_ai'
  | 'dental_ai'
  | 'neuro_dev_ai'
  | 'nutrition_ai'
  | 'skin_ai'
  | 'respiratory_ai'
  | 'posture_ai'
  | 'cardio_ai'
  | 'behavior_ai'
  | 'immune_ai'
  | 'growth_ai'

export type InterventionCategory =
  | 'vision'
  | 'hearing'
  | 'ent'
  | 'dental'
  | 'developmental'
  | 'nutrition'
  | 'skin'
  | 'allergy'
  | 'respiratory'
  | 'physio'
  | 'musculoskeletal'
  | 'cardiac'
  | 'behavioral'
  | 'immunological'
  | 'growth'
  | 'endocrine'

// ── Protocol Definition ──

export interface InterventionProtocol {
  id: string
  slug: string
  name: string
  category: InterventionCategory
  subspecialty: SubspecialtyId
  conditionName?: string                    // "Amblyopia", "Iron Deficiency Anemia"
  icd10?: string                            // Links to knowledge graph
  region: string                            // 'global' | 'india' | 'usa' | 'gcc'
  protocolAuthority: string                 // IAP, AAP, WHO, Gulf_AP, etc.
  description: string
  evidenceBase: string                      // Citations / guideline references
  ageRangeMin: number                       // months
  ageRangeMax: number                       // months
  defaultDurationDays: number
  defaultFrequency: 'daily' | 'weekly' | 'custom'
  tasks: InterventionTaskDef[]
  coachingPlaybook: CoachingPlaybook
  escalationRules: EscalationRule[]
  customizableParams: CustomizableParam[]
  prevalenceNotes?: string                  // Region-specific prevalence context
  geneticConsiderations?: string            // "Higher G6PD prevalence in Middle Eastern populations"
  dietaryContext?: string                   // "Predominantly vegetarian diet" for India
  version: number
  parentLocale: string                      // 'en' default, future vernacular
}

// ── Task Definitions ──

export interface InterventionTaskDef {
  key: string                               // "patching_session"
  title: string
  category: 'primary' | 'supplementary'
  schedule: TaskSchedule
  instructionsTemplate: string              // "Patch {{target_eye}} eye for {{patching_hours}} hours"
  durationMinutes: number
  successCriteria: string
  loggingType: 'done_skip' | 'done_skip_partial' | 'value_entry' | 'photo_required'
  coachingTopics: string[]                  // Keys into coachingPlaybook
}

export interface TaskSchedule {
  type: 'daily' | 'weekly' | 'specific_days'
  days?: number[]                           // [1,2,3,4,5] for weekdays
  timesPerDay?: number                      // e.g. 1 for patching, 3 for meals
}

// ── Coaching Playbook (shared format with growth tracks) ──

export interface CoachingPlaybook {
  [topic: string]: CoachingTopic
}

export interface CoachingTopic {
  questionPatterns: string[]               // Keywords that trigger this topic
  response: string                         // The coaching response (with {{param}} placeholders)
  followUp?: string                        // Optional follow-up question
  boundary: boolean                        // true = "ask your doctor" → HITL flag
}

// ── Escalation Rules ──

export interface EscalationRule {
  trigger: string                           // "compliance_below_50"
  condition: EscalationCondition
  severity: 'info' | 'warning' | 'urgent'
  titleTemplate: string
  detailTemplate: string
}

export interface EscalationCondition {
  metric: string                            // compliance_pct, consecutive_skips, boundary_hits, parent_concern_level
  operator: 'lt' | 'gt' | 'eq'
  value: number
  windowDays?: number                       // Rolling window
}

// ── Customizable Parameters ──

export interface CustomizableParam {
  key: string                               // "patching_hours"
  type: 'number' | 'select' | 'boolean' | 'text'
  defaultValue: any
  label: string
  unit?: string                             // "hours", "mg", "minutes"
  min?: number
  max?: number
  options?: string[]                        // For select type
}

// ── Assignment (Doctor prescribes to child) ──

export interface InterventionAssignment {
  id: string
  interventionProtocolId: string
  childId: string
  doctorId: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  startDate: string
  endDate?: string
  customParams: Record<string, any>
  childRegion?: string                      // Where child lives
  childEthnicOrigin?: string                // Genetic origin context
  doctorNotes?: string
  createdAt: string
  updatedAt: string
}

// ── Materialized Task (daily instance) ──

export interface InterventionTask {
  id: string
  assignmentId: string
  childId: string
  taskDate: string
  taskKey: string
  title: string
  instructions: string                      // Template already interpolated
  durationMinutes?: number
  sequenceInDay: number
  status: 'pending' | 'done' | 'skipped' | 'partial'
  completedAt?: string
  parentNote?: string
  mediaUrl?: string
  mediaType?: string
  difficultyRating?: number                 // 1-5
  createdAt: string
  updatedAt: string
}

// ── Streak / Compliance ──

export interface InterventionStreak {
  id: string
  assignmentId: string
  currentStreak: number
  longestStreak: number
  totalDone: number
  totalSkipped: number
  totalPartial: number
  compliancePct: number                     // Rolling 7-day
  lastCompletedDate?: string
  updatedAt: string
}

// ── Escalation (Flag to doctor) ──

export type EscalationType =
  | 'compliance_drop'
  | 'parent_concern'
  | 'boundary_reached'
  | 'adverse_pattern'

export type EscalationSeverity = 'info' | 'warning' | 'urgent'

export interface InterventionEscalation {
  id: string
  assignmentId: string
  childId: string
  doctorId: string
  escalationType: EscalationType
  severity: EscalationSeverity
  title: string
  detail?: string
  source: 'system' | 'parent' | 'ai'
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed'
  resolvedAt?: string
  doctorResponse?: string
  createdAt: string
}

// ── Chat Session ──

export interface InterventionChatSession {
  id: string
  assignmentId: string
  parentId: string
  childId: string
  messages: ChatMessage[]
  boundaryHits: number
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  boundaryHit?: boolean
}

// ── Display Helpers ──

export const CATEGORY_EMOJI: Record<InterventionCategory, string> = {
  vision: '👁️',
  hearing: '👂',
  ent: '🦻',
  dental: '🦷',
  developmental: '🧩',
  nutrition: '🥄',
  skin: '🧴',
  allergy: '🤧',
  respiratory: '🫁',
  physio: '🏋️',
  musculoskeletal: '🦴',
  cardiac: '❤️',
  behavioral: '🧠',
  immunological: '🛡️',
  growth: '📏',
  endocrine: '⚡',
}

export const SUBSPECIALTY_DISPLAY: Record<SubspecialtyId, string> = {
  vision_ai: 'Vision Coach',
  hearing_ai: 'Hearing Coach',
  dental_ai: 'Dental Coach',
  neuro_dev_ai: 'Development Coach',
  nutrition_ai: 'Nutrition Coach',
  skin_ai: 'Skin Care Coach',
  respiratory_ai: 'Breathing Coach',
  posture_ai: 'Movement Coach',
  cardio_ai: 'Heart Health Coach',
  behavior_ai: 'Behavior Coach',
  immune_ai: 'Immunity Coach',
  growth_ai: 'Growth Coach',
}
