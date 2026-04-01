/**
 * SKIDS Regional Protocol Engine
 *
 * Protocol-driven, proactive PHR: knows what screenings, vaccines, and assessments
 * are due at every age — per regional clinical guidelines.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SUPPORTED PROTOCOLS
 * ═══════════════════════════════════════════════════════════════════
 *
 *  1. IAP (Indian Academy of Pediatrics) — India
 *     - IAP Immunization Schedule 2024
 *     - IAP Growth Monitoring Guidelines
 *     - IAP Vision & Hearing Screening Recommendations
 *     - RBSK (Rashtriya Bal Swasthya Karyakram) 4D framework
 *
 *  2. AAP (American Academy of Pediatrics) — USA
 *     - Bright Futures / AAP Periodicity Schedule 2024
 *     - AAP Vision Screening Policy Statement
 *     - AAP Developmental Surveillance & Screening (M-CHAT, ASQ)
 *     - USPTF Screening Recommendations
 *
 *  3. Gulf AP — GCC (Qatar, Saudi, UAE)
 *     - Qatar MoPH Well-Child Schedule
 *     - Saudi MOH Preschool Health Program
 *     - UAE School Health Programme
 *     - Gulf AP Consensus on Vitamin D, Obesity, Consanguinity screening
 *
 * ═══════════════════════════════════════════════════════════════════
 * PHILOSOPHY (from SKIDS Blog — skids.clinic/feed)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  - Systems-based, NOT siloed: a vision problem may manifest as "behavioral"
 *  - Signal over label: track change, not diagnose
 *  - Preventive framing: "20-year weather forecast" — catch it now, prevent it later
 *  - Parent competency focus: equip parents with tools, not anxiety
 *  - Physiological First: always rule out iron/sleep/vision/hearing before behavioral labels
 *  - Culturally grounded: regionally adapted, not copy-pasted Western norms
 *
 * ═══════════════════════════════════════════════════════════════════
 * ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════
 *
 *  getProtocol(region) → Protocol
 *  getScheduleForAge(protocol, ageMonths) → ScheduleItem[]
 *  getOverdueScreenings(protocol, ageMonths, completed) → OverdueItem[]
 *  getUpcomingScreenings(protocol, ageMonths, lookaheadMonths) → UpcomingItem[]
 *  getParentAssessmentTools(protocol, ageMonths) → ParentTool[]
 *  getProactiveAlerts(protocol, child) → Alert[]
 *  explainRecommendation(item) → Explanation
 */

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type Region = 'india' | 'usa' | 'gcc'
export type ProtocolAuthority = 'IAP' | 'AAP' | 'Gulf_AP' | 'WHO' | 'RBSK' | 'USPSTF' | 'Qatar_MoPH' | 'Saudi_MOH'

export type ScreeningDomain =
  | 'vision' | 'hearing' | 'dental' | 'growth' | 'nutrition'
  | 'development' | 'behavior' | 'speech_language' | 'cardiac'
  | 'musculoskeletal' | 'skin' | 'respiratory' | 'iron_anemia'
  | 'thyroid' | 'lead' | 'tuberculosis' | 'hiv' | 'autism'
  | 'emotional' | 'blood_pressure' | 'obesity' | 'vitamin_d'
  | 'lipids' | 'consanguinity' | 'immunization'

export interface ScheduleItem {
  /** Unique key for deduplication */
  key: string
  /** Human-readable name */
  name: string
  /** Which clinical domain */
  domain: ScreeningDomain
  /** Age range when this is due (months) */
  ageMinMonths: number
  ageMaxMonths: number
  /** Ideal age for this screening (months) */
  idealAgeMonths: number
  /** How often to repeat (months). null = one-time */
  repeatEveryMonths: number | null
  /** Source authority */
  authority: ProtocolAuthority
  /** Specific guideline citation */
  citation: string
  /** Priority: routine, important, critical */
  priority: 'routine' | 'important' | 'critical'
  /** What the parent sees */
  parentFriendlyName: string
  parentFriendlyDescription: string
  /** What the doctor sees */
  clinicalDescription: string
  /** Why this matters — explainability */
  rationale: string
  /** Systems-based connections (SKIDS philosophy) */
  systemConnections: string[]
  /** Is there a parent-level home tool for this? */
  parentToolAvailable: boolean
  /** Parent tool key (links to ParentAssessmentTool) */
  parentToolKey?: string
  /** SKIDS module that covers this (if any) */
  skidsModule?: string
}

export interface ParentAssessmentTool {
  key: string
  name: string
  domain: ScreeningDomain
  /** Age range where this tool is appropriate (months) */
  ageMinMonths: number
  ageMaxMonths: number
  /** Source authority */
  authority: ProtocolAuthority
  citation: string
  /** What it detects */
  detects: string[]
  /** Instructions for parent */
  instructions: string[]
  /** When to escalate — red flags */
  redFlags: string[]
  /** How it connects to SKIDS clinic visit */
  clinicConnection: string
  /** Systems-based interpretation help */
  systemsNote: string
}

export interface ProactiveAlert {
  type: 'due_now' | 'overdue' | 'upcoming' | 'gap' | 'systems_flag'
  urgency: 'info' | 'attention' | 'urgent'
  domain: ScreeningDomain
  title: string
  message: string
  /** Parent-facing action */
  parentAction: string
  /** Doctor-facing context */
  doctorContext: string
  /** Guideline source */
  citation: string
  /** Due date context */
  dueContext: string
  /** Systems connections — what else might be affected */
  systemConnections: string[]
}

export interface ChildContext {
  ageMonths: number
  gender: 'male' | 'female'
  region: Region
  completedScreenings: string[]   // keys of completed schedule items
  completedVaccines: string[]     // vaccine keys
  activeConditions: string[]      // condition names
  riskFactors: string[]           // e.g., 'consanguinity', 'preterm', 'family_history_autism'
}

// ═══════════════════════════════════════════════════════════════════
// IAP SCHEDULE (India)
// ═══════════════════════════════════════════════════════════════════

