/**
 * SKIDS Condition-Observation Knowledge Graph
 *
 * The clinical foundation of the Probabilistic Life Record.
 * Maps: observation + age + body system → ranked conditions with base rates + modifiers.
 *
 * Sources: IAP Guidelines 2024, AAP Bright Futures 4th Ed, WHO Child Development,
 *          Nelson's Textbook of Pediatrics 22nd Ed, Indian Pediatrics journal.
 *
 * IMPORTANT: This is a screening/surveillance tool, NOT a diagnostic system.
 * All probabilities are for projection and prioritization, not diagnosis.
 *
 * Structure:
 *   OBSERVATION_CONDITION_MAP — the master knowledge graph
 *   Organized by body system, then by observation pattern.
 *   Each entry has age-specific condition mappings with modifiers.
 */

import type { ConditionObservationEntry } from './types'

// ============================================
// MASTER KNOWLEDGE GRAPH
// ============================================

export const OBSERVATION_CONDITION_MAP: ConditionObservationEntry[] = [

  // ═══════════════════════════════════════════
  // MOTOR SYSTEM
  // ═══════════════════════════════════════════

  // --- Not walking ---
  {
    id: 'motor_not_walking_normal_10_15',
    observationPatterns: ['not walking', 'hasn\'t started walking', 'can\'t walk', 'doesn\'t walk', 'no walking', 'late walker', 'not taking steps'],
    domain: 'motor',
    ageMinMonths: 10, ageMaxMonths: 15,
    conditionName: 'Normal variant — within expected range',
    conditionCategory: 'normal_variant',
    baseProbability: 0.85,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'WHO Motor Development Study 2006; walking range 9-17 months',
    parentExplanation: 'Most children walk between 9 and 15 months. Your child is within the normal range. Some children who crawl well or bottom-shuffle start walking later.',
    parentNextSteps: ['Does your child pull to stand?', 'Does your child cruise along furniture?', 'Is your child a bottom-shuffler? (they tend to walk later)'],
    doctorExamPoints: ['Check muscle tone', 'Assess pull-to-stand', 'Check for asymmetry', 'Review birth history'],
    modifiers: [
      { source: 'birth_history', key: 'preterm', description: 'Born before 37 weeks', multiplier: 1.2, explanation: 'Preterm babies use corrected age — this child may be effectively younger' },
      { source: 'milestone_status', key: 'pulls_to_stand_achieved', description: 'Can pull to stand', multiplier: 1.3, explanation: 'Pulling to stand is the precursor — walking is coming' },
      { source: 'family_history', key: 'late_walkers', description: 'Family history of late walking', multiplier: 1.2, explanation: 'Late walking often runs in families' },
    ],
  },
  {
    id: 'motor_not_walking_delay_15_18',
    observationPatterns: ['not walking', 'hasn\'t started walking', 'can\'t walk', 'doesn\'t walk', 'no walking'],
    domain: 'motor',
    ageMinMonths: 15, ageMaxMonths: 18,
    conditionName: 'Gross motor delay — evaluation recommended',
    conditionCategory: 'developmental',
    baseProbability: 0.40,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'AAP Bright Futures; IAP Developmental Surveillance 2023',
    parentExplanation: 'Most children walk by 15 months. At this age, it\'s worth having your pediatrician do a motor development check to ensure everything is on track.',
    parentNextSteps: ['Can your child stand without support?', 'Does your child cruise along furniture?', 'Does your child seem stiff or floppy compared to other children?'],
    doctorExamPoints: ['Full neurological exam', 'Muscle tone assessment (hypo/hypertonia)', 'Deep tendon reflexes', 'Primitive reflex persistence check', 'Gait analysis if cruising'],
    ruleOutBefore: ['Cerebral palsy', 'Muscular dystrophy', 'Spinal cord anomaly'],
    modifiers: [
      { source: 'birth_history', key: 'preterm', description: 'Born preterm', multiplier: 0.7, explanation: 'Use corrected age — may actually be within normal range' },
      { source: 'milestone_status', key: 'sits_without_support_delayed', description: 'Sitting was also delayed', multiplier: 1.5, explanation: 'Multiple motor delays increase concern' },
      { source: 'growth_trend', key: 'hc_declining', description: 'Head circumference crossing percentiles downward', multiplier: 1.8, explanation: 'Declining HC + motor delay warrants neurological evaluation' },
      { source: 'milestone_status', key: 'crawls_achieved', description: 'Crawling achieved', multiplier: 0.7, explanation: 'Good crawling suggests intact motor pathways' },
    ],
  },
  {
    id: 'motor_not_walking_cp_15_24',
    observationPatterns: ['not walking', 'can\'t walk', 'doesn\'t walk', 'stiff legs', 'legs cross', 'toe walking only'],
    domain: 'motor',
    ageMinMonths: 15, ageMaxMonths: 24,
    conditionName: 'Cerebral palsy',
    icd10: 'G80',
    conditionCategory: 'neurological',
    baseProbability: 0.03,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP Cerebral Palsy Guidelines 2022; prevalence 2-3/1000 live births',
    parentExplanation: 'Cerebral palsy is a condition that affects movement and muscle tone. Early detection leads to much better outcomes with therapy. This is uncommon but important to check for.',
    parentNextSteps: ['Does your child seem unusually stiff or floppy?', 'Do the legs tend to cross or scissor?', 'Is there a difference between the left and right side?', 'Was there any birth complication?'],
    doctorExamPoints: ['Tone assessment all 4 limbs', 'Deep tendon reflexes', 'Babinski sign', 'Persistent primitive reflexes', 'Postural reactions', 'Asymmetric movement patterns', 'MRI if clinical suspicion'],
    modifiers: [
      { source: 'birth_history', key: 'birth_asphyxia', description: 'Birth asphyxia or low Apgar', multiplier: 8.0, explanation: 'Birth asphyxia is a major risk factor for CP' },
      { source: 'birth_history', key: 'very_preterm', description: 'Born before 32 weeks', multiplier: 5.0, explanation: 'Very preterm birth significantly increases CP risk' },
      { source: 'birth_history', key: 'nicu_stay', description: 'NICU admission', multiplier: 3.0, explanation: 'NICU stay indicates perinatal complications' },
      { source: 'milestone_status', key: 'multiple_motor_delays', description: 'Multiple motor milestones delayed', multiplier: 4.0, explanation: 'Pattern of motor delays across multiple milestones' },
      { source: 'prior_observation', key: 'asymmetric_movement', description: 'Asymmetric movement noted before', multiplier: 3.0, explanation: 'Asymmetry is a key sign of hemiplegic CP' },
    ],
  },
  {
    id: 'motor_not_walking_muscular_dystrophy_15_24',
    observationPatterns: ['not walking', 'difficulty standing', 'falls frequently', 'large calves', 'waddling gait', 'climbs using hands on legs'],
    domain: 'motor',
    ageMinMonths: 15, ageMaxMonths: 60,
    conditionName: 'Muscular dystrophy (Duchenne)',
    icd10: 'G71.0',
    conditionCategory: 'genetic',
    baseProbability: 0.002,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP Guidelines; DMD prevalence 1:3500 male births',
    parentExplanation: 'Duchenne muscular dystrophy affects boys and causes progressive muscle weakness. It\'s rare but early detection allows for treatments that can significantly improve quality of life.',
    parentNextSteps: ['Is your child male?', 'Does your child use hands to climb up their own legs when standing? (Gowers sign)', 'Are the calves unusually large/firm?', 'Any family history of muscular dystrophy?'],
    doctorExamPoints: ['Gowers sign', 'Calf pseudohypertrophy', 'Proximal muscle weakness', 'CK levels (will be markedly elevated)', 'Family history X-linked'],
    modifiers: [
      { source: 'birth_history', key: 'male', description: 'Child is male', multiplier: 2.0, explanation: 'DMD is X-linked recessive, primarily affects males' },
      { source: 'family_history', key: 'muscular_dystrophy', description: 'Family history of muscular dystrophy', multiplier: 10.0, explanation: 'X-linked inheritance — maternal family history critical' },
      { source: 'prior_observation', key: 'frequent_falls', description: 'Frequent falls observed', multiplier: 3.0, explanation: 'Progressive weakness causes increasing falls' },
    ],
  },

  // --- Not crawling ---
  {
    id: 'motor_not_crawling_normal_8_10',
    observationPatterns: ['not crawling', 'doesn\'t crawl', 'no crawling', 'skipped crawling', 'won\'t crawl', 'doesn\'t move forward'],
    domain: 'motor',
    ageMinMonths: 8, ageMaxMonths: 12,
    conditionName: 'Normal variant — some children skip crawling',
    conditionCategory: 'normal_variant',
    baseProbability: 0.70,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'WHO Motor Development Study 2006; 4-7% of children never traditionally crawl',
    parentExplanation: 'Some children skip crawling entirely and go straight to pulling up and walking. Others bottom-shuffle or commando-crawl instead. This is usually normal.',
    parentNextSteps: ['Does your child move around somehow? (rolling, scooting, bottom-shuffling)', 'Can your child sit without support?', 'Does your child reach for toys effectively?'],
    doctorExamPoints: ['Alternative locomotion assessment', 'Tone in lower limbs', 'Hip examination', 'Upper body strength'],
    modifiers: [
      { source: 'milestone_status', key: 'sits_without_support_achieved', description: 'Sits independently', multiplier: 1.3, explanation: 'Good sitting means core strength is intact' },
      { source: 'prior_observation', key: 'bottom_shuffler', description: 'Bottom-shuffles instead', multiplier: 1.5, explanation: 'Bottom-shufflers commonly skip crawling — this is a known normal variant' },
    ],
  },

  // --- Head tilt ---
  {
    id: 'motor_head_tilt_torticollis_0_6',
    observationPatterns: ['head tilt', 'tilts head', 'head always turned', 'neck to one side', 'prefers looking one direction', 'head tilting'],
    domain: 'musculoskeletal',
    ageMinMonths: 0, ageMaxMonths: 6,
    conditionName: 'Congenital muscular torticollis',
    icd10: 'M43.6',
    conditionCategory: 'structural',
    baseProbability: 0.65,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP Musculoskeletal Guidelines; incidence 0.3-2% of newborns',
    parentExplanation: 'Torticollis means the neck muscles are tight on one side, causing the head to tilt. It\'s very common in babies and responds well to physiotherapy, especially when caught early.',
    parentNextSteps: ['Can your baby turn their head both ways equally?', 'Do you feel a lump on one side of the neck?', 'Was your baby breech?', 'Does your baby have a flat spot on one side of the head?'],
    doctorExamPoints: ['Neck ROM assessment', 'SCM mass palpation', 'Skull shape (plagiocephaly)', 'Hip examination (associated DDH)', 'Red reflex bilateral'],
    ruleOutBefore: ['Visual preference tilt', 'Posterior fossa lesion'],
    modifiers: [
      { source: 'birth_history', key: 'breech', description: 'Breech presentation', multiplier: 2.0, explanation: 'Breech position increases torticollis risk due to intrauterine positioning' },
      { source: 'birth_history', key: 'assisted_delivery', description: 'Assisted delivery (forceps/vacuum)', multiplier: 1.5, explanation: 'Instrumental delivery can cause SCM injury' },
      { source: 'prior_observation', key: 'flat_head', description: 'Flat spot noted on head', multiplier: 1.5, explanation: 'Plagiocephaly often accompanies torticollis — the two feed each other' },
    ],
  },
  {
    id: 'motor_head_tilt_visual_0_12',
    observationPatterns: ['head tilt', 'tilts head', 'head tilting'],
    domain: 'vision',
    ageMinMonths: 0, ageMaxMonths: 24,
    conditionName: 'Compensatory head tilt (visual)',
    icd10: 'H50.9',
    conditionCategory: 'sensory',
    baseProbability: 0.12,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'AAP Vision Screening Guidelines; 4th nerve palsy is commonest cause of visual head tilt',
    parentExplanation: 'Sometimes children tilt their head to compensate for an eye alignment issue. The brain adjusts the head position to see clearly. An eye check can determine if this is the cause.',
    parentNextSteps: ['Does your baby make good eye contact?', 'Do the eyes appear straight?', 'Has vision screening been done?'],
    doctorExamPoints: ['Red reflex bilateral', 'Cover/uncover test', '4th nerve palsy assessment', 'Fundoscopy if suspicion'],
    modifiers: [
      { source: 'screening_result', key: 'vision_not_done', description: 'Vision screening not completed', multiplier: 1.5, explanation: 'Can\'t rule out visual cause without examination' },
      { source: 'prior_observation', key: 'squinting', description: 'Squinting observed', multiplier: 2.5, explanation: 'Squinting + head tilt strongly suggests visual origin' },
    ],
  },
  {
    id: 'motor_head_tilt_posterior_fossa_0_60',
    observationPatterns: ['head tilt', 'tilts head', 'sudden head tilt', 'new head tilt'],
    domain: 'neurological',
    ageMinMonths: 0, ageMaxMonths: 60,
    conditionName: 'Posterior fossa lesion',
    icd10: 'D43.1',
    conditionCategory: 'neoplastic',
    baseProbability: 0.005,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'Nelson\'s Textbook 22nd Ed; posterior fossa tumors present with head tilt, vomiting, ataxia',
    parentExplanation: 'Very rarely, a head tilt that appears suddenly can be a sign of a brain condition. This is uncommon, but your doctor can check for it with a simple examination.',
    parentNextSteps: ['Is this a new/sudden head tilt or has it been there since birth?', 'Has your child been vomiting, especially in the morning?', 'Has your child lost any skills they previously had?', 'Has balance or coordination changed?'],
    doctorExamPoints: ['Fundoscopy (papilledema)', 'Cerebellar signs', 'Head circumference (increasing?)', 'New onset ataxia', 'Morning vomiting pattern', 'MRI if clinical suspicion'],
    modifiers: [
      { source: 'prior_observation', key: 'vomiting_morning', description: 'Morning vomiting reported', multiplier: 10.0, explanation: 'Morning vomiting + head tilt = raised intracranial pressure until proven otherwise' },
      { source: 'prior_observation', key: 'regression', description: 'Skill regression reported', multiplier: 8.0, explanation: 'Regression with new head tilt is a red flag for intracranial pathology' },
      { source: 'growth_trend', key: 'hc_increasing', description: 'Head circumference increasing rapidly', multiplier: 5.0, explanation: 'Rapidly increasing HC suggests hydrocephalus' },
    ],
  },

  // ═══════════════════════════════════════════
  // LANGUAGE & COMMUNICATION
  // ═══════════════════════════════════════════

  // --- Not talking / speech delay ---
  {
    id: 'language_no_words_normal_12_15',
    observationPatterns: ['not talking', 'no words', 'doesn\'t talk', 'hasn\'t said first word', 'no speech', 'silent', 'not speaking', 'late talker'],
    domain: 'language',
    ageMinMonths: 12, ageMaxMonths: 15,
    conditionName: 'Normal variant — still within range for first words',
    conditionCategory: 'normal_variant',
    baseProbability: 0.55,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'AAP; first words expected 9-14 months, many normal children start at 15 months',
    parentExplanation: 'First words typically appear between 9 and 14 months, but some children are later and still develop perfectly normal speech. The important thing is whether your child understands language and communicates through gestures.',
    parentNextSteps: ['Does your child babble with different consonant sounds (ba-ba, da-da, ma-ma)?', 'Does your child point at things they want?', 'Does your child understand simple words like "no" or "bye-bye"?', 'Does your child respond to their name?'],
    doctorExamPoints: ['Receptive language assessment', 'Gesture use (pointing, waving)', 'Babbling variety', 'Hearing screen if not done recently', 'Social engagement quality'],
    modifiers: [
      { source: 'milestone_status', key: 'babbles_achieved', description: 'Babbling with consonants', multiplier: 1.3, explanation: 'Good babbling is a strong predictor of imminent words' },
      { source: 'milestone_status', key: 'points_to_show_achieved', description: 'Points to request/show', multiplier: 1.5, explanation: 'Pointing is a critical pre-language skill — if present, words are likely coming' },
      { source: 'screening_result', key: 'hearing_passed', description: 'Hearing screen passed', multiplier: 1.2, explanation: 'Normal hearing rules out a major cause of speech delay' },
      { source: 'family_history', key: 'late_talkers', description: 'Family history of late talking', multiplier: 1.3, explanation: 'Late talking commonly runs in families ("Einstein syndrome")' },
    ],
  },
  {
    id: 'language_no_words_hearing_loss_12_24',
    observationPatterns: ['not talking', 'no words', 'doesn\'t talk', 'not speaking', 'delayed speech', 'speech delay', 'not responding to sounds', 'ignores when called'],
    domain: 'hearing',
    ageMinMonths: 12, ageMaxMonths: 36,
    conditionName: 'Hearing loss (sensorineural or conductive)',
    icd10: 'H90',
    conditionCategory: 'sensory',
    baseProbability: 0.08,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP Hearing Screening Guidelines 2023; 1-3/1000 bilateral SNHL at birth, additional late-onset/acquired',
    parentExplanation: 'Hearing loss is one of the most important causes of speech delay because children learn to talk by hearing language around them. Even mild hearing loss can significantly delay speech. The good news is that early intervention (hearing aids or therapy) produces excellent outcomes.',
    parentNextSteps: ['Does your child turn toward sounds?', 'Does your child respond differently to your voice vs a stranger\'s?', 'Has your child had frequent ear infections?', 'Was the newborn hearing screen done? What was the result?'],
    doctorExamPoints: ['Otoscopy (middle ear effusion?)', 'Free-field hearing assessment', 'Formal audiometry (BERA/ABR) referral', 'Tympanometry', 'Check newborn hearing screen result'],
    modifiers: [
      { source: 'screening_result', key: 'hearing_failed', description: 'Failed hearing screen', multiplier: 8.0, explanation: 'Failed hearing screen strongly suggests hearing loss' },
      { source: 'screening_result', key: 'hearing_not_done', description: 'Hearing screening never done', multiplier: 2.0, explanation: 'Can\'t rule out hearing loss without screening' },
      { source: 'recent_illness', key: 'recurrent_otitis', description: 'Recurrent ear infections', multiplier: 3.0, explanation: 'Recurrent OM causes conductive hearing loss (OME)' },
      { source: 'family_history', key: 'hearing_loss', description: 'Family history of childhood hearing loss', multiplier: 4.0, explanation: 'Genetic hearing loss is common — many types are hereditary' },
      { source: 'birth_history', key: 'nicu_stay', description: 'NICU admission', multiplier: 2.5, explanation: 'NICU stay is a risk factor for sensorineural hearing loss' },
      { source: 'milestone_status', key: 'responds_to_name_not_started', description: 'Not responding to name', multiplier: 3.0, explanation: 'Not responding to name could indicate hearing difficulty' },
    ],
  },
  {
    id: 'language_no_words_autism_16_30',
    observationPatterns: ['not talking', 'no words', 'lost words', 'stopped talking', 'doesn\'t point', 'no eye contact', 'doesn\'t respond to name', 'in their own world', 'regression', 'lost skills'],
    domain: 'behavioral',
    ageMinMonths: 12, ageMaxMonths: 36,
    conditionName: 'Autism spectrum disorder',
    icd10: 'F84.0',
    conditionCategory: 'developmental',
    baseProbability: 0.06,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP ASD Guidelines 2024; M-CHAT-R/F at 16-30 months; prevalence ~1:36 (CDC 2023)',
    parentExplanation: 'Autism spectrum disorder can cause speech delay along with differences in social communication. Early detection and intervention (before age 3) leads to the best outcomes. This doesn\'t mean your child has autism — but it\'s important to evaluate if there are concerns.',
    parentNextSteps: ['Does your child make eye contact?', 'Does your child point to show you things (not just to request)?', 'Does your child play pretend games?', 'Does your child respond when you call their name?', 'Does your child show interest in other children?', 'Has your child lost any words or skills they had before?'],
    doctorExamPoints: ['M-CHAT-R/F screening (16-30 months)', 'Joint attention assessment', 'Social reciprocity', 'Repetitive behaviors', 'Sensory preferences', 'Play quality', 'Formal developmental evaluation referral if positive'],
    ruleOutBefore: ['Hearing loss', 'Iron deficiency (can affect attention/engagement)', 'Vision impairment', 'Global developmental delay'],
    modifiers: [
      { source: 'milestone_status', key: 'regression', description: 'Loss of previously acquired skills', multiplier: 5.0, explanation: 'Language regression is a key red flag — occurs in ~25% of ASD cases' },
      { source: 'milestone_status', key: 'social_smile_delayed', description: 'Social smile was delayed', multiplier: 3.0, explanation: 'Early social milestone delays increase ASD concern' },
      { source: 'milestone_status', key: 'points_to_show_not_started', description: 'Does not point to show/share', multiplier: 4.0, explanation: 'Absence of declarative pointing by 14 months is one of the strongest early predictors' },
      { source: 'milestone_status', key: 'waves_bye_not_started', description: 'Does not wave bye-bye', multiplier: 2.5, explanation: 'Absence of gestures supports social communication concern' },
      { source: 'prior_observation', key: 'repetitive_behaviors', description: 'Repetitive behaviors observed', multiplier: 3.0, explanation: 'Repetitive/stereotyped behaviors are a core ASD feature' },
      { source: 'family_history', key: 'asd', description: 'Family history of autism', multiplier: 3.0, explanation: 'ASD has strong genetic component — sibling recurrence ~20%' },
      { source: 'prior_observation', key: 'no_eye_contact', description: 'Poor eye contact', multiplier: 3.5, explanation: 'Reduced eye contact is an early marker' },
      { source: 'screening_result', key: 'hearing_passed', description: 'Hearing is normal', multiplier: 1.5, explanation: 'Normal hearing makes hearing loss less likely and ASD relatively more likely' },
    ],
  },
  {
    id: 'language_no_words_global_delay_12_36',
    observationPatterns: ['not talking', 'behind in everything', 'slow development', 'delayed in all areas', 'not reaching milestones'],
    domain: 'cognitive',
    ageMinMonths: 12, ageMaxMonths: 60,
    conditionName: 'Global developmental delay',
    icd10: 'F88',
    conditionCategory: 'developmental',
    baseProbability: 0.04,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP Developmental Assessment Guidelines; GDD prevalence 1-3%',
    parentExplanation: 'When a child is delayed in multiple areas (not just speech), it may indicate a broader developmental difference. Early assessment can identify the cause and guide intervention for the best outcomes.',
    parentNextSteps: ['Is your child delayed in other areas too (movement, understanding, social skills)?', 'Has your child had any blood tests or genetic testing?', 'Was your child\'s newborn screening normal?'],
    doctorExamPoints: ['Full developmental assessment (ASQ-3, DASII)', 'Thyroid function', 'Genetic evaluation (karyotype, microarray)', 'Metabolic screen if warranted', 'MRI brain if dysmorphic features or neurological signs'],
    modifiers: [
      { source: 'milestone_status', key: 'multiple_domains_delayed', description: 'Delays in 2+ developmental domains', multiplier: 5.0, explanation: 'Multi-domain delays define GDD' },
      { source: 'birth_history', key: 'consanguinity', description: 'Consanguineous parents', multiplier: 3.0, explanation: 'Increases risk of autosomal recessive conditions causing GDD' },
      { source: 'growth_trend', key: 'hc_small', description: 'Microcephaly (small head circumference)', multiplier: 4.0, explanation: 'Microcephaly + developmental delay suggests genetic or metabolic cause' },
    ],
  },
  {
    id: 'language_no_words_iron_deficiency_12_36',
    observationPatterns: ['not talking', 'delayed speech', 'irritable', 'poor attention', 'picky eater', 'pale', 'low energy'],
    domain: 'gi_nutrition',
    ageMinMonths: 6, ageMaxMonths: 36,
    conditionName: 'Iron deficiency anemia',
    icd10: 'D50.9',
    conditionCategory: 'nutritional',
    baseProbability: 0.15,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP Iron Deficiency Guidelines; prevalence 50-70% in Indian children under 5',
    parentExplanation: 'Iron deficiency is extremely common in Indian children and can affect brain development, attention, and speech. The good news is it\'s easily treatable with iron supplements and diet changes.',
    parentNextSteps: ['Is your child\'s diet rich in iron? (meat, spinach, lentils, fortified cereals)', 'Does your child drink a lot of milk? (excessive milk can reduce iron absorption)', 'Does your child seem pale — check inner eyelids and nail beds?', 'Is your child exclusively breastfed without iron supplement?'],
    doctorExamPoints: ['Pallor check (conjunctiva, nail beds)', 'CBC with iron studies', 'Serum ferritin', 'Diet history'],
    modifiers: [
      { source: 'diet', key: 'exclusively_breastfed_no_iron', description: 'Exclusively breastfed without iron supplement after 4 months', multiplier: 2.5, explanation: 'Breast milk iron insufficient after 4-6 months — AAP/IAP recommend supplementation' },
      { source: 'diet', key: 'excessive_milk', description: 'Drinks >500ml cow milk/day', multiplier: 2.0, explanation: 'Excess cow milk inhibits iron absorption and displaces iron-rich foods' },
      { source: 'diet', key: 'low_food_diversity', description: 'Low food diversity score', multiplier: 1.8, explanation: 'Poor dietary variety increases iron deficiency risk' },
      { source: 'prior_observation', key: 'pallor', description: 'Pallor noted', multiplier: 2.5, explanation: 'Pallor is a clinical sign of anemia' },
      { source: 'birth_history', key: 'low_birth_weight', description: 'Low birth weight (<2500g)', multiplier: 2.0, explanation: 'Low birth weight babies have lower iron stores' },
    ],
  },

  // --- Doesn't respond to name ---
  {
    id: 'language_no_name_response_normal_5_9',
    observationPatterns: ['doesn\'t respond to name', 'ignores name', 'won\'t look when called', 'not turning to name'],
    domain: 'language',
    ageMinMonths: 5, ageMaxMonths: 9,
    conditionName: 'Normal — still developing this skill',
    conditionCategory: 'normal_variant',
    baseProbability: 0.60,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'AAP; name response expected 5-9 months',
    parentExplanation: 'Responding to their name is a skill that develops between 5 and 9 months. If your child is in this range, they may still be learning. However, if they consistently don\'t respond, it\'s worth mentioning at your next visit.',
    parentNextSteps: ['Does your child turn toward other sounds (clapping, music)?', 'Does your child look at you when you approach?', 'Try calling when they\'re not focused on a toy'],
    doctorExamPoints: ['Free-field hearing assessment', 'Social engagement quality', 'Eye contact assessment'],
    modifiers: [
      { source: 'milestone_status', key: 'babbles_achieved', description: 'Good babbling present', multiplier: 1.3, explanation: 'Babbling indicates hearing and vocal development are on track' },
    ],
  },
  {
    id: 'language_no_name_response_hearing_6_24',
    observationPatterns: ['doesn\'t respond to name', 'doesn\'t respond to sounds', 'ignores when called', 'not hearing us', 'have to shout', 'only responds when facing'],
    domain: 'hearing',
    ageMinMonths: 6, ageMaxMonths: 36,
    conditionName: 'Hearing impairment',
    icd10: 'H90',
    conditionCategory: 'sensory',
    baseProbability: 0.10,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP Hearing Guidelines; JCIH 2019 position statement',
    parentExplanation: 'If your child doesn\'t consistently respond to their name or sounds, hearing should be checked. Even mild hearing loss can significantly affect language development. Early detection means early intervention.',
    parentNextSteps: ['Does your child respond to quiet sounds from behind?', 'Does your child seem to hear sometimes but not others?', 'Has your child had recent ear infections or colds?'],
    doctorExamPoints: ['Otoscopy', 'Tympanometry', 'BERA/ABR referral', 'OAE if not done'],
    modifiers: [
      { source: 'screening_result', key: 'hearing_not_done', description: 'No hearing screening on record', multiplier: 2.5, explanation: 'Cannot rule out hearing loss without formal screening' },
      { source: 'recent_illness', key: 'ear_infection', description: 'Recent ear infection', multiplier: 3.0, explanation: 'OME after infection causes temporary conductive hearing loss' },
      { source: 'prior_observation', key: 'responds_to_some_sounds', description: 'Responds to some sounds but not name', multiplier: 0.5, explanation: 'Selective response suggests hearing may be intact — consider social vs hearing cause' },
    ],
  },

  // ═══════════════════════════════════════════
  // VISION
  // ═══════════════════════════════════════════

  {
    id: 'vision_squinting_refractive_24_144',
    observationPatterns: ['squinting', 'squints', 'closing one eye', 'scrunching eyes', 'sits close to TV', 'holds phone very close', 'nose on book'],
    domain: 'vision',
    ageMinMonths: 24, ageMaxMonths: 144,
    conditionName: 'Refractive error (myopia/hyperopia/astigmatism)',
    icd10: 'H52',
    conditionCategory: 'sensory',
    baseProbability: 0.55,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP Vision Screening 2023; myopia prevalence 10-20% in Indian school children',
    parentExplanation: 'Squinting or sitting close to screens often means your child needs glasses. Refractive errors are very common and easily corrected. Vision screening can detect this in minutes.',
    parentNextSteps: ['Does your child squint or close one eye in bright light?', 'Does your child complain of headaches?', 'Does your child tilt their head to see?', 'Has vision screening been done?'],
    doctorExamPoints: ['Visual acuity (age-appropriate chart)', 'Spot Vision Screener if available', 'Cover test', 'Ophthalmology referral if abnormal'],
    modifiers: [
      { source: 'family_history', key: 'myopia', description: 'Parents wear glasses', multiplier: 2.0, explanation: 'Myopia is strongly hereditary' },
      { source: 'prior_observation', key: 'headaches', description: 'Headaches reported', multiplier: 2.0, explanation: 'Uncorrected refractive error causes eyestrain headaches' },
      { source: 'environment', key: 'high_screen_time', description: 'Excessive screen time', multiplier: 1.5, explanation: 'Near-work and screen time increase myopia progression' },
      { source: 'screening_result', key: 'vision_abnormal', description: 'Failed vision screening', multiplier: 5.0, explanation: 'Failed screening confirms likely refractive error' },
    ],
  },
  {
    id: 'vision_squint_strabismus_0_72',
    observationPatterns: ['cross-eyed', 'eyes crossing', 'eye turns in', 'eye turns out', 'lazy eye', 'wandering eye', 'squint in eye', 'eyes not aligned', 'one eye drifts'],
    domain: 'vision',
    ageMinMonths: 4, ageMaxMonths: 72,
    conditionName: 'Strabismus (eye misalignment)',
    icd10: 'H50',
    conditionCategory: 'sensory',
    baseProbability: 0.45,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP Vision Guidelines; prevalence 2-4%; amblyopia risk if untreated before age 7',
    parentExplanation: 'If one eye appears to turn in or out, this is called strabismus. It\'s important to treat early because the brain may start to ignore the misaligned eye, leading to permanent vision loss in that eye (amblyopia). Before age 7, treatment is highly effective.',
    parentNextSteps: ['Does it happen all the time or intermittently?', 'Does it get worse when your child is tired?', 'Is it always the same eye?', 'Does your child cover or close one eye?'],
    doctorExamPoints: ['Corneal light reflex test', 'Cover-uncover test', 'Alternate cover test', 'Red reflex (Bruckner test)', 'Ophthalmology referral — URGENT if constant or >4 months old'],
    modifiers: [
      { source: 'birth_history', key: 'preterm', description: 'Born preterm', multiplier: 2.0, explanation: 'Preterm birth increases strabismus risk' },
      { source: 'family_history', key: 'strabismus', description: 'Family history of strabismus', multiplier: 2.5, explanation: 'Strong genetic component' },
      { source: 'prior_observation', key: 'constant_squint', description: 'Squint is constant (not intermittent)', multiplier: 2.0, explanation: 'Constant strabismus needs more urgent evaluation than intermittent' },
    ],
  },
  {
    id: 'vision_no_eye_contact_0_3',
    observationPatterns: ['no eye contact', 'doesn\'t look at me', 'doesn\'t focus', 'eyes not tracking', 'doesn\'t follow face', 'eyes wander'],
    domain: 'vision',
    ageMinMonths: 0, ageMaxMonths: 6,
    conditionName: 'Cortical visual impairment or congenital blindness',
    icd10: 'H47.6',
    conditionCategory: 'neurological',
    baseProbability: 0.02,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'Nelson\'s 22nd Ed; CVI is leading cause of childhood visual impairment in developed countries',
    parentExplanation: 'If your baby doesn\'t make eye contact or follow your face by 6-8 weeks, this needs urgent evaluation. Most often it\'s a delay that resolves, but vision problems caught early have the best outcomes.',
    parentNextSteps: ['Does your baby blink when a bright light is shone?', 'Does your baby turn toward a bright window?', 'Has your baby\'s red reflex (eye glow in photos) been checked?'],
    doctorExamPoints: ['Red reflex test — URGENT (rules out retinoblastoma, congenital cataract)', 'Pupillary reactions', 'Fix and follow assessment', 'Fundoscopy', 'Ophthalmology referral if absent fix/follow by 6 weeks'],
    modifiers: [
      { source: 'birth_history', key: 'birth_asphyxia', description: 'Birth asphyxia', multiplier: 5.0, explanation: 'HIE is a major cause of CVI' },
      { source: 'birth_history', key: 'very_preterm', description: 'Very preterm (<32 weeks)', multiplier: 4.0, explanation: 'ROP risk and periventricular injury' },
      { source: 'screening_result', key: 'red_reflex_abnormal', description: 'Abnormal red reflex', multiplier: 10.0, explanation: 'EMERGENCY — could be retinoblastoma or congenital cataract' },
    ],
  },

  // ═══════════════════════════════════════════
  // HEARING
  // ═══════════════════════════════════════════

  {
    id: 'hearing_no_response_sound_0_6',
    observationPatterns: ['doesn\'t respond to sounds', 'no startle', 'ignores loud noises', 'not turning to sound', 'not hearing', 'deaf'],
    domain: 'hearing',
    ageMinMonths: 0, ageMaxMonths: 6,
    conditionName: 'Congenital hearing loss',
    icd10: 'H90.5',
    conditionCategory: 'sensory',
    baseProbability: 0.15,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'JCIH 2019; universal newborn hearing screening; 1-3/1000 bilateral SNHL',
    parentExplanation: 'If your baby doesn\'t startle to loud sounds or turn toward voices, hearing should be checked urgently. Early intervention (before 6 months) for hearing loss gives the best language outcomes.',
    parentNextSteps: ['Does your baby startle to a sudden loud noise?', 'Does your baby calm when hearing your voice?', 'Was the newborn hearing screen done?'],
    doctorExamPoints: ['OAE or ABR if not done at birth', 'URGENT audiology referral', 'Check for risk factors (NICU, jaundice, family history, TORCH infections)'],
    modifiers: [
      { source: 'screening_result', key: 'hearing_failed', description: 'Failed newborn hearing screen', multiplier: 10.0, explanation: 'Failed screen requires urgent follow-up — 30% drop-off rate nationally' },
      { source: 'birth_history', key: 'nicu_stay', description: 'NICU stay', multiplier: 3.0, explanation: 'Ototoxic medications and prematurity increase risk' },
      { source: 'family_history', key: 'hearing_loss', description: 'Family history of childhood hearing loss', multiplier: 4.0, explanation: 'Hereditary hearing loss is common' },
      { source: 'birth_history', key: 'severe_jaundice', description: 'Severe neonatal jaundice', multiplier: 3.0, explanation: 'Hyperbilirubinemia can cause auditory neuropathy' },
    ],
  },

  // ═══════════════════════════════════════════
  // GI / NUTRITION / FEEDING
  // ═══════════════════════════════════════════

  {
    id: 'gi_vomiting_gerd_0_6',
    observationPatterns: ['spitting up', 'vomiting', 'spit up', 'throws up after feed', 'reflux', 'arching back during feed', 'fussy during feeding'],
    domain: 'gi_nutrition',
    ageMinMonths: 0, ageMaxMonths: 12,
    conditionName: 'Gastroesophageal reflux (GER/GERD)',
    icd10: 'K21.0',
    conditionCategory: 'functional',
    baseProbability: 0.50,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP GER Guidelines; 50% of infants have physiological reflux, peaks at 4 months',
    parentExplanation: 'Spitting up is extremely common in babies — over half of all infants spit up regularly. It usually peaks around 4 months and resolves by 12-18 months. It\'s concerning only if it affects weight gain or causes significant distress.',
    parentNextSteps: ['Is your baby gaining weight normally?', 'Does your baby arch their back or cry during feeds?', 'Is the spit-up forceful (projectile) or just dribbling?', 'Is your baby feeding well otherwise?'],
    doctorExamPoints: ['Weight gain trajectory', 'Feeding history (volume, frequency)', 'Distinguish GER vs GERD (happy spitter vs distressed)', 'Rule out pyloric stenosis if projectile (2-8 weeks)'],
    modifiers: [
      { source: 'growth_trend', key: 'weight_stable', description: 'Weight gain is normal', multiplier: 1.3, explanation: 'Normal weight gain = physiological GER ("happy spitter")' },
      { source: 'growth_trend', key: 'weight_faltering', description: 'Poor weight gain', multiplier: 0.5, explanation: 'Poor weight gain + vomiting = may be GERD or other cause — needs evaluation' },
      { source: 'prior_observation', key: 'projectile_vomiting', description: 'Projectile vomiting', multiplier: 0.3, explanation: 'Projectile vomiting is NOT typical GER — rule out pyloric stenosis (2-8 weeks)' },
    ],
  },
  {
    id: 'gi_vomiting_pyloric_stenosis_2_8wk',
    observationPatterns: ['projectile vomiting', 'vomits forcefully', 'hungry after vomiting', 'vomiting worse', 'vomiting getting more frequent'],
    domain: 'gi_nutrition',
    ageMinMonths: 0.5, ageMaxMonths: 4,
    conditionName: 'Pyloric stenosis',
    icd10: 'Q40.0',
    conditionCategory: 'structural',
    baseProbability: 0.08,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'Nelson\'s 22nd Ed; incidence 2-5/1000; 4:1 male predominance',
    parentExplanation: 'Pyloric stenosis is a condition where the muscle at the stomach outlet thickens and blocks food from passing. It causes forceful (projectile) vomiting that gets worse over days. It\'s treatable with a simple surgery with excellent outcomes.',
    parentNextSteps: ['Does the vomiting shoot across the room?', 'Does your baby seem hungry again immediately after vomiting?', 'Is the vomiting getting worse each day?', 'Is the vomit green/bile-stained? (if yes, this is a different emergency)'],
    doctorExamPoints: ['Palpate for pyloric "olive"', 'Test feed and observe', 'Ultrasound pylorus', 'Electrolytes (hypochloremic alkalosis)', 'URGENT surgical referral if confirmed'],
    modifiers: [
      { source: 'birth_history', key: 'male', description: 'Male infant', multiplier: 4.0, explanation: '4:1 male predominance in pyloric stenosis' },
      { source: 'birth_history', key: 'firstborn', description: 'First-born child', multiplier: 1.5, explanation: 'Slightly more common in firstborns' },
      { source: 'prior_observation', key: 'vomiting_progressive', description: 'Vomiting is getting worse over days', multiplier: 3.0, explanation: 'Progressive vomiting is the hallmark — distinguishes from GER' },
    ],
  },
  {
    id: 'gi_white_stool_biliary_atresia_0_3',
    observationPatterns: ['white stool', 'pale stool', 'clay colored stool', 'chalky stool', 'grey stool', 'light colored poop', 'stool not yellow'],
    domain: 'gi_nutrition',
    ageMinMonths: 0, ageMaxMonths: 3,
    conditionName: 'Biliary atresia',
    icd10: 'Q44.2',
    conditionCategory: 'structural',
    baseProbability: 0.60,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'IAP Neonatal Cholestasis Guidelines; incidence 1:10,000; Kasai portoenterostomy must be done before 60 days for best outcome',
    parentExplanation: 'Pale, white, or clay-colored stools in a young baby can indicate a blockage in the bile ducts. This is a medical emergency because early surgery (ideally before 60 days of life) gives the best outcomes. Please see your doctor TODAY.',
    parentNextSteps: ['URGENT: See your pediatrician TODAY', 'Is your baby jaundiced (yellow skin/eyes)?', 'Take a photo of the stool to show the doctor', 'Is the urine dark/tea-colored?'],
    doctorExamPoints: ['EMERGENCY — same day evaluation', 'Check direct bilirubin (fractionated bilirubin)', 'Liver ultrasound', 'Stool color card assessment', 'Hepatology/surgery referral URGENT', 'Kasai procedure ideally before day 60'],
    modifiers: [
      { source: 'prior_observation', key: 'prolonged_jaundice', description: 'Jaundice beyond 2 weeks', multiplier: 5.0, explanation: 'Conjugated jaundice + pale stools = biliary atresia until proven otherwise' },
      { source: 'prior_observation', key: 'dark_urine', description: 'Dark urine noted', multiplier: 3.0, explanation: 'Dark urine + pale stool = obstructive pattern' },
    ],
  },
  {
    id: 'gi_picky_eating_normal_18_36',
    observationPatterns: ['picky eater', 'won\'t eat', 'refuses food', 'only eats', 'food fussy', 'meal time battle', 'not eating vegetables', 'stopped eating'],
    domain: 'gi_nutrition',
    ageMinMonths: 12, ageMaxMonths: 60,
    conditionName: 'Normal food neophobia / picky eating phase',
    conditionCategory: 'normal_variant',
    baseProbability: 0.65,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Nutrition Guidelines; food neophobia peaks 18-24 months, affects 25-50% of toddlers',
    parentExplanation: 'Picky eating is extremely common in toddlers — it\'s actually a normal developmental phase called food neophobia. Most children outgrow it. The key is to keep offering variety without pressure, and ensure growth is on track.',
    parentNextSteps: ['Is your child\'s weight and height growing normally?', 'Does your child eat at least some foods from each food group?', 'Is your child drinking too much milk or juice? (can suppress appetite)', 'Is mealtime stressful or pressure-filled?'],
    doctorExamPoints: ['Growth trajectory (weight, height)', 'Diet history (24-hour recall)', 'Iron/hemoglobin if concerned', 'Sensory assessment if extreme food aversion'],
    modifiers: [
      { source: 'growth_trend', key: 'weight_stable', description: 'Normal weight gain', multiplier: 1.3, explanation: 'Good growth despite pickiness = reassuring' },
      { source: 'growth_trend', key: 'weight_faltering', description: 'Weight dropping off curve', multiplier: 0.3, explanation: 'Faltering weight is NOT just picky eating — investigate further' },
      { source: 'prior_observation', key: 'texture_aversion', description: 'Gags/refuses certain textures', multiplier: 0.6, explanation: 'Texture aversion may indicate sensory processing issue — not simple pickiness' },
    ],
  },

  // ═══════════════════════════════════════════
  // BEHAVIORAL / EMOTIONAL
  // ═══════════════════════════════════════════

  {
    id: 'behavioral_tantrums_normal_18_48',
    observationPatterns: ['tantrums', 'meltdowns', 'screaming fits', 'hitting', 'biting', 'throwing things', 'uncontrollable crying', 'won\'t listen'],
    domain: 'behavioral',
    ageMinMonths: 18, ageMaxMonths: 48,
    conditionName: 'Normal developmental tantrums ("Terrible Twos")',
    conditionCategory: 'normal_variant',
    baseProbability: 0.70,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'AAP Bright Futures; tantrums peak 18-36 months, affect 50-80% of toddlers',
    parentExplanation: 'Tantrums are a normal part of development at this age. Your child is experiencing big emotions but doesn\'t yet have the language or self-regulation skills to express them. This usually improves significantly by age 4.',
    parentNextSteps: ['How often do tantrums happen? (several times daily vs once a week)', 'How long do they last? (under 15 min is typical)', 'Can your child be comforted after a tantrum?', 'Are tantrums only at home, or everywhere?'],
    doctorExamPoints: ['Frequency, duration, severity assessment', 'Rule out iron deficiency', 'Sleep adequacy assessment', 'Language development (can child express needs?)', 'Hearing screen if language delayed'],
    ruleOutBefore: ['Iron deficiency', 'Sleep deprivation', 'Hearing/speech delay (frustration from inability to communicate)'],
    modifiers: [
      { source: 'active_condition', key: 'iron_deficiency', description: 'Known iron deficiency', multiplier: 0.5, explanation: 'Iron deficiency causes irritability — treat iron first before labeling as behavioral' },
      { source: 'prior_observation', key: 'sleep_poor', description: 'Poor sleep reported', multiplier: 0.6, explanation: 'Sleep-deprived toddlers have more tantrums — address sleep first' },
      { source: 'milestone_status', key: 'language_delayed', description: 'Language delay', multiplier: 0.5, explanation: 'Tantrums from communication frustration — speech therapy may help more than behavioral intervention' },
      { source: 'prior_observation', key: 'tantrums_increasing', description: 'Tantrums getting worse/more frequent', multiplier: 0.6, explanation: 'Escalating pattern beyond age 3 warrants evaluation' },
    ],
  },
  {
    id: 'behavioral_tantrums_adhd_36_144',
    observationPatterns: ['tantrums', 'can\'t sit still', 'hyperactive', 'impulsive', 'doesn\'t listen', 'runs around', 'can\'t focus', 'attention problems', 'always moving'],
    domain: 'behavioral',
    ageMinMonths: 36, ageMaxMonths: 144,
    conditionName: 'ADHD (Attention Deficit Hyperactivity Disorder)',
    icd10: 'F90.0',
    conditionCategory: 'behavioral',
    baseProbability: 0.10,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP ADHD Guidelines; AAP; prevalence 5-7% globally, often underdiagnosed in India',
    parentExplanation: 'ADHD is a neurodevelopmental condition where children have difficulty with attention, impulse control, and/or hyperactivity. It\'s treatable with behavioral strategies and sometimes medication. A proper evaluation requires standardized assessments.',
    parentNextSteps: ['Does your child have difficulty in school/preschool?', 'Is the behavior the same at home and at school?', 'Can your child focus on things they enjoy (like screen time) but not on tasks?', 'Is your child impulsive — acts before thinking?'],
    doctorExamPoints: ['Vanderbilt ADHD Rating Scale (6-12y) from parents AND teachers', 'Conners Rating Scale', 'Rule out vision and hearing problems', 'Rule out iron deficiency', 'Rule out sleep disorders', 'Thyroid function if indicated'],
    ruleOutBefore: ['Iron deficiency', 'Sleep disorder', 'Vision impairment', 'Hearing loss', 'Anxiety'],
    modifiers: [
      { source: 'active_condition', key: 'iron_deficiency', description: 'Iron deficiency present', multiplier: 0.4, explanation: 'SKIDS Physiological First: Iron deficiency mimics ADHD symptoms — treat iron before diagnosing ADHD' },
      { source: 'prior_observation', key: 'sleep_poor', description: 'Chronic sleep issues', multiplier: 0.5, explanation: 'Sleep deprivation closely mimics ADHD — address sleep first' },
      { source: 'prior_observation', key: 'problems_multiple_settings', description: 'Behavior issues at home AND school', multiplier: 2.0, explanation: 'ADHD manifests across settings — if only at home, consider environment/parenting factors' },
      { source: 'family_history', key: 'adhd', description: 'Family history of ADHD', multiplier: 2.5, explanation: 'ADHD has strong heritability (~75%)' },
      { source: 'screening_result', key: 'vision_not_done', description: 'Vision not screened', multiplier: 1.5, explanation: 'Can\'t rule out vision-related attention problems without screening' },
    ],
  },
  {
    id: 'behavioral_anxiety_separation_6_36',
    observationPatterns: ['clingy', 'won\'t leave me', 'cries when I leave', 'separation anxiety', 'scared at school', 'refuses to go', 'screams when dropped off'],
    domain: 'emotional',
    ageMinMonths: 6, ageMaxMonths: 36,
    conditionName: 'Normal separation anxiety',
    conditionCategory: 'normal_variant',
    baseProbability: 0.80,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'AAP; separation anxiety peaks 10-18 months, normally resolves by 3 years',
    parentExplanation: 'Separation anxiety is a normal and healthy sign of attachment. It typically peaks around 12-18 months and gradually improves. Your child cries when you leave because they love you and haven\'t yet learned that you always come back.',
    parentNextSteps: ['Does your child calm down shortly after you leave?', 'Is your child happy and engaged once settled?', 'Is this getting worse or better over time?'],
    doctorExamPoints: ['Duration and severity assessment', 'Social engagement with others', 'Developmental history', 'Family stress assessment'],
    modifiers: [
      { source: 'prior_observation', key: 'calms_after_departure', description: 'Child calms within minutes after parent leaves', multiplier: 1.5, explanation: 'Quick recovery is completely normal' },
      { source: 'prior_observation', key: 'anxiety_worsening', description: 'Anxiety getting worse over months', multiplier: 0.4, explanation: 'Worsening separation anxiety beyond age 3 may be clinical — evaluate' },
    ],
  },
  {
    id: 'behavioral_anxiety_disorder_36_216',
    observationPatterns: ['very anxious', 'constant worry', 'afraid of everything', 'panic attacks', 'won\'t go to school', 'school refusal', 'stomachaches before school', 'can\'t sleep alone', 'nightmares every night'],
    domain: 'emotional',
    ageMinMonths: 36, ageMaxMonths: 216,
    conditionName: 'Anxiety disorder (generalized, social, or separation)',
    icd10: 'F41',
    conditionCategory: 'psychosocial',
    baseProbability: 0.15,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'AAP; anxiety disorders affect ~8% of children; underdiagnosed in India',
    parentExplanation: 'When worry becomes constant and starts interfering with daily life (school, sleep, friendships), it may be an anxiety disorder. This is very treatable with therapy (CBT) and sometimes medication. Getting help early prevents it from worsening.',
    parentNextSteps: ['Is the worry affecting school performance?', 'Does your child complain of stomachaches or headaches (with no medical cause)?', 'Has there been a recent life change (move, new school, family stress)?', 'Does your child avoid situations due to fear?'],
    doctorExamPoints: ['SCARED or Spence anxiety scale', 'Screen for depression (often comorbid)', 'Rule out thyroid dysfunction', 'Family stress assessment', 'CBT referral'],
    modifiers: [
      { source: 'family_history', key: 'anxiety', description: 'Family history of anxiety/depression', multiplier: 2.5, explanation: 'Strong genetic and environmental component' },
      { source: 'prior_observation', key: 'somatic_complaints', description: 'Recurrent stomachaches/headaches without medical cause', multiplier: 2.0, explanation: 'Somatic symptoms are the most common presentation of anxiety in children' },
      { source: 'environment', key: 'family_stress', description: 'Family stress (divorce, loss, move)', multiplier: 2.0, explanation: 'Environmental stressors can trigger anxiety in predisposed children' },
    ],
  },

  // ═══════════════════════════════════════════
  // SLEEP
  // ═══════════════════════════════════════════

  {
    id: 'sleep_snoring_adenoid_24_120',
    observationPatterns: ['snoring', 'snores', 'noisy breathing at night', 'mouth breathing', 'breathes through mouth', 'stops breathing sleep', 'restless sleep', 'sweats at night'],
    domain: 'respiratory',
    ageMinMonths: 12, ageMaxMonths: 120,
    conditionName: 'Adenoid/tonsillar hypertrophy with obstructive sleep apnea',
    icd10: 'G47.33',
    conditionCategory: 'structural',
    baseProbability: 0.40,
    mustNotMiss: true,
    urgency: 'soon',
    citation: 'AAP OSA Guidelines 2012; affects 1-5% of children; adenotonsillar hypertrophy peaks 3-6 years',
    parentExplanation: 'Snoring in children is NOT normal (unlike adults). It often means the tonsils and adenoids are large enough to partially block the airway during sleep. This affects sleep quality, which impacts behavior, growth, and learning.',
    parentNextSteps: ['Does your child breathe through their mouth during the day too?', 'Does your child pause breathing during sleep (observed apneas)?', 'Is your child a restless sleeper?', 'Is your child tired or irritable during the day despite adequate sleep hours?', 'Does your child wet the bed?'],
    doctorExamPoints: ['Tonsil size grading', 'Nasal examination (adenoid facies)', 'Growth trajectory (OSA affects growth hormone)', 'Lateral neck X-ray for adenoid size', 'Sleep study (polysomnography) if severe', 'ENT referral'],
    modifiers: [
      { source: 'prior_observation', key: 'mouth_breathing', description: 'Mouth breathing during day', multiplier: 2.0, explanation: 'Daytime mouth breathing suggests significant obstruction' },
      { source: 'prior_observation', key: 'behavioral_problems', description: 'Behavioral issues or ADHD symptoms', multiplier: 1.5, explanation: 'OSA causes ADHD-like symptoms due to sleep deprivation' },
      { source: 'growth_trend', key: 'weight_faltering', description: 'Poor growth', multiplier: 2.0, explanation: 'OSA disrupts growth hormone release during sleep' },
      { source: 'prior_observation', key: 'bedwetting', description: 'Bedwetting (enuresis)', multiplier: 1.5, explanation: 'OSA is an underrecognized cause of enuresis' },
    ],
  },

  // ═══════════════════════════════════════════
  // SKIN
  // ═══════════════════════════════════════════

  {
    id: 'skin_rash_eczema_1_60',
    observationPatterns: ['rash', 'itchy skin', 'dry skin', 'scratching', 'red patches', 'rough skin', 'skin rash', 'eczema flare'],
    domain: 'skin',
    ageMinMonths: 1, ageMaxMonths: 60,
    conditionName: 'Atopic dermatitis (eczema)',
    icd10: 'L20',
    conditionCategory: 'allergic',
    baseProbability: 0.45,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Allergy Guidelines; affects 15-20% of children; onset usually before age 5',
    parentExplanation: 'Eczema is very common in children — it causes dry, itchy, red patches. It\'s related to allergies and often runs in families. It\'s manageable with moisturizers and sometimes medicated creams. Most children outgrow it.',
    parentNextSteps: ['Where are the patches? (cheeks and outer limbs in babies, elbow/knee creases in older children)', 'Does it itch? Does your child scratch at night?', 'Is there a family history of eczema, asthma, or allergies?', 'Have you tried regular moisturizer?'],
    doctorExamPoints: ['Distribution pattern (age-dependent)', 'Severity scoring', 'Secondary infection signs', 'Emollient-first approach', 'Step-up therapy if needed'],
    modifiers: [
      { source: 'family_history', key: 'atopy', description: 'Family history of eczema/asthma/allergies', multiplier: 2.5, explanation: 'Atopic triad runs strongly in families' },
      { source: 'prior_observation', key: 'itching_at_night', description: 'Scratching disrupts sleep', multiplier: 1.5, explanation: 'Nighttime itch is characteristic of eczema' },
    ],
  },
  {
    id: 'skin_bruising_nonmobile_0_9',
    observationPatterns: ['bruise', 'bruising', 'mark', 'purple spot', 'black and blue'],
    domain: 'general',
    ageMinMonths: 0, ageMaxMonths: 9,
    conditionName: 'Non-accidental injury — MUST evaluate',
    icd10: 'T74.1',
    conditionCategory: 'environmental',
    baseProbability: 0.30,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: '"Those who don\'t cruise rarely bruise" — TEN-4 rule for concerning bruises',
    parentExplanation: 'Bruises in babies who are not yet crawling or walking are unusual because they don\'t move enough to injure themselves. Your doctor will want to check this to make sure everything is okay.',
    parentNextSteps: ['Where is the bruise located?', 'How did it happen?', 'Is your baby crawling or pulling up yet?'],
    doctorExamPoints: ['TEN-4 assessment (Torso, Ear, Neck in <4 years)', 'Full skin survey', 'Coagulation studies to rule out bleeding disorder', 'Skeletal survey if concern', 'Social work assessment if indicated'],
    ruleOutBefore: ['Bleeding disorder (ITP, hemophilia)', 'Mongolian spots (benign, present from birth)'],
    modifiers: [
      { source: 'milestone_status', key: 'not_mobile', description: 'Child is pre-mobile', multiplier: 3.0, explanation: 'Pre-mobile infants should not bruise — any bruise needs evaluation' },
      { source: 'prior_observation', key: 'multiple_bruises', description: 'Multiple bruises in different stages', multiplier: 3.0, explanation: 'Bruises of different ages suggest repeated injury' },
      { source: 'prior_observation', key: 'ear_bruise', description: 'Bruise on ear, neck, or torso', multiplier: 4.0, explanation: 'TEN-4 locations are highly concerning for non-accidental injury' },
    ],
  },

  // ═══════════════════════════════════════════
  // CARDIAC
  // ═══════════════════════════════════════════

  {
    id: 'cardiac_blue_spells_0_6',
    observationPatterns: ['turning blue', 'blue lips', 'blue around mouth', 'cyanosis', 'blue during feeding', 'blue during crying'],
    domain: 'cardiac',
    ageMinMonths: 0, ageMaxMonths: 12,
    conditionName: 'Congenital heart disease (cyanotic)',
    icd10: 'Q24.9',
    conditionCategory: 'structural',
    baseProbability: 0.25,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'IAP Cardiology Guidelines; CHD 8-10/1000 live births; cyanotic CHD needs urgent evaluation',
    parentExplanation: 'Blue coloring around the lips or during feeding/crying can indicate a heart condition. This needs immediate medical evaluation. Many congenital heart conditions are very treatable when caught early.',
    parentNextSteps: ['URGENT: See your doctor TODAY or go to emergency', 'Does the blue color come and go or is it constant?', 'Does your baby get sweaty or tired during feeds?', 'Does your baby breathe fast?'],
    doctorExamPoints: ['Pulse oximetry (pre- and post-ductal)', 'Auscultation for murmur', 'Femoral pulses', 'Chest X-ray', 'ECG', 'URGENT echocardiography', 'Pediatric cardiology referral'],
    modifiers: [
      { source: 'birth_history', key: 'low_spo2', description: 'Failed pulse oximetry at birth', multiplier: 10.0, explanation: 'Failed newborn pulse ox screening is definitive red flag' },
      { source: 'prior_observation', key: 'feeding_difficulty', description: 'Poor feeding / sweating during feeds', multiplier: 3.0, explanation: 'Heart failure presents as feeding difficulty in infants' },
      { source: 'prior_observation', key: 'fast_breathing', description: 'Fast breathing at rest', multiplier: 3.0, explanation: 'Tachypnea at rest suggests cardiac or respiratory compromise' },
      { source: 'family_history', key: 'chd', description: 'Family history of congenital heart disease', multiplier: 3.0, explanation: 'CHD has genetic component — sibling recurrence 2-6%' },
    ],
  },
  {
    id: 'cardiac_murmur_innocent_12_120',
    observationPatterns: ['heart murmur', 'doctor heard murmur', 'extra heart sound', 'murmur found'],
    domain: 'cardiac',
    ageMinMonths: 12, ageMaxMonths: 144,
    conditionName: 'Innocent (functional) heart murmur',
    conditionCategory: 'normal_variant',
    baseProbability: 0.75,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Cardiology; up to 80% of children have an innocent murmur at some point',
    parentExplanation: 'Innocent heart murmurs are very common in children — up to 80% of children will have one detected at some point. They are caused by normal blood flow and do NOT indicate heart disease. Your doctor can usually tell by listening carefully.',
    parentNextSteps: ['Was this found during a routine check or because of symptoms?', 'Does your child have any symptoms (shortness of breath, chest pain, fainting)?', 'Is your child active and growing normally?'],
    doctorExamPoints: ['Character of murmur (Still\'s murmur: musical, grade 1-2)', 'Variability with position', 'No radiation, no thrill', 'Normal growth and exercise tolerance', 'Echo if pathological features'],
    modifiers: [
      { source: 'growth_trend', key: 'weight_stable', description: 'Normal growth', multiplier: 1.3, explanation: 'Normal growth with murmur is very reassuring' },
      { source: 'prior_observation', key: 'exercise_intolerance', description: 'Can\'t keep up with peers', multiplier: 0.3, explanation: 'Exercise intolerance with murmur — needs echo to rule out pathology' },
      { source: 'prior_observation', key: 'fainting', description: 'Fainting episodes', multiplier: 0.1, explanation: 'Murmur + syncope = URGENT cardiology evaluation' },
    ],
  },

  // ═══════════════════════════════════════════
  // GROWTH
  // ═══════════════════════════════════════════

  {
    id: 'growth_poor_weight_gain_0_24',
    observationPatterns: ['not gaining weight', 'weight loss', 'thin', 'underweight', 'not growing', 'failure to thrive', 'too skinny', 'lost weight'],
    domain: 'growth',
    ageMinMonths: 0, ageMaxMonths: 60,
    conditionName: 'Faltering growth (failure to thrive) — inadequate intake',
    icd10: 'R62.51',
    conditionCategory: 'nutritional',
    baseProbability: 0.50,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP Growth Guidelines; faltering growth affects 5-10% of children <5 years in India',
    parentExplanation: 'When a child isn\'t gaining weight as expected, the most common reason is simply not getting enough calories — from picky eating, feeding difficulties, or not enough food variety. Your doctor can assess whether there\'s an underlying cause.',
    parentNextSteps: ['How is your child\'s appetite?', 'What does a typical day of eating look like?', 'Is your child having frequent diarrhea or vomiting?', 'Has your child been sick recently?'],
    doctorExamPoints: ['Plot weight-for-age, height-for-age, weight-for-height Z-scores', 'Detailed diet history (24-hr recall)', 'Stool examination', 'CBC, iron studies, thyroid', 'Celiac screen if >12 months', 'Urine analysis'],
    modifiers: [
      { source: 'diet', key: 'low_food_diversity', description: 'Low dietary diversity', multiplier: 2.0, explanation: 'Poor variety = likely inadequate nutrition' },
      { source: 'prior_observation', key: 'frequent_diarrhea', description: 'Frequent diarrhea/loose stools', multiplier: 0.4, explanation: 'Chronic diarrhea + poor growth = malabsorption (celiac, IBD, parasites)' },
      { source: 'growth_trend', key: 'weight_crossing_down', description: 'Weight crossing 2+ percentile lines', multiplier: 2.0, explanation: 'Crossing percentile lines is more concerning than being consistently small' },
      { source: 'birth_history', key: 'preterm', description: 'Born preterm', multiplier: 0.8, explanation: 'Preterm babies often follow lower growth curves — use corrected age' },
    ],
  },
  {
    id: 'growth_short_stature_24_216',
    observationPatterns: ['short', 'small for age', 'not growing taller', 'shorter than friends', 'height not increasing', 'growth stopped'],
    domain: 'growth',
    ageMinMonths: 24, ageMaxMonths: 216,
    conditionName: 'Familial short stature / constitutional growth delay',
    conditionCategory: 'normal_variant',
    baseProbability: 0.60,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Growth Guidelines; most common cause of short stature in healthy children',
    parentExplanation: 'Most children who are shorter than average have short parents (familial short stature) or are "late bloomers" who will catch up during puberty (constitutional delay). Both are normal. However, your doctor should evaluate to rule out other causes.',
    parentNextSteps: ['How tall are both parents?', 'When did the parents hit puberty?', 'Is your child growing at a steady rate, even if slowly?', 'Does your child have any other symptoms?'],
    doctorExamPoints: ['Height velocity (cm/year)', 'Midparental height calculation', 'Bone age X-ray (left wrist)', 'Thyroid function', 'IGF-1 and IGFBP-3', 'Celiac screen', 'CBC', 'Growth hormone stimulation test if indicated'],
    modifiers: [
      { source: 'family_history', key: 'short_parents', description: 'Both parents are short', multiplier: 2.0, explanation: 'Familial short stature — height follows genetic potential' },
      { source: 'growth_trend', key: 'height_velocity_normal', description: 'Growing at steady rate (normal velocity)', multiplier: 1.5, explanation: 'Normal growth velocity = likely familial, not pathological' },
      { source: 'growth_trend', key: 'height_velocity_declining', description: 'Growth velocity slowing', multiplier: 0.3, explanation: 'Declining growth velocity is a red flag — needs endocrine evaluation' },
    ],
  },
  {
    id: 'growth_large_head_0_24',
    observationPatterns: ['big head', 'head growing fast', 'large head', 'head circumference high', 'fontanelle bulging', 'soft spot bulging'],
    domain: 'neurological',
    ageMinMonths: 0, ageMaxMonths: 24,
    conditionName: 'Familial macrocephaly (benign)',
    conditionCategory: 'normal_variant',
    baseProbability: 0.50,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'Nelson\'s 22nd Ed; familial macrocephaly — measure parents\' head circumference',
    parentExplanation: 'A larger head often runs in families. The most important thing is whether the head is growing at a steady rate (following its own curve) or accelerating. Your doctor can check this easily.',
    parentNextSteps: ['Does either parent have a large head?', 'Is your baby developing normally?', 'Is the fontanelle (soft spot) flat or bulging?'],
    doctorExamPoints: ['Plot HC on growth chart — is it following a curve or crossing up?', 'Measure parents\' HC', 'Fontanelle assessment', 'Developmental assessment', 'Cranial ultrasound or MRI if crossing percentiles or symptomatic'],
    modifiers: [
      { source: 'family_history', key: 'large_head', description: 'Parent has large head circumference', multiplier: 2.5, explanation: 'Familial macrocephaly is the most common cause' },
      { source: 'growth_trend', key: 'hc_crossing_up', description: 'HC crossing percentile lines upward', multiplier: 0.2, explanation: 'Rapidly increasing HC needs urgent evaluation for hydrocephalus' },
      { source: 'milestone_status', key: 'normal_development', description: 'Normal developmental milestones', multiplier: 1.5, explanation: 'Normal development with big head = likely benign familial' },
    ],
  },
  {
    id: 'growth_large_head_hydrocephalus_0_24',
    observationPatterns: ['big head', 'head growing fast', 'bulging fontanelle', 'sun-setting eyes', 'vomiting', 'irritable'],
    domain: 'neurological',
    ageMinMonths: 0, ageMaxMonths: 24,
    conditionName: 'Hydrocephalus',
    icd10: 'G91',
    conditionCategory: 'structural',
    baseProbability: 0.05,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'Nelson\'s 22nd Ed; hydrocephalus incidence ~1/1000; URGENT neurosurgical referral needed',
    parentExplanation: 'If the head is growing too fast and the soft spot is bulging or tense, this could indicate fluid buildup in the brain. This needs immediate medical attention. Treatment is very effective when caught early.',
    parentNextSteps: ['URGENT: See your doctor TODAY', 'Is the soft spot tense or bulging?', 'Does your baby look downward a lot (sun-setting)?', 'Has your baby been vomiting?'],
    doctorExamPoints: ['Fontanelle tension', 'HC growth velocity (>2cm/month)', 'Sun-setting sign', 'Cranial ultrasound URGENT', 'URGENT neurosurgery referral'],
    modifiers: [
      { source: 'growth_trend', key: 'hc_crossing_up', description: 'HC rapidly crossing percentiles', multiplier: 5.0, explanation: 'Rapidly increasing HC is the hallmark of hydrocephalus in infants' },
      { source: 'prior_observation', key: 'bulging_fontanelle', description: 'Bulging fontanelle reported', multiplier: 5.0, explanation: 'Tense/bulging fontanelle indicates raised intracranial pressure' },
      { source: 'prior_observation', key: 'vomiting', description: 'Vomiting present', multiplier: 2.0, explanation: 'Vomiting from raised intracranial pressure' },
      { source: 'birth_history', key: 'preterm', description: 'Preterm birth', multiplier: 3.0, explanation: 'Post-hemorrhagic hydrocephalus is a complication of prematurity' },
    ],
  },

  // ═══════════════════════════════════════════
  // DENTAL
  // ═══════════════════════════════════════════

  {
    id: 'dental_no_teeth_10_18',
    observationPatterns: ['no teeth', 'teeth not coming', 'delayed teething', 'late teeth', 'hasn\'t got teeth'],
    domain: 'dental',
    ageMinMonths: 10, ageMaxMonths: 18,
    conditionName: 'Delayed tooth eruption — normal variant',
    conditionCategory: 'normal_variant',
    baseProbability: 0.75,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Dental Guidelines; first tooth 6-12 months, late eruption can be up to 15 months normally',
    parentExplanation: 'First teeth typically appear between 6 and 12 months, but some perfectly healthy children don\'t get teeth until 15 months or later. Late teething often runs in families and doesn\'t affect permanent teeth.',
    parentNextSteps: ['When did the parents get their first teeth?', 'Is your child eating and growing well?', 'Has your child had any thyroid tests?'],
    doctorExamPoints: ['Check gum ridges for swelling', 'Thyroid function if >18 months with no teeth', 'Calcium and Vitamin D levels', 'Consider dental X-ray if >18 months'],
    modifiers: [
      { source: 'family_history', key: 'late_teething', description: 'Family history of late teething', multiplier: 2.0, explanation: 'Late teething is strongly familial' },
      { source: 'active_condition', key: 'hypothyroidism', description: 'Known hypothyroidism', multiplier: 0.2, explanation: 'Hypothyroidism causes delayed eruption — check thyroid if not done' },
    ],
  },

  // ═══════════════════════════════════════════
  // ENDOCRINE
  // ═══════════════════════════════════════════

  {
    id: 'endocrine_early_puberty_72_108',
    observationPatterns: ['breast buds', 'pubic hair', 'body odor', 'growth spurt early', 'developing early', 'precocious puberty', 'periods early'],
    domain: 'endocrine',
    ageMinMonths: 0, ageMaxMonths: 96,
    conditionName: 'Precocious puberty',
    icd10: 'E30.1',
    conditionCategory: 'endocrine',
    baseProbability: 0.30,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'IAP Endocrinology; precocious puberty: breast development <8y girls, testicular enlargement <9y boys',
    parentExplanation: 'When puberty signs appear too early (before age 8 in girls, 9 in boys), it needs evaluation. The concern is both medical (underlying cause) and psychological (early maturation). Treatment can safely pause puberty until the right age.',
    parentNextSteps: ['When did you first notice the changes?', 'Is your child growing faster than usual?', 'Are there mood changes or behavioral changes?', 'Is there early body odor?'],
    doctorExamPoints: ['Tanner staging', 'Bone age X-ray', 'GnRH stimulation test', 'Brain MRI (especially in boys or girls <6)', 'LH, FSH, estradiol/testosterone levels'],
    modifiers: [
      { source: 'birth_history', key: 'female', description: 'Child is female', multiplier: 1.5, explanation: 'Precocious puberty is more common in girls' },
      { source: 'growth_trend', key: 'height_velocity_accelerating', description: 'Rapid height increase', multiplier: 2.0, explanation: 'Growth acceleration accompanies true precocious puberty' },
      { source: 'family_history', key: 'early_puberty', description: 'Family history of early puberty', multiplier: 2.0, explanation: 'Often familial' },
    ],
  },

  // ═══════════════════════════════════════════
  // UROGENITAL
  // ═══════════════════════════════════════════

  {
    id: 'urogenital_bedwetting_60_144',
    observationPatterns: ['bedwetting', 'wets bed', 'nighttime wetting', 'enuresis', 'still in diapers at night', 'not dry at night'],
    domain: 'urogenital',
    ageMinMonths: 60, ageMaxMonths: 144,
    conditionName: 'Primary nocturnal enuresis (developmental)',
    icd10: 'N39.44',
    conditionCategory: 'functional',
    baseProbability: 0.70,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Enuresis Guidelines; 15% of 5-year-olds, 5% of 10-year-olds; spontaneous resolution 15%/year',
    parentExplanation: 'Bedwetting at this age is very common — 15% of 5-year-olds wet the bed. It\'s usually developmental (the bladder-brain connection hasn\'t fully matured during sleep). Most children outgrow it. Treatment options are available if it\'s affecting your child\'s confidence.',
    parentNextSteps: ['Has your child EVER been dry at night for 6+ months?', 'Does your child also have daytime wetting?', 'Does your child drink a lot in the evening?', 'Is your child constipated?', 'Does your child snore?'],
    doctorExamPoints: ['Urinalysis (rule out UTI, diabetes)', 'Constipation assessment (Bristol stool chart)', 'Sleep history (OSA?)', 'Daytime voiding pattern', 'Family history (autosomal dominant — 77% if both parents had it)'],
    ruleOutBefore: ['UTI', 'Diabetes mellitus', 'Constipation (rectal mass compresses bladder)', 'OSA (snoring causes enuresis)'],
    modifiers: [
      { source: 'family_history', key: 'bedwetting', description: 'Parent had bedwetting', multiplier: 1.5, explanation: 'Very strong hereditary component' },
      { source: 'prior_observation', key: 'snoring', description: 'Snoring present', multiplier: 0.5, explanation: 'Snoring + bedwetting — evaluate for OSA first. Treating OSA often resolves enuresis' },
      { source: 'prior_observation', key: 'constipation', description: 'Constipation present', multiplier: 0.5, explanation: 'Treat constipation first — loaded rectum compresses bladder' },
      { source: 'prior_observation', key: 'daytime_wetting', description: 'Daytime wetting too', multiplier: 0.3, explanation: 'Day + night wetting suggests different pathology — needs urological evaluation' },
    ],
  },

  // ═══════════════════════════════════════════
  // GENERAL / FEVER
  // ═══════════════════════════════════════════

  {
    id: 'general_fever_viral_3_60',
    observationPatterns: ['fever', 'high temperature', 'hot', 'burning up', 'temperature', 'body hot'],
    domain: 'general',
    ageMinMonths: 3, ageMaxMonths: 60,
    conditionName: 'Viral illness (self-limiting)',
    conditionCategory: 'infectious',
    baseProbability: 0.75,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Fever Guidelines; children <5 average 6-8 viral illnesses/year',
    parentExplanation: 'Fever is the body\'s natural response to fighting infection. Most fevers in children are caused by viral infections that resolve on their own. The important thing is how your child looks and behaves, not just the number on the thermometer.',
    parentNextSteps: ['Is your child drinking fluids?', 'Is your child alert and interactive between fever spikes?', 'Has the fever lasted more than 3 days?', 'Are there other symptoms (rash, vomiting, difficulty breathing)?'],
    doctorExamPoints: ['Assess hydration', 'Look for focus of infection', 'Urine analysis if <2 years or no focus found', 'Blood culture if toxic-appearing'],
    modifiers: [
      { source: 'prior_observation', key: 'fever_over_5_days', description: 'Fever >5 days', multiplier: 0.3, explanation: 'Fever >5 days = not typical viral. Consider: Kawasaki disease (<5y), UTI, abscess, other' },
      { source: 'prior_observation', key: 'child_playful', description: 'Child is playful between fever spikes', multiplier: 1.5, explanation: 'Playful between spikes = very reassuring for viral cause' },
      { source: 'vaccination_status', key: 'unvaccinated', description: 'Not fully vaccinated', multiplier: 0.5, explanation: 'Unvaccinated children have higher risk of vaccine-preventable serious infections' },
    ],
  },
  {
    id: 'general_fever_uti_3_60',
    observationPatterns: ['fever', 'fever no cause', 'unexplained fever', 'fever and crying during urination', 'smelly urine'],
    domain: 'urogenital',
    ageMinMonths: 1, ageMaxMonths: 60,
    conditionName: 'Urinary tract infection',
    icd10: 'N39.0',
    conditionCategory: 'infectious',
    baseProbability: 0.08,
    mustNotMiss: true,
    urgency: 'soon',
    citation: 'IAP UTI Guidelines; UTI is the most common occult bacterial infection in febrile infants',
    parentExplanation: 'Urinary tract infections are a common hidden cause of fever in young children, especially when there\'s no obvious cold or other infection. A simple urine test can detect it. UTIs need treatment to protect the kidneys.',
    parentNextSteps: ['Does your child cry during diaper changes or urination?', 'Does the urine smell unusual?', 'Has your child had a UTI before?', 'Is your child uncircumcised (male)?'],
    doctorExamPoints: ['Clean-catch urine or catheter specimen', 'Urinalysis + culture', 'Renal ultrasound if first UTI <2 years', 'VCUG if abnormal ultrasound or recurrent UTI'],
    modifiers: [
      { source: 'prior_observation', key: 'recurrent_uti', description: 'History of UTI', multiplier: 3.0, explanation: 'Recurrent UTIs suggest structural anomaly — needs renal ultrasound' },
      { source: 'birth_history', key: 'male_uncircumcised', description: 'Uncircumcised male', multiplier: 2.0, explanation: 'UTI more common in uncircumcised males in first year' },
      { source: 'prior_observation', key: 'no_other_focus', description: 'No cold/cough/obvious focus', multiplier: 2.0, explanation: 'Fever without source in young child — UTI is top differential' },
    ],
  },
  {
    id: 'general_fever_kawasaki_1_60',
    observationPatterns: ['fever 5 days', 'fever won\'t go away', 'prolonged fever', 'red eyes with fever', 'rash with fever', 'swollen hands fever', 'peeling skin'],
    domain: 'immunological',
    ageMinMonths: 1, ageMaxMonths: 60,
    conditionName: 'Kawasaki disease',
    icd10: 'M30.3',
    conditionCategory: 'autoimmune',
    baseProbability: 0.02,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'IAP Kawasaki Guidelines; incidence increasing in India; untreated → coronary artery aneurysm in 25%',
    parentExplanation: 'Kawasaki disease is a condition that causes inflammation of blood vessels, especially around the heart. It presents as prolonged fever with specific signs. When treated early with IVIG (within 10 days of fever onset), outcomes are excellent.',
    parentNextSteps: ['URGENT if fever >5 days: See doctor TODAY', 'Are the eyes red (without discharge)?', 'Are the lips red/cracked? Strawberry tongue?', 'Are hands or feet swollen/red?', 'Is there a rash?'],
    doctorExamPoints: ['Classic criteria: Fever ≥5 days + 4 of 5 (bilateral conjunctival injection, oral mucosa changes, extremity changes, rash, cervical lymphadenopathy)', 'Echocardiography — URGENT', 'ESR, CRP (markedly elevated)', 'Incomplete Kawasaki if fever + 2-3 criteria with labs suggestive', 'IVIG within 10 days of fever onset'],
    modifiers: [
      { source: 'prior_observation', key: 'fever_over_5_days', description: 'Fever >5 days', multiplier: 5.0, explanation: 'Prolonged fever is the hallmark — Kawasaki must be considered for any fever >5 days in children <5' },
      { source: 'prior_observation', key: 'red_eyes', description: 'Red eyes without discharge', multiplier: 4.0, explanation: 'Non-purulent bilateral conjunctival injection is a classic sign' },
      { source: 'prior_observation', key: 'rash_with_fever', description: 'Rash present with the fever', multiplier: 2.0, explanation: 'Polymorphous rash is one of the classic criteria' },
    ],
  },

  // ═══════════════════════════════════════════
  // RESPIRATORY
  // ═══════════════════════════════════════════

  {
    id: 'respiratory_wheezing_recurrent_6_60',
    observationPatterns: ['wheezing', 'whistling breathing', 'chest sounds', 'breathing difficulty', 'asthma', 'chest tightness', 'cough at night', 'cough with exercise'],
    domain: 'respiratory',
    ageMinMonths: 6, ageMaxMonths: 144,
    conditionName: 'Recurrent wheezing / asthma',
    icd10: 'J45',
    conditionCategory: 'allergic',
    baseProbability: 0.40,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP Asthma Guidelines; prevalence 5-15% in Indian children; underdiagnosed',
    parentExplanation: 'Recurrent wheezing (a whistling sound during breathing) is common in young children. Some will develop asthma, while others will outgrow it. A proper assessment can determine the best management plan.',
    parentNextSteps: ['How many wheezing episodes in the past year?', 'Does your child cough at night or with exercise?', 'Is there a family history of asthma or allergies?', 'Does your child have eczema?'],
    doctorExamPoints: ['Auscultation', 'Modified Asthma Predictive Index (mAPI)', 'Peak flow if >5 years', 'Chest X-ray if first episode or atypical', 'Trial of bronchodilator if indicated'],
    modifiers: [
      { source: 'family_history', key: 'atopy', description: 'Family history of asthma/eczema/allergies', multiplier: 2.5, explanation: 'Atopic family history is the strongest predictor of persistent asthma' },
      { source: 'active_condition', key: 'eczema', description: 'Child has eczema', multiplier: 2.0, explanation: 'Atopic march: eczema → asthma → allergic rhinitis' },
      { source: 'prior_observation', key: 'wheezing_3_plus', description: '3+ wheezing episodes', multiplier: 2.0, explanation: '≥3 episodes in a year = likely persistent pattern' },
      { source: 'environment', key: 'pollution', description: 'High pollution area', multiplier: 1.5, explanation: 'Air pollution worsens and may trigger asthma' },
    ],
  },

  // ═══════════════════════════════════════════
  // MUSCULOSKELETAL
  // ═══════════════════════════════════════════

  {
    id: 'msk_toe_walking_12_36',
    observationPatterns: ['toe walking', 'walks on toes', 'tip-toe walking', 'doesn\'t put heels down', 'walking on tiptoes'],
    domain: 'musculoskeletal',
    ageMinMonths: 12, ageMaxMonths: 36,
    conditionName: 'Idiopathic toe walking (habitual)',
    conditionCategory: 'normal_variant',
    baseProbability: 0.60,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'AAP; idiopathic toe walking affects 5-12% of children; most resolve by age 3',
    parentExplanation: 'Many toddlers walk on their toes when they first start walking — it\'s usually a habit that resolves on its own. However, if it persists beyond age 2-3 or is constant (never flat-footed), your doctor should check.',
    parentNextSteps: ['Can your child stand flat-footed when asked?', 'Is the toe walking constant or intermittent?', 'Is it getting better or worse over time?', 'Does your child seem tight or stiff in the legs?'],
    doctorExamPoints: ['Ankle dorsiflexion range', 'Can child stand flat when asked?', 'Achilles tendon tightness', 'Tone assessment (rule out spasticity)', 'Gait analysis'],
    ruleOutBefore: ['Cerebral palsy (spastic diplegic)', 'Muscular dystrophy', 'Autism (associated with toe walking)'],
    modifiers: [
      { source: 'milestone_status', key: 'normal_development', description: 'Otherwise normal development', multiplier: 1.5, explanation: 'Normal development with toe walking = likely idiopathic' },
      { source: 'prior_observation', key: 'constant_toe_walking', description: 'Never seen flat-footed', multiplier: 0.3, explanation: 'Constant toe walking needs neurological assessment — not just habitual' },
      { source: 'prior_observation', key: 'stiff_legs', description: 'Legs seem stiff', multiplier: 0.2, explanation: 'Stiffness + toe walking = spasticity until proven otherwise' },
    ],
  },
  {
    id: 'msk_limp_hip_12_60',
    observationPatterns: ['limping', 'limp', 'walking funny', 'not putting weight on leg', 'hip pain', 'refuses to walk', 'won\'t stand on one leg'],
    domain: 'musculoskeletal',
    ageMinMonths: 12, ageMaxMonths: 120,
    conditionName: 'Transient synovitis (irritable hip)',
    icd10: 'M67.3',
    conditionCategory: 'infectious',
    baseProbability: 0.45,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'Nelson\'s 22nd Ed; most common cause of acute hip pain in children 3-10 years',
    parentExplanation: 'An irritable hip (transient synovitis) is the most common cause of limping in young children. It usually follows a viral illness and resolves on its own in 1-2 weeks. However, a doctor should evaluate to rule out more serious causes.',
    parentNextSteps: ['Has your child been sick recently (cold, fever)?', 'Does your child have a fever NOW?', 'Can your child bear weight at all?', 'Which leg is affected?'],
    doctorExamPoints: ['Hip range of motion (internal rotation most affected)', 'Temperature', 'ESR, CRP, WBC (rule out septic arthritis)', 'Hip ultrasound if effusion suspected', 'Blood culture if febrile', 'Kocher criteria: fever >38.5, non-weight-bearing, ESR>40, WBC>12K — ≥3 criteria = likely septic (needs aspiration)'],
    ruleOutBefore: ['Septic arthritis (EMERGENCY)', 'Perthes disease (avascular necrosis)', 'SCFE (slipped capital femoral epiphysis in adolescents)'],
    modifiers: [
      { source: 'prior_observation', key: 'fever_present', description: 'Fever present', multiplier: 0.3, explanation: 'Fever + non-weight bearing limp = septic arthritis until proven otherwise — EMERGENCY' },
      { source: 'recent_illness', key: 'recent_viral', description: 'Recent cold/viral illness', multiplier: 1.5, explanation: 'Transient synovitis classically follows viral illness by 1-2 weeks' },
      { source: 'prior_observation', key: 'refuses_to_bear_weight', description: 'Completely refuses to stand', multiplier: 0.4, explanation: 'Complete refusal to bear weight is more concerning than limping' },
    ],
  },
  {
    id: 'msk_limp_septic_arthritis_0_60',
    observationPatterns: ['limping', 'won\'t walk', 'leg pain with fever', 'swollen joint', 'crying when moved', 'refuses to move leg'],
    domain: 'musculoskeletal',
    ageMinMonths: 0, ageMaxMonths: 120,
    conditionName: 'Septic arthritis',
    icd10: 'M00',
    conditionCategory: 'infectious',
    baseProbability: 0.05,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'Nelson\'s 22nd Ed; septic arthritis — orthopedic emergency, joint destruction within 24-48 hours if untreated',
    parentExplanation: 'If your child has a fever AND refuses to move a limb or joint, this needs emergency evaluation. A joint infection can damage the joint permanently if not treated urgently with antibiotics and sometimes surgery.',
    parentNextSteps: ['EMERGENCY: Go to hospital NOW if fever + won\'t move joint', 'Does your child have a fever?', 'Is the joint red, warm, or swollen?', 'Did this come on suddenly?'],
    doctorExamPoints: ['EMERGENCY evaluation', 'Kocher criteria', 'Joint aspiration (send for culture, cell count)', 'Blood culture', 'IV antibiotics', 'Orthopedic surgery consult'],
    modifiers: [
      { source: 'prior_observation', key: 'fever_high', description: 'High fever >38.5°C', multiplier: 5.0, explanation: 'Fever + non-weight bearing = septic arthritis until proven otherwise' },
      { source: 'prior_observation', key: 'joint_swollen', description: 'Visible joint swelling', multiplier: 4.0, explanation: 'Swollen, warm joint with restricted movement is classic' },
      { source: 'active_condition', key: 'immunocompromised', description: 'Immunocompromised', multiplier: 3.0, explanation: 'Increased risk of septic arthritis' },
    ],
  },

  // ═══════════════════════════════════════════
  // SEIZURES / NEUROLOGICAL EVENTS
  // ═══════════════════════════════════════════

  {
    id: 'neuro_seizure_febrile_6_60',
    observationPatterns: ['seizure', 'fit', 'convulsion', 'shaking', 'jerking', 'eyes rolled back', 'stiffened', 'unresponsive episode', 'went limp'],
    domain: 'neurological',
    ageMinMonths: 6, ageMaxMonths: 60,
    conditionName: 'Febrile seizure (simple)',
    icd10: 'R56.0',
    conditionCategory: 'neurological',
    baseProbability: 0.55,
    mustNotMiss: false,
    urgency: 'urgent',
    citation: 'IAP Febrile Seizure Guidelines; affects 2-5% of children 6mo-5yr; benign prognosis',
    parentExplanation: 'Febrile seizures happen when a child has a seizure triggered by fever. While terrifying to watch, they are usually harmless and don\'t cause brain damage. About 2-5% of children have them. Most children outgrow them by age 5.',
    parentNextSteps: ['Did your child have a fever at the time?', 'How long did the episode last? (under 15 minutes is typical for simple)', 'Did the whole body stiffen/shake or just one side?', 'Did your child recover to normal within 30 minutes?'],
    doctorExamPoints: ['Identify fever source', 'Classify simple vs complex (duration >15min, focal, recurrence within 24hr)', 'Full sepsis workup if <12 months or meningeal signs', 'LP if <12 months with first febrile seizure', 'EEG NOT needed for simple febrile seizure'],
    modifiers: [
      { source: 'prior_observation', key: 'fever_present', description: 'Fever documented at time of episode', multiplier: 2.0, explanation: 'Seizure with fever in this age group is febrile seizure until proven otherwise' },
      { source: 'prior_observation', key: 'episode_under_15min', description: 'Episode lasted <15 minutes', multiplier: 1.5, explanation: 'Short duration = simple febrile seizure (benign)' },
      { source: 'prior_observation', key: 'focal_features', description: 'Only one side shaking or didn\'t recover quickly', multiplier: 0.3, explanation: 'Focal features = complex febrile seizure — needs further evaluation' },
      { source: 'family_history', key: 'febrile_seizures', description: 'Family history of febrile seizures', multiplier: 1.5, explanation: 'Strong family predisposition' },
    ],
  },
  {
    id: 'neuro_infantile_spasms_3_12',
    observationPatterns: ['funny movements', 'jerks in clusters', 'head drops', 'jackknife movements', 'startles in series', 'episodes of stiffening', 'salaam attacks'],
    domain: 'neurological',
    ageMinMonths: 3, ageMaxMonths: 18,
    conditionName: 'Infantile spasms (West syndrome)',
    icd10: 'G40.4',
    conditionCategory: 'neurological',
    baseProbability: 0.05,
    mustNotMiss: true,
    urgency: 'emergency',
    citation: 'IAP Epilepsy Guidelines; incidence 2-5/10,000; EVERY DAY OF DELAY = worse neurodevelopmental outcome',
    parentExplanation: 'Infantile spasms are brief, cluster movements — the baby\'s body may suddenly flex or extend, often in groups upon waking. This is a neurological emergency because treatment within 2 weeks of onset dramatically improves outcomes. Please see your doctor TODAY and try to capture a video.',
    parentNextSteps: ['URGENT: Record a video of the episodes on your phone', 'See your doctor TODAY — show them the video', 'Do the movements happen in clusters (groups of 5-20)?', 'Do they mostly happen when your baby wakes up?', 'Has your baby lost any skills recently?'],
    doctorExamPoints: ['EMERGENCY — same day neurology referral', 'EEG (hypsarrhythmia)', 'MRI brain', 'Video of spasms (parent phone recording is invaluable)', 'Start treatment WITHIN 2 WEEKS of onset for best outcomes', 'ACTH or vigabatrin first-line'],
    modifiers: [
      { source: 'prior_observation', key: 'clusters', description: 'Episodes occur in clusters', multiplier: 5.0, explanation: 'Clustering is the hallmark of infantile spasms — distinguishes from benign myoclonus' },
      { source: 'prior_observation', key: 'regression', description: 'Developmental regression', multiplier: 5.0, explanation: 'Spasms + regression = West syndrome is very likely' },
      { source: 'prior_observation', key: 'on_waking', description: 'Happens on waking from sleep', multiplier: 3.0, explanation: 'Spasms on arousal from sleep is characteristic' },
      { source: 'birth_history', key: 'birth_asphyxia', description: 'Birth asphyxia', multiplier: 3.0, explanation: 'HIE is a common cause of infantile spasms' },
    ],
  },

  // ═══════════════════════════════════════════
  // NEONATAL (0-4 WEEKS SPECIFIC)
  // ═══════════════════════════════════════════

  {
    id: 'neonatal_jaundice_prolonged_2_8wk',
    observationPatterns: ['still yellow', 'jaundice', 'yellow skin', 'yellow eyes', 'jaundice not going away', 'prolonged jaundice'],
    domain: 'gi_nutrition',
    ageMinMonths: 0.5, ageMaxMonths: 2,
    conditionName: 'Breast milk jaundice (benign)',
    conditionCategory: 'normal_variant',
    baseProbability: 0.55,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP Neonatal Jaundice Guidelines; breast milk jaundice peaks 10-14 days, can persist 2-3 months',
    parentExplanation: 'Breast milk jaundice is a common, harmless cause of prolonged yellowness in breastfed babies. However, your doctor needs to check a blood test to confirm it\'s not something else, especially the bilirubin type (direct vs indirect).',
    parentNextSteps: ['Is your baby breastfed?', 'Is your baby feeding well and gaining weight?', 'What color is the stool? (YELLOW = reassuring, WHITE/PALE = URGENT)', 'What color is the urine?'],
    doctorExamPoints: ['FRACTIONATED bilirubin (direct + indirect) — CRITICAL', 'Direct bilirubin >20% of total = pathological, NOT breast milk jaundice', 'Stool color assessment (pale → biliary atresia EMERGENCY)', 'Liver function tests', 'Thyroid function', 'Urine culture'],
    ruleOutBefore: ['Biliary atresia (EMERGENCY if pale stools)', 'Hypothyroidism', 'UTI', 'Hemolytic disease'],
    modifiers: [
      { source: 'diet', key: 'breastfed', description: 'Exclusively breastfed', multiplier: 2.0, explanation: 'Breast milk jaundice only occurs in breastfed infants' },
      { source: 'prior_observation', key: 'pale_stool', description: 'Pale/white stools', multiplier: 0.01, explanation: 'EMERGENCY — pale stools + jaundice = biliary atresia, NOT breast milk jaundice. See doctor TODAY.' },
      { source: 'growth_trend', key: 'weight_stable', description: 'Baby gaining weight well', multiplier: 1.5, explanation: 'Good weight gain = reassuring — baby is feeding well' },
    ],
  },

  // ═══════════════════════════════════════════
  // SCHOOL-AGE SPECIFIC (6-18 YEARS)
  // ═══════════════════════════════════════════

  {
    id: 'school_poor_performance_60_216',
    observationPatterns: ['poor at school', 'struggling in school', 'can\'t read', 'can\'t write', 'poor grades', 'not keeping up', 'learning difficulty', 'slow learner', 'hates school'],
    domain: 'cognitive',
    ageMinMonths: 60, ageMaxMonths: 216,
    conditionName: 'Specific learning disability (dyslexia/dyscalculia/dysgraphia)',
    icd10: 'F81',
    conditionCategory: 'developmental',
    baseProbability: 0.20,
    mustNotMiss: false,
    urgency: 'soon',
    citation: 'IAP Learning Disability Guidelines; prevalence 5-15% of school children',
    parentExplanation: 'Learning disabilities like dyslexia are common and don\'t reflect intelligence — many very bright children have them. Early identification allows for accommodations and strategies that help your child succeed.',
    parentNextSteps: ['Is the difficulty in reading, writing, math, or all?', 'Does your child seem smart in conversation but struggles with schoolwork?', 'Does your child reverse letters or numbers?', 'Is school causing anxiety or low self-esteem?'],
    doctorExamPoints: ['Vision screening (first!)', 'Hearing screening', 'Psychoeducational assessment', 'IQ testing + academic achievement testing (discrepancy model)', 'Rule out ADHD (common comorbidity)', 'Rule out iron deficiency'],
    ruleOutBefore: ['Vision impairment', 'Hearing impairment', 'ADHD', 'Iron deficiency', 'Intellectual disability', 'Anxiety/depression affecting performance'],
    modifiers: [
      { source: 'screening_result', key: 'vision_not_done', description: 'Vision not screened', multiplier: 1.5, explanation: 'Uncorrected vision is a common missed cause of school difficulty' },
      { source: 'screening_result', key: 'hearing_not_done', description: 'Hearing not screened', multiplier: 1.5, explanation: 'Mild hearing loss can present as learning difficulty' },
      { source: 'family_history', key: 'learning_disability', description: 'Family history of learning disability', multiplier: 2.5, explanation: 'Dyslexia has strong genetic component (~60% heritability)' },
      { source: 'active_condition', key: 'iron_deficiency', description: 'Iron deficiency present', multiplier: 0.5, explanation: 'Iron deficiency impairs concentration and cognition — treat first' },
    ],
  },
  {
    id: 'school_headache_tension_60_216',
    observationPatterns: ['headache', 'head pain', 'head hurts', 'frequent headaches', 'headache every day', 'migraine'],
    domain: 'neurological',
    ageMinMonths: 48, ageMaxMonths: 216,
    conditionName: 'Tension-type headache / migraine',
    icd10: 'G43',
    conditionCategory: 'functional',
    baseProbability: 0.65,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'IAP Headache Guidelines; migraine affects 5-10% of school children',
    parentExplanation: 'Headaches are common in school-age children. The most common types are tension headaches (from stress, fatigue, dehydration) and migraines (which can start in childhood). Most are manageable with lifestyle changes and occasional medication.',
    parentNextSteps: ['How often do the headaches occur?', 'Where is the pain? (whole head vs one side)', 'Does your child feel nauseous or see spots/lines before the headache?', 'Is your child getting enough sleep, water, and screen breaks?', 'Has vision been checked recently?'],
    doctorExamPoints: ['Neurological examination', 'Blood pressure', 'Fundoscopy (rule out papilledema)', 'Vision screening', 'Headache diary', 'Red flags: worst headache ever, headache waking from sleep, headache with vomiting, progressive headaches, new neurological signs'],
    ruleOutBefore: ['Refractive error (most common missed cause)', 'Sinusitis', 'Medication overuse headache'],
    modifiers: [
      { source: 'screening_result', key: 'vision_abnormal', description: 'Uncorrected refractive error', multiplier: 0.3, explanation: 'Uncorrected vision = eye strain headaches. Fix glasses first.' },
      { source: 'prior_observation', key: 'headache_wakes_from_sleep', description: 'Headache wakes child from sleep', multiplier: 0.1, explanation: 'RED FLAG: Headache waking from sleep suggests raised intracranial pressure — URGENT imaging' },
      { source: 'prior_observation', key: 'progressive_headaches', description: 'Headaches getting worse over weeks', multiplier: 0.2, explanation: 'Progressive headaches need imaging to rule out space-occupying lesion' },
      { source: 'family_history', key: 'migraine', description: 'Family history of migraine', multiplier: 2.0, explanation: 'Migraine is strongly hereditary' },
    ],
  },

  // ═══════════════════════════════════════════
  // ADOLESCENT (10-18 YEARS)
  // ═══════════════════════════════════════════

  {
    id: 'adolescent_mood_depression_120_216',
    observationPatterns: ['sad', 'withdrawn', 'doesn\'t want to do anything', 'lost interest', 'sleeping too much', 'not eating', 'moody', 'crying', 'self harm', 'wants to die', 'hopeless'],
    domain: 'emotional',
    ageMinMonths: 120, ageMaxMonths: 216,
    conditionName: 'Adolescent depression',
    icd10: 'F32',
    conditionCategory: 'psychosocial',
    baseProbability: 0.25,
    mustNotMiss: true,
    urgency: 'urgent',
    citation: 'AAP; prevalence 8-12% of adolescents; PHQ-A screening recommended',
    parentExplanation: 'Depression in adolescents is more than just moodiness — it affects sleep, appetite, energy, interest in activities, and school performance. It\'s very treatable with therapy and sometimes medication. Early help prevents worsening.',
    parentNextSteps: ['Has your child expressed feeling hopeless or worthless?', 'Has your child lost interest in activities they used to enjoy?', 'Has sleep or appetite changed significantly?', 'CRITICAL: Has your child mentioned wanting to hurt themselves or not wanting to be alive? If yes, seek help immediately.'],
    doctorExamPoints: ['PHQ-A (adolescent depression screen)', 'Suicide risk assessment (Columbia Suicide Severity Rating Scale)', 'Thyroid function', 'Screen for substance use', 'Screen for bullying/abuse', 'CBT referral + psychiatry if moderate-severe', 'Safety plan if suicidal ideation'],
    modifiers: [
      { source: 'family_history', key: 'depression', description: 'Family history of depression', multiplier: 2.5, explanation: 'Strong genetic and environmental component' },
      { source: 'prior_observation', key: 'self_harm', description: 'Self-harm mentioned', multiplier: 3.0, explanation: 'URGENT — self-harm requires immediate professional evaluation and safety planning' },
      { source: 'prior_observation', key: 'academic_decline', description: 'Sudden decline in school performance', multiplier: 1.5, explanation: 'Academic decline is often the presenting sign in adolescent depression' },
      { source: 'environment', key: 'family_stress', description: 'Family conflict or loss', multiplier: 2.0, explanation: 'Environmental stressors can trigger depression in predisposed adolescents' },
    ],
  },
]

