/**
 * Intervention Protocol Library — SKIDS Pediatric Home Therapy Protocols
 *
 * 15 protocols: 5 conditions x 3 regional variants (India/IAP, USA/AAP, GCC/Gulf_AP)
 *
 * Doctor prescribes → Parent executes → SKIDS coaches → Doctor monitors
 * Coaching answers ONLY from playbook. Boundary topics redirect to doctor.
 */

import type { InterventionProtocol } from '@/lib/ai/interventions/types'

// ════════════════════════════════════════════════════════════════════════════
// 1. AMBLYOPIA PATCHING — VISION
// ════════════════════════════════════════════════════════════════════════════

const amblyopiaBase = {
  category: 'vision' as const,
  subspecialty: 'vision_ai' as const,
  conditionName: 'Amblyopia (Lazy Eye)',
  icd10: 'H53.00',
  defaultDurationDays: 90,
  defaultFrequency: 'daily' as const,
  ageRangeMin: 24,
  ageRangeMax: 108,
  version: 1,
}

const amblyopiaTasks = (region: string) => [
  {
    key: 'patching_session',
    title: 'Eye Patching Session',
    category: 'primary' as const,
    schedule: { type: 'daily' as const, timesPerDay: 1 },
    instructionsTemplate:
      'Place the adhesive patch over {{child_name}}\'s {{target_eye}} (stronger) eye. Keep it on for {{patching_hours}} hours while {{child_name}} does close-up activities like drawing, puzzles, or reading. Log when you start and when you remove the patch.',
    durationMinutes: 120,
    successCriteria: 'Patch worn for the full prescribed duration with near-work activities performed',
    loggingType: 'done_skip_partial' as const,
    coachingTopics: ['child_resists_patch', 'skin_irritation', 'can_we_skip', 'school_with_patch'],
  },
  {
    key: 'near_work_activity',
    title: 'Near-Work Activity During Patching',
    category: 'supplementary' as const,
    schedule: { type: 'daily' as const, timesPerDay: 1 },
    instructionsTemplate:
      'While {{child_name}} wears the patch, engage them in close-up activities: coloring, bead threading, tablet games (age-appropriate), or reading. The weaker eye needs to work hard during patching to build strength.',
    durationMinutes: 30,
    successCriteria: 'Child engaged in at least one focused near-work activity during patching',
    loggingType: 'done_skip' as const,
    coachingTopics: ['best_activities', 'how_long_results'],
  },
]

const amblyopiaEscalations = [
  {
    trigger: 'compliance_below_50',
    condition: { metric: 'compliance_pct', operator: 'lt' as const, value: 50, windowDays: 7 },
    severity: 'warning' as const,
    titleTemplate: 'Low patching compliance for {{child_name}}',
    detailTemplate:
      '{{child_name}}\'s patching compliance has dropped to {{compliance_pct}}% over the last 7 days. Amblyopia treatment depends on consistent daily patching. Please review barriers with the family.',
  },
  {
    trigger: '3_consecutive_skips',
    condition: { metric: 'consecutive_skips', operator: 'gt' as const, value: 2 },
    severity: 'warning' as const,
    titleTemplate: '3+ consecutive patching sessions skipped',
    detailTemplate:
      '{{child_name}} has skipped {{consecutive_skips}} consecutive patching sessions. Extended gaps reduce treatment effectiveness. Family may need additional support or schedule adjustment.',
  },
  {
    trigger: 'boundary_hits_threshold',
    condition: { metric: 'boundary_hits', operator: 'gt' as const, value: 2, windowDays: 7 },
    severity: 'info' as const,
    titleTemplate: 'Parent has medical concerns about {{child_name}}\'s vision',
    detailTemplate:
      'Parent has asked {{boundary_hits}} medical questions this week that exceeded coaching scope. Topics included: {{boundary_topics}}. A brief check-in call may reassure the family.',
  },
  {
    trigger: 'parent_concern_moderate',
    condition: { metric: 'parent_concern_level', operator: 'gt' as const, value: 6 },
    severity: 'urgent' as const,
    titleTemplate: 'Parent expressing significant concern about {{child_name}}\'s treatment',
    detailTemplate:
      'Parent concern level is elevated ({{parent_concern_level}}/10). They may be considering discontinuing treatment. Recommend direct physician follow-up within 24-48 hours.',
  },
]

const amblyopiaParams = [
  {
    key: 'patching_hours',
    type: 'number' as const,
    defaultValue: 2,
    label: 'Patching Hours Per Day',
    unit: 'hours',
    min: 1,
    max: 6,
  },
  {
    key: 'target_eye',
    type: 'select' as const,
    defaultValue: 'left',
    label: 'Eye to Patch (Stronger Eye)',
    options: ['left', 'right'],
  },
  {
    key: 'near_work_required',
    type: 'boolean' as const,
    defaultValue: true,
    label: 'Near-Work Activities Required During Patching',
  },
]

// ── 1A: Amblyopia — India/IAP ──

const amblyopiaPatchingIAP: InterventionProtocol = {
  ...amblyopiaBase,
  id: 'proto_amblyopia_iap_v1',
  slug: 'amblyopia-patching-iap',
  name: 'Amblyopia Patching Protocol (IAP)',
  region: 'india',
  protocolAuthority: 'IAP',
  parentLocale: 'en',
  description:
    'Structured occlusion therapy protocol for unilateral amblyopia in children aged 2-9 years, aligned with Indian Academy of Pediatrics and AIOS (All India Ophthalmological Society) guidelines. The parent patches the stronger eye for a prescribed number of hours daily while the child performs near-work activities to stimulate the weaker eye. Locally available adhesive patches (Opticlude, Nexcare, or cloth patches) are recommended. Joint family members should be educated about the importance of consistent patching to avoid well-meaning interference.',
  evidenceBase:
    'IAP Guidelines on Pediatric Vision Screening (2019). AIOS Clinical Practice Guidelines for Amblyopia Management (2020). Pediatric Eye Disease Investigator Group (PEDIG) — "A Randomized Trial of Patching Regimens for Treatment of Moderate Amblyopia in Children" (Arch Ophthalmol, 2003). Holmes JM et al., "Effect of Age on Response to Amblyopia Treatment in Children" (Arch Ophthalmol, 2011).',
  prevalenceNotes:
    'Amblyopia affects approximately 1-3% of Indian children. Often detected late due to limited preschool vision screening. Higher rates in areas with poor access to pediatric ophthalmology.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: amblyopiaTasks('india'),
  escalationRules: amblyopiaEscalations,
  customizableParams: amblyopiaParams,
  coachingPlaybook: {
    child_resists_patch: {
      questionPatterns: [
        'child refuses patch', 'won\'t wear patch', 'cries with patch', 'tears off patch',
        'hates patching', 'fighting the patch', 'screams when I put patch',
      ],
      response:
        'It is completely normal for {{child_name}} to resist the patch, especially in the first 1-2 weeks. The brain is used to relying on the stronger eye, so covering it feels uncomfortable and frustrating.\n\nHere are strategies that work well for Indian families:\n- Start patching during {{child_name}}\'s favourite activity — cartoons, colouring, or playing with a favourite toy. Distraction is your best friend.\n- Use a reward chart with stickers. Small daily rewards (a favourite snack, extra play time) build a positive association.\n- If you have joint family support, ask one adult to be the "patch buddy" who does a fun activity with {{child_name}} during patching time.\n- Cloth patches with fun designs (available on Amazon India and Flipkart) can feel less clinical and more fun.\n\nMost children adjust within 7-10 days. Consistency is more important than perfection — even partial compliance helps. Dr. {{doctor_name}} has prescribed this because the treatment window is limited, and every day of patching counts.',
      followUp: 'Would you like specific activity ideas for {{child_name}}\'s age group during patching?',
      boundary: false,
    },
    best_activities: {
      questionPatterns: [
        'what activities during patching', 'games for patching', 'what to do while patching',
        'activities for lazy eye', 'keep child busy during patch',
      ],
      response:
        'Near-work activities are crucial during patching because they force the weaker eye to focus up close, building visual pathways in the brain. Here are great options for {{child_name}}:\n\nFor ages 2-4: Threading large beads, playing with playdough/clay, colouring with crayons, stacking blocks, looking at picture books together, simple puzzles (4-8 pieces).\n\nFor ages 4-7: Drawing and colouring (rangoli patterns are excellent!), dot-to-dot worksheets, jigsaw puzzles, reading together, building with Lego, playing carrom (close focus), tablet-based tracing games.\n\nFor ages 7-9: Reading (Hindi or English), writing practice, detailed colouring, craft projects, board games like Ludo or chess.\n\nAvoid TV from a distance — the goal is close-range focus. Tablet or phone games are fine because they require near focus, but limit to age-appropriate duration. Aim for at least {{patching_hours}} hours of active near-work.',
      boundary: false,
    },
    skin_irritation: {
      questionPatterns: [
        'skin rash from patch', 'irritation from patch', 'redness around eye', 'allergic to patch',
        'skin peeling', 'patch hurting skin',
      ],
      response:
        'Skin irritation around the patch area is common, especially in Indian summers when sweat can make adhesive patches stick more aggressively.\n\nTry these solutions:\n- Switch patch brands — Nexcare patches tend to be gentler than Opticlude for sensitive skin. You can find them at Apollo Pharmacy or online.\n- Apply a thin layer of calamine lotion or coconut oil around the patch area (not on the eyelid) before applying. Let it dry for a minute.\n- Alternate the exact patch position slightly each day so the adhesive doesn\'t irritate the same spot.\n- Consider a cloth patch that attaches to spectacles if {{child_name}} wears glasses — no adhesive contact at all.\n- Give the skin a 1-day "rest" if redness is significant, but do not stop patching entirely without checking with Dr. {{doctor_name}}.\n\nIf the rash is spreading, blistering, or {{child_name}} seems to be in pain, please reach out to Dr. {{doctor_name}} for guidance.',
      followUp: 'Is the irritation on both sides or just where the adhesive touches?',
      boundary: false,
    },
    no_improvement: {
      questionPatterns: [
        'no improvement', 'vision not improving', 'not getting better', 'waste of time',
        'is it even working', 'how to know if working',
      ],
      response:
        'I understand your concern. Amblyopia treatment is a slow process, and visible improvement typically takes 6-12 weeks of consistent patching. It is completely normal to not see dramatic changes in the first month.\n\nThe brain needs time to build new visual connections through the weaker eye. Think of it like physiotherapy for the eye — results come gradually with daily effort.\n\nThat said, only Dr. {{doctor_name}} can assess whether {{child_name}}\'s vision is responding to treatment through a clinical eye examination. This is a medical question that I cannot answer from coaching alone.\n\n**I recommend scheduling a follow-up with Dr. {{doctor_name}} to review {{child_name}}\'s progress.** They may adjust the patching hours or recommend additional interventions based on clinical findings.',
      boundary: true,
    },
    eye_looks_different: {
      questionPatterns: [
        'eye looks different', 'eye turning', 'squinting', 'eye crossing', 'one eye looks off',
        'strabismus', 'eye misalignment',
      ],
      response:
        'Thank you for paying close attention to {{child_name}}\'s eyes. Changes in eye alignment or appearance during amblyopia treatment should always be evaluated by Dr. {{doctor_name}}.\n\nWhile some children with amblyopia also have strabismus (eye turn), any new or worsening misalignment needs clinical assessment. This is outside the scope of what I can guide you on.\n\n**Please contact Dr. {{doctor_name}}\'s clinic to schedule an eye examination.** Note down when you first noticed the change, whether it is constant or intermittent, and if it happens more when {{child_name}} is tired. This information will help the doctor.',
      boundary: true,
    },
    can_we_skip: {
      questionPatterns: [
        'can we skip today', 'one day off', 'skip patching', 'break from patching',
        'holiday from patch', 'going out can we skip',
      ],
      response:
        'I completely understand — some days are harder than others, and life gets in the way. Here is the honest answer:\n\nConsistency is the single biggest factor in amblyopia treatment success. Missing occasional days happens, but the research shows that children who patch at least 5-6 days per week see significantly better outcomes than those who patch 3-4 days.\n\nIf today is genuinely difficult (travel, illness, family function), one day will not undo weeks of progress. But try to avoid making it a habit.\n\nPractical tips for busy days:\n- Even 1 hour of patching is better than zero. Partial compliance beats skipping entirely.\n- Patch during a car ride or auto-rickshaw ride — the child is seated and can do activities.\n- Patch during homework or tuition time — it doubles as near-work.\n\nDr. {{doctor_name}} has prescribed {{patching_hours}} hours daily because that is what {{child_name}} needs. Let us aim for the best we can today.',
      followUp: 'Would you like to log a partial session for today instead of skipping entirely?',
      boundary: false,
    },
    how_long_results: {
      questionPatterns: [
        'how long until results', 'when will it work', 'timeline for improvement',
        'how many months', 'when to expect change',
      ],
      response:
        'Great question. Based on clinical research, here is a general timeline for amblyopia patching:\n\n- **Weeks 1-2**: Adjustment period. {{child_name}} gets used to wearing the patch. No visual improvement expected yet.\n- **Weeks 3-6**: Early neural adaptation begins. You likely will not notice changes at home, but clinical testing may show small gains.\n- **Weeks 6-12**: Most children show measurable improvement in the weaker eye\'s visual acuity. This is when the treatment starts to show results.\n- **Months 3-6**: Significant improvement in many children. Some reach near-normal vision.\n\nThe younger the child and the more consistent the patching, the faster the response. {{child_name}} is at an age where the visual system is still very adaptable.\n\nDr. {{doctor_name}} will schedule follow-up eye exams to track progress objectively. Your daily patching logs in SKIDS help them understand compliance patterns too.',
      boundary: false,
    },
    school_with_patch: {
      questionPatterns: [
        'patch at school', 'school and patching', 'classmates teasing', 'teacher asking about patch',
        'embarrassed at school', 'bullying about patch',
      ],
      response:
        'Many parents in India worry about patching at school, and it is a valid concern. Here is how to handle it:\n\n**Talk to the class teacher**: Share a brief note (we can help you draft one) explaining that {{child_name}} is undergoing doctor-prescribed eye treatment. Most teachers are very supportive once they understand.\n\n**Timing strategies**: If {{patching_hours}} hours allows flexibility, you can do some patching before school and some after. For example, 1 hour during morning homework and 1 hour in the evening.\n\n**If teasing happens**: Normalise it for {{child_name}} — "Your eye is doing exercise, just like athletes train muscles." Fun-coloured patches or patches with cartoon stickers can turn it into a "cool" thing.\n\n**Joint family tip**: Ask grandparents or older siblings to positively reinforce the patch. When the whole family treats it as normal and important, {{child_name}} feels more confident.\n\nRemember, treatment during the school-age window is critical. The discomfort of wearing a patch is temporary, but the vision benefits are lifelong.',
      followUp: 'Would you like help drafting a note to {{child_name}}\'s school?',
      boundary: false,
    },
  },
}

// ── 1B: Amblyopia — USA/AAP ──

const amblyopiaPatchingAAP: InterventionProtocol = {
  ...amblyopiaBase,
  id: 'proto_amblyopia_aap_v1',
  slug: 'amblyopia-patching-aap',
  name: 'Amblyopia Patching Protocol (AAP)',
  region: 'usa',
  protocolAuthority: 'AAP',
  parentLocale: 'en',
  description:
    'Structured occlusion therapy protocol for unilateral amblyopia in children aged 2-9 years, aligned with AAP (American Academy of Pediatrics) and AAO (American Academy of Ophthalmology) Preferred Practice Pattern guidelines. Insurance-covered adhesive patches (Ortopad, Opticlude) are standard. Protocol emphasizes play therapy integration, school accommodations via 504 plan or IEP, and structured near-work activities during patching.',
  evidenceBase:
    'AAP Policy Statement: "Eye Examination in Infants, Children, and Young Adults by Pediatricians" (Pediatrics, 2016). AAO Preferred Practice Pattern: Amblyopia (2017, updated 2023). PEDIG: "A Randomized Trial of Prescribed Patching Regimens for Treatment of Severe Amblyopia in Children" (Ophthalmology, 2003). Holmes JM et al., "A Randomized Trial of Prescribed Patching Regimens for Treatment of Moderate Amblyopia in Children" (Arch Ophthalmol, 2003).',
  prevalenceNotes:
    'Amblyopia affects approximately 2-3% of US children. Universal preschool vision screening mandated in most states. Early detection rates are improving but vary by socioeconomic status.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: amblyopiaTasks('usa'),
  escalationRules: amblyopiaEscalations,
  customizableParams: amblyopiaParams,
  coachingPlaybook: {
    child_resists_patch: {
      questionPatterns: [
        'child refuses patch', 'won\'t wear patch', 'cries with patch', 'tears off patch',
        'hates patching', 'fighting the patch', 'tantrums about patch',
      ],
      response:
        'Patch resistance is one of the most common challenges — you are definitely not alone. Research shows that most children adjust within 1-2 weeks with consistent, positive reinforcement.\n\nStrategies that work well:\n- **Reward systems**: Use a sticker chart where {{child_name}} earns a sticker for each completed patching session. After a set number (start with 5), they earn a small prize. Visual progress is motivating.\n- **Patch as play**: Let {{child_name}} choose decorated patches (Ortopad makes designs with dinosaurs, superheroes, etc.). Some kids like to put a patch on their stuffed animal too.\n- **Distraction is key**: Start patching right before a favourite activity — building Legos, playing a video game, doing art, or watching a show (only if close-range).\n- **Positive framing**: "Your eye is getting stronger every time you wear it — you\'re like a superhero in training!"\n\nAvoid forcing or making it a battle. If {{child_name}} removes the patch, calmly replace it without emotional escalation. Dr. {{doctor_name}} prescribed this because the treatment window for amblyopia closes as the brain matures — every day of patching matters.',
      followUp: 'Would you like some age-specific activity ideas for patching time?',
      boundary: false,
    },
    best_activities: {
      questionPatterns: [
        'what activities during patching', 'games for patching', 'what to do while patching',
        'activities for lazy eye', 'keep child busy during patch',
      ],
      response:
        'Near-work activities during patching are essential — they force the weaker eye to focus up close, strengthening the visual pathways. Here are evidence-backed ideas for {{child_name}}:\n\n**Ages 2-4**: Finger painting, Play-Doh, large-piece puzzles, board books, stacking blocks, threading large beads, iPad drawing apps (Procreate Kids, Drawing Pad).\n\n**Ages 4-7**: Coloring books (detailed ones), dot-to-dot worksheets, jigsaw puzzles (25-100 pieces), reading together, Lego building, Perler bead projects, Magna-Tiles, simple card games like Go Fish.\n\n**Ages 7-9**: Independent reading, drawing/sketching, model building, video games that require focus (Minecraft on tablet, puzzle games), craft kits, handwriting practice.\n\n**Pro tip**: The PEDIG clinical trials found that 1 hour of prescribed near-work activity during patching improved outcomes by an additional line on the eye chart. It is not just about wearing the patch — it is about working the eye.\n\nAvoid TV from across the room (too far) — screen activities are fine as long as they are at arm\'s length.',
      boundary: false,
    },
    skin_irritation: {
      questionPatterns: [
        'skin rash from patch', 'irritation from patch', 'redness around eye', 'allergic to patch',
        'skin peeling', 'adhesive allergy',
      ],
      response:
        'Skin irritation from adhesive patches is a common issue. Here are solutions that families find helpful:\n\n- **Switch brands**: Ortopad patches tend to have gentler adhesive than Opticlude. Your insurance may cover both — check with your plan. 3M Nexcare also makes hypoallergenic options.\n- **Skin prep**: Apply a thin layer of Cavilon No-Sting Barrier Film (available at CVS/Walgreens or Amazon) before placing the patch. It creates a protective layer between the adhesive and skin.\n- **Rotate position**: Slightly shift the patch placement each day so the adhesive does not irritate the same skin repeatedly.\n- **Patch-on-glasses option**: If {{child_name}} wears glasses, a fabric patch that clips onto the lens eliminates skin contact entirely. Brands like Patch Pals and Kay Fun Patch are popular.\n- **Removal tip**: Use baby oil or warm water to loosen the adhesive before removal — never peel it off dry.\n\nIf irritation persists or looks like an allergic reaction (spreading redness, swelling, blistering), let Dr. {{doctor_name}} know. Most skin reactions resolve with a brand switch.',
      followUp: 'Which patch brand are you currently using?',
      boundary: false,
    },
    no_improvement: {
      questionPatterns: [
        'no improvement', 'vision not improving', 'not getting better', 'waste of time',
        'is it even working',
      ],
      response:
        'I hear your frustration, and it is a valid concern. Amblyopia treatment is a marathon, not a sprint — clinical studies show that measurable improvement typically takes 6-12 weeks of consistent patching.\n\nThe brain needs repetitive stimulation through the weaker eye to build and strengthen neural connections. Progress is often invisible to parents until a clinical vision test reveals improvement.\n\nHowever, this is a medical question that only Dr. {{doctor_name}} can answer for {{child_name}} specifically. Visual acuity needs to be measured with proper clinical tools.\n\n**I recommend scheduling a follow-up appointment with Dr. {{doctor_name}} to assess progress.** Bring your SKIDS patching logs — they give the doctor valuable data about compliance patterns. If the current regimen is not producing results, Dr. {{doctor_name}} may adjust patching hours, add atropine penalization, or explore other options.',
      boundary: true,
    },
    eye_looks_different: {
      questionPatterns: [
        'eye looks different', 'eye turning', 'squinting', 'eye crossing', 'one eye looks off',
        'strabismus',
      ],
      response:
        'Thank you for observing {{child_name}}\'s eyes closely — that attentiveness is important. Any change in eye alignment, new eye turning, or worsening of existing misalignment should be evaluated by Dr. {{doctor_name}} promptly.\n\nSome children with amblyopia also have strabismus, and the relationship between the two conditions requires professional assessment. This is outside the scope of home coaching.\n\n**Please contact Dr. {{doctor_name}}\'s office for an eye examination.** When you call, mention what you have noticed, when it started, and whether it is constant or comes and goes (especially when {{child_name}} is tired). Taking photos or short videos of the eye position can be very helpful for the doctor.',
      boundary: true,
    },
    can_we_skip: {
      questionPatterns: [
        'can we skip today', 'one day off', 'skip patching', 'break from patching',
        'taking a day off',
      ],
      response:
        'Life happens, and I appreciate you checking in rather than just skipping silently. Here is the evidence-based perspective:\n\nThe PEDIG studies found that consistency is the strongest predictor of treatment success. Children who patched 5-7 days per week had significantly better outcomes than those who patched 3-4 days.\n\nThat said, one missed day will not undo weeks of progress. If today is genuinely not possible (illness, special event), log it as skipped and get back on track tomorrow.\n\n**Better alternatives to skipping entirely:**\n- Even 30-60 minutes of patching is better than zero. Partial compliance still stimulates the weaker eye.\n- Shift the schedule — patch during a car ride, during an after-school activity, or right before bed with a book.\n- If {{child_name}} is having a rough day emotionally, try a shorter session with a highly preferred activity.\n\nDr. {{doctor_name}} prescribed {{patching_hours}} hours daily for a reason. Let us do our best today, even if it is not perfect.',
      followUp: 'Would you like to log a partial session instead?',
      boundary: false,
    },
    how_long_results: {
      questionPatterns: [
        'how long until results', 'when will it work', 'timeline for improvement',
        'how many months',
      ],
      response:
        'Based on the PEDIG clinical trials and AAO guidelines, here is the typical amblyopia treatment timeline:\n\n- **Weeks 1-2**: Adjustment period. Focus is on building the patching habit. No vision improvement expected yet.\n- **Weeks 3-8**: Early neural adaptation. The brain begins forming stronger connections through the weaker eye. Changes may not be visible at home.\n- **Weeks 8-16**: Most children show measurable improvement on clinical vision testing. This is the "sweet spot" where consistent patching pays off.\n- **Months 4-6**: Many children achieve significant gains. Some reach near-normal visual acuity in the amblyopic eye.\n\nFactors that affect timeline: {{child_name}}\'s age (younger = faster response), severity of amblyopia, consistency of patching, and whether near-work activities are done during patching.\n\nDr. {{doctor_name}} will schedule follow-up visual acuity tests to objectively measure progress. Your SKIDS patching logs will help them correlate compliance with outcomes.',
      boundary: false,
    },
    school_with_patch: {
      questionPatterns: [
        'patch at school', 'school and patching', 'classmates teasing', 'teacher asking',
        'bullying about patch', '504 plan', 'school accommodations',
      ],
      response:
        'Managing patching at school is important, and US schools have frameworks to support this:\n\n**504 Plan or IEP**: If {{child_name}} has an amblyopia diagnosis, you can request a 504 plan from the school. This legally requires accommodations such as preferential seating, extra time on visual tasks, and permission to wear the patch during school hours. Your pediatric ophthalmologist can provide a letter.\n\n**Talk to the teacher**: Most teachers are very supportive. A brief email explaining that {{child_name}} is undergoing vision therapy and wears a patch for {{patching_hours}} hours daily helps them support your child and watch for teasing.\n\n**Scheduling strategies**: You can split patching — some before school, some after. Or concentrate it during school if peer support is good, since school provides built-in near-work (reading, writing, art).\n\n**If teasing occurs**: Frame it positively — "My eye is getting stronger, like working out at the gym." Decorated patches (Ortopad designs, stickers) can make it a conversation starter rather than a target.\n\n**Social-emotional support**: If {{child_name}} is struggling emotionally, the school counselor can help with confidence-building. Vision therapy is temporary, but the social skills developed through navigating this are lifelong.',
      followUp: 'Would you like help drafting a letter to {{child_name}}\'s school?',
      boundary: false,
    },
  },
}