const IAP_SCHEDULE: ScheduleItem[] = [
  // ─── VISION ───
  {
    key: 'iap_vision_newborn',
    name: 'Newborn Eye Examination',
    domain: 'vision',
    ageMinMonths: 0, ageMaxMonths: 1, idealAgeMonths: 0,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Guidelines on Visual Screening in Children, 2023; Red reflex test at birth',
    priority: 'critical',
    parentFriendlyName: 'Newborn Eye Check',
    parentFriendlyDescription: 'Your baby\'s eyes are checked right after birth for the "red reflex" — a simple test to catch serious eye problems early.',
    clinicalDescription: 'Red reflex test bilateral. Rule out retinoblastoma, congenital cataract, PHPV.',
    rationale: 'Retinoblastoma is curable if caught in the first weeks. The red reflex test takes 30 seconds and saves lives.',
    systemConnections: ['Abnormal red reflex → urgent ophthalmology referral', 'Congenital cataract if untreated → permanent amblyopia'],
    parentToolAvailable: false,
    skidsModule: 'vision',
  },
  {
    key: 'iap_vision_3y',
    name: 'Preschool Vision Screening',
    domain: 'vision',
    ageMinMonths: 30, ageMaxMonths: 48, idealAgeMonths: 36,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Vision Screening 2023; Amblyopia detection before critical period closure at age 7',
    priority: 'critical',
    parentFriendlyName: 'First Vision Test (Age 3)',
    parentFriendlyDescription: 'At age 3, your child can do their first proper vision test. This is the #1 most important screening — amblyopia (lazy eye) is 95% treatable if caught now, but becomes permanent after age 7.',
    clinicalDescription: 'Instrument-based photoscreening (Spot/PlusOptix) or Lea symbols at 10 feet. Cover-uncover test. Check for strabismus, amblyopia risk factors.',
    rationale: 'Amblyopia affects 2-5% of children. The visual cortex has a critical plasticity window that closes by age 7-8. Treatment before age 5 has 95% success rate; after 7, it drops to <30%.',
    systemConnections: [
      'Untreated vision problems → reading difficulty → "learning disability" misdiagnosis',
      'Strabismus can be intermittent → parents may not notice',
      'Unilateral amblyopia causes no symptoms — child doesn\'t know they can\'t see',
    ],
    parentToolAvailable: true,
    parentToolKey: 'home_vision_3y',
    skidsModule: 'vision',
  },
  {
    key: 'iap_vision_5y',
    name: 'School-Entry Vision Screening',
    domain: 'vision',
    ageMinMonths: 54, ageMaxMonths: 72, idealAgeMonths: 60,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Vision Screening 2023; RBSK school health protocol',
    priority: 'critical',
    parentFriendlyName: 'Vision Check Before School',
    parentFriendlyDescription: 'Before your child starts school, a vision check ensures they can see the board and read comfortably. Many "slow learners" actually just can\'t see properly.',
    clinicalDescription: 'Snellen chart (6/6 line). Color vision (Ishihara). Cover test. Near-point testing for convergence insufficiency.',
    rationale: 'At school entry, demand on near vision increases dramatically. Convergence insufficiency causes headaches, avoidance of reading, and is easily missed.',
    systemConnections: [
      'Vision → reading ability → academic performance → self-esteem',
      'Color blindness affects 8% of boys — accommodation needed, not treatment',
      'Convergence insufficiency → "attention problem" at desk work',
    ],
    parentToolAvailable: true,
    parentToolKey: 'home_vision_5y',
    skidsModule: 'vision',
  },
  // ─── HEARING ───
  {
    key: 'iap_hearing_newborn',
    name: 'Newborn Hearing Screening (OAE/BERA)',
    domain: 'hearing',
    ageMinMonths: 0, ageMaxMonths: 1, idealAgeMonths: 0,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Position Paper on Universal Newborn Hearing Screening, 2021; WHO guidelines',
    priority: 'critical',
    parentFriendlyName: 'Newborn Hearing Test',
    parentFriendlyDescription: 'A painless hearing test done within days of birth. Babies who can\'t hear well need early help — the first 6 months are critical for speech development.',
    clinicalDescription: 'OAE (otoacoustic emissions) or ABR (auditory brainstem response). Bilateral. Refer threshold >35 dB.',
    rationale: 'Language development depends on hearing in the first 6 months. Late detection = permanent speech delay. UNHS has moved average detection from 24 months to <3 months.',
    systemConnections: [
      'Hearing loss → delayed speech → "behavioral issues" → social isolation',
      'Mild hearing loss is invisible — child compensates by lip-reading',
      'Glue ear (OME) is the most common cause of fluctuating hearing in toddlers',
    ],
    parentToolAvailable: false,
    skidsModule: 'hearing',
  },
  {
    key: 'iap_hearing_school',
    name: 'School-Age Hearing Screening',
    domain: 'hearing',
    ageMinMonths: 48, ageMaxMonths: 72, idealAgeMonths: 60,
    repeatEveryMonths: 24,
    authority: 'IAP',
    citation: 'IAP/RBSK school screening protocol; Pure tone at 1k, 2k, 4k Hz',
    priority: 'important',
    parentFriendlyName: 'Hearing Check at School',
    parentFriendlyDescription: 'Regular hearing checks ensure your child can hear the teacher clearly. Even mild hearing loss can make school difficult.',
    clinicalDescription: 'Pure tone audiometry at 1k, 2k, 4k Hz. Pass = ≤20 dB HL. Screen for acquired hearing loss, noise exposure.',
    rationale: 'Acquired hearing loss from OME, noise exposure, or infection is common. Children rarely complain — they assume everyone hears as they do.',
    systemConnections: [
      'Hearing loss in one ear → difficulty in noisy classrooms → "inattentive" label',
      'Chronic ear infections → hearing loss → speech articulation issues',
    ],
    parentToolAvailable: true,
    parentToolKey: 'home_hearing_check',
    skidsModule: 'hearing',
  },
  // ─── DEVELOPMENT ───
  {
    key: 'iap_dev_9m',
    name: 'Developmental Screening (9 months)',
    domain: 'development',
    ageMinMonths: 8, ageMaxMonths: 11, idealAgeMonths: 9,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Developmental Assessment 2020; WHO Motor Milestones Study',
    priority: 'important',
    parentFriendlyName: 'Development Check (9 months)',
    parentFriendlyDescription: 'At 9 months, we check if your baby is sitting, babbling, and responding to their name. Small delays are normal — but consistent delays need attention.',
    clinicalDescription: 'DASII or Trivandrum Development Screening Chart. Motor (sitting, crawling), language (babbling, responding to name), social (stranger anxiety, object permanence).',
    rationale: 'The 9-month window catches motor delays (cerebral palsy) and early social-communication red flags. India-specific: DASII is culturally validated.',
    systemConnections: [
      'Motor delay at 9 months → rule out neurological cause before "late bloomer"',
      'No babbling at 9 months → hearing screening essential',
    ],
    parentToolAvailable: true,
    parentToolKey: 'milestone_checklist_infant',
    skidsModule: 'neuro',
  },
  {
    key: 'iap_dev_18m',
    name: 'Developmental Screening (18 months)',
    domain: 'development',
    ageMinMonths: 16, ageMaxMonths: 20, idealAgeMonths: 18,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Developmental Assessment 2020; M-CHAT-R/F recommended at 18 months',
    priority: 'critical',
    parentFriendlyName: 'Development Check (18 months)',
    parentFriendlyDescription: 'The 18-month check is one of the most important. We look at walking, talking, pointing, and social engagement — early signs of autism can be identified now, when intervention is most effective.',
    clinicalDescription: 'M-CHAT-R/F screening. Motor (walking, climbing). Language (≥6 words, pointing). Social (joint attention, pretend play). Red flags: no pointing, no words, no response to name.',
    rationale: 'Autism can be reliably identified at 18 months. Early intervention (before age 3) leads to significantly better outcomes. M-CHAT-R/F sensitivity 85%, specificity 99% with follow-up interview.',
    systemConnections: [
      'No pointing at 18 months → autism screening AND hearing test',
      'Language delay → rule out hearing, iron deficiency, environmental deprivation',
      'Regression of any skill at any age → urgent evaluation',
    ],
    parentToolAvailable: true,
    parentToolKey: 'mchat_r',
    skidsModule: 'neuro',
  },
  {
    key: 'iap_dev_30m',
    name: 'Developmental Screening (30 months)',
    domain: 'development',
    ageMinMonths: 28, ageMaxMonths: 33, idealAgeMonths: 30,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Developmental Assessment 2020; Second autism screening recommended by AAP',
    priority: 'important',
    parentFriendlyName: 'Development Check (2.5 years)',
    parentFriendlyDescription: 'At 2.5 years, we check speech (2-3 word sentences), play skills, and social behavior. Some autism signs only appear now.',
    clinicalDescription: 'ASQ-3 + M-CHAT-R/F if not done at 18 months. Language (2-3 word phrases), motor (running, jumping), social (parallel play, empathy emerging).',
    rationale: 'Milder autism spectrum presentations may not be detectable at 18 months. The 30-month screening catches subtler cases, especially in girls.',
    systemConnections: [
      'Speech delay + good social skills → likely language-specific issue',
      'Speech delay + poor eye contact → autism screening escalation',
    ],
    parentToolAvailable: true,
    parentToolKey: 'milestone_checklist_toddler',
    skidsModule: 'neuro',
  },
  // ─── AUTISM-SPECIFIC ───
  {
    key: 'iap_autism_18m',
    name: 'M-CHAT-R Autism Screening',
    domain: 'autism',
    ageMinMonths: 16, ageMaxMonths: 30, idealAgeMonths: 18,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP + AAP joint recommendation; M-CHAT-R/F validated in Indian population (Srinath et al., 2019)',
    priority: 'critical',
    parentFriendlyName: 'Autism Screening Questionnaire',
    parentFriendlyDescription: 'A simple 20-question checklist you can complete yourself. It checks for early signs of autism — not a diagnosis, but tells us if deeper evaluation is needed.',
    clinicalDescription: 'M-CHAT-R/F: 20-item parent-report. Score ≥3 = medium risk → follow-up interview. Score ≥8 = high risk → direct referral.',
    rationale: 'Autism prevalence in India estimated at 1 in 100 (INCLEN study). Early identification + ABA/ESDM before age 3 changes the trajectory fundamentally.',
    systemConnections: [
      'Physiological First: rule out hearing loss before autism label',
      'Iron deficiency mimics inattention and social withdrawal',
      'Screen time >2 hrs/day in toddlers → speech delay that looks like autism',
    ],
    parentToolAvailable: true,
    parentToolKey: 'mchat_r',
    skidsModule: 'mchat',
  },
  // ─── GROWTH & NUTRITION ───
  {
    key: 'iap_growth_ongoing',
    name: 'Growth Monitoring (WHO Standards)',
    domain: 'growth',
    ageMinMonths: 0, ageMaxMonths: 216, idealAgeMonths: 0,
    repeatEveryMonths: 3,
    authority: 'IAP',
    citation: 'IAP Growth Chart Committee 2015; WHO Child Growth Standards',
    priority: 'important',
    parentFriendlyName: 'Height & Weight Check',
    parentFriendlyDescription: 'Regular height and weight tracking is your child\'s health compass. We plot on WHO charts — the trend matters more than any single number.',
    clinicalDescription: 'Weight, height/length, head circumference (<3y), BMI (>2y). Plot on IAP/WHO growth charts. Z-scores: WAZ, HAZ, WHZ, BAZ.',
    rationale: 'Growth velocity is the earliest sign of chronic disease, nutritional deficiency, or endocrine disorder. A crossing of >2 major centile lines requires investigation.',
    systemConnections: [
      'Stunting (low HAZ) → chronic undernutrition → cognitive impact',
      'Overweight + short stature → endocrine evaluation needed',
      'Head circumference crossing centiles → neuroimaging',
    ],
    parentToolAvailable: true,
    parentToolKey: 'growth_tracker',
    skidsModule: 'anthropometry',
  },
  {
    key: 'iap_iron_9m',
    name: 'Iron/Anemia Screening',
    domain: 'iron_anemia',
    ageMinMonths: 9, ageMaxMonths: 12, idealAgeMonths: 9,
    repeatEveryMonths: 12,
    authority: 'IAP',
    citation: 'IAP Iron Deficiency Anemia Guidelines 2019; NFHS-5 data: 67% Indian children 6-59m are anemic',
    priority: 'critical',
    parentFriendlyName: 'Anemia Check',
    parentFriendlyDescription: 'Iron deficiency is India\'s most common nutritional problem in children. It affects brain development, attention, and energy. A simple blood test or pallor check tells us.',
    clinicalDescription: 'Hemoglobin estimation. Clinical pallor assessment (conjunctival, palmar, nail bed). Serum ferritin if Hb <11 g/dL.',
    rationale: 'Iron deficiency in the first 1000 days causes irreversible cognitive harm. NFHS-5: 67% of Indian children 6-59 months are anemic. Even "mild" anemia (Hb 10-11) impairs attention and learning.',
    systemConnections: [
      'Iron deficiency → poor attention → "ADHD" misdiagnosis (Physiological First!)',
      'Iron deficiency → poor sleep → behavioral dysregulation',
      'Iron deficiency → delayed motor milestones',
      'Anemia + pica (eating mud/chalk) = pathognomonic',
    ],
    parentToolAvailable: true,
    parentToolKey: 'pallor_check',
    skidsModule: 'skin',
  },
  {
    key: 'iap_dental_1y',
    name: 'First Dental Visit',
    domain: 'dental',
    ageMinMonths: 12, ageMaxMonths: 18, idealAgeMonths: 12,
    repeatEveryMonths: 6,
    authority: 'IAP',
    citation: 'IAP + IDA recommendation; First dental visit by first birthday or first tooth eruption',
    priority: 'important',
    parentFriendlyName: 'First Dentist Visit',
    parentFriendlyDescription: 'Your child\'s first dental visit should happen by age 1 — even before all teeth are in. Early caries (cavities) in baby teeth affect adult teeth underneath.',
    clinicalDescription: 'Dental examination: caries risk assessment, fluoride varnish application, dietary counseling. Check for bottle caries, malocclusion.',
    rationale: 'Early childhood caries (ECC) affects 50% of Indian preschoolers. Bottle-feeding at night is the #1 risk factor. Baby tooth infections can damage developing permanent teeth.',
    systemConnections: [
      'Dental pain → poor nutrition → growth faltering',
      'Night bottle feeding → caries + obesity + poor sleep quality',
      'Mouth breathing (from adenoid hypertrophy) → dental malocclusion → sleep apnea',
    ],
    parentToolAvailable: true,
    parentToolKey: 'dental_home_check',
    skidsModule: 'dental',
  },
  // ─── EMOTIONAL / BEHAVIORAL ───
  {
    key: 'iap_emotional_4y',
    name: 'Emotional Baseline Assessment (SEBA)',
    domain: 'emotional',
    ageMinMonths: 42, ageMaxMonths: 54, idealAgeMonths: 48,
    repeatEveryMonths: 12,
    authority: 'IAP',
    citation: 'Based on ASQ:SE-2, SDQ, PSC frameworks; SKIDS SEBA adaptation',
    priority: 'important',
    parentFriendlyName: 'Emotional Health Check',
    parentFriendlyDescription: 'Just like we check height and weight, we check emotional development. This 5-minute questionnaire measures self-regulation, social skills, sleep quality, focus, and stress handling.',
    clinicalDescription: 'SEBA (SKIDS Emotional Baseline Assessment): 5 domains (self-regulation, social connection, sleep/recovery, focus/engagement, stress response). Physiological gate required before behavioral escalation.',
    rationale: 'Emotional dysregulation is the #1 reason for school referral. SKIDS philosophy: always rule out physiological causes (iron, sleep, vision, hearing, screen time) before any behavioral label.',
    systemConnections: [
      'Physiological First: iron, sleep, vision, hearing, thyroid, screen time',
      'Self-regulation issues + sleep problems → sleep is the intervention, not behavior therapy',
      'Focus issues + 2+ hrs screen time → screen reduction is the intervention',
      '"Behavioral" problems that resolve with iron supplementation = proof of systems thinking',
    ],
    parentToolAvailable: true,
    parentToolKey: 'seba_parent',
    skidsModule: 'behavioral',
  },
  // ─── BLOOD PRESSURE ───
  {
    key: 'iap_bp_3y',
    name: 'Blood Pressure Screening',
    domain: 'blood_pressure',
    ageMinMonths: 36, ageMaxMonths: 48, idealAgeMonths: 36,
    repeatEveryMonths: 12,
    authority: 'IAP',
    citation: 'IAP Hypertension Guidelines 2022; AAP CPG 2017 (≥3 years annually)',
    priority: 'routine',
    parentFriendlyName: 'Blood Pressure Check',
    parentFriendlyDescription: 'Blood pressure screening starts at age 3 and happens yearly. High BP in children is rare but important to catch — it\'s usually a sign of another condition.',
    clinicalDescription: 'Auscultatory or oscillometric BP. Appropriate cuff size. Compare to age/sex/height percentile tables. ≥90th = elevated, ≥95th = hypertension.',
    rationale: 'Childhood hypertension prevalence 2-5%. Secondary causes (renal, endocrine) more common than in adults. Early detection prevents end-organ damage.',
    systemConnections: [
      'Obesity → hypertension → need to address root cause (diet, activity)',
      'Renal scarring from UTIs → secondary hypertension',
    ],
    parentToolAvailable: false,
    skidsModule: 'cardio',
  },
  // ─── SPEECH & LANGUAGE ───
  {
    key: 'iap_speech_2y',
    name: 'Speech-Language Milestone Check',
    domain: 'speech_language',
    ageMinMonths: 22, ageMaxMonths: 26, idealAgeMonths: 24,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Developmental Assessment 2020; WHO GMCD milestone indicators',
    priority: 'important',
    parentFriendlyName: 'Speech Check (Age 2)',
    parentFriendlyDescription: 'By age 2, your child should be using 50+ words and starting to combine them ("want milk"). If they\'re not, we need to check hearing first, then assess further.',
    clinicalDescription: 'Expressive vocabulary ≥50 words by 24 months. Word combinations emerging. Receptive language: follows 2-step commands. Assess bilingual exposure (adjust expectations).',
    rationale: 'Late talkers at 2 years: 50% catch up ("late bloomers"), 50% don\'t. Key differentiator: receptive language. If they understand but don\'t speak → better prognosis. If both delayed → evaluate urgently.',
    systemConnections: [
      'Always hearing test before "speech delay" label',
      'Bilingual children may appear delayed on single-language testing',
      'Screen time >1 hr/day before age 2 → 3x risk of speech delay',
      'Iron deficiency → speech delay (Physiological First)',
    ],
    parentToolAvailable: true,
    parentToolKey: 'speech_milestone_check',
    skidsModule: 'neuro',
  },
  // ─── IMMUNIZATION CHECKS ───
  {
    key: 'iap_vaccine_review_1y',
    name: 'Immunization Review (12 months)',
    domain: 'immunization',
    ageMinMonths: 11, ageMaxMonths: 13, idealAgeMonths: 12,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Immunization Timetable 2024-2025',
    priority: 'critical',
    parentFriendlyName: 'Vaccine Review (1 year)',
    parentFriendlyDescription: 'At 1 year, we check if all vaccines are on track. Key vaccines due now: Measles-1, Hepatitis-A, Japanese Encephalitis (in endemic areas).',
    clinicalDescription: 'Review: BCG, OPV, IPV (3 doses), DTP (3 doses), Hep-B (3 doses), Hib, PCV, Rotavirus. Due: Measles-1, Hep-A, JE-1 (endemic). Catch-up if needed.',
    rationale: 'The 12-month vaccine visit has the highest dropout rate. Measles-1 is critical — measles kills more children globally than any other vaccine-preventable disease.',
    systemConnections: [
      'Missed vaccines = vulnerability window → proactive catch-up',
      'IAP optional vaccines (Typhoid, Varicella, Hep-A) are important — guide parents',
    ],
    parentToolAvailable: false,
    skidsModule: undefined,
  },
  {
    key: 'iap_vaccine_review_5y',
    name: 'Immunization Review (5 years / school entry)',
    domain: 'immunization',
    ageMinMonths: 54, ageMaxMonths: 72, idealAgeMonths: 60,
    repeatEveryMonths: null,
    authority: 'IAP',
    citation: 'IAP Immunization Timetable 2024-2025; School entry boosters',
    priority: 'critical',
    parentFriendlyName: 'Vaccine Review (5 years)',
    parentFriendlyDescription: 'Before school starts, your child needs booster doses for DTP and polio, plus catch-up on any missed vaccines. This is also the time for Typhoid vaccine if not given.',
    clinicalDescription: 'Due: DTP Booster-2, OPV Booster, IPV Booster. Review: MMR-2, Varicella-2, Typhoid. Catch-up: any missed doses.',
    rationale: 'School entry concentrates children → disease transmission risk. Booster doses ensure immunity from infant vaccines hasn\'t waned.',
    systemConnections: [
      'Complete vaccination + clean health card → school readiness',
    ],
    parentToolAvailable: false,
    skidsModule: undefined,
  },
]

