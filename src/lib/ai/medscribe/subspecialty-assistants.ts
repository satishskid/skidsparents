// Client-side module

/**
 * SKIDS Subspecialty AI Assistants — Protocol-driven clinical decision support
 *
 * 12 assistants, each:
 *   - Has a clinical protocol (evidence-based guidelines)
 *   - Takes longitudinal record (parent PHR + screening) + current event as context
 *   - Returns structured clinical guidance with artifacts
 *   - Supports HITL: doctor confirms, overrides, or adjusts
 *
 * Prompt = child_context (long record) + current_event + protocol → structured answer
 */

import type { LLMConfig, LLMMessage } from './llm-gateway'
import { queryLLM } from './llm-gateway'

// ============================================
// TYPES
// ============================================

export interface SubspecialtyAssistant {
  id: string
  name: string
  icon: string
  specialty: string
  description: string
  /** Clinical protocol reference */
  protocol: string
  /** What triggers this assistant */
  triggers: string[]
  /** Color theme */
  color: string
  /** Related SKIDS screening modules */
  relatedModules: string[]
  /** System prompt template */
  buildPrompt: (context: ChildContext, currentEvent: string) => LLMMessage[]
  /** What artifacts this assistant can produce */
  artifactTypes: ArtifactType[]
}

export interface ChildContext {
  name: string
  age: string
  gender: string
  /** Parent-reported milestones summary */
  milestones?: string
  /** Growth data summary */
  growth?: string
  /** HABITS scores */
  habits?: string
  /** Vaccination status */
  vaccines?: string
  /** Parent observations/concerns */
  parentConcerns?: string
  /** Screening findings summary */
  screeningFindings?: string
  /** Previous consultation notes */
  previousConsults?: string
  /** Dr. SKIDS chat highlights */
  chatHighlights?: string
}

export type ArtifactType =
  | 'prescription'
  | 'referral_letter'
  | 'investigation_order'
  | 'parent_education'
  | 'follow_up_plan'
  | 'growth_interpretation'
  | 'milestone_checklist'
  | 'diet_plan'
  | 'exercise_protocol'
  | 'screening_protocol'
  | 'risk_score'
  | 'treatment_protocol'

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  /** Structured artifacts extracted from this message */
  artifacts?: Artifact[]
}

export interface Artifact {
  type: ArtifactType
  title: string
  data: Record<string, unknown>
  /** Rendered markdown/text for display */
  rendered: string
}

export interface AssistantResponse {
  text: string
  artifacts: Artifact[]
  provider: string
  model: string
  latencyMs: number
}

// ============================================
// CONTEXT BUILDER
// ============================================

function buildContextBlock(ctx: ChildContext): string {
  const parts: string[] = [
    `PATIENT: ${ctx.name}, ${ctx.age}, ${ctx.gender}`,
  ]

  if (ctx.milestones) parts.push(`MILESTONES: ${ctx.milestones}`)
  if (ctx.growth) parts.push(`GROWTH: ${ctx.growth}`)
  if (ctx.habits) parts.push(`HABITS SCORE: ${ctx.habits}`)
  if (ctx.vaccines) parts.push(`VACCINES: ${ctx.vaccines}`)
  if (ctx.parentConcerns) parts.push(`PARENT CONCERNS: ${ctx.parentConcerns}`)
  if (ctx.screeningFindings) parts.push(`SCREENING FINDINGS: ${ctx.screeningFindings}`)
  if (ctx.previousConsults) parts.push(`PREVIOUS CONSULTATIONS: ${ctx.previousConsults}`)
  if (ctx.chatHighlights) parts.push(`DR. SKIDS CHAT HIGHLIGHTS: ${ctx.chatHighlights}`)

  return parts.join('\n')
}

const ARTIFACT_INSTRUCTION = `

When your response includes actionable items, output them as tagged artifact blocks:

<artifact type="prescription" title="...">
drug: ..., dose: ..., route: ..., frequency: ..., duration: ..., instructions: ...
</artifact>

<artifact type="referral_letter" title="...">
to: ..., specialty: ..., urgency: ..., reason: ..., clinical_summary: ..., requested_evaluation: ...
</artifact>

<artifact type="investigation_order" title="...">
test: ..., urgency: ..., reason: ..., fasting: yes/no
</artifact>

<artifact type="parent_education" title="...">
key_points: ..., what_to_watch: ..., when_to_return: ...
</artifact>

<artifact type="follow_up_plan" title="...">
interval: ..., what_to_monitor: ..., red_flags: ...
</artifact>

<artifact type="treatment_protocol" title="...">
steps: ..., duration: ..., monitoring: ...
</artifact>

<artifact type="diet_plan" title="...">
goals: ..., include: ..., avoid: ..., sample_meals: ...
</artifact>

Include artifacts inline where relevant. Continue conversational text around them.`

// ============================================
// 12 SUBSPECIALTY ASSISTANTS
// ============================================

