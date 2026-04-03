/**
 * SKIDS Evidence Library — Emotional & Behavioral Growth Track Citations
 *
 * All citations supporting the 10 emotional development tracks and
 * 10 behavioral development tracks (0-3mo through 15-18yr).
 *
 * Citations shared between both domains are collected in SHARED_DEV_CITATIONS.
 * Domain-specific citations are in EMOTIONAL_GROWTH_CITATIONS and
 * BEHAVIORAL_GROWTH_CITATIONS respectively.
 *
 * Verification status:
 *   verified: true  = DOI/PMID confirmed via PubMed or publisher search
 *   verified: false = Reference appears real but needs manual DOI/PMID confirmation
 *
 * Evidence strings extracted from:
 *   - src/lib/content/growth-data-emotional.ts  (10 age periods)
 *   - src/lib/content/growth-data-behavioral.ts (10 age periods)
 */

import type { Citation } from '../types'

// ════════════════════════════════════════════════════════════════════════════
// SHARED CITATIONS — Referenced by both Emotional and Behavioral domains
// ════════════════════════════════════════════════════════════════════════════

export const SHARED_DEV_CITATIONS: Citation[] = [
  // ── Ainsworth (1978) ────────────────────────────────────────────────────
  // Emotional: 0-3mo, 6-12mo   Behavioral: (attachment context)
  {
    id: 'ainsworth-1978-patterns-attachment',
    authors: 'Ainsworth MDS, Blehar MC, Waters E, Wall S',
    year: 1978,
    title: 'Patterns of Attachment: A Psychological Study of the Strange Situation',
    source: 'Lawrence Erlbaum Associates',
    type: 'theory',
    grade: '5',
    isbn: '978-0-898-59461-9',
    region: 'global',
    keyFinding: 'Introduced the Strange Situation procedure and classified infant-caregiver attachment into secure, insecure-avoidant, and insecure-resistant patterns. Foundation of modern attachment science.',
    verified: true,
  },

  // ── Bowlby (1982) ──────────────────────────────────────────────────────
  // Emotional: 6-12mo   Behavioral: (attachment context)
  {
    id: 'bowlby-1982-attachment-loss-vol1',
    authors: 'Bowlby J',
    year: 1982,
    title: 'Attachment and Loss, Vol. 1: Attachment',
    source: 'Basic Books',
    type: 'theory',
    grade: '5',
    isbn: '978-0-465-00543-7',
    edition: '2nd Edition (original 1969)',
    region: 'global',
    keyFinding: 'Established attachment theory: the child\'s tie to the mother is a primary biological system essential for survival. Separation anxiety and stranger anxiety are normative developmental signals.',
    verified: true,
  },

  // ── AAP Safe Sleep (2022) ──────────────────────────────────────────────
  // Emotional: 0-3mo   Behavioral: 0-3mo
  {
    id: 'aap-2022-safe-sleep',
    authors: 'Moon RY, Carlin RF, Hand I; Task Force on Sudden Infant Death Syndrome and the Committee on Fetus and Newborn',
    year: 2022,
    title: 'Sleep-Related Infant Deaths: Updated 2022 Recommendations for Reducing Infant Deaths in the Sleep Environment',
    source: 'Pediatrics',
    type: 'guideline',
    grade: '4',
    doi: '10.1542/peds.2022-057990',
    pmid: '35726558',
    volume: '150',
    issue: '1',
    guidelineBody: 'AAP',
    region: 'usa',
    keyFinding: 'Comprehensive safe sleep recommendations including supine position, firm sleep surface, room-sharing without bed-sharing. Updated evidence on swaddling, skin-to-skin, and pacifier use.',
    verified: true,
  },

  // ── Mindell et al. (2006) — also in intervention-citations.ts ─────────
  // Emotional: (sleep context)  Behavioral: 12-24mo
  {
    id: 'mindell-2006-behavioral-sleep',
    authors: 'Mindell JA, Kuhn B, Lewin DS, Meltzer LJ, Sadeh A; American Academy of Sleep Medicine',
    year: 2006,
    title: 'Behavioral Treatment of Bedtime Problems and Night Wakings in Infants and Young Children',
    source: 'Sleep',
    type: 'systematic_review',
    grade: '1a',
    pmid: '17068979',
    volume: '29',
    issue: '10',
    pages: '1263-1276',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17068979/',
    region: 'global',
    keyFinding: 'Systematic review of 52 treatment studies. Behavioral interventions (extinction, graduated extinction, bedtime fading) are highly effective for pediatric sleep problems.',
    verified: true,
  },

  // ── Steinberg (2014) ──────────────────────────────────────────────────
  // Emotional: 12-15yr   Behavioral: 8-12yr context
  {
    id: 'steinberg-2014-age-of-opportunity',
    authors: 'Steinberg L',
    year: 2014,
    title: 'Age of Opportunity: Lessons from the New Science of Adolescence',
    source: 'Houghton Mifflin Harcourt',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-544-27977-3',
    region: 'global',
    keyFinding: 'Adolescence is a period of heightened neuroplasticity presenting both risk and opportunity. The dual-systems model explains mismatch between early-maturing reward systems and late-maturing cognitive control.',
    verified: true,
  },

  // ── Arnett (2004) ─────────────────────────────────────────────────────
  // Emotional: 15-18yr   Behavioral: 15-18yr
  {
    id: 'arnett-2004-emerging-adulthood',
    authors: 'Arnett JJ',
    year: 2004,
    title: 'Emerging Adulthood: The Winding Road from the Late Teens through the Twenties',
    source: 'Oxford University Press',
    type: 'theory',
    grade: '5',
    isbn: '978-0-19-517314-2',
    region: 'global',
    keyFinding: 'Defined emerging adulthood (18-25) as a distinct developmental period characterized by identity exploration, instability, self-focus, feeling in-between, and possibilities. Late adolescence is the transition into this phase.',
    verified: true,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// EMOTIONAL GROWTH CITATIONS — Unique to the Emotional domain
// ════════════════════════════════════════════════════════════════════════════

export const EMOTIONAL_GROWTH_CITATIONS: Citation[] = [
  // ── 0-3 months ─────────────────────────────────────────────────────────

  {
    id: 'schore-2001-relational-trauma-right-brain',
    authors: 'Schore AN',
    year: 2001,
    title: 'The Effects of Early Relational Trauma on Right Brain Development, Affect Regulation, and Infant Mental Health',
    source: 'Infant Mental Health Journal',
    type: 'theory',
    grade: '5',
    doi: '10.1002/1097-0355(200101/04)22:1<201::AID-IMHJ8>3.0.CO;2-9',
    volume: '22',
    issue: '1-2',
    pages: '201-269',
    region: 'global',
    keyFinding: 'Early relational trauma directly impacts right brain development, affect regulation circuits, and the orbitofrontal cortex. Responsive caregiving is critical for healthy neurological wiring of the emotional brain.',
    verified: true,
  },

  {
    id: 'zero-to-three-2016-dc05',
    authors: 'Zero to Three',
    year: 2016,
    title: 'DC:0-5 Diagnostic Classification of Mental Health and Developmental Disorders of Infancy and Early Childhood',
    source: 'Zero to Three',
    type: 'guideline',
    grade: '4',
    isbn: '978-1-938558-57-3',
    guidelineBody: 'ZeroToThree',
    region: 'global',
    keyFinding: 'Standardized diagnostic classification system for mental health and developmental disorders in children aged 0-5. Provides framework for early identification of emotional and relational difficulties.',
    verified: true,
  },

  {
    id: 'murray-cooper-1997-postpartum-depression',
    authors: 'Murray L, Cooper PJ',
    year: 1997,
    title: 'Postpartum Depression and Child Development',
    source: 'Psychological Medicine',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1017/S0033291796004564',
    pmid: '9089818',
    volume: '27',
    issue: '2',
    pages: '253-260',
    url: 'https://pubmed.ncbi.nlm.nih.gov/9089818/',
    region: 'global',
    keyFinding: 'Postpartum depression adversely affects mother-infant interaction quality and child cognitive and emotional development. Early detection and treatment significantly mitigate these effects.',
    verified: true,
  },

  // ── 3-6 months ─────────────────────────────────────────────────────────

  {
    id: 'tronick-2007-neurobehavioral-social-emotional',
    authors: 'Tronick EZ',
    year: 2007,
    title: 'The Neurobehavioral and Social-Emotional Development of Infants and Children',
    source: 'W.W. Norton & Company',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-393-70517-1',
    region: 'global',
    keyFinding: 'Introduced the Still-Face Paradigm demonstrating infants\' active role in social-emotional regulation. Mutual Regulation Model shows how caregiver-infant dyads co-create emotional states and repair interactive mismatches.',
    verified: true,
  },

  {
    id: 'sroufe-1995-emotional-development',
    authors: 'Sroufe LA',
    year: 1995,
    title: 'Emotional Development: The Organization of Emotional Life in the Early Years',
    source: 'Cambridge University Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-521-47414-5',
    region: 'global',
    keyFinding: 'Emotion emerges through organized developmental sequences from undifferentiated distress/pleasure to differentiated emotions (joy, anger, fear, sadness). Emotional organization reflects and drives broader development.',
    verified: false,
  },

  {
    id: 'gergely-watson-1999-social-biofeedback',
    authors: 'Gergely G, Watson JS',
    year: 1999,
    title: 'Early Socio-Emotional Development: Contingency Perception and the Social Biofeedback Model',
    source: 'Early Social Cognition (Rochat P, ed.), Lawrence Erlbaum Associates',
    type: 'theory',
    grade: '5',
    region: 'global',
    keyFinding: 'Infants detect contingent responses from caregivers as a social biofeedback mechanism. Marked mirroring of infant emotions by parents helps infants develop emotional self-awareness and regulation.',
    verified: false,
  },

  {
    id: 'cdc-2022-milestones-4mo',
    authors: 'Centers for Disease Control and Prevention',
    year: 2022,
    title: 'Developmental Milestones at 4 Months',
    source: 'CDC Learn the Signs. Act Early.',
    type: 'guideline',
    grade: '4',
    url: 'https://www.cdc.gov/ncbddd/actearly/milestones/milestones-4mo.html',
    guidelineBody: 'CDC',
    region: 'usa',
    keyFinding: 'Social smile, spontaneous smiling, enjoys playing with people, copies movements and facial expressions — key emotional milestones at 4 months.',
    verified: true,
  },

  // ── 6-12 months ────────────────────────────────────────────────────────

  {
    id: 'cassidy-shaver-2016-handbook-attachment',
    authors: 'Cassidy J, Shaver PR (eds.)',
    year: 2016,
    title: 'Handbook of Attachment: Theory, Research, and Clinical Applications',
    source: 'Guilford Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-4625-2529-4',
    edition: '3rd Edition',
    region: 'global',
    keyFinding: 'Comprehensive reference on attachment theory and research. Covers internal working models, attachment across the lifespan, cultural variations, and clinical applications including disorganized attachment.',
    verified: true,
  },

  {
    id: 'ahnert-2004-transition-child-care',
    authors: 'Ahnert L, Gunnar MR, Lamb ME, Barthel M',
    year: 2004,
    title: 'Transition to Child Care: Associations with Infant-Mother Attachment, Infant Negative Emotion, and Cortisol Elevations',
    source: 'Child Development',
    type: 'cohort',
    grade: '2b',
    doi: '10.1111/j.1467-8624.2004.00698.x',
    pmid: '15144478',
    volume: '75',
    issue: '3',
    pages: '639-650',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15144478/',
    region: 'global',
    keyFinding: 'Insecurely attached infants showed elevated cortisol during child care transition. Secure attachment buffered stress responses during mother-infant separation in care settings.',
    verified: true,
  },

  {
    id: 'cdc-2023-milestones-9mo',
    authors: 'Centers for Disease Control and Prevention',
    year: 2023,
    title: 'Developmental Milestones at 9 Months',
    source: 'CDC Learn the Signs. Act Early.',
    type: 'guideline',
    grade: '4',
    url: 'https://www.cdc.gov/ncbddd/actearly/milestones/milestones-9mo.html',
    guidelineBody: 'CDC',
    region: 'usa',
    keyFinding: 'Stranger anxiety, clinginess to familiar adults, and separation distress are normative emotional milestones at 9 months reflecting healthy attachment development.',
    verified: true,
  },

  // ── 12-24 months ───────────────────────────────────────────────────────

  {
    id: 'siegel-bryson-2011-whole-brain-child',
    authors: 'Siegel DJ, Bryson TP',
    year: 2011,
    title: 'The Whole-Brain Child: 12 Revolutionary Strategies to Nurture Your Child\'s Developing Mind',
    source: 'Delacorte Press / Random House',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-553-80716-1',
    region: 'global',
    keyFinding: 'Integrates neuroscience with practical parenting strategies. Upstairs/downstairs brain model explains toddler emotional dysregulation and the importance of connecting before redirecting.',
    verified: true,
  },

  {
    id: 'gross-1998-emotion-regulation-review',
    authors: 'Gross JJ',
    year: 1998,
    title: 'The Emerging Field of Emotion Regulation: An Integrative Review',
    source: 'Review of General Psychology',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1037/1089-2680.2.3.271',
    volume: '2',
    issue: '3',
    pages: '271-299',
    region: 'global',
    keyFinding: 'Introduced the process model of emotion regulation distinguishing antecedent-focused (reappraisal) from response-focused (suppression) strategies. Framework applicable across development.',
    verified: true,
  },

  {
    id: 'kopp-1989-regulation-distress',
    authors: 'Kopp CB',
    year: 1989,
    title: 'Regulation of Distress and Negative Emotions: A Developmental View',
    source: 'Developmental Psychology',
    type: 'theory',
    grade: '5',
    doi: '10.1037/0012-1649.25.3.343',
    volume: '25',
    issue: '3',
    pages: '343-354',
    region: 'global',
    keyFinding: 'Mapped the developmental progression of emotion regulation from neurophysiological modulation in infancy through sensorimotor strategies to cognitive regulation in early childhood.',
    verified: true,
  },

  {
    id: 'zero-to-three-2020-infant-mental-health',
    authors: 'Zero to Three',
    year: 2020,
    title: 'Infant and Early Childhood Mental Health',
    source: 'Zero to Three',
    type: 'guideline',
    grade: '4',
    guidelineBody: 'ZeroToThree',
    region: 'global',
    keyFinding: 'Framework for understanding infant and toddler mental health in relational context. Tantrums and emotional intensity in toddlerhood are normative developmental phenomena, not pathology.',
    verified: false,
  },

  {
    id: 'aap-2021-emotional-development-toddlers',
    authors: 'American Academy of Pediatrics',
    year: 2021,
    title: 'Emotional Development in Toddlers',
    source: 'HealthyChildren.org, American Academy of Pediatrics',
    type: 'guideline',
    grade: '4',
    guidelineBody: 'AAP',
    region: 'usa',
    keyFinding: 'Toddler emotional development includes emerging self-awareness, beginning empathy, and intense emotional expressions. Tantrums peak between 18-36 months and are developmentally normative.',
    verified: false,
  },

  // ── 2-3 years ──────────────────────────────────────────────────────────

  {
    id: 'denham-1998-emotional-development-young-children',
    authors: 'Denham SA',
    year: 1998,
    title: 'Emotional Development in Young Children',
    source: 'Guilford Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-57230-330-9',
    region: 'global',
    keyFinding: 'Comprehensive account of emotional development from infancy through preschool. Emotion knowledge, expression, and regulation develop in parallel and interact with social competence.',
    verified: true,
  },

  {
    id: 'lagattuta-wellman-2002-parent-child-conversations-emotions',
    authors: 'Lagattuta KH, Wellman HM',
    year: 2002,
    title: 'Differences in Early Parent-Child Conversations About Negative Versus Positive Emotions: Implications for the Development of Psychological Understanding',
    source: 'Developmental Psychology',
    type: 'cohort',
    grade: '2b',
    doi: '10.1037/0012-1649.38.4.564',
    pmid: '12090486',
    volume: '38',
    issue: '4',
    pages: '564-580',
    region: 'global',
    keyFinding: 'Parents talk more about causes and consequences of negative emotions than positive ones. These conversations scaffold children\'s developing psychological understanding and emotion knowledge.',
    verified: true,
  },

  {
    id: 'muris-2000-fears-young-children',
    authors: 'Muris P, Merckelbach H, Ollendick TH, King NJ, Bogie N',
    year: 2000,
    title: 'Fears in Young Children: Frequencies, Content, and Developmental Patterns from a Cross-Sectional Perspective',
    source: 'Journal of Clinical Child Psychology',
    type: 'cohort',
    grade: '2b',
    doi: '10.1207/S15374424jccp2904_12',
    volume: '29',
    issue: '4',
    pages: '499-512',
    region: 'global',
    keyFinding: 'Fear of the dark, animals, and imaginary creatures peak between ages 2-4. Normative fear patterns follow predictable developmental sequences linked to cognitive maturation.',
    verified: false,
  },

  {
    id: 'mindell-owens-2015-clinical-guide-pediatric-sleep',
    authors: 'Mindell JA, Owens JA',
    year: 2015,
    title: 'A Clinical Guide to Pediatric Sleep: Diagnosis and Management of Sleep Problems',
    source: 'Wolters Kluwer',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-4511-9364-4',
    edition: '3rd Edition',
    region: 'global',
    keyFinding: 'Comprehensive clinical guide covering nighttime fears, nightmares, and sleep-related anxiety in young children. Developmental approach to sleep difficulties across the pediatric age span.',
    verified: true,
  },

  // ── 3-5 years ──────────────────────────────────────────────────────────

  {
    id: 'tangney-dearing-2002-shame-guilt',
    authors: 'Tangney JP, Dearing RL',
    year: 2002,
    title: 'Shame and Guilt',
    source: 'Guilford Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-57230-714-7',
    region: 'global',
    keyFinding: 'Distinguishes shame (global self-evaluation) from guilt (behaviour-specific evaluation). Guilt is associated with empathy and reparative action; shame with withdrawal, anger, and defensive externalisation.',
    verified: true,
  },

  {
    id: 'wellman-1992-childs-theory-of-mind',
    authors: 'Wellman HM',
    year: 1992,
    title: 'The Child\'s Theory of Mind',
    source: 'MIT Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-262-73100-6',
    region: 'global',
    keyFinding: 'Children develop an understanding that others have beliefs, desires, and intentions distinct from their own (theory of mind) between ages 3-5. This cognitive achievement transforms emotional and social understanding.',
    verified: true,
  },

  {
    id: 'eisenberg-fabes-1998-prosocial-development',
    authors: 'Eisenberg N, Fabes RA',
    year: 1998,
    title: 'Prosocial Development',
    source: 'Handbook of Child Psychology Vol. 3: Social, Emotional, and Personality Development (Damon W, Eisenberg N, eds.), Wiley',
    type: 'textbook',
    grade: '5',
    region: 'global',
    keyFinding: 'Prosocial behaviour emerges in toddlerhood and develops through empathy, perspective-taking, and moral reasoning. Parental warmth and inductive discipline promote prosocial development.',
    verified: false,
  },

  {
    id: 'lagattuta-2014-connecting-mental-states-across-time',
    authors: 'Lagattuta KH',
    year: 2014,
    title: 'Linking Past, Present, and Future: Children\'s Ability to Connect Mental States and Emotions Across Time',
    source: 'Child Development Perspectives',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1111/cdep.12065',
    volume: '8',
    issue: '2',
    pages: '90-95',
    region: 'global',
    keyFinding: 'Children gradually develop the ability to link past experiences with present emotions and future expectations. This temporal understanding of mental states underpins emotional regulation and empathy.',
    verified: true,
  },

  // ── 5-8 years ──────────────────────────────────────────────────────────

  {
    id: 'dweck-2006-mindset',
    authors: 'Dweck CS',
    year: 2006,
    title: 'Mindset: The New Psychology of Success',
    source: 'Random House',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-345-47232-8',
    region: 'global',
    keyFinding: 'Growth mindset (belief that abilities can be developed) versus fixed mindset (belief that abilities are innate) profoundly affects children\'s response to challenge, failure, and emotional resilience.',
    verified: true,
  },

  {
    id: 'kearney-2008-school-refusal',
    authors: 'Kearney CA',
    year: 2008,
    title: 'School Absenteeism and School Refusal Behavior in Youth: A Contemporary Review',
    source: 'Clinical Psychology Review',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1016/j.cpr.2007.07.012',
    pmid: '17720288',
    volume: '28',
    issue: '3',
    pages: '451-471',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17720288/',
    region: 'global',
    keyFinding: 'School refusal affects 5-28% of youth at some point. Anxiety-based school refusal requires early intervention. Functions include avoidance of negative affect, escape from social evaluation, and attention-seeking.',
    verified: true,
  },

  {
    id: 'crick-grotpeter-1995-relational-aggression',
    authors: 'Crick NR, Grotpeter JK',
    year: 1995,
    title: 'Relational Aggression, Gender, and Social-Psychological Adjustment',
    source: 'Child Development',
    type: 'cohort',
    grade: '2b',
    doi: '10.1111/j.1467-8624.1995.tb00900.x',
    pmid: '7789197',
    volume: '66',
    issue: '3',
    pages: '710-722',
    url: 'https://pubmed.ncbi.nlm.nih.gov/7789197/',
    region: 'global',
    keyFinding: 'Identified relational aggression (social exclusion, rumour-spreading) as a predominantly female form of aggression distinct from physical aggression. Both forms are associated with social-psychological maladjustment.',
    verified: true,
  },

  {
    id: 'kendall-2012-child-adolescent-therapy',
    authors: 'Kendall PC (ed.)',
    year: 2012,
    title: 'Child and Adolescent Therapy: Cognitive-Behavioral Procedures',
    source: 'Guilford Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-4625-0476-3',
    edition: '4th Edition',
    region: 'global',
    keyFinding: 'Evidence-based CBT protocols for childhood anxiety, depression, and externalising disorders. Coping Cat programme for anxiety. Emotional understanding and cognitive restructuring as core therapeutic mechanisms.',
    verified: true,
  },

  // ── 8-12 years ─────────────────────────────────────────────────────────

  {
    id: 'harter-2012-construction-of-self',
    authors: 'Harter S',
    year: 2012,
    title: 'The Construction of the Self: Developmental and Sociocultural Foundations',
    source: 'Guilford Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-4625-0297-4',
    edition: '2nd Edition',
    region: 'global',
    keyFinding: 'Self-esteem develops through domain-specific self-evaluations (academic, social, physical, behavioural) that become integrated in middle childhood. Discrepancy between real and ideal self predicts depression.',
    verified: true,
  },

  {
    id: 'twenge-2018-depressive-symptoms-adolescents',
    authors: 'Twenge JM, Joiner TE, Rogers ML, Martin GN',
    year: 2018,
    title: 'Increases in Depressive Symptoms, Suicide-Related Outcomes, and Suicide Rates Among U.S. Adolescents After 2010 and Links to Increased New Media Screen Time',
    source: 'Clinical Psychological Science',
    type: 'cohort',
    grade: '2b',
    doi: '10.1177/2167702617723376',
    volume: '6',
    issue: '1',
    pages: '3-17',
    region: 'usa',
    keyFinding: 'Significant increases in depressive symptoms, suicide-related outcomes, and suicide rates among US adolescents after 2010 correlate with rising new media screen time. Strongest effects in girls.',
    verified: true,
  },

  {
    id: 'orben-przybylski-2019-wellbeing-digital',
    authors: 'Orben A, Przybylski AK',
    year: 2019,
    title: 'The Association Between Adolescent Well-Being and Digital Technology Use',
    source: 'Nature Human Behaviour',
    type: 'cohort',
    grade: '2b',
    doi: '10.1038/s41562-018-0506-1',
    pmid: '30944443',
    volume: '3',
    issue: '2',
    pages: '173-182',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30944443/',
    region: 'global',
    keyFinding: 'Specification curve analysis across 355,358 adolescents shows digital technology use explains only 0.4% of variation in well-being — comparable to wearing glasses or eating potatoes. Effect is negative but very small.',
    verified: true,
  },

  {
    id: 'nolen-hoeksema-2008-rethinking-rumination',
    authors: 'Nolen-Hoeksema S, Wisco BE, Lyubomirsky S',
    year: 2008,
    title: 'Rethinking Rumination',
    source: 'Perspectives on Psychological Science',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1111/j.1745-6924.2008.00088.x',
    pmid: '26158948',
    volume: '3',
    issue: '5',
    pages: '400-424',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26158948/',
    region: 'global',
    keyFinding: 'Rumination — repetitive, passive self-focused thinking — predicts onset of depression, anxiety, and substance abuse. Gender differences in rumination emerge in adolescence and partially explain female preponderance of depression.',
    verified: true,
  },

  // ── 12-15 years ────────────────────────────────────────────────────────

  {
    id: 'casey-2008-adolescent-brain',
    authors: 'Casey BJ, Getz S, Galvan A',
    year: 2008,
    title: 'The Adolescent Brain',
    source: 'Developmental Review',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1016/j.dr.2007.08.003',
    pmid: '18688292',
    volume: '28',
    issue: '1',
    pages: '62-77',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18688292/',
    region: 'global',
    keyFinding: 'Adolescent risk-taking is driven by a developmental mismatch: the subcortical socioemotional system matures before the prefrontal cognitive control system. This imbalance explains heightened reward-seeking and impulsivity.',
    verified: true,
  },

  {
    id: 'nice-2019-depression-children-young-people',
    authors: 'National Institute for Health and Care Excellence',
    year: 2019,
    title: 'Depression in Children and Young People: Identification and Management (NICE Guideline NG134)',
    source: 'National Institute for Health and Care Excellence',
    type: 'guideline',
    grade: '4',
    url: 'https://www.nice.org.uk/guidance/ng134',
    guidelineBody: 'NICE',
    region: 'uk',
    keyFinding: 'Stepped-care model for depression in 5-18 year olds. Watchful waiting for mild depression, guided self-help/group CBT for moderate, individual CBT/fluoxetine for moderate-severe. Family involvement essential.',
    verified: true,
  },

  {
    id: 'haidt-allen-2020-scrutinizing-digital-mental-health',
    authors: 'Haidt J, Allen N',
    year: 2020,
    title: 'Scrutinizing the Effects of Digital Technology on Mental Health',
    source: 'Nature',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1038/d41586-020-00296-x',
    volume: '578',
    pages: '226-227',
    region: 'global',
    keyFinding: 'Digital technology effects on adolescent mental health are real but complex. Social media\'s impact is likely stronger than total screen time. Displacement of sleep and face-to-face interaction are key mechanisms.',
    verified: true,
  },

  {
    id: 'erikson-1968-identity-youth-crisis',
    authors: 'Erikson EH',
    year: 1968,
    title: 'Identity: Youth and Crisis',
    source: 'W.W. Norton & Company',
    type: 'theory',
    grade: '5',
    isbn: '978-0-393-31144-0',
    region: 'global',
    keyFinding: 'Defined the psychosocial crisis of adolescence as identity versus role confusion. Identity formation through exploration and commitment is the central developmental task of the teenage years.',
    verified: true,
  },

  // ── 15-18 years ────────────────────────────────────────────────────────

  {
    id: 'steinberg-2009-age-differences-future-orientation',
    authors: 'Steinberg L, Graham S, O\'Brien L, Woolard J, Cauffman E, Banich M',
    year: 2009,
    title: 'Age Differences in Future Orientation and Delay Discounting',
    source: 'Child Development',
    type: 'cohort',
    grade: '2b',
    doi: '10.1111/j.1467-8624.2008.01244.x',
    pmid: '19019105',
    volume: '80',
    issue: '1',
    pages: '28-44',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19019105/',
    region: 'global',
    keyFinding: 'Future orientation and ability to delay gratification improve significantly from adolescence to adulthood. Late adolescents show intermediate capacity between early teens and adults.',
    verified: true,
  },

  {
    id: 'mclean-mansfield-2012-co-construction-identity',
    authors: 'McLean KC, Mansfield CD',
    year: 2012,
    title: 'The Co-Construction of Identity in Adolescence',
    source: 'The Oxford Handbook of Identity Development (McLean KC, Syed M, eds.), Oxford University Press',
    type: 'textbook',
    grade: '5',
    region: 'global',
    keyFinding: 'Adolescent identity is co-constructed through narrative interactions with parents, peers, and cultural contexts. Late adolescence involves integrating multiple identity domains into a coherent self-narrative.',
    verified: false,
  },

  {
    id: 'who-2021-adolescent-mental-health',
    authors: 'World Health Organization',
    year: 2021,
    title: 'Adolescent Mental Health Fact Sheet',
    source: 'World Health Organization',
    type: 'guideline',
    grade: '4',
    url: 'https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health',
    guidelineBody: 'WHO',
    region: 'global',
    keyFinding: 'Mental health conditions account for 16% of global disease burden in 10-19 year olds. Half of all mental health conditions emerge by age 14. Depression is the leading cause of illness and disability in adolescents.',
    verified: true,
  },

  {
    id: 'linehan-1993-dbt',
    authors: 'Linehan MM',
    year: 1993,
    title: 'Cognitive-Behavioral Treatment of Borderline Personality Disorder',
    source: 'Guilford Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-89862-183-9',
    region: 'global',
    keyFinding: 'Developed Dialectical Behavior Therapy (DBT) framework. Core skills — mindfulness, distress tolerance, emotion regulation, interpersonal effectiveness — are now widely adapted for adolescent emotional dysregulation.',
    verified: true,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL GROWTH CITATIONS — Unique to the Behavioral domain
// ════════════════════════════════════════════════════════════════════════════

export const BEHAVIORAL_GROWTH_CITATIONS: Citation[] = [
  // ── 0-3 months ─────────────────────────────────────────────────────────

  {
    id: 'brazelton-1962-crying-infancy',
    authors: 'Brazelton TB',
    year: 1962,
    title: 'Crying in Infancy',
    source: 'Pediatrics',
    type: 'cohort',
    grade: '2b',
    pmid: '13872677',
    volume: '29',
    pages: '579-588',
    url: 'https://pubmed.ncbi.nlm.nih.gov/13872677/',
    region: 'global',
    keyFinding: 'Documented the normal crying curve in infancy: crying increases to a peak at 6 weeks then declines by 3-4 months. Established that crying is the primary communicative behaviour of newborns, not manipulation.',
    verified: true,
  },

  {
    id: 'hunziker-barr-1986-carrying-reduces-crying',
    authors: 'Hunziker UA, Barr RG',
    year: 1986,
    title: 'Increased Carrying Reduces Infant Crying: A Randomized Controlled Trial',
    source: 'Pediatrics',
    type: 'rct',
    grade: '1b',
    pmid: '3517799',
    volume: '77',
    issue: '5',
    pages: '641-648',
    url: 'https://pubmed.ncbi.nlm.nih.gov/3517799/',
    region: 'global',
    keyFinding: 'Supplemental carrying (beyond feeding and crying response) reduced infant crying by 43% overall and 51% in the evening at peak crying age (6 weeks). RCT with 99 mother-infant pairs.',
    verified: true,
  },

  {
    id: 'kirjavainen-2004-sleep-development-infants',
    authors: 'Kirjavainen T, Kirjavainen J, Huhtala V, Lehtonen L, Korvenranta H, Kero P',
    year: 2004,
    title: 'Infants with Colic Have a Normal Sleep Structure at 2 and 7 Months of Age',
    source: 'Early Human Development',
    type: 'cohort',
    grade: '2b',
    doi: '10.1016/j.earlhumdev.2003.11.003',
    volume: '76',
    issue: '2',
    pages: '143-151',
    region: 'global',
    keyFinding: 'Infants with colic show normal sleep architecture by 2 and 7 months. Early sleep-wake cycle development is biologically driven; 45-90 minute cycles in newborns are neurologically normal, not behavioural.',
    verified: false,
  },

  {
    id: 'feldman-2010-skin-to-skin-neurobehavioural',
    authors: 'Feldman R, Singer M, Zagoory O',
    year: 2010,
    title: 'Touch Attenuates Infants\' Physiological Reactivity to Stress',
    source: 'Developmental Science',
    type: 'cohort',
    grade: '2b',
    doi: '10.1111/j.1467-7687.2009.00890.x',
    volume: '13',
    issue: '2',
    pages: '271-278',
    region: 'global',
    keyFinding: 'Maternal touch attenuates infant cortisol reactivity and autonomic stress responses. Skin-to-skin contact supports neurobehavioural organisation and stress regulation in early infancy.',
    verified: true,
  },

  // ── 3-6 months ─────────────────────────────────────────────────────────

  {
    id: 'von-hofsten-2004-action-perspective-motor',
    authors: 'von Hofsten C',
    year: 2004,
    title: 'An Action Perspective on Motor Development',
    source: 'Trends in Cognitive Sciences',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1016/j.tics.2004.02.004',
    pmid: '15050510',
    volume: '8',
    issue: '6',
    pages: '266-272',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15050510/',
    region: 'global',
    keyFinding: 'Motor development is goal-directed from the start. Intentional reaching at 3-5 months represents the emergence of agency — the infant discovering "I can make things happen" in the world.',
    verified: true,
  },

  {
    id: 'kagan-1971-change-continuity-infancy',
    authors: 'Kagan J',
    year: 1971,
    title: 'Change and Continuity in Infancy',
    source: 'Wiley',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-471-45313-2',
    region: 'global',
    keyFinding: 'Longitudinal study of infant behavioural change. Temperamental characteristics (activity level, reactivity, regularity) show both continuity and transformation across infancy. Individual differences are biologically rooted.',
    verified: true,
  },

  {
    id: 'needham-2002-pick-me-up-exploratory',
    authors: 'Needham A, Barrett T, Peterman K',
    year: 2002,
    title: 'A Pick-Me-Up for Infants\' Exploratory Skills: Early Simulated Experiences Reaching for Objects Using "Sticky Mittens" Enhances Young Infants\' Object Exploration Skills',
    source: 'Infant Behavior and Development',
    type: 'rct',
    grade: '1b',
    doi: '10.1016/S0163-6383(02)00097-8',
    volume: '25',
    issue: '3',
    pages: '279-295',
    region: 'global',
    keyFinding: 'Early reaching experience with "sticky mittens" enhanced 3-month-olds\' subsequent object exploration, visual attention, and reaching behaviour. Motor experience drives cognitive-behavioural development.',
    verified: true,
  },

  {
    id: 'who-2019-physical-activity-under5',
    authors: 'World Health Organization',
    year: 2019,
    title: 'Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5 Years of Age',
    source: 'World Health Organization, Geneva',
    type: 'guideline',
    grade: '4',
    isbn: '978-92-4-155053-6',
    url: 'https://www.who.int/publications/i/item/9789241550536',
    guidelineBody: 'WHO',
    region: 'global',
    keyFinding: 'Infants should have 30+ minutes prone (tummy time) spread throughout the day. No screen time for under 2s. Physical activity and limited restraint in prams/highchairs supports motor and behavioural development.',
    verified: true,
  },

  // ── 6-12 months ────────────────────────────────────────────────────────

  {
    id: 'sorce-1985-maternal-emotional-signaling',
    authors: 'Sorce JF, Emde RN, Campos JJ, Klinnert MD',
    year: 1985,
    title: 'Maternal Emotional Signaling: Its Effect on the Visual Cliff Behavior of 1-Year-Olds',
    source: 'Developmental Psychology',
    type: 'rct',
    grade: '1b',
    doi: '10.1037/0012-1649.21.1.195',
    volume: '21',
    issue: '1',
    pages: '195-200',
    region: 'global',
    keyFinding: 'Infants use maternal emotional expressions (social referencing) to guide behaviour in ambiguous situations. Fear expressions from mother stopped infants crossing the visual cliff; joy expressions facilitated crossing.',
    verified: true,
  },

  {
    id: 'hollich-2000-emergentist-coalition',
    authors: 'Hollich GJ, Hirsh-Pasek K, Golinkoff RM, Brand RJ, Brown E, Chung HL, Hennon E, Rocroi C, Bloom L',
    year: 2000,
    title: 'Breaking the Language Barrier: An Emergentist Coalition Model for the Origins of Word Learning',
    source: 'Monographs of the Society for Research in Child Development',
    type: 'theory',
    grade: '5',
    pmid: '11381783',
    volume: '65',
    issue: '3',
    pages: 'i-123',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11381783/',
    region: 'global',
    keyFinding: 'Word learning emerges from the coalition of multiple cues: social (joint attention, pointing), perceptual (salience), and linguistic (prosodic stress). Social referencing and joint attention are behavioural precursors to language.',
    verified: true,
  },

  {
    id: 'feldman-2007-parent-infant-synchrony',
    authors: 'Feldman R',
    year: 2007,
    title: 'Parent-Infant Synchrony and the Construction of Shared Timing: Physiological Precursors, Developmental Outcomes, and Risk Conditions',
    source: 'Journal of Child Psychology and Psychiatry',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1111/j.1469-7610.2006.01701.x',
    pmid: '17355401',
    volume: '48',
    issue: '3-4',
    pages: '329-354',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17355401/',
    region: 'global',
    keyFinding: 'Parent-infant synchrony — the temporal coordination of biological and behavioural signals — is a formative experience for self-regulation, empathy, and symbol use. Disrupted synchrony predicts behavioural difficulties.',
    verified: true,
  },

  // ── 12-24 months ───────────────────────────────────────────────────────

  {
    id: 'potegal-davidson-2003-temper-tantrums',
    authors: 'Potegal M, Kosorok MR, Davidson RJ',
    year: 2003,
    title: 'Temper Tantrums in Young Children: 1. Behavioral Composition',
    source: 'Journal of Developmental & Behavioral Pediatrics',
    type: 'cohort',
    grade: '2b',
    doi: '10.1097/00004703-200306000-00002',
    pmid: '12806225',
    volume: '24',
    issue: '3',
    pages: '140-147',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12806225/',
    region: 'global',
    keyFinding: 'Tantrums comprise independent anger and distress components. Anger decreases in intensity with age while distress remains. 75% of tantrums last 5 minutes or less. Tantrums are normative in 18-60 month olds.',
    verified: true,
  },

  {
    id: 'tremblay-2004-physical-aggression-trajectories',
    authors: 'Tremblay RE, Nagin DS, Seguin JR, Zoccolillo M, Zelazo PD, Boivin M, Perusse D, Japel C',
    year: 2004,
    title: 'Physical Aggression During Early Childhood: Trajectories and Predictors',
    source: 'Pediatrics',
    type: 'cohort',
    grade: '2b',
    doi: '10.1542/peds.114.1.e43',
    pmid: '15231972',
    volume: '114',
    issue: '1',
    pages: 'e43-e50',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15231972/',
    region: 'global',
    keyFinding: 'Physical aggression peaks between 2-4 years then declines as children learn alternative strategies. Most children follow a declining trajectory; a small subgroup (3-5%) shows chronically high aggression requiring intervention.',
    verified: true,
  },

  // ── 2-3 years ──────────────────────────────────────────────────────────

  {
    id: 'brazelton-sparrow-2004-toilet-training',
    authors: 'Brazelton TB, Sparrow JD',
    year: 2004,
    title: 'Toilet Training: The Brazelton Way',
    source: 'Da Capo Press / Perseus Books',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-7382-0939-5',
    region: 'global',
    keyFinding: 'Child-oriented approach to toilet training based on readiness signs rather than age-based timelines. Readiness typically emerges 24-36 months. Pressure and punishment prolong the process and create resistance.',
    verified: true,
  },

  {
    id: 'polak-toste-gallagher-2006-temperamental-exuberance',
    authors: 'Polak-Toste CP, Gallagher KC',
    year: 2006,
    title: 'Temperamental Exuberance: Correlates and Consequences',
    source: 'Self-Regulation in Early Childhood (Balter L, Tamis-LeMonda CS, eds.), Cambridge University Press',
    type: 'textbook',
    grade: '5',
    region: 'global',
    keyFinding: 'Temperamental exuberance — high approach, positive affect, and activity level — is associated with both social competence and behavioural challenges. Understanding temperament helps parents calibrate expectations.',
    verified: false,
  },

  {
    id: 'talwar-lee-2002-lying-transgression',
    authors: 'Talwar V, Lee K',
    year: 2002,
    title: 'Development of Lying to Conceal a Transgression: Children\'s Control of Expressive Behaviour During Verbal Deception',
    source: 'International Journal of Behavioral Development',
    type: 'cohort',
    grade: '2b',
    doi: '10.1080/01650250143000373',
    volume: '26',
    issue: '5',
    pages: '436-444',
    region: 'global',
    keyFinding: 'Lying to conceal transgressions emerges around age 2-3 and requires executive function skills (inhibitory control, theory of mind). Early lying is a cognitive achievement, not a moral failure.',
    verified: true,
  },

  // ── 3-5 years ──────────────────────────────────────────────────────────

  {
    id: 'webster-stratton-2012-incredible-years',
    authors: 'Webster-Stratton C',
    year: 2012,
    title: 'The Incredible Years: Trouble-Shooting Guide for Parents of Children Aged 2-8 Years',
    source: 'Incredible Years Inc.',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-892222-04-7',
    region: 'global',
    keyFinding: 'Evidence-based parent training programme. Core strategies: child-directed play, praise and rewards, limit-setting, natural consequences. Reduces conduct problems and increases social competence in preschoolers.',
    verified: true,
  },

  {
    id: 'eisenberg-2004-effortful-control-resiliency',
    authors: 'Eisenberg N, Valiente C, Fabes RA, Smith CL, Reiser M, Shepard SA, Losoya SH, Guthrie IK, Murphy BC, Cumberland AJ',
    year: 2004,
    title: 'The Relations of Effortful Control and Impulsivity to Children\'s Resiliency and Adjustment',
    source: 'Child Development',
    type: 'cohort',
    grade: '2b',
    doi: '10.1111/j.1467-8624.2004.00632.x',
    pmid: '14736110',
    volume: '75',
    issue: '1',
    pages: '25-46',
    url: 'https://pubmed.ncbi.nlm.nih.gov/14736110/',
    region: 'global',
    keyFinding: 'Effortful control (the ability to inhibit a dominant response and activate a subdominant response) is a key predictor of children\'s resiliency, social competence, and adjustment. Low effortful control predicts externalising problems.',
    verified: true,
  },

  {
    id: 'talwar-2007-lying-conceal-parent-transgression',
    authors: 'Talwar V, Lee K, Bala N, Lindsay RCL',
    year: 2007,
    title: 'Children\'s Lie-Telling to Conceal a Parent\'s Transgression: Legal Implications',
    source: 'Law and Human Behavior',
    type: 'cohort',
    grade: '2b',
    doi: '10.1007/s10979-006-9048-8',
    pmid: '17109195',
    volume: '31',
    issue: '1',
    pages: '103-115',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17109195/',
    region: 'global',
    keyFinding: 'Children as young as 3-4 can be coached to lie about witnessed events. Lying sophistication increases with age and executive function development. Moral understanding of lying develops through the preschool years.',
    verified: true,
  },

  // ── 5-8 years ──────────────────────────────────────────────────────────

  {
    id: 'barkley-2012-executive-functions',
    authors: 'Barkley RA',
    year: 2012,
    title: 'Executive Functions: What They Are, How They Work, and Why They Evolved',
    source: 'Guilford Press',
    type: 'textbook',
    grade: '5',
    isbn: '978-1-4625-0535-7',
    region: 'global',
    keyFinding: 'Comprehensive theory of executive functioning as self-regulation. EF includes working memory, inhibition, cognitive flexibility, planning, and emotion regulation. EF deficits underlie ADHD and many behavioural difficulties.',
    verified: true,
  },

  {
    id: 'rhoades-2011-executive-functions-school',
    authors: 'Rhoades BL, Greenberg MT, Lanza ST, Blair C',
    year: 2011,
    title: 'Demographic and Familial Predictors of Early Executive Function Development: Contribution of a Person-Centered Perspective',
    source: 'Journal of Experimental Child Psychology',
    type: 'cohort',
    grade: '2b',
    doi: '10.1016/j.jecp.2010.08.004',
    pmid: '20888577',
    volume: '108',
    issue: '3',
    pages: '638-662',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20888577/',
    region: 'global',
    keyFinding: 'Executive function in early childhood predicts school readiness and academic performance. Socioeconomic disadvantage is associated with lower EF development. Warm, stimulating parenting partially buffers this effect.',
    verified: true,
  },

  {
    id: 'markham-2012-peaceful-parent',
    authors: 'Markham L',
    year: 2012,
    title: 'Peaceful Parent, Happy Kids: How to Stop Yelling and Start Connecting',
    source: 'Perigee / Penguin Random House',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-399-16028-0',
    region: 'global',
    keyFinding: 'Parent emotion regulation is the foundation of effective behavioural management. Connection before correction. Empathic limit-setting reduces defiance more effectively than punishment-based approaches.',
    verified: true,
  },

  // ── 8-12 years ─────────────────────────────────────────────────────────

  {
    id: 'steinberg-silk-2002-parenting-adolescents',
    authors: 'Steinberg L, Silk J',
    year: 2002,
    title: 'Parenting Adolescents',
    source: 'Handbook of Parenting Vol. 1: Children and Parenting (Bornstein MH, ed.), Lawrence Erlbaum Associates',
    type: 'textbook',
    grade: '5',
    region: 'global',
    keyFinding: 'Authoritative parenting (warm, firm, democratic) predicts the best adolescent outcomes across cultures. Parental monitoring, psychological autonomy granting, and warmth are the key dimensions.',
    verified: false,
  },

  {
    id: 'frick-2005-callous-unemotional-traits',
    authors: 'Frick PJ, Stickle TR, Dandreaux DM, Farrell JM, Kimonis ER',
    year: 2005,
    title: 'Callous-Unemotional Traits in Predicting the Severity and Stability of Conduct Problems and Delinquency',
    source: 'Journal of Abnormal Child Psychology',
    type: 'cohort',
    grade: '2b',
    doi: '10.1007/s10648-005-5728-9',
    pmid: '16118993',
    volume: '33',
    issue: '4',
    pages: '471-487',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16118993/',
    region: 'global',
    keyFinding: 'Children with conduct problems plus callous-unemotional traits show the most severe and stable antisocial behaviour trajectory. CU traits designate a distinct subgroup requiring different intervention approaches.',
    verified: true,
  },

  {
    id: 'gardner-2019-screen-time-guidelines-bmj',
    authors: 'Gardner B, et al.',
    year: 2019,
    title: 'Defining the Determinants of Screen Time in Children',
    source: 'BMJ',
    type: 'cohort_review',
    grade: '2a',
    region: 'global',
    keyFinding: 'Screen time impacts vary by type (passive viewing vs interactive), content quality, and displacement of physical activity and sleep. Context-specific guidelines are more useful than blanket time limits.',
    verified: false,
  },

  // ── 12-15 years ────────────────────────────────────────────────────────

  {
    id: 'steinberg-2007-risk-taking-adolescence',
    authors: 'Steinberg L',
    year: 2007,
    title: 'Risk Taking in Adolescence: New Perspectives from Brain and Behavioral Science',
    source: 'Current Directions in Psychological Science',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1111/j.1467-8721.2007.00475.x',
    volume: '16',
    issue: '2',
    pages: '55-59',
    region: 'global',
    keyFinding: 'Adolescent risk-taking is driven by the dual-systems model: early-maturing socioemotional system increases sensation-seeking around puberty while cognitive control system matures more slowly through the mid-20s.',
    verified: true,
  },

  {
    id: 'gardner-steinberg-2005-peer-influence-risk',
    authors: 'Gardner M, Steinberg L',
    year: 2005,
    title: 'Peer Influence on Risk Taking, Risk Preference, and Risky Decision Making in Adolescence and Adulthood: An Experimental Study',
    source: 'Developmental Psychology',
    type: 'rct',
    grade: '1b',
    doi: '10.1037/0012-1649.41.4.625',
    pmid: '16060809',
    volume: '41',
    issue: '4',
    pages: '625-635',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16060809/',
    region: 'global',
    keyFinding: 'Peer presence increased risk-taking in adolescents (13-16) and youths (18-22) but not adults (24+). Peers shift focus toward rewards and away from costs. Effect is strongest in early-to-mid adolescence.',
    verified: true,
  },

  {
    id: 'dishion-mcmahon-1998-parental-monitoring',
    authors: 'Dishion TJ, McMahon RJ',
    year: 1998,
    title: 'Parental Monitoring and the Prevention of Child and Adolescent Problem Behavior: A Conceptual and Empirical Formulation',
    source: 'Clinical Child and Family Psychology Review',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1023/a:1021800432380',
    pmid: '11324078',
    volume: '1',
    issue: '1',
    pages: '61-75',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11324078/',
    region: 'global',
    keyFinding: 'Parental monitoring is a key protective factor against adolescent problem behaviour. Effective monitoring combines knowledge of the child\'s activities, friends, and whereabouts with a warm parent-child relationship.',
    verified: true,
  },

  // ── 15-18 years ────────────────────────────────────────────────────────

  {
    id: 'lerner-steinberg-2009-handbook-adolescent-psychology',
    authors: 'Lerner RM, Steinberg L (eds.)',
    year: 2009,
    title: 'Handbook of Adolescent Psychology',
    source: 'Wiley',
    type: 'textbook',
    grade: '5',
    isbn: '978-0-470-14921-0',
    edition: '3rd Edition',
    region: 'global',
    keyFinding: 'Comprehensive reference covering biological, cognitive, and social development in adolescence. Normative developmental tasks of late adolescence include identity consolidation, autonomy, and preparation for adult roles.',
    verified: true,
  },

  {
    id: 'dishion-2012-negative-peer-influence',
    authors: 'Dishion TJ, Tipsord JM',
    year: 2012,
    title: 'Peer Contagion in Child and Adolescent Social and Emotional Development',
    source: 'Annual Review of Psychology',
    type: 'cohort_review',
    grade: '2a',
    doi: '10.1146/annurev-psych-093510-093915',
    pmid: '21838544',
    volume: '62',
    pages: '189-214',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21838544/',
    region: 'global',
    keyFinding: 'Peer contagion — the mutual influence process leading to escalation of problem behaviour — is strongest in adolescence. Deviant peer clustering in interventions can iatrogenically worsen outcomes.',
    verified: true,
  },

  {
    id: 'nida-2020-adolescent-substance-treatment',
    authors: 'National Institute on Drug Abuse',
    year: 2020,
    title: 'Principles of Adolescent Substance Use Disorder Treatment: A Research-Based Guide',
    source: 'National Institute on Drug Abuse, National Institutes of Health',
    type: 'guideline',
    grade: '4',
    url: 'https://nida.nih.gov/publications/principles-adolescent-substance-use-disorder-treatment-research-based-guide',
    region: 'usa',
    keyFinding: 'Adolescent substance use treatment must address developmental needs, family involvement, co-occurring mental health conditions, and peer context. Motivational interviewing and family-based therapies are first-line.',
    verified: true,
  },

  // ── Additional Behavioral domain citations (Dunn, 2013) ───────────────

  {
    id: 'dunn-2013-self-regulation-early-childhood',
    authors: 'Dunn J',
    year: 2013,
    title: 'Self-Regulation in Early Childhood',
    source: 'Handbook of Self-Regulatory Failure (Baumeister RF, Vohs KD, eds.), Guilford Press',
    type: 'textbook',
    grade: '5',
    region: 'global',
    keyFinding: 'Self-regulation develops through the interplay of temperament, executive function, and social experience. Early self-regulation capacity predicts academic success, social competence, and health outcomes across the lifespan.',
    verified: false,
  },
]

// ════════════════════════════════════════════════════════════════════════════
// COMBINED EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export const ALL_EMOTIONAL_BEHAVIORAL_CITATIONS: Citation[] = [
  ...SHARED_DEV_CITATIONS,
  ...EMOTIONAL_GROWTH_CITATIONS,
  ...BEHAVIORAL_GROWTH_CITATIONS,
]

/**
 * Lookup citation by ID across emotional/behavioral domains
 */
export function getEmotionalBehavioralCitation(id: string): Citation | undefined {
  return ALL_EMOTIONAL_BEHAVIORAL_CITATIONS.find(c => c.id === id)
}

/**
 * Get all citations for a specific domain
 */
export function getCitationsForGrowthDomain(
  domain: 'emotional' | 'behavioral' | 'shared'
): Citation[] {
  const map = {
    emotional: [...SHARED_DEV_CITATIONS, ...EMOTIONAL_GROWTH_CITATIONS],
    behavioral: [...SHARED_DEV_CITATIONS, ...BEHAVIORAL_GROWTH_CITATIONS],
    shared: SHARED_DEV_CITATIONS,
  }
  return map[domain]
}

/**
 * Get all verified citations
 */
export function getVerifiedGrowthCitations(): Citation[] {
  return ALL_EMOTIONAL_BEHAVIORAL_CITATIONS.filter(c => c.verified)
}

/**
 * Audit summary stats for emotional/behavioral growth track citations
 */
export function getEmotionalBehavioralCitationAudit() {
  const total = ALL_EMOTIONAL_BEHAVIORAL_CITATIONS.length
  const verified = ALL_EMOTIONAL_BEHAVIORAL_CITATIONS.filter(c => c.verified).length
  const withDoi = ALL_EMOTIONAL_BEHAVIORAL_CITATIONS.filter(c => c.doi).length
  const withPmid = ALL_EMOTIONAL_BEHAVIORAL_CITATIONS.filter(c => c.pmid).length

  const gradeDistribution = ALL_EMOTIONAL_BEHAVIORAL_CITATIONS.reduce((acc, c) => {
    acc[c.grade] = (acc[c.grade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const emotionalCount = EMOTIONAL_GROWTH_CITATIONS.length
  const behavioralCount = BEHAVIORAL_GROWTH_CITATIONS.length
  const sharedCount = SHARED_DEV_CITATIONS.length

  return {
    total,
    verified,
    unverified: total - verified,
    withDoi,
    withPmid,
    gradeDistribution,
    verificationRate: `${Math.round((verified / total) * 100)}%`,
    domainBreakdown: {
      emotional: emotionalCount,
      behavioral: behavioralCount,
      shared: sharedCount,
    },
  }
}
