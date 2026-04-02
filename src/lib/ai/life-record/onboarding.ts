/**
 * SKIDS Life Record — Conversational Onboarding
 *
 * When a child joins SKIDS at any age, we need their life record from
 * birth to today. Instead of a 50-field form, the AI walks the parent
 * through a warm conversation — period by period — asking human questions
 * and extracting structured data into the life record tables.
 *
 * The conversation is adaptive:
 *   - If parent says "born at 32 weeks, NICU" → preterm follow-ups fire
 *   - If parent says "normal delivery, all fine" → moves on
 *   - Each answer shapes the next question
 *   - AI extracts structured data from natural language
 *
 * Architecture:
 *   1. Onboarding phases — ordered by clinical priority
 *   2. Phase questions — the human questions for each phase
 *   3. AI extraction prompt — turns parent's words into structured records
 *   4. State machine — tracks what's been asked, what's been filled
 */

import type { BodySystem } from './types'

// ============================================
// ONBOARDING PHASES
// ============================================

export interface OnboardingPhase {
  id: string
  /** Display name for progress indicator */
  name: string
  /** Warm intro line the AI says before asking */
  intro: string
  /** The core questions for this phase */
  questions: OnboardingQuestion[]
  /** Age range: only ask if child was this age at some point (all phases for ≥0) */
  minAgeMonths: number
  /** Only ask if child is currently older than this */
  currentAgeMin: number
  /** Priority order — lower = asked first */
  order: number
  /** Which DB tables this phase populates */
  populatesTables: string[]
}

export interface OnboardingQuestion {
  id: string
  /** The warm, human question */
  question: string
  /** Follow-up if answer suggests something notable */
  followUps?: ConditionalFollowUp[]
  /** What structured data this extracts */
  extractsTo: ExtractionTarget[]
  /** Is this question required or can be skipped? */
  required: boolean
  /** Domain this question probes */
  domain: BodySystem | 'birth' | 'family' | 'general'
}

export interface ConditionalFollowUp {
  /** Keywords in parent's answer that trigger this follow-up */
  triggerKeywords: string[]
  /** The follow-up question */
  question: string
  /** What additional data this extracts */
  extractsTo: ExtractionTarget[]
}

export interface ExtractionTarget {
  table: string
  field: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'json'
  description: string
}

// ============================================
// ONBOARDING STATE
// ============================================

export interface OnboardingState {
  childId: string
  childName: string
  childAgeMonths: number
  /** Current phase index */
  currentPhase: number
  /** Current question within phase */
  currentQuestion: number
  /** Follow-up queue (from conditional follow-ups) */
  pendingFollowUps: string[]
  /** Phases completed */
  completedPhases: string[]
  /** Questions answered (id → raw answer) */
  answersRaw: Record<string, string>
  /** Extracted structured data ready to save */
  extractedData: Record<string, any>
  /** Conversation messages for AI context */
  conversationHistory: Array<{ role: 'assistant' | 'user'; content: string }>
  /** Overall completion percentage */
  completionPercent: number
  /** Started at */
  startedAt: string
  /** Last interaction */
  lastInteractionAt: string
}

// ============================================
// THE PHASES — Birth to Present
// ============================================