// ── 1C: Amblyopia — GCC/Gulf_AP ──

const amblyopiaPatchingGulf: InterventionProtocol = {
  ...amblyopiaBase,
  id: 'proto_amblyopia_gulf_v1',
  slug: 'amblyopia-patching-gulf',
  name: 'Amblyopia Patching Protocol (Gulf)',
  region: 'gcc',
  protocolAuthority: 'Gulf_AP',
  parentLocale: 'en',
  description:
    'Structured occlusion therapy protocol for unilateral amblyopia in children aged 2-9 years, adapted for Gulf Cooperation Council countries. Addresses heat and humidity challenges for adhesive patch adherence, provides bilingual (Arabic/English) instructions, and includes guidance for nanny/caregiver-mediated patching. Protocol follows Gulf Association of Pediatrics recommendations aligned with international PEDIG evidence.',
  evidenceBase:
    'Gulf Pediatric Ophthalmology Practice Guidelines (2021). PEDIG: "A Randomized Trial of Patching Regimens for Treatment of Moderate Amblyopia in Children" (Arch Ophthalmol, 2003). Holmes JM et al., "Effect of Age on Response to Amblyopia Treatment in Children" (Arch Ophthalmol, 2011). Saudi Journal of Ophthalmology — Amblyopia Screening Programs in GCC (2020).',
  prevalenceNotes:
    'Amblyopia prevalence in GCC countries estimated at 1.5-3%. Consanguinity may increase risk of associated refractive errors. School vision screening programs vary by emirate/region.',
  geneticConsiderations:
    'Higher rates of consanguineous marriages in GCC populations may increase prevalence of high refractive errors contributing to amblyopia. Screen siblings.',
  dietaryContext: undefined,
  tasks: amblyopiaTasks('gcc'),
  escalationRules: amblyopiaEscalations,
  customizableParams: amblyopiaParams,
  coachingPlaybook: {
    child_resists_patch: {
      questionPatterns: [
        'child refuses patch', 'won\'t wear patch', 'cries with patch', 'tears off patch',
        'hates patching', 'fighting the patch', 'nanny can\'t keep patch on',
      ],
      response:
        'Patch resistance is very common, and you are not alone in this challenge. Most children adjust within 1-2 weeks with patient, consistent effort.\n\nStrategies for Gulf families:\n- **Start during favourite activities**: Put the patch on right before {{child_name}} does something they love — drawing, building blocks, or an age-appropriate tablet game.\n- **Reward chart**: Use a sticker system — each completed patching session earns a sticker. After a set number, {{child_name}} earns a small reward. Visual progress motivates children.\n- **Caregiver consistency**: If a nanny or helper assists with patching, make sure they understand the importance and feel empowered to keep the patch on. Show them this protocol and the reward system.\n- **Heat-friendly patches**: In the Gulf climate, patches can feel uncomfortable with sweat. Try Ortopad bamboo patches which breathe better, or patch during indoor AC time.\n- **Family support**: Explain to grandparents and extended family that removing the patch early or skipping "because the child is upset" undermines treatment. Loving firmness is key.\n\nDr. {{doctor_name}} prescribed this because {{child_name}}\'s brain is at the optimal age for visual development. Consistent patching now can prevent lifelong vision problems.',
      followUp: 'Is the nanny/helper comfortable managing the patching routine?',
      boundary: false,
    },
    best_activities: {
      questionPatterns: [
        'what activities during patching', 'games for patching', 'what to do while patching',
        'keep child busy during patch',
      ],
      response:
        'Near-work activities during patching are essential — they force {{child_name}}\'s weaker eye to work hard and build visual connections. Here are great indoor options (perfect for the Gulf climate):\n\n**Ages 2-4**: Play-Doh or kinetic sand, large-piece puzzles, stacking blocks, picture books in Arabic or English, finger painting, threading large beads.\n\n**Ages 4-7**: Colouring books (Arabic calligraphy patterns are excellent for focus!), jigsaw puzzles, Lego building, reading together in Arabic or English, drawing, simple card games.\n\n**Ages 7-9**: Independent reading (Arabic or English), detailed drawing or art projects, Minecraft or puzzle games on a tablet (arm\'s length), craft kits, Quran reading practice (excellent near-focus activity).\n\nThe key is that activities must be at arm\'s length or closer — not watching TV across the room. Indoor activities in air-conditioned spaces are ideal, especially during summer months when the patch may feel less comfortable with heat.\n\nAim for at least {{patching_hours}} hours of active near-work while the patch is on.',
      boundary: false,
    },
    skin_irritation: {
      questionPatterns: [
        'skin rash from patch', 'irritation from patch', 'redness around eye', 'sweat and patch',
        'heat making patch worse', 'adhesive problem',
      ],
      response:
        'Skin irritation from patches is especially common in the Gulf due to heat and humidity. The combination of adhesive and sweat can cause redness, itching, and peeling.\n\nSolutions that work well in the Gulf climate:\n- **Breathable patches**: Ortopad bamboo patches are designed for better airflow. They are available at pharmacies in the UAE, Saudi Arabia, and other GCC countries, as well as online.\n- **AC patching**: Schedule patching time during indoor, air-conditioned hours to minimise sweat under the patch.\n- **Skin barrier**: Apply a thin layer of barrier cream (Cavilon or similar, available at pharmacies) around the patch area before application. Allow it to dry before placing the patch.\n- **Rotate position**: Slightly adjust where you place the patch each day so the same skin is not repeatedly irritated.\n- **Glasses-mounted patch**: If {{child_name}} wears spectacles, a fabric patch that clips onto the lens eliminates adhesive contact entirely.\n- **Gentle removal**: Use baby oil or warm water to loosen the adhesive before removing — never pull dry.\n\nIf irritation is severe, blistering, or spreading beyond the patch area, please contact Dr. {{doctor_name}} for guidance.',
      followUp: 'Are you finding the patch adhesive loosens too easily in the heat, or is it irritating the skin?',
      boundary: false,
    },
    no_improvement: {
      questionPatterns: [
        'no improvement', 'vision not improving', 'not getting better', 'is it working',
      ],
      response:
        'I understand your worry. Amblyopia treatment requires patience — visible improvement typically takes 6-12 weeks of consistent daily patching. It is normal to see no obvious changes in the first month.\n\nThe weaker eye needs sustained daily stimulation for the brain to gradually build stronger visual pathways. Progress is often invisible at home and can only be measured with clinical vision testing.\n\nThis is a medical question that only Dr. {{doctor_name}} can answer after examining {{child_name}}\'s visual acuity in clinic.\n\n**Please schedule a follow-up appointment with Dr. {{doctor_name}} to review progress.** Bring your SKIDS patching logs — they will help the doctor understand compliance patterns and make adjustments if needed.',
      boundary: true,
    },
    eye_looks_different: {
      questionPatterns: [
        'eye looks different', 'eye turning', 'squinting', 'eye crossing', 'eye misalignment',
      ],
      response:
        'Thank you for watching {{child_name}}\'s eyes carefully. Any change in eye alignment or appearance during treatment is important and requires clinical assessment by Dr. {{doctor_name}}.\n\nThis is a medical observation that falls outside the scope of home coaching guidance.\n\n**Please contact Dr. {{doctor_name}}\'s clinic for an eye examination.** Note when you first noticed the change, whether it is constant or comes and goes, and try to take a photo or short video of the eye position. This helps the doctor during evaluation.',
      boundary: true,
    },
    can_we_skip: {
      questionPatterns: [
        'can we skip today', 'one day off', 'skip patching', 'going to a gathering',
        'family event',
      ],
      response:
        'I appreciate you asking rather than just skipping. Here is what the evidence says:\n\nConsistency is the most important factor in amblyopia treatment. Children who patch 5-7 days per week have significantly better visual outcomes than those who patch inconsistently.\n\nOne missed day will not undo weeks of work, but regular gaps will slow progress. If today is truly difficult (illness, major family event), log it and resume tomorrow.\n\n**Alternatives to skipping entirely:**\n- Even 30-60 minutes is better than zero. Partial compliance still stimulates the weaker eye.\n- Patch during indoor AC time — car rides, waiting at a restaurant, reading before bed.\n- If attending a family gathering, patch on the way there and back.\n\nDr. {{doctor_name}} prescribed {{patching_hours}} hours daily because that is what {{child_name}} needs. Let us do our best, even on busy days.',
      followUp: 'Would you like to log a shorter session for today?',
      boundary: false,
    },
    how_long_results: {
      questionPatterns: [
        'how long until results', 'when will it work', 'timeline', 'how many months',
      ],
      response:
        'Based on international clinical research, here is the typical timeline for amblyopia patching:\n\n- **Weeks 1-2**: Getting used to the patch. No vision improvement expected.\n- **Weeks 3-8**: The brain starts forming stronger connections through the weaker eye. Changes are usually only detectable on clinical testing.\n- **Weeks 8-16**: Most children show measurable improvement. This is when consistent patching pays off.\n- **Months 4-6**: Significant gains in many children. Some achieve near-normal vision in the weaker eye.\n\nYounger children generally respond faster, and consistent daily patching accelerates results. {{child_name}} is at an age where the visual system is still highly adaptable.\n\nDr. {{doctor_name}} will schedule clinical follow-ups to measure progress objectively. Your daily patching logs in SKIDS are valuable data for these assessments.',
      boundary: false,
    },
    school_with_patch: {
      questionPatterns: [
        'patch at school', 'school and patching', 'classmates asking', 'embarrassed at school',
        'nanny at school',
      ],
      response:
        'Managing patching around school is a common concern for Gulf families. Here are practical strategies:\n\n**Inform the school**: Send a note to {{child_name}}\'s class teacher and school nurse explaining the prescribed eye therapy. Most international and local schools in the GCC are very accommodating once they understand the medical need.\n\n**Scheduling flexibility**: You can split patching — some before school (during morning routine), some after school (during homework or play). This reduces {{child_name}}\'s time wearing a patch in front of classmates.\n\n**If teasing occurs**: Frame it positively for {{child_name}} — "Your eye is getting stronger, like training for a sport." Fun-designed patches can make it feel special rather than different.\n\n**Nanny/driver coordination**: If a caregiver drops off or picks up {{child_name}}, brief them on the patching schedule so they can help with timing.\n\n**Cultural tip**: In many Gulf cultures, children are naturally supportive of peers. A brief, matter-of-fact explanation to classmates — "I wear this to help my eye get stronger" — is usually enough.\n\nThe treatment window is limited by age, so maintaining the schedule even on school days is important.',
      followUp: 'Would you like help scheduling patching around {{child_name}}\'s school day?',
      boundary: false,
    },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// 2. IRON-DEFICIENCY NUTRITION
// ════════════════════════════════════════════════════════════════════════════

const ironBase = {
  category: 'nutrition' as const,
  subspecialty: 'nutrition_ai' as const,
  conditionName: 'Iron Deficiency Anemia',
  icd10: 'D50.9',
  defaultDurationDays: 90,
  defaultFrequency: 'daily' as const,
  ageRangeMin: 6,
  ageRangeMax: 144,
  version: 1,
}

const ironEscalations = [
  {
    trigger: 'compliance_below_50',
    condition: { metric: 'compliance_pct', operator: 'lt' as const, value: 50, windowDays: 7 },
    severity: 'warning' as const,
    titleTemplate: 'Low iron supplementation compliance for {{child_name}}',
    detailTemplate:
      '{{child_name}}\'s iron supplement compliance has dropped to {{compliance_pct}}% over the last 7 days. Consistent daily supplementation is critical for treating iron deficiency anemia. Family may need support managing side effects or administration.',
  },
  {
    trigger: 'supplement_side_effects',
    condition: { metric: 'parent_concern_level', operator: 'gt' as const, value: 5 },
    severity: 'warning' as const,
    titleTemplate: 'Side effects reported for {{child_name}}\'s iron supplement',
    detailTemplate:
      'Parent has reported persistent side effects from iron supplementation (constipation, nausea, or staining). May need formulation change or dose adjustment. Current supplement type: {{supplement_type}}, dose: {{supplement_dose_mg}}mg.',
  },
  {
    trigger: 'no_lab_improvement_8weeks',
    condition: { metric: 'boundary_hits', operator: 'gt' as const, value: 3, windowDays: 56 },
    severity: 'warning' as const,
    titleTemplate: 'Lab follow-up needed for {{child_name}} — 8 weeks on iron',
    detailTemplate:
      '{{child_name}} has been on iron supplementation for 8+ weeks. Parent has asked about lab rechecks multiple times. A CBC and ferritin recheck is recommended to assess treatment response.',
  },
  {
    trigger: 'parent_concern_high',
    condition: { metric: 'parent_concern_level', operator: 'gt' as const, value: 7 },
    severity: 'urgent' as const,
    titleTemplate: 'Parent concern elevated for {{child_name}}\'s iron treatment',
    detailTemplate:
      'Parent concern level is {{parent_concern_level}}/10. They may be considering stopping supplementation. Recommend physician follow-up within 48 hours.',
  },
]

const ironParams = [
  {
    key: 'supplement_dose_mg',
    type: 'number' as const,
    defaultValue: 3,
    label: 'Iron Supplement Dose',
    unit: 'mg/kg/day',
    min: 1,
    max: 6,
  },
  {
    key: 'supplement_type',
    type: 'select' as const,
    defaultValue: 'drops',
    label: 'Supplement Form',
    options: ['drops', 'syrup', 'tablet'],
  },
  {
    key: 'dietary_preference',
    type: 'select' as const,
    defaultValue: 'mixed',
    label: 'Dietary Preference',
    options: ['vegetarian', 'non-vegetarian', 'mixed'],
  },
]

// ── 2A: Iron Nutrition — India/IAP ──

const ironNutritionIAP: InterventionProtocol = {
  ...ironBase,
  id: 'proto_iron_iap_v1',
  slug: 'iron-nutrition-iap',
  name: 'Iron-Deficiency Nutrition Protocol (IAP)',
  region: 'india',
  protocolAuthority: 'IAP',
  parentLocale: 'en',
  description:
    'Comprehensive iron repletion protocol for children aged 6 months to 12 years with diagnosed iron deficiency anemia, following IAP (Indian Academy of Pediatrics) National Iron+ Initiative guidelines. Combines prescribed oral iron supplementation with Indian diet-specific iron-rich food strategies. Emphasises vegetarian iron sources (ragi, jaggery, green leafy vegetables, sprouted lentils), vitamin C pairing for absorption, deworming before supplementation, and avoiding excess cow\'s milk interference. Adapted for the predominantly vegetarian dietary context of Indian families.',
  evidenceBase:
    'IAP National Iron+ Initiative Guidelines (2013, updated 2019). IAP Consensus Statement on Iron Deficiency Anemia in Children (2019). National Family Health Survey (NFHS-5, 2019-21) — 67% of children aged 6-59 months in India are anemic. WHO Guideline: Daily Iron Supplementation in Infants and Children (2016). Pasricha SR et al., "Iron Deficiency Anemia: Problems in Diagnosis and Prevention at the Population Level" (Hematol Oncol Clin, 2018).',
  prevalenceNotes:
    'India has among the highest rates of childhood anemia globally — NFHS-5 reports 67% of children under 5 are anemic, with iron deficiency being the leading cause. Vegetarian diets, hookworm infestation, and poor bioavailability of non-heme iron contribute.',
  dietaryContext:
    'Predominantly vegetarian population. Key iron sources: ragi (finger millet), jaggery, green leafy vegetables (spinach, moringa/drumstick leaves, amaranth), sprouted moong/chana, sesame seeds, dried figs. Vitamin C pairing with amla, lemon, guava critical for non-heme absorption.',
  geneticConsiderations:
    'Thalassemia trait is common in certain Indian populations (prevalence 3-17% depending on region and community). Sickle cell trait in tribal populations. Always verify diagnosis is iron deficiency, not thalassemia trait, before supplementation.',
  tasks: [
    {
      key: 'iron_supplement',
      title: 'Iron Supplement Dose',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Give {{child_name}} the prescribed iron supplement ({{supplement_type}}, {{supplement_dose_mg}} mg/kg/day) on an empty stomach or with a vitamin C source (amla, lemon water, orange). Give it 1 hour before or 2 hours after milk/tea/calcium-rich foods. Use a straw or dropper to minimise tooth staining.',
      durationMinutes: 5,
      successCriteria: 'Full prescribed iron dose administered',
      loggingType: 'done_skip' as const,
      coachingTopics: ['child_refuses_supplement', 'side_effects', 'combining_with_milk'],
    },
    {
      key: 'iron_rich_meal',
      title: 'Iron-Rich Meal/Snack',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Include iron-rich foods in at least 2 meals today. Good options: ragi porridge with jaggery, palak/moringa dal, sprouted moong chaat, sesame (til) chikki, beetroot raita, dates, and dried figs (anjeer). Always pair with a vitamin C source — amla murabba, lemon, guava, or orange.',
      durationMinutes: 30,
      successCriteria: 'At least 2 meals contained iron-rich foods paired with vitamin C',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['best_iron_foods', 'vegetarian_sources'],
    },
    {
      key: 'vitamin_c_pairing',
      title: 'Vitamin C Pairing',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Pair iron-rich meals and supplements with vitamin C for better absorption. Offer amla juice, lemon water, orange slices, guava, or tomato. Avoid giving milk, tea, or calcium supplements within 1 hour of iron-rich meals.',
      durationMinutes: 5,
      successCriteria: 'Vitamin C source given with at least one iron meal and with supplement',
      loggingType: 'done_skip' as const,
      coachingTopics: ['combining_with_milk'],
    },
  ],
  escalationRules: ironEscalations,
  customizableParams: ironParams,
  coachingPlaybook: {
    child_refuses_supplement: {
      questionPatterns: [
        'won\'t take iron', 'refuses supplement', 'spits out iron', 'hates the taste',
        'vomits iron drops', 'how to give iron',
      ],
      response:
        'Iron supplements have a metallic taste that many children dislike. This is one of the most common challenges Indian parents face. Here are practical strategies:\n\n**For drops/syrup:**\n- Mix with a small amount of honey (for children over 1 year) or jaggery water to mask the taste.\n- Use a dropper and aim for the back/side of the cheek, not directly on the tongue.\n- Follow immediately with a sweet fruit — a piece of chikoo, mango, or banana chases the taste.\n- Give it mixed into 1-2 spoons of amla murabba — the vitamin C actually helps absorption too!\n\n**Timing tricks:**\n- Give it first thing in the morning when {{child_name}} is hungry — they will accept it more easily.\n- Make it a quick daily routine: iron drops → sweet fruit → done. Keep it to under 30 seconds.\n- Some parents find mixing the drops into a small spoon of dal or jaggery paste works well.\n\n**Important:** Do not mix iron with milk, curd, or tea as these block absorption. If {{child_name}} consistently vomits the supplement, note this in the log and Dr. {{doctor_name}} may switch the formulation.\n\nConsistency matters more than perfection. Even getting 5 out of 7 days helps build iron stores.',
      followUp: 'What time of day are you currently giving the iron supplement?',
      boundary: false,
    },
    best_iron_foods: {
      questionPatterns: [
        'best iron foods', 'what to feed', 'iron rich food india', 'food for anemia',
        'diet for iron deficiency', 'what to cook',
      ],
      response:
        'Here are the best iron-rich foods readily available in India, organised by how much iron they pack:\n\n**Iron Superstars (give daily):**\n- Ragi (nachni) porridge with jaggery — one of the richest plant-based iron sources\n- Moringa (drumstick) leaves — fresh in dal or dry powder mixed into rotis\n- Amaranth (rajgira) — as ladoo, porridge, or chikki\n- Garden cress seeds (halim/aliv) — soaked and added to milk or ladoos\n- Sesame seeds (til) — as chutney, chikki, or sprinkled on food\n\n**Excellent Sources (include 3-4 times/week):**\n- Sprouted moong and chana — as chaat with lemon\n- Palak (spinach), bathua, and methi (fenugreek) — in parathas, dal, or sabzi\n- Beetroot — as juice, raita, or in parathas\n- Dates and dried figs (anjeer) — as snacks\n- Jaggery (gur) — replace sugar with jaggery where possible\n\n**If non-vegetarian:** Chicken liver (highest heme iron), egg yolk, mutton, and fish are excellent. Heme iron is absorbed 2-3x better than plant iron.\n\n**Critical rule — always pair with vitamin C:** Amla (Indian gooseberry) is the best — as murabba, juice, or pickle. Also: lemon, orange, guava, tomato. Vitamin C can double iron absorption from plant foods.\n\n**Avoid within 1 hour of iron meals:** Milk, curd, tea, coffee, calcium supplements.',
      boundary: false,
    },
    side_effects: {
      questionPatterns: [
        'constipation from iron', 'black stool', 'stomach pain', 'nausea from iron',
        'teeth staining', 'side effects of iron',
      ],
      response:
        'Iron supplement side effects are common but usually manageable. Here is what to expect and how to handle each:\n\n**Black/dark green stools**: This is completely normal and harmless. It means the iron is passing through the system. It will resolve when supplementation ends.\n\n**Constipation**: The most common complaint. To manage:\n- Increase water intake — {{child_name}} should drink plenty of water throughout the day.\n- Add fibre-rich foods: papaya, guava, ripe banana, isabgol (psyllium) mixed in water.\n- A small spoon of ghee with dal or rice also helps.\n- Encourage physical activity.\n\n**Stomach discomfort/nausea**: If this happens on an empty stomach, try giving the supplement with a small snack (not milk-based). A piece of roti or banana works well.\n\n**Tooth staining**: Iron drops/syrup can stain teeth dark. To prevent:\n- Use a dropper aimed at the back of the mouth.\n- Have {{child_name}} drink water or rinse mouth immediately after.\n- Brush teeth twice daily.\n\nIf side effects are severe enough that you are considering stopping the supplement, please log this and Dr. {{doctor_name}} can adjust the formulation or dosing schedule. Do not stop on your own.',
      followUp: 'Which side effect is {{child_name}} experiencing?',
      boundary: false,
    },
    when_recheck_labs: {
      questionPatterns: [
        'when to recheck blood', 'repeat blood test', 'when to test again', 'hemoglobin recheck',
        'how to know if iron is working', 'lab test timing',
      ],
      response:
        'Lab rechecks are an important part of monitoring {{child_name}}\'s response to iron treatment. However, the timing and interpretation of blood tests is a clinical decision that Dr. {{doctor_name}} should make.\n\nWhat I can share is that IAP guidelines generally recommend rechecking hemoglobin and ferritin after 4-8 weeks of consistent supplementation. But the specific timing depends on {{child_name}}\'s baseline levels and clinical response.\n\n**Please discuss lab recheck timing with Dr. {{doctor_name}} at your next appointment.** In the meantime, consistent daily supplementation and dietary iron intake are the best things you can do.\n\nYour SKIDS compliance logs will help Dr. {{doctor_name}} interpret lab results in context — if compliance has been 90%+ and hemoglobin has not improved, that tells a different story than if compliance was 50%.',
      boundary: true,
    },
    can_we_stop_early: {
      questionPatterns: [
        'can we stop iron', 'child is better now', 'how long to take iron', 'stop supplement early',
        'hemoglobin is normal now',
      ],
      response:
        'I completely understand the desire to stop — nobody enjoys giving daily supplements. However, stopping iron supplementation early is a medical decision that must be made by Dr. {{doctor_name}}.\n\nWhat I can share is that iron treatment typically has two phases: first, raising hemoglobin to normal levels (usually 4-8 weeks), and second, replenishing the body\'s iron stores (usually another 2-3 months). Even if {{child_name}} looks better and energy has improved, the body\'s iron reserves may not be fully restored yet. Stopping too early leads to a high relapse rate.\n\n**Please do not stop supplementation without consulting Dr. {{doctor_name}}.** They will check ferritin levels (which reflect iron stores, not just current hemoglobin) to determine when it is truly safe to stop.\n\nContinue the daily supplement and dietary approach until Dr. {{doctor_name}} gives the all-clear.',
      boundary: true,
    },
    combining_with_milk: {
      questionPatterns: [
        'iron with milk', 'give iron with milk', 'calcium and iron', 'milk blocking iron',
        'chai and iron', 'tea with iron',
      ],
      response:
        'This is a very important point — **milk, tea, and calcium-rich foods significantly block iron absorption**. This is one of the most common mistakes.\n\n**The rule**: Keep iron supplements and iron-rich meals at least 1 hour apart from:\n- Cow\'s milk, buffalo milk, curd, paneer\n- Tea (chai) — even for older children who may drink it\n- Calcium supplements\n\n**Why this matters especially in India**: Many Indian children drink large quantities of milk (500ml-1L/day), which can both suppress appetite for iron-rich foods and block absorption of whatever iron they do consume. Excess milk is actually a major contributor to iron deficiency in Indian toddlers.\n\n**Practical approach:**\n- Give iron supplement first thing in the morning with lemon water or amla juice. Wait 1 hour before milk.\n- Keep milk to recommended amounts: 300-500 ml/day depending on age, not more.\n- Never add iron drops to milk.\n- Pair iron-rich meals with vitamin C instead: dal with lemon, ragi porridge with orange juice.',
      boundary: false,
    },
    vegetarian_sources: {
      questionPatterns: [
        'vegetarian iron', 'veg iron sources', 'no meat iron', 'plant based iron',
        'we are vegetarian', 'jain diet iron',
      ],
      response:
        'India has excellent vegetarian iron sources — {{child_name}} can absolutely build iron stores on a vegetarian diet with the right strategies.\n\n**The key principle**: Plant (non-heme) iron is absorbed less efficiently than meat (heme) iron, but vitamin C pairing can increase absorption by 3-6 times. This makes vitamin C the vegetarian family\'s best friend.\n\n**Top vegetarian iron sources for Indian families:**\n1. **Ragi (nachni)** — porridge, dosa, roti. One of the richest plant iron sources.\n2. **Moringa (drumstick leaves)** — fresh in dal, or dry powder added to chapati dough.\n3. **Amaranth (rajgira)** — ladoo, porridge, or popped as snack.\n4. **Garden cress seeds (halim/aliv)** — soak and add to ladoos or milk (give milk separately from iron supplement).\n5. **Sprouted lentils** — moong, chana, masoor. Sprouting increases iron bioavailability.\n6. **Jaggery** — replace refined sugar in all recipes.\n7. **Sesame (til)** — chutney, chikki, til ladoo.\n8. **Green leafy vegetables** — palak, bathua, methi, poi, amaranth leaves.\n9. **Dried fruits** — dates, figs (anjeer), raisins, apricots.\n10. **Soybeans and tofu** — excellent for families who eat them.\n\n**Always pair with vitamin C**: Amla murabba, lemon squeeze, orange, guava, or tomato with every iron-rich meal. This is non-negotiable for vegetarian iron absorption.\n\n**For Jain families**: Avoid root vegetables but focus on ragi, amaranth, sesame, dried fruits, and above-ground greens.',
      followUp: 'Would you like a sample weekly meal plan with iron-rich options?',
      boundary: false,
    },
  },
}

// ── 2B: Iron Nutrition — USA/AAP ──

const ironNutritionAAP: InterventionProtocol = {
  ...ironBase,
  id: 'proto_iron_aap_v1',
  slug: 'iron-nutrition-aap',
  name: 'Iron-Deficiency Nutrition Protocol (AAP)',
  region: 'usa',
  protocolAuthority: 'AAP',
  parentLocale: 'en',
  description:
    'Comprehensive iron repletion protocol for children aged 6 months to 12 years with diagnosed iron deficiency anemia, following AAP (American Academy of Pediatrics) guidelines. Combines prescribed oral iron supplementation with dietary strategies emphasising iron-fortified cereals, lean red meat, beans, and vitamin C pairing. Includes guidance on formula iron content for infants, limiting cow\'s milk intake, and managing common supplement side effects.',
  evidenceBase:
    'AAP Clinical Report: "Diagnosis and Prevention of Iron Deficiency and Iron-Deficiency Anemia in Infants and Young Children (0-3 Years of Age)" (Pediatrics, 2010). Baker RD, Greer FR, Committee on Nutrition. AAP Bright Futures Nutrition Guidelines (4th Edition). CDC Recommendations to Prevent and Control Iron Deficiency in the United States (MMWR, 1998). Powers JM et al., "Iron Deficiency Anemia in Toddlers to Teens: How to Manage When Prevention Fails" (Pediatrics in Review, 2020).',
  prevalenceNotes:
    'Iron deficiency affects approximately 7-9% of US toddlers aged 1-3 years. Higher rates in low-income families, premature infants, and children consuming excessive cow\'s milk. Prevalence increases again in adolescent girls with menstruation.',
  dietaryContext:
    'Standard American diet. Key iron sources: iron-fortified infant cereals, lean beef/ground turkey, dark meat poultry, beans (black, kidney, lentils), tofu, iron-fortified breakfast cereals, spinach. Vitamin C pairing with orange juice, strawberries, bell peppers.',
  geneticConsiderations:
    'Sickle cell trait/disease in African American populations. Thalassemia trait in Mediterranean, Asian, and Middle Eastern heritage. Lead exposure screening important in older housing — lead poisoning mimics and exacerbates iron deficiency.',
  tasks: [
    {
      key: 'iron_supplement',
      title: 'Iron Supplement Dose',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Give {{child_name}} the prescribed iron supplement ({{supplement_type}}, {{supplement_dose_mg}} mg/kg/day) between meals or with a vitamin C source (orange juice, strawberries). Avoid giving with milk, yogurt, or calcium-rich foods. Use a straw or dropper to minimise tooth staining.',
      durationMinutes: 5,
      successCriteria: 'Full prescribed iron dose administered',
      loggingType: 'done_skip' as const,
      coachingTopics: ['child_refuses_supplement', 'side_effects', 'combining_with_milk'],
    },
    {
      key: 'iron_rich_meal',
      title: 'Iron-Rich Meal/Snack',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Include iron-rich foods in at least 2 meals today. Good options: iron-fortified cereal with berries, lean beef or turkey, bean soup/chili, lentil dishes, tofu stir-fry, spinach in smoothies, or dark-meat chicken. Pair with vitamin C — orange slices, bell pepper strips, strawberries, or tomato sauce.',
      durationMinutes: 30,
      successCriteria: 'At least 2 meals contained iron-rich foods paired with vitamin C',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['best_iron_foods', 'vegetarian_sources'],
    },
    {
      key: 'vitamin_c_pairing',
      title: 'Vitamin C Pairing',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Pair iron-rich meals and supplements with a vitamin C source: orange juice, strawberries, bell peppers, tomato, kiwi, or broccoli. Avoid giving milk or dairy within 1 hour of iron-rich meals or supplements.',
      durationMinutes: 5,
      successCriteria: 'Vitamin C source given with iron meal and supplement',
      loggingType: 'done_skip' as const,
      coachingTopics: ['combining_with_milk'],
    },
  ],
  escalationRules: ironEscalations,
  customizableParams: ironParams,
  coachingPlaybook: {
    child_refuses_supplement: {
      questionPatterns: [
        'won\'t take iron', 'refuses supplement', 'spits out iron', 'hates the taste',
        'vomits iron', 'how to give iron to my child',
      ],
      response:
        'Iron supplements have a strong metallic taste that children often dislike. This is the most common barrier to treatment, so you are not alone. Here are proven strategies:\n\n**For drops (infants/toddlers):**\n- Mix the dose into 1-2 oz of orange juice or vitamin C-fortified juice. The vitamin C masks the taste and boosts absorption.\n- Use a syringe and aim for the inner cheek, not directly on the tongue.\n- Follow immediately with a favourite food — applesauce, mashed banana, or a popsicle.\n\n**For syrup/liquid (toddlers/older kids):**\n- Poly-Vi-Sol with Iron or NovaFerrum have better taste profiles than generic ferrous sulfate. Ask Dr. {{doctor_name}} about switching brands.\n- Chase it with a flavoured drink — chocolate soy milk (wait 1 hour for dairy milk) or fruit smoothie.\n\n**For chewable tablets (older kids):**\n- SunActive Fe (microencapsulated iron) is nearly tasteless and can be sprinkled on food.\n- Flintstones with Iron chewable vitamins are well-tolerated.\n\n**Timing tip**: Give iron first thing in the morning before breakfast when {{child_name}} is hungriest. Make it a quick routine — under 30 seconds.\n\nConsistency is more important than perfection. Getting the dose in 5 out of 7 days still builds iron stores.',
      followUp: 'What form of iron supplement is {{child_name}} currently taking?',
      boundary: false,
    },
    best_iron_foods: {
      questionPatterns: [
        'best iron foods', 'what to feed', 'iron rich food', 'food for anemia',
        'diet for iron deficiency', 'grocery list for iron',
      ],
      response:
        'Here are the best iron-rich foods available in US grocery stores, ranked by iron content and bioavailability:\n\n**Heme Iron (best absorbed — 15-35% absorption rate):**\n- Lean ground beef or beef strips — 2.5 mg per 3 oz\n- Dark meat chicken/turkey — 1.2 mg per 3 oz\n- Chicken or beef liver — 5 mg per 3 oz (iron powerhouse)\n- Shrimp — 2 mg per 3 oz\n\n**Non-Heme Iron (plant-based — 2-20% absorption, boosted by vitamin C):**\n- Iron-fortified infant cereal (Gerber) — 6-7 mg per serving (excellent for babies)\n- Iron-fortified breakfast cereals (Cheerios, Total) — 8-18 mg per serving\n- White beans, kidney beans, lentils — 3-4 mg per half cup\n- Tofu (firm) — 3 mg per half cup\n- Spinach (cooked) — 3 mg per half cup\n- Dried apricots, raisins — 1-2 mg per quarter cup\n- Blackstrap molasses — 3.5 mg per tablespoon\n\n**Kid-Friendly Iron-Rich Meals:**\n- Mini meatballs with tomato sauce (iron + vitamin C)\n- Bean and cheese quesadilla with salsa\n- Iron-fortified cereal with strawberries for breakfast\n- Lentil soup with a squeeze of lemon\n- Smoothie: spinach + banana + orange juice\n\n**The vitamin C rule**: Always pair plant iron with vitamin C — it can increase absorption 3-6x. Orange juice, strawberries, bell peppers, tomatoes, and broccoli are great pairers.',
      boundary: false,
    },
    side_effects: {
      questionPatterns: [
        'constipation from iron', 'black stool', 'stomach pain', 'nausea from iron',
        'teeth staining', 'side effects',
      ],
      response:
        'Iron supplement side effects are common but manageable. Here is what to expect:\n\n**Dark/black stools**: Completely normal and harmless. This is just unabsorbed iron passing through. It resolves when supplementation stops.\n\n**Constipation** (most common complaint):\n- Increase water and fluid intake throughout the day.\n- Add high-fibre foods: prunes/prune juice (a classic remedy), pears, berries, whole grains, beans.\n- If severe, a small daily dose of MiraLAX (polyethylene glycol) can help — but check with Dr. {{doctor_name}} first.\n- Ensure {{child_name}} gets physical activity daily.\n\n**Nausea/stomach upset**:\n- Try giving the supplement with a small amount of food (not dairy-based). Crackers, toast, or applesauce work well.\n- Some children tolerate iron better in the evening than morning.\n- If persistent, Dr. {{doctor_name}} may switch to a different formulation (ferrous gluconate is gentler than ferrous sulfate).\n\n**Tooth staining from liquid iron**:\n- Use a straw or syringe aimed at the back of the mouth.\n- Have {{child_name}} rinse with water or brush teeth after the dose.\n- Staining is cosmetic and can be cleaned by a dentist.\n\nIf side effects are severe enough that you are considering stopping, please log this concern and Dr. {{doctor_name}} can adjust the plan. Do not discontinue without medical guidance.',
      followUp: 'Which side effect is bothering {{child_name}} the most?',
      boundary: false,
    },
    when_recheck_labs: {
      questionPatterns: [
        'when to recheck blood', 'repeat blood test', 'when to test again', 'CBC recheck',
        'ferritin recheck',
      ],
      response:
        'Lab rechecks are essential for tracking {{child_name}}\'s response to iron treatment. However, the timing of repeat labs is a clinical decision for Dr. {{doctor_name}}.\n\nThe AAP generally recommends rechecking a CBC and reticulocyte count 4 weeks after starting treatment, with a ferritin level at 2-3 months. But {{child_name}}\'s specific timeline depends on baseline severity and clinical response.\n\n**Please schedule a follow-up with Dr. {{doctor_name}} to discuss lab timing.** Your consistent SKIDS compliance logs will help them interpret results — high compliance with poor response may indicate a different underlying cause (thalassemia trait, ongoing blood loss, malabsorption) that needs investigation.',
      boundary: true,
    },
    can_we_stop_early: {
      questionPatterns: [
        'can we stop iron', 'hemoglobin is normal', 'child seems better', 'how long to take iron',
        'stop supplement',
      ],
      response:
        'It is great that {{child_name}} seems to be doing better — that likely means the treatment is working. However, the decision to stop iron supplementation must be made by Dr. {{doctor_name}} based on lab results.\n\nThe AAP recommends continuing iron supplementation for 2-3 months after hemoglobin normalises to fully replenish iron stores (measured by ferritin). Stopping when hemoglobin first normalises is a common mistake that leads to relapse within months.\n\n**Please continue the current protocol until Dr. {{doctor_name}} reviews ferritin levels and gives the all-clear.** The daily effort you are putting in now is preventing a relapse that would mean starting all over again.',
      boundary: true,
    },
    combining_with_milk: {
      questionPatterns: [
        'iron with milk', 'calcium and iron', 'dairy and iron', 'milk blocking iron',
        'how much milk',
      ],
      response:
        'Great question — **milk and dairy significantly reduce iron absorption**. This is one of the most important things to manage during iron treatment.\n\n**The rules:**\n- Do not give iron supplements with milk, yogurt, cheese, or calcium supplements. Keep them 1 hour apart.\n- Do not mix iron drops into milk or formula.\n- Give the supplement with water, juice, or fruit instead.\n\n**The cow\'s milk issue in toddlers**: Excessive cow\'s milk consumption (more than 16-24 oz/day) is actually a major cause of iron deficiency in American toddlers. It fills them up, reducing appetite for iron-rich foods, AND the calcium blocks iron absorption. Additionally, excessive milk can cause occult GI blood loss in some young children.\n\n**AAP recommended milk limits by age:**\n- 12-24 months: Maximum 16 oz (2 cups) whole milk per day\n- 2-5 years: Maximum 16-20 oz (2-2.5 cups) per day\n- Over 5: 2-3 cups per day\n\nIf {{child_name}} is a big milk drinker, gradually reduce to the recommended amount and replace with water and iron-rich foods. This single change can significantly improve iron status.',
      boundary: false,
    },
    vegetarian_sources: {
      questionPatterns: [
        'vegetarian iron', 'plant based iron', 'no meat iron', 'vegan iron', 'we don\'t eat meat',
      ],
      response:
        '{{child_name}} can absolutely get enough iron on a vegetarian or plant-based diet — it just requires more intentional planning and consistent vitamin C pairing.\n\n**Top plant-based iron sources available in US stores:**\n1. **Iron-fortified cereals** — Cheerios, Total, Cream of Wheat. Check labels for "fortified with iron." Easiest win.\n2. **Beans and lentils** — black beans, kidney beans, chickpeas, lentils. 3-4 mg per half cup.\n3. **Tofu (firm)** — 3 mg per half cup. Great in stir-fries, scrambles, and smoothies.\n4. **Spinach (cooked)** — 3 mg per half cup. Cooking increases bioavailability.\n5. **Quinoa** — 2.8 mg per cup cooked. A complete protein too.\n6. **Dried fruits** — raisins, apricots, prunes. Good iron-rich snacks.\n7. **Seeds** — pumpkin seeds (2.5 mg per oz), sesame seeds, hemp seeds.\n8. **Blackstrap molasses** — 3.5 mg per tablespoon. Mix into oatmeal or baking.\n9. **Fortified plant milks** — some soy milks are iron-fortified (check labels).\n10. **Edamame** — 1.8 mg per half cup. Kid-friendly snack.\n\n**The non-negotiable rule**: Always pair with vitamin C. Non-heme iron absorption jumps from ~5% to ~20% with vitamin C. Orange juice, strawberries, bell peppers, tomato sauce, kiwi, or broccoli at every iron-rich meal.\n\n**Avoid combining with**: Milk, tea, coffee, calcium supplements within 1 hour of iron meals.',
      followUp: 'Would you like a sample weekly meal plan for vegetarian iron-rich eating?',
      boundary: false,
    },
  },
}

// ── 2C: Iron Nutrition — GCC/Gulf_AP ──

const ironNutritionGulf: InterventionProtocol = {
  ...ironBase,
  id: 'proto_iron_gulf_v1',
  slug: 'iron-nutrition-gulf',
  name: 'Iron-Deficiency Nutrition Protocol (Gulf)',
  region: 'gcc',
  protocolAuthority: 'Gulf_AP',
  parentLocale: 'en',
  description:
    'Comprehensive iron repletion protocol for children aged 6 months to 12 years with diagnosed iron deficiency anemia, adapted for Gulf Cooperation Council countries. Combines oral iron supplementation with regionally relevant dietary strategies emphasising dates, red meat, pomegranate, and regional grains. Includes G6PD awareness (high prevalence in Gulf populations), Ramadan considerations for older children, and guidance for nanny/caregiver-mediated supplementation.',
  evidenceBase:
    'Gulf Pediatric Nutrition Guidelines (2020). Saudi Pediatric Hematology Guidelines for Iron Deficiency (2019). WHO Guideline: Daily Iron Supplementation in Infants and Children (2016). Al-Saqladi AM et al., "Iron Deficiency Anemia Among Children in the Middle East: A Systematic Review" (J Pediatr Hematol Oncol, 2020). Prevalence data from UAE, Saudi, Qatar national health surveys.',
  prevalenceNotes:
    'Iron deficiency anemia affects 20-40% of children in GCC countries despite high economic status. Contributing factors: excessive milk/formula intake, limited dietary diversity, hot climate reducing appetite, vitamin D deficiency (which impairs iron metabolism).',
  dietaryContext:
    'Diet rich in red meat, rice, dates, and dairy. Key regional iron sources: red meat (lamb, beef), dates (tamr), pomegranate (rumman), black honey (asal aswad), molokheya, dried beans (ful), lentils (adas). Vitamin C pairing with lemon, orange, guava.',
  geneticConsiderations:
    'G6PD deficiency prevalence is 5-25% in Gulf Arab populations. G6PD testing should be confirmed before iron supplementation as some iron preparations may stress G6PD-deficient red cells. Sickle cell trait also prevalent in Eastern Province of Saudi Arabia and parts of Oman.',
  tasks: [
    {
      key: 'iron_supplement',
      title: 'Iron Supplement Dose',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Give {{child_name}} the prescribed iron supplement ({{supplement_type}}, {{supplement_dose_mg}} mg/kg/day) between meals with a vitamin C source (lemon juice, orange juice). Avoid giving with milk, tea, or calcium-rich foods. Use a straw or dropper to minimise tooth staining.',
      durationMinutes: 5,
      successCriteria: 'Full prescribed iron dose administered',
      loggingType: 'done_skip' as const,
      coachingTopics: ['child_refuses_supplement', 'side_effects', 'combining_with_milk'],
    },
    {
      key: 'iron_rich_meal',
      title: 'Iron-Rich Meal/Snack',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Include iron-rich foods in at least 2 meals today. Good regional options: lamb/beef kabab, liver (kibdah), dates with orange slices, lentil soup (shorbat adas) with lemon, pomegranate juice, molokheya, ful medames, or spinach fatayer. Always pair with vitamin C — lemon, orange, guava.',
      durationMinutes: 30,
      successCriteria: 'At least 2 meals contained iron-rich foods paired with vitamin C',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['best_iron_foods', 'vegetarian_sources'],
    },
    {
      key: 'vitamin_c_pairing',
      title: 'Vitamin C Pairing',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Pair iron-rich meals and supplements with a vitamin C source: fresh lemon juice, orange, guava, pomegranate, kiwi, or tomato. Avoid giving milk, laban, or tea within 1 hour of iron meals or supplements.',
      durationMinutes: 5,
      successCriteria: 'Vitamin C source given with iron meal and supplement',
      loggingType: 'done_skip' as const,
      coachingTopics: ['combining_with_milk'],
    },
  ],
  escalationRules: ironEscalations,
  customizableParams: ironParams,
  coachingPlaybook: {
    child_refuses_supplement: {
      questionPatterns: [
        'won\'t take iron', 'refuses supplement', 'spits out iron', 'hates the taste',
        'nanny can\'t give iron', 'how to give iron',
      ],
      response:
        'Iron supplements have a strong metallic taste that children commonly dislike. Here are practical strategies for Gulf families:\n\n**Masking the taste:**\n- Mix the dose into a small amount of date syrup (dibs) or honey (for children over 1 year). The sweetness masks the metallic taste effectively.\n- Follow immediately with a date or a piece of sweet fruit.\n- Use a dropper aimed at the inner cheek, not directly on the tongue.\n\n**For nanny/caregiver-administered doses:**\n- Show the nanny exactly how to give the supplement and explain why it is important.\n- Post the SKIDS task card in the kitchen as a daily reminder.\n- Have the nanny log completion in the app so you can verify.\n\n**Timing**: Give the supplement in the morning when {{child_name}} is hungrier and more likely to accept it. Make it a quick 30-second routine: dose → sweet food → done.\n\n**If severe refusal persists**: Note this in the log. Dr. {{doctor_name}} may switch to a different formulation — microencapsulated iron (SunActive Fe) is nearly tasteless and can be sprinkled on food.\n\nConsistency matters most. Even 5 out of 7 days helps build iron stores over time.',
      followUp: 'Is the nanny/caregiver helping with the supplement routine?',
      boundary: false,
    },
    best_iron_foods: {
      questionPatterns: [
        'best iron foods', 'what to feed', 'iron rich food', 'food for anemia',
        'diet for low iron', 'arab iron foods',
      ],
      response:
        'The Gulf region has excellent iron-rich foods in its traditional cuisine. Here are the best options for {{child_name}}:\n\n**Iron Superstars (give daily):**\n- **Dates (tamr)** — 3-5 dates provide ~1 mg iron plus natural sugars. Ajwa dates are highest in iron. Pair with orange slices for vitamin C.\n- **Lamb/beef** — kabab, kofta, or grilled. Red meat provides the best-absorbed heme iron (3 mg per 100g).\n- **Liver (kibdah)** — the single richest iron food (6-9 mg per 100g). Even once a week helps tremendously.\n- **Black honey (asal aswad/black molasses)** — 1 tablespoon in warm water provides ~3.5 mg iron.\n\n**Excellent Sources (3-4 times/week):**\n- **Lentil soup (shorbat adas)** — always squeeze lemon on top for vitamin C.\n- **Ful medames** — mashed fava beans with lemon and olive oil.\n- **Molokheya** — rich in iron, prepare with chicken or meat broth.\n- **Pomegranate (rumman)** — juice or fresh seeds. Contains iron + vitamin C.\n- **Spinach fatayer** — iron-rich pastries kids love.\n- **Eggs** — particularly the yolk. 2 eggs provide ~1.2 mg iron.\n\n**The vitamin C rule**: Always pair iron foods with lemon, orange, guava, or tomato. This can triple absorption from plant sources. A squeeze of fresh lemon on ful, lentil soup, or meat dishes makes a real difference.\n\n**Avoid within 1 hour of iron meals**: Milk, laban, tea, Arabic coffee.',
      boundary: false,
    },
    side_effects: {
      questionPatterns: [
        'constipation from iron', 'black stool', 'stomach pain', 'nausea',
        'side effects of iron',
      ],
      response:
        'Iron supplement side effects are common but manageable. Here is what to expect:\n\n**Black/dark stools**: Completely normal and harmless. It is just unabsorbed iron passing through. It stops when supplementation ends.\n\n**Constipation** (most common):\n- Increase water intake — critical in the Gulf heat. {{child_name}} may need more fluids than you think.\n- Dates are a natural remedy — they contain both iron AND fibre. Win-win.\n- Add prunes, figs, and papaya to the diet.\n- Ensure {{child_name}} gets physical activity, even if it is indoor play during hot months.\n\n**Nausea/stomach upset**: Try giving the supplement with a small non-dairy snack — a date, piece of bread, or banana. Some children tolerate it better in the evening.\n\n**Tooth staining**: Use a dropper aimed at the back of the mouth, and have {{child_name}} rinse with water immediately after. Brush teeth twice daily.\n\nIf side effects are severe enough that you are considering stopping, please log this concern and Dr. {{doctor_name}} can adjust the formulation or dose. Do not stop the supplement without medical guidance.',
      followUp: 'Is {{child_name}} drinking enough water throughout the day?',
      boundary: false,
    },
    when_recheck_labs: {
      questionPatterns: [
        'when to recheck blood', 'repeat blood test', 'when to test hemoglobin',
        'lab recheck timing',
      ],
      response:
        'Lab rechecks are important for tracking {{child_name}}\'s treatment response. However, the timing of repeat blood tests is a clinical decision for Dr. {{doctor_name}}.\n\nGenerally, a CBC and ferritin are rechecked after 4-8 weeks of consistent supplementation, but {{child_name}}\'s specific timeline depends on baseline severity and clinical response.\n\n**Please discuss lab timing with Dr. {{doctor_name}}.** Your SKIDS compliance logs will help them interpret results — consistent compliance with poor improvement may suggest an underlying issue (G6PD deficiency, thalassemia trait, or other causes) that needs investigation.',
      boundary: true,
    },
    can_we_stop_early: {
      questionPatterns: [
        'can we stop iron', 'child looks better', 'how long to continue', 'stop supplement',
      ],
      response:
        'It is encouraging that {{child_name}} seems better. However, the decision to stop iron supplementation must come from Dr. {{doctor_name}} after reviewing lab results.\n\nIron treatment has two phases: normalising hemoglobin (4-8 weeks) and replenishing iron stores (additional 2-3 months). Stopping too early is a common mistake that leads to relapse within months.\n\n**Please continue the daily protocol until Dr. {{doctor_name}} checks ferritin levels and confirms it is safe to stop.** Your daily effort now is preventing a relapse that would mean starting over.',
      boundary: true,
    },
    combining_with_milk: {
      questionPatterns: [
        'iron with milk', 'laban and iron', 'calcium blocking iron', 'tea and iron',
        'milk and iron',
      ],
      response:
        '**Milk, laban, tea, and calcium-rich foods significantly block iron absorption.** This is one of the most critical rules during iron treatment.\n\n**The rules:**\n- Keep iron supplements and iron-rich meals 1 hour apart from: milk, laban, yogurt, cheese, tea, Arabic coffee.\n- Never mix iron drops into milk or formula.\n- Give the supplement with water, lemon juice, or orange juice instead.\n\n**Common issue in Gulf families**: Children often drink large quantities of milk or formula (sometimes 800ml-1L/day), which fills them up, reduces appetite for iron-rich foods, and blocks absorption. Excessive cow\'s milk is a major contributor to iron deficiency in toddlers.\n\n**Recommended milk limits:**\n- 12-24 months: Maximum 400-500 ml per day\n- 2-5 years: Maximum 400-500 ml per day\n- Over 5: 2-3 cups per day\n\nIf {{child_name}} drinks a lot of milk, gradually reduce it and replace with water, fresh juices (with pulp), and iron-rich snacks like dates.',
      boundary: false,
    },
    vegetarian_sources: {
      questionPatterns: [
        'vegetarian iron', 'plant iron', 'no meat iron', 'we don\'t eat much meat',
      ],
      response:
        'While the Gulf diet traditionally includes good amounts of red meat, here are excellent plant-based iron sources available in GCC countries:\n\n**Regional plant iron sources:**\n1. **Dates (tamr)** — especially Ajwa dates. 3-5 daily provides ~1 mg iron.\n2. **Black honey (asal aswad)** — 1 tablespoon = ~3.5 mg iron. Mix in warm water.\n3. **Lentils (adas)** — as soup with lemon. 3 mg per half cup.\n4. **Fava beans (ful)** — as ful medames with lemon and olive oil. 2.5 mg per half cup.\n5. **Chickpeas (hummus)** — as hummus or in stews. 2.4 mg per half cup.\n6. **Spinach and molokheya** — cook in stews or as side dishes.\n7. **Sesame paste (tahini)** — 2.7 mg per 2 tablespoons. Use in hummus or dressings.\n8. **Pomegranate** — contains both iron and vitamin C.\n9. **Dried figs and apricots** — iron-rich snacks.\n10. **Fortified breakfast cereals** — check labels at Carrefour/Lulu.\n\n**Essential rule**: Always pair plant iron with vitamin C. Squeeze lemon on everything — lentil soup, ful, salads, spinach. This can triple iron absorption from plant foods.\n\nIf {{child_name}} eats some meat, even 2-3 servings of red meat per week combined with daily plant sources makes a significant difference.',
      boundary: false,
    },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// 3. SPEECH STIMULATION — DEVELOPMENTAL
// ════════════════════════════════════════════════════════════════════════════

const speechBase = {
  category: 'developmental' as const,
  subspecialty: 'neuro_dev_ai' as const,
  conditionName: 'Speech/Language Delay',
  icd10: 'F80.9',
  defaultDurationDays: 180,
  defaultFrequency: 'daily' as const,
  ageRangeMin: 12,
  ageRangeMax: 72,
  version: 1,
}

const speechEscalations = [
  {
    trigger: 'compliance_below_50',
    condition: { metric: 'compliance_pct', operator: 'lt' as const, value: 50, windowDays: 7 },
    severity: 'warning' as const,
    titleTemplate: 'Low speech exercise compliance for {{child_name}}',
    detailTemplate:
      '{{child_name}}\'s speech exercise compliance is {{compliance_pct}}% over the past 7 days. Consistent daily practice is essential for language development progress. Family may need support with scheduling or technique.',
  },
  {
    trigger: 'no_progress_8_weeks',
    condition: { metric: 'boundary_hits', operator: 'gt' as const, value: 4, windowDays: 56 },
    severity: 'warning' as const,
    titleTemplate: 'Speech progress concern for {{child_name}}',
    detailTemplate:
      'Parent has repeatedly asked about lack of progress over 8 weeks. Despite coaching support, concerns persist. May benefit from formal speech-language pathology assessment or therapy adjustment.',
  },
  {
    trigger: 'parent_concern_regression',
    condition: { metric: 'parent_concern_level', operator: 'gt' as const, value: 7 },
    severity: 'urgent' as const,
    titleTemplate: 'Possible speech regression reported for {{child_name}}',
    detailTemplate:
      'Parent concern level is {{parent_concern_level}}/10. They may be reporting loss of previously acquired words or skills. Speech regression warrants prompt developmental assessment.',
  },
  {
    trigger: 'consecutive_skips',
    condition: { metric: 'consecutive_skips', operator: 'gt' as const, value: 4 },
    severity: 'warning' as const,
    titleTemplate: '5+ consecutive speech exercise sessions skipped',
    detailTemplate:
      '{{child_name}} has skipped {{consecutive_skips}} consecutive sessions. Extended gaps slow language development. Family may need schedule restructuring or motivational support.',
  },
]

const speechParams = [
  {
    key: 'target_language',
    type: 'select' as const,
    defaultValue: 'primary',
    label: 'Language Approach',
    options: ['primary', 'bilingual'],
  },
  {
    key: 'daily_exercise_minutes',
    type: 'number' as const,
    defaultValue: 15,
    label: 'Exercise Duration Per Session',
    unit: 'minutes',
    min: 10,
    max: 30,
  },
  {
    key: 'age_appropriate_level',
    type: 'select' as const,
    defaultValue: 'emerging_words',
    label: 'Current Language Level',
    options: ['pre_verbal', 'emerging_words', 'two_word_phrases', 'sentences'],
  },
]

// ── 3A: Speech — India/IAP ──

const speechStimIAP: InterventionProtocol = {
  ...speechBase,
  id: 'proto_speech_iap_v1',
  slug: 'speech-stim-iap',
  name: 'Speech Stimulation Protocol (IAP)',
  region: 'india',
  protocolAuthority: 'IAP',
  parentLocale: 'en',
  description:
    'Structured home-based speech and language stimulation protocol for children aged 1-6 years with identified speech/language delay, aligned with IAP developmental paediatrics guidelines. Designed for multilingual Indian households (Hindi/English plus regional language). Leverages joint family structure as a language-rich environment. Emphasises rhymes and songs in mother tongue, narration during daily activities, reduced screen time, and academic-pressure-free engagement. Includes guidance for bilingual families to maintain both languages without confusion.',
  evidenceBase:
    'IAP Guidelines on Developmental Assessment and Intervention (2020). National Early Childhood Care and Education (ECCE) Framework, MHRD India. Hoff E, "The Specificity of Environmental Influence: Socioeconomic Status Affects Early Vocabulary Development via Maternal Speech" (Child Development, 2003). Paradis J et al., "Dual Language Development and Disorders: A Handbook on Bilingualism and Second Language Learning" (2nd ed, 2011). Indian Journal of Pediatrics — Speech and Language Milestones in Indian Children (2018).',
  prevalenceNotes:
    'Speech and language delay affects approximately 5-8% of Indian preschool children. Often detected late due to cultural norms ("boys speak later," "wait until 3"). Bilingual environments may mask early signs.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'speech_exercise',
      title: 'Speech Stimulation Exercise',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Spend {{daily_exercise_minutes}} minutes in focused one-on-one speech practice with {{child_name}}. Sit face-to-face. Use simple Hindi/English rhymes, name objects around the house, play turn-taking games ("your turn, my turn"), and model clear speech. If {{child_name}} points, say the word for them and wait — do not rush to fulfill the request without language.',
      durationMinutes: 15,
      successCriteria: 'Completed focused one-on-one speech exercise with face-to-face interaction',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['child_not_talking_yet', 'bilingual_confusion', 'screen_time_and_speech'],
    },
    {
      key: 'narration_time',
      title: 'Daily Narration (Self-Talk/Parallel Talk)',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'During at least one daily routine (bathing, cooking, getting dressed, going to the park), narrate what you are doing in simple sentences. "Now I am putting on your shirt. Red shirt! Arms up!" This "language bath" builds vocabulary naturally. Any family member can do this — grandparents, too!',
      durationMinutes: 15,
      successCriteria: 'Narrated at least one daily activity in simple clear language',
      loggingType: 'done_skip' as const,
      coachingTopics: ['child_not_talking_yet', 'comparison_with_peers'],
    },
    {
      key: 'reading_time',
      title: 'Book/Picture Reading Time',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Read a picture book or look at pictures together for 10-15 minutes. Point to pictures and name them. Ask "Where is the dog?" and let {{child_name}} point. For older children, ask "What is happening?" Use Hindi, English, or your mother tongue — whichever feels natural.',
      durationMinutes: 15,
      successCriteria: 'Completed shared reading/picture-naming session',
      loggingType: 'done_skip' as const,
      coachingTopics: ['bilingual_confusion', 'stuttering_normal'],
    },
  ],
  escalationRules: speechEscalations,
  customizableParams: speechParams,
  coachingPlaybook: {
    child_not_talking_yet: {
      questionPatterns: [
        'not talking yet', 'no words', 'only babbling', 'when will they talk',
        'silent child', 'not saying anything', 'delayed speech',
      ],
      response:
        'I understand your worry — waiting for your child to speak can be very stressful. Here is what is important to know:\n\nSpeech development has a wide range of "normal." Some children say their first words at 10 months, others at 18 months. But Dr. {{doctor_name}} has identified that {{child_name}} would benefit from structured speech stimulation, and that is exactly what we are doing.\n\n**What you can do right now:**\n- **Reduce screen time significantly**. TV, phones, and tablets are passive — the brain needs interactive, human speech to develop language. IAP recommends zero screen time under 2 years and less than 1 hour for 2-5 years.\n- **Talk, talk, talk**. Narrate your day: "Mama is cooking dal. Hot dal! Stir stir stir." This "language bath" is the single most powerful intervention.\n- **Respond to ALL communication attempts**. If {{child_name}} points, gestures, or babbles — respond! "Yes, that is a doggy! Woof woof!" This teaches them that communication gets results.\n- **Use the joint family advantage**. Every family member who talks to {{child_name}} is providing speech therapy. Grandparents telling stories, siblings playing — it all counts.\n- **Do not force speech**. Never say "Say doggy! Say it!" Pressure shuts children down. Instead, model: "Look, a doggy!" and wait.\n\nConsistency is key. Daily practice over weeks and months builds the neural pathways for speech.',
      followUp: 'Is {{child_name}} using gestures like pointing, waving, or reaching?',
      boundary: false,
    },
    bilingual_confusion: {
      questionPatterns: [
        'bilingual confusion', 'too many languages', 'Hindi and English confusing',
        'which language to use', 'mixing languages', 'should we stick to one language',
        'mother tongue or English',
      ],
      response:
        'This is one of the most common myths in India — that bilingualism causes speech delay. **Research clearly shows this is NOT true.** Bilingual children are not more likely to have language delays than monolingual children.\n\nHere is what actually happens:\n- Bilingual children may have a slightly smaller vocabulary in each individual language, but their TOTAL vocabulary across both languages is equal to or larger than monolingual peers.\n- Code-mixing (using words from both languages in one sentence) is completely normal and a sign of linguistic competence, not confusion.\n- The bilingual brain is actually building MORE neural connections, not fewer.\n\n**What to do for {{child_name}}:**\n- **Use your mother tongue at home.** If Hindi, Tamil, Telugu, Bengali, or any regional language is your natural language, use it. Children learn best from natural, emotional, fluent speech — not forced English.\n- **One person, one language** is a useful (but not strict) guideline. Mama speaks Hindi, Papa speaks English, Dadi speaks Marathi — that is fine!\n- **Do not switch languages mid-concept when teaching.** If you are naming fruits, name them all in one language at a time.\n- **Never stop using your mother tongue** in favour of English "because school needs English." A strong foundation in mother tongue actually helps second language acquisition.\n\nDr. {{doctor_name}} can advise on whether a specific language approach is needed for {{child_name}}.',
      followUp: 'Which languages does your family speak at home?',
      boundary: false,
    },
    screen_time_and_speech: {
      questionPatterns: [
        'screen time', 'TV and speech', 'phone and language', 'cartoons help speech',
        'educational videos', 'YouTube for kids', 'cocomelon',
      ],
      response:
        'This is a critical topic. **Excessive screen time is one of the strongest risk factors for speech delay in young children.** Research is very clear on this.\n\n**Why screens hurt speech development:**\n- Speech develops through interactive, back-and-forth communication. Screens are one-way.\n- Even "educational" videos and apps do not produce the same neural activation as live human speech.\n- Every minute on a screen is a minute NOT spent in interactive play and conversation.\n- Background TV (even when the child is not watching) reduces the quantity and quality of parent-child talk.\n\n**IAP recommendations:**\n- Under 2 years: ZERO screen time. Not even "educational" content.\n- 2-5 years: Maximum 1 hour per day of high-quality content, always co-viewed with a parent who talks about what is happening.\n\n**Practical strategies for Indian families:**\n- Replace cartoon time with rhyme time — sing Hindi/English rhymes together.\n- During meals, turn OFF the TV. Mealtime conversation is a huge language opportunity.\n- If grandparents use TV as a pacifier, gently explain the impact and suggest alternatives: going for a walk, playing with blocks, or looking at picture books.\n- {{child_name}}\'s speech exercises in SKIDS are designed to replace some of that screen time with active language-building.\n\nI know this is hard in modern life. Start by reducing 30 minutes of screen time and replacing it with interactive play. Every bit helps.',
      boundary: false,
    },
    stuttering_normal: {
      questionPatterns: [
        'stuttering', 'stammering', 'repeating words', 'getting stuck on words',
        'fluency problem', 'can\'t get words out',
      ],
      response:
        'Many parents worry when their child starts repeating words or syllables. Here is the reassuring news:\n\n**Developmental disfluency (normal "stuttering") is VERY common** between ages 2-5. About 5% of all children go through a phase of disfluent speech as their brains race ahead of their mouths. Their thoughts are developing faster than their ability to form sentences.\n\n**What normal disfluency looks like:**\n- Repeating whole words: "I want-want-want that"\n- Hesitations: "I...um...want juice"\n- Revisions: "I want the — no, give me the red one"\n\n**What to do:**\n- **Do NOT finish their sentences** or say "slow down" or "take a breath." This creates anxiety around speaking.\n- **Model slow, relaxed speech** yourself. When you speak slowly and calmly, {{child_name}} naturally mirrors it.\n- **Give full attention** when they speak. Eye contact, patience, no rushing.\n- **Do NOT draw attention to it**. Never say "You are stuttering again."\n\n**Most children outgrow this within 6-12 months.** However, if the disfluency persists beyond 6 months, involves physical tension (face scrunching, foot stamping), or {{child_name}} avoids speaking, that warrants evaluation by Dr. {{doctor_name}}.',
      boundary: false,
    },
    when_to_worry: {
      questionPatterns: [
        'when to worry', 'red flags', 'is this serious', 'autism signs', 'should I be concerned',
        'not meeting milestones', 'regression',
      ],
      response:
        'I appreciate you asking this important question. While I can share general developmental guidance, assessing whether {{child_name}}\'s specific pattern is concerning requires clinical evaluation by Dr. {{doctor_name}}.\n\nSpeech development varies widely, and home stimulation protocols like ours help many children catch up. However, certain patterns do warrant prompt medical evaluation.\n\n**Please contact Dr. {{doctor_name}} if you notice any of the following:**\n- Loss of previously acquired words or skills (regression)\n- No babbling by 12 months\n- No response to their name by 12 months\n- No single words by 16-18 months\n- No two-word phrases by 24 months\n- Difficulty understanding simple instructions by age 2\n- Limited eye contact or social engagement\n\n**These are medical assessments that I cannot make.** Dr. {{doctor_name}} may recommend a formal developmental evaluation, hearing test, or speech-language pathology assessment.\n\nYour daily speech exercise logs in SKIDS provide valuable data for this assessment.',
      boundary: true,
    },
    comparison_with_peers: {
      questionPatterns: [
        'other children talking more', 'cousin speaks better', 'compared to classmates',
        'behind other kids', 'neighbour child talks more', 'school says behind',
      ],
      response:
        'Comparing children is the most natural thing parents do — and one of the most stressful. But here is the truth: **speech development has an enormous normal range**, and comparisons rarely tell the full story.\n\n**Why comparisons are misleading:**\n- Girls tend to speak earlier than boys on average — but this says nothing about individual children.\n- First-born children often speak earlier because they get more one-on-one adult interaction. Younger siblings may speak later but often understand more.\n- Bilingual children may seem "behind" in one language but are building two language systems simultaneously.\n- Some children are "watchers" who absorb language for months before suddenly speaking in full sentences.\n\n**What actually matters:**\n- Is {{child_name}} understanding language? (Comprehension develops before expression.)\n- Is {{child_name}} communicating needs through gestures, pointing, or sounds?\n- Is there progress over weeks and months, even if slow?\n\n**The Indian pressure trap**: In India, there is enormous pressure for children to perform early — speaking, reading, even knowing alphabets before age 3. This pressure does NOT help speech development. Stress and anxiety actually slow language acquisition.\n\n{{child_name}} is on a structured speech stimulation protocol prescribed by Dr. {{doctor_name}}. Focus on consistent daily practice, not comparisons. Progress is measured against {{child_name}}\'s own baseline, not against other children.',
      followUp: 'Has {{child_name}} shown any progress in the past few weeks, even small ones?',
      boundary: false,
    },
  },
}

// ── 3B: Speech — USA/AAP ──

const speechStimAAP: InterventionProtocol = {
  ...speechBase,
  id: 'proto_speech_aap_v1',
  slug: 'speech-stim-aap',
  name: 'Speech Stimulation Protocol (AAP)',
  region: 'usa',
  protocolAuthority: 'AAP',
  parentLocale: 'en',
  description:
    'Structured home-based speech and language stimulation protocol for children aged 1-6 years with identified speech/language delay, following AAP developmental screening and Early Intervention (Part C/Part B) recommendations. Emphasises play-based language learning, responsive parenting strategies, screen time limits, and daycare/preschool integration. Protocol aligns with ASHA (American Speech-Language-Hearing Association) parent coaching evidence for home language stimulation.',
  evidenceBase:
    'AAP Policy Statement: "Identification, Evaluation, and Management of Children with Autism Spectrum Disorder" (Pediatrics, 2020). ASHA Practice Portal: Late Language Emergence. Hoff E, "The Specificity of Environmental Influence" (Child Development, 2003). Fenson L et al., MacArthur-Bates Communicative Development Inventories (CDI). AAP Council on Communications: "Media Use in School-Aged Children and Adolescents" (Pediatrics, 2016). IDEA Part C Early Intervention Services guidelines.',
  prevalenceNotes:
    'Speech/language delay is the most common developmental concern in US pediatric practice, affecting 5-10% of preschool-age children. Universal developmental screening at 9, 18, and 30 months recommended by AAP. Early Intervention services (Part C, birth-3) available in all states.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'speech_exercise',
      title: 'Speech Stimulation Exercise',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Spend {{daily_exercise_minutes}} minutes in focused one-on-one speech practice with {{child_name}}. Get on their level (floor, eye-to-eye). Use play-based strategies: narrate play ("The car is going UP the ramp!"), expand their words ("Dog!" → "Yes, big brown dog!"), and use wait time — pause and look expectant after a prompt to encourage {{child_name}} to communicate.',
      durationMinutes: 15,
      successCriteria: 'Completed focused play-based speech exercise at child\'s level',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['child_not_talking_yet', 'bilingual_confusion', 'screen_time_and_speech'],
    },
    {
      key: 'narration_time',
      title: 'Daily Narration (Self-Talk/Parallel Talk)',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'During one daily routine (mealtime, bath time, dressing, grocery store), narrate what you are doing in simple, clear sentences. "I\'m putting your shoes on. First the left foot. Now the right foot. All done!" This floods {{child_name}}\'s brain with language in a natural context.',
      durationMinutes: 15,
      successCriteria: 'Narrated at least one daily routine with simple, clear language',
      loggingType: 'done_skip' as const,
      coachingTopics: ['child_not_talking_yet', 'comparison_with_peers'],
    },
    {
      key: 'reading_time',
      title: 'Shared Book Reading',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Read together for 10-15 minutes. Use dialogic reading: point to pictures, ask questions ("What\'s that?"), expand responses ("Yes! That\'s a fire truck. WEEE-OOO!"). Let {{child_name}} turn pages and choose books. Board books, touch-and-feel books, and lift-the-flap books are great for younger children.',
      durationMinutes: 15,
      successCriteria: 'Completed shared reading session with interactive elements',
      loggingType: 'done_skip' as const,
      coachingTopics: ['stuttering_normal'],
    },
  ],
  escalationRules: speechEscalations,
  customizableParams: speechParams,
  coachingPlaybook: {
    child_not_talking_yet: {
      questionPatterns: [
        'not talking yet', 'no words', 'only babbling', 'when will they talk',
        'silent child', 'late talker',
      ],
      response:
        'The waiting can feel endless, and your concern shows how attentive you are as a parent. Here is the evidence-based perspective:\n\nSpeech develops on a continuum. Some children are "late talkers" who catch up, while others benefit significantly from early intervention. Dr. {{doctor_name}} has identified that {{child_name}} needs structured support, and the home exercises we are doing are a critical part of that.\n\n**What you can do right now:**\n- **Talk, talk, talk.** Research shows that the QUANTITY of words a child hears directly predicts vocabulary size. Narrate your day constantly.\n- **Respond to ALL communication.** Pointing, grunting, gesturing — these are {{child_name}} communicating. Respond as if they spoke: "You want the ball? Here is the ball!"\n- **Expand, do not correct.** If {{child_name}} says "bah" for ball, say "Yes, BALL! You want the ball!" Never say "That is not how you say it."\n- **Use wait time.** After asking a question or offering a prompt, wait 5-10 seconds. That silence creates space for {{child_name}} to attempt a response.\n- **Limit screens.** AAP recommends zero screen time under 18 months and limited co-viewed content after. Screens are the number one competitor for interactive talk time.\n- **Play on the floor.** Get at {{child_name}}\'s eye level during play. Face-to-face interaction is where language grows.\n\nIf your state offers Early Intervention (Part C for under 3, Part B for 3-5), these free services can supplement home exercises.',
      followUp: 'Is {{child_name}} using gestures like pointing, waving, or nodding?',
      boundary: false,
    },
    bilingual_confusion: {
      questionPatterns: [
        'bilingual confusion', 'two languages confusing', 'which language', 'mixing languages',
        'should we stick to one language', 'heritage language',
      ],
      response:
        'This is one of the most persistent myths in child development, and I want to bust it clearly: **Bilingualism does NOT cause speech delay.** Decades of research confirms this.\n\nHere is what the science says:\n- Bilingual children hit language milestones at the same time as monolingual children.\n- They may have a smaller vocabulary in each individual language, but their TOTAL vocabulary (both languages combined) is equal to or larger than monolingual peers.\n- Code-switching (mixing languages) is a sign of linguistic sophistication, not confusion. Even adult bilinguals do it!\n- The bilingual brain develops enhanced executive function — better attention, cognitive flexibility, and problem-solving.\n\n**What to do for {{child_name}}:**\n- **Do not drop your heritage language.** It is part of {{child_name}}\'s identity, family connection, and cognitive development.\n- **Be intentional**: "One parent, one language" works for many families. Or use the heritage language at home and English will come from school/daycare.\n- **Do not force English-only** because you think it will help speech development. It will not, and it may harm {{child_name}}\'s connection to family and culture.\n- **Read to {{child_name}} in both languages.** Libraries often have bilingual children\'s books.\n\nThe ASHA position statement explicitly supports maintaining bilingualism during speech therapy. Dr. {{doctor_name}} can guide on any specific language strategies for {{child_name}}.',
      boundary: false,
    },
    screen_time_and_speech: {
      questionPatterns: [
        'screen time', 'TV and speech', 'phone and language', 'educational apps',
        'baby Einstein', 'cocomelon', 'YouTube kids',
      ],
      response:
        'Screen time and speech development is one of the most important topics for parents today. The research is unambiguous: **excessive screen time is strongly associated with speech and language delays.**\n\n**Why screens hurt speech development:**\n- Language develops through INTERACTIVE, back-and-forth conversation ("serve and return"). Screens are passive — they serve, but the child cannot return.\n- Every hour on a screen is an hour NOT spent in conversation, play, and exploration.\n- Background TV reduces both the quantity and quality of parent-child interactions — even when no one is actively watching.\n- The AAP\'s landmark study found that children exposed to more than 2 hours/day of screens had 6x higher rates of language delay.\n\n**AAP recommendations:**\n- Under 18 months: NO screen time (video chat with family excepted).\n- 18-24 months: Only high-quality programming (Sesame Street, Daniel Tiger), always co-viewed with a talking parent.\n- 2-5 years: Maximum 1 hour per day of high-quality content.\n\n**Practical swaps:**\n- Replace 15 minutes of screen time with the SKIDS speech exercises — same entertainment, but interactive.\n- During meals: screens OFF, conversation ON. Mealtime talk is a huge language opportunity.\n- In the car: sing songs, play "I Spy," or listen to audiobooks together instead of handing over a device.\n- If childcare providers use screens extensively, discuss limits.\n\nStart with one screen-free swap per day. Small changes compound into big language gains.',
      boundary: false,
    },
    stuttering_normal: {
      questionPatterns: [
        'stuttering', 'stammering', 'repeating words', 'disfluent', 'can\'t get words out',
      ],
      response:
        'Stuttering or disfluent speech is very common in young children — approximately 5% of children experience a phase of disfluency, usually between ages 2 and 5.\n\n**What normal developmental disfluency looks like:**\n- Whole-word repetitions: "Can-can-can I have it?"\n- Phrase revisions: "I want the — no, give me that one"\n- Filler words: "Um, uh, well..."\n\n**How to respond (evidence-based "Demands and Capacities" model):**\n- **Slow your own speech.** When you model slow, relaxed talking, {{child_name}} mirrors it.\n- **Never say "slow down," "think first," or "take a breath."** These well-meaning instructions increase speech anxiety.\n- **Do not finish their sentences.** Wait patiently with warm eye contact.\n- **Reduce questions.** Instead of rapid-fire "What did you do? Where did you go?" try commenting: "It looks like you had fun today."\n- **Protect their talk time.** Make sure siblings or peers are not talking over {{child_name}}.\n\n**When to escalate (ASHA guidelines):**\n- Disfluency lasting more than 6 months\n- Physical tension during speaking (face scrunching, fist clenching)\n- {{child_name}} avoids speaking or says "I can\'t say it"\n- Sound/syllable repetitions (more concerning than whole-word repetitions)\n\nIf any of these occur, note them in your log and Dr. {{doctor_name}} may refer to a speech-language pathologist.',
      boundary: false,
    },
    when_to_worry: {
      questionPatterns: [
        'when to worry', 'red flags', 'autism signs', 'should I be concerned',
        'not meeting milestones', 'regression', 'losing words',
      ],
      response:
        'Your instinct to ask this question matters — parents often notice things before anyone else. However, determining whether {{child_name}}\'s specific pattern is concerning requires clinical evaluation by Dr. {{doctor_name}}.\n\nThis is a medical question that goes beyond what home coaching can assess.\n\n**Please contact Dr. {{doctor_name}} if you observe:**\n- Loss of previously acquired words or skills at any age\n- No babbling by 12 months\n- No pointing or gesturing by 12 months\n- No single words by 16 months\n- No spontaneous two-word phrases by 24 months\n- Significant difficulty understanding simple directions by age 2\n- Limited eye contact, joint attention, or social engagement\n- Not responding to name consistently\n\n**Your state likely offers free evaluations:**\n- Under 3: Early Intervention (Part C of IDEA) — free developmental evaluation. Contact your state\'s early intervention program.\n- Ages 3-5: Your local school district must evaluate for free (Part B of IDEA) and provide services if eligible.\n\nDr. {{doctor_name}} can make appropriate referrals and determine whether additional assessment is needed.',
      boundary: true,
    },
    comparison_with_peers: {
      questionPatterns: [
        'other kids talking more', 'behind classmates', 'cousin talks better',
        'daycare teacher concerned', 'compared to other children',
      ],
      response:
        'Comparing is human nature, especially when you are worried. But speech development has one of the widest "normal" ranges of any milestone. Here is the perspective:\n\n**Why comparisons are misleading:**\n- Girls tend to develop language slightly earlier than boys on average.\n- Children in language-rich environments (lots of conversation, reading, less screen time) tend to develop language faster — this is about INPUT, not the child\'s capability.\n- First-born children get more one-on-one adult interaction; later-born children may talk later but understand just as much.\n- Bilingual children may seem "behind" in one language but are building two complete language systems.\n\n**What IS meaningful to track:**\n- Progress over time against {{child_name}}\'s own baseline (this is exactly what SKIDS tracks).\n- Comprehension — does {{child_name}} understand more than they can say? (Receptive language usually leads expressive.)\n- Communication intent — is {{child_name}} trying to communicate through any means (gestures, sounds, eye contact)?\n\n**If daycare/preschool teachers raise concerns**, take them seriously. Teachers see hundreds of children and have a strong comparative baseline. Share their observations with Dr. {{doctor_name}}.\n\nYour job right now is to provide consistent, daily language input through the exercises. Focus on {{child_name}}\'s week-over-week progress, not on how they compare to the child next door.',
      followUp: 'Has the teacher/daycare shared specific observations you would like to discuss?',
      boundary: false,
    },
  },
}

