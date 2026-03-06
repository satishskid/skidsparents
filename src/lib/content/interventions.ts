/**
 * SKIDS Interventions — Branded D2C pediatric health products
 *
 * Each intervention is a real product offering with:
 * - Rich educational content (discovery-style)
 * - Interactive product experience (React component)
 * - Lead capture → Neodove CRM + WhatsApp
 *
 * The screening is the starting point. Each intervention is the next step.
 */

export interface HowItWorksStep {
  step: number
  title: string
  description: string
  emoji: string
}

export interface Intervention {
  slug: string
  brand: string
  emoji: string
  tagline: string
  description: string
  gradient: string
  status: 'available' | 'building'
  wonderFact: string
  whyItMatters: string
  howItWorks: HowItWorksStep[]
  whatYouGet: string[]
  servicesSlugs: string[]
  stats: { value: string; label: string }[]
  faqs: { q: string; a: string }[]
  ageRange: string
  duration: string
  ctaLabel: string
  relatedOrgan: string
  relatedCategories: string[]
  component: string // React component name to render
}

export const INTERVENTIONS: Intervention[] = [
  // ─── SKIDS Vision ─────────────────────────────────────
  {
    slug: 'vision',
    brand: 'SKIDS Vision',
    emoji: '👁️',
    tagline: 'Your child\'s vision health, from screening to specs',
    description: 'FDA-approved WelchAllyn Spot Vision Screener detects myopia, amblyopia, astigmatism, and hyperopia with clinical accuracy. From screening at school to ophthalmologist consultation to specs delivered at your door.',
    gradient: 'from-amber-500 to-orange-600',
    status: 'available',
    wonderFact: '80% of learning happens through vision, yet 1 in 4 school children have an undetected vision problem. Early detection before age 7 can prevent permanent vision loss.',
    whyItMatters: `Your child won't tell you they can't see clearly — because they don't know what "clear" looks like. A child with undetected myopia sits in the front row, squints at the board, and falls behind. A child with amblyopia (lazy eye) loses depth perception permanently if not treated before the visual cortex matures around age 7.

The WelchAllyn Spot Vision Screener — the same device used in US pediatric clinics — screens both eyes in under 2 seconds, without requiring the child to read letters or cooperate with instructions. It works from birth through adolescence.

SKIDS Vision doesn't stop at screening. When issues are detected, our ophthalmologist reviews the results, provides a comprehensive eye exam, and if correction is needed, delivers myopia arrest lenses directly to your home. Monthly monitoring through the app tracks progression and ensures the intervention is working.`,
    howItWorks: [
      { step: 1, title: 'SKIDS Screening', description: 'WelchAllyn Spot Vision Screener at school or center. Both eyes screened in 2 seconds. Detects 6 risk factors.', emoji: '📸' },
      { step: 2, title: 'Results in App', description: 'Screening results appear in your child\'s health record. AI explains what each finding means in plain language.', emoji: '📱' },
      { step: 3, title: 'Ophthalmologist Review', description: 'SKIDS eye specialist reviews abnormal results. Video consultation to discuss findings and next steps.', emoji: '👨‍⚕️' },
      { step: 4, title: 'Specs Delivered Home', description: 'Myopia arrest lenses or prescription glasses delivered to your door. Monthly monitoring via app.', emoji: '📦' },
    ],
    whatYouGet: [
      'WelchAllyn Spot Vision screening (both eyes, 6 risk factors)',
      'Instant results in your child\'s health record',
      'AI-powered explanation of screening findings',
      'Ophthalmologist video consultation (if needed)',
      'Prescription myopia arrest lenses delivered home',
      'Monthly visual acuity monitoring via app',
      'Myopia progression tracking with trend charts',
    ],
    servicesSlugs: ['vision-check', 'specs-myopia'],
    stats: [
      { value: '10,000+', label: 'Children Screened' },
      { value: 'FDA', label: 'Approved Device' },
      { value: '<2 sec', label: 'Screening Time' },
      { value: '95%', label: 'Detection Accuracy' },
    ],
    faqs: [
      { q: 'At what age should my child get a vision screening?', a: 'The American Academy of Pediatrics recommends vision screening at 12 months, 3 years, and annually from age 4. The WelchAllyn Spot works from 6 months of age — no cooperation needed.' },
      { q: 'What does the screening detect?', a: 'Six risk factors: myopia (nearsightedness), hyperopia (farsightedness), astigmatism, anisometropia (unequal refractive error), strabismus (eye misalignment), and anisocoria (unequal pupil size).' },
      { q: 'What are myopia arrest lenses?', a: 'Special lenses (like MiYOSMART or Stellest) that slow myopia progression by 50-60%. They use defocus technology to signal the eye to stop elongating. Clinically proven in multiple trials.' },
      { q: 'How are specs delivered?', a: 'After the ophthalmologist confirms the prescription, we manufacture the lenses and deliver complete spectacles to your home within 7-10 business days. Frame selection is done online.' },
      { q: 'How often should we monitor?', a: 'Log your child\'s visual acuity monthly using the app. The ophthalmologist reviews progress every 3 months. Annual comprehensive screening is recommended.' },
    ],
    ageRange: '6 months – 16 years',
    duration: '5 min read',
    ctaLabel: 'Book Vision Screening',
    relatedOrgan: 'eyes',
    relatedCategories: ['Vision', 'Physical Health'],
    component: 'VisionDashboard',
  },

  // ─── SKIDS Chatter ────────────────────────────────────
  {
    slug: 'chatter',
    brand: 'SKIDS Chatter',
    emoji: '🗣️',
    tagline: 'AI-powered developmental therapy — speech, behavior, motor skills',
    description: 'Digital therapy platform combining AI assessment with expert therapists. Standardized intake scoring identifies concerns early. Licensed speech, occupational, and behavioral therapists provide telehealth sessions with progress tracking in your child\'s health record.',
    gradient: 'from-violet-500 to-purple-600',
    status: 'building',
    wonderFact: 'By age 3, a child\'s brain has formed 1,000 trillion neural connections. Early intervention during this window is 4x more effective than treatment after age 5. Yet 70% of developmental delays are caught too late.',
    whyItMatters: `Every parent wonders: "Is my child on track?" The SKIDS developmental screening catches delays. SKIDS Chatter is what happens next — evidence-based therapy that meets your child where they are.

Our AI-powered intake assessment uses standardized developmental screening tools (ASQ-3, M-CHAT-R adapted) to identify areas of concern across four domains: speech & language, motor skills, behavior & social, and cognitive development. The assessment takes 5 minutes and gives you a clear picture.

When therapy is recommended, our licensed therapists (speech-language pathologists, occupational therapists, behavioral specialists) provide sessions via telehealth. But unlike traditional clinics, everything is connected — your child's screening results, milestone tracker, and therapy progress all live in one place. The therapist sees the full picture. You see the progress.`,
    howItWorks: [
      { step: 1, title: 'AI Assessment', description: 'Answer 12 age-appropriate questions about your child\'s development. AI scores across 4 domains: speech, motor, behavior, cognition.', emoji: '🧠' },
      { step: 2, title: 'Results & Matching', description: 'See your child\'s developmental profile. If concerns are identified, get matched with the right specialist.', emoji: '📊' },
      { step: 3, title: 'Therapy Sessions', description: 'Licensed therapists via telehealth. Sessions designed around your child\'s interests and goals. Parent coaching included.', emoji: '💬' },
      { step: 4, title: 'Track Progress', description: 'Session notes, goal tracking, and home exercises — all in your child\'s health record. See improvement over weeks and months.', emoji: '📈' },
    ],
    whatYouGet: [
      'AI developmental assessment (4 domains, 12 questions)',
      'Concern-level scoring with clear next steps',
      'Therapist matching based on child\'s specific needs',
      'Telehealth therapy sessions (speech, OT, behavioral)',
      'Session notes saved to child\'s health record',
      'Home exercise program between sessions',
      'Monthly progress reviews with goal tracking',
    ],
    servicesSlugs: ['speech-therapy', 'behavioral-assessment', 'occupational-therapy'],
    stats: [
      { value: '4x', label: 'More Effective Early' },
      { value: '12', label: 'Assessment Questions' },
      { value: '4', label: 'Therapy Domains' },
      { value: '100%', label: 'Evidence-Based' },
    ],
    faqs: [
      { q: 'How does the AI assessment work?', a: 'Based on standardized tools (ASQ-3, M-CHAT-R), our AI asks 12 age-appropriate questions and scores your child across speech, motor, behavioral, and cognitive domains. It takes about 5 minutes and gives immediate results.' },
      { q: 'What types of therapy are available?', a: 'Speech-language therapy (for speech delays, articulation, language processing), Occupational therapy (fine motor, sensory processing, daily skills), and Behavioral therapy (social skills, emotional regulation, attention). All sessions via telehealth.' },
      { q: 'How do I know if my child needs therapy?', a: 'Take the free AI assessment — it will tell you if your child is on track, needs monitoring, or would benefit from professional support. The scoring is based on clinical developmental norms for your child\'s age.' },
      { q: 'Are the therapists licensed?', a: 'Yes. All SKIDS Chatter therapists hold recognized qualifications (RCI-registered clinical psychologists, ISHA-certified SLPs, OTs with RCI/AIOTA certification) with minimum 3 years of pediatric experience.' },
      { q: 'How are sessions different from visiting a clinic?', a: 'Everything is connected. Your therapist can see your child\'s screening results, milestone tracker, and full health record. Sessions happen via video call — no travel, no waiting rooms. Home exercises are tracked in the app.' },
    ],
    ageRange: '6 months – 8 years',
    duration: '5 min read',
    ctaLabel: 'Take Free Assessment',
    relatedOrgan: 'brain',
    relatedCategories: ['Mental Health', 'Neurodevelopment', 'Development'],
    component: 'ChatterAssessment',
  },

  // ─── SKIDS Nutrition ──────────────────────────────────
  {
    slug: 'nutrition',
    brand: 'SKIDS Nutrition',
    emoji: '🥗',
    tagline: 'AI nutrition analysis + personalized Indian meal plans',
    description: 'NutreeAI-powered nutrition assessment scores your child\'s diet across 5 dimensions. Get personalized Indian meal plans based on age, growth data, preferences, and nutritional gaps. Because the gut makes 95% of serotonin — what your child eats shapes how they think and feel.',
    gradient: 'from-green-500 to-emerald-600',
    status: 'building',
    wonderFact: 'The gut produces 95% of the body\'s serotonin — the "happy hormone." A child with nutritional deficiencies doesn\'t just grow slowly — they may feel anxious, sleep poorly, and struggle to focus. Nutrition IS mental health.',
    whyItMatters: `India has a paradox: 35% of children under 5 are stunted (too short for age) while childhood obesity is rising in urban areas. Both extremes stem from the same root — nutritional imbalance, not just quantity.

Most parents know their child should "eat healthy." But what does that actually mean for a 2-year-old in Bangalore versus a 5-year-old in Pune? How much iron does a vegetarian toddler need? Is their dal-rice-sabzi combination providing enough protein?

SKIDS Nutrition answers these questions with data, not guesswork. Our AI analyzes your child's current eating patterns, maps them against age-specific WHO nutritional requirements, and generates personalized meal plans using Indian foods your child already knows. Roti, not quinoa. Dal, not kale smoothies.

When your child's growth data from the SKIDS app is connected, the AI correlates nutrition patterns with growth trends — so you can see whether dietary changes are actually making a difference.`,
    howItWorks: [
      { step: 1, title: 'Nutrition Quiz', description: '10 questions about your child\'s eating habits, food preferences, allergies, and mealtimes. Takes 3 minutes.', emoji: '📋' },
      { step: 2, title: 'AI Analysis', description: 'NutreeAI scores diet across 5 dimensions: Protein, Iron & Minerals, Calcium, Fiber & Vitamins, Hydration. Grade A to F.', emoji: '🤖' },
      { step: 3, title: 'Meal Plan', description: 'Personalized weekly meal plan with Indian foods. Adjusted for age, preferences, vegetarian/non-veg, and identified gaps.', emoji: '🍽️' },
      { step: 4, title: 'Track & Improve', description: 'Log meals, track nutrition score over time, correlate with growth chart. See real improvement week by week.', emoji: '📈' },
    ],
    whatYouGet: [
      'AI nutrition assessment (5 dimensions, A-F grading)',
      'Personalized Indian meal plan (weekly)',
      'Age-specific nutritional gap analysis',
      'Growth-nutrition correlation with SKIDS growth data',
      'Food diary with Indian food database',
      'Micro-nutrient tracking (iron, calcium, zinc, vitamin D)',
      'Monthly nutrition progress reports',
    ],
    servicesSlugs: ['nutreeai'],
    stats: [
      { value: '95%', label: 'Serotonin from Gut' },
      { value: '5', label: 'Nutrition Dimensions' },
      { value: 'AI', label: 'Powered Analysis' },
      { value: 'Indian', label: 'Food Database' },
    ],
    faqs: [
      { q: 'Is this just another calorie counter?', a: 'No. We don\'t count calories — we assess nutritional quality. Is your child getting enough iron from their vegetarian diet? Enough calcium during the growth spurt? The AI looks at what matters for development, not weight.' },
      { q: 'Will my child eat these meals?', a: 'The meal plans use foods your child already eats — with smart substitutions to fill gaps. If your child loves idli, we won\'t replace it with oatmeal. We\'ll suggest adding a ragi flour blend to boost iron and calcium.' },
      { q: 'How does it connect to growth data?', a: 'If you\'re tracking your child\'s height and weight in SKIDS, the AI correlates nutrition patterns with growth trends. "Your child\'s iron intake improved 40% this month — growth velocity is responding positively."' },
      { q: 'Is this suitable for special diets?', a: 'Yes — vegetarian, vegan, Jain, gluten-free, lactose-intolerant, and allergy-specific plans are supported. The quiz asks about all dietary restrictions and preferences upfront.' },
    ],
    ageRange: '6 months – 12 years',
    duration: '5 min read',
    ctaLabel: 'Take Nutrition Quiz',
    relatedOrgan: 'digestive',
    relatedCategories: ['Nutrition', 'Physical Health'],
    component: 'NutritionAssessment',
  },

  // ─── SKIDS Symphony ───────────────────────────────────
  {
    slug: 'symphony',
    brand: 'SKIDS Symphony',
    emoji: '🎵',
    tagline: 'Game-based hearing screening — play a game, check hearing',
    description: 'Clinically validated game-based hearing test powered by Sound Scouts technology. Your child plays a fun game while the app screens for hearing loss, auditory processing issues, and speech-in-noise difficulties. Results in your child\'s health record instantly.',
    gradient: 'from-indigo-500 to-blue-600',
    status: 'building',
    wonderFact: '1 in 10 children has some form of hearing difficulty, but most are never tested. The critical window for language development is birth to 3 years — hearing loss during this period can permanently affect speech, reading, and social skills.',
    whyItMatters: `Your child can hear a pin drop in a quiet room. But can they hear their teacher in a noisy classroom? Can they distinguish "bat" from "pat" when there's background chatter? These subtle hearing difficulties — often missed by standard hearing tests — are the hidden cause of language delays, reading difficulties, and classroom struggles.

Traditional hearing tests require a sound booth and a trained audiologist. They test pure tones — beeps at different frequencies. But real-world hearing is about speech in noise. A child who "passes" a pure tone test can still struggle to hear in the environments that matter most.

SKIDS Symphony uses Sound Scouts technology — a clinically validated, game-based hearing test that screens for speech-in-noise difficulties alongside traditional hearing thresholds. The child plays a fun game with headphones, and the app measures their hearing ability across frequencies and in noisy conditions.

Results flow directly into your child's SKIDS health record, where they're tracked alongside vision, developmental milestones, and growth data. Because hearing doesn't exist in isolation — it shapes everything.`,
    howItWorks: [
      { step: 1, title: 'Get Ready', description: 'Quiet room + quality headphones. The app guides you through a quick sound check to calibrate.', emoji: '🎧' },
      { step: 2, title: 'Play the Game', description: 'Your child plays an engaging game for 5-8 minutes. The game adapts to test different frequencies and speech-in-noise ability.', emoji: '🎮' },
      { step: 3, title: 'Instant Results', description: 'Hearing profile appears in your child\'s health record. Clear, color-coded results: green (normal), amber (monitor), red (refer).', emoji: '📊' },
      { step: 4, title: 'Track Over Time', description: 'Annual hearing screening builds a longitudinal profile. Catch subtle changes before they become problems.', emoji: '📈' },
    ],
    whatYouGet: [
      'Clinically validated game-based hearing screening',
      'Speech-in-noise testing (beyond pure tones)',
      'Instant results in child\'s health record',
      'Hearing milestone tracker (birth to 5 years)',
      'Annual screening reminders',
      'Audiologist referral if needed',
      'Hearing health tips and noise exposure guidance',
    ],
    servicesSlugs: [],
    stats: [
      { value: '1 in 10', label: 'Children Affected' },
      { value: '5 min', label: 'Game Duration' },
      { value: 'Validated', label: 'Clinically Proven' },
      { value: 'Instant', label: 'Results' },
    ],
    faqs: [
      { q: 'What age can my child take the hearing test?', a: 'The game-based test works best for children aged 4 and above who can understand simple game instructions. For younger children, we provide a hearing milestone tracker to monitor development.' },
      { q: 'What headphones do we need?', a: 'Quality over-ear headphones (not earbuds) provide the most accurate results. The app includes a sound calibration step to ensure accuracy with your specific headphones.' },
      { q: 'Is this a real hearing test?', a: 'Yes. Sound Scouts technology is clinically validated, published in peer-reviewed journals, and endorsed by audiologists. It screens for both hearing thresholds and speech-in-noise ability — more comprehensive than many clinic-based screenings.' },
      { q: 'What if results show a concern?', a: 'The app provides clear next steps. For amber results (monitor), we recommend retesting in 3 months. For red results (refer), we help you book an audiologist consultation through SKIDS Teleconsult.' },
    ],
    ageRange: '4 – 12 years (milestone tracker from birth)',
    duration: '5 min read',
    ctaLabel: 'Get SKIDS Symphony',
    relatedOrgan: 'ears',
    relatedCategories: ['Hearing', 'Development'],
    component: 'HearingTracker',
  },

  // ─── SKIDS Teleconsult ────────────────────────────────
  {
    slug: 'teleconsult',
    brand: 'SKIDS Teleconsult',
    emoji: '👨‍⚕️',
    tagline: 'Evidence-based pediatric consultations — your child\'s full record at the doctor\'s fingertips',
    description: 'Video consultations with experienced pediatricians who see your child\'s complete SKIDS health record — screening results, milestones, growth data, nutrition, and parent observations. Evidence-based care, not guesswork. 15-minute consultations with actionable next steps.',
    gradient: 'from-teal-500 to-cyan-600',
    status: 'building',
    wonderFact: 'The average pediatric visit lasts 15 minutes, but parents forget to mention 50% of their concerns. With SKIDS Teleconsult, the doctor already has the full picture — screening results, growth trends, developmental milestones — so every minute counts.',
    whyItMatters: `Most pediatric consultations start with the doctor asking: "So, what brings you in today?" and the parent trying to remember everything they've noticed over the past months. Critical details get lost. The doctor makes decisions with partial information.

SKIDS Teleconsult flips this model. When you book a video consultation, the pediatrician receives your child's complete SKIDS health record: vision screening results, developmental milestones (achieved and delayed), growth trajectory with WHO z-scores, parent observations with concern levels, vaccination history, and uploaded medical reports.

The doctor doesn't ask "what's wrong?" — they say "I've reviewed [Child]'s record. I see the motor delay you noted, and the growth plateau over the last 3 months. Let's talk about what this means."

This is evidence-based pediatrics: decisions driven by data, not 15-minute impressions. The consultation note goes back into the health record, creating a continuous care loop that gets smarter with every interaction.`,
    howItWorks: [
      { step: 1, title: 'Quick Symptom Check', description: 'Tell us what\'s concerning you. Our symptom checker assesses urgency and prepares a pre-visit summary from your child\'s health record.', emoji: '📝' },
      { step: 2, title: 'Choose Your Doctor', description: 'Browse pediatrician profiles — specialization, experience, languages. Pick a time that works for you.', emoji: '👩‍⚕️' },
      { step: 3, title: 'Video Consultation', description: '15-minute focused consultation. The doctor has your child\'s full SKIDS record. You get clear, actionable next steps.', emoji: '📹' },
      { step: 4, title: 'Record Updated', description: 'Consultation notes, prescriptions, and follow-up plan saved to your child\'s health record. Nothing gets lost.', emoji: '✅' },
    ],
    whatYouGet: [
      'Pre-consultation symptom checker with urgency assessment',
      'Pediatrician receives child\'s complete SKIDS health record',
      '15-minute video consultation with experienced pediatrician',
      'Consultation notes saved to child\'s health record',
      'Prescription and follow-up plan (if needed)',
      'Specialist referral through SKIDS network',
      'Continuous care loop — each visit builds on the last',
    ],
    servicesSlugs: ['pediatric-consult'],
    stats: [
      { value: '15 min', label: 'Consultations' },
      { value: 'Full PHR', label: 'Doctor Access' },
      { value: '100%', label: 'Evidence-Based' },
      { value: '24/7', label: 'AI Triage Available' },
    ],
    faqs: [
      { q: 'How is this different from any telehealth service?', a: 'The doctor sees your child\'s complete SKIDS health record — screening results, growth data, milestones, observations, vaccination history. They don\'t start from zero. This is a continuous care relationship, not a one-off call.' },
      { q: 'Is the symptom checker a diagnosis?', a: 'No. The symptom checker is a triage tool that helps you understand urgency (green: monitor, amber: see doctor within 48hrs, red: urgent). It also prepares a summary for the doctor so the consultation is more focused.' },
      { q: 'What can I consult about?', a: 'Anything related to your child\'s health: developmental concerns, illness, behavioral questions, nutrition, sleep, growth, vaccination queries, skin conditions, allergies. Our pediatricians cover general pediatrics and can refer to SKIDS specialists.' },
      { q: 'What happens after the consultation?', a: 'The doctor\'s notes, any prescriptions, and the follow-up plan are saved to your child\'s SKIDS health record. If a specialist referral is needed (ophthalmologist, therapist, nutritionist), we handle the booking through the SKIDS network.' },
    ],
    ageRange: '0 – 16 years',
    duration: '5 min read',
    ctaLabel: 'Check Symptoms Now',
    relatedOrgan: 'brain',
    relatedCategories: ['Physical Health', 'Mental Health', 'Development'],
    component: 'SymptomChecker',
  },
]

// Utility functions
export function getIntervention(slug: string): Intervention | undefined {
  return INTERVENTIONS.find((i) => i.slug === slug)
}

export function getInterventionByOrgan(organSlug: string): Intervention | undefined {
  return INTERVENTIONS.find((i) => i.relatedOrgan === organSlug)
}