export const ONBOARDING_PHASES: OnboardingPhase[] = [

  // ─── Phase 1: Birth Story ───
  {
    id: 'birth',
    name: 'Birth Story',
    intro: "Let's start with when {name} was born. This helps us understand the foundation of their health journey.",
    order: 1,
    minAgeMonths: 0,
    currentAgeMin: 0,
    populatesTables: ['birth_history', 'children'],
    questions: [
      {
        id: 'birth_story',
        question: "Tell me about when {name} was born — was it a normal delivery? Were there any complications?",
        required: true,
        domain: 'birth',
        extractsTo: [
          { table: 'birth_history', field: 'delivery_mode', type: 'text', description: 'normal, cesarean, or assisted' },
          { table: 'birth_history', field: 'complications_json', type: 'json', description: 'any birth complications mentioned' },
        ],
        followUps: [
          {
            triggerKeywords: ['cesarean', 'c-section', 'c section', 'csec', 'lscs', 'emergency'],
            question: "Was the cesarean planned or was it an emergency? Do you remember why it was needed?",
            extractsTo: [
              { table: 'birth_history', field: 'complications_json', type: 'json', description: 'cesarean reason' },
            ],
          },
          {
            triggerKeywords: ['complication', 'difficult', 'problem', 'emergency', 'icu', 'nicu', 'ventilator', 'oxygen'],
            question: "I'm sorry to hear that was difficult. Was {name} kept in the NICU or special care? If so, for how long?",
            extractsTo: [
              { table: 'birth_history', field: 'nicu_stay', type: 'boolean', description: 'whether NICU stay happened' },
              { table: 'birth_history', field: 'nicu_days', type: 'number', description: 'days in NICU' },
            ],
          },
        ],
      },
      {
        id: 'birth_term',
        question: "Was {name} born on time, early, or late? Do you remember how many weeks?",
        required: true,
        domain: 'birth',
        extractsTo: [
          { table: 'birth_history', field: 'gestational_weeks', type: 'number', description: 'gestational weeks at birth' },
        ],
        followUps: [
          {
            triggerKeywords: ['early', 'premature', 'preterm', 'prem', 'weeks early', '7 month', '8 month', 'before time'],
            question: "Being born early is important for us to know. Do you remember the birth weight? And was there a NICU stay?",
            extractsTo: [
              { table: 'birth_history', field: 'birth_weight_grams', type: 'number', description: 'birth weight in grams or kg' },
              { table: 'birth_history', field: 'nicu_stay', type: 'boolean', description: 'NICU stay' },
              { table: 'birth_history', field: 'nicu_days', type: 'number', description: 'NICU duration' },
            ],
          },
        ],
      },
      {
        id: 'birth_weight',
        question: "Do you remember {name}'s birth weight?",
        required: false,
        domain: 'birth',
        extractsTo: [
          { table: 'birth_history', field: 'birth_weight_grams', type: 'number', description: 'birth weight' },
        ],
      },
    ],
  },

  // ─── Phase 2: Family Health Background ───
  {
    id: 'family',
    name: 'Family Health',
    intro: "Now a quick question about family health — this helps us know what to watch for.",
    order: 2,
    minAgeMonths: 0,
    currentAgeMin: 0,
    populatesTables: ['family_history'],
    questions: [
      {
        id: 'family_conditions',
        question: "Does anyone in your family have conditions like asthma, diabetes, thyroid problems, allergies, autism, or any hereditary conditions? Even grandparents, aunts, uncles count.",
        required: false,
        domain: 'family',
        extractsTo: [
          { table: 'family_history', field: 'condition', type: 'text', description: 'each family condition' },
          { table: 'family_history', field: 'relation', type: 'text', description: 'who has it' },
        ],
      },
      {
        id: 'family_vision_hearing',
        question: "Any history of vision problems or hearing issues in the family? Glasses at a young age, squinting, or hearing aids?",
        required: false,
        domain: 'family',
        extractsTo: [
          { table: 'family_history', field: 'condition', type: 'text', description: 'vision/hearing conditions' },
          { table: 'family_history', field: 'relation', type: 'text', description: 'who' },
        ],
      },
    ],
  },

  // ─── Phase 3: Early Feeding & Nutrition ───
  {
    id: 'feeding',
    name: 'Feeding & Nutrition',
    intro: "Let's talk about how {name} has been eating — from early days to now.",
    order: 3,
    minAgeMonths: 0,
    currentAgeMin: 0,
    populatesTables: ['diet_records'],
    questions: [
      {
        id: 'early_feeding',
        question: "Was {name} breastfed, formula-fed, or both? For how long?",
        required: true,
        domain: 'gi_nutrition',
        extractsTo: [
          { table: 'diet_records', field: 'breastfed', type: 'boolean', description: 'was breastfed' },
          { table: 'diet_records', field: 'formula_fed', type: 'boolean', description: 'was formula fed' },
        ],
      },
      {
        id: 'solids_weaning',
        question: "When did {name} start eating solid foods? How did that go?",
        required: false,
        domain: 'gi_nutrition',
        extractsTo: [
          { table: 'diet_records', field: 'solids_started', type: 'boolean', description: 'solids started' },
        ],
        followUps: [
          {
            triggerKeywords: ['picky', 'fussy', 'refuse', 'won\'t eat', 'doesn\'t eat', 'very selective', 'only eats'],
            question: "Picky eating is common! Does {name} eat from most food groups — grains, dal/protein, vegetables, fruits, dairy? Or is it very limited?",
            extractsTo: [
              { table: 'diet_records', field: 'food_diversity', type: 'number', description: 'food groups count 0-7' },
            ],
          },
        ],
      },
      {
        id: 'supplements',
        question: "Is {name} taking any vitamins or iron supplements? Or has the doctor prescribed any?",
        required: false,
        domain: 'gi_nutrition',
        extractsTo: [
          { table: 'diet_records', field: 'iron_supplement', type: 'boolean', description: 'iron supplementation' },
          { table: 'diet_records', field: 'vitamin_d', type: 'boolean', description: 'vitamin D supplementation' },
        ],
      },
    ],
  },

  // ─── Phase 4: Vaccinations ───
  {
    id: 'vaccination',
    name: 'Vaccinations',
    intro: "Quick one about vaccinations — we don't need every detail, just the big picture.",
    order: 4,
    minAgeMonths: 0,
    currentAgeMin: 0,
    populatesTables: ['vaccination_records'],
    questions: [
      {
        id: 'vaccination_status',
        question: "Are {name}'s vaccinations up to date? Or are any pending or overdue?",
        required: true,
        domain: 'immunological',
        extractsTo: [
          { table: 'vaccination_records', field: 'vaccine_name', type: 'text', description: 'vaccination status' },
        ],
        followUps: [
          {
            triggerKeywords: ['pending', 'overdue', 'missed', 'behind', 'skipped', 'not done', 'incomplete'],
            question: "No worries — do you know which ones are pending? If you have the vaccination card handy, you can share a photo later and we'll fill it in.",
            extractsTo: [],
          },
        ],
      },
    ],
  },

  // ─── Phase 5: Growth & Development Milestones ───
  {
    id: 'milestones',
    name: 'Growth & Milestones',
    intro: "Now the fun part — let's talk about how {name} has been growing and developing!",
    order: 5,
    minAgeMonths: 0,
    currentAgeMin: 0,
    populatesTables: ['milestones', 'growth_records'],
    questions: [
      {
        id: 'motor_milestones',
        question: "Thinking back — when did {name} first hold their head up, sit, crawl, and walk? Roughly is fine, you don't need exact dates.",
        required: true,
        domain: 'motor',
        extractsTo: [
          { table: 'milestones', field: 'milestone_key', type: 'text', description: 'motor milestones achieved' },
          { table: 'milestones', field: 'observed_at', type: 'text', description: 'approximate age achieved' },
        ],
        followUps: [
          {
            triggerKeywords: ['late', 'delayed', 'slow', 'still not', 'hasn\'t', 'didn\'t', 'never', 'can\'t'],
            question: "That's helpful to know. Was there any therapy or doctor visits for this? What did the doctor say?",
            extractsTo: [
              { table: 'active_conditions', field: 'condition_name', type: 'text', description: 'any diagnosed motor condition' },
            ],
          },
        ],
      },
      {
        id: 'speech_milestones',
        question: "How about talking? When did {name} say first words, and how is their speech now?",
        required: true,
        domain: 'language',
        extractsTo: [
          { table: 'milestones', field: 'milestone_key', type: 'text', description: 'language milestones' },
          { table: 'milestones', field: 'status', type: 'text', description: 'achieved, delayed, or not_started' },
        ],
        followUps: [
          {
            triggerKeywords: ['not talking', 'few words', 'delayed', 'speech therapy', 'can\'t understand', 'unclear', 'stammering', 'stutter'],
            question: "Has {name} seen a speech therapist or had a hearing test? Sometimes speech delays connect to hearing.",
            extractsTo: [
              { table: 'screening_results', field: 'screening_type', type: 'text', description: 'hearing/speech screening' },
              { table: 'screening_results', field: 'result', type: 'text', description: 'screening outcome' },
            ],
          },
        ],
      },
      {
        id: 'social_behavioral',
        question: "How does {name} interact with other kids and family members? Are they social, shy, or somewhere in between?",
        required: false,
        domain: 'behavioral',
        extractsTo: [
          { table: 'milestones', field: 'milestone_key', type: 'text', description: 'social milestones' },
        ],
      },
      {
        id: 'growth_concerns',
        question: "Any concerns about {name}'s height or weight? Too thin, too heavy, or growing well?",
        required: false,
        domain: 'growth',
        extractsTo: [
          { table: 'growth_records', field: 'height_cm', type: 'number', description: 'recent height if known' },
          { table: 'growth_records', field: 'weight_kg', type: 'number', description: 'recent weight if known' },
        ],
      },
    ],
  },

  // ─── Phase 6: Health History ───
  {
    id: 'health_history',
    name: 'Health History',
    intro: "Almost done! A few questions about {name}'s health history.",
    order: 6,
    minAgeMonths: 0,
    currentAgeMin: 0,
    populatesTables: ['active_conditions', 'medications', 'screening_results'],
    questions: [
      {
        id: 'conditions',
        question: "Does {name} have any known health conditions — like asthma, eczema, allergies, or anything the doctor is monitoring?",
        required: true,
        domain: 'general',
        extractsTo: [
          { table: 'active_conditions', field: 'condition_name', type: 'text', description: 'active conditions' },
          { table: 'children', field: 'allergies_json', type: 'json', description: 'known allergies' },
        ],
        followUps: [
          {
            triggerKeywords: ['asthma', 'wheez', 'inhaler', 'nebul'],
            question: "Is {name} on any regular inhalers or medications for this?",
            extractsTo: [
              { table: 'medications', field: 'medication_name', type: 'text', description: 'asthma medications' },
            ],
          },
          {
            triggerKeywords: ['allergy', 'allergic', 'rash', 'hives', 'reaction'],
            question: "What are they allergic to? Food, medication, or environmental?",
            extractsTo: [
              { table: 'children', field: 'allergies_json', type: 'json', description: 'specific allergies' },
            ],
          },
        ],
      },
      {
        id: 'medications',
        question: "Is {name} currently taking any regular medicines or supplements?",
        required: false,
        domain: 'general',
        extractsTo: [
          { table: 'medications', field: 'medication_name', type: 'text', description: 'current medications' },
        ],
      },
      {
        id: 'hospitalizations',
        question: "Has {name} ever been hospitalized or had any surgery? Even brief stays count.",
        required: false,
        domain: 'general',
        extractsTo: [
          { table: 'health_records', field: 'summary', type: 'text', description: 'hospitalization history' },
        ],
      },
    ],
  },

  // ─── Phase 7: Vision & Hearing (if age ≥ 2) ───
  {
    id: 'sensory',
    name: 'Vision & Hearing',
    intro: "A couple of quick checks about {name}'s eyes and ears.",
    order: 7,
    minAgeMonths: 0,
    currentAgeMin: 18,
    populatesTables: ['screening_results'],
    questions: [
      {
        id: 'vision_check',
        question: "Have {name}'s eyes ever been checked? Any squinting, sitting close to TV, or complaints about seeing?",
        required: false,
        domain: 'vision',
        extractsTo: [
          { table: 'screening_results', field: 'screening_type', type: 'text', description: 'vision screening' },
          { table: 'screening_results', field: 'result', type: 'text', description: 'vision result' },
        ],
        followUps: [
          {
            triggerKeywords: ['glasses', 'spectacles', 'squint', 'lazy eye', 'patch', 'eye doctor'],
            question: "When was the last eye checkup? And are they wearing glasses currently?",
            extractsTo: [
              { table: 'active_conditions', field: 'condition_name', type: 'text', description: 'vision condition' },
            ],
          },
        ],
      },
      {
        id: 'hearing_check',
        question: "How is {name}'s hearing? Do they respond well to sounds and conversations?",
        required: false,
        domain: 'hearing',
        extractsTo: [
          { table: 'screening_results', field: 'screening_type', type: 'text', description: 'hearing status' },
          { table: 'screening_results', field: 'result', type: 'text', description: 'hearing result' },
        ],
      },
    ],
  },

  // ─── Phase 8: School & Behavior (if age ≥ 4) ───
  {
    id: 'school',
    name: 'School & Behavior',
    intro: "Last section — about {name}'s school and daily life.",
    order: 8,
    minAgeMonths: 0,
    currentAgeMin: 36,
    populatesTables: ['parent_observations'],
    questions: [
      {
        id: 'school_performance',
        question: "How is {name} doing in school or preschool? Learning well, enjoying it, any struggles?",
        required: false,
        domain: 'cognitive',
        extractsTo: [
          { table: 'parent_observations', field: 'observation_text', type: 'text', description: 'school performance observation' },
        ],
        followUps: [
          {
            triggerKeywords: ['struggling', 'difficulty', 'can\'t read', 'can\'t write', 'slow learner', 'behind', 'failing', 'special needs'],
            question: "Has the school raised any concerns? Or has {name} been assessed for learning support?",
            extractsTo: [
              { table: 'screening_results', field: 'screening_type', type: 'text', description: 'educational assessment' },
            ],
          },
        ],
      },
      {
        id: 'behavior_concerns',
        question: "Any behavioral concerns — attention, hyperactivity, anxiety, sleep issues, or anything that worries you?",
        required: false,
        domain: 'behavioral',
        extractsTo: [
          { table: 'parent_observations', field: 'observation_text', type: 'text', description: 'behavioral observation' },
        ],
      },
      {
        id: 'sleep_screen',
        question: "How does {name} sleep? Any snoring, bedwetting, or trouble falling asleep?",
        required: false,
        domain: 'respiratory',
        extractsTo: [
          { table: 'parent_observations', field: 'observation_text', type: 'text', description: 'sleep observation' },
        ],
      },
    ],
  },

  // ─── Phase 9: Adolescent (if age ≥ 10) ───
  {
    id: 'adolescent',
    name: 'Teen Health',
    intro: "A few questions relevant to {name}'s current stage of growing up.",
    order: 9,
    minAgeMonths: 0,
    currentAgeMin: 120,
    populatesTables: ['parent_observations'],
    questions: [
      {
        id: 'puberty_status',
        question: "How is puberty going for {name}? Any concerns about the timing or pace of changes?",
        required: false,
        domain: 'endocrine',
        extractsTo: [
          { table: 'parent_observations', field: 'observation_text', type: 'text', description: 'puberty observation' },
        ],
      },
      {
        id: 'mood_mental',
        question: "How is {name}'s mood and mental wellbeing? Any changes in behavior, sleep, or motivation?",
        required: false,
        domain: 'emotional',
        extractsTo: [
          { table: 'parent_observations', field: 'observation_text', type: 'text', description: 'mood/mental health observation' },
        ],
      },
    ],
  },
]