// ═══════════════════════════════════════════════════════════════════
// AAP SCHEDULE (USA)
// ═══════════════════════════════════════════════════════════════════

const AAP_SCHEDULE: ScheduleItem[] = [
  // ─── VISION ───
  {
    key: 'aap_vision_instrument_12m',
    name: 'Instrument-Based Vision Screening',
    domain: 'vision',
    ageMinMonths: 12, ageMaxMonths: 36, idealAgeMonths: 12,
    repeatEveryMonths: 12,
    authority: 'AAP',
    citation: 'AAP Visual System Assessment Policy Statement 2016; Instrument screening from 12 months',
    priority: 'important',
    parentFriendlyName: 'Vision Screening (Instrument)',
    parentFriendlyDescription: 'From age 1, we can use special cameras to check your child\'s eyes for hidden problems — even before they can read letters.',
    clinicalDescription: 'Instrument-based photoscreening (Spot, PlusOptix). Detects amblyopia risk factors: anisometropia, strabismus, high refractive error, media opacity.',
    rationale: 'AAP recommends instrument-based screening starting at 12 months as it doesn\'t require child cooperation. Catches amblyopia risk factors 2 years earlier than chart-based screening.',
    systemConnections: [
      'Amblyopia treatment most effective before age 5',
      'Undetected refractive error → headaches → "school avoidance"',
    ],
    parentToolAvailable: false,
    skidsModule: 'vision',
  },
  {
    key: 'aap_vision_chart_4y',
    name: 'Visual Acuity Testing (Chart)',
    domain: 'vision',
    ageMinMonths: 36, ageMaxMonths: 60, idealAgeMonths: 48,
    repeatEveryMonths: 12,
    authority: 'AAP',
    citation: 'Bright Futures Periodicity Schedule 2024; HOTV or Lea symbols at age 4',
    priority: 'critical',
    parentFriendlyName: 'Eye Chart Test (Age 4+)',
    parentFriendlyDescription: 'From age 4, your child can read an eye chart with pictures or letters. This is the gold standard — if they can\'t see 20/40, we investigate.',
    clinicalDescription: 'HOTV or Lea symbols at 10 feet (age 3-5), Snellen at 20 feet (age 6+). Monocular testing essential. Refer if 20/40 or worse (age 3-5) or 20/30 or worse (age 6+).',
    rationale: 'The Bright Futures periodicity schedule mandates annual visual acuity screening from age 4. Chart-based screening has higher specificity than instrument-based.',
    systemConnections: [
      'Monocular testing is essential — bilateral 20/20 can mask unilateral amblyopia',
      'Convergence insufficiency → struggles with reading but passes distance chart',
    ],
    parentToolAvailable: true,
    parentToolKey: 'home_vision_5y',
    skidsModule: 'vision',
  },
  // ─── HEARING ───
  {
    key: 'aap_hearing_newborn',
    name: 'Universal Newborn Hearing Screening',
    domain: 'hearing',
    ageMinMonths: 0, ageMaxMonths: 1, idealAgeMonths: 0,
    repeatEveryMonths: null,
    authority: 'AAP',
    citation: 'AAP JCIH Position Statement 2019; 1-3-6 benchmarks (screen by 1m, dx by 3m, intervene by 6m)',
    priority: 'critical',
    parentFriendlyName: 'Newborn Hearing Test',
    parentFriendlyDescription: 'All newborns get a hearing test before leaving the hospital. If they don\'t pass, it doesn\'t mean they\'re deaf — but they need a retest within 3 months.',
    clinicalDescription: 'OAE or automated ABR. 1-3-6 benchmarks: screen by 1 month, diagnose by 3 months, intervene by 6 months.',
    rationale: 'JCIH 1-3-6 benchmarks are the standard. Children identified by 6 months and enrolled in early intervention achieve language skills commensurate with hearing peers by age 5.',
    systemConnections: [
      'Late-onset hearing loss exists — ongoing monitoring needed',
      'Risk factors: NICU >5 days, family history, CMV exposure',
    ],
    parentToolAvailable: false,
    skidsModule: 'hearing',
  },
  // ─── DEVELOPMENTAL / AUTISM ───
  {
    key: 'aap_dev_9m',
    name: 'Developmental Screening (ASQ-3)',
    domain: 'development',
    ageMinMonths: 8, ageMaxMonths: 11, idealAgeMonths: 9,
    repeatEveryMonths: null,
    authority: 'AAP',
    citation: 'Bright Futures Periodicity Schedule 2024; ASQ-3 at 9, 18, 30 months',
    priority: 'important',
    parentFriendlyName: 'Development Check (9 months)',
    parentFriendlyDescription: 'A parent-completed questionnaire about your baby\'s skills — sitting, grabbing, responding to sounds. Takes 10 minutes and gives us early warning of any delays.',
    clinicalDescription: 'ASQ-3 screening at 9 months. Five domains: communication, gross motor, fine motor, problem-solving, personal-social. Cut-offs validated for US population.',
    rationale: 'AAP mandates formal developmental screening (not just surveillance) at 9, 18, and 30 months. Surveillance alone misses 50% of developmental delays.',
    systemConnections: [
      'Motor delays at 9 months → early intervention before the 12-month window',
      'Parent-completed tool → empowers observation skills',
    ],
    parentToolAvailable: true,
    parentToolKey: 'milestone_checklist_infant',
    skidsModule: 'neuro',
  },
  {
    key: 'aap_autism_18m',
    name: 'M-CHAT-R/F Autism Screening',
    domain: 'autism',
    ageMinMonths: 16, ageMaxMonths: 30, idealAgeMonths: 18,
    repeatEveryMonths: null,
    authority: 'AAP',
    citation: 'AAP Autism Screening Policy 2020; M-CHAT-R/F at 18 and 24 months',
    priority: 'critical',
    parentFriendlyName: 'Autism Screening (18 months)',
    parentFriendlyDescription: 'A simple questionnaire about your child\'s social behavior — does she point? Look when you call? Share interest? Early autism identification changes lives.',
    clinicalDescription: 'M-CHAT-R/F at 18 and 24 months. Total score ≥3 → structured follow-up interview. Score ≥8 → direct referral. AAP also recommends screening at any age if concern.',
    rationale: 'AAP recommends autism-specific screening at 18 and 24 months — NOT just developmental screening. M-CHAT-R/F with follow-up has PPV of 48% (much higher than without follow-up).',
    systemConnections: [
      'Physiological First: hearing test before autism evaluation',
      'Regression at any age = red flag → urgent evaluation',
      'Girls present differently: may mask through social imitation',
    ],
    parentToolAvailable: true,
    parentToolKey: 'mchat_r',
    skidsModule: 'mchat',
  },
  // ─── LEAD ───
  {
    key: 'aap_lead_12m',
    name: 'Lead Screening',
    domain: 'lead',
    ageMinMonths: 12, ageMaxMonths: 24, idealAgeMonths: 12,
    repeatEveryMonths: null,
    authority: 'AAP',
    citation: 'AAP Lead Exposure Prevention Policy 2016; CDC recommendation at 12 and 24 months',
    priority: 'important',
    parentFriendlyName: 'Lead Level Check',
    parentFriendlyDescription: 'Lead exposure from old paint, water pipes, or soil damages the developing brain. A simple blood test at age 1 and 2 catches it before harm is done.',
    clinicalDescription: 'Blood lead level at 12 and 24 months (Medicaid-enrolled children mandatory). Risk assessment questionnaire for others. BLL ≥3.5 µg/dL = elevated (2021 CDC reference).',
    rationale: 'There is no safe level of lead. Even low levels (3.5-5 µg/dL) cause IQ reduction, attention problems, and behavioral issues. Environmental remediation is the intervention.',
    systemConnections: [
      'Lead exposure → attention deficit → "ADHD" (Physiological First!)',
      'Lead exposure + iron deficiency → synergistic harm (iron blocks lead absorption)',
      'Pica (eating non-food items) → check lead AND iron',
    ],
    parentToolAvailable: false,
    skidsModule: undefined,
  },
  // ─── LIPIDS ───
  {
    key: 'aap_lipids_9y',
    name: 'Universal Lipid Screening',
    domain: 'lipids',
    ageMinMonths: 108, ageMaxMonths: 132, idealAgeMonths: 120,
    repeatEveryMonths: null,
    authority: 'AAP',
    citation: 'NHLBI Expert Panel 2011; AAP endorsement; Universal screening at 9-11 years',
    priority: 'routine',
    parentFriendlyName: 'Cholesterol Check (Age 9-11)',
    parentFriendlyDescription: 'A fasting blood test for cholesterol. We screen all children between 9-11 years — familial hypercholesterolemia affects 1 in 250 people and is treatable if caught early.',
    clinicalDescription: 'Non-fasting non-HDL cholesterol OR fasting lipid panel. Familial hypercholesterolemia screening: total cholesterol ≥200 or LDL ≥130 = elevated.',
    rationale: 'Familial hypercholesterolemia (1 in 250) causes heart disease by age 30 if untreated. Universal screening at 9-11 years catches it regardless of family history accuracy.',
    systemConnections: [
      'Obesity + elevated lipids → metabolic syndrome screening',
      'Family history of early heart disease → screen earlier (age 2+)',
    ],
    parentToolAvailable: false,
    skidsModule: undefined,
  },
  // ─── OBESITY ───
  {
    key: 'aap_obesity_2y',
    name: 'BMI Screening (Obesity Prevention)',
    domain: 'obesity',
    ageMinMonths: 24, ageMaxMonths: 216, idealAgeMonths: 24,
    repeatEveryMonths: 12,
    authority: 'AAP',
    citation: 'AAP Clinical Practice Guideline for Obesity 2023; BMI percentile from age 2',
    priority: 'important',
    parentFriendlyName: 'BMI Check',
    parentFriendlyDescription: 'From age 2, we track BMI (body mass index) yearly. Early overweight is easier to address than established obesity — small changes now prevent big problems later.',
    clinicalDescription: 'BMI percentile from age 2. ≥85th = overweight, ≥95th = obesity, ≥120% of 95th = severe obesity. Assess: diet, physical activity, screen time, sleep.',
    rationale: 'Childhood obesity prevalence: 20% in the US. AAP 2023 CPG recommends intensive health behavior and lifestyle treatment. Obesity before age 6 → 50% adult obesity.',
    systemConnections: [
      'Obesity → sleep apnea → poor sleep → attention problems → behavioral issues',
      'Obesity + short stature → endocrine evaluation',
      'Screen time → sedentary behavior → obesity (bidirectional)',
    ],
    parentToolAvailable: true,
    parentToolKey: 'growth_tracker',
    skidsModule: 'anthropometry',
  },
]

