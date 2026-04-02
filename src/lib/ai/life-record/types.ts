/**
 * SKIDS Probabilistic Life Record — Type Definitions
 *
 * The life record is not a passive log. It's a living probability engine.
 * When a parent types an observation, the system projects probable conditions
 * based on: age + observation + complete life record (Bayesian update).
 *
 * SKIDS does NOT diagnose. It unfolds possibilities into probabilities.
 * The doctor confirms into diagnoses. Nothing is missed.
 */

// ============================================
// KNOWLEDGE GRAPH TYPES
// ============================================

export interface ConditionObservationEntry {
  /** Unique key for this mapping */
  id: string
  /** Observation patterns — keywords/phrases that trigger this entry */
  observationPatterns: string[]
  /** Body system domain */
  domain: BodySystem
  /** Minimum age in months for this mapping to apply */
  ageMinMonths: number
  /** Maximum age in months for this mapping to apply */
  ageMaxMonths: number
  /** The medical condition name */
  conditionName: string
  /** ICD-10 code if applicable */
  icd10?: string
  /** Category of condition */
  conditionCategory: ConditionCategory
  /** Base probability from epidemiological literature (0.0 - 1.0) */
  baseProbability: number
  /** Rare but dangerous — always surface regardless of probability */
  mustNotMiss: boolean
  /** Urgency level */
  urgency: Urgency
  /** Evidence-based citation */
  citation?: string
  /** Plain-language explanation for parents */
  parentExplanation: string
  /** What the parent can observe/check next */
  parentNextSteps: string[]
  /** What the doctor should examine */
  doctorExamPoints: string[]
  /** What should be ruled out first (physiological-first approach) */
  ruleOutBefore?: string[]
  /** Life record modifiers that adjust this probability */
  modifiers: ConditionModifier[]
}

export interface ConditionModifier {
  /** What type of life record data modifies this probability */
  source: ModifierSource
  /** Specific key to look for */
  key: string
  /** Human-readable description of what we're checking */
  description: string
  /** Multiplier: >1 increases probability, <1 decreases it */
  multiplier: number
  /** Explanation of why this modifier applies */
  explanation: string
}

export type BodySystem =
  | 'neurological'
  | 'vision'
  | 'hearing'
  | 'cardiac'
  | 'respiratory'
  | 'dental'
  | 'musculoskeletal'
  | 'skin'
  | 'gi_nutrition'
  | 'behavioral'
  | 'emotional'
  | 'language'
  | 'motor'
  | 'cognitive'
  | 'growth'
  | 'immunological'
  | 'endocrine'
  | 'urogenital'
  | 'general'

export type ConditionCategory =
  | 'normal_variant'
  | 'developmental'
  | 'infectious'
  | 'nutritional'
  | 'genetic'
  | 'neurological'
  | 'behavioral'
  | 'sensory'
  | 'metabolic'
  | 'structural'
  | 'allergic'
  | 'autoimmune'
  | 'neoplastic'
  | 'functional'
  | 'environmental'
  | 'psychosocial'

export type Urgency = 'routine' | 'soon' | 'urgent' | 'emergency'

export type ModifierSource =
  | 'birth_history'        // preterm, delivery mode, birth weight, NICU stay
  | 'growth_trend'         // percentile crossing, velocity change, HC trend
  | 'milestone_status'     // achieved, delayed, regressed
  | 'prior_observation'    // temporal patterns, frequency of similar observations
  | 'screening_result'     // vision/hearing/developmental screening outcomes
  | 'vaccination_status'   // up-to-date, overdue, contraindicated
  | 'family_history'       // hereditary conditions, consanguinity
  | 'active_condition'     // existing diagnoses that modify interpretation
  | 'medication'           // current medications
  | 'diet'                 // breastfed, formula, weaning status, food diversity
  | 'environment'          // urban/rural, pollution, socioeconomic factors
  | 'recent_illness'       // recent URI, fever, GI illness in the log

// ============================================
// LIFE RECORD CONTEXT (pulled from DB for a child)
// ============================================