// ============================================
// AI EXTRACTION PROMPT
// ============================================

/**
 * Build the system prompt for the onboarding AI.
 * The AI has two jobs:
 *   1. Be warm and conversational — like a family pediatrician doing intake
 *   2. Extract structured data from parent's natural language answers
 */
export function buildOnboardingSystemPrompt(
  childName: string,
  childAgeMonths: number,
  currentPhase: OnboardingPhase,
  currentQuestion: OnboardingQuestion,
  conversationSoFar: Array<{ role: string; content: string }>,
  extractedSoFar: Record<string, any>
): string {
  const ageStr = formatAgeFriendly(childAgeMonths)

  return `You are Dr. SKIDS, a warm, friendly pediatric health companion helping a parent set up their child's health life record. You are currently onboarding ${childName}, who is ${ageStr} old.

CURRENT PHASE: ${currentPhase.name}
CURRENT QUESTION: ${currentQuestion.question.replace(/{name}/g, childName)}

YOUR TWO JOBS:

JOB 1 — CONVERSATION (what the parent sees):
- Be warm, encouraging, and natural — like a caring family doctor doing intake
- Acknowledge what the parent said before asking the next thing
- Use Indian cultural context (dal-rice, joint families, school terms)
- Keep responses to 2-3 sentences max — parents are busy
- If the parent's answer is vague, gently ask for a bit more detail
- Never judge, never alarm — just warmly collect information
- Use ${childName}'s name, not "your child"

JOB 2 — EXTRACTION (structured data in JSON):
After your conversational response, output a JSON block with extracted data.
Format: <extracted>{"field": "value", ...}</extracted>

EXTRACTION RULES:
- birth_weight: Convert to grams. "2.5 kg" → 2500. "5 pounds" → 2268.
- gestational_weeks: "full term" → 40. "8 months" → 35. "7 months" → 30. "on time" → 40.
- delivery_mode: "normal" → "normal". "C-section/LSCS/cesarean" → "cesarean". "vacuum/forceps" → "assisted".
- boolean fields: Look for yes/no signals. "yes" / "was breastfed" / "for 6 months" → true.
- milestones: Extract what was achieved and approximate age. "walked at 14 months" → {"milestone": "walking", "age_months": 14, "status": "achieved"}.
- family_history: Extract condition + relation. "grandmother has diabetes" → {"condition": "diabetes", "relation": "grandmother"}.
- If you can't extract a value, omit it — don't guess.

WHAT HAS BEEN EXTRACTED SO FAR:
${JSON.stringify(extractedSoFar, null, 2)}

IMPORTANT:
- Your response MUST end with <extracted>{...}</extracted> JSON block
- If the parent's answer doesn't contain extractable data, use <extracted>{}</extracted>
- If the parent asks you something or goes off-topic, answer warmly but gently steer back
- If the parent says "I don't know" or "I don't remember", that's OK — acknowledge it and move on
- NEVER diagnose. NEVER alarm. You are collecting history, not giving medical opinions.`
}

