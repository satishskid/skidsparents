/**
 * POST /api/admin/seed-demo
 *
 * Seeds the database with realistic demo children at different ages
 * with different conditions — for investor demos and pilot testing.
 *
 * Creates: 1 demo doctor, 1 demo parent, 8 children (infant to teen),
 * each with growth records, birth history, family history, conditions,
 * medications, screening results, observations, projections, milestones,
 * and pilot invitations.
 *
 * Safe to call multiple times (uses INSERT OR REPLACE where possible).
 */

import type { APIRoute } from 'astro'

export const prerender = false

// ── Helper: deterministic IDs ──
const ID = (prefix: string, n: number) => `demo_${prefix}_${String(n).padStart(3, '0')}`
const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 16)

// ── Demo Doctor ──
const DEMO_DOCTOR = {
  id: 'demo_doctor_001',
  firebase_uid: 'demo_firebase_doctor_001',
  name: 'Dr. Priya Sharma',
  email: 'priya.sharma@skids.clinic',
  phone: '+919876543210',
  specialty: 'pediatrician',
  role: 'primary',
  clinic_name: 'SKIDS Pediatric Clinic',
  city: 'Hyderabad',
  license_number: 'MCI-TS-29384',
  is_active: 1,
  ai_preference: 'chips',
}

// ── Demo Parent ──
const DEMO_PARENT = {
  id: 'demo_parent_001',
  firebase_uid: 'demo_firebase_parent_001',
  name: 'Ananya Reddy',
  email: 'ananya.reddy@gmail.com',
  phone: '+919988776655',
  city: 'Hyderabad',
}

// ── 8 Children spanning ages (realistic Indian names) ──
function dob(yearsAgo: number, monthsExtra = 0): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - yearsAgo)
  d.setMonth(d.getMonth() - monthsExtra)
  return d.toISOString().slice(0, 10)
}