// ═══════════════════════════════════════════════════════════════════
// GULF AP SCHEDULE (GCC — Qatar, Saudi, UAE)
// ═══════════════════════════════════════════════════════════════════

const GULF_AP_SCHEDULE: ScheduleItem[] = [
  // ─── VITAMIN D (GCC-specific priority) ───
  {
    key: 'gcc_vitd_12m',
    name: 'Vitamin D Screening',
    domain: 'vitamin_d',
    ageMinMonths: 12, ageMaxMonths: 18, idealAgeMonths: 12,
    repeatEveryMonths: 12,
    authority: 'Gulf_AP',
    citation: 'Gulf AP Consensus 2019; Qatar MoPH Vitamin D Protocol; 90% of Gulf children have insufficient Vitamin D',
    priority: 'critical',
    parentFriendlyName: 'Vitamin D Check',
    parentFriendlyDescription: 'Despite the sunshine, 90% of children in the Gulf have low Vitamin D — because of indoor lifestyles and clothing coverage. Low Vitamin D affects bones, immunity, and mood.',
    clinicalDescription: '25(OH)D level. Deficient: <20 ng/mL, Insufficient: 20-30 ng/mL, Sufficient: 30-100 ng/mL. Supplement per Gulf AP: 400 IU/day infants, 600-1000 IU/day children.',
    rationale: 'Paradox: Gulf nations have abundant sunshine but 90% Vitamin D deficiency in children. Causes: indoor lifestyle, limited sun exposure (heat, cultural), minimal dietary fortification. Affects bone mineralization, immunity, and even mood.',
    systemConnections: [
      'Vitamin D deficiency → rickets, delayed motor milestones',
      'Low Vitamin D + fatigue → often misattributed to behavioral issues',
      'Vitamin D + calcium + weight-bearing exercise = bone health triad',
    ],
    parentToolAvailable: false,
    skidsModule: undefined,
  },
  // ─── CONSANGUINITY SCREENING (GCC-specific) ───
  {
    key: 'gcc_consanguinity',
    name: 'Consanguinity Risk Assessment',
    domain: 'consanguinity',
    ageMinMonths: 0, ageMaxMonths: 1, idealAgeMonths: 0,
    repeatEveryMonths: null,
    authority: 'Gulf_AP',
    citation: 'Gulf AP Genetic Screening Consensus 2020; Qatar Premarital Screening Program',
    priority: 'critical',
    parentFriendlyName: 'Genetic Risk Check',
    parentFriendlyDescription: 'In the Gulf, consanguineous marriages are common. A simple family history review helps us know which genetic screenings to prioritize for your child.',
    clinicalDescription: 'Family history: consanguinity, genetic conditions. Targeted screening: sickle cell, thalassemia, G6PD, hearing loss genes (GJB2). Newborn metabolic screening panel.',
    rationale: 'Consanguinity rate: 25-60% in GCC countries. Autosomal recessive conditions 2-8x more common. Early identification → genetic counseling, targeted surveillance, and family planning support.',
    systemConnections: [
      'Consanguinity → higher risk of hearing loss, metabolic disorders, hemoglobinopathies',
      'G6PD deficiency → avoid certain medications and fava beans',
      'Sickle cell trait → important for anesthesia planning',
    ],
    parentToolAvailable: false,
    skidsModule: undefined,
  },
  // ─── OBESITY (GCC priority) ───
  {
    key: 'gcc_obesity_3y',
    name: 'Obesity Screening (GCC Protocol)',
    domain: 'obesity',
    ageMinMonths: 36, ageMaxMonths: 216, idealAgeMonths: 36,
    repeatEveryMonths: 6,
    authority: 'Gulf_AP',
    citation: 'Qatar Vision 2030 NCD Prevention; Saudi MOH Childhood Obesity Program; GCC obesity prevalence 15-25%',
    priority: 'critical',
    parentFriendlyName: 'Obesity Prevention Check',
    parentFriendlyDescription: '1 in 5 Gulf children is overweight. This 6-monthly check includes BMI, waist circumference, and a review of diet and activity — catching the trend early is everything.',
    clinicalDescription: 'BMI + waist circumference (from age 3). Metabolic risk: fasting glucose, insulin resistance markers if BMI >95th. Diet review: sugar-sweetened beverages, fast food frequency.',
    rationale: 'GCC childhood obesity: 15-25% prevalence, driven by sedentary indoor lifestyle, high sugar-sweetened beverage consumption, and fast-food culture. Annual NCD cost: $50 billion to GCC economy.',
    systemConnections: [
      'Obesity → type 2 diabetes in adolescence → cardiovascular risk',
      'Obesity → sleep apnea → behavioral changes, poor school performance',
      'Gulf-specific: extreme heat → indoor lifestyles → reduced activity',
      'Cultural sensitivity: approach weight as health, not appearance',
    ],
    parentToolAvailable: true,
    parentToolKey: 'growth_tracker',
    skidsModule: 'anthropometry',
  },
  // ─── VISION (same urgency, Gulf context) ───
  {
    key: 'gcc_vision_3y',
    name: 'Preschool Vision Screening',
    domain: 'vision',
    ageMinMonths: 36, ageMaxMonths: 48, idealAgeMonths: 36,
    repeatEveryMonths: null,
    authority: 'Qatar_MoPH',
    citation: 'Qatar MoPH Well-Child Schedule; 30% of Qatari schoolchildren have undiagnosed vision/hearing issues',
    priority: 'critical',
    parentFriendlyName: 'Vision Test (Age 3)',
    parentFriendlyDescription: '30% of Gulf schoolchildren have undiagnosed vision issues. A simple screening at age 3 catches problems while treatment is still highly effective.',
    clinicalDescription: 'Photoscreening or Lea symbols. Cover-uncover test. Autorefraction if available.',
    rationale: 'Qatar data: 30% of schoolchildren have undiagnosed vision or hearing issues. Early detection and correction improves academic outcomes.',
    systemConnections: [
      'High myopia prevalence in Gulf → increasing due to screen time + indoor lifestyle',
      'Vision correction → immediate academic improvement in 80% of cases',
    ],
    parentToolAvailable: true,
    parentToolKey: 'home_vision_3y',
    skidsModule: 'vision',
  },
  // ─── HEARING (Gulf context) ───
  {
    key: 'gcc_hearing_newborn',
    name: 'Newborn Hearing Screening',
    domain: 'hearing',
    ageMinMonths: 0, ageMaxMonths: 1, idealAgeMonths: 0,
    repeatEveryMonths: null,
    authority: 'Gulf_AP',
    citation: 'Gulf AP Newborn Screening Consensus; Higher prevalence of genetic hearing loss in GCC due to consanguinity',
    priority: 'critical',
    parentFriendlyName: 'Newborn Hearing Test',
    parentFriendlyDescription: 'Hearing screening is essential at birth. In the Gulf, genetic hearing loss is more common — early detection means your child can get hearing aids or implants before speech development is affected.',
    clinicalDescription: 'OAE + ABR. Higher index of suspicion for genetic sensorineural hearing loss (GJB2 mutations). GJB2 genetic testing if family history or consanguinity.',
    rationale: 'Genetic hearing loss prevalence in GCC is 2-3x global average due to high consanguinity rates. GJB2 (connexin 26) mutations are the most common cause.',
    systemConnections: [
      'Consanguinity → genetic hearing loss → early cochlear implant candidacy',
      'Family history of hearing loss → ongoing audiological monitoring even if newborn passes',
    ],
    parentToolAvailable: false,
    skidsModule: 'hearing',
  },
  // ─── DEVELOPMENTAL (Gulf context) ───
  {
    key: 'gcc_dev_18m',
    name: 'Developmental Screening (18 months)',
    domain: 'development',
    ageMinMonths: 16, ageMaxMonths: 20, idealAgeMonths: 18,
    repeatEveryMonths: null,
    authority: 'Gulf_AP',
    citation: 'Qatar MoPH Well-Child Schedule; Gulf AP developmental screening consensus',
    priority: 'critical',
    parentFriendlyName: 'Development Check (18 months)',
    parentFriendlyDescription: 'At 18 months, we check walking, talking, pointing, and social engagement. This is when early autism signs can be identified — and early intervention makes the biggest difference.',
    clinicalDescription: 'ASQ-3 + M-CHAT-R/F (Arabic validated). Account for bilingual development (Arabic + English common in GCC). Cultural adaptation of social items.',
    rationale: 'Autism prevalence in GCC: estimated 1-2%. Cultural barriers to diagnosis include: late presentation, stigma, multilingual confounding. Arabic-validated screening tools are essential.',
    systemConnections: [
      'Bilingual children: assess in both languages combined',
      'Cultural norms: eye contact expectations vary → adapt interpretation',
      'Domestic helper exposure → language development patterns may differ',
    ],
    parentToolAvailable: true,
    parentToolKey: 'mchat_r',
    skidsModule: 'mchat',
  },
  // ─── IRON (Gulf context) ───
  {
    key: 'gcc_iron_12m',
    name: 'Iron/Anemia Screening',
    domain: 'iron_anemia',
    ageMinMonths: 9, ageMaxMonths: 15, idealAgeMonths: 12,
    repeatEveryMonths: 12,
    authority: 'Gulf_AP',
    citation: 'Gulf AP Iron Deficiency Consensus; Saudi MOH anemia screening protocol',
    priority: 'important',
    parentFriendlyName: 'Anemia Check',
    parentFriendlyDescription: 'Iron deficiency is common in Gulf children despite good food availability — due to high dairy and low iron-rich food intake. We check yearly.',
    clinicalDescription: 'CBC + serum ferritin. Account for hemoglobinopathies (sickle cell trait, thalassemia minor) which affect MCV but not ferritin.',
    rationale: 'Iron deficiency in GCC: 20-40% of preschoolers. Often masked by hemoglobinopathy carrier status. Serum ferritin is the gold standard — not just Hb.',
    systemConnections: [
      'Iron deficiency + thalassemia trait → confusing blood picture → need ferritin',
      'Gulf diet: high dairy, low meat in young children → iron deficiency risk',
    ],
    parentToolAvailable: true,
    parentToolKey: 'pallor_check',
    skidsModule: 'skin',
  },
]