/**
 * Build the follow-up detection prompt.
 * Determines if the parent's answer triggers any conditional follow-ups.
 */
export function shouldTriggerFollowUp(
  parentAnswer: string,
  followUps: ConditionalFollowUp[]
): ConditionalFollowUp | null {
  const lower = parentAnswer.toLowerCase()

  for (const fu of followUps) {
    const triggered = fu.triggerKeywords.some((kw) => lower.includes(kw.toLowerCase()))
    if (triggered) return fu
  }

  return null
}

// ============================================
// PHASE SELECTION
// ============================================

/**
 * Get the onboarding phases applicable for a child's current age.
 * Filters out phases that aren't relevant (e.g., no adolescent questions for a 2-year-old).
 */
export function getPhasesForChild(currentAgeMonths: number): OnboardingPhase[] {
  return ONBOARDING_PHASES
    .filter((phase) => currentAgeMonths >= phase.currentAgeMin)
    .sort((a, b) => a.order - b.order)
}

/**
 * Calculate total questions for a child's onboarding.
 */
export function getTotalQuestions(currentAgeMonths: number): number {
  return getPhasesForChild(currentAgeMonths)
    .reduce((sum, phase) => sum + phase.questions.length, 0)
}

/**
 * Create initial onboarding state for a child.
 */