// ── 3C: Speech — GCC/Gulf_AP ──

const speechStimGulf: InterventionProtocol = {
  ...speechBase,
  id: 'proto_speech_gulf_v1',
  slug: 'speech-stim-gulf',
  name: 'Speech Stimulation Protocol (Gulf)',
  region: 'gcc',
  protocolAuthority: 'Gulf_AP',
  parentLocale: 'en',
  description:
    'Structured home-based speech and language stimulation protocol for children aged 1-6 years with identified speech/language delay, adapted for Gulf Cooperation Council family contexts. Addresses Arabic-English bilingual development, nanny/caregiver language input quality, cultural greeting scripts and social language expectations, and indoor-focused activity planning for hot climate months. Protocol emphasises parent-led interaction over caregiver-mediated screen time.',
  evidenceBase:
    'Gulf Pediatric Society Developmental Guidelines (2021). Paradis J et al., "Dual Language Development and Disorders" (2nd ed, 2011). ASHA Position Statement on Bilingual Service Delivery. Saiegh-Haddad E, "Linguistic Complexity and Literacy Development: The Case of Arabic" (Lang Learn, 2018). UAE Ministry of Education Early Years Framework (2020).',
  prevalenceNotes:
    'Speech delay prevalence in GCC estimated at 5-10% of preschool children. Contributing factors: extensive caregiver/nanny-mediated care reducing parent-child verbal interaction, high screen time in climate that favours indoor activities, and bilingual Arabic-English environment.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'speech_exercise',
      title: 'Speech Stimulation Exercise',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Spend {{daily_exercise_minutes}} minutes in focused one-on-one speech practice with {{child_name}}. This must be PARENT-led (not nanny). Sit face-to-face. Use Arabic nursery rhymes, name objects, play turn-taking games, and model clear speech. If using English too, keep sessions separate: Arabic exercise first, then English, not mixed in one session.',
      durationMinutes: 15,
      successCriteria: 'Parent completed focused one-on-one speech exercise (not delegated to nanny)',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['child_not_talking_yet', 'bilingual_confusion', 'screen_time_and_speech'],
    },
    {
      key: 'narration_time',
      title: 'Daily Narration (Self-Talk/Parallel Talk)',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'During one daily routine (mealtime, bath, dressing, going to the mall), narrate what you are doing in simple Arabic or English. "We are putting on your thobe/dress. White thobe! Arms in. Bismillah, all done!" Include culturally relevant vocabulary: greetings (As-salamu alaykum), family terms (baba, mama, teta, jiddo), daily prayers.',
      durationMinutes: 15,
      successCriteria: 'Narrated at least one daily routine in simple clear language',
      loggingType: 'done_skip' as const,
      coachingTopics: ['child_not_talking_yet', 'comparison_with_peers'],
    },
    {
      key: 'reading_time',
      title: 'Book/Story Time',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Read a picture book together for 10-15 minutes. Arabic and English books are both valuable. Point to pictures and name them. Ask {{child_name}} to point to objects. For older children, discuss what is happening in the story. Arabic children\'s books from Kalimat, Asala, or Dar Al Muna are excellent.',
      durationMinutes: 15,
      successCriteria: 'Completed shared reading/picture-naming session',
      loggingType: 'done_skip' as const,
      coachingTopics: ['bilingual_confusion', 'stuttering_normal'],
    },
  ],
  escalationRules: speechEscalations,
  customizableParams: speechParams,
  coachingPlaybook: {
    child_not_talking_yet: {
      questionPatterns: [
        'not talking yet', 'no words', 'only babbling', 'when will they talk',
        'silent child', 'nanny speaks different language',
      ],
      response:
        'I understand your concern. Waiting for {{child_name}} to speak is stressful, especially when you see other children talking. Dr. {{doctor_name}} has prescribed speech stimulation because early intervention during this period is most effective.\n\n**Critical actions for Gulf families:**\n\n**1. Parent interaction is irreplaceable.** In many Gulf households, children spend significant time with nannies whose first language may be Tagalog, Hindi, Sinhalese, or Amharic. While nannies provide wonderful care, {{child_name}} needs consistent exposure to Arabic (and/or English) from PARENTS and family members. The speech exercises must be parent-led.\n\n**2. Reduce screen time aggressively.** In the Gulf climate, it is tempting to use screens to keep children occupied indoors. But TV and tablets are the biggest barrier to speech development. Replace at least 30 minutes of screen time with interactive play.\n\n**3. Talk, talk, talk.** Narrate your day in Arabic: at the grocery store, during cooking, at the mosque, during car rides. Every sentence {{child_name}} hears builds their language brain.\n\n**4. Respond to ALL communication.** If {{child_name}} points at water, say "Mayy! You want mayy? Here is the mayy." Do not just hand it over silently.\n\n**5. Cultural language is powerful.** Teaching "As-salamu alaykum," "Bismillah," "Alhamdulillah" — these repetitive, meaningful phrases are excellent early language targets.\n\nConsistency over weeks and months is what produces results. Daily practice with SKIDS will build the pathways {{child_name}} needs.',
      followUp: 'How much of {{child_name}}\'s day is spent with family members vs. caregiver?',
      boundary: false,
    },
    bilingual_confusion: {
      questionPatterns: [
        'Arabic and English confusing', 'too many languages', 'which language', 'nanny language',
        'should we use only Arabic', 'mixing Arabic and English',
      ],
      response:
        '**Bilingualism does NOT cause speech delay.** This is a myth, and research in Arabic-English bilingual children specifically confirms it.\n\nHere is what you need to know for Gulf families:\n\n**Arabic-English bilingualism is an asset.** Children raised with both languages develop enhanced cognitive flexibility. The key is providing strong input in both languages.\n\n**The nanny language question:** If your nanny speaks Tagalog, Hindi, or another language to {{child_name}}, this adds a third language input. While children CAN handle this, it is important that the PRIMARY languages (Arabic and English) get the most exposure. Ask the nanny to speak to {{child_name}} in English (or Arabic, if they are proficient) during childcare hours.\n\n**Practical approach:**\n- **Arabic at home with family.** This is {{child_name}}\'s heritage language and emotional anchor.\n- **English for school/international environment.** It will come naturally through preschool and community.\n- **Keep speech exercises consistent.** If doing Arabic exercises, stay in Arabic for that session. Do not switch mid-activity.\n- **Code-mixing is NORMAL.** "I want mayy" (mixing English and Arabic for water) is not confusion — it is bilingual competence.\n\n**Do not sacrifice Arabic for English.** Strong Arabic foundation actually helps English acquisition later. Both languages are valuable.',
      boundary: false,
    },
    screen_time_and_speech: {
      questionPatterns: [
        'screen time', 'iPad and speech', 'cartoons', 'YouTube', 'too much screen',
        'educational apps Arabic',
      ],
      response:
        'Screen time is one of the biggest challenges for speech development in Gulf families, where the hot climate means children spend many months indoors with easy access to devices.\n\n**The evidence is clear: excessive screen time delays speech development.** Every hour on a screen replaces an hour of interactive conversation.\n\n**Why this matters especially in the GCC:**\n- Hot weather (6+ months/year) means children are indoors more, and screens become the default activity.\n- Children who spend significant time with caregivers may get screen time as a pacifier.\n- Arabic educational content is limited compared to English, so children often watch content they cannot fully understand.\n\n**Screen time limits:**\n- Under 2 years: NO screen time (except family video calls).\n- 2-5 years: Maximum 1 hour per day, co-viewed with a parent who TALKS about what is happening.\n\n**Indoor alternatives for Gulf families:**\n- Arabic nursery rhymes and songs (sing together, not via YouTube)\n- Play-doh, kinetic sand, building blocks, puzzles\n- Indoor obstacle courses\n- Cooking together (narrate every step)\n- Mall walks with language-rich narration\n- Play dates with Arabic-speaking peers\n\nAsk your nanny to replace 1 screen session per day with an interactive activity. Start small — replacing 20 minutes makes a difference.',
      boundary: false,
    },
    stuttering_normal: {
      questionPatterns: [
        'stuttering', 'stammering', 'repeating words', 'stuck on words', 'fluency',
      ],
      response:
        'Developmental disfluency (normal stuttering) is very common between ages 2-5. About 5% of all children go through a phase where their brain races ahead of their mouth.\n\n**What is normal:**\n- Whole-word repetitions: "Ana-ana-ana ureed" (I-I-I want)\n- Hesitations and revisions\n- This is the same in Arabic and English — it is a brain-speed issue, not a language issue.\n\n**How to respond:**\n- **Slow your own speech.** Speak in relaxed, measured sentences. {{child_name}} mirrors your pace.\n- **Never say "slow down" or "think first."** This creates speech anxiety.\n- **Wait patiently** with warm eye contact. Do not finish their sentences.\n- **Reduce rapid-fire questions.** Instead of asking questions, make comments and wait.\n\n**In bilingual children**, disfluency may appear more in one language (usually the less-dominant one). This is expected and not a sign of confusion.\n\n**When to alert Dr. {{doctor_name}}:**\n- Disfluency persisting beyond 6 months\n- Physical tension during speaking\n- {{child_name}} avoiding speaking or becoming frustrated\n- Sound/syllable repetitions (stuttering on individual sounds, not whole words)',
      boundary: false,
    },
    when_to_worry: {
      questionPatterns: [
        'when to worry', 'red flags', 'autism', 'should I be concerned', 'regression',
        'losing words',
      ],
      response:
        'Your concern as a parent is important, and you know {{child_name}} better than anyone. However, determining whether specific developmental patterns are concerning requires clinical evaluation by Dr. {{doctor_name}}.\n\nThis is a medical assessment question that goes beyond home coaching.\n\n**Please contact Dr. {{doctor_name}} promptly if you observe:**\n- Loss of previously acquired words or skills\n- No babbling by 12 months\n- No pointing or gesturing by 12 months\n- No single words by 16-18 months\n- No two-word combinations by 24 months\n- Limited eye contact or social engagement\n- Not responding to name in any language\n\n**In the GCC, developmental services are available:**\n- UAE: Early intervention centres in Abu Dhabi, Dubai, Sharjah (many free for nationals)\n- Saudi Arabia: Ministry of Health early intervention programs\n- Qatar: Shafallah Centre, Hamad Medical Corporation developmental services\n\nDr. {{doctor_name}} can arrange formal developmental evaluation and refer to speech-language pathology if needed. Your SKIDS logs provide valuable data for this assessment.',
      boundary: true,
    },
    comparison_with_peers: {
      questionPatterns: [
        'other children talking more', 'cousin talks better', 'behind at nursery',
        'compared to others', 'nursery teacher concerned',
      ],
      response:
        'Comparisons are natural but often misleading. Speech development has one of the widest normal ranges of any childhood milestone.\n\n**Why comparisons in Gulf families can be especially stressful:**\n- Extended family gatherings are frequent. Seeing a cousin the same age talking fluently while {{child_name}} is quieter naturally causes worry.\n- Cultural expectations for early verbal politeness (greetings, proper responses to elders) may highlight delays.\n- International school environments mean {{child_name}} is compared across different language backgrounds.\n\n**What actually matters:**\n- Progress over time (tracked in SKIDS) — not comparison to other children.\n- Comprehension before expression: does {{child_name}} understand Arabic and/or English even if not speaking much?\n- Communication intent: is {{child_name}} trying to communicate through any means?\n\n**Important cultural note:** In some Gulf families, there is a tendency to wait ("Boys talk late," "Their father also spoke late"). While some late talkers do catch up, Dr. {{doctor_name}} has recommended intervention because the evidence shows that structured stimulation during this window produces the best outcomes.\n\nFocus on consistent daily practice. Every session builds pathways. {{child_name}}\'s progress is measured against their own starting point.',
      followUp: 'Has {{child_name}} shown any new words or communication attempts recently?',
      boundary: false,
    },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// 4. BEHAVIORAL ROUTINE — SLEEP/TANTRUMS
// ════════════════════════════════════════════════════════════════════════════

const behavioralBase = {
  category: 'behavioral' as const,
  subspecialty: 'behavior_ai' as const,
  conditionName: 'Behavioral Regulation Challenges (Sleep/Tantrums)',
  icd10: 'F98.9',
  defaultDurationDays: 60,
  defaultFrequency: 'daily' as const,
  ageRangeMin: 18,
  ageRangeMax: 96,
  version: 1,
}

const behavioralEscalations = [
  {
    trigger: 'compliance_below_50',
    condition: { metric: 'compliance_pct', operator: 'lt' as const, value: 50, windowDays: 7 },
    severity: 'warning' as const,
    titleTemplate: 'Low behavioral routine compliance for {{child_name}}',
    detailTemplate:
      '{{child_name}}\'s behavioral routine compliance is {{compliance_pct}}% over the past 7 days. Behavioral interventions require consistent daily practice to be effective. Family may need support with implementation.',
  },
  {
    trigger: 'behavior_severity_increase',
    condition: { metric: 'parent_concern_level', operator: 'gt' as const, value: 7 },
    severity: 'urgent' as const,
    titleTemplate: 'Escalating behavioral concerns for {{child_name}}',
    detailTemplate:
      'Parent concern level is {{parent_concern_level}}/10. Reported behaviors may be escalating in intensity or frequency despite intervention. Clinical reassessment recommended within 48 hours.',
  },
  {
    trigger: 'boundary_hits_high',
    condition: { metric: 'boundary_hits', operator: 'gt' as const, value: 3, windowDays: 7 },
    severity: 'info' as const,
    titleTemplate: 'Multiple medical-scope questions about {{child_name}}\'s behavior',
    detailTemplate:
      'Parent has asked {{boundary_hits}} questions exceeding coaching scope this week. Topics: {{boundary_topics}}. May benefit from a dedicated behavioral consultation.',
  },
  {
    trigger: 'consecutive_skips',
    condition: { metric: 'consecutive_skips', operator: 'gt' as const, value: 3 },
    severity: 'warning' as const,
    titleTemplate: '4+ consecutive routine days skipped for {{child_name}}',
    detailTemplate:
      '{{child_name}} has missed {{consecutive_skips}} consecutive days of the behavioral routine. Consistency is critical for behavior change. Family may be overwhelmed.',
  },
  {
    trigger: 'self_harm_concern',
    condition: { metric: 'parent_concern_level', operator: 'gt' as const, value: 9 },
    severity: 'urgent' as const,
    titleTemplate: 'Urgent behavioral concern for {{child_name}}',
    detailTemplate:
      'Parent concern level is critical ({{parent_concern_level}}/10). Potential safety concerns reported. Immediate clinical contact recommended.',
  },
]

const behavioralParams = [
  {
    key: 'routine_type',
    type: 'select' as const,
    defaultValue: 'both',
    label: 'Focus Area',
    options: ['sleep', 'tantrums', 'both'],
  },
  {
    key: 'bedtime_target',
    type: 'text' as const,
    defaultValue: '8:30 PM',
    label: 'Target Bedtime',
  },
  {
    key: 'morning_target',
    type: 'text' as const,
    defaultValue: '7:00 AM',
    label: 'Target Wake Time',
  },
]

// ── 4A: Behavioral — India/IAP ──

const behavioralRoutineIAP: InterventionProtocol = {
  ...behavioralBase,
  id: 'proto_behavioral_iap_v1',
  slug: 'behavioral-routine-iap',
  name: 'Behavioral Routine Protocol (IAP)',
  region: 'india',
  protocolAuthority: 'IAP',
  parentLocale: 'en',
  description:
    'Structured behavioral routine protocol for children aged 18 months to 8 years with sleep difficulties and/or tantrum management needs, adapted for Indian joint family contexts. Addresses co-sleeping norms, grandparent involvement and potential undermining of boundaries, academic pressure as a behavioral trigger, and culturally appropriate positive discipline strategies. Aligned with IAP Guidelines on Behavioral Pediatrics.',
  evidenceBase:
    'IAP Guidelines on Behavioral Pediatrics and Sleep (2018). Mindell JA et al., "Behavioral Treatment of Bedtime Problems and Night Wakings: An American Academy of Sleep Medicine Review" (Sleep, 2006). Indian Journal of Pediatrics — "Sleep Patterns and Sleep Problems in Indian Children" (2014). Kazdin AE, "Parent Management Training: Treatment for Oppositional, Aggressive, and Antisocial Behavior in Children and Adolescents" (2005).',
  prevalenceNotes:
    'Sleep problems affect 20-30% of Indian children. Tantrums are developmentally normal at ages 1-4 but become clinically significant when severe, prolonged, or persisting beyond age 5. Joint family dynamics and inconsistent discipline between caregivers are common exacerbating factors.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'morning_routine',
      title: 'Morning Routine Practice',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Follow the morning routine with {{child_name}}: wake by {{morning_target}}, bathroom, brush teeth, get dressed, breakfast. Use a visual schedule chart (pictures for younger children). Give 2-minute warnings before transitions. Praise each completed step: "Great job getting dressed by yourself!"',
      durationMinutes: 45,
      successCriteria: 'Morning routine completed with structure and positive reinforcement',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['tantrum_strategies', 'consistency_is_key', 'grandparent_undermining'],
    },
    {
      key: 'bedtime_routine',
      title: 'Bedtime Routine',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Start bedtime routine 30 minutes before {{bedtime_target}}. Follow the same sequence every night: no screens, warm bath/wash, change into night clothes, brush teeth, 1-2 story books or prayer, lights off. Stay calm and predictable. If {{child_name}} resists, acknowledge the feeling but hold the boundary: "I know you want to play more. It is bedtime now. We can play tomorrow."',
      durationMinutes: 30,
      successCriteria: 'Bedtime routine followed with consistent sequence and calm boundary-holding',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['sleep_resistance', 'screen_as_pacifier', 'consistency_is_key'],
    },
    {
      key: 'emotion_check_in',
      title: 'Emotion Check-In',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Once during the day, do a brief emotion check-in with {{child_name}}. For younger children: "Are you feeling happy, sad, or angry right now?" with emotion faces. For older children: "How was your day? What was the best part? What was hard?" This builds emotional vocabulary and helps {{child_name}} identify feelings before they become tantrums.',
      durationMinutes: 5,
      successCriteria: 'Completed brief emotion check-in with child',
      loggingType: 'done_skip' as const,
      coachingTopics: ['tantrum_strategies', 'hitting_biting'],
    },
    {
      key: 'behavior_log',
      title: 'Daily Behavior Log',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'At the end of the day, log: Did any tantrums/meltdowns occur? What triggered them? How long did they last? How did you respond? Rate the overall day 1-5. This data helps Dr. {{doctor_name}} track patterns and adjust the approach.',
      durationMinutes: 5,
      successCriteria: 'Logged behavioral observations for the day',
      loggingType: 'value_entry' as const,
      coachingTopics: ['when_behavior_is_red_flag'],
    },
  ],
  escalationRules: behavioralEscalations,
  customizableParams: behavioralParams,
  coachingPlaybook: {
    tantrum_strategies: {
      questionPatterns: [
        'tantrum', 'meltdown', 'screaming', 'throwing things', 'out of control',
        'crying for hours', 'how to handle tantrum',
      ],
      response:
        'Tantrums are one of the most exhausting parts of parenting, and in a joint family setting where everyone has an opinion, it can feel even harder. Here is an evidence-based approach that works:\n\n**During the tantrum:**\n1. **Stay calm.** Your calm is {{child_name}}\'s anchor. Take a breath. Lower your voice, do not raise it.\n2. **Ensure safety.** Move {{child_name}} away from anything dangerous. Do not restrain unless they are hurting themselves.\n3. **Do not try to reason.** During a tantrum, the emotional brain has taken over. Logic will not work until {{child_name}} calms down.\n4. **Acknowledge the feeling, hold the boundary.** "I can see you are very angry that you cannot have the toy. It is okay to be angry. But we are not buying it today." Name the emotion.\n5. **Stay present.** Do not walk away unless you are about to lose your own temper. Sitting nearby without engaging sends the message: "I am here when you are ready."\n\n**After the tantrum (when calm):**\n- Reconnect with a hug or gentle words: "That was a big feeling, wasn\'t it?"\n- Briefly label what happened: "You were angry because you wanted ice cream before dinner."\n- Offer a better strategy for next time: "Next time you feel angry, you can tell me \'I am angry\' instead of screaming."\n\n**In the Indian family context:** Ask all family members to respond consistently. If Mama says no and Dadi says yes, {{child_name}} learns that tantrums work — because sometimes they do!',
      followUp: 'What usually triggers {{child_name}}\'s worst tantrums?',
      boundary: false,
    },
    hitting_biting: {
      questionPatterns: [
        'hitting', 'biting', 'kicking', 'aggressive', 'hurting others', 'hitting other children',
        'biting at school',
      ],
      response:
        'Hitting and biting are common in toddlers and young children — they often do not yet have the language skills to express frustration, so they use their bodies instead. It is NOT a sign of bad parenting or a "bad child."\n\n**Immediate response:**\n- Calmly but firmly stop the behavior. Get down to eye level: "I cannot let you hit. Hitting hurts."\n- Remove {{child_name}} from the situation briefly (not as punishment, but as a reset).\n- Comfort the other child first — this teaches empathy and avoids reinforcing the behavior with attention.\n\n**Prevention strategies:**\n- **Teach words for feelings**: "You can say \'I am angry\' or \'That is mine!\' instead of hitting."\n- **Watch for triggers**: Tiredness, hunger, overstimulation, and transitions are common triggers. Address these before they escalate.\n- **Model gentle touch**: Show {{child_name}} how to touch gently — "Gentle hands, like this."\n- **Praise positive behaviour**: Catch {{child_name}} being gentle and praise enthusiastically: "You shared your toy so nicely!"\n\n**In Indian homes:**\n- Physical discipline (slapping, spanking) is still common culturally but is NOT effective and increases aggression. IAP recommends positive discipline approaches.\n- If school complains about hitting, work WITH the school on a consistent approach. Ask what strategies they use so home and school match.\n\nConsistency across all caregivers is the key. This behavior typically improves significantly with language development.',
      boundary: false,
    },
    sleep_resistance: {
      questionPatterns: [
        'won\'t sleep', 'refuses to sleep', 'bedtime battles', 'up until midnight',
        'fights sleep', 'needs phone to sleep',
      ],
      response:
        'Bedtime resistance is incredibly common in Indian households, and the joint family setup can make it extra challenging. Here are evidence-based strategies:\n\n**The golden rule: CONSISTENCY.** The same routine, same time, same sequence, every single night. The brain learns to wind down through predictable patterns.\n\n**Build the routine (30 minutes before {{bedtime_target}}):**\n1. Screens OFF — no TV, phone, or tablet. This is non-negotiable. Blue light from screens suppresses melatonin.\n2. Warm bath or face wash — signals "day is ending."\n3. Change into night clothes.\n4. Brush teeth.\n5. 1-2 story books or a prayer/shloka — the same calming activity every night.\n6. Lights off, a song or gentle back pat, goodnight.\n\n**Common Indian challenges:**\n- **"Dadi lets them stay up when we visit"**: Respectfully explain that the doctor has prescribed this routine. One late night is okay, but the routine should be default.\n- **"We all sleep late in our family"**: Even if adults sleep late, {{child_name}} needs 10-12 hours (depending on age). Their brain grows during sleep.\n- **"They need the phone/TV to fall asleep"**: This is a crutch that worsens sleep quality. Replace with a book or song. The first 3-5 nights will be hard, then it gets easier.\n\n**Co-sleeping note:** Co-sleeping is the norm in many Indian families and is perfectly fine. The routine still applies — same time, same winding-down process, even if {{child_name}} sleeps in your bed.',
      followUp: 'What time is {{child_name}} currently falling asleep?',
      boundary: false,
    },
    consistency_is_key: {
      questionPatterns: [
        'not working', 'tried everything', 'nothing helps', 'behavior getting worse',
        'still having tantrums',
      ],
      response:
        'I hear your frustration. Behavioral change is genuinely hard, and it is normal for things to feel like they are not working, especially in the first 2-3 weeks.\n\n**The critical truth about behavior change:** It often gets WORSE before it gets better. This is called an "extinction burst." When {{child_name}} discovers that the old strategies (screaming, refusing, tantrums) are no longer getting the desired result, they will try HARDER for a while. This is actually a sign that the new boundaries are working.\n\n**The consistency equation:**\n- If the routine is followed 7/7 days, behavior typically improves in 2-3 weeks.\n- If followed 4-5/7 days, it takes 6-8 weeks and results are inconsistent.\n- If followed 2-3/7 days, it will not work. The child learns "if I push hard enough, the rule breaks."\n\n**The biggest challenge in Indian families:** Inconsistency between caregivers. If Papa enforces bedtime but Dadi does not, {{child_name}} learns to go to Dadi. ALL caregivers must be on the same page.\n\n**What to do:**\n1. Hold a family meeting. Explain that Dr. {{doctor_name}} prescribed this approach. It is not about being strict — it is about {{child_name}}\'s wellbeing.\n2. Post the routine chart somewhere visible — fridge, bedroom wall.\n3. Commit to 3 full weeks of consistency before evaluating whether it is "working."\n\nYou are doing the right thing. This is hard parenting, not bad parenting.',
      boundary: false,
    },
    grandparent_undermining: {
      questionPatterns: [
        'grandparent undermining', 'dadi spoiling', 'nani giving in', 'joint family problems',
        'in-laws not following', 'grandparents not listening', 'everyone has opinion',
      ],
      response:
        'This is perhaps the most uniquely Indian challenge in behavioral management. Joint families are a wonderful support system, but different discipline styles between parents and grandparents can confuse {{child_name}} and undermine consistency.\n\n**Understanding grandparents\' perspective:**\n- They love {{child_name}} and want them happy. Their "giving in" comes from love, not malice.\n- They may have raised children differently and feel their methods worked fine.\n- They may feel their role is to be the "soft" one while parents are the "strict" ones.\n\n**Strategies that work:**\n1. **Involve them, do not exclude them.** Share the SKIDS protocol with them. "The doctor prescribed this routine. We are all on the same team for {{child_name}}."\n2. **Give them a positive role.** "Dadi, you are the best at story time. Can you be in charge of the bedtime story every night?" This channels their involvement constructively.\n3. **Use the doctor\'s authority.** "Dr. {{doctor_name}} specifically said consistency from everyone is important. This is medical advice, not just our preference."\n4. **Pick your battles.** If grandparents follow 80% of the routine, that is a huge win. Focus on the critical elements (screen time, bedtime, tantrum response) and let small things go.\n5. **Acknowledge their experience.** "We know you raised us well. This approach builds on that with new research about child behavior."\n\nThis is a process, not a one-time conversation. Be patient, stay respectful, and keep reinforcing the plan.',
      followUp: 'Which family member is finding it hardest to follow the routine?',
      boundary: false,
    },
    screen_as_pacifier: {
      questionPatterns: [
        'screen to calm down', 'phone to stop crying', 'TV as reward', 'tablet to keep quiet',
        'screen before bed',
      ],
      response:
        'Using screens to calm a child or manage behavior is one of the most common parenting shortcuts — and one of the most counterproductive for behavioral development. I understand why it happens — it works immediately. But here is why it hurts long-term:\n\n**Why screens as pacifiers backfire:**\n- {{child_name}} never learns to self-regulate emotions. The screen does the regulating for them.\n- It creates a dependency: the child learns "if I melt down, I get screen time" — which actually INCREASES tantrums.\n- Screen time before bed suppresses melatonin and worsens sleep quality.\n- It replaces the development of coping skills (deep breathing, talking about feelings, creative play).\n\n**What to do instead:**\n- **During tantrums**: Stay present, acknowledge the emotion, wait it out. (See tantrum strategies.)\n- **During boredom**: Offer alternatives — blocks, drawing, playdough, a picture book. Yes, they will complain. That is okay. Boredom builds creativity.\n- **During waiting (restaurant, car)**: A small bag of activities — crayons, stickers, a small toy — is more effective than a phone.\n- **Before bed**: Replace screen time with a book, a song, or gentle conversation about the day.\n\n**The transition period**: When you remove screens as a behavioral tool, expect 3-5 days of increased resistance. Then {{child_name}} adapts and finds other ways to cope. This is growth.\n\nStart with one swap: replace the one daily screen-as-pacifier moment with an alternative. Build from there.',
      boundary: false,
    },
    when_behavior_is_red_flag: {
      questionPatterns: [
        'is this normal', 'behavior red flag', 'should I worry about behavior', 'ADHD',
        'autism behavior', 'something wrong', 'extreme tantrums', 'hurting self',
      ],
      response:
        'Thank you for raising this — distinguishing normal developmental behavior from red flags is a clinical question that Dr. {{doctor_name}} is best equipped to evaluate.\n\nWhile tantrums and sleep resistance are common and often normal, certain behavioral patterns warrant professional assessment. This is outside the scope of home coaching.\n\n**Please contact Dr. {{doctor_name}} if you observe:**\n- Tantrums lasting more than 25-30 minutes regularly\n- Self-injurious behavior (head-banging, biting self, hitting self)\n- Aggressive behavior that is escalating despite consistent positive discipline\n- Significant regression in previously achieved milestones\n- Extreme separation anxiety that interferes with daily functioning\n- Behaviors that are endangering {{child_name}} or others\n- Sleep disturbances accompanied by snoring, breathing pauses, or night terrors\n\n**Dr. {{doctor_name}} may recommend** a formal developmental or behavioral assessment to determine if underlying conditions (ADHD, ASD, anxiety, sensory processing issues) are contributing.\n\nYour daily behavior logs in SKIDS are extremely valuable data for this assessment.',
      boundary: true,
    },
  },
}