// ============================================
// HELPER: Get all entries matching an observation
// ============================================

/** Observation pattern matching — finds which knowledge graph entries are relevant */
export function matchObservationToConditions(
  observationText: string,
  ageMonths: number
): ConditionObservationEntry[] {
  const lowerObs = observationText.toLowerCase()
  const words = lowerObs.split(/\s+/)

  return OBSERVATION_CONDITION_MAP.filter((entry) => {
    // Age range check
    if (ageMonths < entry.ageMinMonths || ageMonths > entry.ageMaxMonths) return false

    // Pattern matching — check if any observation pattern matches
    return entry.observationPatterns.some((pattern) => {
      const lowerPattern = pattern.toLowerCase()
      // Exact substring match
      if (lowerObs.includes(lowerPattern)) return true
      // Word-level match for multi-word patterns
      const patternWords = lowerPattern.split(/\s+/)
      if (patternWords.length > 1) {
        return patternWords.every((pw) => words.some((w) => w.includes(pw) || pw.includes(w)))
      }
      // Fuzzy single-word match (word starts with pattern or vice versa)
      return words.some((w) => w.startsWith(lowerPattern) || lowerPattern.startsWith(w))
    })
  })
}

/** Get the body systems (domains) detected from an observation */
export function detectDomains(
  observationText: string,
  ageMonths: number
): string[] {
  const matches = matchObservationToConditions(observationText, ageMonths)
  const domains = new Set(matches.map((m) => m.domain))
  return Array.from(domains)
}

/** Get all must-not-miss conditions for an age range */
export function getMustNotMissConditions(ageMonths: number): ConditionObservationEntry[] {
  return OBSERVATION_CONDITION_MAP.filter(
    (entry) => entry.mustNotMiss && ageMonths >= entry.ageMinMonths && ageMonths <= entry.ageMaxMonths
  )
}

/** Get conditions by body system for a given age */
export function getConditionsBySystem(domain: string, ageMonths: number): ConditionObservationEntry[] {
  return OBSERVATION_CONDITION_MAP.filter(
    (entry) => entry.domain === domain && ageMonths >= entry.ageMinMonths && ageMonths <= entry.ageMaxMonths
  )
}