export interface LifeRecordContext {
  child: {
    id: string
    name: string
    dob: string
    gender: 'male' | 'female' | 'other'
    ageMonths: number
    bloodGroup?: string
    allergies?: string[]
  }
  birthHistory: {
    gestationalWeeks?: number
    deliveryMode?: 'normal' | 'cesarean' | 'assisted'
    birthWeight?: number     // grams
    nicuStay?: boolean
    nicuDays?: number
    apgarScore?: number
    complications?: string[]
  }
  growth: {
    records: Array<{
      date: string
      heightCm?: number
      weightKg?: number
      headCircCm?: number
      bmi?: number
    }>
    /** Is weight/height/HC crossing percentile lines? */
    percentileCrossing?: 'stable' | 'upward' | 'downward'
    /** Latest Z-scores */
    latestZScores?: {
      weightForAge?: number
      heightForAge?: number
      bmiForAge?: number
      headCircForAge?: number
    }
  }
  milestones: {
    achieved: Array<{ key: string; category: string; observedAt?: string }>
    delayed: Array<{ key: string; category: string; expectedAgeMax: number }>
    notStarted: Array<{ key: string; category: string; expectedAgeMax: number }>
    /** Has any milestone regressed? */
    regressions: Array<{ key: string; category: string; previouslyAchievedAt?: string }>
  }
  recentObservations: Array<{
    text: string
    category?: string
    concernLevel: string
    date: string
  }>
  screeningResults: Array<{
    type: string
    date: string
    result: string
    findings?: string[]
  }>
  vaccinations: {
    completed: string[]
    overdue: string[]
  }
  familyHistory: string[]
  activeConditions: string[]
  currentMedications: string[]
  diet: {
    breastfed?: boolean
    formulaFed?: boolean
    solidsStarted?: boolean
    foodDiversity?: number    // 0-7 food groups in past week
    ironSupplement?: boolean
    vitaminD?: boolean
  }
  recentIllnesses: Array<{
    type: string
    date: string
  }>
}

// ============================================
// PROJECTION OUTPUT
// ============================================

export interface ObservationProjection {
  /** The condition being projected */
  conditionName: string
  /** ICD-10 code */
  icd10?: string
  /** Body system */
  domain: BodySystem
  /** Category */
  category: ConditionCategory
  /** Base probability from knowledge graph */
  baseProbability: number
  /** Adjusted probability after life record modifiers */
  adjustedProbability: number
  /** Which modifiers fired and how */
  modifiersApplied: Array<{
    source: ModifierSource
    key: string
    multiplier: number
    explanation: string
    direction: 'increased' | 'decreased'
  }>
  /** Life record evidence supporting this condition */
  evidenceFor: string[]
  /** Life record evidence against this condition */
  evidenceAgainst: string[]
  /** What parent can check/observe next */
  parentNextSteps: string[]
  /** What doctor should examine */
  doctorExamPoints: string[]
  /** Rule out these first */
  ruleOutBefore: string[]
  /** Urgency */
  urgency: Urgency
  /** Rare but dangerous */
  mustNotMiss: boolean
  /** Plain-language explanation */
  parentExplanation: string
  /** Citation */
  citation?: string
  /** Doctor's refinement status */
  doctorStatus?: 'projected' | 'confirmed' | 'ruled_out' | 'investigating'
  /** Doctor's notes on this projection */
  doctorNotes?: string
}

export interface ProjectionResult {
  /** The observation that triggered this */
  observationId: string
  observationText: string
  /** Child context summary */
  childAge: string
  childName: string
  /** All projected conditions, ranked by adjusted probability */
  projections: ObservationProjection[]
  /** Clarifying questions the system wants to ask the parent */
  clarifyingQuestions: string[]
  /** System confidence in the overall projection (0-1) */
  confidence: number
  /** Timestamp */
  computedAt: string
  /** Domains detected from the observation */
  domainsDetected: BodySystem[]
}

// ============================================
// DOCTOR REFINEMENT
// ============================================

export interface DoctorRefinement {
  projectionId: string
  conditionName: string
  action: 'confirm' | 'rule_out' | 'investigate' | 'adjust_probability'
  /** Doctor's clinical findings supporting this action */
  clinicalFindings?: string
  /** Manual probability override (0-1) */
  adjustedProbability?: number
  /** Additional notes */
  notes?: string
}