export function createOnboardingState(
  childId: string,
  childName: string,
  childAgeMonths: number
): OnboardingState {
  return {
    childId,
    childName,
    childAgeMonths,
    currentPhase: 0,
    currentQuestion: 0,
    pendingFollowUps: [],
    completedPhases: [],
    answersRaw: {},
    extractedData: {},
    conversationHistory: [],
    completionPercent: 0,
    startedAt: new Date().toISOString(),
    lastInteractionAt: new Date().toISOString(),
  }
}

/**
 * Get the current question to ask, considering state.
 * Returns null if onboarding is complete.
 */
export function getCurrentQuestion(
  state: OnboardingState
): { phase: OnboardingPhase; question: OnboardingQuestion } | null {
  const phases = getPhasesForChild(state.childAgeMonths)

  if (state.currentPhase >= phases.length) return null

  const phase = phases[state.currentPhase]
  if (state.currentQuestion >= phase.questions.length) {
    // Move to next phase
    const nextPhaseIdx = state.currentPhase + 1
    if (nextPhaseIdx >= phases.length) return null
    return {
      phase: phases[nextPhaseIdx],
      question: phases[nextPhaseIdx].questions[0],
    }
  }

  return {
    phase,
    question: phase.questions[state.currentQuestion],
  }
}