// ── 4B: Behavioral — USA/AAP ──

const behavioralRoutineAAP: InterventionProtocol = {
  ...behavioralBase,
  id: 'proto_behavioral_aap_v1',
  slug: 'behavioral-routine-aap',
  name: 'Behavioral Routine Protocol (AAP)',
  region: 'usa',
  protocolAuthority: 'AAP',
  parentLocale: 'en',
  description:
    'Structured behavioral routine protocol for children aged 18 months to 8 years with sleep difficulties and/or tantrum management needs, following AAP Bright Futures behavioral guidance and AASM pediatric sleep recommendations. Emphasises positive discipline, consistent routines, play-based emotion coaching, and screen time management. Designed for nuclear family contexts with possible daycare/preschool integration.',
  evidenceBase:
    'AAP Bright Futures: Guidelines for Health Supervision (4th Edition). AASM Clinical Practice Guideline: "Recommended Amount of Sleep for Pediatric Populations" (J Clin Sleep Med, 2016). Mindell JA et al., "Behavioral Treatment of Bedtime Problems and Night Wakings" (Sleep, 2006). AAP Policy Statement: "Effective Discipline to Raise Healthy Children" (Pediatrics, 2018). Webster-Stratton C, "The Incredible Years" parent training program evidence base.',
  prevalenceNotes:
    'Behavioral sleep problems affect 25-50% of US preschoolers. Tantrums are developmentally normal at ages 1-4 and typically peak at age 2-3. Approximately 5-10% of children have tantrums severe enough to warrant clinical intervention.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'morning_routine',
      title: 'Morning Routine Practice',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Follow the morning routine with {{child_name}}: wake by {{morning_target}}, bathroom, brush teeth, get dressed, breakfast. Use a visual schedule (pictures for toddlers, checklist for older kids). Give 2-minute and 5-minute warnings before transitions. Praise completed steps specifically: "You brushed your teeth all by yourself — awesome job!"',
      durationMinutes: 45,
      successCriteria: 'Morning routine completed with structure and specific positive reinforcement',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['tantrum_strategies', 'consistency_is_key'],
    },
    {
      key: 'bedtime_routine',
      title: 'Bedtime Routine',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Start bedtime routine 30 minutes before {{bedtime_target}}. Consistent sequence: screens off, bath/wash, pajamas, brush teeth, 2-3 books, lights off. Use a calm, firm tone. If {{child_name}} stalls, offer limited choices: "Do you want the blue pajamas or the red ones?" (not "Do you want to go to bed?").',
      durationMinutes: 30,
      successCriteria: 'Bedtime routine followed consistently with calm boundary-holding',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['sleep_resistance', 'screen_as_pacifier', 'consistency_is_key'],
    },
    {
      key: 'emotion_check_in',
      title: 'Emotion Check-In',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Do a brief emotion check-in with {{child_name}} once today. Use a feelings chart or ask "How are you feeling right now? Happy, sad, mad, or worried?" For older kids: "What was the best and hardest part of today?" Validate feelings: "It makes sense that you felt mad when that happened."',
      durationMinutes: 5,
      successCriteria: 'Completed emotion check-in and validated feelings',
      loggingType: 'done_skip' as const,
      coachingTopics: ['tantrum_strategies', 'hitting_biting'],
    },
    {
      key: 'behavior_log',
      title: 'Daily Behavior Log',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'End-of-day log: How many tantrums/meltdowns today? What triggered them? How long? How did you respond? Rate overall day 1-5. Note positive moments too. This ABC (Antecedent-Behavior-Consequence) data helps Dr. {{doctor_name}} identify patterns.',
      durationMinutes: 5,
      successCriteria: 'Logged behavioral observations including triggers and responses',
      loggingType: 'value_entry' as const,
      coachingTopics: ['when_behavior_is_red_flag'],
    },
  ],
  escalationRules: behavioralEscalations,
  customizableParams: behavioralParams,
  coachingPlaybook: {
    tantrum_strategies: {
      questionPatterns: [
        'tantrum', 'meltdown', 'screaming', 'throwing things', 'out of control',
        'how to handle tantrum',
      ],
      response:
        'Tantrums are one of the hardest parts of parenting. Here is what the evidence says works:\n\n**During the tantrum:**\n1. **Stay calm.** Your regulation is {{child_name}}\'s co-regulation. If you escalate, they escalate. Take a slow breath.\n2. **Ensure safety.** Move dangerous objects away. Do not restrain unless {{child_name}} is about to hurt themselves or others.\n3. **Name the emotion.** "You are SO angry right now. You wanted that toy and I said no. That is really frustrating." Emotional labeling helps the brain start processing.\n4. **Do not reason, negotiate, or lecture.** The emotional brain cannot process logic during a meltdown. Save the teaching for after.\n5. **Offer a choice when possible:** "Do you want to sit here until you feel better, or do you want a hug?" Choices restore some sense of control.\n\n**After (once calm):**\n- Reconnect. A hug, a lap sit, a quiet "That was a big feeling, huh?"\n- Briefly review: "You were angry because... Next time, you could tell me \'I\'m mad\' or squeeze your fist."\n- Move on. Do not hold grudges or bring it up repeatedly.\n\n**Prevention is the best strategy:**\n- Ensure basic needs are met (hunger, tiredness, overstimulation are top triggers).\n- Give transition warnings: "Five more minutes of play, then we clean up."\n- Offer choices throughout the day to build autonomy.\n- Catch good behavior: "You asked so nicely! That\'s great using your words."\n\nThe AAP\'s position: tantrums at age 2-3 are normal. They should decrease in frequency and intensity by age 4-5 with consistent positive discipline.',
      followUp: 'What usually triggers {{child_name}}\'s biggest meltdowns?',
      boundary: false,
    },
    hitting_biting: {
      questionPatterns: [
        'hitting', 'biting', 'kicking', 'aggressive', 'hurting others', 'pushing',
      ],
      response:
        'Physical aggression in toddlers and young children is developmentally common — their impulse control is still developing and they lack the vocabulary to express big feelings. It is NOT a sign that {{child_name}} is a "bad kid" or that you are failing as a parent.\n\n**In the moment:**\n- Calmly intervene. "I will not let you hit. Hitting hurts bodies." Use a firm, low voice — not yelling.\n- Briefly remove {{child_name}} from the situation. "Let\'s take a break over here."\n- Comfort the hurt child first — this naturally reduces attention to the aggressor.\n\n**Teaching alternatives (when calm):**\n- "When you feel angry, you can stamp your feet, squeeze a pillow, or say \'I\'m MAD!\'"\n- Practice these alternatives during calm moments. Role-play with stuffed animals.\n- Read books about feelings: "Hands Are Not for Hitting," "Teeth Are Not for Biting."\n\n**Important AAP guidance:**\n- Physical discipline (spanking, slapping) increases aggressive behavior in children. The AAP explicitly recommends against it.\n- Natural consequences work: "If you hit your friend, we leave the playdate. Hitting means playdate is over."\n- Praise gentle behavior enthusiastically: "You handed the toy so gently! Great job!"\n\nMost physical aggression decreases significantly as language skills improve (ages 3-4). If it is escalating or {{child_name}} shows no remorse, note this in your behavior log for Dr. {{doctor_name}}.',
      boundary: false,
    },
    sleep_resistance: {
      questionPatterns: [
        'won\'t sleep', 'bedtime battles', 'keeps getting out of bed', 'up until late',
        'stalling at bedtime', 'needs me to lay with them',
      ],
      response:
        'Bedtime resistance is the number one behavioral sleep complaint in pediatric practice. The evidence is clear that a consistent bedtime routine is the most effective intervention.\n\n**Build the routine (start 30 min before {{bedtime_target}}):**\n1. **Screens off.** This is the most important single step. Blue light suppresses melatonin.\n2. **Bath or wash up.** Warm water signals the body to start winding down.\n3. **Pajamas and teeth brushing.**\n4. **2-3 books.** Let {{child_name}} choose (from a limited selection).\n5. **Goodnight ritual.** A song, a prayer, or "I love you. Sweet dreams. See you in the morning."\n6. **Lights off. Leave the room** (or stay briefly if transitioning).\n\n**For the "jack-in-the-box" child who keeps getting up:**\n- Calm, boring return. Walk them back to bed without conversation. "It\'s bedtime." That is it.\n- The first night you may do this 20-30 times. The second night, 10. By night 5-7, it usually resolves.\n- Do not give in to "one more book/one more drink/one more hug" — this teaches that stalling works.\n\n**AASM recommended sleep hours:**\n- 1-2 years: 11-14 hours (including nap)\n- 3-5 years: 10-13 hours\n- 6-8 years: 9-12 hours\n\nThe routine should be the same on weekdays AND weekends. Consistency is the foundation of behavioral sleep improvement.',
      followUp: 'What does {{child_name}}\'s current bedtime look like?',
      boundary: false,
    },
    consistency_is_key: {
      questionPatterns: [
        'not working', 'tried everything', 'nothing helps', 'getting worse', 'giving up',
      ],
      response:
        'I hear you, and I want to validate that this is genuinely hard. Behavioral change in children requires more patience and consistency than almost anything else in parenting.\n\n**Here is the critical insight: it often gets WORSE before it gets BETTER.** This is called an "extinction burst." When {{child_name}} discovers that their old strategies (screaming, stalling, refusing) no longer get the desired result, they will try HARDER. This is actually a GOOD sign — it means the new boundaries are registering.\n\n**The timeline:**\n- Days 1-5: Resistance increases. {{child_name}} tests the new boundaries harder.\n- Days 5-10: Peak resistance. This is where most parents give in. DO NOT.\n- Days 10-21: Gradual improvement as the new pattern becomes "normal."\n- Week 3+: Significant improvement if consistency was maintained.\n\n**If BOTH parents (and any caregivers) are consistent**, this timeline holds. If rules shift between caregivers, the child learns that persistence pays off — and the tantrums continue.\n\n**Practical tips:**\n- Post the routine visually where everyone sees it.\n- Debrief with your partner daily — are you both on the same page?\n- Log in SKIDS daily so Dr. {{doctor_name}} can see the trajectory.\n- Celebrate small wins: "{{child_name}} went to bed 10 minutes earlier tonight!"\n\nYou are doing the hardest and most important work. Consistency is not perfection — it is showing up with the same plan most days.',
      boundary: false,
    },
    screen_as_pacifier: {
      questionPatterns: [
        'screen to calm down', 'phone to stop crying', 'TV as reward', 'tablet before bed',
        'uses screen to self-soothe',
      ],
      response:
        'Using screens to manage behavior is one of the most common parenting strategies — and one of the most counterproductive long-term. Here is why:\n\n**The trap:**\n- Screen calms child immediately (works in the moment).\n- Child learns: "If I melt down → I get screen" (reinforces meltdowns).\n- Child never develops internal coping skills (deep breathing, talking about feelings, distraction with play).\n- Screen before bed disrupts sleep → more behavioral problems the next day → more screen to cope → the cycle continues.\n\n**AAP evidence**: Screen time before bed delays sleep onset by 30+ minutes and reduces sleep quality. The AAP recommends all screens off at least 1 hour before bed.\n\n**Replacement strategies:**\n- **During tantrums**: Stay present, name the emotion, wait. (It is okay for {{child_name}} to be upset. Discomfort is how they learn to cope.)\n- **During boredom**: "I\'m bored" is not an emergency. Offer options: drawing, blocks, play-doh, or free play. Boredom is the birthplace of creativity.\n- **During waiting (restaurant, doctor)**: Pack a "go bag" — small toys, crayons, stickers, a book.\n- **Before bed**: Books, songs, conversation, a calm bath.\n\nCold turkey is hard. Start by replacing ONE screen-as-pacifier moment per day with an alternative. Build from there.',
      boundary: false,
    },
    when_behavior_is_red_flag: {
      questionPatterns: [
        'is this normal behavior', 'red flag', 'ADHD', 'autism', 'ODD',
        'extreme tantrums', 'hurting self', 'something wrong with my child',
      ],
      response:
        'Your concern is valid, and differentiating normal developmental behavior from clinical red flags requires professional evaluation by Dr. {{doctor_name}}. This is a medical assessment question.\n\n**Please contact Dr. {{doctor_name}} if you observe:**\n- Tantrums consistently lasting 25+ minutes\n- Self-injurious behavior (head-banging, biting self, scratching self)\n- Frequent aggression that is worsening despite consistent positive discipline for 4+ weeks\n- Behavior that is dangerous to {{child_name}} or others\n- Significant regression in behavior, speech, or toileting\n- Extreme separation anxiety that prevents normal activities\n- Sleep disturbances with breathing issues (snoring, gasping)\n- Total inability to transition between activities or cope with minor changes\n\n**Dr. {{doctor_name}} can assess** whether underlying conditions (ADHD, ASD, anxiety, sensory processing, ODD) may be contributing and refer for specialized evaluation.\n\nYour daily behavior logs in SKIDS are extremely valuable for clinical assessment — they capture patterns that may not be visible in a single office visit.',
      boundary: true,
    },
  },
}