// ═══════════════════════════════════════════════════════════════════
// PARENT ASSESSMENT TOOLS
// ═══════════════════════════════════════════════════════════════════

export const PARENT_TOOLS: ParentAssessmentTool[] = [
  {
    key: 'home_vision_3y',
    name: 'Home Vision Check (3-5 years)',
    domain: 'vision',
    ageMinMonths: 30, ageMaxMonths: 72,
    authority: 'AAP',
    citation: 'AAP Bright Futures; Lea symbols home screening adaptation',
    detects: ['Possible amblyopia', 'Significant refractive error', 'Strabismus (eye turn)'],
    instructions: [
      'Print the SKIDS Lea symbols card (available in app) or use the screen version',
      'Seat your child 10 feet (3 meters) from the card in good lighting',
      'Cover one eye completely with a patch (NOT their hand — they peek)',
      'Ask them to name or match each symbol, starting from the largest',
      'Record the smallest line they can read correctly for EACH eye',
      'Watch carefully: does the child resist covering one eye? That\'s a red flag',
    ],
    redFlags: [
      'Child resists covering one eye (suggests that eye is the "good" eye)',
      '2+ line difference between eyes',
      'Can\'t read the 20/40 line with either eye',
      'Head tilt or squinting during the test',
      'One eye turns in or out (even occasionally)',
    ],
    clinicConnection: 'Results feed into SKIDS Vision module. If any red flags, auto-triggers urgent ophthalmology referral at next clinic visit.',
    systemsNote: 'Vision problems often present as "behavioral": headaches, avoidance of reading/homework, clumsiness, "inattention" at school. Always check vision before assuming behavioral or learning problems.',
  },
  {
    key: 'home_vision_5y',
    name: 'Home Vision Check (5+ years)',
    domain: 'vision',
    ageMinMonths: 54, ageMaxMonths: 216,
    authority: 'AAP',
    citation: 'Snellen chart home adaptation; AAP Bright Futures',
    detects: ['Myopia', 'Astigmatism', 'Amblyopia', 'Convergence issues'],
    instructions: [
      'Use the SKIDS Snellen chart (printed or screen) at 20 feet (6 meters)',
      'Test each eye separately — use an opaque cover (not hand)',
      'Ask child to read smallest line possible',
      'Also test near vision: can they read a book at normal distance comfortably?',
      'Ask: do you get headaches when reading? Does text blur after 10 minutes?',
    ],
    redFlags: [
      'Can\'t read 20/30 line with either eye',
      'More than 1 line difference between eyes',
      'Headaches with reading or screen use',
      'Holds book very close (<10 inches) or very far',
      'Squints or tilts head',
    ],
    clinicConnection: 'Results integrated into PHR vision timeline. Triggers automated comparison with previous screening results.',
    systemsNote: 'After age 6, myopia progression is the main concern. Every hour of outdoor activity reduces myopia progression. Screen time + near work + indoor lifestyle = myopia epidemic.',
  },
  {
    key: 'home_hearing_check',
    name: 'Home Hearing Awareness Check',
    domain: 'hearing',
    ageMinMonths: 36, ageMaxMonths: 144,
    authority: 'AAP',
    citation: 'AAP Hearing Surveillance; Parental questionnaire adaptation',
    detects: ['Mild-moderate hearing loss', 'Unilateral hearing loss', 'Fluctuating hearing (glue ear)'],
    instructions: [
      'Stand behind your child (so they can\'t lip-read) in a quiet room',
      'Whisper their name from 3 feet away — do they respond? Try both sides',
      'Turn on the TV at low volume — can they follow from across the room?',
      'Ask: "Does your child say \'what?\' more than other children?"',
      'Notice: do they turn one ear toward sounds? (suggests unilateral loss)',
      'In noisy environments (restaurant, playground): can they follow conversation?',
    ],
    redFlags: [
      'Doesn\'t respond to whisper from 3 feet',
      'Turns TV up louder than other family members need',
      'Frequent "what?" or "huh?"',
      'Consistently turns one ear toward sound source',
      'Speech articulation problems (unclear speech)',
      'School teacher reports inattention (especially in noisy classroom)',
    ],
    clinicConnection: 'Triggers formal audiometry at next clinic visit. If chronic OME suspected, ENT referral pathway activated.',
    systemsNote: 'Mild hearing loss is invisible. Children don\'t complain — they assume everyone hears like them. A child with 25 dB loss (mild) misses 25-50% of classroom instruction. Check hearing before labeling "inattentive."',
  },
  {
    key: 'milestone_checklist_infant',
    name: 'Developmental Milestone Tracker (0-12 months)',
    domain: 'development',
    ageMinMonths: 0, ageMaxMonths: 12,
    authority: 'WHO',
    citation: 'WHO Motor Development Study; CDC milestone checklist; ASQ-3 adaptation',
    detects: ['Motor delay', 'Social-communication delay', 'Sensory processing issues'],
    instructions: [
      'Use the SKIDS milestone tracker in the app — it shows age-appropriate milestones',
      'Check off milestones as your baby achieves them',
      'Don\'t worry about exact timing — there\'s a normal range',
      'Focus on the ORDER of milestones more than exact age',
      'Record any concerns or observations in the journal',
      'Share the tracker with your pediatrician at every visit',
    ],
    redFlags: [
      'No social smile by 2 months',
      'Not reaching for objects by 5 months',
      'Not sitting by 9 months',
      'No babbling by 9 months',
      'Doesn\'t respond to name by 9 months',
      'Loss of any previously achieved milestone at any age',
    ],
    clinicConnection: 'Milestone data flows directly into PHR. Delays trigger automated developmental screening recommendations. SKIDS AI correlates milestone patterns with screening results.',
    systemsNote: 'Milestones are windows, not deadlines. A baby who walks at 15 months is just as normal as one who walks at 10 months. What matters: the pattern across ALL domains and whether there\'s REGRESSION.',
  },
  {
    key: 'milestone_checklist_toddler',
    name: 'Developmental Milestone Tracker (1-3 years)',
    domain: 'development',
    ageMinMonths: 12, ageMaxMonths: 36,
    authority: 'WHO',
    citation: 'WHO GMCD; CDC "Learn the Signs, Act Early"; ASQ-3',
    detects: ['Language delay', 'Social delay (autism risk)', 'Motor delay', 'Behavioral patterns'],
    instructions: [
      'Track language milestones: first words (12m), word combinations (18-24m), sentences (24-36m)',
      'Watch for pointing (12m), pretend play (18m), parallel play with peers (24m)',
      'Note: bilingual children may have combined vocabulary across both languages',
      'Record new words weekly — vocabulary should explode between 18-24 months',
      'Play interactive games: peekaboo, pat-a-cake, imitation games — note social reciprocity',
    ],
    redFlags: [
      'No words by 16 months',
      'No 2-word phrases by 24 months',
      'No pointing or gestures by 14 months',
      'No pretend play by 18 months',
      'Doesn\'t follow simple instructions by 18 months',
      'Loss of words or social skills at any point (REGRESSION = urgent)',
    ],
    clinicConnection: 'Feeds M-CHAT-R/F screening. Automatically flags for developmental pediatrician if multiple red flags detected.',
    systemsNote: 'Before labeling "speech delay" → check hearing. Before labeling "behavioral" → check iron, sleep, screen time. The child\'s behavior is always a signal, not a diagnosis.',
  },
  {
    key: 'mchat_r',
    name: 'M-CHAT-R Autism Screening',
    domain: 'autism',
    ageMinMonths: 16, ageMaxMonths: 30,
    authority: 'AAP',
    citation: 'Robins et al. 2014; Validated in multiple populations including Indian and Arabic',
    detects: ['Autism spectrum disorder risk', 'Social communication delay', 'Restricted interests'],
    instructions: [
      'Complete the 20-question M-CHAT-R in the SKIDS app',
      'Answer based on what your child USUALLY does (not on their best day)',
      'Questions focus on: joint attention, social referencing, response to name, pointing, eye contact',
      'Takes approximately 5 minutes',
      'If score is 3-7 (medium risk), a follow-up interview will be offered',
      'If score is 8+ (high risk), immediate referral recommended',
    ],
    redFlags: [
      'Score ≥3 on M-CHAT-R → follow-up interview needed',
      'Score ≥8 → direct referral to developmental specialist',
      'Concerns about eye contact, pointing, or social engagement even if score is low',
      'Regression of any social or language skills',
    ],
    clinicConnection: 'Score is integrated into developmental assessment module. High-risk automatically triggers referral pathway in SKIDS Clinic console.',
    systemsNote: 'M-CHAT is a SCREENING tool, not a diagnosis. Positive screen → comprehensive evaluation. Remember Physiological First: rule out hearing loss, iron deficiency, and severe sleep deprivation before concluding autism.',
  },
  {
    key: 'seba_parent',
    name: 'SEBA Emotional Baseline Assessment',
    domain: 'emotional',
    ageMinMonths: 36, ageMaxMonths: 216,
    authority: 'IAP',
    citation: 'SKIDS SEBA framework; based on ASQ:SE-2, SDQ, PSC, BRIEF-2',
    detects: ['Emotional dysregulation', 'Social difficulties', 'Sleep-behavior link', 'Attention concerns', 'Anxiety/stress patterns'],
    instructions: [
      'Complete the SEBA questionnaire in the app (5 domains, ~8 questions each)',
      'Answer about your child\'s behavior over the PAST 2 WEEKS',
      'Domains: Self-regulation, Social connection, Sleep & recovery, Focus & engagement, Stress response',
      'Be honest — there are no "wrong" answers. This tracks CHANGE over time.',
      'Repeat every 6-12 months to track your child\'s emotional growth trajectory',
    ],
    redFlags: [
      'Any domain in "red" zone',
      'Decline from previous SEBA score (delta tracking)',
      'Sleep domain red + Focus domain red → urgent physiological check',
      'Self-regulation red + recent life change → environmental assessment needed',
    ],
    clinicConnection: 'SEBA scores appear in doctor cockpit PHR summary. Physiological Gate is enforced: if iron/sleep/vision/hearing not cleared, behavioral escalation is blocked.',
    systemsNote: 'SEBA is NOT a behavioral diagnosis. It\'s a weather station — tracking emotional climate over time. A "red" domain means "investigate the root cause," NOT "label the child." Always: Physiological First.',
  },
  {
    key: 'growth_tracker',
    name: 'Growth Tracking (Height & Weight)',
    domain: 'growth',
    ageMinMonths: 0, ageMaxMonths: 216,
    authority: 'WHO',
    citation: 'WHO Child Growth Standards; IAP Growth Charts 2015',
    detects: ['Growth faltering', 'Obesity/overweight', 'Endocrine disorders', 'Nutritional deficiency'],
    instructions: [
      'Measure height: child standing straight against wall, heels touching wall, look straight ahead',
      'Measure weight: light clothing, no shoes, same scale each time',
      'Record in SKIDS app — it auto-plots on WHO/IAP growth charts',
      'Frequency: monthly (0-1y), quarterly (1-5y), 6-monthly (5y+)',
      'Look at the TREND, not individual points — one reading means nothing',
    ],
    redFlags: [
      'Crossing >2 centile lines downward (growth faltering)',
      'Crossing >2 centile lines upward (rapid weight gain)',
      'BMI >85th percentile (overweight)',
      'Height declining but weight increasing (endocrine flag)',
      'Head circumference crossing centiles (neurological flag, <3y)',
    ],
    clinicConnection: 'Growth data auto-generates WHO z-scores displayed in doctor cockpit. Trend analysis across visits powers Health Score growth component (30% weight).',
    systemsNote: 'Growth is the best single indicator of overall child health. A child who is growing well is almost certainly healthy. Conversely, any unexplained growth deviation → investigate systemically.',
  },
  {
    key: 'pallor_check',
    name: 'Home Pallor Assessment',
    domain: 'iron_anemia',
    ageMinMonths: 6, ageMaxMonths: 216,
    authority: 'IAP',
    citation: 'IAP Iron Deficiency Guidelines; WHO IMCI pallor assessment protocol',
    detects: ['Anemia', 'Iron deficiency', 'Chronic disease indicators'],
    instructions: [
      'In natural daylight (not tube light), check three areas:',
      '1. Lower inner eyelid: gently pull down — should be pink/red, not pale',
      '2. Palms: compare with your own — child\'s palms should have pink creases',
      '3. Nail beds: press and release — should pink up in <2 seconds',
      'Also note: does your child eat mud, chalk, or ice? (pica = iron deficiency sign)',
      'Check energy levels: unusual tiredness, not wanting to play, breathless with activity',
    ],
    redFlags: [
      'Pale inner eyelids (conjunctival pallor)',
      'Pale palm creases',
      'Slow capillary refill (>2 seconds) in nail beds',
      'Pica (eating non-food items: mud, chalk, ice, paper)',
      'Unusual fatigue, reduced play activity',
      'Breathless during normal play',
    ],
    clinicConnection: 'SKIDS Skin module includes AI pallor detection from conjunctival photograph. Home check results compared with AI assessment for longitudinal tracking.',
    systemsNote: 'Iron deficiency is the great mimic. It causes: fatigue → "lazy child," inattention → "ADHD," sleep disturbance → "behavioral," delayed milestones → "slow developer." Always check iron before any behavioral label. Physiological First.',
  },
  {
    key: 'dental_home_check',
    name: 'Home Dental Assessment',
    domain: 'dental',
    ageMinMonths: 12, ageMaxMonths: 216,
    authority: 'IAP',
    citation: 'IDA + IAP joint guidelines; WHO oral health survey adaptation',
    detects: ['Early caries', 'Dental plaque', 'Malocclusion', 'Mouth breathing'],
    instructions: [
      'With good lighting, look at all your child\'s teeth (front AND back)',
      'Look for: white spots on teeth (early caries), brown/black spots, broken teeth',
      'Check gums: should be pink, not red or puffy',
      'Count teeth: by 2 years should have ~20 baby teeth',
      'Watch for mouth breathing: open mouth at rest, dry lips, snoring at night',
      'Check: does your child use a bottle at night? (stop by age 1 to prevent bottle caries)',
    ],
    redFlags: [
      'White or brown spots on any teeth',
      'Swollen or bleeding gums',
      'Persistent mouth breathing',
      'Snoring regularly at night',
      'Pain or sensitivity when eating',
      'Child refuses to brush due to pain',
    ],
    clinicConnection: 'SKIDS Dental module uses AI image analysis for caries risk. Home observations combined with clinical findings for dmft scoring.',
    systemsNote: 'Oral health connects to: nutrition (can\'t eat well with painful teeth → growth faltering), sleep (adenoid hypertrophy → mouth breathing → poor sleep → behavioral issues), and self-esteem (visible dental problems → social withdrawal).',
  },
  {
    key: 'speech_milestone_check',
    name: 'Speech & Language Home Check',
    domain: 'speech_language',
    ageMinMonths: 12, ageMaxMonths: 72,
    authority: 'AAP',
    citation: 'AAP Speech-Language Milestones; CDC milestone tracker',
    detects: ['Expressive language delay', 'Receptive language delay', 'Articulation issues', 'Fluency issues (stuttering)'],
    instructions: [
      'Track your child\'s vocabulary: how many words do they use? (by 2y: ~50 words)',
      'Are they combining words? (by 2y: "want milk," "daddy go")',
      'Can they follow instructions? "Bring me the red ball" — tests understanding',
      'Can strangers understand them? (by 3y: 75% intelligible to strangers)',
      'Are they stuttering? (common at 2-3y, usually transient. Flag if >6 months)',
      'For bilingual children: count words in ALL languages combined',
    ],
    redFlags: [
      'No words by 16 months',
      'No word combinations by 24 months',
      'Can\'t follow simple instructions by 18 months (receptive delay)',
      'Strangers can\'t understand >50% by age 3',
      'Stuttering lasting >6 months',
      'Voice quality: persistent hoarseness or nasal speech',
    ],
    clinicConnection: 'Language milestones feed into SKIDS NeuroDev module. Combined with hearing data for comprehensive speech-language assessment.',
    systemsNote: 'Speech delay is a SYMPTOM, not a diagnosis. Differential: hearing loss (#1), autism, environmental deprivation, iron deficiency, intellectual disability. Always: hearing test first. Then: assess social communication. Context: bilingual children may appear delayed if tested in one language only.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// ENGINE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/** Get the full schedule for a region */
export function getProtocolSchedule(region: Region): ScheduleItem[] {
  switch (region) {
    case 'india': return IAP_SCHEDULE
    case 'usa': return AAP_SCHEDULE
    case 'gcc': return GULF_AP_SCHEDULE
    default: return IAP_SCHEDULE
  }
}

/** Get all protocols combined (for multi-region reference) */
export function getAllProtocols(): Record<Region, ScheduleItem[]> {
  return {
    india: IAP_SCHEDULE,
    usa: AAP_SCHEDULE,
    gcc: GULF_AP_SCHEDULE,
  }
}

/** Get schedule items due for a child's current age */
export function getScheduleForAge(region: Region, ageMonths: number): ScheduleItem[] {
  const schedule = getProtocolSchedule(region)
  return schedule.filter(item => {
    if (item.repeatEveryMonths) {
      // Recurring: due if age is within range and aligned to repeat cycle
      return ageMonths >= item.ageMinMonths && ageMonths <= item.ageMaxMonths
    }
    // One-time: due if age is within window
    return ageMonths >= item.ageMinMonths && ageMonths <= item.ageMaxMonths
  })
}

/** Get screenings that are overdue (should have been done but weren't) */
export function getOverdueScreenings(
  region: Region,
  ageMonths: number,
  completedKeys: string[]
): Array<ScheduleItem & { overdueByMonths: number }> {
  const schedule = getProtocolSchedule(region)
  const overdue: Array<ScheduleItem & { overdueByMonths: number }> = []

  for (const item of schedule) {
    // One-time items: overdue if we're past the max age and it wasn't done
    if (!item.repeatEveryMonths) {
      if (ageMonths > item.ageMaxMonths && !completedKeys.includes(item.key)) {
        overdue.push({
          ...item,
          overdueByMonths: ageMonths - item.ageMaxMonths,
        })
      }
    } else {
      // Recurring items: more complex — check if last completion was >repeatEvery ago
      // For simplicity, flag if not in completed list and within age range
      if (ageMonths >= item.ageMinMonths && !completedKeys.includes(item.key)) {
        overdue.push({
          ...item,
          overdueByMonths: Math.max(0, ageMonths - item.idealAgeMonths),
        })
      }
    }
  }

  return overdue.sort((a, b) => {
    // Sort by priority, then by how overdue
    const priorityOrder = { critical: 0, important: 1, routine: 2 }
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return b.overdueByMonths - a.overdueByMonths
  })
}

/** Get upcoming screenings in the next N months */
export function getUpcomingScreenings(
  region: Region,
  ageMonths: number,
  lookaheadMonths: number = 6
): ScheduleItem[] {
  const schedule = getProtocolSchedule(region)
  const futureAge = ageMonths + lookaheadMonths

  return schedule.filter(item => {
    // Not yet due but will be within the lookahead window
    return item.idealAgeMonths > ageMonths && item.idealAgeMonths <= futureAge
  }).sort((a, b) => a.idealAgeMonths - b.idealAgeMonths)
}

/** Get parent assessment tools appropriate for a child's age */
export function getParentToolsForAge(ageMonths: number): ParentAssessmentTool[] {
  return PARENT_TOOLS.filter(
    tool => ageMonths >= tool.ageMinMonths && ageMonths <= tool.ageMaxMonths
  )
}

/** Get a specific parent tool by key */
export function getParentTool(key: string): ParentAssessmentTool | undefined {
  return PARENT_TOOLS.find(t => t.key === key)
}

/** Generate proactive alerts for a child based on their record */
export function getProactiveAlerts(child: ChildContext): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = []
  const schedule = getProtocolSchedule(child.region)

  for (const item of schedule) {
    // ─── OVERDUE ───
    if (!item.repeatEveryMonths && child.ageMonths > item.ageMaxMonths && !child.completedScreenings.includes(item.key)) {
      const overdueBy = child.ageMonths - item.ageMaxMonths
      alerts.push({
        type: 'overdue',
        urgency: item.priority === 'critical' ? 'urgent' : 'attention',
        domain: item.domain,
        title: `Overdue: ${item.parentFriendlyName}`,
        message: item.parentFriendlyDescription,
        parentAction: `Schedule ${item.parentFriendlyName} as soon as possible. ${overdueBy > 6 ? 'This is significantly overdue.' : ''}`,
        doctorContext: `${item.clinicalDescription} Overdue by ${overdueBy} months. ${item.rationale}`,
        citation: item.citation,
        dueContext: `Was due at ${item.idealAgeMonths} months (${Math.floor(item.idealAgeMonths / 12)}y ${item.idealAgeMonths % 12}m). Now ${overdueBy} months overdue.`,
        systemConnections: item.systemConnections,
      })
    }

    // ─── DUE NOW ───
    if (child.ageMonths >= item.ageMinMonths && child.ageMonths <= item.ageMaxMonths && !child.completedScreenings.includes(item.key)) {
      alerts.push({
        type: 'due_now',
        urgency: item.priority === 'critical' ? 'attention' : 'info',
        domain: item.domain,
        title: `Due now: ${item.parentFriendlyName}`,
        message: item.parentFriendlyDescription,
        parentAction: `Your child is at the right age for ${item.parentFriendlyName}. Schedule at your next visit.`,
        doctorContext: item.clinicalDescription,
        citation: item.citation,
        dueContext: `Due window: ${item.ageMinMonths}-${item.ageMaxMonths} months. Ideal age: ${item.idealAgeMonths} months.`,
        systemConnections: item.systemConnections,
      })
    }

    // ─── UPCOMING (next 6 months) ───
    if (item.idealAgeMonths > child.ageMonths && item.idealAgeMonths <= child.ageMonths + 6) {
      alerts.push({
        type: 'upcoming',
        urgency: 'info',
        domain: item.domain,
        title: `Coming up: ${item.parentFriendlyName}`,
        message: item.parentFriendlyDescription,
        parentAction: `In ${item.idealAgeMonths - child.ageMonths} months, your child will need ${item.parentFriendlyName}. We\'ll remind you.`,
        doctorContext: item.clinicalDescription,
        citation: item.citation,
        dueContext: `Due in ${item.idealAgeMonths - child.ageMonths} months (at ${Math.floor(item.idealAgeMonths / 12)}y ${item.idealAgeMonths % 12}m).`,
        systemConnections: item.systemConnections,
      })
    }
  }

  // ─── SYSTEMS-BASED FLAGS ───
  // Cross-domain intelligence (SKIDS philosophy)

  if (child.activeConditions.some(c => c.toLowerCase().includes('iron') || c.toLowerCase().includes('anemia'))) {
    alerts.push({
      type: 'systems_flag',
      urgency: 'attention',
      domain: 'iron_anemia',
      title: 'Physiological First: Iron status active',
      message: 'Your child has an active iron/anemia concern. This can affect attention, sleep, energy, and development. Until iron is corrected, behavioral assessments should be interpreted with caution.',
      parentAction: 'Follow iron supplementation as prescribed. Recheck in 3 months. Pair iron-rich foods with Vitamin C for better absorption.',
      doctorContext: 'Active iron deficiency. Physiological gate NOT cleared for behavioral escalation. Defer ADHD/behavioral diagnosis until iron is corrected and reassessed.',
      citation: 'SKIDS Physiological First protocol; IAP Iron Guidelines',
      dueContext: 'Active — reassess after 3 months of supplementation',
      systemConnections: [
        'Iron deficiency → poor attention (mimics ADHD)',
        'Iron deficiency → disrupted sleep → behavioral dysregulation',
        'Iron deficiency → delayed motor milestones',
        'Iron deficiency → impaired immune function',
      ],
    })
  }

  if (child.riskFactors.includes('consanguinity') && child.region === 'gcc') {
    alerts.push({
      type: 'systems_flag',
      urgency: 'attention',
      domain: 'consanguinity',
      title: 'Enhanced screening: consanguinity',
      message: 'Your family history indicates consanguinity. This means certain genetic conditions are more common. We have enhanced screening protocols to catch these early.',
      parentAction: 'Ensure all recommended genetic screenings are completed. Inform your doctor about any family history of genetic conditions.',
      doctorContext: 'Consanguinity present. Enhanced surveillance for: sensorineural hearing loss (GJB2), hemoglobinopathies (sickle cell, thalassemia), metabolic disorders. Consider genetic counseling.',
      citation: 'Gulf AP Genetic Screening Consensus 2020',
      dueContext: 'Ongoing enhanced surveillance',
      systemConnections: [
        'Consanguinity → 2-8x risk of autosomal recessive conditions',
        'Hearing loss from GJB2 → early intervention changes trajectory',
        'Hemoglobinopathy carrier status → affects iron screening interpretation',
      ],
    })
  }

  if (child.riskFactors.includes('preterm')) {
    alerts.push({
      type: 'systems_flag',
      urgency: 'attention',
      domain: 'development',
      title: 'Adjusted milestones: preterm birth',
      message: 'Your child was born preterm. We use "corrected age" for milestone assessment until age 2 — this accounts for the early birth and gives a fairer picture of development.',
      parentAction: 'Use corrected age (not birth age) when checking milestones. Your pediatrician will help with this.',
      doctorContext: 'Preterm: use corrected age for developmental assessment until 24 months. Higher surveillance for: ROP, hearing loss, cerebral palsy, feeding difficulties, growth faltering.',
      citation: 'AAP Follow-up of Preterm Infants; IAP Preterm Monitoring Guidelines',
      dueContext: 'Corrected age adjustment until 24 months',
      systemConnections: [
        'Preterm → retinopathy of prematurity (ROP) screening',
        'Preterm → higher risk of hearing loss',
        'Preterm → corrected age for milestones prevents false "delay" labels',
      ],
    })
  }

  // Sort: urgent first, then attention, then info
  const urgencyOrder = { urgent: 0, attention: 1, info: 2 }
  return alerts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
}

/** Explain a recommendation — full explainability for any schedule item */
export function explainRecommendation(item: ScheduleItem): {
  what: string
  why: string
  when: string
  howItConnects: string[]
  source: string
  parentTool: ParentAssessmentTool | undefined
} {
  return {
    what: item.clinicalDescription,
    why: item.rationale,
    when: `Recommended at ${Math.floor(item.idealAgeMonths / 12)} years ${item.idealAgeMonths % 12} months (window: ${item.ageMinMonths}-${item.ageMaxMonths} months).${item.repeatEveryMonths ? ` Repeat every ${item.repeatEveryMonths} months.` : ' One-time screening.'}`,
    howItConnects: item.systemConnections,
    source: item.citation,
    parentTool: item.parentToolKey ? getParentTool(item.parentToolKey) : undefined,
  }
}

/** Generate timeline events for upcoming/overdue screenings (feeds into PHR timeline) */
export function getProtocolTimelineEvents(child: ChildContext): TimelineEvent[] {
  const alerts = getProactiveAlerts(child)
  const events: TimelineEvent[] = []

  for (const alert of alerts) {
    if (alert.type === 'overdue') {
      events.push({
        id: `protocol_overdue_${alert.domain}`,
        date: new Date().toISOString().split('T')[0],
        type: 'screening',
        icon: '⚠️',
        title: alert.title,
        subtitle: alert.dueContext,
        detail: alert.parentAction,
        severity: 'alert',
        tags: [alert.domain, 'overdue', alert.citation.split(';')[0]],
      })
    } else if (alert.type === 'due_now') {
      events.push({
        id: `protocol_due_${alert.domain}`,
        date: new Date().toISOString().split('T')[0],
        type: 'screening',
        icon: '📋',
        title: alert.title,
        subtitle: alert.dueContext,
        detail: alert.parentAction,
        severity: 'info',
        tags: [alert.domain, 'due now'],
      })
    } else if (alert.type === 'upcoming') {
      // Calculate future date
      const monthsAway = parseInt(alert.dueContext.match(/in (\d+) months/)?.[1] || '3')
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + monthsAway)
      events.push({
        id: `protocol_upcoming_${alert.domain}`,
        date: futureDate.toISOString().split('T')[0],
        type: 'screening',
        icon: '🔮',
        title: alert.title,
        subtitle: alert.dueContext,
        detail: alert.parentAction,
        severity: 'info',
        tags: [alert.domain, 'upcoming'],
      })
    }
  }

  return events
}