export const ASSISTANTS: SubspecialtyAssistant[] = [
  // 1. OPHTHALMOLOGY
  {
    id: 'vision_ai',
    name: 'VisionAI',
    icon: '👁️',
    specialty: 'Pediatric Ophthalmology',
    description: 'Visual acuity, strabismus, amblyopia, refractive errors, red reflex',
    protocol: 'AAP/AAPOS Vision Screening Guidelines, Amblyopia PPP 2023',
    triggers: ['squint', 'strabismus', 'vision', 'eye', 'amblyopia', 'refractive', 'glasses', 'red reflex', 'ptosis', 'nystagmus'],
    color: 'blue',
    relatedModules: ['eyes_external', 'vision'],
    artifactTypes: ['referral_letter', 'parent_education', 'follow_up_plan', 'screening_protocol'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are VisionAI, a pediatric ophthalmology assistant within the SKIDS Pediatrician Console. You help generalist pediatricians assess and manage childhood vision problems.

PROTOCOL: AAP/AAPOS Vision Screening Guidelines
- Age 1-3: Red reflex, fixation/follow, photo screening
- Age 3-5: Visual acuity (HOTV/LEA), stereoacuity, photo screening
- Age 6+: Snellen acuity, cover test, stereoacuity
- Amblyopia treatment window: CRITICAL before age 7, beneficial up to 13
- Referral criteria: VA ≤20/40 age 3-5, ≤20/30 age 6+, any strabismus, asymmetric reflex

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

DECISION FRAMEWORK:
1. Can this be managed by the generalist ped? → Provide protocol
2. Needs SKIDS ophthalmologist? → Generate referral with full context
3. Urgent? → Flag timeline (retinoblastoma signs, acute vision loss, orbital cellulitis)

Be conversational but clinically precise. Reference the child's longitudinal data when relevant. Generate artifacts for prescriptions, referrals, and parent education.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 2. ENT / AUDIOLOGY
  {
    id: 'hearing_ai',
    name: 'HearingAI',
    icon: '👂',
    specialty: 'Pediatric ENT & Audiology',
    description: 'Ear infections, hearing loss, tonsils, adenoids, OSA, speech-hearing link',
    protocol: 'AAP Otitis Media Guidelines 2023, AAO-HNS Tonsillectomy Guidelines',
    triggers: ['ear', 'hearing', 'tonsil', 'adenoid', 'snoring', 'sleep apnea', 'OSA', 'otitis', 'tube', 'speech delay', 'mouth breathing'],
    color: 'purple',
    relatedModules: ['ear', 'throat', 'hearing'],
    artifactTypes: ['prescription', 'referral_letter', 'investigation_order', 'parent_education', 'treatment_protocol'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are HearingAI, a pediatric ENT & audiology assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- Otitis Media: AAP 2023 — observation 48-72h if mild, amoxicillin 80-90mg/kg/day if moderate/severe
- Tonsillectomy: Paradise criteria (≥7 episodes/yr, ≥5/yr x2yr, ≥3/yr x3yr) OR Grade 3-4 with OSA
- Hearing: WHO grades — mild (26-40dB), moderate (41-55dB), severe (71-90dB)
- Speech-hearing link: Any hearing loss + speech delay = urgent audiology
- Adenoid: Mouth breathing + snoring + recurrent sinusitis → lateral neck X-ray → adenoidectomy if >75% obstruction

KEY SKIDS INSIGHT: Blog research shows mouth breathing and high-arched palate are often missed root causes of behavioral symptoms (poor sleep → inattention → "ADHD" misdiagnosis).

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

Cross-reference parent sleep observations with screening throat findings.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 3. DENTAL
  {
    id: 'dental_ai',
    name: 'DentalAI',
    icon: '🦷',
    specialty: 'Pediatric Dentistry',
    description: 'Caries, malocclusion, oral hygiene, fluoride, frenulum, habits',
    protocol: 'AAPD Guidelines, WHO DMFT Index, IAP Dental Guidelines',
    triggers: ['caries', 'cavity', 'tooth', 'dental', 'gum', 'malocclusion', 'bite', 'fluoride', 'tongue tie', 'frenulum', 'thumb sucking'],
    color: 'cyan',
    relatedModules: ['dental'],
    artifactTypes: ['referral_letter', 'parent_education', 'treatment_protocol', 'follow_up_plan'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are DentalAI, a pediatric dentistry assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- DMFT Index: Decayed + Missing + Filled teeth (primary: dmft, permanent: DMFT)
- Caries risk: High if dmft>0 before age 3, visible plaque, low SES, no fluoride
- Fluoride: Smear (0-3yr), pea-size (3-6yr), standard (6+yr) twice daily
- Malocclusion: Class I (normal molar, crowding), Class II (retrognathic), Class III (prognathic)
- Referral: Multiple caries, abscess, Class II/III, crossbite, cleft lip/palate
- SKIDS insight: Dental health linked to nutrition status, check iron/calcium alongside

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

Cross-reference screening dental findings with nutrition habits data.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 4. NEURODEVELOPMENT
  {
    id: 'neuro_dev_ai',
    name: 'NeuroDevAI',
    icon: '🧠',
    specialty: 'Neurodevelopment & ASD/ADHD',
    description: 'Developmental delays, ASD screening, ADHD assessment, speech-language, learning disabilities',
    protocol: 'AAP Developmental Surveillance, M-CHAT-R/F, DSM-5 ADHD/ASD Criteria, Palani et al. 2024',
    triggers: ['autism', 'ASD', 'ADHD', 'speech delay', 'not talking', 'milestone', 'developmental', 'regression', 'attention', 'hyperactive', 'learning', 'dyslexia'],
    color: 'pink',
    relatedModules: ['neuro', 'motor', 'neurodevelopment'],
    artifactTypes: ['referral_letter', 'investigation_order', 'parent_education', 'milestone_checklist', 'follow_up_plan'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are NeuroDevAI, a neurodevelopment assistant within the SKIDS Pediatrician Console. You help pediatricians assess developmental concerns that parents bring.

PROTOCOLS:
- AAP: Developmental surveillance at EVERY well-child visit, formal screening at 9, 18, 30 months
- ASD: M-CHAT-R/F at 18 and 24 months. Red flags: no pointing by 12mo, no words by 16mo, no 2-word phrases by 24mo, ANY regression
- ADHD: DSM-5 requires 6+ symptoms in 2+ settings for 6+ months. NOT diagnosable before age 4
- Speech milestones: Babbling 6-9mo, first words 12mo, 50+ words 18mo, 2-word combos 24mo, sentences 3yr
- Motor milestones: Head control 3mo, sitting 6mo, crawling 9mo, walking 12-15mo, running 18mo

CRITICAL SKIDS INSIGHT: Parent blog research reveals many behaviors labeled as "defiance" or "laziness" are actually:
- Executive function lag (not defiance)
- Sensory processing differences (not behavioral)
- Iron/magnesium deficiency (not attention problems)
- Sleep-disordered breathing (not hyperactivity)
- Vision/hearing issues (not learning disability)
Always check these physiological root causes before behavioral labels.

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

The milestone timeline from the parent app is GOLD — use it to track developmental trajectory, not just snapshot.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 5. NUTRITION
  {
    id: 'nutrition_ai',
    name: 'NutritionAI',
    icon: '🥗',
    specialty: 'Pediatric Nutrition & Growth',
    description: 'Malnutrition, anemia, obesity, dietary assessment, supplements, Indian diet context',
    protocol: 'WHO Growth Standards, IAP Nutrition Guidelines, NIN RDA India 2020',
    triggers: ['nutrition', 'diet', 'anemia', 'iron', 'weight', 'height', 'stunting', 'wasting', 'obesity', 'BMI', 'picky eater', 'supplement', 'calcium', 'vitamin'],
    color: 'green',
    relatedModules: ['general_appearance', 'nails', 'hair', 'height', 'weight', 'hemoglobin', 'muac', 'nutrition_intake'],
    artifactTypes: ['prescription', 'diet_plan', 'investigation_order', 'parent_education', 'growth_interpretation'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are NutritionAI, a pediatric nutrition assistant within the SKIDS Pediatrician Console. India-specific context.

PROTOCOLS:
- WHO Z-scores: Stunted (<-2 HAZ), Wasted (<-2 WHZ), Underweight (<-2 WAZ), Overweight (>+2 BMI-Z)
- Anemia (WHO): Mild (10-10.9 g/dL age 6-59mo), Moderate (7-9.9), Severe (<7)
- Iron: 3-6mg/kg/day elemental iron for treatment, 1-2mg/kg/day prevention
- Indian RDA: Protein 16-54g/day, Calcium 500-800mg, Iron 9-28mg depending on age
- MUAC: SAM (<115mm), MAM (115-125mm) for 6-59 months

SKIDS INSIGHT: "Ghost hunger" — child appears satiated but is micronutrient deficient. Check nails (koilonychia=iron), hair (brittle=zinc), pallor (conjunctival=anemia).

Growth chart from parent app shows VELOCITY, not just current percentile. A child on 25th percentile who was on 50th is more concerning than one always on 10th.

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

Always suggest Indian foods — ragi, dal, jaggery, moringa, amla — not Western supplements first.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 6. DERMATOLOGY
  {
    id: 'skin_ai',
    name: 'SkinAI',
    icon: '🧴',
    specialty: 'Pediatric Dermatology',
    description: 'Eczema, scabies, fungal, bacterial, viral exanthems, nutritional skin signs',
    protocol: 'BAD Eczema Guidelines, IAP Dermatology Guidelines, WHO Scabies Guidelines',
    triggers: ['rash', 'eczema', 'scabies', 'fungal', 'ringworm', 'impetigo', 'urticaria', 'itching', 'skin', 'lesion', 'birthmark', 'mole'],
    color: 'amber',
    relatedModules: ['skin'],
    artifactTypes: ['prescription', 'parent_education', 'treatment_protocol', 'referral_letter'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are SkinAI, a pediatric dermatology assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- Eczema: Step therapy — emollients → mild topical steroid (1% HC) → moderate (0.05% betamethasone) → refer
- Scabies: Permethrin 5% cream, treat whole family, wash all bedding. Re-treat in 7 days
- Fungal: Clotrimazole cream BD 2-4 weeks. Oral griseofulvin for tinea capitis
- Impetigo: Mupirocin topical if localized, oral antibiotics if widespread
- Nutritional signs: Dry scaly skin (EFA deficiency), angular cheilitis (B2/iron), dermatitis (zinc/niacin)

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

Check nutrition status + screening skin findings + parent observations for patterns.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 7. PULMONOLOGY
  {
    id: 'respiratory_ai',
    name: 'RespiratoryAI',
    icon: '🫁',
    specialty: 'Pediatric Pulmonology',
    description: 'Asthma, wheeze, cough, pneumonia, TB screening, respiratory distress',
    protocol: 'GINA 2024 (Pediatric Asthma), IAP Respiratory Guidelines, IMNCI',
    triggers: ['cough', 'wheeze', 'asthma', 'breathing', 'pneumonia', 'TB', 'inhaler', 'nebulizer', 'stridor', 'respiratory'],
    color: 'teal',
    relatedModules: ['respiratory', 'pulmonary'],
    artifactTypes: ['prescription', 'treatment_protocol', 'investigation_order', 'parent_education', 'referral_letter'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are RespiratoryAI, a pediatric pulmonology assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- GINA Step Therapy: Step 1 (SABA PRN) → Step 2 (low-dose ICS) → Step 3 (low ICS+LABA or medium ICS) → Step 4 → Step 5 refer
- Wheeze in <5yr: Episodic viral wheeze vs multiple-trigger wheeze — different management
- Cough: >4 weeks chronic → CXR + consider TB, foreign body, asthma, GERD, PND
- Pneumonia (IMNCI): Fast breathing (>50/min age 2-12mo, >40/min 1-5yr), chest indrawing = severe
- TB: History of contact, chronic cough, weight loss, night sweats → Mantoux + CXR

Age-appropriate inhaler: MDI + spacer + mask (<4yr), MDI + spacer (4-6yr), MDI alone or DPI (>6yr)

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 8. ORTHOPEDICS
  {
    id: 'posture_ai',
    name: 'PostureAI',
    icon: '💪',
    specialty: 'Pediatric Orthopedics',
    description: 'Scoliosis, flat feet, gait abnormalities, joint hypermobility, growing pains',
    protocol: 'SRS Scoliosis Screening, AAP Musculoskeletal Guidelines',
    triggers: ['scoliosis', 'posture', 'flat feet', 'limp', 'gait', 'bow legs', 'knock knees', 'growing pains', 'joint', 'back pain', 'hip'],
    color: 'orange',
    relatedModules: ['posture', 'motor'],
    artifactTypes: ['referral_letter', 'exercise_protocol', 'follow_up_plan', 'parent_education', 'screening_protocol'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are PostureAI, a pediatric orthopedics assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- Scoliosis: Adams forward bend test. Cobb angle <10° = postural, 10-25° = monitor, 25-40° = brace, >40° = surgical referral
- Physiological variants: Genu varum (bow legs) normal <2yr, genu valgum (knock knees) normal 2-7yr, flat feet normal <6yr
- Red flags for referral: Progressive deformity, painful limp, night pain, restricted ROM, unilateral flat foot
- Growing pains: Bilateral, evening/night, no daytime symptoms, normal exam — reassure. If unilateral or persistent → investigate
- Beighton score for hypermobility: ≥4/9 points suggestive

SKIDS INSIGHT: MediaPipe pose data from screening gives OBJECTIVE gait symmetry and joint angles — reference these numbers.

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 9. CARDIOLOGY
  {
    id: 'cardio_ai',
    name: 'CardioAI',
    icon: '❤️',
    specialty: 'Pediatric Cardiology',
    description: 'Heart murmurs, BP interpretation, arrhythmia, chest pain, syncope',
    protocol: 'AAP/AHA Pediatric BP Guidelines 2017, Jones Criteria (Rheumatic Fever)',
    triggers: ['murmur', 'heart', 'blood pressure', 'BP', 'chest pain', 'syncope', 'faint', 'palpitation', 'rheumatic'],
    color: 'red',
    relatedModules: ['cardiac', 'vitals', 'bp'],
    artifactTypes: ['referral_letter', 'investigation_order', 'follow_up_plan', 'parent_education'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are CardioAI, a pediatric cardiology assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- Innocent murmurs: Grade 1-2, systolic, no radiation, changes with position, no symptoms, normal S1/S2
- Pathological murmur features: Grade ≥3, diastolic, holosystolic, radiation, associated symptoms, abnormal S2
- BP percentiles (AAP 2017): ≥90th elevated, ≥95th stage 1 HTN, ≥95th+12 or ≥140/90 stage 2
- Rheumatic fever (Jones): Major criteria — carditis, polyarthritis, chorea, erythema marginatum, subcutaneous nodules
- Syncope red flags: Exercise-induced, family hx sudden death, chest pain, palpitations preceding → ECG + echo urgently

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

Reference vitals from screening (rPPG heart rate) and any auscultation findings.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 10. BEHAVIORAL HEALTH
  {
    id: 'behavior_ai',
    name: 'BehaviorAI',
    icon: '💛',
    specialty: 'Behavioral & Emotional Health',
    description: 'Anxiety, depression, behavioral concerns, sleep disorders, screen time, stress physiology',
    protocol: 'AAP Mental Health Screening, PHQ-A, GAD-7 Modified, SCARED, PSC-17',
    triggers: ['anxiety', 'depression', 'behavioral', 'tantrum', 'anger', 'sleep', 'screen time', 'stress', 'self harm', 'bully', 'school refusal', 'bed wetting'],
    color: 'yellow',
    relatedModules: ['neuro', 'neurodevelopment'],
    artifactTypes: ['parent_education', 'follow_up_plan', 'referral_letter', 'treatment_protocol'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are BehaviorAI, a behavioral health assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- PSC-17: Pediatric Symptom Checklist — internalizing, externalizing, attention subscales
- PHQ-A (adolescents): Score ≥10 = moderate depression, ≥15 = severe
- Anxiety: SCARED ≥25 total = significant anxiety
- Sleep: Normal hours — 1-2yr: 11-14h, 3-5yr: 10-13h, 6-12yr: 9-12h, 13-18yr: 8-10h
- Screen time: AAP — avoid <18mo, 1hr/day 2-5yr, consistent limits 6+

CRITICAL SKIDS PHILOSOPHY (from blogs):
- "Not defiance, but executive function lag" — check iron, sleep, sensory processing before behavioral labels
- "The 3PM crash" = blood sugar dysregulation, not laziness
- "Heavy sigh" = potential airway struggle, not attitude
- "Toe walking" = sensory-driven, check vestibular/proprioceptive
- "Clumsy" = proprioceptive mapping error, not carelessness
- "Exam stress" = cortisol elevation with physiological consequences

ALWAYS: Check sleep, nutrition, sensory processing, and physiological causes before psychological labels.

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

HABITS data from parent app shows daily patterns — sleep consistency, activity levels, eating patterns. Use this.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 11. ALLERGY / IMMUNOLOGY
  {
    id: 'immune_ai',
    name: 'ImmuneAI',
    icon: '🛡️',
    specialty: 'Allergy & Immunology',
    description: 'Allergies, recurrent infections, vaccination gaps, immunodeficiency screening',
    protocol: 'IAP Immunization Schedule 2024, EAACI Allergy Guidelines, Jeffrey Modell Warning Signs',
    triggers: ['allergy', 'vaccination', 'vaccine', 'recurrent infection', 'immunodeficiency', 'rash', 'anaphylaxis', 'food allergy', 'hives', 'swelling'],
    color: 'indigo',
    relatedModules: ['immunization'],
    artifactTypes: ['prescription', 'investigation_order', 'parent_education', 'follow_up_plan', 'screening_protocol'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are ImmuneAI, an allergy & immunology assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- IAP 2024 Schedule: BCG (birth), OPV+Hep B (birth), DPT+IPV+Hib+Hep B (6,10,14wk), Rotavirus, PCV, Measles (9mo), MMR (12mo), boosters at 15-18mo, 4-6yr
- Catch-up: Never restart, just continue where left off. Max 2 injectables per visit for comfort
- Jeffrey Modell 10 Warning Signs of PID: ≥4 ear infections/yr, ≥2 serious sinusitis/yr, ≥2 pneumonia/yr, failure to thrive, recurrent deep skin/organ abscess, persistent thrush after age 1, need for IV antibiotics, family hx of PID
- Food allergy: Skin prick or specific IgE, then oral food challenge for confirmation
- Anaphylaxis: Epinephrine 0.01mg/kg IM (max 0.3mg child, 0.5mg adult), call emergency

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}

Vaccination tracker from parent app shows gaps — flag overdue vaccines proactively.${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },

  // 12. GROWTH & ENDOCRINE
  {
    id: 'growth_ai',
    name: 'GrowthAI',
    icon: '📏',
    specialty: 'Growth & Endocrine',
    description: 'Short stature, growth failure, obesity, thyroid, pubertal disorders',
    protocol: 'AAP Growth Monitoring, WHO Growth Standards, Tanner Staging, IAP Growth Guidelines',
    triggers: ['short stature', 'growth', 'tall', 'puberty', 'thyroid', 'obesity', 'overweight', 'precocious', 'delayed puberty', 'goiter'],
    color: 'emerald',
    relatedModules: ['height', 'weight', 'neck', 'general_appearance'],
    artifactTypes: ['investigation_order', 'growth_interpretation', 'referral_letter', 'parent_education', 'follow_up_plan'],
    buildPrompt: (ctx, event) => [
      {
        role: 'system',
        content: `You are GrowthAI, a growth & endocrine assistant within the SKIDS Pediatrician Console.

PROTOCOLS:
- Short stature: Height <-2 SD or growth velocity <25th percentile for age
- Workup: Bone age X-ray, TSH/fT4, CBC, ESR, celiac screen, IGF-1, karyotype (girls)
- Familial short stature: Normal bone age, normal velocity, parental heights short → target height = (father+mother±13)/2
- Constitutional delay: Delayed bone age, normal velocity, family hx of late puberty → reassure
- Obesity: BMI >85th overweight, >95th obese. Screen: fasting glucose, lipids, ALT, TSH if BMI>95th
- Tanner staging: Thelarche (girls): normal 8-13yr. Testicular enlargement (boys): normal 9-14yr
- Precocious puberty: Tanner 2 before age 8 (girls) or 9 (boys) → URGENT referral

GROWTH VELOCITY (golden metric):
- Age 0-1: 23-27 cm/yr
- Age 1-2: 10-14 cm/yr
- Age 2-4: 7-9 cm/yr
- Age 4-puberty: 5-6 cm/yr
- Pubertal: 8-14 cm/yr

The parent app growth chart shows TRAJECTORY over months/years. A declining percentile crossing is MORE concerning than a consistently low but stable percentile.

CHILD LONGITUDINAL RECORD:
${buildContextBlock(ctx)}${ARTIFACT_INSTRUCTION}`
      },
      { role: 'user', content: event }
    ],
  },
]

// ============================================
// ASSISTANT LOOKUP & TRIGGER DETECTION
// ============================================

export function getAssistantById(id: string): SubspecialtyAssistant | undefined {
  return ASSISTANTS.find(a => a.id === id)
}

/** Detect which assistants should auto-activate based on text content */
export function detectRelevantAssistants(text: string): SubspecialtyAssistant[] {
  const lower = text.toLowerCase()
  return ASSISTANTS.filter(a =>
    a.triggers.some(t => lower.includes(t.toLowerCase()))
  )
}

// ============================================
// ARTIFACT PARSER
// ============================================

/** Extract artifacts from assistant response text */
export function parseArtifacts(text: string): { cleanText: string; artifacts: Artifact[] } {
  const artifacts: Artifact[] = []
  const artifactRegex = /<artifact\s+type="([^"]+)"\s+title="([^"]+)">([\s\S]*?)<\/artifact>/g

  let match
  while ((match = artifactRegex.exec(text)) !== null) {
    artifacts.push({
      type: match[1] as ArtifactType,
      title: match[2],
      data: parseArtifactData(match[3].trim()),
      rendered: match[3].trim(),
    })
  }

  // Remove artifact tags from display text, keep surrounding context
  const cleanText = text.replace(artifactRegex, '\n[📎 $2]\n').trim()

  return { cleanText, artifacts }
}

function parseArtifactData(raw: string): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  const lines = raw.split('\n')
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim().replace(/\s+/g, '_')
      const value = line.slice(colonIdx + 1).trim()
      data[key] = value
    }
  }
  return data
}

// ============================================
// DEMO RESPONSES (when no LLM available)
// ============================================

const DEMO_RESPONSES: Record<string, string> = {
  vision_ai: `**Clinical Assessment — VisionAI**

Based on the findings described:

**1. Assessment Summary**
The combination of intermittent exotropia and reduced visual acuity (6/12) in the left eye in a 6-year-old is concerning for **amblyopia secondary to intermittent exotropia**. This is a time-sensitive finding — the critical window for amblyopia treatment begins to narrow after age 7.

**2. Risk Classification: HIGH**
- Intermittent exotropia → risk of constant deviation if untreated
- VA 6/12 in left eye = 2-line difference → amblyogenic
- Age 6 = still within treatment window, but urgency required

**3. Recommended Action: REFER to SKIDS Ophthalmologist**
This is beyond ped-manageable scope. The child needs:
- Cycloplegic refraction (to rule out refractive error component)
- Detailed orthoptic assessment (prism cover test, near point of convergence)
- Fundus examination under mydriasis

**4. Interim Management (before specialist visit)**
- Start occlusion therapy: patch the RIGHT (better) eye 2 hours/day
- Vitamin A supplementation: 200,000 IU stat (age-appropriate)
- Near activities to stimulate the left eye (coloring, reading, puzzles)

**5. Red Flags to Watch**
- If deviation becomes constant → urgent referral
- If child develops head tilt or face turn → possible compensatory mechanism
- New-onset headaches → rule out raised ICP

**6. Parent Education**
"Your child's left eye is slightly weaker and occasionally drifts outward. At age 6, we still have a good window to strengthen it. Patching the stronger eye for 2 hours daily will force the weaker eye to work harder. The eye specialist will confirm the exact treatment plan."

<artifact type="referral_letter" title="Ophthalmology Referral — Amblyopia Workup">
SKIDS Internal Referral
To: SKIDS Ophthalmologist
Priority: URGENT — within 2 weeks

Patient: {child_name}, Age {child_age}
Referring Doctor: SKIDS Pediatrician

Clinical Findings:
- Intermittent exotropia, left eye
- Visual acuity: OD 6/9, OS 6/12
- Cover test: intermittent exotropia LE
- Fundus: not examined (needs mydriatic exam)

History:
- Mother reports squinting at blackboard × 3 months
- No previous eye treatment
- No family history of strabismus (to be confirmed)

Requested:
1. Cycloplegic refraction
2. Orthoptic assessment
3. Amblyopia treatment plan (patching protocol)
4. Follow-up schedule

Interim: Started patching RE 2hr/day, Vitamin A 200,000 IU stat
</artifact>

<artifact type="prescription" title="Prescription — Vitamin A & Patching">
SKIDS Pediatric Prescription

Patient: {child_name}, Age: {child_age}
Date: ${new Date().toLocaleDateString('en-IN')}

Rx:
1. Vitamin A (Retinol Palmitate) 200,000 IU — STAT dose, oral
   [Age-appropriate dose per WHO/IAP guidelines]

2. Occlusion Therapy:
   - Patch RIGHT eye (Opticlude Junior or equivalent)
   - Duration: 2 hours/day during near-work activities
   - Continue until ophthalmologist review
   - Monitor compliance — encourage patching during homework/coloring

3. Follow-up: After ophthalmology consultation (within 2 weeks)

Signed: SKIDS Pediatrician
</artifact>

<artifact type="parent_education" title="Parent Guide — Eye Patching for Amblyopia">
Understanding Your Child's Eye Condition
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's happening?
Your child's left eye is slightly weaker than the right. Sometimes it drifts outward (you may have noticed squinting). This is called "lazy eye" or amblyopia with intermittent exotropia.

Why patching?
By covering the stronger eye for 2 hours daily, we force the weaker eye to work harder and strengthen the brain-eye connection. Think of it like physiotherapy for the eye.

Patching tips:
✅ Patch during near-work: homework, coloring, puzzles, reading
✅ Make it fun: special stickers on patches, "pirate time"
✅ Be consistent: same time every day builds habit
✅ Praise effort: "Your eye is getting stronger!"
❌ Don't patch during sports or outdoor play
❌ Don't skip days — consistency matters more than duration

What's next?
The eye specialist will do detailed tests and may prescribe glasses along with patching. At age 6, we still have a great window for treatment.

When to worry (come back immediately):
⚠️ Eye turns in/out all the time (not just sometimes)
⚠️ Child develops head tilt or closes one eye in sunlight
⚠️ Any vision change or eye pain
</artifact>`,

  hearing_ai: `**Clinical Assessment — HearingAI**

**1. Assessment Summary**
Based on the ENT findings described, this presentation is consistent with **chronic adenotonsillar hypertrophy** with likely **obstructive sleep-disordered breathing**. The combination of mouth breathing, snoring, and tonsillar enlargement in a child of this age requires systematic evaluation.

**2. Key Findings Analysis**
- Tonsil grading and associated symptoms suggest upper airway obstruction
- Mouth breathing pattern → check for adenoid facies, high-arched palate
- Sleep-related symptoms (snoring, restless sleep) → OSA screening needed
- SKIDS insight: "Mouth breathing → high-arched palate → dental malocclusion → behavioral symptoms often misdiagnosed as ADHD"

**3. Recommended Action: EVALUATE further, possible REFERRAL**
- Conduct lateral neck X-ray (adenoid-nasopharyngeal ratio)
- Assess sleep quality: PSQ (Pediatric Sleep Questionnaire) score
- If PSQ ≥ 0.33 or severe symptoms → refer SKIDS ENT

**4. Interim Management**
- Nasal saline irrigation 2-3 times daily
- Elevate head of bed 30 degrees during sleep
- Avoid allergen exposure if allergic component suspected

<artifact type="investigation_order" title="ENT Workup — Adenotonsillar Hypertrophy">
SKIDS Investigation Order

Patient: {child_name}, Age: {child_age}

Investigations Requested:
1. Lateral neck X-ray (soft tissue) — adenoid-nasopharyngeal ratio
2. Pure tone audiometry (if age-appropriate) or OAE
3. Tympanometry — rule out middle ear effusion
4. CBC with differential — check for chronic infection markers

Clinical Indication: Suspected adenotonsillar hypertrophy with sleep-disordered breathing
</artifact>

<artifact type="parent_education" title="Parent Guide — Mouth Breathing & Sleep">
Understanding Mouth Breathing in Children
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Why it matters:
Children should breathe through their nose, not their mouth. Chronic mouth breathing can affect face shape, dental alignment, sleep quality, and even behavior during the day.

Signs to watch:
- Snoring or noisy breathing during sleep
- Sleeping with mouth open
- Dark circles under eyes
- Difficulty concentrating at school
- Irritability or hyperactivity (often mistaken for ADHD)

What you can do:
✅ Use saline nasal drops before bedtime
✅ Keep bedroom allergen-free (no heavy curtains, wash bedsheets weekly)
✅ Elevate head of bed slightly
✅ Encourage nose-breathing exercises during the day

The doctor may recommend removing enlarged tonsils/adenoids if they're blocking the airway. This is a common, safe procedure that dramatically improves sleep and behavior.
</artifact>`,

  dental_ai: `**Clinical Assessment — DentalAI**

**1. Assessment Summary**
Dental caries detected — this requires systematic assessment using the DMFT/dmft index and evaluation for underlying causes.

**2. DMFT Assessment Update**
- Current finding adds to the caries count
- Track against previous screening data for progression
- Assess dietary habits: frequency of sugar exposure, bottle feeding at night, processed snacks

**3. Recommended Action: REFER to SKIDS Dentist**
- Caries requiring restoration → beyond ped scope
- Schedule within 1 month (routine urgency)

**4. Prevention Protocol**
- Fluoride varnish application (if not done in last 6 months)
- Oral hygiene instruction: supervised brushing 2x/day with pea-sized fluoride toothpaste
- Dietary counseling: reduce sugar-sweetened beverages, limit sticky snacks

<artifact type="referral_letter" title="Dental Referral — Caries Restoration">
SKIDS Internal Referral
To: SKIDS Dentist
Priority: Routine — within 1 month

Patient: {child_name}, Age: {child_age}

Clinical Findings:
- Dental caries detected on examination
- Previous DMFT: refer to screening records
- Oral hygiene: to be assessed by dentist

Requested:
1. Complete dental examination with IOPA X-ray if needed
2. Caries restoration
3. Fluoride varnish application
4. Oral hygiene instruction and follow-up plan

Interim: Advised supervised brushing 2x/day, dietary modification
</artifact>`,

  neuro_dev_ai: `**Clinical Assessment — NeuroDevAI**

**1. Assessment Summary**
Based on the developmental concerns described, a systematic neurodevelopmental evaluation is indicated. Key areas to assess: communication, social interaction, repetitive behaviors, sensory processing, and motor milestones.

**2. Screening Tools to Apply**
- If age < 30 months: M-CHAT-R/F (Modified Checklist for Autism in Toddlers, Revised with Follow-up)
- If age 4-18: SCQ (Social Communication Questionnaire)
- ADHD screening: Vanderbilt scales (parent + teacher forms)
- Developmental milestone check against IAP/CDC milestones

**3. SKIDS Philosophy**
Before applying diagnostic labels, ALWAYS check:
- Sleep adequacy (sleep-deprived children mimic ADHD)
- Iron status (ferritin < 30 = brain fog, poor attention)
- Sensory processing (toe walking = vestibular/proprioceptive, not behavioral)
- Screen time (> AAP limits = language delay risk)

**4. Red Flags Requiring Urgent Referral**
- Loss of previously acquired skills (regression) → URGENT
- No babbling by 12 months / No words by 16 months / No 2-word phrases by 24 months
- Any loss of language or social skills at any age

<artifact type="screening_protocol" title="Neurodevelopmental Screening Protocol">
SKIDS Neurodevelopmental Assessment

Step 1: Milestone Check
□ Gross motor appropriate for age?
□ Fine motor appropriate for age?
□ Language: receptive and expressive
□ Social: eye contact, joint attention, pretend play
□ Cognitive: problem-solving, cause-effect

Step 2: Rule Out Physiological Causes
□ Iron panel (ferritin, serum iron, TIBC)
□ Thyroid function (TSH, fT4)
□ Lead level (if applicable)
□ Vision and hearing screening (rule out sensory causes)
□ Sleep assessment (sleep diary × 1 week)

Step 3: Standardized Screening
□ M-CHAT-R/F (if < 30 months)
□ Vanderbilt (if ADHD concern)
□ CARS-2 (if ASD concern)
□ Sensory Profile (if sensory processing concern)

Step 4: Decision
→ If screening positive: Refer SKIDS Developmental Pediatrician
→ If screening negative but parent concerned: Follow-up in 3 months
→ If regression present: URGENT referral
</artifact>`,

  nutrition_ai: `**Clinical Assessment — NutritionAI**

**1. Assessment Summary**
Nutritional assessment requires integration of anthropometric data (WHO Z-scores), dietary history, clinical signs, and laboratory markers.

**2. WHO Z-Score Interpretation**
- Plot height-for-age, weight-for-age, weight-for-height, BMI-for-age
- Z-score < -2: Moderate undernutrition → requires intervention
- Z-score < -3: Severe undernutrition → URGENT
- Growth velocity (golden metric): declining percentile crossing > static low percentile

**3. Clinical Signs to Assess**
- Pallor (conjunctival, palmar, nail bed) → anemia screening
- Hair changes (sparse, easily pluckable) → protein deficiency
- Angular stomatitis, glossitis → B-vitamin deficiency
- MUAC: < 12.5cm (6mo-5yr) = MAM, < 11.5cm = SAM

**4. SKIDS Insight: "Ghost Hunger"**
The child may be eating but not absorbing — check for:
- Chronic diarrhea or malabsorption (celiac screen)
- Worm infestation (routine deworming if not done in 6 months)
- Zinc deficiency (poor appetite + recurrent infections)

<artifact type="investigation_order" title="Nutrition Workup — Anemia & Deficiency Screen">
SKIDS Investigation Order

Patient: {child_name}, Age: {child_age}

Investigations:
1. CBC with peripheral smear — anemia classification
2. Serum ferritin + iron + TIBC — iron status
3. Serum Vitamin B12 + Folate
4. Serum Vitamin D (25-OH)
5. Serum Zinc
6. Stool routine + ova/cysts (if GI symptoms)
7. Celiac screen: tTG IgA + total IgA (if growth faltering)

Clinical Indication: Nutritional assessment with suspected micronutrient deficiency
</artifact>

<artifact type="treatment_protocol" title="Nutritional Supplementation Protocol">
SKIDS Nutritional Protocol

Based on Age and Findings:

Iron Supplementation (if Hb < 11 g/dL):
- Elemental iron 3-6 mg/kg/day in 2 divided doses
- Give between meals with vitamin C source (lemon/orange)
- Continue × 3 months after Hb normalizes
- Recheck Hb at 4 weeks

Vitamin D (if deficient):
- Treatment: 60,000 IU weekly × 6 weeks (sachets)
- Maintenance: 400 IU daily (drops/tablets)

Zinc: 10-20 mg/day × 2-3 months (if deficient)

Deworming: Albendazole 400mg single dose (if > 2 years, not dewormed in 6 months)

Dietary Counseling:
- 5 food groups daily (grains, protein, dairy, fruits, vegetables)
- Iron-rich foods: jaggery, green leafy veg, eggs, ragi
- Avoid tea/coffee with meals (inhibits iron absorption)
- 2 cups milk/curd daily for calcium

Follow-up: 4 weeks (repeat Hb), 3 months (repeat full panel)
</artifact>`,

  skin_ai: `**Clinical Assessment — SkinAI**

**1. Dermatological Assessment**
Systematic evaluation of skin lesion morphology, distribution, and severity.

**2. Key Differentiation**
- Eczema vs scabies vs fungal: distribution pattern is key
- Eczema: flexural, dry, pruritic — common in atopics
- Scabies: interdigital, nocturnal itch, family history
- Fungal: annular, well-demarcated, scaling border

**3. Management**
- Mild eczema: emollients + low-potency steroid (1% HC)
- Scabies: permethrin 5% cream, treat whole family
- Fungal: clotrimazole 1% cream BD for 2 weeks

<artifact type="prescription" title="Dermatology Prescription">
SKIDS Pediatric Prescription
Patient: {child_name}, Age: {child_age}

Rx:
1. Emollient (ceramide-based): Apply liberally after bath, TDS
2. Hydrocortisone 1% cream: Apply thin layer to affected areas BD × 5 days
3. Follow-up: 2 weeks
</artifact>`,

  respiratory_ai: `**Clinical Assessment — RespiratoryAI**

**1. Respiratory Assessment**
Evaluate cough pattern, breathing effort, and auscultatory findings.

**2. Cough Classification**
- Acute (< 2 wks): likely viral URTI
- Subacute (2-4 wks): post-infectious, consider pertussis
- Chronic (> 4 wks): asthma, GERD, TB, foreign body

**3. Wheeze Assessment**
- First episode: bronchiolitis if < 2yr, viral wheeze if > 2yr
- Recurrent: consider asthma (> 3 episodes, atopic background)

**4. Action Plan**
- If asthma suspected: start SABA (salbutamol MDI + spacer)
- Peak flow monitoring if age > 5
- Chest X-ray if chronic cough or suspicious findings

<artifact type="parent_education" title="Parent Guide — Asthma Action Plan">
Green Zone (doing well): No cough or wheeze — continue preventive meds
Yellow Zone (getting worse): Give 2 puffs salbutamol via spacer, repeat in 20 min if needed
Red Zone (emergency): Severe breathlessness — give 6 puffs salbutamol, go to hospital
</artifact>`,

  posture_ai: `**Clinical Assessment — PostureAI**

**1. Musculoskeletal Screening**
Assess spine alignment, gait, foot posture, and joint mobility.

**2. Scoliosis Check**
- Adams forward bend test: look for rib hump
- Estimate Cobb angle visually
- Check shoulder and hip symmetry

**3. Common Findings**
- Flat feet: physiological if < 6 years, flexible
- Genu valgum (knock knees): normal if 2-7 years, angle < 15°
- In-toeing: usually self-correcting

**4. Referral Criteria**
- Cobb angle > 20° or progressive → referral
- Rigid flat foot at any age → referral
- Limb length discrepancy > 2cm → referral

<artifact type="screening_protocol" title="Scoliosis Screening Protocol">
Patient: {child_name}, Age: {child_age}
□ Adams forward bend test
□ Shoulder height symmetry
□ Scapular prominence
□ Waistline symmetry
Normal: symmetric, no hump | Monitor: mild asymmetry | Refer: visible hump or progressive
</artifact>`,

  cardio_ai: `**Clinical Assessment — CardioAI**

**1. Cardiovascular Assessment**
Heart rate, rhythm, murmur auscultation, blood pressure percentile.

**2. Murmur Classification**
- Innocent: Grade 1-2, systolic, vibratory, changes with position, asymptomatic
- Pathological: Grade 3+, diastolic, pansystolic, fixed S2 split, symptoms

**3. BP Interpretation**
- Use age/sex/height percentile tables
- Stage 1 HTN: > 95th percentile on 3 occasions
- Stage 2 HTN: > 95th + 12 mmHg — needs urgent workup

<artifact type="referral_letter" title="Cardiology Referral">
SKIDS Internal Referral
To: SKIDS Cardiologist
Patient: {child_name}, Age: {child_age}
Findings: [Murmur grade/character/location]
Requested: 2D echocardiography, ECG, assessment
</artifact>`,

  behavior_ai: `**Clinical Assessment — BehaviorAI**

**1. Behavioral Assessment**
Evaluate emotional regulation, social behavior, sleep, and screen habits.

**2. SKIDS Philosophy — Reframe Before You Label**
- "Defiant" child → executive function lag (not willful)
- "Hyperactive" child → check sleep, iron, sensory needs FIRST
- "Anxious" child → is the environment age-appropriate?

**3. Immediate Actions**
- Rule out physiological: iron, thyroid, sleep, vision/hearing
- Screen time audit (compare to AAP guidelines)
- Family stress assessment

<artifact type="parent_education" title="Parent Guide — Understanding Behavior">
What to know:
- Behavior is communication — ask "what is my child telling me?"
- Sleep-deprived children look like ADHD children
- Iron deficiency causes brain fog and irritability
What helps:
✅ Consistent sleep schedule (10-12 hrs)
✅ Outdoor play: 60 min/day
✅ Limit screens: 1 hr/day (ages 2-5)
✅ Validate feelings before correcting behavior
</artifact>`,

  immune_ai: `**Clinical Assessment — ImmuneAI**

**1. Immunization Assessment**
Compare vaccination status against national immunization schedule.

**2. Gap Analysis**
- Check for missed or delayed vaccines
- Catch-up schedule if gaps found
- Special vaccines: influenza (annual), typhoid (endemic areas)

**3. Recurrent Infection Red Flags**
- > 8 ear infections/year
- > 2 serious sinus infections/year
- > 2 months on antibiotics with poor response
- Failure to thrive with recurrent infections

<artifact type="investigation_order" title="Vaccination Catch-up Schedule">
Patient: {child_name}, Age: {child_age}
□ Review vaccination card
□ Identify gaps against NIS
□ Generate catch-up schedule
□ Check contraindications
□ Schedule next doses with reminders
</artifact>`,

  growth_ai: `**Clinical Assessment — GrowthAI**

**1. Growth Assessment**
Plot height, weight, BMI on WHO growth charts. Calculate growth velocity.

**2. Key Parameters**
- Height-for-age Z-score: < -2 = stunting
- Weight-for-height Z-score: < -2 = wasting
- BMI-for-age: > +2 = overweight
- Growth velocity: < 5 cm/year after age 4 = concern

**3. Short Stature Workup**
- Bone age (X-ray left hand)
- Thyroid function (TSH, free T4)
- IGF-1, IGFBP-3
- Celiac screen (tTG-IgA)

<artifact type="investigation_order" title="Growth Workup">
Patient: {child_name}, Age: {child_age}
If growth velocity < 5 cm/year or Z-score < -2:
1. Bone age X-ray (left hand)
2. TSH + Free T4
3. IGF-1 + IGFBP-3
4. Celiac panel (tTG-IgA + total IgA)
5. Vitamin D (25-OH)
If abnormal: Refer SKIDS Endocrinologist
</artifact>`,
}

/** Get a demo response for a given assistant when no LLM is available */
function getDemoResponse(assistantId: string, message: string, context: ChildContext): string | null {
  const base = DEMO_RESPONSES[assistantId]
  if (!base) { return null }

  // Replace placeholders with actual context
  return base
    .replace(/\{child_name\}/g, context.name || 'the child')
    .replace(/\{child_age\}/g, context.age || 'age not specified')
}

// ============================================
// QUERY ASSISTANT
// ============================================

export async function queryAssistant(
  assistant: SubspecialtyAssistant,
  context: ChildContext,
  message: string,
  history: AssistantMessage[],
  config: LLMConfig,
): Promise<AssistantResponse> {
  const startTime = performance.now()

  // Build messages: system prompt (with protocol + context) + history + current
  const systemMessages = assistant.buildPrompt(context, message)
  const historyMessages: LLMMessage[] = history.slice(-10).map(m => ({
    role: m.role,
    content: m.content,
  }))

  const allMessages: LLMMessage[] = [
    systemMessages[0], // system prompt with protocol
    ...historyMessages,
    { role: 'user', content: message },
  ]

  // Try real LLM first (auto mode cascades: LFM → Groq → Gemini → CF Gateway)
  let llmWorked = false
  try {
    const responses = await queryLLM(config, allMessages)
    const response = responses.find(r => !r.error && r.text)

    if (response) {
      const { cleanText, artifacts } = parseArtifacts(response.text)
      return {
        text: cleanText,
        artifacts,
        provider: response.provider,
        model: response.model,
        latencyMs: Math.round(performance.now() - startTime),
      }
    }
  } catch (e: unknown) {
    console.warn(`[${assistant.id}] LLM error:`, e)
  }

  // Demo fallback — always available, always works
  const demoText = getDemoResponse(assistant.id, message, context)
  if (demoText) {
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300))
    const parsed = parseArtifacts(demoText)
    return {
      text: parsed.cleanText,
      artifacts: parsed.artifacts,
      provider: 'demo',
      model: 'skids-demo-v1',
      latencyMs: Math.round(performance.now() - startTime),
    }
  }

  // This should never happen — all 12 assistants have demo responses
  return {
    text: `${assistant.name} — clinical protocol active. Configure API key for AI-powered responses:\n• Groq (free): groq.com → API Keys\n• Gemini (free): aistudio.google.com → API Key`,
    artifacts: [],
    provider: 'none',
    model: 'none',
    latencyMs: Math.round(performance.now() - startTime),
  }
}
// force-refresh 1774950936