// ── 4C: Behavioral — GCC/Gulf_AP ──

const behavioralRoutineGulf: InterventionProtocol = {
  ...behavioralBase,
  id: 'proto_behavioral_gulf_v1',
  slug: 'behavioral-routine-gulf',
  name: 'Behavioral Routine Protocol (Gulf)',
  region: 'gcc',
  protocolAuthority: 'Gulf_AP',
  parentLocale: 'en',
  description:
    'Structured behavioral routine protocol for children aged 18 months to 8 years with sleep difficulties and/or tantrum management needs, adapted for Gulf family contexts. Addresses cultural respect norms, family hierarchy in discipline, nanny/domestic helper consistency, late-night cultural schedules, and Ramadan routine adjustments. Combines international evidence-based behavioral strategies with culturally appropriate implementation.',
  evidenceBase:
    'Gulf Pediatric Society Behavioral Guidelines (2020). AASM Pediatric Sleep Recommendations (2016). Al-Haidar FA, "Behavioral Problems in Preschool Children in Riyadh, Saudi Arabia" (J Family Community Med, 2006). AAP Policy Statement: Effective Discipline (2018), adapted for Gulf cultural context. Mindell JA et al., "Behavioral Treatment of Bedtime Problems" (Sleep, 2006).',
  prevalenceNotes:
    'Behavioral sleep problems are highly prevalent in GCC countries due to late cultural schedules (children staying up until 10-11 PM is common). Tantrum management challenges are exacerbated by inconsistent discipline between multiple caregivers (parents, grandparents, nannies).',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'morning_routine',
      title: 'Morning Routine Practice',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Follow the morning routine with {{child_name}}: wake by {{morning_target}}, bathroom, brush teeth, get dressed, breakfast. Use a visual schedule chart. Ensure consistency whether parent or nanny is managing the morning. Praise each step: "Mashallah, you got dressed by yourself!"',
      durationMinutes: 45,
      successCriteria: 'Morning routine completed with consistency regardless of caregiver',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['tantrum_strategies', 'consistency_is_key'],
    },
    {
      key: 'bedtime_routine',
      title: 'Bedtime Routine',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Start bedtime routine 30 minutes before {{bedtime_target}}. Follow the same sequence: screens off, wash/bath, pajamas, brush teeth, short Quran recitation or dua, 1-2 stories, lights off. Be calm and consistent even if family activities are still going on in the house.',
      durationMinutes: 30,
      successCriteria: 'Bedtime routine followed with consistent sequence and calm boundaries',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['sleep_resistance', 'screen_as_pacifier', 'consistency_is_key'],
    },
    {
      key: 'emotion_check_in',
      title: 'Emotion Check-In',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Once today, do a brief emotion check-in with {{child_name}}. "How are you feeling? Happy, sad, or angry?" For older children: "What was the best part of your day? What was hard?" Building emotional vocabulary helps {{child_name}} express feelings with words instead of behavior.',
      durationMinutes: 5,
      successCriteria: 'Completed emotion check-in with child',
      loggingType: 'done_skip' as const,
      coachingTopics: ['tantrum_strategies', 'hitting_biting'],
    },
    {
      key: 'behavior_log',
      title: 'Daily Behavior Log',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'End-of-day log: Any tantrums/meltdowns today? Triggers? Duration? Your response? Rate the day 1-5. Note who was the primary caregiver during any incidents. This helps Dr. {{doctor_name}} identify patterns.',
      durationMinutes: 5,
      successCriteria: 'Logged behavioral observations for the day',
      loggingType: 'value_entry' as const,
      coachingTopics: ['when_behavior_is_red_flag'],
    },
  ],
  escalationRules: behavioralEscalations,
  customizableParams: behavioralParams,
  coachingPlaybook: {
    tantrum_strategies: {
      questionPatterns: [
        'tantrum', 'meltdown', 'screaming', 'throwing things', 'out of control',
        'how to handle tantrum',
      ],
      response:
        'Tantrums are a normal part of child development, and managing them consistently is especially challenging when multiple caregivers are involved. Here is an evidence-based approach:\n\n**During the tantrum:**\n1. **Stay calm.** Your calm is {{child_name}}\'s anchor. Breathe slowly. Speak quietly.\n2. **Ensure safety.** Move {{child_name}} away from anything dangerous.\n3. **Name the feeling.** "You are very angry right now. I understand." Naming emotions helps the brain process them.\n4. **Hold the boundary gently.** "I know you want to stay at the mall. It is time to go home. We can come back another day."\n5. **Wait.** Do not try to reason during the peak. The emotional brain cannot process logic.\n\n**After (once calm):**\n- Reconnect warmly. "That was hard, wasn\'t it?"\n- Briefly discuss: "You were upset because... Next time, try telling me \'I\'m angry\' with words."\n\n**Critical for Gulf families:**\n- **Nanny consistency**: Ensure your nanny/helper responds the same way you do. Write down the approach and review it with them.\n- **Public tantrums**: In malls and family gatherings, calmly remove {{child_name}} to a quiet corner. Do not give in because of social pressure.\n- **Cultural respect**: Teaching respectful behavior is important, but a tantrum is not defiance — it is a child overwhelmed by emotions. Respond with firmness AND kindness.\n\nConsistency from ALL caregivers is the single biggest factor in reducing tantrums.',
      followUp: 'Who is usually with {{child_name}} when tantrums happen?',
      boundary: false,
    },
    hitting_biting: {
      questionPatterns: [
        'hitting', 'biting', 'kicking', 'aggressive', 'hurting other children', 'hurting nanny',
      ],
      response:
        'Physical aggression in young children is common — they often lack the words to express frustration. It is not a sign of a "bad child" or bad parenting.\n\n**In the moment:**\n- Calmly intervene: "I will not let you hit. Hitting hurts."\n- Briefly remove {{child_name}} from the situation.\n- If hitting a sibling: comfort the sibling first.\n- If hitting the nanny: support the nanny\'s authority. "We do not hit anyone, not Mama, not Baba, not [nanny name]."\n\n**Teaching alternatives:**\n- "When you feel angry, tell me. Say \'I am angry!\' or stomp your feet."\n- Practice during calm times with role-playing.\n- Read children\'s books about emotions and gentle hands.\n\n**For Gulf families:**\n- Ensure nannies feel empowered to set gentle limits. Some helpers are afraid to say "no" to the child, which can escalate behavior.\n- All family members should respond consistently — if one adult allows hitting and another does not, the behavior continues.\n- Physical discipline increases aggression. Positive discipline with clear, calm limits is more effective.\n\nThis behavior typically improves significantly as language develops. If {{child_name}} is also in speech stimulation, the two protocols complement each other — better communication means fewer physical outbursts.',
      boundary: false,
    },
    sleep_resistance: {
      questionPatterns: [
        'won\'t sleep', 'up until midnight', 'bedtime battles', 'late nights',
        'family stays up late',
      ],
      response:
        'Late bedtimes are one of the most significant behavioral challenges in Gulf families. Cultural norms of late dinners, evening family gatherings, and mall visits until 10-11 PM make early bedtimes difficult. But children NEED significantly more sleep than adults.\n\n**Sleep hours children need:**\n- Ages 1-2: 11-14 hours (including naps)\n- Ages 3-5: 10-13 hours\n- Ages 6-8: 9-12 hours\n\nA child who sleeps at midnight and wakes at 7 AM for school is chronically sleep-deprived, which directly causes more tantrums, less focus, and behavioral problems.\n\n**Practical strategies for Gulf families:**\n1. **Set a non-negotiable bedtime** ({{bedtime_target}}) even if adults are still awake. {{child_name}}\'s room should be quiet and dark.\n2. **Screens off 1 hour before bed.** This is critical — blue light from iPads and phones suppresses the sleep hormone melatonin.\n3. **Create a calming routine**: wash, pajamas, Quran recitation or dua, 1-2 books, lights off.\n4. **Weekend consistency**: Try to keep the same bedtime on weekends. Late Friday nights are understandable, but make them the exception, not the rule.\n5. **Social events**: If a gathering runs late, apologise and take {{child_name}} home at bedtime. Their health comes first.\n6. **Nanny bedtime**: If the nanny puts {{child_name}} to bed, ensure they follow the exact same routine.\n\nThis is one of the hardest changes for Gulf families, but the impact on behavior and health is transformational.',
      followUp: 'What time is {{child_name}} currently falling asleep most nights?',
      boundary: false,
    },
    consistency_is_key: {
      questionPatterns: [
        'not working', 'tried everything', 'nothing helps', 'getting worse',
        'nanny does it differently',
      ],
      response:
        'Behavioral change requires consistency, and in Gulf households with multiple caregivers, achieving consistency is the hardest part. Here is the evidence-based reality:\n\n**The extinction burst**: When you start enforcing new boundaries, {{child_name}}\'s behavior will get WORSE for 5-10 days before it gets better. They are testing whether the new rules are real. This is a sign the boundaries are working.\n\n**The multi-caregiver challenge:**\n- If mama says no screens before bed but the nanny allows it, {{child_name}} learns screens are negotiable.\n- If baba gives in after a tantrum but mama holds firm, {{child_name}} targets baba.\n- Everyone must be on the same page: parents, nannies, grandparents.\n\n**How to align caregivers:**\n1. Hold a brief family/caregiver meeting. Share the SKIDS protocol: "Dr. {{doctor_name}} prescribed this for {{child_name}}\'s health."\n2. Write the routine down and post it where everyone can see it.\n3. Empower the nanny: "Please follow this routine exactly. You have our full support to hold these boundaries."\n4. Debrief daily: "How did bedtime go tonight? Did you follow the steps?"\n\n**Give it time**: Commit to 3 full weeks of consistency before evaluating. If you waver on day 8, you are back to day 1.\n\nYou are doing the right thing. Consistent boundaries are the greatest gift you can give {{child_name}} — they create safety and predictability.',
      boundary: false,
    },
    screen_as_pacifier: {
      questionPatterns: [
        'screen to calm down', 'iPad to stop crying', 'YouTube to keep quiet',
        'phone during meals', 'needs screen to eat',
      ],
      response:
        'Using screens to manage behavior is extremely common in Gulf families, where children often have easy access to iPads and phones from a very young age. It works in the moment, but it creates long-term problems:\n\n**Why it backfires:**\n- {{child_name}} never learns to manage emotions independently — the screen does it for them.\n- The cycle reinforces itself: tantrum → screen → calm. This teaches {{child_name}} that tantrums get rewards.\n- Screen before bed disrupts sleep → more behavioral problems next day → more screen to cope.\n- Screens during meals prevent family conversation, a key behavioral and language development opportunity.\n\n**Replacement strategies:**\n- **During tantrums**: Stay present, name the emotion, wait it out. It is okay for {{child_name}} to be uncomfortable.\n- **During boredom**: Offer alternatives — drawing, playdoh, building blocks, water play (great in the Gulf heat).\n- **During waiting**: Small activity bag with crayons, stickers, a small toy.\n- **During meals**: Screen OFF. Talk to {{child_name}}. Mealtime conversation is one of the richest behavioral and language moments of the day.\n\n**For nannies**: Screens are the easiest tool for caregivers to keep children quiet. Provide alternatives and explain WHY screens are limited. "Please use these toys/activities instead of the iPad during the day."\n\nStart by removing screens from one daily situation (mealtime or bedtime) and build from there.',
      boundary: false,
    },
    when_behavior_is_red_flag: {
      questionPatterns: [
        'is this normal', 'red flag', 'ADHD', 'autism', 'extreme behavior', 'hurting self',
        'should I worry',
      ],
      response:
        'Distinguishing normal developmental behavior from clinical concerns requires professional evaluation by Dr. {{doctor_name}}. This is a medical question I cannot assess through coaching.\n\n**Please contact Dr. {{doctor_name}} if you observe:**\n- Tantrums consistently lasting 25+ minutes\n- Self-injurious behavior (head-banging, biting self, hitting self)\n- Aggression escalating despite consistent management for 4+ weeks\n- Behavior dangerous to {{child_name}} or others\n- Loss of previously achieved skills\n- Extreme anxiety about separation or change\n- Sleep-disordered breathing (snoring, gasping, pauses)\n\n**In the GCC, specialized services are available:**\n- UAE: Al Jalila Children\'s Hospital (Dubai), Cleveland Clinic Abu Dhabi\n- Saudi Arabia: King Faisal Specialist Hospital, KFSHRC developmental units\n- Qatar: Sidra Medicine, Hamad Medical Corporation\n\nDr. {{doctor_name}} can recommend formal developmental or behavioral assessment. Your SKIDS behavior logs provide essential data — patterns over weeks tell the clinical story better than a single visit.',
      boundary: true,
    },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// 5. GROSS MOTOR PHYSIO — TORTICOLLIS / MOTOR DELAY
// ════════════════════════════════════════════════════════════════════════════

const motorBase = {
  category: 'physio' as const,
  subspecialty: 'posture_ai' as const,
  conditionName: 'Torticollis / Gross Motor Delay',
  icd10: 'M43.6',
  defaultDurationDays: 120,
  defaultFrequency: 'daily' as const,
  ageRangeMin: 0,
  ageRangeMax: 36,
  version: 1,
}

const motorEscalations = [
  {
    trigger: 'compliance_below_50',
    condition: { metric: 'compliance_pct', operator: 'lt' as const, value: 50, windowDays: 7 },
    severity: 'warning' as const,
    titleTemplate: 'Low physio exercise compliance for {{child_name}}',
    detailTemplate:
      '{{child_name}}\'s physiotherapy exercise compliance is {{compliance_pct}}% over the past 7 days. Motor exercises require consistent daily practice. Family may need technique coaching or schedule support.',
  },
  {
    trigger: 'no_progress_6_weeks',
    condition: { metric: 'boundary_hits', operator: 'gt' as const, value: 3, windowDays: 42 },
    severity: 'warning' as const,
    titleTemplate: 'Motor progress concern for {{child_name}}',
    detailTemplate:
      'Parent has asked about lack of progress multiple times over 6 weeks despite reported compliance. Clinical reassessment may be needed to evaluate range of motion, muscle tone, and whether imaging or specialist referral is indicated.',
  },
  {
    trigger: 'pain_reported',
    condition: { metric: 'parent_concern_level', operator: 'gt' as const, value: 6 },
    severity: 'urgent' as const,
    titleTemplate: 'Pain or distress reported during exercises for {{child_name}}',
    detailTemplate:
      'Parent reports {{child_name}} is in significant pain or distress during prescribed exercises. Pain level or concern is {{parent_concern_level}}/10. Technique reassessment or protocol modification may be needed.',
  },
  {
    trigger: 'consecutive_skips',
    condition: { metric: 'consecutive_skips', operator: 'gt' as const, value: 3 },
    severity: 'warning' as const,
    titleTemplate: '4+ consecutive exercise days skipped for {{child_name}}',
    detailTemplate:
      '{{child_name}} has skipped {{consecutive_skips}} consecutive days. Extended gaps slow motor progress and may allow regression. Technique confidence or scheduling may be barriers.',
  },
]

const motorParams = [
  {
    key: 'condition_type',
    type: 'select' as const,
    defaultValue: 'torticollis',
    label: 'Condition',
    options: ['torticollis', 'motor_delay', 'flat_head'],
  },
  {
    key: 'tummy_time_minutes',
    type: 'number' as const,
    defaultValue: 10,
    label: 'Tummy Time Per Session',
    unit: 'minutes',
    min: 5,
    max: 20,
  },
  {
    key: 'stretch_repetitions',
    type: 'number' as const,
    defaultValue: 5,
    label: 'Stretch Repetitions Per Set',
    unit: 'reps',
    min: 3,
    max: 10,
  },
  {
    key: 'affected_side',
    type: 'select' as const,
    defaultValue: 'left',
    label: 'Affected Side',
    options: ['left', 'right', 'bilateral'],
  },
]

// ── 5A: Motor Physio — India/IAP ──

const motorPhysioIAP: InterventionProtocol = {
  ...motorBase,
  id: 'proto_motor_iap_v1',
  slug: 'motor-physio-iap',
  name: 'Gross Motor Physio Protocol (IAP)',
  region: 'india',
  protocolAuthority: 'IAP',
  parentLocale: 'en',
  description:
    'Home-based physiotherapy protocol for infants and toddlers (0-3 years) with congenital muscular torticollis, positional plagiocephaly, or gross motor delay, following IAP developmental paediatrics guidelines. Addresses cost-effective equipment alternatives for Indian families, home setup with limited space, joint family participation in exercises, and guidance for families with limited access to pediatric physiotherapy. Core exercises: tummy time, neck stretches, and repositioning.',
  evidenceBase:
    'IAP Guidelines on Developmental Assessment and Early Intervention (2020). Kaplan SL et al., "Physical Therapy Management of Congenital Muscular Torticollis: An Evidence-Based Clinical Practice Guideline" (Pediatr Phys Ther, 2013). Indian Pediatrics — "Motor Development Milestones in Indian Infants" (2017). Laughlin J et al., "Prevention and Management of Positional Skull Deformities in Infants" (Pediatrics, 2011, AAP Clinical Report).',
  prevalenceNotes:
    'Congenital muscular torticollis affects 0.3-2% of newborns. Positional plagiocephaly has increased with supine sleeping recommendations. Motor delay prevalence is approximately 5-7% in Indian infants. Detection often delayed in India due to cultural norms ("the baby will catch up").',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'tummy_time_session',
      title: 'Tummy Time Session',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 3 },
      instructionsTemplate:
        'Place {{child_name}} on their tummy on a firm, flat surface for {{tummy_time_minutes}} minutes. Stay with them the entire time. Use toys, your face, or a mirror placed at eye level to encourage them to lift and turn their head. For torticollis: position the toy on the {{affected_side}} side to encourage turning toward the tight side. If {{child_name}} fusses, try tummy time on your chest — skin-to-skin works beautifully.',
      durationMinutes: 10,
      successCriteria: 'Completed full tummy time session with active head lifting',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['baby_hates_tummy_time', 'equipment_needed', 'when_to_see_progress'],
    },
    {
      key: 'stretching_exercises',
      title: 'Neck/Body Stretching Exercises',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Perform {{stretch_repetitions}} gentle neck stretches on each side. For torticollis: gently turn {{child_name}}\'s head toward the {{affected_side}} shoulder and hold for 10-15 seconds. Then tilt the ear toward the opposite shoulder and hold 10-15 seconds. Be gentle — never force. Do this when {{child_name}} is calm, not hungry or sleepy. Singing or talking keeps them relaxed.',
      durationMinutes: 10,
      successCriteria: 'Completed prescribed stretching repetitions gently without forcing',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['how_to_stretch_safely', 'can_we_skip_stretch'],
    },
    {
      key: 'positioning_check',
      title: 'Positioning & Environment Check',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Check {{child_name}}\'s positioning throughout the day. For torticollis: position toys, mobiles, and yourself on the {{affected_side}} to encourage active head turning. During feeding: alternate the arm you hold {{child_name}} in. During sleep: place {{child_name}} on their back with head turned to the non-preferred side (supervised repositioning only during naps). Avoid excessive time in car seats, bouncers, or swings.',
      durationMinutes: 5,
      successCriteria: 'Verified appropriate positioning at least once during the day',
      loggingType: 'done_skip' as const,
      coachingTopics: ['flat_head_worry', 'equipment_needed'],
    },
  ],
  escalationRules: motorEscalations,
  customizableParams: motorParams,
  coachingPlaybook: {
    baby_hates_tummy_time: {
      questionPatterns: [
        'hates tummy time', 'cries during tummy time', 'refuses tummy time', 'screams on tummy',
        'won\'t do tummy time', 'baby fusses on stomach',
      ],
      response:
        'Almost every baby dislikes tummy time initially — you are not alone! It is like asking an adult to hold a plank — it is hard work for those little neck and arm muscles. But it is one of the most important exercises for motor development.\n\n**Strategies that work for Indian families:**\n\n**Start small**: If {{tummy_time_minutes}} minutes seems impossible, start with 2-3 minutes and build up. Multiple short sessions beat one miserable long one.\n\n**Tummy time on you**: Lie on your back and place {{child_name}} on your chest. This is the gentlest introduction — they get tummy time while seeing your face. Skin-to-skin makes it even better.\n\n**After a diaper change**: {{child_name}} is already undressed — place them on their tummy for a minute before dressing. Build this into the routine.\n\n**Use a rolled towel**: Place a small rolled towel (a lungi or dupatta rolled works perfectly!) under {{child_name}}\'s chest with arms forward. This provides slight elevation and makes it easier.\n\n**Entertainment is key**: Get on the floor at {{child_name}}\'s eye level. Your face is the best motivator. Sing, make sounds, place a colorful rattle or mirror right in front. For older babies, a small steel plate or bowl with water to splash can work wonders.\n\n**Involve family**: Grandparents, siblings — anyone who gets on the floor with {{child_name}} during tummy time makes it more fun. In Indian families, there is often someone available.\n\n**Never leave {{child_name}} alone during tummy time**, and always do it on a firm surface (a dari/floor mat works fine — no need for expensive play mats).',
      followUp: 'How long can {{child_name}} currently tolerate tummy time before fussing?',
      boundary: false,
    },
    how_to_stretch_safely: {
      questionPatterns: [
        'how to stretch', 'am I doing it right', 'stretch technique', 'afraid to hurt baby',
        'safe stretching', 'neck stretch technique',
      ],
      response:
        'Your caution is excellent — gentle technique is very important. Here is how to do the stretches safely:\n\n**Golden rules:**\n- **Gentle, gentle, gentle.** You should feel mild resistance, NEVER force. If {{child_name}} cries in pain, you are pushing too far.\n- **Warm muscles stretch better.** Do stretches after a warm bath, or after tummy time when the muscles are already active.\n- **Happy baby = better stretch.** Do stretches when {{child_name}} is calm, fed, and alert. Never when hungry, sleepy, or fussy.\n\n**For torticollis neck stretches:**\n1. **Rotation** (turning head): Lay {{child_name}} on their back. Gently turn their head to the {{affected_side}} (toward the tight side). Hold for 10-15 seconds. Sing or talk to keep them calm. Repeat {{stretch_repetitions}} times.\n2. **Lateral tilt** (ear to shoulder): Gently tilt {{child_name}}\'s head so the ear on the NON-affected side moves toward that shoulder. This stretches the tight side. Hold 10-15 seconds. Repeat {{stretch_repetitions}} times.\n\n**How firm should you be?** Think of it as the pressure you would use to press a ripe tomato — firm enough to move it, gentle enough not to squish it.\n\n**If {{child_name}} is very resistant:** Try doing the stretches during feeding. The distraction of milk often allows better stretching.\n\nDr. {{doctor_name}} or a physiotherapist can demonstrate the exact technique if you are unsure. Even one in-person session to learn the technique is very helpful.',
      followUp: 'Would it help to have a video demonstration of the stretching technique?',
      boundary: false,
    },
    flat_head_worry: {
      questionPatterns: [
        'flat head', 'head shape', 'plagiocephaly', 'head looks uneven', 'asymmetric head',
        'back of head flat',
      ],
      response:
        'Concern about head shape is very common and understandable. Positional plagiocephaly (flat spot from lying position) is related to torticollis and motor positioning. Here is what I can share:\n\nMild positional head flattening is common in babies who spend a lot of time on their back (as recommended for safe sleep). It typically improves significantly with repositioning and tummy time as {{child_name}} spends less time lying down.\n\nHowever, the degree of asymmetry and whether it requires any additional intervention (positioning, helmet therapy) is a clinical assessment that only Dr. {{doctor_name}} can make.\n\n**What you can do at home:**\n- Tummy time, tummy time, tummy time — this is the best treatment for both torticollis AND flat head.\n- Alternate which end of the crib you place {{child_name}}\'s head — babies turn toward interesting stimuli (light, sounds).\n- Limit time in car seats, bouncers, and swings where the back of the head rests on a hard surface.\n- During supervised naps, gently reposition the head to the non-flat side.\n\n**Please discuss head shape concerns directly with Dr. {{doctor_name}}** at your next visit. They may measure head circumference and symmetry to track progress.',
      boundary: true,
    },
    when_to_see_progress: {
      questionPatterns: [
        'when will it get better', 'no improvement', 'how long treatment', 'still tilting head',
        'progress timeline',
      ],
      response:
        'Progress in torticollis and motor development can feel slow, but here is the general timeline based on clinical evidence:\n\n**For congenital muscular torticollis:**\n- Weeks 1-4: Building the exercise habit. Small improvements in passive range of motion.\n- Weeks 4-8: Noticeable improvement in head tilt and rotation for most babies with consistent exercises.\n- Weeks 8-16: Significant improvement. Many babies achieve near-full range of motion.\n- 3-6 months: Most cases of torticollis diagnosed early resolve with consistent physiotherapy.\n\n**For gross motor delay:**\n- Progress is measured against {{child_name}}\'s own baseline, not age norms.\n- Tummy time builds the foundation for rolling, sitting, crawling, and walking.\n- Most babies show meaningful motor gains within 8-12 weeks of consistent daily exercises.\n\n**Important**: Only Dr. {{doctor_name}} can assess whether {{child_name}}\'s specific progress is on track, whether the exercises need adjustment, or whether additional interventions (formal PT, imaging) are needed.\n\n**Your daily exercise logs in SKIDS are crucial** — they help Dr. {{doctor_name}} correlate compliance with progress at follow-up visits.\n\nIf you have been doing the exercises consistently for 6+ weeks and see no improvement, that is worth a follow-up with Dr. {{doctor_name}}.',
      boundary: false,
    },
    equipment_needed: {
      questionPatterns: [
        'what equipment', 'need mat', 'need special pillow', 'what to buy',
        'exercise equipment baby',
      ],
      response:
        'Great news — you do NOT need expensive equipment for these exercises. Indian families can do everything with items already at home:\n\n**For tummy time:**\n- A firm, flat surface is all you need. A clean floor mat (dari), a firm mattress, or a folded blanket on the floor works perfectly.\n- NO special play mats needed (though they are fine if you have one).\n- A small mirror placed at floor level encourages head lifting. Any mirror works.\n- Colorful rattles, keys, or steel cups — anything that catches attention.\n\n**For stretching:**\n- A flat surface (bed or floor) where you can lay {{child_name}} comfortably.\n- Your hands — that is it!\n\n**For positioning:**\n- A rolled towel or dupatta under the chest for supported tummy time.\n- Toys placed on the appropriate side to encourage turning.\n\n**Things to AVOID buying:**\n- "Anti-flat-head" pillows — not recommended by pediatric guidelines and can be a suffocation risk.\n- Neck support devices — Dr. {{doctor_name}} will prescribe a TOT collar only if clinically needed.\n- Expensive physiotherapy equipment for home — the exercises prescribed here are all you need.\n\nIf Dr. {{doctor_name}} recommends formal physiotherapy sessions, many children\'s hospitals in India offer affordable PT. Ask about government hospital PT departments if cost is a concern.',
      boundary: false,
    },
    can_we_skip_stretch: {
      questionPatterns: [
        'skip stretching today', 'baby too fussy to stretch', 'can we take a break',
        'stretches making baby cry',
      ],
      response:
        'I understand — some days {{child_name}} is not cooperating, and forcing stretches on a very upset baby is counterproductive. Here is the balanced approach:\n\n**If {{child_name}} is mildly fussy**: Try these tricks first:\n- Distract with a toy, song, or feeding during the stretch.\n- Try again later in the day when mood improves.\n- Do fewer repetitions but still do something — 2 stretches is better than zero.\n\n**If {{child_name}} is very upset (illness, teething, vaccinations)**: It is okay to reduce the intensity or skip one session. Log it as partial or skipped and resume tomorrow.\n\n**What not to do**: Do not force through screaming. Tense muscles do not stretch well, and you risk associating the exercises with distress.\n\n**The big picture**: Consistency over weeks matters more than any single day. If you do exercises 5-6 days per week, {{child_name}} will progress. Missing one day during a rough patch is fine.\n\nHowever, if you find yourself skipping multiple days in a row because {{child_name}} always resists, that is a sign the technique may need adjustment. Consider asking Dr. {{doctor_name}} for a physiotherapy demonstration session to refine your approach.\n\nYou are doing a wonderful job as a parent — the fact that you are asking shows how committed you are.',
      followUp: 'Is {{child_name}} resisting stretches specifically, or all exercises?',
      boundary: false,
    },
  },
}

