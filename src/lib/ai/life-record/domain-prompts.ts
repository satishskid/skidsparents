/**
 * SKIDS Life Record — Age-Period Domain Prompts
 *
 * The wire speaks to the parent.
 *
 * At each age period, the system knows which developmental domains and
 * body systems are most relevant. It surfaces open-ended domain prompts —
 * NOT conditions, NOT symptoms, NOT diagnoses — just guided questions
 * about life areas that matter NOW for this child.
 *
 * The parent taps a domain prompt, then describes what they see in their
 * own words. This gives us:
 *   1. Domain pre-selection (cuts engine computation by 80%+)
 *   2. Authentic parent observation (no bias from checklists)
 *   3. Continuous surveillance (the wire surfaces domains the parent
 *      wouldn't think to watch — this is how nothing gets missed)
 *
 * Prompt design principles:
 *   - Open-ended questions, never leading
 *   - About DOMAINS, never about CONDITIONS
 *   - In parent language, never clinical jargon
 *   - Age-appropriate — what matters NOW, not everything
 *   - Rotated to prevent fatigue — not all shown at once
 *   - Gender-neutral except where clinically necessary
 *
 * Sources: IAP Well-Child Schedule 2024, AAP Bright Futures 4th Ed,
 *          WHO Child Development Standards, Nelson's 22nd Ed developmental surveillance
 */

import type { BodySystem } from './types'

// ============================================
// TYPES
// ============================================

export interface DomainPrompt {
  /** Unique key for this prompt */
  id: string
  /** The domain this prompt is probing */
  domain: BodySystem
  /** The question shown to the parent — open-ended, no jargon */
  prompt: string
  /** Shorter version for mobile / repeat visits */
  shortPrompt: string
  /** Why this prompt matters at this age (internal, not shown to parent) */
  clinicalRationale: string
  /** Priority: how important is this domain at this age? 1 = critical, 5 = background */
  priority: number
  /** Minimum age in months */
  ageMinMonths: number
  /** Maximum age in months */
  ageMaxMonths: number
  /** Optional: only show if life record has specific flags */
  showIf?: PromptCondition[]
  /** Optional: suppress if life record shows this domain is clear */
  hideIf?: PromptCondition[]
}

export interface PromptCondition {
  type: 'milestone_delayed' | 'milestone_not_achieved' | 'screening_abnormal' | 'prior_observation' | 'birth_history' | 'family_history' | 'growth_concern' | 'active_condition'
  key?: string
  description: string
}

/** What gets stored when parent uses a prompt */
export interface ObservationInput {
  /** Which domain prompt was tapped (null if free-text) */
  promptId: string | null
  /** Auto-detected or prompt-selected domain */
  domain: BodySystem | null
  /** Parent's own words — always required, never structured */
  observationText: string
  /** Date of observation */
  date: string
}

// ============================================
// THE WIRE — AGE-PERIOD DOMAIN PROMPTS
// ============================================