const DEMO_CHILDREN = [
  {
    id: ID('child', 1),
    name: 'Aanya Reddy',
    dob: dob(0, 4), // 4 months
    gender: 'female',
    blood_group: 'B+',
    ageLabel: '4 months',
    conditions: [
      { name: 'Iron Deficiency Anemia (Mild)', icd10: 'D50.9', status: 'active', notes: 'Hemoglobin 9.8 g/dL at 3-month check. Started iron drops.' },
    ],
    medications: [
      { name: 'Ferrous Sulfate Drops', dosage: '7.5 mg elemental iron/day', frequency: 'daily', status: 'active' },
      { name: 'Vitamin D3 Drops', dosage: '400 IU', frequency: 'daily', status: 'active' },
    ],
    birth: { gestational_weeks: 38, delivery_mode: 'vaginal', birth_weight_grams: 2900, nicu_stay: 0, apgar_score: 9 },
    growth: [
      { date: dob(0, 4), height_cm: 50.2, weight_kg: 2.9 },
      { date: dob(0, 3), height_cm: 54.1, weight_kg: 4.2 },
      { date: dob(0, 1), height_cm: 59.5, weight_kg: 5.8 },
      { date: dob(0, 0), height_cm: 62.3, weight_kg: 6.5 },
    ],
    screenings: [
      { type: 'newborn_hearing', result: 'pass', findings: { bilateral: 'pass', method: 'OAE' } },
      { type: 'hemoglobin', result: 'low', findings: { value: 9.8, unit: 'g/dL', threshold: 11.0 } },
    ],
    observations: [
      { category: 'feeding', text: 'Aanya seems to tire quickly during breastfeeding sessions', concern: 'mild' },
      { category: 'development', text: 'Good head control, smiles socially, tracks objects', concern: 'none' },
    ],
    projections: [
      { condition: 'Iron Deficiency Anemia', icd10: 'D50.9', domain: 'nutrition', base_prob: 0.72, adj_prob: 0.72, urgency: 'monitor', must_not_miss: 0, explanation: 'Hemoglobin at 9.8 g/dL is below threshold. Feeding fatigue may be related. Iron supplementation started — recheck at 6 months.' },
      { condition: 'Failure to Thrive', icd10: 'R62.51', domain: 'growth', base_prob: 0.15, adj_prob: 0.08, urgency: 'routine', must_not_miss: 0, explanation: 'Weight gain is adequate at 6.5 kg for 4 months. Growth velocity normal. Low concern.' },
    ],
    milestones: [
      { key: 'social_smile', title: 'Social Smile', category: 'social', status: 'achieved', age_min: 1, age_max: 3 },
      { key: 'head_control', title: 'Holds Head Steady', category: 'motor_gross', status: 'achieved', age_min: 2, age_max: 4 },
      { key: 'rolls_over', title: 'Rolls Over', category: 'motor_gross', status: 'not_started', age_min: 3, age_max: 6 },
      { key: 'reaches_objects', title: 'Reaches for Objects', category: 'motor_fine', status: 'achieved', age_min: 3, age_max: 5 },
    ],
    family_history: [
      { condition: 'Thalassemia Trait', relation: 'father', notes: 'Beta-thal minor carrier' },
    ],
    diet: { breastfed: 1, formula_fed: 0, solids_started: 0, food_diversity: 0, iron_supplement: 1, vitamin_d: 1 },
  },
  {
    id: ID('child', 2),
    name: 'Vihaan Reddy',
    dob: dob(1, 6), // 18 months
    gender: 'male',
    blood_group: 'O+',
    ageLabel: '18 months',
    conditions: [
      { name: 'Speech Delay', icd10: 'F80.1', status: 'active', notes: 'Only 3 words at 18 months. Referred for speech evaluation.' },
      { name: 'Recurrent Otitis Media', icd10: 'H66.90', status: 'active', notes: '4 episodes in past 6 months. Hearing evaluation pending.' },
    ],
    medications: [
      { name: 'Amoxicillin', dosage: '250mg/5ml', frequency: 'twice_daily', status: 'completed' },
    ],
    birth: { gestational_weeks: 37, delivery_mode: 'c_section', birth_weight_grams: 2650, nicu_stay: 0, apgar_score: 8 },
    growth: [
      { date: dob(1, 6), height_cm: 49.5, weight_kg: 2.65 },
      { date: dob(1, 0), height_cm: 65.2, weight_kg: 7.8 },
      { date: dob(0, 6), height_cm: 74.0, weight_kg: 9.5 },
      { date: dob(0, 0), height_cm: 81.2, weight_kg: 11.1 },
    ],
    screenings: [
      { type: 'hearing', result: 'refer', findings: { right_ear: 'mild_loss', left_ear: 'pass', method: 'tympanometry', recommendation: 'ENT_referral' } },
      { type: 'developmental_M-CHAT', result: 'low_risk', findings: { score: 1, threshold: 3, items_flagged: ['pointing'] } },
    ],
    observations: [
      { category: 'speech', text: 'Vihaan only says "mama", "dada", and "no". Seems to understand instructions but doesn\'t speak.', concern: 'moderate' },
      { category: 'behavior', text: 'Pulls at ears frequently, especially at night. Gets cranky.', concern: 'mild' },
    ],
    projections: [
      { condition: 'Expressive Language Disorder', icd10: 'F80.1', domain: 'developmental', base_prob: 0.65, adj_prob: 0.58, urgency: 'attention', must_not_miss: 1, explanation: 'Only 3 words at 18 months (expected 10-20). Recurrent ear infections may be contributing to hearing-related delay. Speech therapy evaluation recommended.' },
      { condition: 'Conductive Hearing Loss', icd10: 'H65.90', domain: 'sensory', base_prob: 0.45, adj_prob: 0.52, urgency: 'attention', must_not_miss: 1, explanation: 'Recurrent otitis media (4 episodes) with tympanometry showing mild right ear loss. This could explain speech delay. ENT + audiology needed.' },
      { condition: 'Autism Spectrum Disorder', icd10: 'F84.0', domain: 'developmental', base_prob: 0.08, adj_prob: 0.05, urgency: 'routine', must_not_miss: 1, explanation: 'M-CHAT low risk (1/20). Good social engagement. Speech delay likely hearing-related, not ASD. Continue monitoring.' },
    ],
    milestones: [
      { key: 'walks_independently', title: 'Walks Independently', category: 'motor_gross', status: 'achieved', age_min: 9, age_max: 15 },
      { key: 'says_10_words', title: 'Says 10+ Words', category: 'language', status: 'not_started', age_min: 12, age_max: 18 },
      { key: 'points_to_show', title: 'Points to Show Interest', category: 'social', status: 'achieved', age_min: 12, age_max: 18 },
      { key: 'stacks_blocks', title: 'Stacks 2-3 Blocks', category: 'motor_fine', status: 'achieved', age_min: 12, age_max: 18 },
    ],
    family_history: [
      { condition: 'Speech Delay', relation: 'uncle_paternal', notes: 'Late talker, resolved by age 4' },
    ],
    diet: { breastfed: 0, formula_fed: 0, solids_started: 1, food_diversity: 1, iron_supplement: 0, vitamin_d: 1 },
  },
  {
    id: ID('child', 3),
    name: 'Aadhya Krishnan',
    dob: dob(3, 2), // 3 years 2 months
    gender: 'female',
    blood_group: 'A+',
    ageLabel: '3 years',
    conditions: [
      { name: 'Amblyopia (Lazy Eye)', icd10: 'H53.00', status: 'active', notes: 'Right eye amblyopia detected at preschool vision screen. Patching started.' },
    ],
    medications: [],
    birth: { gestational_weeks: 40, delivery_mode: 'vaginal', birth_weight_grams: 3200, nicu_stay: 0, apgar_score: 9 },
    growth: [
      { date: dob(3, 0), height_cm: 49.8, weight_kg: 3.2 },
      { date: dob(2, 0), height_cm: 75.0, weight_kg: 10.5 },
      { date: dob(1, 0), height_cm: 85.5, weight_kg: 12.8 },
      { date: dob(0, 0), height_cm: 95.2, weight_kg: 14.5 },
    ],
    screenings: [
      { type: 'vision_spot', result: 'refer', findings: { right_eye: '20/60', left_eye: '20/25', risk: 'anisometropia', recommendation: 'ophthalmology_referral' } },
    ],
    observations: [
      { category: 'vision', text: 'Aadhya tilts her head when looking at books. Squints at the TV from close distance.', concern: 'moderate' },
    ],
    projections: [
      { condition: 'Amblyopia', icd10: 'H53.00', domain: 'sensory', base_prob: 0.82, adj_prob: 0.85, urgency: 'attention', must_not_miss: 1, explanation: 'Confirmed by spot vision screening. Right eye 20/60, left 20/25. Head tilting and squinting are classic signs. Early patching (2 hrs/day) is critical — best outcomes before age 7.' },
      { condition: 'Refractive Error', icd10: 'H52.1', domain: 'sensory', base_prob: 0.60, adj_prob: 0.70, urgency: 'monitor', must_not_miss: 0, explanation: 'Anisometropia likely underlying cause. Corrective glasses + patching is standard protocol.' },
    ],
    milestones: [
      { key: 'runs_well', title: 'Runs Well', category: 'motor_gross', status: 'achieved', age_min: 24, age_max: 30 },
      { key: 'speaks_sentences', title: 'Speaks in 3-4 Word Sentences', category: 'language', status: 'achieved', age_min: 24, age_max: 36 },
      { key: 'toilet_trained', title: 'Toilet Trained (Daytime)', category: 'adaptive', status: 'achieved', age_min: 24, age_max: 36 },
    ],
    family_history: [
      { condition: 'Myopia', relation: 'mother', notes: 'Glasses since age 8' },
    ],
    diet: { breastfed: 0, formula_fed: 0, solids_started: 1, food_diversity: 1, iron_supplement: 0, vitamin_d: 0 },
  },
  {
    id: ID('child', 4),
    name: 'Arjun Patel',
    dob: dob(5, 0), // 5 years
    gender: 'male',
    blood_group: 'AB+',
    ageLabel: '5 years',
    conditions: [
      { name: 'Attention Deficit Hyperactivity Disorder (Combined)', icd10: 'F90.2', status: 'monitoring', notes: 'Teacher-reported inattention and hyperactivity. Vanderbilt screening positive. Behavioral therapy started.' },
      { name: 'Nocturnal Enuresis', icd10: 'N39.44', status: 'active', notes: 'Bedwetting 4-5 nights/week. Bladder diary started.' },
    ],
    medications: [],
    birth: { gestational_weeks: 36, delivery_mode: 'c_section', birth_weight_grams: 2400, nicu_stay: 1, nicu_days: 3, apgar_score: 7 },
    growth: [
      { date: dob(5, 0), height_cm: 48.0, weight_kg: 2.4 },
      { date: dob(3, 0), height_cm: 88.0, weight_kg: 13.0 },
      { date: dob(1, 0), height_cm: 103.0, weight_kg: 17.2 },
      { date: dob(0, 0), height_cm: 110.5, weight_kg: 19.8 },
    ],
    screenings: [
      { type: 'vision', result: 'pass', findings: { bilateral: '20/20' } },
      { type: 'hearing', result: 'pass', findings: { bilateral: 'pass' } },
      { type: 'behavioral_Vanderbilt', result: 'positive', findings: { inattention_score: 7, hyperactivity_score: 6, teacher_confirmed: true, parent_confirmed: true } },
    ],
    observations: [
      { category: 'behavior', text: 'Arjun can\'t sit still during meals or homework. Constantly fidgeting. Teacher says he disrupts class.', concern: 'significant' },
      { category: 'sleep', text: 'Wets the bed almost every night. Deep sleeper — doesn\'t wake up even when wet.', concern: 'moderate' },
    ],
    projections: [
      { condition: 'ADHD - Combined Type', icd10: 'F90.2', domain: 'behavioral', base_prob: 0.70, adj_prob: 0.75, urgency: 'attention', must_not_miss: 1, explanation: 'Vanderbilt positive from both teacher and parent. Inattention 7/9, hyperactivity 6/9. Premature birth (36wk) is a risk factor. Behavioral therapy first line for age 5. Re-evaluate for medication if no improvement by 6.' },
      { condition: 'Nocturnal Enuresis', icd10: 'N39.44', domain: 'urological', base_prob: 0.85, adj_prob: 0.85, urgency: 'monitor', must_not_miss: 0, explanation: 'Common at age 5 (15-20% prevalence). Deep sleep pattern fits. Fluid restriction + bladder training. Consider alarm therapy if persists past 6.' },
    ],
    milestones: [
      { key: 'hops_on_one_foot', title: 'Hops on One Foot', category: 'motor_gross', status: 'achieved', age_min: 48, age_max: 60 },
      { key: 'draws_person_6parts', title: 'Draws a Person (6+ Parts)', category: 'motor_fine', status: 'not_started', age_min: 48, age_max: 66 },
      { key: 'counts_to_10', title: 'Counts to 10', category: 'cognitive', status: 'achieved', age_min: 48, age_max: 60 },
    ],
    family_history: [
      { condition: 'ADHD', relation: 'father', notes: 'Diagnosed as adult, on medication' },
      { condition: 'Enuresis', relation: 'uncle_maternal', notes: 'Resolved by age 8' },
    ],
    diet: { breastfed: 0, formula_fed: 0, solids_started: 1, food_diversity: 1, iron_supplement: 0, vitamin_d: 0 },
  },
  {
    id: ID('child', 5),
    name: 'Meera Iyer',
    dob: dob(7, 6), // 7.5 years
    gender: 'female',
    blood_group: 'B+',
    ageLabel: '7.5 years',
    conditions: [
      { name: 'Childhood Obesity', icd10: 'E66.01', status: 'active', notes: 'BMI >95th percentile. Family lifestyle modification program started.' },
      { name: 'Acanthosis Nigricans', icd10: 'L83', status: 'active', notes: 'Dark patches on neck and axillae. Insulin resistance screening ordered.' },
    ],
    medications: [],
    birth: { gestational_weeks: 39, delivery_mode: 'vaginal', birth_weight_grams: 3500, nicu_stay: 0, apgar_score: 9 },
    growth: [
      { date: dob(7, 0), height_cm: 50.5, weight_kg: 3.5 },
      { date: dob(5, 0), height_cm: 98.0, weight_kg: 16.0 },
      { date: dob(2, 0), height_cm: 115.0, weight_kg: 25.0 },
      { date: dob(1, 0), height_cm: 119.5, weight_kg: 30.2 },
      { date: dob(0, 0), height_cm: 124.0, weight_kg: 35.5 },
    ],
    screenings: [
      { type: 'BMI_screening', result: 'obese', findings: { bmi: 23.1, percentile: 97, category: 'obese' } },
      { type: 'fasting_glucose', result: 'borderline', findings: { value: 105, unit: 'mg/dL', threshold: 100 } },
    ],
    observations: [
      { category: 'nutrition', text: 'Meera eats a lot of packaged snacks and screen-snacks. Refuses vegetables. Very sedentary — 4+ hours screen time daily.', concern: 'significant' },
      { category: 'skin', text: 'Dark velvety patches appearing on neck and under arms. Getting darker.', concern: 'moderate' },
    ],
    projections: [
      { condition: 'Childhood Obesity', icd10: 'E66.01', domain: 'nutrition', base_prob: 0.92, adj_prob: 0.92, urgency: 'attention', must_not_miss: 1, explanation: 'BMI 23.1 at age 7.5 (97th percentile). Rapid weight gain trajectory — gained 10 kg in 2 years. Sedentary lifestyle + processed food. Comprehensive family lifestyle intervention needed.' },
      { condition: 'Insulin Resistance / Pre-diabetes', icd10: 'R73.03', domain: 'metabolic', base_prob: 0.55, adj_prob: 0.65, urgency: 'attention', must_not_miss: 1, explanation: 'Acanthosis nigricans + fasting glucose 105 (borderline) + obesity = high risk for insulin resistance. HbA1c and insulin levels needed. Early dietary intervention can reverse trajectory.' },
      { condition: 'Metabolic Syndrome', icd10: 'E88.81', domain: 'metabolic', base_prob: 0.30, adj_prob: 0.35, urgency: 'monitor', must_not_miss: 0, explanation: 'Obesity + borderline glucose + acanthosis. Need lipid panel and blood pressure trending to complete metabolic syndrome assessment.' },
    ],
    milestones: [
      { key: 'reads_independently', title: 'Reads Independently', category: 'cognitive', status: 'achieved', age_min: 72, age_max: 84 },
      { key: 'ties_shoes', title: 'Ties Shoes', category: 'motor_fine', status: 'achieved', age_min: 60, age_max: 84 },
    ],
    family_history: [
      { condition: 'Type 2 Diabetes', relation: 'grandmother_maternal', notes: 'Diagnosed at 52' },
      { condition: 'Obesity', relation: 'father', notes: 'BMI 32' },
      { condition: 'PCOS', relation: 'mother', notes: 'Diagnosed at 25' },
    ],
    diet: { breastfed: 0, formula_fed: 0, solids_started: 1, food_diversity: 0, iron_supplement: 0, vitamin_d: 0 },
  },
  {
    id: ID('child', 6),
    name: 'Kabir Singh',
    dob: dob(10, 0), // 10 years
    gender: 'male',
    blood_group: 'O-',
    ageLabel: '10 years',
    conditions: [
      { name: 'Asthma (Moderate Persistent)', icd10: 'J45.40', status: 'active', notes: 'Frequent wheeze, exercise-triggered. On daily ICS + PRN SABA.' },
      { name: 'Allergic Rhinitis', icd10: 'J30.9', status: 'active', notes: 'Perennial symptoms. Dust mite allergy confirmed.' },
    ],
    medications: [
      { name: 'Fluticasone Inhaler', dosage: '125 mcg', frequency: 'twice_daily', status: 'active' },
      { name: 'Salbutamol Inhaler', dosage: '200 mcg PRN', frequency: 'as_needed', status: 'active' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'daily', status: 'active' },
    ],
    birth: { gestational_weeks: 39, delivery_mode: 'vaginal', birth_weight_grams: 3100, nicu_stay: 0, apgar_score: 9 },
    growth: [
      { date: dob(10, 0), height_cm: 50.0, weight_kg: 3.1 },
      { date: dob(5, 0), height_cm: 108.0, weight_kg: 18.5 },
      { date: dob(2, 0), height_cm: 125.0, weight_kg: 25.0 },
      { date: dob(0, 0), height_cm: 138.5, weight_kg: 32.0 },
    ],
    screenings: [
      { type: 'spirometry', result: 'moderate_obstruction', findings: { fev1_percent: 72, fev1_fvc: 0.74, bronchodilator_response: 'positive_15%' } },
      { type: 'allergy_skin_prick', result: 'positive', findings: { dust_mite: 'strong_positive', cat_dander: 'mild_positive', pollen: 'negative' } },
    ],
    observations: [
      { category: 'respiratory', text: 'Kabir wakes up coughing 2-3 nights per week. Can\'t run in PE class without wheezing. Uses blue inhaler before sports.', concern: 'significant' },
      { category: 'allergy', text: 'Constant runny nose and sneezing in the morning. Gets worse in dusty rooms.', concern: 'mild' },
    ],
    projections: [
      { condition: 'Asthma - Moderate Persistent', icd10: 'J45.40', domain: 'respiratory', base_prob: 0.88, adj_prob: 0.90, urgency: 'attention', must_not_miss: 1, explanation: 'Spirometry confirms moderate obstruction (FEV1 72%). Night symptoms 2-3x/week = moderate persistent. Positive bronchodilator response. Step-up therapy may be needed if current ICS dose insufficient.' },
      { condition: 'Allergic Rhinitis', icd10: 'J30.9', domain: 'respiratory', base_prob: 0.80, adj_prob: 0.85, urgency: 'monitor', must_not_miss: 0, explanation: 'Skin prick positive for dust mite. Perennial symptoms. United airway concept — treating rhinitis helps asthma control. Environmental control measures + intranasal steroids.' },
    ],
    milestones: [
      { key: 'abstract_thinking', title: 'Shows Abstract Thinking', category: 'cognitive', status: 'achieved', age_min: 96, age_max: 120 },
      { key: 'team_sports', title: 'Participates in Team Sports', category: 'social', status: 'not_started', age_min: 84, age_max: 120 },
    ],
    family_history: [
      { condition: 'Asthma', relation: 'mother', notes: 'Childhood asthma, outgrew by 18' },
      { condition: 'Eczema', relation: 'sister', notes: 'Atopic dermatitis since infancy' },
    ],
    diet: { breastfed: 0, formula_fed: 0, solids_started: 1, food_diversity: 1, iron_supplement: 0, vitamin_d: 0 },
  },
  {
    id: ID('child', 7),
    name: 'Zara Khan',
    dob: dob(12, 6), // 12.5 years
    gender: 'female',
    blood_group: 'A-',
    ageLabel: '12.5 years',
    conditions: [
      { name: 'Scoliosis (Idiopathic, Mild)', icd10: 'M41.10', status: 'monitoring', notes: 'Cobb angle 15°. Adams forward bend positive. Bracing not yet indicated.' },
      { name: 'Anxiety Disorder', icd10: 'F41.1', status: 'active', notes: 'School refusal behavior, somatic complaints. CBT started.' },
    ],
    medications: [],
    birth: { gestational_weeks: 41, delivery_mode: 'vaginal', birth_weight_grams: 3400, nicu_stay: 0, apgar_score: 9 },
    growth: [
      { date: dob(12, 0), height_cm: 51.0, weight_kg: 3.4 },
      { date: dob(7, 0), height_cm: 118.0, weight_kg: 22.0 },
      { date: dob(2, 0), height_cm: 143.0, weight_kg: 38.0 },
      { date: dob(0, 0), height_cm: 155.5, weight_kg: 44.0 },
    ],
    screenings: [
      { type: 'scoliosis_screening', result: 'positive', findings: { cobb_angle: 15, curve_direction: 'right_thoracic', risser_sign: 2, adams_test: 'positive' } },
      { type: 'PHQ-A', result: 'moderate_anxiety', findings: { score: 14, threshold: 10, category: 'moderate' } },
    ],
    observations: [
      { category: 'musculoskeletal', text: 'Zara\'s right shoulder seems higher than left. She complains of back pain after sitting in class.', concern: 'moderate' },
      { category: 'mental_health', text: 'Refuses to go to school 2-3 days per week. Says she has stomach ache and headache. Seems anxious about tests.', concern: 'significant' },
    ],
    projections: [
      { condition: 'Idiopathic Scoliosis', icd10: 'M41.10', domain: 'musculoskeletal', base_prob: 0.78, adj_prob: 0.80, urgency: 'monitor', must_not_miss: 1, explanation: 'Cobb angle 15° at Risser 2 — still growing. At risk for progression. X-ray every 6 months. Bracing if reaches 25°. Physical therapy for core strengthening. No sports restriction.' },
      { condition: 'Generalized Anxiety Disorder', icd10: 'F41.1', domain: 'mental_health', base_prob: 0.72, adj_prob: 0.75, urgency: 'attention', must_not_miss: 1, explanation: 'PHQ-A moderate (14/27). School refusal with somatic symptoms (headache, stomachache) is classic presentation. CBT is first-line. Monitor for depression co-morbidity. Family therapy may help.' },
    ],
    milestones: [
      { key: 'pubertal_development', title: 'Pubertal Development (Tanner 3)', category: 'physical', status: 'achieved', age_min: 120, age_max: 156 },
      { key: 'independent_homework', title: 'Manages Homework Independently', category: 'cognitive', status: 'not_started', age_min: 108, age_max: 144 },
    ],
    family_history: [
      { condition: 'Scoliosis', relation: 'grandmother_maternal', notes: 'Surgical correction at 16' },
      { condition: 'Anxiety', relation: 'mother', notes: 'GAD diagnosed at 30' },
    ],
    diet: { breastfed: 0, formula_fed: 0, solids_started: 1, food_diversity: 1, iron_supplement: 0, vitamin_d: 1 },
  },
  {
    id: ID('child', 8),
    name: 'Rohan Deshmukh',
    dob: dob(15, 3), // 15 years 3 months
    gender: 'male',
    blood_group: 'B-',
    ageLabel: '15 years',
    conditions: [
      { name: 'Type 1 Diabetes Mellitus', icd10: 'E10.9', status: 'active', notes: 'Diagnosed at 13. On insulin pump. HbA1c trending down to 7.2%.' },
      { name: 'Acne Vulgaris (Moderate)', icd10: 'L70.0', status: 'active', notes: 'Inflammatory acne on face and back. Topical retinoid started.' },
    ],
    medications: [
      { name: 'Insulin (Pump - NovoRapid)', dosage: 'Basal 0.8U/hr + bolus per carb count', frequency: 'continuous', status: 'active' },
      { name: 'Adapalene Gel 0.1%', dosage: 'Apply thin layer', frequency: 'nightly', status: 'active' },
    ],
    birth: { gestational_weeks: 38, delivery_mode: 'vaginal', birth_weight_grams: 3300, nicu_stay: 0, apgar_score: 9 },
    growth: [
      { date: dob(15, 0), height_cm: 50.5, weight_kg: 3.3 },
      { date: dob(10, 0), height_cm: 135.0, weight_kg: 30.0 },
      { date: dob(5, 0), height_cm: 155.0, weight_kg: 48.0 },
      { date: dob(2, 0), height_cm: 165.0, weight_kg: 55.0 },
      { date: dob(0, 0), height_cm: 172.5, weight_kg: 62.0 },
    ],
    screenings: [
      { type: 'HbA1c', result: 'improving', findings: { value: 7.2, target: 7.0, previous: 8.1, trend: 'improving' } },
      { type: 'retinal_screening', result: 'normal', findings: { bilateral: 'no_retinopathy', recommendation: 'annual_recheck' } },
      { type: 'celiac_screening', result: 'negative', findings: { tTG_IgA: 'normal' } },
    ],
    observations: [
      { category: 'diabetes_management', text: 'Rohan forgets to bolus before meals when with friends. Had 2 hypoglycemic episodes this month during basketball practice.', concern: 'significant' },
      { category: 'mental_health', text: 'Seems frustrated with diabetes management. Says he\'s "tired of being different." Skipping pump sometimes.', concern: 'moderate' },
    ],
    projections: [
      { condition: 'Type 1 Diabetes - Suboptimal Control', icd10: 'E10.65', domain: 'endocrine', base_prob: 0.85, adj_prob: 0.80, urgency: 'attention', must_not_miss: 1, explanation: 'HbA1c 7.2% (improving from 8.1% but still above 7.0% target). Missed boluses and exercise-induced hypoglycemia indicate need for pump setting adjustment. Adolescent diabetes fatigue is expected — peer support group recommended.' },
      { condition: 'Diabetes Burnout / Depression', icd10: 'F32.0', domain: 'mental_health', base_prob: 0.45, adj_prob: 0.50, urgency: 'attention', must_not_miss: 1, explanation: 'Expressing frustration, feeling different, skipping pump sessions — classic diabetes burnout in adolescents. Screen with PHQ-A. Diabetes-specific psychological support important. This directly impacts glycemic control.' },
    ],
    milestones: [
      { key: 'self_management', title: 'Manages Own Medical Needs', category: 'adaptive', status: 'not_started', age_min: 156, age_max: 192 },
      { key: 'career_planning', title: 'Engages in Career/Future Planning', category: 'cognitive', status: 'achieved', age_min: 168, age_max: 204 },
    ],
    family_history: [
      { condition: 'Type 1 Diabetes', relation: 'aunt_maternal', notes: 'Diagnosed at 10' },
      { condition: 'Hypothyroidism', relation: 'mother', notes: 'Hashimoto\'s' },
    ],
    diet: { breastfed: 0, formula_fed: 0, solids_started: 1, food_diversity: 1, iron_supplement: 0, vitamin_d: 1 },
  },
]