/**
 * Advance the onboarding state after an answer.
 */
export function advanceState(
  state: OnboardingState,
  questionId: string,
  rawAnswer: string,
  extractedData: Record<string, any>
): OnboardingState {
  const phases = getPhasesForChild(state.childAgeMonths)
  const totalQuestions = getTotalQuestions(state.childAgeMonths)

  const newState = { ...state }
  newState.answersRaw = { ...state.answersRaw, [questionId]: rawAnswer }
  newState.extractedData = { ...state.extractedData, ...extractedData }
  newState.lastInteractionAt = new Date().toISOString()

  // Move to next question
  const currentPhase = phases[state.currentPhase]
  if (state.currentQuestion + 1 < currentPhase.questions.length) {
    newState.currentQuestion = state.currentQuestion + 1
  } else {
    // Phase complete
    newState.completedPhases = [...state.completedPhases, currentPhase.id]
    newState.currentPhase = state.currentPhase + 1
    newState.currentQuestion = 0
  }

  // Update completion
  const answered = Object.keys(newState.answersRaw).length
  newState.completionPercent = Math.round((answered / totalQuestions) * 100)

  return newState
}

/**
 * Check if a specific phase can be skipped (all questions optional + parent said "skip").
 */
export function canSkipPhase(phase: OnboardingPhase): boolean {
  return phase.questions.every((q) => !q.required)
}