export const DOMAIN_PROMPTS: DomainPrompt[] = [

  // ═══════════════════════════════════════════
  // NEWBORN (0–1 month)
  // ═══════════════════════════════════════════

  {
    id: 'nb_feeding',
    domain: 'gi_nutrition',
    prompt: 'How is feeding going? Is your baby latching well and feeding regularly?',
    shortPrompt: 'How is feeding going?',
    clinicalRationale: 'Feeding difficulty in newborns can indicate oral-motor issues, tongue-tie, cardiac problems, or metabolic conditions. Also establishes breastfeeding baseline.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 1,
  },
  {
    id: 'nb_sleep_breathing',
    domain: 'respiratory',
    prompt: 'How is your baby breathing? Any unusual sounds during feeding or sleep?',
    shortPrompt: 'How is breathing?',
    clinicalRationale: 'Newborn respiratory distress, stridor, or noisy breathing may indicate laryngomalacia, CHD, or respiratory pathology.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 1,
  },
  {
    id: 'nb_skin_color',
    domain: 'skin',
    prompt: 'How does your baby\'s skin look? Any yellowing, rashes, or unusual marks?',
    shortPrompt: 'How does the skin look?',
    clinicalRationale: 'Neonatal jaundice screening window. Also captures birthmarks, hemangiomas, mongolian spots vs bruising.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 1,
  },
  {
    id: 'nb_movement',
    domain: 'motor',
    prompt: 'How does your baby move? Are arms and legs moving equally on both sides?',
    shortPrompt: 'How is the baby moving?',
    clinicalRationale: 'Asymmetric movements may indicate brachial plexus injury, hemiplegia, or tonal abnormalities. Establishes motor baseline.',
    priority: 2,
    ageMinMonths: 0, ageMaxMonths: 1,
  },
  {
    id: 'nb_eyes',
    domain: 'vision',
    prompt: 'Do your baby\'s eyes look clear? Do they seem to respond to light?',
    shortPrompt: 'How do the eyes look?',
    clinicalRationale: 'Red reflex screening period. Congenital cataracts, retinoblastoma, and congenital glaucoma present in neonatal period.',
    priority: 2,
    ageMinMonths: 0, ageMaxMonths: 1,
  },
  {
    id: 'nb_hearing',
    domain: 'hearing',
    prompt: 'Does your baby startle or react to loud sounds?',
    shortPrompt: 'Reacting to sounds?',
    clinicalRationale: 'Newborn hearing screening follow-up. Congenital hearing loss affects 1-3/1000 births. Early detection critical for language.',
    priority: 2,
    ageMinMonths: 0, ageMaxMonths: 1,
  },
  {
    id: 'nb_stool',
    domain: 'gi_nutrition',
    prompt: 'What do your baby\'s stools look like? How often?',
    shortPrompt: 'How are stools?',
    clinicalRationale: 'Pale/white stools in first 2 weeks = biliary atresia (must-not-miss, needs intervention within 60 days). Also tracks meconium passage, feeding adequacy.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 2,
  },
  {
    id: 'nb_general',
    domain: 'general',
    prompt: 'How is your baby overall? Anything that worries you or feels different?',
    shortPrompt: 'Anything worrying you?',
    clinicalRationale: 'Open-ended capture. Parent instinct is clinically validated — "mother says something is wrong" is a recognized clinical sign.',
    priority: 3,
    ageMinMonths: 0, ageMaxMonths: 1,
  },

  // ═══════════════════════════════════════════
  // EARLY INFANT (1–3 months)
  // ═══════════════════════════════════════════

  {
    id: 'ei_social_smile',
    domain: 'emotional',
    prompt: 'Is your baby smiling at you? Making eye contact when you talk?',
    shortPrompt: 'Smiling and eye contact?',
    clinicalRationale: 'Social smile expected by 6-8 weeks. Absence may be early marker for ASD, visual impairment, or global developmental delay.',
    priority: 1,
    ageMinMonths: 1, ageMaxMonths: 3,
  },
  {
    id: 'ei_head_control',
    domain: 'motor',
    prompt: 'How is your baby\'s head control? Can they hold their head steady when upright?',
    shortPrompt: 'How is head control?',
    clinicalRationale: 'Head control expected by 3 months. Poor head control may indicate hypotonia, CP, or neurological concerns.',
    priority: 1,
    ageMinMonths: 1, ageMaxMonths: 4,
  },
  {
    id: 'ei_sounds',
    domain: 'language',
    prompt: 'What sounds is your baby making? Cooing, gurgling?',
    shortPrompt: 'What sounds are they making?',
    clinicalRationale: 'Cooing expected by 2 months. Silence or limited vocalization may indicate hearing loss or early language delay.',
    priority: 2,
    ageMinMonths: 1, ageMaxMonths: 4,
  },
  {
    id: 'ei_feeding_pattern',
    domain: 'gi_nutrition',
    prompt: 'How is feeding going now? Any spitting up, fussiness during feeds, or changes?',
    shortPrompt: 'How is feeding?',
    clinicalRationale: 'GERD peaks 2-4 months. Feeding refusal, arching, or excessive spit-up. Also tracks growth trajectory adequacy.',
    priority: 2,
    ageMinMonths: 1, ageMaxMonths: 4,
  },
  {
    id: 'ei_tracking',
    domain: 'vision',
    prompt: 'Does your baby follow objects or your face with their eyes?',
    shortPrompt: 'Following with eyes?',
    clinicalRationale: 'Visual tracking expected by 2-3 months. Absence suggests visual impairment, CVI, or neurological concern.',
    priority: 2,
    ageMinMonths: 1, ageMaxMonths: 4,
  },
  {
    id: 'ei_sleep',
    domain: 'general',
    prompt: 'How is sleep going? Any concerns about your baby\'s sleep pattern?',
    shortPrompt: 'How is sleep?',
    clinicalRationale: 'Sleep patterns establishing. Excessive sleep or inability to be roused may indicate neurological issues. Poor sleep affects development.',
    priority: 3,
    ageMinMonths: 1, ageMaxMonths: 4,
  },
  {
    id: 'ei_skin',
    domain: 'skin',
    prompt: 'Any skin changes — rashes, dry patches, or cradle cap?',
    shortPrompt: 'Any skin changes?',
    clinicalRationale: 'Infantile eczema onset peak 2-3 months. Seborrheic dermatitis common. Atopic march begins here.',
    priority: 3,
    ageMinMonths: 1, ageMaxMonths: 4,
  },

  // ═══════════════════════════════════════════
  // INFANT (3–6 months)
  // ═══════════════════════════════════════════

  {
    id: 'inf_rolling',
    domain: 'motor',
    prompt: 'Is your baby rolling over? How are they moving on the floor?',
    shortPrompt: 'Rolling and movement?',
    clinicalRationale: 'Rolling expected 4-6 months. Motor milestone surveillance. Asymmetry or absence flags for further eval.',
    priority: 1,
    ageMinMonths: 3, ageMaxMonths: 7,
  },
  {
    id: 'inf_reaching',
    domain: 'motor',
    prompt: 'Is your baby reaching for and grasping toys?',
    shortPrompt: 'Reaching for things?',
    clinicalRationale: 'Voluntary grasp expected by 4-5 months. Hand regard persistence beyond 4 months is concerning. Hand preference before 12 months suggests hemiplegia.',
    priority: 2,
    ageMinMonths: 3, ageMaxMonths: 7,
  },
  {
    id: 'inf_babbling',
    domain: 'language',
    prompt: 'What sounds is your baby making? Any babbling like "ba-ba" or "da-da"?',
    shortPrompt: 'Babbling?',
    clinicalRationale: 'Consonant babbling expected by 6 months. Absence raises concern for hearing loss or language delay.',
    priority: 1,
    ageMinMonths: 4, ageMaxMonths: 8,
  },
  {
    id: 'inf_response_name',
    domain: 'behavioral',
    prompt: 'Does your baby turn to look when you call their name?',
    shortPrompt: 'Responding to name?',
    clinicalRationale: 'Name response expected by 6-7 months. Consistent absence is one of the earliest ASD markers.',
    priority: 1,
    ageMinMonths: 5, ageMaxMonths: 10,
  },
  {
    id: 'inf_solids',
    domain: 'gi_nutrition',
    prompt: 'Have you started introducing solid foods? How is your baby taking to them?',
    shortPrompt: 'How are solids going?',
    clinicalRationale: 'Complementary feeding window 6 months (IAP/WHO). Delayed introduction increases allergy risk. Gagging vs choking distinction important.',
    priority: 1,
    ageMinMonths: 5, ageMaxMonths: 8,
  },
  {
    id: 'inf_sitting',
    domain: 'motor',
    prompt: 'Can your baby sit with support? Or on their own?',
    shortPrompt: 'Sitting up?',
    clinicalRationale: 'Sitting without support expected by 6-8 months. Delay may indicate hypotonia, motor delay, or global delay.',
    priority: 1,
    ageMinMonths: 5, ageMaxMonths: 9,
  },
  {
    id: 'inf_stranger_anxiety',
    domain: 'emotional',
    prompt: 'How does your baby react to new people? Any shyness or distress?',
    shortPrompt: 'Reaction to strangers?',
    clinicalRationale: 'Stranger anxiety normal from 6-8 months. ABSENCE may be more concerning than presence — indiscriminate friendliness is a flag.',
    priority: 3,
    ageMinMonths: 5, ageMaxMonths: 10,
  },
  {
    id: 'inf_hearing_6m',
    domain: 'hearing',
    prompt: 'Does your baby turn towards sounds? React to music or your voice from across the room?',
    shortPrompt: 'Turning to sounds?',
    clinicalRationale: 'Sound localization expected by 6 months. Even if newborn hearing screen passed, acquired or progressive hearing loss can develop.',
    priority: 2,
    ageMinMonths: 4, ageMaxMonths: 8,
  },

  // ═══════════════════════════════════════════
  // LATE INFANT (6–12 months)
  // ═══════════════════════════════════════════

  {
    id: 'li_crawling',
    domain: 'motor',
    prompt: 'How is your baby getting around? Crawling, scooting, or pulling up?',
    shortPrompt: 'How are they getting around?',
    clinicalRationale: 'Crawling expected 7-10 months (some skip crawling — normal variant). Pulling to stand by 9-10 months. Commando crawling or asymmetric patterns notable.',
    priority: 1,
    ageMinMonths: 7, ageMaxMonths: 12,
  },
  {
    id: 'li_pointing',
    domain: 'language',
    prompt: 'Is your baby pointing at things they want or find interesting?',
    shortPrompt: 'Pointing at things?',
    clinicalRationale: 'Pointing expected by 9-12 months. Joint attention (pointing to share interest, not just to request) is a critical social-communication milestone. Absence is an ASD red flag.',
    priority: 1,
    ageMinMonths: 8, ageMaxMonths: 14,
  },
  {
    id: 'li_first_words',
    domain: 'language',
    prompt: 'Is your baby saying any words? Even "mama" or "dada"?',
    shortPrompt: 'Any words?',
    clinicalRationale: 'First meaningful words expected by 12 months. Jargon babbling (babbling with sentence-like intonation) expected by 10-12 months.',
    priority: 1,
    ageMinMonths: 9, ageMaxMonths: 15,
  },
  {
    id: 'li_pincer',
    domain: 'motor',
    prompt: 'Can your baby pick up small things like a piece of cereal between thumb and finger?',
    shortPrompt: 'Picking up small things?',
    clinicalRationale: 'Pincer grasp expected by 9-10 months. Fine motor milestone that indicates cortical maturation.',
    priority: 2,
    ageMinMonths: 8, ageMaxMonths: 13,
  },
  {
    id: 'li_teeth',
    domain: 'dental',
    prompt: 'How are your baby\'s teeth coming in? Any signs of teething?',
    shortPrompt: 'How are teeth?',
    clinicalRationale: 'First tooth expected 6-10 months. Delayed eruption beyond 13 months needs evaluation (rickets, hypothyroidism, genetic). Early oral hygiene habits.',
    priority: 3,
    ageMinMonths: 6, ageMaxMonths: 15,
  },
  {
    id: 'li_eating_variety',
    domain: 'gi_nutrition',
    prompt: 'What foods is your baby eating? Are they trying different textures and tastes?',
    shortPrompt: 'Eating variety?',
    clinicalRationale: 'Food diversity by 9-12 months important for nutrition and allergy prevention. Texture progression (purees → mashed → finger foods) tracks oral-motor development.',
    priority: 2,
    ageMinMonths: 8, ageMaxMonths: 13,
  },
  {
    id: 'li_sleep_pattern',
    domain: 'respiratory',
    prompt: 'How is your baby sleeping at night? Any snoring, mouth breathing, or restlessness?',
    shortPrompt: 'How is night sleep?',
    clinicalRationale: 'Snoring in infants may indicate adenoid hypertrophy or OSA. Sleep-disordered breathing affects growth and development.',
    priority: 3,
    ageMinMonths: 6, ageMaxMonths: 12,
  },
  {
    id: 'li_play',
    domain: 'cognitive',
    prompt: 'How does your baby play? Do they explore toys, copy what you do?',
    shortPrompt: 'How do they play?',
    clinicalRationale: 'Imitative play and object permanence expected 8-12 months. Cause-and-effect understanding. Repetitive restricted play patterns may flag ASD.',
    priority: 2,
    ageMinMonths: 8, ageMaxMonths: 13,
  },

  // ═══════════════════════════════════════════
  // TODDLER (12–24 months)
  // ═══════════════════════════════════════════

  {
    id: 'tod_walking',
    domain: 'motor',
    prompt: 'How is your child walking? Steady, wobbly, or not yet?',
    shortPrompt: 'How is walking?',
    clinicalRationale: 'Independent walking expected 12-15 months (up to 18 months accepted). Gait pattern, toe-walking, and asymmetry are significant.',
    priority: 1,
    ageMinMonths: 12, ageMaxMonths: 20,
  },
  {
    id: 'tod_words',
    domain: 'language',
    prompt: 'How many words is your child using? Can they ask for things?',
    shortPrompt: 'How many words?',
    clinicalRationale: 'Expected: ~10 words by 18 months, 50+ words by 24 months. Word explosion between 18-24 months. Fewer than 10 words at 18 months warrants evaluation.',
    priority: 1,
    ageMinMonths: 12, ageMaxMonths: 24,
  },
  {
    id: 'tod_understanding',
    domain: 'language',
    prompt: 'Does your child understand what you say? Can they follow simple instructions?',
    shortPrompt: 'Understanding instructions?',
    clinicalRationale: 'Receptive language often more reliable than expressive. Following 1-step commands by 12 months, 2-step by 24 months. Gap between receptive and expressive is a pattern to track.',
    priority: 1,
    ageMinMonths: 12, ageMaxMonths: 24,
  },
  {
    id: 'tod_social_play',
    domain: 'behavioral',
    prompt: 'How does your child interact with other children? Any interest in playing together?',
    shortPrompt: 'Playing with others?',
    clinicalRationale: 'Parallel play normal at this age. Complete disinterest in peers, or inability to share attention, flags for ASD eval. M-CHAT screening window.',
    priority: 2,
    ageMinMonths: 12, ageMaxMonths: 24,
  },
  {
    id: 'tod_tantrums',
    domain: 'emotional',
    prompt: 'How does your child handle frustration? Tell us about any big reactions or tantrums.',
    shortPrompt: 'How do they handle frustration?',
    clinicalRationale: 'Tantrums normal 18-36 months. Frequency, duration, self-injury, and inability to be consoled distinguish normal from concerning. Baseline emotional regulation tracking.',
    priority: 2,
    ageMinMonths: 14, ageMaxMonths: 36,
  },
  {
    id: 'tod_running_climbing',
    domain: 'motor',
    prompt: 'Is your child running, climbing, or going up stairs?',
    shortPrompt: 'Running and climbing?',
    clinicalRationale: 'Running by 18 months, climbing stairs with support by 24 months. Gross motor progression. Frequent falls or poor coordination may indicate cerebellar or vestibular issues.',
    priority: 2,
    ageMinMonths: 15, ageMaxMonths: 30,
  },
  {
    id: 'tod_pretend_play',
    domain: 'cognitive',
    prompt: 'Does your child pretend during play? Like feeding a doll or talking on a toy phone?',
    shortPrompt: 'Pretend play?',
    clinicalRationale: 'Symbolic/pretend play expected by 18-24 months. Absence is a key M-CHAT item and ASD indicator. Shows cognitive abstraction and theory of mind development.',
    priority: 1,
    ageMinMonths: 15, ageMaxMonths: 30,
  },
  {
    id: 'tod_vision_18m',
    domain: 'vision',
    prompt: 'How do your child\'s eyes look? Do they squint, tilt their head, or sit very close to things?',
    shortPrompt: 'How are the eyes?',
    clinicalRationale: 'Strabismus, amblyopia screening window. Head tilt may be ocular torticollis. Early detection critical — amblyopia treatment most effective before age 5.',
    priority: 2,
    ageMinMonths: 12, ageMaxMonths: 36,
  },
  {
    id: 'tod_growth',
    domain: 'growth',
    prompt: 'How does your child\'s size compare to others their age? Any concerns about weight or height?',
    shortPrompt: 'Growth concerns?',
    clinicalRationale: 'Growth faltering surveillance. Percentile crossing should be flagged. Both underweight and overweight trajectories tracked.',
    priority: 3,
    ageMinMonths: 12, ageMaxMonths: 24,
  },

  // ═══════════════════════════════════════════
  // PRESCHOOL (2–5 years)
  // ═══════════════════════════════════════════

  {
    id: 'ps_sentences',
    domain: 'language',
    prompt: 'How is your child\'s talking? Are they putting words together into sentences?',
    shortPrompt: 'Putting words together?',
    clinicalRationale: '2-word phrases by 24 months, 3-word by 36 months, full sentences by 4 years. Speech intelligibility: 50% at 2yr, 75% at 3yr, 100% at 4yr.',
    priority: 1,
    ageMinMonths: 24, ageMaxMonths: 48,
  },
  {
    id: 'ps_clarity',
    domain: 'language',
    prompt: 'Can people outside your family understand what your child says?',
    shortPrompt: 'Can others understand them?',
    clinicalRationale: 'Speech intelligibility to strangers is a key metric. <50% at 3 years needs speech therapy evaluation. Articulation disorders vs phonological disorders.',
    priority: 1,
    ageMinMonths: 30, ageMaxMonths: 60,
  },
  {
    id: 'ps_toilet',
    domain: 'urogenital',
    prompt: 'How is toilet training going? Any concerns about daytime or nighttime dryness?',
    shortPrompt: 'How is toilet training?',
    clinicalRationale: 'Daytime dryness expected 2-4 years. Nighttime dryness variable (up to 5-7 years normal). UTI screening if regression or recurrent accidents.',
    priority: 2,
    ageMinMonths: 24, ageMaxMonths: 60,
  },
  {
    id: 'ps_behavior',
    domain: 'behavioral',
    prompt: 'How is your child\'s behavior at home or in preschool? Any challenges that concern you?',
    shortPrompt: 'Behavior concerns?',
    clinicalRationale: 'ADHD symptoms may emerge. Oppositional behavior vs normal autonomy. Aggression, defiance, or withdrawal patterns. School readiness behavioral baseline.',
    priority: 2,
    ageMinMonths: 30, ageMaxMonths: 60,
  },
  {
    id: 'ps_fine_motor',
    domain: 'motor',
    prompt: 'Can your child draw, use scissors, or button clothes? How are their hand skills?',
    shortPrompt: 'Drawing and hand skills?',
    clinicalRationale: 'Circle by 3yr, cross by 4yr, triangle by 5yr. Dominant hand established by 4yr. Fine motor delay may indicate DCD (developmental coordination disorder).',
    priority: 2,
    ageMinMonths: 30, ageMaxMonths: 60,
  },
  {
    id: 'ps_friends',
    domain: 'emotional',
    prompt: 'Does your child have friends? How do they get along with other children?',
    shortPrompt: 'How are friendships?',
    clinicalRationale: 'Cooperative play expected by 3-4 years. Social reciprocity, turn-taking, sharing. Persistent isolation or inability to maintain friendships flags social-communication concerns.',
    priority: 2,
    ageMinMonths: 30, ageMaxMonths: 72,
  },
  {
    id: 'ps_vision_3yr',
    domain: 'vision',
    prompt: 'Can your child see things clearly? Any squinting, sitting close to TV, or eye complaints?',
    shortPrompt: 'Can they see clearly?',
    clinicalRationale: 'Visual acuity testable from 3 years. Refractive errors, amblyopia, strabismus. Critical treatment window before 5-7 years.',
    priority: 2,
    ageMinMonths: 30, ageMaxMonths: 72,
  },
  {
    id: 'ps_hearing_3yr',
    domain: 'hearing',
    prompt: 'Does your child hear well? Do they often ask "what?" or need the TV loud?',
    shortPrompt: 'Hearing well?',
    clinicalRationale: 'Recurrent OME in preschoolers can cause fluctuating hearing loss affecting language. Also screens for progressive/acquired hearing loss.',
    priority: 2,
    ageMinMonths: 24, ageMaxMonths: 60,
  },
  {
    id: 'ps_eating_habits',
    domain: 'gi_nutrition',
    prompt: 'How is your child eating? Any very picky eating, or concerns about their appetite?',
    shortPrompt: 'How is eating?',
    clinicalRationale: 'Picky eating peak 2-5 years. Iron deficiency common. ARFID (avoidant/restrictive food intake) vs normal pickiness. Food diversity and growth adequacy.',
    priority: 2,
    ageMinMonths: 24, ageMaxMonths: 60,
  },
  {
    id: 'ps_sleep',
    domain: 'respiratory',
    prompt: 'How is your child sleeping? Any snoring, mouth breathing, or restless sleep?',
    shortPrompt: 'Sleep and snoring?',
    clinicalRationale: 'OSA from adenotonsillar hypertrophy peaks 2-6 years. Affects behavior, growth, cognition. Snoring >3 nights/week needs evaluation.',
    priority: 2,
    ageMinMonths: 24, ageMaxMonths: 72,
  },
  {
    id: 'ps_stutter',
    domain: 'language',
    prompt: 'Does your child get stuck on words or repeat sounds when talking?',
    shortPrompt: 'Getting stuck on words?',
    clinicalRationale: 'Normal disfluency common 2-4 years (whole-word repetitions). True stuttering (part-word repetitions, blocks, secondary behaviors) needs referral.',
    priority: 3,
    ageMinMonths: 24, ageMaxMonths: 60,
  },
  {
    id: 'ps_dental',
    domain: 'dental',
    prompt: 'How are your child\'s teeth? Any pain, discoloration, or concerns about brushing?',
    shortPrompt: 'How are the teeth?',
    clinicalRationale: 'ECC (early childhood caries) prevalence high in India. Fluoride status, brushing habits, bottle/sippy cup use at night.',
    priority: 3,
    ageMinMonths: 24, ageMaxMonths: 72,
  },

  // ═══════════════════════════════════════════
  // SCHOOL-AGE (5–12 years)
  // ═══════════════════════════════════════════

  {
    id: 'sa_school_learning',
    domain: 'cognitive',
    prompt: 'How is your child doing in school? Any difficulty with reading, writing, or math?',
    shortPrompt: 'How is school going?',
    clinicalRationale: 'Learning disabilities (dyslexia, dyscalculia, dysgraphia) typically identified in early school years. Academic performance is a developmental surveillance tool.',
    priority: 1,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_attention',
    domain: 'behavioral',
    prompt: 'Can your child focus on tasks and follow through? Or do they seem distracted or restless?',
    shortPrompt: 'Focus and attention?',
    clinicalRationale: 'ADHD assessment window. Inattentive, hyperactive-impulsive, or combined presentation. Teacher + parent reports needed. Must be present in 2+ settings.',
    priority: 1,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_friends_social',
    domain: 'emotional',
    prompt: 'How is your child getting along with friends? Any bullying, loneliness, or social worries?',
    shortPrompt: 'Friendships and social life?',
    clinicalRationale: 'Peer relationships are a key indicator of social-emotional health. Bullying (as victim or perpetrator), social isolation, anxiety about social situations.',
    priority: 1,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_vision_school',
    domain: 'vision',
    prompt: 'Can your child see the board at school? Any eye strain, headaches, or squinting?',
    shortPrompt: 'Can they see the board?',
    clinicalRationale: 'Myopia increasing rapidly in school-age children globally. Screen time correlation. Annual vision screening recommended.',
    priority: 2,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_posture',
    domain: 'musculoskeletal',
    prompt: 'How is your child\'s posture? Any complaints about back, legs, or joints?',
    shortPrompt: 'Posture and joints?',
    clinicalRationale: 'Scoliosis screening. Growing pains (normal) vs pathological joint/bone pain. Flat feet evaluation. Backpack-related posture concerns.',
    priority: 2,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_weight',
    domain: 'growth',
    prompt: 'How is your child\'s weight? Any concerns about being too thin or heavy?',
    shortPrompt: 'Weight concerns?',
    clinicalRationale: 'Childhood obesity screening. Adiposity rebound timing. Metabolic syndrome risk. Also screens for underweight/FTT that may have been missed.',
    priority: 2,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_headaches',
    domain: 'neurological',
    prompt: 'Does your child get headaches? How often and how bad?',
    shortPrompt: 'Any headaches?',
    clinicalRationale: 'Tension headaches and migraine emerge in school age. Red flags: morning headaches with vomiting (raised ICP), sudden worst-ever headache, focal neurological signs.',
    priority: 2,
    ageMinMonths: 60, ageMaxMonths: 216,
  },
  {
    id: 'sa_breathing_exercise',
    domain: 'respiratory',
    prompt: 'Does your child cough, wheeze, or get breathless during exercise or at night?',
    shortPrompt: 'Coughing or wheezing?',
    clinicalRationale: 'Exercise-induced asthma, persistent asthma management. Nocturnal cough. Allergic rhinitis comorbidity.',
    priority: 2,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_mood',
    domain: 'emotional',
    prompt: 'How is your child\'s mood overall? Do they seem happy, worried, or sad more than usual?',
    shortPrompt: 'How is their mood?',
    clinicalRationale: 'Anxiety disorders are the most common mental health condition in children. Depression can present differently than in adults — irritability, somatic complaints.',
    priority: 2,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_skin_school',
    domain: 'skin',
    prompt: 'Any skin concerns — itching, rashes, unusual spots, or changes in moles?',
    shortPrompt: 'Any skin concerns?',
    clinicalRationale: 'Eczema management. Fungal infections common (tinea, ringworm). Vitiligo. Mole monitoring baseline.',
    priority: 3,
    ageMinMonths: 60, ageMaxMonths: 144,
  },
  {
    id: 'sa_bedwetting',
    domain: 'urogenital',
    prompt: 'Is your child dry at night? Any concerns about bedwetting?',
    shortPrompt: 'Dry at night?',
    clinicalRationale: 'Nocturnal enuresis: 15% at 5yr, 5% at 10yr. Primary vs secondary (new onset after 6 months dry — investigate UTI, diabetes, stress). Treatment options available from age 6-7.',
    priority: 3,
    ageMinMonths: 60, ageMaxMonths: 120,
  },

  // ═══════════════════════════════════════════
  // ADOLESCENT (12–18 years)
  // ═══════════════════════════════════════════

  {
    id: 'adol_puberty',
    domain: 'endocrine',
    prompt: 'How is puberty going? Any concerns about the timing or pace of physical changes?',
    shortPrompt: 'Puberty concerns?',
    clinicalRationale: 'Precocious puberty (<8yr girls, <9yr boys) and delayed puberty (no signs by 13yr girls, 14yr boys). Tanner staging. Menstrual history in girls.',
    priority: 1,
    ageMinMonths: 96, ageMaxMonths: 216,
  },
  {
    id: 'adol_mood_mental',
    domain: 'emotional',
    prompt: 'How is your teen\'s mood? Any changes in behavior, sleep, appetite, or motivation?',
    shortPrompt: 'How is their mood?',
    clinicalRationale: 'Depression and anxiety peak in adolescence. PHQ-A screening. Self-harm risk. Substance use. Sleep-wake cycle disruption. Academic decline as a marker.',
    priority: 1,
    ageMinMonths: 144, ageMaxMonths: 216,
  },
  {
    id: 'adol_school_performance',
    domain: 'cognitive',
    prompt: 'How is school going? Any changes in grades, motivation, or concentration?',
    shortPrompt: 'School performance?',
    clinicalRationale: 'Academic decline in adolescence may indicate depression, substance use, undiagnosed ADHD, or learning disability that was compensated for in earlier grades.',
    priority: 1,
    ageMinMonths: 144, ageMaxMonths: 216,
  },
  {
    id: 'adol_social',
    domain: 'behavioral',
    prompt: 'How are things socially? Friendships, online life, any worries about peer pressure?',
    shortPrompt: 'Social life and friends?',
    clinicalRationale: 'Cyberbullying, social media impact, peer influence. Social withdrawal vs healthy independence. Identity formation.',
    priority: 2,
    ageMinMonths: 144, ageMaxMonths: 216,
  },
  {
    id: 'adol_body_image',
    domain: 'growth',
    prompt: 'How does your teen feel about their body? Any concerns about weight, eating, or exercise habits?',
    shortPrompt: 'Body image concerns?',
    clinicalRationale: 'Eating disorders (AN, BN) onset peak in adolescence. Muscle dysmorphia in boys. Excessive exercise. BMI tracking with pubertal context.',
    priority: 2,
    ageMinMonths: 120, ageMaxMonths: 216,
  },
  {
    id: 'adol_sleep',
    domain: 'general',
    prompt: 'How is your teen sleeping? What time do they go to bed and wake up?',
    shortPrompt: 'How is sleep?',
    clinicalRationale: 'Circadian shift in adolescence. Chronic sleep deprivation affects mood, cognition, and growth. Screen time impact. Sleep hygiene education.',
    priority: 2,
    ageMinMonths: 120, ageMaxMonths: 216,
  },
  {
    id: 'adol_sports_injuries',
    domain: 'musculoskeletal',
    prompt: 'Is your teen active in sports? Any recurring pain, injuries, or joint issues?',
    shortPrompt: 'Sports and injuries?',
    clinicalRationale: 'Overuse injuries (Osgood-Schlatter, stress fractures). ACL injuries. Scoliosis progression during growth spurt. Sports-specific screening.',
    priority: 2,
    ageMinMonths: 120, ageMaxMonths: 216,
  },
  {
    id: 'adol_skin',
    domain: 'skin',
    prompt: 'How is your teen\'s skin? Any acne, rashes, or skin changes that bother them?',
    shortPrompt: 'Skin concerns?',
    clinicalRationale: 'Acne vulgaris management. Impact on self-esteem. Severe acne may indicate hormonal issues (PCOS in girls). Skin care guidance.',
    priority: 3,
    ageMinMonths: 120, ageMaxMonths: 216,
  },
  {
    id: 'adol_menstrual',
    domain: 'endocrine',
    prompt: 'How are periods going? Any pain, irregularity, or concerns?',
    shortPrompt: 'How are periods?',
    clinicalRationale: 'Menarche expected 10-15 years. Irregular cycles normal for first 2 years. Dysmenorrhea, menorrhagia, amenorrhea evaluation. PCOS screening.',
    priority: 2,
    ageMinMonths: 108, ageMaxMonths: 216,
    showIf: [{ type: 'prior_observation', key: 'female', description: 'Female child' }],
  },
  {
    id: 'adol_vision_screen',
    domain: 'vision',
    prompt: 'Can your teen see clearly? Any eye strain from screens, or needing to squint?',
    shortPrompt: 'Vision and screen use?',
    clinicalRationale: 'Myopia progression rapid in adolescence. Screen time. Digital eye strain. Contact lens safety if applicable.',
    priority: 3,
    ageMinMonths: 120, ageMaxMonths: 216,
  },
  {
    id: 'adol_cardiac_sports',
    domain: 'cardiac',
    prompt: 'Does your teen ever feel their heart racing, chest pain, or dizziness during activity?',
    shortPrompt: 'Heart or chest concerns?',
    clinicalRationale: 'Pre-participation sports screening. Hypertrophic cardiomyopathy, WPW, long QT. Syncope evaluation. Must-not-miss for sudden cardiac death prevention.',
    priority: 2,
    ageMinMonths: 120, ageMaxMonths: 216,
  },

  // ═══════════════════════════════════════════
  // UNIVERSAL — "Something else" (all ages)
  // ═══════════════════════════════════════════

  {
    id: 'universal_free',
    domain: 'general',
    prompt: 'Something else I\'ve noticed...',
    shortPrompt: 'Something else...',
    clinicalRationale: 'Always available free-text option. Captures observations that don\'t fit any prompted domain. Parent instinct is clinically valuable.',
    priority: 5,
    ageMinMonths: 0, ageMaxMonths: 216,
  },

  // ═══════════════════════════════════════════
  // CONDITIONAL PROMPTS — shown based on life record flags
  // ═══════════════════════════════════════════

  {
    id: 'cond_preterm_motor',
    domain: 'motor',
    prompt: 'How is your baby\'s movement and muscle tone? Any stiffness or floppiness?',
    shortPrompt: 'Movement and tone?',
    clinicalRationale: 'Preterm infants have higher risk of CP, hypotonia, and motor delay. Corrected age should be used. Early intervention critical.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 24,
    showIf: [{ type: 'birth_history', key: 'preterm', description: 'Born before 37 weeks' }],
  },
  {
    id: 'cond_preterm_vision',
    domain: 'vision',
    prompt: 'How are your baby\'s eyes tracking? Any concerns about how they see?',
    shortPrompt: 'Eye tracking?',
    clinicalRationale: 'ROP screening in preterm. Higher rates of strabismus, refractive errors, CVI in premature infants.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 12,
    showIf: [{ type: 'birth_history', key: 'preterm', description: 'Born before 37 weeks' }],
  },
  {
    id: 'cond_family_asd',
    domain: 'behavioral',
    prompt: 'How does your child interact and communicate? Any concerns about social connection?',
    shortPrompt: 'Social interaction?',
    clinicalRationale: 'Sibling recurrence risk for ASD is 10-20%. Enhanced surveillance warranted when family history is positive.',
    priority: 1,
    ageMinMonths: 12, ageMaxMonths: 48,
    showIf: [{ type: 'family_history', key: 'autism', description: 'Family history of autism/ASD' }],
  },
  {
    id: 'cond_growth_concern',
    domain: 'growth',
    prompt: 'Have you noticed any changes in your child\'s growth, appetite, or energy levels?',
    shortPrompt: 'Growth and energy?',
    clinicalRationale: 'Active growth concern in life record — enhanced monitoring of growth velocity, nutritional intake, and energy.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 216,
    showIf: [{ type: 'growth_concern', description: 'Growth percentile crossing detected' }],
  },
  {
    id: 'cond_milestone_delay',
    domain: 'cognitive',
    prompt: 'How is your child\'s overall development? Learning new things, understanding, problem-solving?',
    shortPrompt: 'Overall development?',
    clinicalRationale: 'Active milestone delays in life record — broader developmental surveillance to check for global vs isolated delay.',
    priority: 1,
    ageMinMonths: 0, ageMaxMonths: 72,
    showIf: [{ type: 'milestone_delayed', description: 'One or more milestones delayed' }],
  },
  {
    id: 'cond_eczema_allergy',
    domain: 'immunological',
    prompt: 'How is the skin? Any flare-ups, new reactions, or changes with food?',
    shortPrompt: 'Skin and allergies?',
    clinicalRationale: 'Atopic march: eczema → food allergy → allergic rhinitis → asthma. Active eczema warrants allergy surveillance.',
    priority: 2,
    ageMinMonths: 3, ageMaxMonths: 72,
    showIf: [{ type: 'active_condition', key: 'eczema', description: 'Active eczema/atopic dermatitis' }],
  },
]