// ── 5B: Motor Physio — USA/AAP ──

const motorPhysioAAP: InterventionProtocol = {
  ...motorBase,
  id: 'proto_motor_aap_v1',
  slug: 'motor-physio-aap',
  name: 'Gross Motor Physio Protocol (AAP)',
  region: 'usa',
  protocolAuthority: 'AAP',
  parentLocale: 'en',
  description:
    'Home-based physiotherapy protocol for infants and toddlers (0-3 years) with congenital muscular torticollis, positional plagiocephaly, or gross motor delay, following AAP clinical recommendations and APTA (American Physical Therapy Association) evidence-based guidelines. Integrates with Early Intervention (Part C) services. Includes insurance-covered equipment recommendations, PT visit coordination, and structured home exercise program to supplement professional therapy sessions.',
  evidenceBase:
    'AAP Clinical Report: "Prevention and Management of Positional Skull Deformities in Infants" (Pediatrics, 2011). Kaplan SL et al., "Physical Therapy Management of Congenital Muscular Torticollis: An Evidence-Based Clinical Practice Guideline" (Pediatr Phys Ther, 2013). APTA Section on Pediatrics practice guidelines. Collett BR et al., "Cognitive Outcomes and Positional Plagiocephaly" (Pediatrics, 2019). IDEA Part C Early Intervention eligibility criteria for motor delays.',
  prevalenceNotes:
    'Congenital muscular torticollis affects 0.3-2% of newborns. Positional plagiocephaly rates have increased since the Back to Sleep campaign. Motor delay prevalence approximately 5% in US infants. Early Intervention services available in all states for eligible infants.',
  dietaryContext: undefined,
  geneticConsiderations: undefined,
  tasks: [
    {
      key: 'tummy_time_session',
      title: 'Tummy Time Session',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 3 },
      instructionsTemplate:
        'Place {{child_name}} on their tummy on a firm surface for {{tummy_time_minutes}} minutes. Stay at eye level. Use high-contrast toys, mirrors, or your face to encourage head lifting and turning. For torticollis: position toys on the {{affected_side}} to encourage active turning toward the tight side. If fussy, try tummy time on your chest first.',
      durationMinutes: 10,
      successCriteria: 'Completed full tummy time with active head lifting and turning',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['baby_hates_tummy_time', 'equipment_needed', 'when_to_see_progress'],
    },
    {
      key: 'stretching_exercises',
      title: 'Neck/Body Stretching Exercises',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Perform {{stretch_repetitions}} gentle stretches on each side. For torticollis: gently rotate {{child_name}}\'s head toward the {{affected_side}} and hold 10-15 seconds. Then tilt the opposite ear toward the shoulder and hold 10-15 seconds. Never force — gentle sustained pressure only. Best done when baby is calm and alert.',
      durationMinutes: 10,
      successCriteria: 'Completed prescribed stretching sets gently and completely',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['how_to_stretch_safely', 'can_we_skip_stretch'],
    },
    {
      key: 'positioning_check',
      title: 'Positioning & Environment Check',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Check positioning throughout the day. For torticollis: place stimulating toys, mobiles, and yourself on {{child_name}}\'s {{affected_side}}. During feeding: alternate holding arms. Limit "container time" (car seat, swing, bouncer) to 30-minute stretches. During supervised naps, gently reposition head to the non-preferred side.',
      durationMinutes: 5,
      successCriteria: 'Verified positioning and minimised container time',
      loggingType: 'done_skip' as const,
      coachingTopics: ['flat_head_worry', 'equipment_needed'],
    },
  ],
  escalationRules: motorEscalations,
  customizableParams: motorParams,
  coachingPlaybook: {
    baby_hates_tummy_time: {
      questionPatterns: [
        'hates tummy time', 'cries during tummy time', 'screams on stomach', 'refuses tummy time',
        'won\'t do tummy time',
      ],
      response:
        'Tummy time protest is nearly universal — you are in very good company! It is hard work for a baby\'s neck and arm muscles, like asking you to hold a plank. But it is the single most important exercise for motor development.\n\n**Evidence-backed strategies:**\n\n**Gradual build-up**: If {{tummy_time_minutes}} minutes seems impossible, start with 1-2 minutes multiple times per day. The AAP says even brief sessions count. Aim for a total of 30-60 minutes throughout the day by 3 months.\n\n**Tummy time positions (easiest to hardest):**\n1. On your chest (lying back) — easiest, great for newborns\n2. On your lap (face-down across thighs)\n3. On a Boppy pillow or rolled towel under chest\n4. On the floor — the goal\n\n**Engagement tools:**\n- Get on the floor at {{child_name}}\'s eye level — your face is the best motivator\n- High-contrast cards or a baby-safe mirror propped in front\n- Tummy time during diaper changes (brief session on the changing table)\n- Water mat (Amazon, Target) — the movement and colors fascinate babies\n\n**Timing**: After a diaper change (already undressed), after a nap (rested and alert), or before feeding (hungry baby is motivated to lift and look). Avoid right after feeding.\n\n**If your PT has given specific instructions**, follow those. The home program supplements professional therapy.',
      followUp: 'How many minutes can {{child_name}} currently tolerate on their tummy?',
      boundary: false,
    },
    how_to_stretch_safely: {
      questionPatterns: [
        'how to stretch', 'stretching technique', 'afraid to hurt baby', 'safe stretching',
        'show me how',
      ],
      response:
        'Your caution is exactly right — gentle technique is essential. If you have had a PT demonstration, follow their specific instructions. Here is the general safe approach:\n\n**Core principles:**\n- **Gentle sustained pressure**, never quick or forceful movements.\n- **Warm muscles first**: Stretches are most effective after tummy time or a warm bath.\n- **Calm, alert baby**: Feed first, wait 20 minutes, then stretch. Never stretch a screaming baby — tense muscles do not stretch well.\n\n**For torticollis:**\n1. **Rotation stretch**: Baby on back. Cup the head in your hands. Slowly turn the chin toward the {{affected_side}} (tight) shoulder. Hold 10-15 seconds when you feel gentle resistance. Do NOT push through pain. Repeat {{stretch_repetitions}} times.\n2. **Lateral flexion stretch**: Gently tilt the head so the ear on the non-affected side moves toward that shoulder (stretching the tight SCM muscle). Hold 10-15 seconds. Repeat {{stretch_repetitions}} times.\n\n**Pressure guide**: Think of the pressure you would use to test whether an avocado is ripe — firm enough to feel resistance, gentle enough not to cause damage.\n\n**If your Early Intervention PT has demonstrated a specific technique**, follow their version exactly. These home instructions are supplementary to professional guidance.\n\nMany parents find it helpful to video themselves doing the stretches and show the PT at the next visit for feedback.',
      followUp: 'Do you have a PT therapist who has demonstrated the technique in person?',
      boundary: false,
    },
    flat_head_worry: {
      questionPatterns: [
        'flat head', 'head shape', 'plagiocephaly', 'helmet', 'cranial orthosis',
        'head looks uneven',
      ],
      response:
        'Concern about head shape is very common and completely understandable. Here is what I can share:\n\nMild positional plagiocephaly is common in babies, especially those with torticollis (who tend to rest their head on one side). It frequently improves with repositioning, tummy time, and reduced "container time" (car seat, swing, bouncer).\n\nHowever, the degree of asymmetry and whether additional intervention is needed is a clinical decision for Dr. {{doctor_name}}.\n\n**What you can do at home:**\n- Maximise tummy time — the less time flat on the back, the better.\n- Alternate crib position — babies turn toward light and sound, so switch which end the head goes.\n- Limit car seat and bouncer time to necessary transport only — aim for no more than 30 minutes at a stretch.\n- Supervised repositioning during naps.\n\n**About helmets (cranial orthoses):** The decision for helmet therapy involves measuring head asymmetry with clinical tools. The AAP clinical report notes that most positional plagiocephaly improves without a helmet. Dr. {{doctor_name}} will assess whether one is indicated for {{child_name}}.\n\n**Please discuss head shape concerns at your next visit with Dr. {{doctor_name}}.** They may use clinical measurements or imaging to track changes.',
      boundary: true,
    },
    when_to_see_progress: {
      questionPatterns: [
        'when will it get better', 'no progress', 'still tilting', 'timeline',
        'how long does treatment take',
      ],
      response:
        'Here is the evidence-based timeline for motor exercises:\n\n**Congenital muscular torticollis:**\n- Weeks 1-2: Building the exercise habit. Baby adjusts to the stretches.\n- Weeks 2-6: Gradual improvement in passive range of motion.\n- Weeks 6-12: Noticeable improvement in active head turning and reduced head tilt for most babies.\n- 3-6 months: The APTA guideline reports that 90-95% of infants with torticollis treated before 6 months of age achieve full range of motion with conservative PT and home exercises.\n\n**Gross motor delay:**\n- Progress is measured against {{child_name}}\'s individual trajectory.\n- Tummy time builds the foundational strength for rolling, sitting, crawling, and walking.\n- With consistent daily exercises, most infants show meaningful progress within 8-12 weeks.\n\n**Key factor**: Earlier treatment = faster results. {{child_name}}\'s current exercise program is being done during the optimal window for motor development.\n\nDr. {{doctor_name}} and your PT (if involved through Early Intervention) will track range of motion and motor milestones at each visit. Your SKIDS exercise logs help them understand compliance patterns.\n\nIf you have been consistently doing exercises for 6+ weeks and see no improvement, schedule a follow-up with Dr. {{doctor_name}} for reassessment.',
      boundary: false,
    },
    equipment_needed: {
      questionPatterns: [
        'what equipment', 'need to buy anything', 'recommended products', 'play mat',
        'exercise tools',
      ],
      response:
        'You need very little equipment — the most important tools are your hands and your time.\n\n**Essential (likely already have):**\n- Firm, flat surface for tummy time (play mat, blanket on floor, or clean carpet)\n- A few interesting toys or rattles\n\n**Helpful but not required:**\n- Baby-safe mirror for tummy time motivation (Target, Amazon — $10-15)\n- Boppy pillow for supported tummy time (many families already have one)\n- High-contrast cards for visual stimulation (free printable versions online)\n- Water play mat for tummy time engagement ($10-20 on Amazon)\n\n**What insurance may cover:**\n- If {{child_name}} is receiving Early Intervention PT services, the therapist may recommend specific positioning aids. These are often covered under Part C.\n- If a TOT collar or cranial orthosis (helmet) is prescribed by Dr. {{doctor_name}}, check your insurance coverage.\n\n**What NOT to buy:**\n- "Anti-flat-head" pillows — not recommended by the AAP and can be a suffocation risk.\n- Neck positioning devices — only use what is specifically prescribed by Dr. {{doctor_name}} or PT.\n- Expensive therapy equipment — the home exercises use your hands and simple toys.\n\nSimple is better. The exercises are the treatment, not the equipment.',
      boundary: false,
    },
    can_we_skip_stretch: {
      questionPatterns: [
        'skip stretching', 'too fussy to stretch', 'take a break from exercises',
        'baby screaming during stretch',
      ],
      response:
        'Some days are harder than others, and I appreciate you checking in. Here is the balanced approach:\n\n**If {{child_name}} is mildly fussy:**\n- Try distraction: stretch during feeding, with a toy, or with singing.\n- Try later in the day when mood improves.\n- Do fewer reps — 2-3 stretches beats zero.\n\n**If {{child_name}} is very upset (sick, teething, post-vaccination):**\n- Reduce intensity or skip one session. Log as partial/skipped.\n- Maintain tummy time if possible — even brief sessions help.\n- Resume full program when {{child_name}} feels better.\n\n**Never force through screaming.** Tense muscles resist stretching, and you risk creating negative associations with the exercises.\n\n**The big picture:** Consistency over weeks matters far more than any single session. 5-6 days per week of exercises produces excellent results. Missing one day during a rough patch is completely fine.\n\nHowever, if you are skipping frequently because {{child_name}} always resists, discuss this with your PT or Dr. {{doctor_name}}. The technique may need adjustment, or a different approach may work better.\n\nYou are putting in the effort during a critical developmental window — that is what matters most.',
      followUp: 'Is the resistance specifically during stretching, or during all exercises?',
      boundary: false,
    },
  },
}

