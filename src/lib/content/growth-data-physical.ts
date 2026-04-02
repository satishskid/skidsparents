/**
 * Physical Activity Domain — Growth Track Data
 *
 * Philosophy: Movement as joy, not obligation. Physical competence built
 * through play, not performance. Screen-activity balance, not screen banning.
 * Sport as exploration, not early specialisation.
 */
import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ── 0–3 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '0-3mo',
    ageMin: 0,
    ageMax: 3,
    title: 'Floor Time: The Foundation of All Movement',
    whatToExpect:
      'Your newborn arrives with a set of reflexive movements — rooting, stepping, grasping, the Moro startle — that are not yet voluntary but are the first chapters of motor development. Supervised tummy time, starting from birth, is the single most important physical activity intervention of the first three months; it builds the neck, shoulder, and core strength that everything else rests on.',
    keyMessage: 'A little tummy time every day, starting from day one, changes everything that comes after.',
    dailyTips: [
      'Start tummy time from day one, on your chest — skin-to-skin tummy time counts and is often easier for a reluctant newborn.',
      'By 6–8 weeks, aim for a total of 20–30 minutes of tummy time spread across the day in short bouts of 2–5 minutes.',
      'Free floor time without a bouncer, rocker, or carrier allows for natural kicking and stretching movements — babies need unencumbered time to move.',
    ],
    doList: [
      'Place your baby on their tummy across your lap or chest when they are awake and alert — this is the safest starting position for tummy time.',
      'Get down on the floor at your baby\'s eye level during tummy time — your face is the most motivating "toy" for lifting their head.',
      'Allow your baby to kick freely during nappy changes — this hip-flexor and core movement is brief but developmentally useful.',
    ],
    dontList: [
      'Never leave a sleeping baby on their tummy — safe sleep is always on their back; tummy time is supervised awake time only.',
      'Don\'t avoid tummy time because your baby cries; start with 1–2 minutes and build up — brief discomfort is normal and the skill builds quickly.',
      'Don\'t keep your baby in a bouncer, rocker, or swing for extended periods during awake time — these limit spontaneous movement.',
    ],
    activities: [
      [
        'Tummy Time on Chest',
        'Lie back slightly, place your undressed baby tummy-down on your bare chest. Your heartbeat and warmth calms them while they practice lifting their head.',
        5,
        '3–4x daily',
      ],
      [
        'Floor Kick Time',
        'Lay your baby on a firm, flat surface (play mat) on their back. Hang a simple high-contrast object above them at about 30cm and let them kick and bat freely for a few minutes.',
        5,
        '2x daily',
      ],
    ],
    topics: [
      {
        key: 'tummy_time_resistance',
        patterns: [
          'hates tummy time',
          'cries during tummy time',
          'won\'t do tummy time',
          'how to do tummy time',
          'baby screams on tummy',
        ],
        response: `Almost every parent has a baby who initially protests tummy time — it is hard work, and newborns don\'t have the neck strength to make it comfortable yet. The solution is not to skip it, but to start very short and very supported: 1–2 minutes on your chest, once or twice a day, builds up quickly.\n\nProgression tips: your face at {{child_name}}\'s eye level is the best motivation for head lifting; a rolled towel under their chest takes some of the strain off; placing them on a slightly inclined surface (your thighs, a foam wedge) reduces the difficulty. By 8 weeks most babies are tolerating 3–5 minutes at a stretch once they have some neck strength. The investment in these early weeks pays off in crawling, sitting, and everything that follows.`,
      },
      {
        key: 'equipment_recommendations',
        patterns: [
          'do I need a bouncer',
          'best baby gym',
          'play mat',
          'activity centre',
          'which equipment to buy',
          'baby floor gym',
        ],
        response: `For the first three months, the most important equipment is a firm, safe floor surface — a play mat on the floor. A baby gym with hanging objects above it is genuinely useful from around 6–8 weeks when {{child_name}} begins to notice and bat at things; this builds hand-eye coordination and the intentional reaching that underpins all future fine motor skills.\n\nBouncers, rockers, and swings are comfort tools that are fine for short periods, but should not replace floor time. The more time {{child_name}} spends in a contained seat, the less time they have to move freely and develop postural control. Limit any one containing device to 20–30 minutes at a stretch during awake time.`,
      },
      {
        key: 'normal_reflexes',
        patterns: [
          'baby\'s legs look strange',
          'shaking or jerking',
          'normal baby movements',
          'what are reflexes',
          'baby moving oddly',
          'stepping reflex',
        ],
        response: `Newborns have a rich repertoire of primitive reflexes that can look alarming if you don\'t know they\'re normal: the Moro reflex (arms flung wide at a sudden noise), the stepping reflex (legs making walking motions when held upright), the grasp reflex (iron grip on your finger), and the asymmetric tonic neck reflex (fencer pose when head turns to one side). These are all signs of a healthy nervous system.\n\nThese reflexes gradually integrate — meaning they become controlled rather than automatic — over the first 3–6 months. The Moro reflex integrating by 4–5 months is one of the reasons babies stop startling awake as easily. If {{child_name}} seems to have persistent asymmetry (one side moves much less than the other) or very rigid limbs, that is worth mentioning to your paediatrician — but the vast majority of unusual-looking movements in newborns are entirely normal reflexes.`,
      },
      {
        key: 'delayed_motor_concerns',
        patterns: [
          'not holding head up',
          'floppy baby',
          'low muscle tone',
          'not moving much',
          'head control concern',
          'hypotonia',
        ],
        response: `Head control is the first major gross motor milestone: most babies lift their head to 45 degrees during tummy time by 3 months. If {{child_name}} has noticeably low muscle tone (feels "floppy" when held, head drops significantly with no attempt to control), that is worth raising at your next paediatric visit — ideally before 3 months if it seems pronounced.\n\nA single paediatric review can distinguish between the wide normal range of newborn tone and a pattern that warrants physiotherapy input. Early physiotherapy for low tone is highly effective and can be started before 3 months — so don\'t wait and see if you are concerned. Isolated head lag at 2 months in an otherwise alert baby is often within normal range; head lag persisting past 4 months is more consistently a sign that review is warranted.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_0_lifts_head_tummy',
        'Lifts head to 45 degrees during tummy time',
        8,
        'During tummy time, can {{child_name}} lift their head off the surface — even briefly — and turn it to each side?',
      ],
      [
        'pa_0_tracks_moving_object',
        'Tracks a slowly moving face or object with eyes',
        12,
        'If you slowly move your face or a bright object across {{child_name}}\'s field of vision, do their eyes follow it?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_0_hypotonia',
        description: 'Significant hypotonia (low muscle tone) — "floppy" feel when held, no head control attempt by 3 months, marked asymmetry of movement',
        severity: 'discuss_with_ped',
        pattern:
          'parent describes baby feeling floppy when held, head consistently dropping with no attempt to control, or one side of the body moving much less than the other',
        action:
          'Arrange paediatric review within 2 weeks. Hypotonia may be isolated and benign, or may indicate an underlying neuromuscular condition requiring physiotherapy, investigation, or both. Do not advise parents to "just keep doing tummy time" without assessment.',
        referral: 'Paediatric physiotherapist; paediatric neurologist if hypotonia is significant or accompanied by other neurological signs',
      },
    ],
    coping: {
      normalizations: [
        'Almost every newborn protests tummy time at first — this does not mean they can\'t do it, it means it is hard work and they need you to persist gently.',
        'The first three months feel like survival more than stimulation for many parents — even brief tummy time bouts genuinely matter, and you are doing enough.',
      ],
      strategies: [
        'Link tummy time to a reliable daily event — after the first morning nappy change, or before bath time — so it becomes habit rather than something you have to remember.',
        'Tummy time on your own body (chest, thighs) counts fully and is often more accepted than floor tummy time for the first 4–6 weeks.',
      ],
      selfCare: [
        'Floor time with your baby is also floor time for you — getting down at their level, slowing your pace, and watching their movements is a mindfulness practice, not just a developmental exercise.',
        'If you are too exhausted to do structured activity, a nappy-change kick and a brief tummy-on-chest while you rest are real contributions.',
      ],
      partner:
        'Tummy time is an excellent activity for the non-breastfeeding parent — it requires presence and engagement rather than a specific skill, gives the primary caregiver a break, and builds a one-on-one interaction pattern early.',
      warnings: [
        'If your baby consistently keeps their head to one side during tummy time, or you notice the head has a flat spot developing on one side, mention this to your paediatrician by 6–8 weeks — positional plagiocephaly (flat head) and torticollis (tight neck muscle) are very treatable early and harder to address late.',
        'If you are placing a sleeping baby on their tummy to reduce crying, this is a significant SIDS risk — seek support for settling difficulties rather than using prone sleep as a solution.',
      ],
    },
    evidence:
      'Kuo YL et al (2008) Trunk, head and neck control and early tummy time. Pediatr Phys Ther 20(1):11-7. AAP (2008) Back to sleep, tummy to play. Pediatrics Policy Statement. WHO Motor Development Study Group (2006) WHO Motor Development Study — Multicentre. Acta Paediatr Suppl 450:86-95.',
  },

  // ── 3–6 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '3-6mo',
    ageMin: 3,
    ageMax: 6,
    title: 'Rolling and Reaching: The World Gets Bigger',
    whatToExpect:
      'Between three and six months your baby is building the strength to roll, and the intentionality to reach for objects. Tummy time, which was hard work at 6 weeks, is now yielding visible payoffs — a baby who can push up on their forearms and look around their world with confidence. Floor time remains the priority; supported sitting and exersaucers do not replace it.',
    keyMessage: 'Rolling is a milestone made from months of tummy time investment — keep the floor time going.',
    dailyTips: [
      'Aim for at least 30 minutes of total tummy time per day spread across awake periods — by 5–6 months babies often tolerate 10+ minute bouts.',
      'Place toys just out of reach during floor time to motivate rolling and reaching — the motivation to get something drives the movement.',
      'Let your baby bear weight through their legs when held upright — the supported standing bounce is reflexive and builds leg strength.',
    ],
    doList: [
      'Place interesting objects to the baby\'s side during tummy time — motivating them to roll toward a toy builds the lateral movement pattern.',
      'Allow free time on a safe floor surface — carpet or play mat — without bouncing, swinging, or containment.',
      'Let your baby mouth safe teething toys and household objects during floor time — mouthing is motor learning, not just teething.',
    ],
    dontList: [
      'Don\'t prop a young baby in a sitting position with cushions — they need to build trunk stability through movement, not be held in a position they can\'t yet achieve.',
      'Don\'t rely on an exersaucer or Jumperoo as the primary activity during awake time — these substitutes for floor time delay core development.',
      'Don\'t worry if your baby hasn\'t rolled at exactly 4 months — the range is 3–6 months, and tummy time quality predicts when, not a fixed calendar.',
    ],
    activities: [
      [
        'Motivating Roll Setup',
        'Place your baby on their back. Hold a bright toy at their midline, then slowly move it to one side and slightly down — watch them turn their head and then attempt to roll toward it.',
        8,
        '2–3x daily',
      ],
      [
        'Forearm Push-Up Practice',
        'During tummy time, place a small foam wedge or rolled blanket under their chest to make the forearm prop position easier. Place your face in front and let them work to lift and hold their head up to look at you.',
        5,
        '3–4x daily',
      ],
    ],
    topics: [
      {
        key: 'rolling_milestone',
        patterns: [
          'hasn\'t rolled yet',
          'rolling behind schedule',
          'when do babies roll',
          'not rolling at 5 months',
          'rolling timing',
        ],
        response: `Rolling is one of the most variable milestones — some babies roll at 3 months, others not until 6, and both are entirely normal. The most reliable predictor of when {{child_name}} will roll is how much tummy time they have had — floor time builds the rotational core strength that rolling requires.\n\nIf {{child_name}} is 5–6 months and hasn\'t rolled, increase the daily floor time and specifically set up rolling motivation (interesting toy to one side, assisted partial roll so they feel the movement pattern). If they have not rolled by 6 months despite regular tummy time, that is worth mentioning at their developmental check — occasionally torticollis (tight neck muscle) or other factors are preventing the movement.`,
      },
      {
        key: 'exersaucer_jumperoo',
        patterns: [
          'how long in jumperoo',
          'is exersaucer ok',
          'baby bouncer chair',
          'walker safe',
          'baby walker',
        ],
        response: `Activity equipment like Jumperoos, exersaucers, and baby walkers are popular and widely marketed, but the research is clear: these devices are not motor development tools, they are containment devices. Baby walkers in particular are associated with delayed independent walking and significant injury risk — they are banned in Canada for this reason.\n\nThe guideline for any containing activity device for {{child_name}} is a maximum of 20–30 minutes per stretch during awake time, and never as a substitute for floor time. Floor time — on their tummy and back, free to move — is the only activity that builds the core, hip, and postural control that crawling, sitting, and walking require. The jumperoo is fine for a short entertainment stint while you cook dinner; it should not be the main feature of the day.`,
      },
      {
        key: 'safe_movement_environment',
        patterns: [
          'is the floor safe',
          'floor hygiene',
          'pet and baby on floor',
          'safe play mat',
          'baby fall from surface',
          'roll off changing table',
        ],
        response: `Creating a safe floor movement environment for {{child_name}} is simpler than it might seem: a firm play mat (foam or quilted) on a flat surface is all that\'s needed. The floor is not a hygiene risk for a healthy baby — the brief contact with ordinary household bacteria is part of normal immune development.\n\nThe safety priorities are different: never leave a baby on any elevated surface (changing table, sofa, bed) unattended even for seconds once they are rolling — falls from height are the leading cause of injury in this age group. Keep small objects off the floor within a metre of the baby\'s play area. A pet-baby boundary during floor time is sensible.`,
      },
      {
        key: 'supported_sitting',
        patterns: [
          'when to start sitting',
          'supporting baby to sit',
          'baby sitting practice',
          'how to practice sitting',
          'tripod sitting',
        ],
        response: `Supported sitting practice — where you hold {{child_name}} in a sitting position against your legs or with a gentle ring-sit hold — is fine and enjoyable from about 4 months. The key is that your support substitutes for the trunk strength they don\'t yet have, not that the baby is propped independently by pillows.\n\nGenuine independent sitting (hands-free, stable) typically develops between 6 and 9 months, as the trunk and hip strength built through tummy time matures. Rushing this by propping does not advance the timeline — it just skips the necessary strength-building steps. Continue prioritising tummy time, and sitting will come when the underlying capacity is ready.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_3_rolls_front_to_back',
        'Rolls from tummy to back',
        16,
        'Has {{child_name}} managed to roll from their tummy to their back — even once, even accidentally?',
      ],
      [
        'pa_3_reaches_and_grasps',
        'Reaches for and grasps an object intentionally',
        18,
        'Can {{child_name}} reach out deliberately to grab a toy held in front of them?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_3_persistent_asymmetry',
        description: 'Persistent head turn preference or asymmetric movement — one side significantly less used than the other',
        severity: 'discuss_with_ped',
        pattern:
          'parent notes baby always turns head to one side, one hand consistently more fisted, one leg kicking less than the other, or persistent flat spot on skull',
        action:
          'Refer for paediatric physiotherapy assessment. Asymmetric movement can indicate torticollis, hemiplegic cerebral palsy, or other motor asymmetries. Early physiotherapy input is highly effective and should not be delayed.',
        referral: 'Paediatric physiotherapist; paediatric neurologist if asymmetry is pronounced or accompanied by other neurological signs',
      },
    ],
    coping: {
      normalizations: [
        'The range for rolling is genuinely 3–6 months — a baby not rolling at 4 months is very likely simply not there yet, rather than delayed.',
        'Floor time feels repetitive and unstimulating to many parents — it is, from your perspective. From your baby\'s perspective, it is hard physical work and constant discovery.',
      ],
      strategies: [
        'If floor time feels like a chore, make it social — get on the floor yourself with your phone down, lie at your baby\'s level, and use it as your own five minutes of quiet.',
        'Rotate two or three interesting floor toys rather than having many available — novelty drives engagement and extends the time your baby will stay on the floor independently.',
      ],
      selfCare: [
        'Floor time is one of the few baby activities that requires your presence but not your active engagement — it is a legitimate time to sit nearby, read, or rest while your baby moves.',
        'You don\'t need to fill all of your baby\'s awake time with activity — some calm unstructured observation time is fine and normal.',
      ],
      partner:
        'Floor time is a great activity for a partner to take ownership of during their time with the baby — it is important, has clear instructions, and builds confidence in physical play that tends to be a strength of many fathers and secondary caregivers.',
      warnings: [
        'If your baby has a noticeable flat spot on their skull (positional plagiocephaly) developing, additional tummy time and alternating head position during sleep and floor time are the first interventions — but a paediatric review before 4 months gives the best window for repositioning guidance and, if needed, helmet therapy.',
        'Baby walkers are not recommended and are associated with motor delays and injury — if family or grandparents are using one, it is worth a gentle but firm conversation about the evidence.',
      ],
    },
    evidence:
      'Majnemer A & Barr RG (2005) Influence of supine sleep positioning on early motor milestone acquisition. Dev Med Child Neurol 47(6):370-6. Bartlett D (1997) Primitive reflexes and early motor development. J Dev Behav Pediatr 18(3):151-7. AAP (2011) The importance of play. Pediatrics 129(1):e204.',
  },

  // ── 6–12 months ─────────────────────────────────────────────────────────────
  {
    agePeriod: '6-12mo',
    ageMin: 6,
    ageMax: 12,
    title: 'On the Move: Crawling, Cruising, First Steps',
    whatToExpect:
      'The second half of the first year is one of the most motorically eventful periods in human development. Most babies go from sitting to crawling to pulling up to cruising to first steps — all within six months. The variety of motor paths to walking (bottom shuffling, bear crawling, going straight from sitting to walking, skipping crawling) is wider than most parents realise, and all are normal.',
    keyMessage: 'Safe exploration is more important than any specific milestone timing — baby-proof and let them go.',
    dailyTips: [
      'Baby-proof at floor level now — get on your hands and knees and look at what your baby can reach once they start moving.',
      'Let your baby explore different surfaces — carpet, hardwood, grass, sand — each one challenges balance and motor control differently.',
      'Climbing is normal and important at this age — a low foam step, couch cushions on the floor, or a small slide all challenge the motor system safely.',
    ],
    doList: [
      'Give your baby maximum floor freedom during safe awake time — gates and baby-proof zones are better than physical containment.',
      'Let them practice pulling to stand using furniture — hold your hands, sofa, coffee table — this is normal and builds leg and core strength.',
      'Bare feet on varied surfaces builds proprioception and balance far better than shoes — minimise footwear indoors.',
    ],
    dontList: [
      'Don\'t hold your baby upright to "help" them walk before they can pull to stand independently — this bypasses necessary strength development.',
      'Don\'t use baby walkers — they are banned in Canada and associated with walking delays and serious injury.',
      'Don\'t limit climbing out of fear — safe low-level climbing challenge is how balance and spatial awareness develop.',
    ],
    activities: [
      [
        'Chase and Crawl',
        'Get on the floor and crawl away from or toward your baby, encouraging them to crawl after you. Your movement is the best motivation for their movement.',
        10,
        'Daily',
      ],
      [
        'Obstacle Course',
        'Set up a simple "course" of couch cushions to crawl over, a low box to pull up on, and a toy at the other end. This challenges multiple motor skills simultaneously in a playful context.',
        15,
        '3x weekly',
      ],
    ],
    topics: [
      {
        key: 'crawling_variations',
        patterns: [
          'not crawling on hands and knees',
          'bottom shuffler',
          'bear crawling',
          'skipping crawling',
          'army crawling',
          'will they walk without crawling',
        ],
        response: `Classic hands-and-knees crawling is only one of many normal motor paths — {{child_name}} may army-crawl (on belly, pulling with arms), bear-crawl (on hands and feet with straight legs), bottom-shuffle, roll to get places, or go directly from sitting to pulling up to walking without conventional crawling at all. All of these are recognised normal variants.\n\nThe only pattern that warrants a paediatric review is a baby who is not mobile at all by 9–10 months — regardless of how they move, some form of independent locomotion should be emerging. If {{child_name}} is a bottom shuffler, note that walking typically comes 3–6 months later than crawlers — this is normal for shufflers, and is not a delay.`,
      },
      {
        key: 'first_steps_timing',
        patterns: [
          'when will baby walk',
          'not walking yet',
          'walking late',
          'average age to walk',
          'still not walking at 12 months',
          'walking timeline',
        ],
        response: `The typical range for first independent steps is 9–15 months, with the WHO's largest multi-centre study finding 50% of babies walking by 12 months and 97.5% by 15 months. {{child_name}} not walking at 12 months is common and normal — "not yet walking at 12 months" is not the same as "delayed walking."\n\nThe developmental sequence matters more than the calendar date: sitting independently (6–9 months) → pulling to stand (8–10 months) → cruising along furniture (9–12 months) → independent steps (9–15 months). A baby following this sequence is on track. If {{child_name}} is not pulling to stand by 12 months, a developmental check is appropriate.`,
      },
      {
        key: 'safety_and_exploration',
        patterns: [
          'baby climbing everything',
          'climbing out of cot',
          'how to baby-proof',
          'baby falling while trying to stand',
          'afraid of letting them explore',
        ],
        response: `{{child_name}} is entering the most physically explorative period of development, and some falls and bumps are inevitable and normal — minor tumbles while learning to stand, cruise, and walk are part of the process. The goal is not a fall-free environment but an environment where serious falls (down stairs, from height) are prevented while minor learning falls are allowed.\n\nBaby-proofing priorities at this stage: stair gates (top and bottom), sharp corner guards on coffee tables, securing heavy furniture to walls (tip-over risk), and keeping small objects off the floor. Allow falls onto padded surfaces — carpet, play mat. Falling and recovering is how proprioception and balance calibrate. Hovering and catching every stumble prevents the sensory learning that makes them more stable.`,
      },
      {
        key: 'shoes_for_new_walkers',
        patterns: [
          'when to buy first shoes',
          'do babies need shoes',
          'best shoes for walking',
          'foot support for babies',
          'soft sole shoes',
        ],
        response: `Bare feet are the best "shoe" for a new walker — the proprioceptive information from the foot contacting the ground directly builds balance and arch strength more effectively than any shoe. When outdoors or on cold/rough surfaces require foot protection, a flexible sole that allows the foot to feel and flex is the evidence-based recommendation.\n\nAvoid rigid-soled shoes, shoes with significant heel raise, and shoes that are "supportive" in the sense of being stiff. A paediatric physiotherapist or orthotist is the right person to advise if you have concerns about {{child_name}}\'s arch or gait — routine "supportive shoes" for normal walkers are not recommended by current paediatric podiatry guidelines.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_6_sits_independently',
        'Sits independently without support for 30+ seconds',
        28,
        'Can {{child_name}} sit on the floor without any support and maintain their balance for at least 30 seconds?',
      ],
      [
        'pa_6_pulls_to_stand',
        'Pulls to standing position using furniture',
        36,
        'Can {{child_name}} use furniture (sofa, coffee table, your hands) to pull themselves up to a standing position?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_6_not_mobile_9mo',
        description: 'No form of independent locomotion (crawling, shuffling, rolling to move) by 9 months',
        severity: 'discuss_with_ped',
        pattern:
          'parent reports baby is not moving independently at all at 9 months — not crawling, not bottom shuffling, not rolling to move across the room; baby is content to stay in one position',
        action:
          'Arrange paediatric developmental review. Assess sitting balance, pull-to-stand, and motor quality. Refer to paediatric physiotherapy. Rule out hypotonia, developmental coordination disorder, or other motor conditions.',
        referral: 'Paediatric physiotherapist; paediatric neurologist if hypotonia or abnormal motor quality noted',
      },
    ],
    coping: {
      normalizations: [
        'The range for walking (9–15 months) is so wide that comparing your baby to others at the same age is almost meaningless — a 10-month walker and a 14-month walker are both normal.',
        'Falls and bumps while learning to move are not parenting failures; they are the physics of learning a new skill.',
      ],
      strategies: [
        'Baby-proofing thoroughly and then relaxing is better than constant hovering — decide what the actual risks are, remove them, and then allow exploration confidently.',
        'If you find yourself anxious about motor milestones, focus on the sequence (is each step happening eventually?) rather than the calendar date.',
      ],
      selfCare: [
        'Floor time with a mobile baby is exhausting in a different way from newborn floor time — the baby moves, you follow. Building in a safe enclosed play space where you can relax for short periods is not neglect, it is sustainable parenting.',
        'Getting outside with a mobile baby — a park, a garden — changes the quality of exploration dramatically and is beneficial for both of you.',
      ],
      partner:
        'Physical play — rougher, bouncier, on-the-floor-chasing — tends to be a mode in which many fathers and secondary caregivers naturally excel and which has distinct developmental value. This is a great space for the second parent to take the lead.',
      warnings: [
        'If your baby is not walking by 18 months (the outer edge of the normal range), a paediatric developmental assessment is warranted regardless of other development.',
        'If you are using a baby walker because it seems to speed up walking — the opposite is true. Baby walkers are associated with delayed independent walking by 3–4 weeks on average.',
      ],
    },
    evidence:
      'WHO Motor Development Study Group (2006) WHO Motor Development Study — Multicentre. Acta Paediatr Suppl 450:86-95. Rao SS (2017) Crawling: a developmental milestone. Pediatrics 139(5). Smith LB (2005) Cognition as a dynamic system. Developmental Science 8:1. Yang JF & Stephens MJ (1990) Spinal cord connections in early walking. J Neurophysiol 64(5).',
  },

  // ── 12–24 months ────────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'Walking Mastery: The World at Their Feet',
    whatToExpect:
      'Once walking begins, the motor development in the second year is explosive — from wobbly first steps to running, jumping, climbing, and manipulating objects with increasing precision. The critical thing to know is that toddlers are built to move constantly, and restricting that movement in the service of a tidy house or a quiet outing has real developmental costs.',
    keyMessage: 'Outdoor time every day, regardless of weather, is not a luxury — it is the developmentally appropriate environment for a walking toddler.',
    dailyTips: [
      'Aim for at least 3 hours of physical activity per day (WHO recommendation for 1–2 year olds) spread across the day — this sounds like a lot but includes all the incidental moving, walking, and playing.',
      'Outdoor play on varied terrain (grass, gravel, hills) challenges balance and proprioception far more than flat indoor surfaces.',
      'Let your toddler walk rather than riding in the pram on short trips — slow, meandering toddler-paced walking is a real motor challenge.',
    ],
    doList: [
      'Provide opportunities for climbing — a low climbing frame, playground equipment, indoor foam blocks — this builds spatial awareness and risk assessment.',
      'Let your toddler carry, push, and pull things — wheelbarrows, toy prams, stacking things — these are the precursors to coordination.',
      'Dance together regularly — movement to music builds rhythm, coordination, and bilateral integration.',
    ],
    dontList: [
      'Don\'t use screen time as the primary indoor activity — the WHO recommends no screen time for children under 2 (sedentary) and this is the age where movement habits are forming.',
      'Don\'t avoid outdoor play because of mild weather — appropriate clothing and a positive parental attitude transforms rain from a problem into an adventure.',
      'Don\'t tell a toddler to "stop running" indoors without offering a safe outdoor running outlet — the need to run is real and suppressing it creates pressure.',
    ],
    activities: [
      [
        'Outdoor Exploration Walk',
        'A daily walk with no destination — let your toddler lead, stop at anything interesting, climb things, pick up sticks. This is not exercise in an adult sense; it is motor and sensory exploration.',
        30,
        'Daily',
      ],
      [
        'Movement Music Session',
        'Put on music and follow your toddler\'s movements, or demonstrate simple actions — stomping, spinning, jumping — for them to copy. Copycatting builds motor planning.',
        10,
        'Daily',
      ],
    ],
    topics: [
      {
        key: 'running_and_climbing_safety',
        patterns: [
          'toddler won\'t stop running',
          'climbs everything',
          'fearless child',
          'climbing danger',
          'how to handle running inside',
          'toddler risk taking',
        ],
        response: `A toddler who runs everywhere and climbs everything is not being "badly behaved" — they are doing exactly what the human developmental programme calls for at this age. The drive to test physical limits is how risk assessment, balance, and spatial awareness develop. Completely preventing challenge does more harm than allowing age-appropriate risk.\n\nThe practical frame: distinguish between risky (significant injury potential — height above 1m, traffic, water, hard surfaces) and adventurous (bumps, falls on grass, low climbing). Remove real risks, enable adventurous play. A rule of "you can climb that, but check your landing spot first" starts building {{child_name}}\'s own risk assessment from this age.`,
      },
      {
        key: 'screen_time_and_movement',
        patterns: [
          'too much TV',
          'toddler and screen time',
          'iPad for toddler',
          'screen time limits',
          'replacing activity with screens',
          'educational apps toddler',
        ],
        response: `Screen time under 2 years is not recommended because it displaces the thing this age needs most: physical movement and direct human interaction. A toddler watching a screen is sitting still; the same time spent on the floor, at the playground, or in outdoor play builds motor, language, and cognitive development simultaneously.\n\nThe practical reality is that most families do use some screen time before 2 — the most useful approach is to treat it as a structured short window (20–30 minutes maximum) rather than a background feature, always watched with an adult who narrates and responds, never used to replace active play time. The goal is not perfection; it is that screen time isn\'t taking the place of movement.`,
      },
      {
        key: 'playground_readiness',
        patterns: [
          'when can they use playground',
          'playground safety',
          'equipment age appropriate',
          'toddler playground',
          'managing playground risks',
        ],
        response: `The playground is one of the most developmentally rich environments for {{child_name}} at this age — challenge, social observation, physical risk, and joy all in one space. Age-appropriate playground use from walking age (12 months+) is safe with a present adult, even when the equipment looks challenging.\n\nThe research on playground risk is clear: moderate challenge (equipment that is slightly above current ability) drives the most development and is the most engaging. The supervisor\'s role is to stay close enough to prevent serious falls but far enough to let {{child_name}} attempt things independently. Physically guiding every step prevents the balance and problem-solving that the playground is there to provide.`,
      },
      {
        key: 'physical_activity_guidelines',
        patterns: [
          'how much exercise for toddler',
          'activity recommendations',
          'is my toddler active enough',
          'screen time limits guidelines',
          'WHO activity guidelines',
        ],
        response: `The WHO and most national guidelines recommend that 1–2 year olds accumulate at least 3 hours of physical activity per day of any intensity — this includes all the incidental movement of a normal day (walking, playing, climbing) rather than structured exercise.\n\nFor {{child_name}}, this is less about engineering activities and more about not restricting them: time in a pram or carseat should be minimised; floor time and outdoor play should be maximised; screen time should be minimal and not replace movement. If {{child_name}} has access to outdoor space, a park, or even a garden for part of every day, they are almost certainly meeting these guidelines naturally.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_12_walks_independently',
        'Walks independently across a room',
        15,
        'Can {{child_name}} walk independently across the room without holding on to anything?',
      ],
      [
        'pa_12_runs_and_kicks',
        'Runs and can kick a ball',
        24,
        'Can {{child_name}} run (even clumsily) and kick a large ball when it is placed in front of them?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_12_not_walking_18mo',
        description: 'Not walking independently by 18 months',
        severity: 'discuss_with_ped',
        pattern:
          'child is 18 months and still not taking independent steps, or quality of walking is very abnormal (persistent toe-walking, asymmetric gait, frequent unexplained falls)',
        action:
          'Arrange paediatric developmental assessment. Evaluate for motor delay, low tone, orthopaedic issues, or developmental coordination disorder. Refer to paediatric physiotherapy.',
        referral: 'Paediatric physiotherapist; paediatric orthopaedic surgeon if structural concerns; paediatric neurologist if abnormal tone or reflexes',
      },
    ],
    coping: {
      normalizations: [
        'A toddler who never stops moving, climbs things, and runs away in public is developmentally healthy — the exhaustion you feel is real, and it is a sign of a well-developing child.',
        'Outdoor play in all weather with a toddler is hard. Having the right clothing for the child (not you) removes the main barrier.',
      ],
      strategies: [
        'Choose an outdoor space you can go to every day without a lot of preparation — even a small safe outdoor area where your toddler can run is enough.',
        'Connecting with another family with a toddler of the same age transforms outdoor time from a chore into social time for you and movement time for them simultaneously.',
      ],
      selfCare: [
        'The physical demand of keeping up with an active toddler is real — this is exercise for you too, and builds your own physical condition alongside theirs.',
        'If you are extremely sedentary yourself, following a toddler\'s movement needs can feel overwhelming — start with a daily short walk and build from there.',
      ],
      partner:
        'Active outdoor play with a toddler is a space where both parents can be genuinely involved and where the physical energy of the child can be matched — going to the park together as a family is a different (and better) experience than one parent managing it alone.',
      warnings: [
        'If your toddler is spending more than 1–2 hours per day in a pram, car seat, high chair, or bouncer/rocker during waking hours, that is worth reducing — the sedentary time is at the expense of motor development.',
        'If your toddler is showing persistent toe-walking (never putting the heel down) past 24 months, this is worth a physiotherapy and developmental review — most toe-walking is habitual but some is associated with motor or sensory processing differences.',
      ],
    },
    evidence:
      'WHO (2019) Guidelines on physical activity, sedentary behaviour and sleep for children under 5 years. Burdette HL & Whitaker RC (2005) Resurrecting free play in young children. Arch Pediatr Adolesc Med 159(1):46-50. Hanscom A (2016) Balanced and Barefoot — How unrestricted outdoor play makes for strong, confident, and capable children.',
  },

  // ── 2–3 years ────────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'Running, Jumping, Pedalling: Big Movement Energy',
    whatToExpect:
      'Two-year-olds run, jump, throw, and climb with enormous enthusiasm and limited accuracy — and that is exactly right. The gross motor skills of this period are foundational: bilateral coordination (using both sides of the body together), dynamic balance, and the control needed for throwing, catching, and pedalling develop through repetitive playful practice that looks like chaos but is rigorous motor training.',
    keyMessage: '3 hours of movement per day is the goal — most of it looks like play, and all of it is development.',
    dailyTips: [
      'Include a ball activity most days — kicking, rolling, throwing, and chasing a ball builds the dynamic coordination that underlies all sports and team play.',
      'Tricycles, balance bikes, and push toys build the precursor skills to two-wheel cycling — no specific age is right, but most toddlers can manage a balance bike from 18 months.',
      'Playgrounds, parks, and any open outdoor space are the ideal environments for this age — flat, indoor, screen-based alternatives cannot match the motor challenge of varied outdoor terrain.',
    ],
    doList: [
      'Teach your toddler to jump with two feet together — a simple trampoline, mattress, or cushion on the floor provides the fun repetition needed to master this.',
      'Model movement yourself — children whose parents are physically active are more active themselves.',
      'Let your toddler lead physical play rather than organising structured exercise — intrinsic motivation produces the most repetition, and repetition is how skill develops.',
    ],
    dontList: [
      'Don\'t limit outdoor play because of falls — two-year-olds fall constantly and it is normal; scrapes and bruises are the acceptable cost of motor development.',
      'Don\'t compare your child\'s athletic ability to peers — there is enormous normal variation in gross motor skill at this age that has no predictive value for later athletic ability.',
      'Don\'t start structured sport at this age expecting skill development — the goal of any sport or class at 2–3 is fun and movement, not technique.',
    ],
    activities: [
      [
        'Ball Skills Circuit',
        'Set up three simple stations: kick the ball into a net, roll it down a slope, throw it into a bucket. Spend a few minutes at each. Rotate positions and have fun — no instruction, just opportunity.',
        15,
        '3x weekly',
      ],
      [
        'Balance Beam Walk',
        'Use a plank of wood, a line of masking tape, or a low garden wall as a balance beam. Walk along it forward, then backward. Hold their hand as needed but let them feel the balance challenge.',
        10,
        'Daily when outside',
      ],
    ],
    topics: [
      {
        key: 'physical_development_concerns',
        patterns: [
          'clumsy toddler',
          'falling a lot',
          'poor coordination',
          'not jumping yet',
          'gross motor delay',
          'physio referral',
        ],
        response: `Clumsiness is extremely normal at this age — two-year-olds are operating brand-new equipment (their bodies) at maximum speed without much spatial awareness yet. Frequent falls, bumping into things, and misjudging distances are expected features of normal development, not signs of coordination problems.\n\nThe patterns that warrant a look: if {{child_name}} is falling in a way that seems neurological (sudden drop-falls without any stumble), if one side of the body is consistently less coordinated than the other, or if gross motor skills are significantly behind speech, cognition, and fine motor development — then a paediatric developmental assessment is worthwhile. Isolated clumsiness in an otherwise developing 2-year-old is almost always normal.`,
      },
      {
        key: 'balance_bike_vs_training_wheels',
        patterns: [
          'balance bike vs tricycle',
          'training wheels',
          'when to start cycling',
          'balance bike age',
          'learning to ride a bike',
        ],
        response: `Balance bikes — where the child uses their feet to propel and balance rather than pedalling — are consistently shown to produce faster, easier, more confident transition to two-wheel cycling than training wheels. Training wheels teach pedalling but not balance; balance bikes teach balance first, and the pedalling component comes quickly when they are ready.\n\nFor {{child_name}}, a balance bike with the seat set so their feet are flat on the ground is appropriate from around 18 months for curious early movers, and standard from 2 years. Helmet from the first ride. Most children who start with a balance bike transition to a pedal bike without training wheels between 3 and 5 years.`,
      },
      {
        key: 'sport_classes_age_appropriate',
        patterns: [
          'should I start sport classes',
          'swimming lessons',
          'gymnastics for toddler',
          'football for 2 year old',
          'best sport for toddler',
        ],
        response: `Sport and movement classes for 2–3 year olds can be genuinely fun and socially enriching, but the developmental value depends entirely on the quality — specifically, whether they are child-led, playful, and non-pressured. At this age, the goal of any organised activity should be joy and basic movement exploration, not skill acquisition or competition.\n\nSwimming lessons are an exception — water safety and basic swimming competence are genuine risk-reduction priorities, and most aquatic programmes for 2–3 year olds are well-designed for this age. For everything else (gymnastics, football, dance), the criterion is: does {{child_name}} leave smiling and wanting to come back? That is the measure of success at this age.`,
      },
      {
        key: 'weather_outdoor_barriers',
        patterns: [
          'too cold to go outside',
          'outdoor play in rain',
          'no outdoor space',
          'apartment no garden',
          'indoor alternatives',
        ],
        response: `The Scandinavian saying "there is no bad weather, only bad clothing" has a developmental truth to it — children who go outside in all weather develop adaptability, sensory resilience, and a relationship with the natural world that matters. Appropriate waterproofing (wellies, rain suit) transforms rain from a barrier to an adventure.\n\nFor families without a garden or park nearby, community indoor play spaces, children\'s gyms, and soft-play centres serve the movement function well for short periods. The movement principle is more important than the location — even a long corridor, a stairwell, or a safe indoor open space serves the need if outdoors genuinely isn\'t accessible that day.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_2yr_jumps_two_feet',
        'Jumps with both feet leaving the ground',
        30,
        'Can {{child_name}} jump off the ground with both feet leaving the surface simultaneously?',
      ],
      [
        'pa_2yr_pedals_tricycle',
        'Pedals a tricycle or balance bike',
        36,
        'Can {{child_name}} pedal a tricycle forward, or propel a balance bike using their feet in a coordinated way?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_2yr_motor_regression',
        description: 'Loss of previously acquired motor skills (regression), or very significant gross motor delay compared to language and social development',
        severity: 'urgent_referral',
        pattern:
          'parent describes child who was walking and has stopped, or is falling far more than peers with apparent loss of balance, or gross motor skills are significantly behind in a child with otherwise good development',
        action:
          'Motor regression (loss of skills already acquired) is always a red flag requiring urgent review. Do not attribute to tiredness or behavioural change. Arrange paediatric assessment within days.',
        referral: 'Urgent paediatric review; paediatric neurologist; physiotherapist',
      },
    ],
    coping: {
      normalizations: [
        'The energy level of a 2–3 year old exceeds that of most adults — this is correct development, not hyperactivity, and it will modulate as they grow.',
        'Two-year-olds have limited ability to stop and rest when they are overstimulated — meltdowns after high-activity days are physical, not behavioural.',
      ],
      strategies: [
        'Build a predictable outdoor time into the daily routine (same time, same place if possible) — predictability reduces the negotiation fatigue around "can we go outside."',
        'Physical activity before meals or naps can improve appetite and sleep — it is worth experimenting with timing.',
      ],
      selfCare: [
        'Being outside with an active toddler every day is genuinely tiring — connecting with another family so you have adult conversation alongside toddler play makes it sustainable.',
        'Your own physical activity increases when you follow a toddler around outside — treat it as an unplanned exercise session rather than a chore.',
      ],
      partner:
        'Active rougher play — chasing, wrestling, bouncing — is a mode that many fathers and secondary caregivers naturally gravitate to and that research shows is distinctly valuable for coordination and risk assessment. Encourage and protect this time.',
      warnings: [
        'If your 2–3 year old seems genuinely unable to sit for even a short picture book or a quiet meal without extreme physical restlessness, this is worth mentioning to your paediatrician — it can sometimes be an early sign of sensory processing differences or ADHD.',
        'If a child of this age is spending more than 1 hour per day in a seated/prone screen-watching position, the movement time is likely being displaced in a way that has real developmental consequences.',
      ],
    },
    evidence:
      'WHO (2019) Guidelines on physical activity, sedentary behaviour and sleep for children under 5. Poest CA et al (1990) Challenge me to move: large muscle development in toddlers. Young Children 45(5):4-10. Becker DR et al (2014) Physical activity, self-regulation, and early academic achievement in preschool children. Early Education and Development 25(1):56-70.',
  },

  // ── 3–5 years ────────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'Coordination, Swimming, and Sport Sampling',
    whatToExpect:
      'Preschool-age children develop the fundamental movement skills — running, jumping, hopping, skipping, throwing, catching, kicking, and striking — that are the building blocks for all sport and physical activity in later life. Getting these fundamental skills broadly established before age 6 is one of the strongest predictors of lifelong physical activity participation.',
    keyMessage: 'Sample widely, specialise never — the preschool years are for building a wide movement vocabulary, not mastering one activity.',
    dailyTips: [
      'Aim for 3 hours of physical activity per day, including at least 60 minutes of energetic play (running, jumping, climbing).',
      'Swimming lessons by age 4 is a water safety priority — drowning is one of the leading causes of accidental death in children, and early swimming skills are genuinely life-saving.',
      'Unstructured outdoor play — the kind where children invent their own games — produces more motor and social development than the same time in a structured class.',
    ],
    doList: [
      'Offer a variety of movement experiences over the year — swimming, ball sports, dancing, climbing, gymnastics, running — without pressure or competition.',
      'Let your child choose which activities to continue based on enjoyment, not parent preference or perceived talent.',
      'Create daily unstructured outdoor play time alongside any structured classes.',
    ],
    dontList: [
      'Don\'t specialise in a single sport before age 6 — early specialisation is associated with higher injury rates and burnout, not better long-term outcomes.',
      'Don\'t prioritise winning or performance at this age — the goal is loving movement, not being good at it.',
      'Don\'t fill every afternoon with structured activities — unstructured play time is as developmentally important as organised sport.',
    ],
    activities: [
      [
        'Fundamental Skills Circuit',
        'Set up five simple stations outdoors: sprint to a cone and back, jump over a line, kick a ball into a net, throw a beanbag at a target, balance on one foot. Rotate every 2 minutes. Keep it silly and fun.',
        20,
        '2–3x weekly',
      ],
      [
        'Water Play and Swimming',
        'Regular pool time — swimming lessons, pool play, or a paddling pool. Water confidence is a safety and skill priority. Even splashing and floating counts.',
        30,
        'Weekly',
      ],
    ],
    topics: [
      {
        key: 'sport_sampling',
        patterns: [
          'which sport should they do',
          'best sport for kids',
          'too many activities',
          'starting football',
          'ballet or swimming',
          'how many classes',
        ],
        response: `The research on early sport participation is clear on one point: sampling multiple activities rather than specialising in one produces better long-term outcomes — both athletic and psychological. For {{child_name}} at 3–5 years, the question is not "which sport are they best at" but "how many different ways can they experience enjoyable movement?"\n\nA practical rule of thumb: one or two structured activities per week maximum, one of which should be swimming for water safety reasons. Everything else should be unstructured outdoor play. Activities should be chosen based on {{child_name}}\'s enthusiasm and changed without guilt if enthusiasm fades — dropout at this age is developmentally appropriate, not a character flaw.`,
      },
      {
        key: 'swimming_lessons',
        patterns: [
          'when to start swimming',
          'swim school',
          'fear of water',
          'water safety',
          'afraid of pool',
          'swim readiness',
        ],
        response: `Swimming competence is a genuine safety intervention — drowning is one of the leading causes of preventable child death, and children who can swim are significantly less likely to drown. The recommendation to start swimming lessons by age 4 is well-supported by evidence, and many programmes accommodate 3-year-olds and even younger children with parent participation.\n\nFor {{child_name}} who is anxious about water, parent-and-child lessons are the gentlest entry point. The progression from water comfort to floating to stroke development takes months to years — the immediate goal is water safety (floating on back, getting to the pool edge) rather than swimming elegantly. Consistent weekly practice throughout childhood, even if just for 30 minutes, builds this skill cumulatively.`,
      },
      {
        key: 'screen_activity_balance_preschool',
        patterns: [
          'too much screen time',
          'iPad instead of playing',
          'physical activity vs screens',
          'managing screen time',
          'screens and children',
        ],
        response: `Screen time guidelines for 3–5 year olds (maximum 1 hour per day of high-quality content) exist because screen time at this age predominantly displaces movement, outdoor play, and direct human interaction — all of which drive development more powerfully than any screen content.\n\nThe practical management approach for {{child_name}} is environmental rather than willpower-based: if screens aren\'t easily accessible, children occupy themselves with movement and play. Making outdoor play the default and screens the exception (a specific time, not a background state) is easier to maintain than per-day time limits. Physical activity after screen time also helps regulate the higher arousal that often follows screen exposure.`,
      },
      {
        key: 'sport_pressure_from_family',
        patterns: [
          'grandfather wants them to play cricket',
          'pushing child into sport',
          'child doesn\'t want to play sport',
          'sport anxiety child',
          'performance pressure at young age',
        ],
        response: `Family enthusiasm for sport is understandable — but pressure to perform, specialise, or continue activities against the child\'s will at preschool age is consistently associated with sport dropout, burnout, and reduced physical activity in adolescence. The evidence for early specialisation producing long-term athletic advantage is weak.\n\nFor {{child_name}}, the non-negotiable message to family members is: enjoyment is the metric of success at this age. A child who loves movement in many forms is a far better long-term physical activity outcome than a child who is technically proficient in one sport and burned out by 10. Sharing this evidence with well-meaning family members is a reasonable and scientifically supported position.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_3yr_hops_one_foot',
        'Hops on one foot at least 5 times',
        54,
        'Can {{child_name}} hop on one foot at least 5 times in a row without losing balance?',
      ],
      [
        'pa_3yr_catches_ball',
        'Catches a large ball thrown from 2 metres',
        60,
        'Can {{child_name}} catch a large ball thrown gently from about 2 metres away, using both hands?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_3yr_dcd_signs',
        description: 'Significant difficulty with age-expected movement skills suggesting Developmental Coordination Disorder (DCD)',
        severity: 'discuss_with_ped',
        pattern:
          'child aged 4–5 cannot hop, has significant difficulty catching a ball, seems extremely clumsy compared to all peers, struggles with dressing (buttons, zips) and drawing/cutting in addition to gross motor difficulties',
        action:
          'Arrange paediatric assessment for Developmental Coordination Disorder (DCD), also called dyspraxia. DCD is a recognised condition affecting 5–6% of children and responds well to occupational therapy intervention. Do not dismiss as "just clumsy."',
        referral: 'Paediatric occupational therapist; developmental paediatrician for diagnosis; physiotherapist if gross motor component is significant',
      },
    ],
    coping: {
      normalizations: [
        'A 4-year-old who "can\'t catch" is completely normal — catching is one of the hardest fundamental movement skills and typically doesn\'t consolidate until 5–6 years.',
        'Children at this age love movement one day and refuse to go outside the next — this variability is normal and does not predict long-term physical activity habits.',
      ],
      strategies: [
        'If you are managing an activity the child no longer wants to attend, give it two or three sessions after a break before cancelling — enthusiasm often returns. If it doesn\'t, let go without guilt.',
        'Having a mix of structured and unstructured movement each week prevents over-reliance on organised activity and builds the self-directed play skill that underpins intrinsic physical motivation.',
      ],
      selfCare: [
        'Being physically active alongside your child — cycling together, kicking a ball, swimming — models that movement is a normal and enjoyable part of adult life.',
        'Activity logistics (lesson registrations, kit, driving) can feel overwhelming alongside everything else — simplifying to one external activity and maximising outdoor free play reduces the coordination burden.',
      ],
      partner:
        'Sport and outdoor adventure tend to be domains where both parents have strong opinions — agreeing that the child\'s enjoyment rather than either parent\'s sporting preference drives activity choices prevents conflict and protects the child\'s relationship with movement.',
      warnings: [
        'If your child is consistently avoiding physical activity, preferring sedentary indoor activities in all circumstances, and showing reluctance to run or play with peers over several months, a developmental and sensory processing assessment is worth requesting.',
        'If competitive pressure (from a parent, grandparent, or coach) is making your child anxious before classes or refusing to attend, this is worth taking seriously — anxiety around performance at 3–5 years is an early sign of the sport dropout trajectory.',
      ],
    },
    evidence:
      'Côté J & Vierimaa M (2014) The developmental model of sport participation. Psychology of Sport and Exercise 15(1):83-90. Barnett LM et al (2008) Childhood motor skill proficiency as a predictor of adolescent physical activity. J Adolesc Health 42(2):130-138. WHO (2019) Guidelines on physical activity, sedentary behaviour and sleep for children under 5.',
  },

  // ── 5–8 years ────────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'Organised Sports Intro and Fundamental Movement Mastery',
    whatToExpect:
      'School age brings formal organised sport into the picture — team sports, school PE, structured lessons — alongside growing peer influence on activity choices. The fundamental movement skills established in the preschool years are now being applied in more complex contexts, and physical activity habits formed now are highly predictive of activity levels throughout life.',
    keyMessage: '60 minutes of moderate-to-vigorous physical activity daily is the minimum — build it into the daily rhythm, not just weekends.',
    dailyTips: [
      'Active travel to school (walking, cycling, scootering) is one of the most reliable daily activity sources — even 10 minutes each way matters.',
      'The immediate after-school period is the natural time for outdoor active play — take advantage of it before homework or screens.',
      'Encourage your child to choose activities they enjoy enough to do voluntarily, not only structured classes.',
    ],
    doList: [
      'Aim for 60 minutes of moderate-to-vigorous physical activity per day as per WHO guidelines — including bone-strengthening activity (running, jumping) 3 days per week.',
      'Sample a variety of sports and movement types over the year — team sports, individual sports, outdoor recreation, dance.',
      'Involve your child in choosing activities — intrinsic motivation is the most reliable predictor of sustained participation.',
    ],
    dontList: [
      'Don\'t specialise your child in a single sport before age 9–10 — the evidence for early specialisation producing elite outcomes is weak, and the burnout and injury risk is real.',
      'Don\'t overload the schedule with activities — children need unstructured play time, and overscheduling drives sport dropout.',
      'Don\'t tie screen time limits to sport participation in a punitive way — this reduces intrinsic motivation for physical activity.',
    ],
    activities: [
      [
        'Active Transport Week',
        'For one week, count how many days you can walk, cycle, or scooter to school. Make it a family challenge — each active day gets a tick on a chart. Note: this is about habit formation, not competition.',
        15,
        'Daily if possible',
      ],
      [
        'Saturday Outdoor Adventure',
        'One outdoor activity per week that is not structured sport — a hike, a nature walk, cycling a trail, a swimming session, a beach day. Variety builds a broad physical activity repertoire.',
        60,
        'Weekly',
      ],
    ],
    topics: [
      {
        key: 'organised_sport_introduction',
        patterns: [
          'starting cricket',
          'football team',
          'first sport team',
          'joining a sport club',
          'team sport readiness',
          'what age for organised sport',
        ],
        response: `Joining a team sport between 5 and 8 years is developmentally appropriate and can be genuinely enjoyable and beneficial. The key factors for a positive experience are: child-initiated interest (not parent-selected), a coach who prioritises fun and skill development over results, and a format that gives all children equal play time rather than playing only the talented.\n\nFor {{child_name}}, the question to ask about any programme is: what does the child say about it? Children who enjoy sport at this age continue participating; those who feel pressured, anxious, or inadequate are the early dropouts. Sport sampling — trying one new activity per term or year — is associated with better long-term participation than early specialisation in the activity a parent prefers.`,
      },
      {
        key: 'screen_activity_balance_school',
        patterns: [
          'too much time on games',
          'video games and inactivity',
          'screen vs outdoor play',
          'replacing screen with activity',
          'activity guidelines school age',
        ],
        response: `School-age children in most countries now spend more time on screens than moving — the WHO recommends no more than 2 hours of recreational screen time per day for school-age children, alongside 60 minutes of physical activity. The two are in direct competition during after-school hours.\n\nThe most effective approach is environmental — after-school outdoor play before screen access is a rule that many families find easier to maintain than per-day limits, because it doesn\'t require monitoring time. Active outdoor time immediately after school takes advantage of natural energy and protects the movement window before screens absorb it. {{child_name}} can earn screen time after activity, rather than activity being the optional add-on after screens.`,
      },
      {
        key: 'pe_and_school_sport',
        patterns: [
          'hates PE',
          'not good at sport at school',
          'picked last for teams',
          'embarrassed about PE',
          'not sporty child',
        ],
        response: `Negative PE experiences in early school years are one of the most reliably damaging things for long-term physical activity participation. Being picked last for teams, being compared to more athletic peers, or being publicly embarrassed by poor performance at 5–8 years is genuinely consequential.\n\nFor {{child_name}} who is struggling with school sport, the most important thing is to protect their relationship with physical activity outside school — finding a non-school movement context where they feel competent and enjoy themselves. This might be swimming, dance, cycling, or martial arts — something where they are not being compared to classmates. If the school PE environment is consistently damaging, a conversation with the teacher about grouping practices and game formats is appropriate.`,
      },
      {
        key: 'injury_and_overtraining',
        patterns: [
          'sports injury',
          'child complaining of pain',
          'overtraining',
          'growing pains',
          'knee pain from sport',
          'Sever\'s disease',
        ],
        response: `Growing-related sports injuries become more common from age 6–8 as training loads increase. The most common in this group are apophyseal injuries — stress at the growth plates where tendons attach. Sever\'s disease (heel pain) in active children 8–14 is the most common, followed by Osgood-Schlatter disease (knee pain, slightly later).\n\nAny complaint of persistent joint pain or bone pain in an active child warrants a GP or sports medicine review — do not dismiss it as "growing pains." Growing pains are typically in the muscles of the thigh and calf at night, bilateral, and without tenderness. Pain that is localised to a joint, worsens with activity, and is tender to touch is a sports injury until proven otherwise.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_5yr_skips_and_gallops',
        'Skips and gallops with coordination',
        72,
        'Can {{child_name}} skip with alternating feet, or gallop in a coordinated way?',
      ],
      [
        'pa_5yr_rides_bike',
        'Rides a two-wheel bicycle without training wheels',
        84,
        'Can {{child_name}} ride a standard two-wheel bicycle independently without training wheels?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_5yr_significant_inactivity',
        description: 'Child consistently avoiding all physical activity, significantly below peers in gross motor skills, or complaining of pain with physical activity',
        severity: 'discuss_with_ped',
        pattern:
          'parent reports child refuses physical activity consistently, is significantly behind all peers in fundamental movement skills, or has persistent joint/bone pain with activity',
        action:
          'Assess for DCD, social anxiety about physical performance, or musculoskeletal causes of pain avoidance. Refer to paediatric physiotherapy or occupational therapy. Do not accept "just not sporty" as a complete explanation for significant motor delay.',
        referral: 'Paediatric occupational therapist for DCD; paediatric physiotherapist for musculoskeletal pain; sports medicine for training-related injury',
      },
    ],
    coping: {
      normalizations: [
        'Not all children are "sporty" and that is perfectly fine — the goal is 60 minutes of daily movement, not athletic excellence, and movement comes in many forms beyond organised sport.',
        'A child who loved football at 5 and hates it at 7 is not being difficult — interests change rapidly at this age and following the child\'s lead produces better long-term outcomes than insisting.',
      ],
      strategies: [
        'Active transport is the most sustainable daily activity source for school-age children — even 2 days per week of active travel adds meaningfully to weekly activity totals.',
        'If your child has quit an activity, wait 3–6 months before offering to try again — the break often renews interest.',
      ],
      selfCare: [
        'Logistics of organised sport (driving, kit, timing) can be genuinely burdensome — choosing activities within walking or cycling distance, or carpooling, reduces the sustainability cost.',
        'Your own physical activity is a stronger predictor of your child\'s activity level than any organised programme you enrol them in — moving together matters.',
      ],
      partner:
        'Sport spectating and transport are tasks that can be divided — one parent covers logistics, the other does playground or weekend outdoor time. Agreeing this explicitly prevents both the task falling to one parent and the guilt of the other.',
      warnings: [
        'If your child is participating in intensive sport (more than 10 hours per week) before age 9, this is above what early specialisation research recommends — raise this with the coach and consider adding other activities.',
        'If screen time is consistently exceeding 2 hours per day and physical activity is being displaced, this is a pattern worth actively restructuring — it tends not to self-correct.',
      ],
    },
    evidence:
      'WHO (2020) Guidelines on physical activity and sedentary behaviour. Telama R et al (2005) Physical activity from childhood to adulthood — a 21-year tracking study. Am J Prev Med 28(3):267-273. Lloyd RS et al (2015) Long-term athletic development — a model for evidence-based practice. Br J Sports Med 49(16):1023-31.',
  },

  // ── 8–12 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Sport, Sampling vs Specialisation, and Screen Balance',
    whatToExpect:
      'This is the period when organised sport participation peaks, and also when the first major dropout wave occurs. Children who specialise early, face performance pressure, or fail to experience fun and competence in sport are most likely to drop out between 8 and 12. Keeping sport diverse, fun, and intrinsically motivated is the most important thing a parent can do for lifelong physical activity.',
    keyMessage: 'Sport should feel like belonging and fun — not performance and pressure. If it stops feeling that way, it is time to change something.',
    dailyTips: [
      '60 minutes of moderate-to-vigorous activity daily, with bone-strengthening activity (running, jumping, sports with impact) on at least 3 days per week.',
      'Active time outside of sport classes counts — active transport, playground time, informal games with friends.',
      'Check in regularly about how sport feels — not how it\'s going technically, but whether they enjoy it.',
    ],
    doList: [
      'Support your child\'s decision to try different activities and to quit if enjoyment is consistently absent.',
      'Encourage at least two different physical activity forms at this age — team sport plus individual activity, or outdoor recreation plus organised sport.',
      'Attend games to watch and cheer, not to coach from the sideline.',
    ],
    dontList: [
      'Don\'t single-sport specialise before 12 — the research on burnout, overuse injury, and dropout risk is strong.',
      'Don\'t critique technique or performance on the way home from a game — this is one of the most reliably documented drivers of sport dropout.',
      'Don\'t link screen time to sport performance in a punitive way.',
    ],
    activities: [
      [
        'New Activity Each School Term',
        'Try one new physical activity each school term — martial arts, rock climbing, rowing, table tennis, trampolining, orienteering. The criterion is: has your child not done this before? One season is enough.',
        60,
        'Once per school term',
      ],
      [
        'Family Active Weekend',
        'One physically active family outing per week — cycling, hiking, swimming, tennis, badminton. This models physical activity as a normal part of adult life and builds shared family experiences.',
        60,
        'Weekly',
      ],
    ],
    topics: [
      {
        key: 'sport_dropout_prevention',
        patterns: [
          'wants to quit sport',
          'doesn\'t want to go to training',
          'sport burnout',
          'lost interest in football',
          'giving up gymnastics',
          'should I make them continue',
        ],
        response: `Wanting to quit a sport is one of the most common and most loaded conversations in parenting — and the research on how to handle it is remarkably consistent. Children who are allowed to quit activities that have genuinely lost their enjoyment are more likely to find and sustain different activities. Children who are forced to continue past the point of enjoyment are more likely to associate physical activity with obligation and drop out of activity more broadly in adolescence.\n\nFor {{child_name}}, the useful questions are: is this a temporary motivation dip (common after losses, bad games, conflicts with a coach) or a consistent pattern? Has something specific changed? Is there another activity they want to try instead? A fair agreement is: commit to the current season, and then reassess without judgement.`,
      },
      {
        key: 'overuse_injury',
        patterns: [
          'sports injury',
          'repetitive strain',
          'knee pain training',
          'heel pain sport',
          'shoulder pain throwing',
          'too much sport',
        ],
        response: `Overuse injuries — stress fractures, tendinopathies, growth plate injuries — are significantly more common in children who specialise early and train at high volumes. The most common in this age group are Sever\'s disease (heel pain), Osgood-Schlatter disease (tibial tubercle pain), and Little Leaguer\'s elbow (medial epicondyle pain in pitchers and throwing athletes).\n\nAny localised bone or joint pain that is consistently reproduced by activity and lasts more than a week warrants sports medicine or physiotherapy assessment. Growth plates are more vulnerable to stress than adult bone, and ignoring loading pain during growth can cause lasting damage. Rest from the provocative activity while awaiting assessment is appropriate — this is not "giving up," it is protecting a growing body.`,
      },
      {
        key: 'competitive_sport_culture',
        patterns: [
          'coach too harsh',
          'competitive team',
          'selection anxiety',
          'dropped from team',
          'sport performance pressure',
          'elite sport path',
        ],
        response: `The culture of competitive youth sport varies enormously — some programmes genuinely prioritise development and fun; others create environments of selection stress, performance pressure, and hierarchical ranking that are damaging at this age. Research consistently shows that the quality of the adult-child relationship in sport (coach behaviour, parental behaviour) is the single strongest predictor of whether {{child_name}} will continue participating in sport in adolescence.\n\nIf the competitive environment around {{child_name}}\'s sport is creating anxiety, fear of failure, or dread before games, that environment is working against their long-term development. A direct conversation with the coach is appropriate. If the culture is embedded (the whole programme has this ethos), finding a different club or programme is a legitimate response, even at the cost of short-term competitive advancement.`,
      },
      {
        key: 'screen_vs_activity_balance_older',
        patterns: [
          'gaming instead of sport',
          'sedentary all day',
          'not active anymore',
          'screen time 10 year old',
          'won\'t go outside',
          'activity recommendations 10 year old',
        ],
        response: `The shift to gaming and passive screen content as the default leisure activity typically accelerates around ages 8–10 — this is when peer culture around gaming becomes strong, and the intrinsic motivation for physical play can wane without being replaced by organised sport. The concern is real: sedentary behaviour in this period predicts less activity in adolescence and adulthood.\n\nThe most effective management for {{child_name}} is ensuring that active alternatives are genuinely attractive — organised sport or activity they enjoy, friends to be active with (peer physical activity is more motivating than adult-organised activity), and outdoor spaces they find engaging. Hard screen limits without attractive active alternatives rarely work; finding what {{child_name}} enjoys moving in is more effective than removing what they enjoy sitting in.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pa_8yr_60min_daily_activity',
        'Meets 60 minutes daily activity guideline on most days',
        108,
        'On a typical school day, is {{child_name}} getting at least 60 minutes of activity (combined sport, active transport, playground, outdoor play)?',
      ],
      [
        'pa_8yr_participates_team_sport',
        'Participates in at least one team or organised physical activity',
        120,
        'Is {{child_name}} regularly participating in any organised sport, activity class, or team?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_8yr_activity_drop',
        description: 'Significant, sustained decline in physical activity with sedentary behaviour becoming the default and increasing BMI or mood changes',
        severity: 'discuss_with_ped',
        pattern:
          'parent reports child has stopped all physical activity, spends most non-school time sedentary, refuses outdoor play consistently, and may have gained weight or shown mood changes',
        action:
          'Assess for depression, social anxiety, or bullying (often expressed through withdrawal from activity). Check BMI trajectory. Discuss activity guidelines and screen time. Refer to paediatric dietitian if weight concern; child psychologist if mood or anxiety concern.',
        referral: 'Child psychologist if mood/anxiety driving inactivity; paediatric physiotherapist for DCD or pain-avoidance; paediatric dietitian if weight concern is present',
      },
    ],
    coping: {
      normalizations: [
        'The sport dropout wave at 8–12 is real and has been documented in research across countries — you are not failing if your child wants to quit an activity at this age.',
        'Comparison between active and less active children at this age is rarely productive — activity preferences and abilities at 10 predict very little about 20-year-old physical health.',
      ],
      strategies: [
        'Separating your own sport identity and history from your child\'s choices is important and hard — if you were a competitive athlete, your child\'s disinterest in the sport you love is not a rejection of you.',
        'Peer activity is more motivating than parent-organised activity at this age — helping your child find friends to be active with is more effective than enrolling them in more classes.',
      ],
      selfCare: [
        'Competitive sport sideline culture (other parents, coach behaviour) can be genuinely stressful — if the environment around your child\'s sport is affecting your wellbeing, that is a signal worth taking seriously.',
        'Modelling your own regular physical activity is the most powerful long-term influence you have on your child\'s activity — not the number of classes you enrol them in.',
      ],
      partner:
        'Disagreements about activity levels, sport choices, or screen-activity balance are very common at this age. A shared position — agreed outside of conflict moments — prevents the child from navigating between two different standards.',
      warnings: [
        'If your pre-teen is exercising intensively (more than 2 hours per day most days) and restricting food intake, this combination is the hallmark of Relative Energy Deficiency in Sport (RED-S) and warrants a sports medicine review.',
        'If competitive pressure from a parent or coach is causing your child visible anxiety, dread before matches, or distress after losses that lasts days, this is an environment causing harm.',
      ],
    },
    evidence:
      'Gould D & Whitley MA (2009) Sources and consequences of athletic burnout in young athletes. J Intercollegiate Sport 2(2):245-262. Brenner JS & AAP Council on Sports Medicine and Fitness (2016) Sports specialization and intensive training in young athletes. Pediatrics 138(3). Telama R (2009) Tracking of physical activity from childhood to adulthood — a review. Obes Facts 2(3):187-195.',
  },

  // ── 12–15 years ──────────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'Body-Conscious Movement: Keeping Teens Active',
    whatToExpect:
      'Early adolescence is the highest-risk period for physical activity dropout — particularly for girls, but increasingly for boys as well. The combination of puberty-related body changes, peer scrutiny, increasing academic demands, and the growing appeal of screens creates the conditions for a dramatic activity decline that, for many people, is permanent.',
    keyMessage: 'Keeping a teenager physically active matters more than how they are active — support any form of movement they enjoy.',
    dailyTips: [
      'Maintain the 60 minutes daily recommendation, but accept that it may look different from childhood — gym, dance, running, cycling, team sport, martial arts, surfing, climbing.',
      'Physical activity and mental health are directly linked in adolescence — activity is not optional for mental wellbeing at this age.',
      'Framing exercise as energy, strength, and mental health — not weight management — is the language that sustains motivation.',
    ],
    doList: [
      'Support your teenager\'s interest in any form of physical activity, even if it\'s not what you would choose.',
      'Discuss the mental health benefits of exercise openly — reduced anxiety, better sleep, improved mood are real and relevant to teens.',
      'Maintain access to safe outdoor spaces for free movement outside of organised activity.',
    ],
    dontList: [
      'Don\'t link exercise to weight or body appearance — this is the most reliable way to turn physical activity into a site of anxiety.',
      'Don\'t compare activity levels between siblings or with peers.',
      'Don\'t withdraw sport participation as a consequence for poor grades — this is counterproductive for both outcomes.',
    ],
    activities: [
      [
        'Social Sport Opportunity',
        'Help your teenager find a physical activity they can do with friends — weekend cycling, informal football, dance class with a friend, swimming. Social context is the strongest motivator for adolescent physical activity.',
        60,
        'Weekly',
      ],
      [
        'Active Family Weekend Ritual',
        'One active family outing per week or fortnight — hiking, cycling, kayaking, swimming. Even a teenager who is otherwise physically disengaged will often participate in a family activity that isn\'t framed as exercise.',
        90,
        'Weekly or fortnightly',
      ],
    ],
    topics: [
      {
        key: 'activity_dropout_teens',
        patterns: [
          'quit sport',
          'not interested in exercise',
          'sedentary teenager',
          'won\'t play sport anymore',
          'dropped out of team',
          'no motivation to be active',
        ],
        response: `Sport dropout in early adolescence is one of the most studied phenomena in youth physical activity research — the decline is real, global, and particularly steep for girls. For {{child_name}}, the most useful response to dropout is finding out why (competitiveness became unwelcome, body image concerns, time pressure, peer conflicts) and looking for different movement forms rather than trying to reinstate the previous activity.\n\nThe evidence-based approach for keeping teenagers active is: choice and autonomy over activity type, social context (friends as exercise companions), activity that doesn\'t feel like exercise (dance, walking, outdoor recreation), and framing movement as energy and mental health rather than fitness or weight. A teenager who hikes, cycles with friends, or does dance classes is meeting the activity guideline even if they\'ve dropped organised sport.`,
      },
      {
        key: 'body_image_and_exercise',
        patterns: [
          'working out to lose weight',
          'exercise and body image',
          'exercise obsession',
          'can\'t miss a workout',
          'body shame and exercise',
          'compulsive exercise',
        ],
        response: `The relationship between exercise and body image in early adolescence is complex and sometimes dangerous. When physical activity is motivated primarily by changing body appearance or compensating for food, it crosses from health-promoting into potentially harmful territory. {{child_name}} exercising to feel energetic, strong, and mentally well is positive. Exercising to "fix" or control their body is a warning sign.\n\nCompulsive exercise — inability to rest without significant anxiety, exercising through injury or illness, exercise driven by guilt about eating — is an eating disorder behaviour and warrants the same professional response as food restriction. If this pattern is present, a GP referral for eating disorder screening is the appropriate first step.`,
        boundary: true,
      },
      {
        key: 'team_sport_social_belonging',
        patterns: [
          'sport and friendships',
          'team sport benefits',
          'sport and confidence',
          'bullying in sport',
          'fitting in on team',
          'sport for social skills',
        ],
        response: `Team sport offers adolescents something that individual exercise rarely does: a sense of belonging, shared identity, and peer connection. Research consistently shows that teenagers who participate in team sport have better mental health outcomes, not simply because of the exercise, but because of the social infrastructure around it.\n\nFor {{child_name}}, the social value of sport is as important as the physical value. A sport where they feel welcomed, respected, and connected is worth persisting with even when performance is mediocre. A sport where they feel excluded, ranked, or inadequate erodes both physical and social wellbeing. Coach and team culture are more important than the sport itself.`,
      },
      {
        key: 'academic_pressure_and_activity',
        patterns: [
          'too busy for sport',
          'study vs sport',
          'no time for exercise',
          'academics replacing activity',
          'dropping sport for school',
        ],
        response: `The belief that dropping physical activity for more study time improves academic outcomes is not supported by research — the opposite is true. Regular physical activity is associated with better executive function, concentration, and academic performance. A 30–60 minute activity break improves subsequent cognitive performance and is not wasted study time.\n\nFor {{child_name}}, framing physical activity as part of academic performance rather than competition with it is both accurate and motivating. Maintaining at least 30–45 minutes of moderate activity on most days during exam periods is a genuine cognitive performance strategy. Complete activity cessation during high-pressure academic periods is associated with worse outcomes, not better.`,
      },
    ],
    milestones: [
      [
        'pa_12yr_self_motivated_activity',
        'Participates in physical activity driven by personal motivation rather than parent scheduling',
        156,
        'Is {{child_name}} choosing to do some physical activity independently — not just when you organise it or drop them at class?',
      ],
      [
        'pa_12yr_activity_variety',
        'Participates in at least two different forms of physical activity',
        168,
        'Is {{child_name}} active in at least two different ways — e.g., a sport plus cycling or swimming, or dance plus outdoor recreation?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_12yr_compulsive_exercise',
        description: 'Compulsive exercise pattern — inability to rest, exercising through injury/illness, exercise driven by food guilt',
        severity: 'urgent_referral',
        pattern:
          'parent reports teenager who cannot miss exercise without extreme anxiety, is exercising while injured or ill, or is exercising specifically to "compensate" for eating',
        action:
          'This is an eating disorder behaviour regardless of weight or appearance. Arrange GP review urgently. Do not frame as healthy motivation. Eating disorder service referral is appropriate.',
        referral: 'GP; eating disorder service; child and adolescent mental health service (CAMHS)',
      },
    ],
    coping: {
      normalizations: [
        'A teenager who has dropped organised sport but cycles to school, walks with friends, and goes surfing occasionally is meeting activity guidelines — the form matters less than the total.',
        'Physical activity in adolescence looks completely different from childhood activity — comparison to earlier years is not meaningful.',
      ],
      strategies: [
        'Removing friction from activity — a bike that works, a nearby pool, friends to be active with — is more effective than providing motivation.',
        'Joining your teenager in physical activities without making it about their fitness ("want to walk with me?" rather than "you need to exercise") keeps the relationship with movement positive.',
      ],
      selfCare: [
        'Watching a previously active child become sedentary can be genuinely worrying — channelling that worry into conversations rather than monitoring and pressure is more effective and less damaging to the relationship.',
        'If you are physically active yourself and find your teenager\'s inactivity frustrating, notice whether you are making activity a site of conflict. Invitation works better than instruction at this age.',
      ],
      partner:
        'Partners sometimes disagree about how hard to push a teenager on physical activity — one parent pushing, the other permissive. Agreeing that activity should be supported but not coerced, and that the teen\'s autonomy in choosing the form matters, gives a shared position.',
      warnings: [
        'If a teenager who was previously active has become completely sedentary and is also showing low mood, social withdrawal, or sleep changes, the inactivity may be a symptom of depression rather than a cause of it — both need attention.',
        'Excessive exercise combined with food restriction, regardless of the teenager\'s weight, is Relative Energy Deficiency in Sport (RED-S) and requires a sports medicine or eating disorder assessment.',
      ],
    },
    evidence:
      'Eime RM et al (2013) A systematic review of the psychological and social benefits of participation in sport for children and adolescents — informing development of a conceptual model of health through sport. Int J Behav Nutr Phys Act 10:98. Biddle SJH & Asare M (2011) Physical activity and mental health in children and adolescents — a review. Br J Sports Med 45(11):886-895.',
  },

  // ── 15–18 years ──────────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Lifelong Fitness: Building the Adult Habit',
    whatToExpect:
      'Late adolescence is the window during which adult physical activity habits consolidate — the patterns established between 15 and 18 are strong predictors of activity levels through the twenties and beyond. The transition from child-organised activity to self-directed adult exercise is a genuine skill, and supporting teenagers to build intrinsic motivation, exercise knowledge, and gym safety is genuinely important.',
    keyMessage: 'The goal is a young adult who moves because it makes them feel good — not because anyone is watching.',
    dailyTips: [
      'Support exercise for mental health and energy, not body shape — this framing sustains motivation past adolescence.',
      'Gym safety knowledge (technique, appropriate loading, rest and recovery) is a life skill that prevents injury and burnout.',
      'Social exercise — running with a friend, group fitness, team sport — is more sustainable than solitary exercise for most people.',
    ],
    doList: [
      'Support your teenager finding at least one form of regular physical activity they will continue independently at university or beyond.',
      'Discuss the evidence on rest and recovery — active rest days, sleep, and periodisation are as important as training days.',
      'Encourage variety — both the physical and mental health benefits are greater with a mix of aerobic, strength, and flexibility activity.',
    ],
    dontList: [
      'Don\'t tie exercise to weight management language — even positive "you look fit" reinforces appearance as the goal.',
      'Don\'t allow gym supplement use without knowledge — protein powders are largely unnecessary; pre-workouts and fat-burners have real risks for teenagers.',
      'Don\'t withdraw access to exercise as a consequence for other behaviour — physical activity is a health behaviour, not a privilege.',
    ],
    activities: [
      [
        'Gym Induction Programme',
        'If your teenager is interested in gym training, invest in 2–3 sessions with a qualified personal trainer or sports coach to establish basic technique before they train independently. This prevents injury and builds confidence.',
        60,
        'One-time investment; then ongoing',
      ],
      [
        'Weekend Physical Challenge',
        'Once a month, a family or group physical challenge — a trail run, a charity walk, a cycling event, an open-water swim. Goal-oriented activity builds the planning and commitment skills that sustain adult exercise.',
        120,
        'Monthly',
      ],
    ],
    topics: [
      {
        key: 'gym_training_safety',
        patterns: [
          'teenager wants to gym',
          'weights for teenager',
          'safe weight training',
          'gym age limit',
          'muscle building teen',
          'strength training adolescent',
        ],
        response: `Resistance training for teenagers is safe, beneficial, and recommended by both the American Academy of Pediatrics and the British Association of Sport and Exercise Sciences — with appropriate technique instruction and appropriate loading. The key parameters: technique first, load second; body-weight and light-load exercises before heavy compound lifts; progress is gradual and supervised.\n\nFor {{child_name}}, the investment in a few supervised sessions with a qualified trainer before independent gym use is worthwhile — it prevents injury, builds confidence, and ensures the foundation skills (squatting, hinging, pressing) are established safely. Age limits for gym membership vary by facility; 14–16 is common with parental consent. The concern about "stunting growth" with weight training is not supported by evidence when appropriate technique and loads are used.`,
      },
      {
        key: 'exercise_mental_health_link',
        patterns: [
          'exercise for anxiety',
          'sport and depression',
          'physical activity and mental health',
          'exercise as therapy',
          'mood and activity',
        ],
        response: `The evidence linking physical activity and mental health in adolescents is among the strongest in all of mental health research. Regular moderate-to-vigorous exercise reduces anxiety symptoms by an effect size comparable to medication, improves sleep quality, reduces depressive symptoms, and improves cognitive function. This is not motivation talk — it is physiology.\n\nFor {{child_name}}, particularly if they are navigating exam stress, social anxiety, or mood difficulties, maintaining physical activity during hard periods is genuinely therapeutic. Even 20–30 minutes of moderate exercise (walking briskly, cycling, swimming) on most days has measurable mental health benefit. The challenge is that low mood reduces motivation to exercise — framing it as a medical behaviour (I take this for my mood) rather than a performance behaviour (I exercise to be fit) can help maintain it when motivation is low.`,
      },
      {
        key: 'sports_supplement_safety',
        patterns: [
          'protein powder teen',
          'creatine for teenager',
          'pre-workout supplement',
          'fat burner',
          'performance supplement',
          'safe supplements teenager',
        ],
        response: `The supplement industry targets teenagers aggressively, and many products marketed to young athletes are unnecessary, unregulated, or potentially harmful. For {{child_name}}:\n\nProtein supplements are unnecessary for most teenagers eating a normal diet — protein needs (1.2–2g per kg per day for active teenagers) are easily met through food. Creatine is not recommended under 18 by current sports medicine guidelines. Pre-workout supplements containing caffeine, stimulants, or proprietary blends are not appropriate for teenagers and have documented adverse event reports including cardiac events. Fat burners are unsafe. A basic vitamin D and omega-3 supplement is reasonable if diet is restricted; anything beyond this should be discussed with a doctor or sports dietitian.`,
        boundary: true,
      },
      {
        key: 'maintaining_activity_transition',
        patterns: [
          'staying active at university',
          'exercise when leaving home',
          'activity after school sport ends',
          'no team sport anymore',
          'adult exercise habits',
        ],
        response: `The transition out of school sport — where activity was organised and scheduled — is one of the biggest activity drops in adult life. Helping {{child_name}} build a self-directed exercise habit before they leave is a genuine gift.\n\nThe most sustainable adult exercise patterns are those that are: enjoyable (not punishing), social when possible, embedded in daily routine (rather than requiring special scheduling), and based on intrinsic motivation (energy, mood, strength) rather than extrinsic outcomes (weight, appearance, performance). Helping {{child_name}} identify one or two activities they would do even if no one was watching — and building the habit before they leave home — sets up a far more active adult life than any school sport programme.`,
      },
    ],
    milestones: [
      [
        'pa_15yr_self_directed_exercise',
        'Has an established self-directed exercise habit not dependent on parental organisation',
        192,
        'Is {{child_name}} regularly physically active in a way they have chosen and organise themselves, independently of any class or programme you enrol them in?',
      ],
      [
        'pa_15yr_gym_or_sport_safety',
        'Understands safe exercise technique and the importance of rest and recovery',
        210,
        'Does {{child_name}} know the basic principles of safe exercise — technique, appropriate loading, the role of rest — and do they apply this to their own training?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_pa_15yr_activity_mood_collapse',
        description: 'Complete physical activity withdrawal accompanied by mood change, social withdrawal, or other depression signs',
        severity: 'discuss_with_ped',
        pattern:
          'parent describes teenager who has completely stopped all physical activity (including informal movement), is spending most non-school hours sedentary, and is showing mood, sleep, or appetite changes',
        action:
          'Assess for depression, which commonly presents with activity withdrawal in adolescence. Activity withdrawal alone warrants monitoring; activity withdrawal plus mood changes warrants GP review and depression screening. Physical activity is both a symptom indicator and a treatment component.',
        referral: 'GP for depression screening; CAMHS if significant depressive presentation; consider referral to adolescent sport or exercise programme as part of management',
      },
    ],
    coping: {
      normalizations: [
        'A teenager who does less organised sport than in childhood but moves daily in informal ways (cycling, walking, gym) is achieving the health outcomes — the form of activity matters less than the consistency.',
        'The transition to self-directed adult exercise is genuinely challenging and most young adults go through a period of reduced activity — supporting rather than monitoring is the appropriate parental role.',
      ],
      strategies: [
        'Sharing your own exercise habits and challenges openly — including rest days, motivation dips, and what you do to maintain consistency — models authentic adult physical activity rather than an idealized version.',
        'Helping your teenager find at least one active community before they leave home (a running club, a climbing gym, a swimming squad) gives them a social landing pad for activity in new environments.',
      ],
      selfCare: [
        'Your own physical activity habits are the most powerful predictor of your child\'s — and they are yours, not just a parenting tool. Maintaining your own movement practice through these years matters for both of you.',
        'If you have anxieties about your teenager\'s activity level, check whether these are proportionate — a teenager who is meeting guidelines in informal ways is fine, even if it doesn\'t look like the structured sport of childhood.',
      ],
      partner:
        'As teenagers approach independence, parental agreement on not making activity a source of conflict is important — a teenager who associates exercise with parental pressure and control is less likely to sustain activity as an adult than one who associates it with personal choice and enjoyment.',
      warnings: [
        'If a teenager\'s gym use is becoming daily or twice-daily, they are expressing anxiety or distress about their body and using exercise to manage it — this warrants a gentle conversation and potentially professional support.',
        'If your teenager is following extreme exercise content (daily transformation challenges, very high-volume training programmes) on social media without adult guidance, this is worth a conversation about sustainable evidence-based training.',
      ],
    },
    evidence:
      'Biddle SJH et al (2019) Screen time, other sedentary behaviours and mental health in adolescents. Curr Opin Psychiatry 32(4):299-304. Rebar AL et al (2016) A meta-meta-analysis of the effect of physical activity on depression and anxiety in non-clinical adult populations. Health Psychol Rev 9(3):366-78. Lloyd RS & Oliver JL (2012) The Youth Physical Development Model — a new approach to long-term athletic development. Strength Cond J 34(3):61-72.',
  },
]