// ============================================
// PROMPT SELECTION ENGINE
// ============================================

/**
 * Get the domain prompts relevant for a child's current age and life record.
 * Returns prompts sorted by priority, with conditional prompts evaluated.
 *
 * @param ageMonths - Child's current age in months
 * @param lifeRecordFlags - Optional flags from the life record for conditional prompts
 * @param maxPrompts - Maximum number of prompts to return (default 6 + free text)
 */
export function getPromptsForAge(
  ageMonths: number,
  lifeRecordFlags?: {
    isPreterm?: boolean
    hasGrowthConcern?: boolean
    hasMilestoneDelays?: boolean
    familyHistory?: string[]
    activeConditions?: string[]
  },
  maxPrompts: number = 6
): DomainPrompt[] {
  // Filter by age range
  let eligible = DOMAIN_PROMPTS.filter(
    (p) => ageMonths >= p.ageMinMonths && ageMonths <= p.ageMaxMonths
  )

  // Evaluate conditional prompts
  eligible = eligible.filter((p) => {
    if (!p.showIf || p.showIf.length === 0) return true
    if (!lifeRecordFlags) return false

    return p.showIf.some((cond) => {
      switch (cond.type) {
        case 'birth_history':
          return cond.key === 'preterm' && lifeRecordFlags.isPreterm
        case 'growth_concern':
          return lifeRecordFlags.hasGrowthConcern
        case 'milestone_delayed':
          return lifeRecordFlags.hasMilestoneDelays
        case 'family_history':
          return lifeRecordFlags.familyHistory?.some(
            (fh) => fh.toLowerCase().includes(cond.key || '')
          )
        case 'active_condition':
          return lifeRecordFlags.activeConditions?.some(
            (ac) => ac.toLowerCase().includes(cond.key || '')
          )
        default:
          return false
      }
    })
  })

  // Evaluate hide conditions
  eligible = eligible.filter((p) => {
    if (!p.hideIf || p.hideIf.length === 0) return true
    // If hide conditions met, suppress the prompt
    // (Currently no hideIf defined, but infrastructure ready)
    return true
  })

  // Sort by priority (1 = most important)
  eligible.sort((a, b) => a.priority - b.priority)

  // Always include the free-text option
  const freeText = eligible.find((p) => p.id === 'universal_free')
  const others = eligible.filter((p) => p.id !== 'universal_free')

  // Deduplicate domains — show max 1 prompt per domain for cleaner UX
  const seenDomains = new Set<string>()
  const deduped: DomainPrompt[] = []
  for (const p of others) {
    if (!seenDomains.has(p.domain) && deduped.length < maxPrompts) {
      deduped.push(p)
      seenDomains.add(p.domain)
    }
  }

  // Add free text at the end
  if (freeText) deduped.push(freeText)

  return deduped
}

/**
 * Get ALL prompts for an age (no deduplication, no limit).
 * Used for comprehensive review or doctor-initiated screening.
 */
export function getAllPromptsForAge(ageMonths: number): DomainPrompt[] {
  return DOMAIN_PROMPTS.filter(
    (p) => ageMonths >= p.ageMinMonths && ageMonths <= p.ageMaxMonths && !p.showIf
  ).sort((a, b) => a.priority - b.priority)
}

/**
 * Get prompts for a specific domain at a given age.
 * Used when the parent wants to explore a domain more deeply.
 */
export function getPromptsForDomain(
  domain: BodySystem,
  ageMonths: number
): DomainPrompt[] {
  return DOMAIN_PROMPTS.filter(
    (p) => p.domain === domain && ageMonths >= p.ageMinMonths && ageMonths <= p.ageMaxMonths
  ).sort((a, b) => a.priority - b.priority)
}