// ============================================
// DATA EXTRACTION PARSER
// ============================================

/**
 * Parse the AI's response to extract the structured data JSON.
 * The AI is instructed to wrap extracted data in <extracted>{...}</extracted> tags.
 */
export function parseExtractedData(aiResponse: string): {
  conversationalResponse: string
  extractedData: Record<string, any>
} {
  const extractedMatch = aiResponse.match(/<extracted>([\s\S]*?)<\/extracted>/)

  let extractedData: Record<string, any> = {}
  let conversationalResponse = aiResponse

  if (extractedMatch) {
    // Remove the extraction block from the conversational part
    conversationalResponse = aiResponse.replace(/<extracted>[\s\S]*?<\/extracted>/, '').trim()

    try {
      extractedData = JSON.parse(extractedMatch[1].trim())
    } catch {
      // If JSON parsing fails, try to be lenient
      console.error('[Onboarding] Failed to parse extracted JSON:', extractedMatch[1])
    }
  }

  return { conversationalResponse, extractedData }
}

// ============================================
// LIFE RECORD PERSISTENCE
// ============================================

/**
 * Save extracted onboarding data to the life record tables.
 * Called after each answer or at the end of a phase.
 */
export async function persistExtractedData(
  db: any,
  childId: string,
  extracted: Record<string, any>
): Promise<void> {
  // Birth history
  if (extracted.delivery_mode || extracted.gestational_weeks || extracted.birth_weight_grams) {
    const existing = await db.prepare('SELECT id FROM birth_history WHERE child_id = ?').bind(childId).first()

    if (existing) {
      const updates: string[] = []
      const values: any[] = []

      if (extracted.delivery_mode) { updates.push('delivery_mode = ?'); values.push(extracted.delivery_mode) }
      if (extracted.gestational_weeks) { updates.push('gestational_weeks = ?'); values.push(extracted.gestational_weeks) }
      if (extracted.birth_weight_grams) { updates.push('birth_weight_grams = ?'); values.push(extracted.birth_weight_grams) }
      if (extracted.nicu_stay !== undefined) { updates.push('nicu_stay = ?'); values.push(extracted.nicu_stay ? 1 : 0) }
      if (extracted.nicu_days) { updates.push('nicu_days = ?'); values.push(extracted.nicu_days) }
      if (extracted.complications) { updates.push('complications_json = ?'); values.push(JSON.stringify(extracted.complications)) }

      if (updates.length > 0) {
        updates.push("updated_at = datetime('now')")
        values.push(childId)
        await db.prepare(`UPDATE birth_history SET ${updates.join(', ')} WHERE child_id = ?`).bind(...values).run()
      }
    } else {
      await db.prepare(
        `INSERT INTO birth_history (id, child_id, gestational_weeks, delivery_mode, birth_weight_grams, nicu_stay, nicu_days, complications_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(),
        childId,
        extracted.gestational_weeks || null,
        extracted.delivery_mode || null,
        extracted.birth_weight_grams || null,
        extracted.nicu_stay ? 1 : 0,
        extracted.nicu_days || null,
        extracted.complications ? JSON.stringify(extracted.complications) : null
      ).run()
    }
  }

  // Family history
  if (extracted.family_history && Array.isArray(extracted.family_history)) {
    for (const fh of extracted.family_history) {
      if (fh.condition) {
        await db.prepare(
          'INSERT INTO family_history (id, child_id, condition, relation) VALUES (?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), childId, fh.condition, fh.relation || null).run()
      }
    }
  }

  // Diet
  if (extracted.breastfed !== undefined || extracted.formula_fed !== undefined) {
    await db.prepare(
      `INSERT INTO diet_records (id, child_id, date, breastfed, formula_fed, solids_started, food_diversity, iron_supplement, vitamin_d)
       VALUES (?, ?, date('now'), ?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      childId,
      extracted.breastfed ? 1 : 0,
      extracted.formula_fed ? 1 : 0,
      extracted.solids_started ? 1 : 0,
      extracted.food_diversity || null,
      extracted.iron_supplement ? 1 : 0,
      extracted.vitamin_d ? 1 : 0
    ).run()
  }

  // Milestones
  if (extracted.milestones && Array.isArray(extracted.milestones)) {
    for (const ms of extracted.milestones) {
      if (ms.milestone) {
        await db.prepare(
          `INSERT INTO milestones (id, child_id, category, milestone_key, title, status, observed_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(
          crypto.randomUUID(),
          childId,
          ms.category || 'motor',
          ms.milestone,
          ms.milestone,
          ms.status || 'achieved',
          ms.age_months ? `${ms.age_months} months` : null
        ).run()
      }
    }
  }

  // Active conditions
  if (extracted.active_conditions && Array.isArray(extracted.active_conditions)) {
    for (const cond of extracted.active_conditions) {
      const condName = typeof cond === 'string' ? cond : cond.condition_name
      if (condName) {
        await db.prepare(
          "INSERT INTO active_conditions (id, child_id, condition_name, status) VALUES (?, ?, ?, 'active')"
        ).bind(crypto.randomUUID(), childId, condName).run()
      }
    }
  }

  // Medications
  if (extracted.medications && Array.isArray(extracted.medications)) {
    for (const med of extracted.medications) {
      const medName = typeof med === 'string' ? med : med.medication_name
      if (medName) {
        await db.prepare(
          "INSERT INTO medications (id, child_id, medication_name, status) VALUES (?, ?, ?, 'active')"
        ).bind(crypto.randomUUID(), childId, medName).run()
      }
    }
  }

  // Screening results
  if (extracted.screening_results && Array.isArray(extracted.screening_results)) {
    for (const sr of extracted.screening_results) {
      if (sr.screening_type) {
        await db.prepare(
          "INSERT INTO screening_results (id, child_id, screening_type, date, result) VALUES (?, ?, ?, date('now'), ?)"
        ).bind(crypto.randomUUID(), childId, sr.screening_type, sr.result || 'reported').run()
      }
    }
  }

  // Allergies (update children table)
  if (extracted.allergies && Array.isArray(extracted.allergies) && extracted.allergies.length > 0) {
    await db.prepare(
      'UPDATE children SET allergies_json = ? WHERE id = ?'
    ).bind(JSON.stringify(extracted.allergies), childId).run()
  }
}

// ============================================
// UTILITIES
// ============================================

function formatAgeFriendly(months: number): string {
  if (months < 1) return 'a newborn'
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'}`
  return `${years} year${years === 1 ? '' : 's'} and ${rem} month${rem === 1 ? '' : 's'}`
}