// ═══════════════════════════════════════════════════════════════════
// PROTOCOL SUMMARY (for PHR display)
// ═══════════════════════════════════════════════════════════════════

export interface ProtocolSummary {
  region: Region
  protocolName: string
  totalScheduleItems: number
  completedCount: number
  overdueCount: number
  dueNowCount: number
  upcomingCount: number
  nextDue: ScheduleItem | null
  criticalOverdue: ScheduleItem[]
  parentToolsAvailable: ParentAssessmentTool[]
  shieldScore: number // 0-100 protocol adherence
}

/** Generate a protocol compliance summary for the PHR */
export function getProtocolSummary(child: ChildContext): ProtocolSummary {
  const schedule = getProtocolSchedule(child.region)
  const overdue = getOverdueScreenings(child.region, child.ageMonths, child.completedScreenings)
  const upcoming = getUpcomingScreenings(child.region, child.ageMonths)
  const dueNow = getScheduleForAge(child.region, child.ageMonths)
    .filter(item => !child.completedScreenings.includes(item.key))
  const parentTools = getParentToolsForAge(child.ageMonths)

  // Items that should have been completed by now
  const shouldBeComplete = schedule.filter(
    item => !item.repeatEveryMonths && child.ageMonths > item.ageMaxMonths
  )
  const completedOfRequired = shouldBeComplete.filter(
    item => child.completedScreenings.includes(item.key)
  ).length
  const shieldScore = shouldBeComplete.length > 0
    ? Math.round((completedOfRequired / shouldBeComplete.length) * 100)
    : 100

  const protocolNames: Record<Region, string> = {
    india: 'IAP (Indian Academy of Pediatrics)',
    usa: 'AAP (American Academy of Pediatrics)',
    gcc: 'Gulf AP (GCC Consensus)',
  }

  return {
    region: child.region,
    protocolName: protocolNames[child.region],
    totalScheduleItems: schedule.length,
    completedCount: child.completedScreenings.length,
    overdueCount: overdue.length,
    dueNowCount: dueNow.length,
    upcomingCount: upcoming.length,
    nextDue: upcoming[0] || dueNow[0] || null,
    criticalOverdue: overdue.filter(item => item.priority === 'critical'),
    parentToolsAvailable: parentTools,
    shieldScore,
  }
}