// ── 5C: Motor Physio — GCC/Gulf_AP ──

const motorPhysioGulf: InterventionProtocol = {
  ...motorBase,
  id: 'proto_motor_gulf_v1',
  slug: 'motor-physio-gulf',
  name: 'Gross Motor Physio Protocol (Gulf)',
  region: 'gcc',
  protocolAuthority: 'Gulf_AP',
  parentLocale: 'en',
  description:
    'Home-based physiotherapy protocol for infants and toddlers (0-3 years) with congenital muscular torticollis, positional plagiocephaly, or gross motor delay, adapted for Gulf family contexts. Addresses indoor exercise planning for hot climate, nanny/helper guidance for correct technique and positioning, and coordination with available pediatric rehabilitation services in GCC countries. Core exercises: tummy time, neck stretches, and repositioning.',
  evidenceBase:
    'Gulf Pediatric Society Developmental Guidelines (2021). Kaplan SL et al., "Physical Therapy Management of Congenital Muscular Torticollis" (Pediatr Phys Ther, 2013). AAP Clinical Report: "Prevention and Management of Positional Skull Deformities in Infants" (2011). Saudi Journal of Disability Research — Early Intervention Services in GCC (2019).',
  prevalenceNotes:
    'Torticollis and plagiocephaly rates in GCC are comparable to global figures (0.3-2% for CMT). Motor delays may be underdetected due to cultural norms and heavy reliance on caregivers who may not track milestones as closely as parents. Vitamin D deficiency (common in GCC) can contribute to muscle tone issues.',
  geneticConsiderations:
    'Vitamin D deficiency is extremely prevalent in GCC populations despite sunny climate (due to indoor lifestyle, covering). Low vitamin D can affect muscle tone and motor development. Ensure vitamin D status has been checked.',
  dietaryContext: undefined,
  tasks: [
    {
      key: 'tummy_time_session',
      title: 'Tummy Time Session',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 3 },
      instructionsTemplate:
        'Place {{child_name}} on their tummy on a firm surface indoors (AC room is fine) for {{tummy_time_minutes}} minutes. Stay at eye level. Use toys, your face, or a baby-safe mirror to encourage head lifting. For torticollis: place toys on the {{affected_side}} to encourage turning. If fussy, try tummy time on your chest. Ensure the nanny/helper also does tummy time sessions using the same technique.',
      durationMinutes: 10,
      successCriteria: 'Completed full tummy time session with supervision and engagement',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['baby_hates_tummy_time', 'equipment_needed', 'when_to_see_progress'],
    },
    {
      key: 'stretching_exercises',
      title: 'Neck/Body Stretching Exercises',
      category: 'primary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 2 },
      instructionsTemplate:
        'Perform {{stretch_repetitions}} gentle stretches on each side. For torticollis: gently rotate {{child_name}}\'s head toward the {{affected_side}} and hold 10-15 seconds, then tilt the opposite ear toward the shoulder and hold 10-15 seconds. Be very gentle. Best done when {{child_name}} is calm. PARENT or TRAINED nanny only — do not delegate to untrained helper.',
      durationMinutes: 10,
      successCriteria: 'Completed prescribed stretching by parent or trained caregiver',
      loggingType: 'done_skip_partial' as const,
      coachingTopics: ['how_to_stretch_safely', 'can_we_skip_stretch'],
    },
    {
      key: 'positioning_check',
      title: 'Positioning & Environment Check',
      category: 'supplementary' as const,
      schedule: { type: 'daily' as const, timesPerDay: 1 },
      instructionsTemplate:
        'Check {{child_name}}\'s positioning. For torticollis: position toys and stimulation on the {{affected_side}}. Alternate feeding arms. Limit car seat and bouncer time. Ensure the nanny knows the correct sleep positioning. During indoor play (common in Gulf heat), maximise floor time over carrier/swing time.',
      durationMinutes: 5,
      successCriteria: 'Verified appropriate positioning and communicated with caregiver',
      loggingType: 'done_skip' as const,
      coachingTopics: ['flat_head_worry', 'equipment_needed'],
    },
  ],
  escalationRules: motorEscalations,
  customizableParams: motorParams,
  coachingPlaybook: {
    baby_hates_tummy_time: {
      questionPatterns: [
        'hates tummy time', 'cries during tummy time', 'screams on stomach', 'nanny says baby hates it',
        'refuses tummy time',
      ],
      response:
        'Nearly every baby protests tummy time initially — it is hard work for their developing muscles. But it is the single most important exercise for motor development.\n\n**Strategies for Gulf families:**\n\n**Start small**: If {{tummy_time_minutes}} minutes is too much, start with 2-3 minutes and build up. Short, frequent sessions work better than one long, miserable one.\n\n**Tummy time positions (easiest to hardest):**\n1. On your chest while you recline — the easiest and most comforting position\n2. Across your lap face-down — gentle rocking can help\n3. On a rolled towel under the chest on the floor\n4. Flat on the floor — the goal\n\n**Indoor environment tips (for Gulf climate):**\n- A cool, AC room is perfect for tummy time. No need to go outdoors.\n- A simple play mat on the floor is all you need.\n- Place colorful toys, a mirror, or a phone showing family faces at eye level.\n\n**Nanny guidance**: Show the nanny exactly how to do tummy time and WHY it is important. Many helpers will avoid it if the baby cries. Explain: "Some fussing is okay. Stay with the baby, talk to them, and encourage them. Only pick up if truly distressed."\n\n**Parent sessions matter most**: Even if the nanny does tummy time during the day, at least 1-2 sessions should be parent-led. {{child_name}} is most motivated by mama and baba\'s face.\n\nConsistency over weeks builds the strength {{child_name}} needs for rolling, sitting, and eventually crawling.',
      followUp: 'How long can {{child_name}} tolerate tummy time currently?',
      boundary: false,
    },
    how_to_stretch_safely: {
      questionPatterns: [
        'how to stretch', 'technique', 'afraid to hurt baby', 'safe stretching',
        'nanny doing stretches',
      ],
      response:
        'Safe technique is essential, and your caution is exactly right. Here are the guidelines:\n\n**Core principles:**\n- **Gentle, sustained pressure** — never quick or forceful. You should feel mild resistance, not fight against the muscle.\n- **Warm muscles stretch better** — do stretches after tummy time or a warm bath.\n- **Happy, fed baby** — never stretch a hungry, tired, or upset baby.\n\n**For torticollis:**\n1. **Rotation**: Baby on back. Gently turn chin toward the {{affected_side}} shoulder. Hold 10-15 seconds at gentle resistance. Repeat {{stretch_repetitions}} times.\n2. **Lateral tilt**: Gently tilt head so the non-affected ear moves toward that shoulder. Hold 10-15 seconds. Repeat {{stretch_repetitions}} times.\n\n**Pressure guide**: Like pressing a ripe peach — firm enough to move, gentle enough not to bruise.\n\n**Important for Gulf families:**\n- **Stretching should only be done by a parent or a trained nanny.** Do not delegate to an untrained helper. Incorrect technique can harm.\n- If you have a physiotherapist, ask them to demonstrate to both parents AND the primary nanny.\n- Consider recording a video of the PT demonstrating so the nanny can review it.\n\nDr. {{doctor_name}} or your physiotherapist can demonstrate in person. Even one session to learn correct technique is invaluable.',
      followUp: 'Has a physiotherapist demonstrated the stretching technique for you?',
      boundary: false,
    },
    flat_head_worry: {
      questionPatterns: [
        'flat head', 'head shape', 'plagiocephaly', 'head looks uneven', 'helmet',
      ],
      response:
        'Head shape concerns are common and understandable. Positional plagiocephaly (flat spot from lying on one side) often accompanies torticollis.\n\nMild positional flattening is common and typically improves with repositioning and tummy time. However, the degree of asymmetry and whether any additional treatment is needed is a clinical assessment for Dr. {{doctor_name}}.\n\n**What you can do at home:**\n- Maximise tummy time — less time on the back of the head = less flattening.\n- Alternate crib/bed end where you place {{child_name}}\'s head.\n- Limit car seat, bouncer, and swing time (hard surfaces compress the skull).\n- Encourage active head turning to the non-preferred side during play.\n\n**About helmets**: The decision for cranial orthosis therapy is based on clinical measurements. Not all positional plagiocephaly requires a helmet — many cases resolve with repositioning. If needed, GCC has specialized centers:\n- UAE: American Hospital Dubai, Cleveland Clinic Abu Dhabi\n- Saudi: KFSH&RC, specialized rehabilitation centers\n- Qatar: Sidra Medicine\n\n**Please discuss head shape with Dr. {{doctor_name}}** at your next visit for proper assessment.',
      boundary: true,
    },
    when_to_see_progress: {
      questionPatterns: [
        'when will it improve', 'no progress', 'how long', 'timeline', 'still tilting',
      ],
      response:
        'Here is the evidence-based timeline for motor exercises:\n\n**Congenital muscular torticollis:**\n- Weeks 1-4: Building the habit. Small passive range improvements.\n- Weeks 4-8: Noticeable improvement in head tilt and rotation for most babies.\n- Weeks 8-16: Significant improvement. Many babies achieve near-full range.\n- 3-6 months: 90-95% of babies treated early resolve with consistent home exercises and PT.\n\n**Gross motor delay:**\n- Progress is individual — measured against {{child_name}}\'s own baseline.\n- Consistent tummy time builds the foundation for all future motor milestones.\n- Meaningful gains typically visible within 8-12 weeks of daily exercises.\n\n**Gulf-specific note**: Vitamin D deficiency is very common in GCC populations and can affect muscle tone and motor development. If not already checked, ask Dr. {{doctor_name}} about {{child_name}}\'s vitamin D level.\n\nDr. {{doctor_name}} will track range of motion and milestones at follow-up visits. Your SKIDS exercise logs help correlate compliance with progress.\n\nIf consistent exercises for 6+ weeks show no improvement, schedule a follow-up for reassessment.',
      boundary: false,
    },
    equipment_needed: {
      questionPatterns: [
        'what equipment', 'what to buy', 'need special mat', 'products for exercises',
      ],
      response:
        'You need very little — the exercises themselves are the treatment, not special equipment.\n\n**Essential (likely already have):**\n- Firm, flat surface for tummy time (play mat, blanket on floor)\n- A few colourful toys\n- Your hands for stretching\n\n**Helpful but not required:**\n- Baby-safe mirror for tummy time motivation (available at Babyshop, Mothercare, or online)\n- High-contrast cards for visual stimulation (printable for free)\n- Water play mat for tummy time engagement (Amazon UAE/KSA)\n\n**What NOT to buy:**\n- "Anti-flat-head" pillows — not recommended by pediatric guidelines and can be a suffocation risk.\n- Neck support devices — use only if specifically prescribed by Dr. {{doctor_name}}.\n- Expensive therapy equipment — the home program uses your hands and simple toys.\n\n**Indoor setup for Gulf climate**: A corner of the living room or bedroom with a play mat is perfect. AC temperature is fine — no need for outdoor exercise space. Keep the area clear of clutter so {{child_name}} has room to move.\n\nIf Dr. {{doctor_name}} recommends formal physiotherapy sessions, GCC has excellent pediatric rehabilitation centers at major hospitals.',
      boundary: false,
    },
    can_we_skip_stretch: {
      questionPatterns: [
        'skip stretching', 'baby too fussy', 'take a break', 'nanny couldn\'t do stretch today',
      ],
      response:
        'Some days are challenging, and that is completely understandable. Here is the balanced approach:\n\n**If {{child_name}} is mildly fussy:**\n- Try distracting during the stretch — a toy, a song, or doing it during feeding.\n- Attempt again later when mood improves.\n- Even 2-3 repetitions is better than skipping entirely.\n\n**If {{child_name}} is very upset (sick, teething, post-vaccination):**\n- Reduce intensity or skip that session. Log it and resume when they feel better.\n- Try to maintain tummy time even on tough days — even brief sessions help.\n\n**Nanny-specific guidance:** If the nanny reports {{child_name}} "wouldn\'t let me stretch," review the technique with them. Sometimes the nanny is hesitant because the baby protests, and they need reassurance that gentle persistence is okay.\n\n**The big picture:** Consistency over weeks matters far more than any individual session. Doing exercises 5-6 days per week produces excellent results. One missed day does not set you back.\n\nHowever, if multiple days are being skipped regularly, the technique may need adjustment. Ask Dr. {{doctor_name}} or your physiotherapist for a refresher session.\n\nYou are investing in {{child_name}}\'s motor development during the most critical window — that effort pays dividends.',
      followUp: 'Is the resistance happening with the parent, the nanny, or both?',
      boundary: false,
    },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════════════════════════

export const INTERVENTION_PROTOCOLS: InterventionProtocol[] = [
  // 1. Amblyopia Patching (Vision)
  amblyopiaPatchingIAP,
  amblyopiaPatchingAAP,
  amblyopiaPatchingGulf,
  // 2. Iron-Deficiency Nutrition
  ironNutritionIAP,
  ironNutritionAAP,
  ironNutritionGulf,
  // 3. Speech Stimulation (Developmental)
  speechStimIAP,
  speechStimAAP,
  speechStimGulf,
  // 4. Behavioral Routine (Sleep/Tantrums)
  behavioralRoutineIAP,
  behavioralRoutineAAP,
  behavioralRoutineGulf,
  // 5. Gross Motor Physio (Torticollis/Motor Delay)
  motorPhysioIAP,
  motorPhysioAAP,
  motorPhysioGulf,
]

// ── Lookup Helpers ──

export function getProtocolBySlug(slug: string): InterventionProtocol | undefined {
  return INTERVENTION_PROTOCOLS.find((p) => p.slug === slug)
}

export function getProtocolsByRegion(region: string): InterventionProtocol[] {
  return INTERVENTION_PROTOCOLS.filter((p) => p.region === region)
}

export function getProtocolsByCategory(category: string): InterventionProtocol[] {
  return INTERVENTION_PROTOCOLS.filter((p) => p.category === category)
}

export function getProtocolsBySubspecialty(subspecialty: string): InterventionProtocol[] {
  return INTERVENTION_PROTOCOLS.filter((p) => p.subspecialty === subspecialty)
}

export function getRegionalVariants(conditionName: string): InterventionProtocol[] {
  return INTERVENTION_PROTOCOLS.filter((p) => p.conditionName === conditionName)
}