// ── Invite code generator ──
const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function makeInviteCode(): string {
  let code = ''
  for (let i = 0; i < 8; i++) code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
  return code
}

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })

  // Auth
  const adminKey = env.ADMIN_KEY
  if (adminKey) {
    const auth = request.headers.get('Authorization')
    if (!auth || (auth !== `Bearer ${adminKey}` && auth !== adminKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
  }

  const results = { parent: 0, doctor: 0, children: 0, growth_records: 0, conditions: 0, medications: 0, birth_history: 0, family_history: 0, screenings: 0, observations: 0, projections: 0, milestones: 0, diet_records: 0, pilot_group: 0, invitations: 0, doctor_patients: 0, errors: [] as string[] }

  const run = async (label: string, sql: string, ...params: any[]) => {
    try {
      await db.prepare(sql).bind(...params).run()
      return true
    } catch (err: any) {
      results.errors.push(`${label}: ${err.message}`)
      return false
    }
  }

  // ── 1. Create demo doctor ──
  const d = DEMO_DOCTOR
  if (await run('doctor', `INSERT OR REPLACE INTO doctors (id, firebase_uid, name, email, phone, specialty, role, clinic_name, city, license_number, is_active, ai_preference) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    d.id, d.firebase_uid, d.name, d.email, d.phone, d.specialty, d.role, d.clinic_name, d.city, d.license_number, d.is_active, d.ai_preference)) {
    results.doctor++
  }

  // ── 2. Create demo parent ──
  const p = DEMO_PARENT
  if (await run('parent', `INSERT OR REPLACE INTO parents (id, firebase_uid, name, email, phone, city) VALUES (?,?,?,?,?,?)`,
    p.id, p.firebase_uid, p.name, p.email, p.phone, p.city)) {
    results.parent++
  }

  // ── 3. Create pilot group ──
  if (await run('pilot_group', `INSERT OR REPLACE INTO pilot_groups (id, name, description, max_capacity, current_count, status) VALUES (?,?,?,?,?,?)`,
    'demo_group_001', 'Demo Showcase', 'Seeded demo children for investor demos and pilot validation', 20, DEMO_CHILDREN.length, 'active')) {
    results.pilot_group++
  }

  // ── 4. Seed each child ──
  const today = new Date().toISOString().slice(0, 10)

  for (const child of DEMO_CHILDREN) {
    // Child record
    if (await run(`child:${child.name}`, `INSERT OR REPLACE INTO children (id, parent_id, name, dob, gender, blood_group) VALUES (?,?,?,?,?,?)`,
      child.id, DEMO_PARENT.id, child.name, child.dob, child.gender, child.blood_group)) {
      results.children++
    }

    // Link to doctor
    if (await run(`dp:${child.name}`, `INSERT OR IGNORE INTO doctor_patients (id, doctor_id, child_id, relationship, linked_by, status) VALUES (?,?,?,?,?,?)`,
      `demo_dp_${child.id}`, DEMO_DOCTOR.id, child.id, 'primary', 'admin', 'active')) {
      results.doctor_patients++
    }

    // Growth records
    for (let i = 0; i < child.growth.length; i++) {
      const g = child.growth[i]
      const bmi = g.height_cm > 0 ? g.weight_kg / ((g.height_cm / 100) ** 2) : null
      if (await run(`growth:${child.name}:${i}`, `INSERT OR REPLACE INTO growth_records (id, child_id, date, height_cm, weight_kg, bmi) VALUES (?,?,?,?,?,?)`,
        `${child.id}_gr_${i}`, child.id, g.date, g.height_cm, g.weight_kg, bmi)) {
        results.growth_records++
      }
    }

    // Birth history
    const b = child.birth
    if (await run(`birth:${child.name}`, `INSERT OR REPLACE INTO birth_history (id, child_id, gestational_weeks, delivery_mode, birth_weight_grams, nicu_stay, nicu_days, apgar_score) VALUES (?,?,?,?,?,?,?,?)`,
      `${child.id}_bh`, child.id, b.gestational_weeks, b.delivery_mode, b.birth_weight_grams, b.nicu_stay, (b as any).nicu_days || null, b.apgar_score)) {
      results.birth_history++
    }

    // Active conditions
    for (let i = 0; i < child.conditions.length; i++) {
      const c = child.conditions[i]
      if (await run(`condition:${child.name}:${i}`, `INSERT OR REPLACE INTO active_conditions (id, child_id, condition_name, icd10, status, notes) VALUES (?,?,?,?,?,?)`,
        `${child.id}_cond_${i}`, child.id, c.name, c.icd10, c.status, c.notes)) {
        results.conditions++
      }
    }

    // Medications
    for (let i = 0; i < child.medications.length; i++) {
      const m = child.medications[i]
      if (await run(`med:${child.name}:${i}`, `INSERT OR REPLACE INTO medications (id, child_id, medication_name, dosage, frequency, start_date, status) VALUES (?,?,?,?,?,?,?)`,
        `${child.id}_med_${i}`, child.id, m.name, m.dosage, m.frequency, today, m.status)) {
        results.medications++
      }
    }

    // Family history
    for (let i = 0; i < (child.family_history || []).length; i++) {
      const fh = child.family_history[i]
      if (await run(`fh:${child.name}:${i}`, `INSERT OR REPLACE INTO family_history (id, child_id, condition, relation, notes) VALUES (?,?,?,?,?)`,
        `${child.id}_fh_${i}`, child.id, fh.condition, fh.relation, fh.notes)) {
        results.family_history++
      }
    }

    // Screening results
    for (let i = 0; i < child.screenings.length; i++) {
      const s = child.screenings[i]
      if (await run(`screen:${child.name}:${i}`, `INSERT OR REPLACE INTO screening_results (id, child_id, screening_type, date, result, findings_json) VALUES (?,?,?,?,?,?)`,
        `${child.id}_scr_${i}`, child.id, s.type, today, s.result, JSON.stringify(s.findings))) {
        results.screenings++
      }
    }

    // Parent observations
    for (let i = 0; i < child.observations.length; i++) {
      const o = child.observations[i]
      if (await run(`obs:${child.name}:${i}`, `INSERT OR REPLACE INTO parent_observations (id, child_id, date, category, observation_text, concern_level) VALUES (?,?,?,?,?,?)`,
        `${child.id}_obs_${i}`, child.id, today, o.category, o.text, o.concern)) {
        results.observations++
      }
    }

    // Observation projections (the intelligence output)
    for (let i = 0; i < child.projections.length; i++) {
      const proj = child.projections[i]
      const obsId = `${child.id}_obs_${Math.min(i, child.observations.length - 1)}`
      if (await run(`proj:${child.name}:${i}`, `INSERT OR REPLACE INTO observation_projections (id, observation_id, child_id, observation_text, condition_name, icd10, domain, category, base_probability, adjusted_probability, urgency, must_not_miss, parent_explanation, confidence) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        `${child.id}_proj_${i}`, obsId, child.id, child.observations[Math.min(i, child.observations.length - 1)]?.text || '', proj.condition, proj.icd10, proj.domain, proj.domain, proj.base_prob, proj.adj_prob, proj.urgency, proj.must_not_miss, proj.explanation, proj.adj_prob)) {
        results.projections++
      }
    }

    // Milestones
    for (let i = 0; i < (child.milestones || []).length; i++) {
      const ms = child.milestones[i]
      if (await run(`ms:${child.name}:${i}`, `INSERT OR REPLACE INTO milestones (id, child_id, category, milestone_key, title, status, expected_age_min, expected_age_max) VALUES (?,?,?,?,?,?,?,?)`,
        `${child.id}_ms_${i}`, child.id, ms.category, ms.key, ms.title, ms.status, ms.age_min, ms.age_max)) {
        results.milestones++
      }
    }

    // Diet record
    const dt = child.diet
    if (await run(`diet:${child.name}`, `INSERT OR REPLACE INTO diet_records (id, child_id, date, breastfed, formula_fed, solids_started, food_diversity, iron_supplement, vitamin_d) VALUES (?,?,?,?,?,?,?,?,?)`,
      `${child.id}_diet`, child.id, today, dt.breastfed, dt.formula_fed, dt.solids_started, dt.food_diversity, dt.iron_supplement, dt.vitamin_d)) {
      results.diet_records++
    }

    // Pilot invitation
    const invCode = makeInviteCode()
    if (await run(`invite:${child.name}`, `INSERT OR REPLACE INTO pilot_invitations (id, invite_code, parent_phone, parent_name, parent_email, child_qr_code, assigned_doctor_id, pilot_group, status, source, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      `${child.id}_inv`, invCode, DEMO_PARENT.phone, `${DEMO_PARENT.name} (for ${child.name})`, DEMO_PARENT.email, `DEMO_QR_${child.id}`, DEMO_DOCTOR.id, 'demo_group_001', 'sent', 'demo_seed', new Date(Date.now() + 365 * 86400000).toISOString())) {
      results.invitations++
    }
  }

  return new Response(JSON.stringify({
    success: true,
    summary: `Seeded ${results.children} children (${DEMO_CHILDREN.map(c => `${c.name} [${c.ageLabel}]`).join(', ')})`,
    counts: results,
    demo_credentials: {
      parent: { name: DEMO_PARENT.name, phone: DEMO_PARENT.phone, firebase_uid: DEMO_PARENT.firebase_uid },
      doctor: { name: DEMO_DOCTOR.name, phone: DEMO_DOCTOR.phone, firebase_uid: DEMO_DOCTOR.firebase_uid },
      pilot_group: 'demo_group_001',
      note: 'These are demo accounts. Firebase UIDs are placeholders — use admin APIs to test without auth, or link real Firebase accounts.',
    },
    children: DEMO_CHILDREN.map(c => ({
      name: c.name,
      age: c.ageLabel,
      conditions: c.conditions.map(co => co.name),
      projections: c.projections.length,
      id: c.id,
    })),
    errors: results.errors.length > 0 ? results.errors : undefined,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
