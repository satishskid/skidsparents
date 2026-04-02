import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ── 0-3 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '0-3mo',
    ageMin: 0,
    ageMax: 3,
    title: 'Newborn Sleep: Chaos is Normal',
    whatToExpect:
      'Newborns sleep 14–17 hours a day in fragmented 2–4 hour stretches around the clock, with no concept of day and night yet. Their sleep is governed entirely by hunger and biological rhythms that take weeks to begin consolidating.',
    keyMessage:
      'There is no "right" sleep schedule at this age. Survival mode is the strategy — safe sleep every time, and rest whenever you can.',
    dailyTips: [
      'Place baby on their back on a firm, flat surface for every sleep — no exceptions.',
      'Keep the room slightly cool (68–72°F / 20–22°C) and use a white noise machine to mimic the womb.',
      'Expose baby to bright natural light during morning feeds and dim the environment for night feeds to begin building a day–night distinction.',
    ],
    doList: [
      'Follow safe sleep guidelines (back, alone, crib/bassinet) every single time.',
      'Feed on demand — hunger is the primary driver of waking and sleeping.',
      'Accept help and sleep in shifts with your partner or support person.',
    ],
    dontList: [
      "Don\'t expect a schedule — attempting rigid routines before 6–8 weeks typically increases parental stress without benefit.",
      "Don\'t use positioners, loose bedding, pillows, or bumpers in the sleep space.",
      "Don't compare your baby's sleep to others — variation is enormous and normal.",
    ],
    activities: [
      [
        'Morning Light Walk',
        'A 10-minute walk in natural morning light helps set circadian rhythms even in the first weeks of life.',
        10,
        'daily',
      ],
      [
        'Swaddle and Settle',
        'Practice firm swaddling before drowsy-but-awake moments — the snug pressure mimics the womb and reduces startle reflex waking.',
        5,
        'each sleep',
      ],
    ],
    topics: [
      {
        key: 'safe_sleep',
        patterns: [
          'is it safe to let baby sleep in',
          'can baby sleep on stomach',
          'is co-sleeping okay',
        ],
        response: `Safe sleep for {{child_name}} means back to sleep, every time, on a firm flat surface free of loose items. The AAP and WHO are unambiguous: this single practice is the most powerful protection against SIDS and sleep-related infant death.\n\nIf you are exhausted and tempted to bring {{child_name}} into your bed, know that there are safer ways to keep them close — a bedside bassinet inches away gives proximity without the hazards of an adult sleep surface. Your exhaustion is real; the solution is more support, not less safety.`,
        boundary: false,
      },
      {
        key: 'no_schedule',
        patterns: [
          'when will baby sleep through the night',
          'how do I get newborn on a schedule',
          'baby waking every hour',
        ],
        response: `At this age, {{child_name}}'s nervous system simply cannot maintain long sleep stretches — this is biology, not a problem to fix. Newborn stomachs hold very little, and deep unbroken sleep is actually somewhat protective against SIDS in this period.\n\nThe honest answer is: "sleeping through the night" reliably before 3–4 months is rare, and before 6 weeks is almost unheard of. The goal right now is safe sleep every time, not long sleep. Hang in there — consolidation is coming.`,
        boundary: false,
      },
      {
        key: 'parental_exhaustion',
        patterns: [
          'I am exhausted',
          'I cannot function on no sleep',
          'sleep deprivation is affecting me',
        ],
        response: `What you are experiencing is one of the most intense physical challenges of early parenthood, and it is completely real. The exhaustion is not a sign you are doing anything wrong — it is the expected biological cost of caring for a newborn.\n\nPlease don't try to be a hero alone. Identify one person — a partner, family member, or postpartum doula — who can take a stretch so you can get one 3–4 hour uninterrupted block. That single block restores more function than fragmented hours. If exhaustion is affecting your safety or mental health, tell your doctor — this is a medical issue, not just tiredness.`,
        boundary: true,
      },
      {
        key: 'swaddling',
        patterns: [
          'how do I swaddle',
          'when do I stop swaddling',
          'baby breaks out of swaddle',
        ],
        response: `Swaddling mimics the snug security of the womb and reduces the Moro (startle) reflex that frequently wakes newborns like {{child_name}}. A proper swaddle keeps hips loose and flexed — "burrito tight" on arms, "roomy" on legs.\n\nStop swaddling when {{child_name}} shows any signs of rolling — typically 2–4 months — as a swaddled roller cannot self-rescue. If {{child_name}} consistently escapes the swaddle by 8–10 weeks, a transitional sleep sack with arm pockets can extend the settling benefit safely.`,
        boundary: false,
      },
    ],
    milestones: [
      [
        'sleep_day_night',
        'Begins to show longer sleep stretches at night vs. day',
        6,
        'Are you noticing any difference between night and day sleep lengths, even a small one?',
      ],
      [
        'settles_with_comfort',
        'Settles to sleep with consistent comfort (feeding, holding, rocking)',
        4,
        'What has been helping {{child_name}} settle down to sleep most reliably?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-0-apnea',
        description: 'Pauses in breathing lasting more than 20 seconds, blue coloring around lips, or difficulty waking',
        severity: 'urgent_referral',
        pattern: 'breathing pause|blue lips|won\'t wake|apnea',
        action: 'Seek emergency care immediately. Do not wait for a scheduled visit.',
        referral: 'Pediatric Emergency / Neonatology',
      },
    ],
    coping: {
      normalizations: [
        'Waking every 1–3 hours is biologically normal for a newborn and does not mean anything is wrong with you or your baby.',
        'Feeling desperate for sleep is universal among new parents — this is the hardest phase, and it will change.',
      ],
      strategies: [
        'Sleep in shifts with your partner: one takes 10 pm–2 am, the other takes 2 am–6 am, so each gets one consolidated block.',
        'Lower all non-essential standards — laundry, dishes, and emails can wait. Sleep cannot.',
      ],
      selfCare: [
        'Accept every offer of food, help, or company. This is not weakness; it is necessary.',
        'If you have not slept more than 4 cumulative hours in 24, tell someone and ask for relief today.',
      ],
      partner:
        'Both parents are sleep-deprived. Agree on a shift system before you are too tired to negotiate fairly. Write it down.',
      warnings: [
        'If you find yourself having thoughts of harming yourself or your baby, call your doctor or a crisis line immediately — postpartum mood disorders are common and treatable.',
        'Driving on no sleep is as dangerous as drunk driving. Arrange alternatives when severely sleep-deprived.',
      ],
    },
    evidence:
      'AAP Safe Sleep Guidelines 2022; Mindell et al., Behavioral treatment of bedtime problems and night wakings in infants and young children, Sleep 2006; Hauck et al., SIDS risk factors, Pediatrics 2011.',
  },

  // ── 3-6 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '3-6mo',
    ageMin: 3,
    ageMax: 6,
    title: 'Sleep Consolidation Begins — and the 4-Month Regression',
    whatToExpect:
      'Between 3 and 6 months, many babies begin to show longer nighttime stretches as circadian rhythms mature. The 4-month sleep regression is not a setback — it is a neurological reorganization as sleep architecture permanently shifts to adult-like cycles.',
    keyMessage:
      'The 4-month regression is a sign of brain growth, not failure. Consistent, calm responses during this period lay the foundation for healthy sleep habits.',
    dailyTips: [
      'Begin a simple, predictable bedtime routine of 3–4 steps (e.g., bath, feed, song, sleep) — consistency matters more than duration.',
      'Put baby down drowsy but awake at least sometimes to begin building the association between their bed and falling asleep independently.',
      'Watch wake windows: overtiredness makes settling harder. At this age, most babies need sleep after 1.5–2 hours of wakefulness.',
    ],
    doList: [
      'Respond consistently and warmly to night wakings — this builds trust that supports better sleep over time.',
      'Begin distinguishing "settling" sounds from "I need you" sounds — a brief pause before responding can help.',
      'Keep the sleep environment dark, cool, and with consistent white noise through the night.',
    ],
    dontList: [
      "Don\'t start sleep training during the regression itself — wait until the regression passes (usually 2–6 weeks).",
      "Don't introduce new sleep associations (rocking to full sleep, feeding to sleep every time) that you'll need to maintain for months.",
      "Don\'t abandon the routine when travel or illness interrupts — rebuild it as quickly as possible.",
    ],
    activities: [
      [
        'Consistent Bedtime Routine',
        'Three calm, sequential steps done in the same order and same place every evening. The predictability itself signals sleep to the brain.',
        20,
        'nightly',
      ],
      [
        'Drowsy-But-Awake Practice',
        'Once a day, lay baby down when drowsy rather than fully asleep and stay close, offering reassurance without lifting — a first step toward independent settling.',
        10,
        'once daily',
      ],
    ],
    topics: [
      {
        key: 'four_month_regression',
        patterns: [
          'baby was sleeping great and now waking all night',
          'what is the 4 month regression',
          'sleep got worse at 4 months',
        ],
        response: `What is happening with {{child_name}} at this age is not regression in the negative sense — it is a permanent upgrade to more adult-like sleep architecture. Their brain is now cycling through light and deep stages, and they are briefly waking between cycles just as adults do; they just haven't yet learned to settle back without help.\n\nThis phase typically lasts 2–6 weeks. The most helpful thing you can do is maintain a consistent response and begin gently introducing the idea of self-settling, without pressure. The foundation you build now pays dividends for years.`,
        boundary: false,
      },
      {
        key: 'sleep_training_readiness',
        patterns: [
          'when can I start sleep training',
          'is it too early to sleep train',
          'should I let baby cry it out',
        ],
        response: `Most pediatric sleep specialists suggest waiting until at least 4–6 months (corrected age) before any formal sleep training, as before this point babies genuinely cannot self-soothe reliably. {{child_name}} needs to have the neurological capacity, not just be left to figure it out.\n\nIf you are considering sleep training, there are many approaches — from gradual check-in methods (Ferber) to more gradual fading approaches — and research shows that done at the right age, all are safe for infant wellbeing. Discuss the options with your pediatrician and choose what fits your family's values.`,
        boundary: false,
      },
      {
        key: 'feeding_to_sleep',
        patterns: [
          'baby only falls asleep feeding',
          'is it bad to feed to sleep',
          'nursing to sleep habit',
        ],
        response: `Feeding {{child_name}} to sleep works beautifully as a settling strategy — the problem is that if they fully fall asleep at the breast or bottle every time, they learn that the breast or bottle is the only way back to sleep when they surface between cycles at night.\n\nThis doesn't mean stopping feeds — it means sometimes ending the feed while {{child_name}} is drowsy but still awake, so they have occasional practice associating their own bed (not the feed) with the final drop into sleep. Even one or two such opportunities a day can shift the association over weeks without distress.`,
        boundary: false,
      },
      {
        key: 'safe_sleep_unswaddling',
        patterns: [
          'when to stop swaddling',
          'baby rolling should I stop swaddle',
          'swaddle to sleep sack transition',
        ],
        response: `Once {{child_name}} shows any sign of rolling — even just pushing up on sides — swaddling must stop, as a swaddled baby who rolls face-down cannot lift their head to safety. This typically happens between 2 and 4 months.\n\nTransition to a wearable blanket or sleep sack that keeps arms free. The first few nights may be harder as {{child_name}} adjusts to the different sensation, but most babies adapt within a week. The rest of the safe sleep environment (firm, flat, alone) remains the same.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'longer_night_stretch',
        'Achieves at least one 4–5 hour stretch of nighttime sleep',
        14,
        'What is the longest single stretch of sleep {{child_name}} has managed at night so far?',
      ],
      [
        'routine_recognition',
        'Shows signs of recognizing bedtime routine (calming at bath or song)',
        16,
        'Does {{child_name}} seem to respond to the bedtime routine as a signal that sleep is coming?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-3-noconsolidation',
        description: 'No lengthening of sleep stretches at all by 5 months, combined with significant feeding difficulties or poor weight gain',
        severity: 'discuss_with_ped',
        pattern: 'still waking every hour at 5 months|no sleep consolidation|poor weight gain and poor sleep',
        action: 'Discuss with pediatrician to rule out feeding, reflux, or developmental concerns.',
        referral: 'Pediatrician / Pediatric GI if reflux suspected',
      },
    ],
    coping: {
      normalizations: [
        'The 4-month regression surprises almost every parent who thought they had cracked sleep — you have not done anything wrong.',
        'Feeling grief over lost sleep gains is completely valid. It is hard to go backwards even temporarily.',
      ],
      strategies: [
        'Use this phase to build the bedtime routine that will serve you for years — consistency now pays forward.',
        'Remind yourself and your partner that this specific regression has an end; it does not last forever.',
      ],
      selfCare: [
        'If you are breastfeeding, try to get one feed covered by a bottle so you can sleep a longer stretch.',
        'Connect with other parents of same-age babies — shared experience of the regression is genuinely comforting.',
      ],
      partner:
        'The regression is a good time to explicitly re-divide night duties. Be direct rather than assuming the other person knows what you need.',
      warnings: [
        'Persistent exhaustion at this stage can tip into postpartum depression. If low mood, anxiety, or inability to feel positive emotions persists for more than two weeks, speak to your doctor.',
        'Do not use sleep medications, sedating antihistamines, or gripe water with sedative ingredients in babies without explicit medical guidance.',
      ],
    },
    evidence:
      'Mindell JA & Owens JA, A Clinical Guide to Pediatric Sleep, 2015; Hysing et al., Sleep problems in school-age children, BMJ Open 2016; AAP Healthy Sleep Habits guidance.',
  },

  // ── 6-12 months ─────────────────────────────────────────────────────────────
  {
    agePeriod: '6-12mo',
    ageMin: 6,
    ageMax: 12,
    title: 'Nap Transitions, Separation Anxiety, and Self-Soothing',
    whatToExpect:
      'Between 6 and 12 months, most babies shift from 3 naps to 2, nighttime sleep consolidates further (many babies can sleep 10–12 hours with feeds), and separation anxiety peaks — making bedtime genuinely harder even as biology supports longer sleep.',
    keyMessage:
      'Separation anxiety at bedtime is a sign of healthy attachment, not manipulation. Consistent, predictable responses build the security that eventually makes independent sleep possible.',
    dailyTips: [
      'Maintain wake windows of 2–3 hours between sleep periods to avoid overtiredness, which looks like too much energy but is actually overstimulated stress hormones.',
      'Do a brief "comfort check" of the room before the bedtime routine to preempt requests — lamp on or off, door cracked, etc.',
      'Practice brief separations during the day (peek-a-boo, leaving the room briefly) to reinforce that you always come back.',
    ],
    doList: [
      'Establish a firm, loving bedtime that you hold to consistently — ambiguity extends the settling process.',
      'Offer a transitional object (soft toy, small blanket) from around 7 months to give baby a comfort anchor.',
      'Respond to separation distress with warmth and calm but continue with the routine — your confidence signals safety.',
    ],
    dontList: [
      "Don\'t let separation anxiety derail the whole routine — empathy and consistency are not opposites.",
      "Don't begin the bedtime routine when baby is already overtired — aim to start 20 minutes before you think they'll fall asleep.",
      "Don\'t abruptly change any major sleep associations during illness — wait until fully recovered.",
    ],
    activities: [
      [
        'Object Permanence Games',
        'Hide-and-find games during the day build the understanding that things (and people) continue to exist when not visible — the cognitive foundation of tolerating separation at night.',
        10,
        'daily',
      ],
      [
        'Lovey Introduction',
        'Consistently offer the same small soft toy at every sleep period so it becomes associated with sleep and comfort, providing a portable piece of security.',
        5,
        'each sleep',
      ],
    ],
    topics: [
      {
        key: 'separation_anxiety_bedtime',
        patterns: [
          'baby screams when I leave the room',
          'separation anxiety at bedtime',
          'used to sleep well now cries at bedtime',
        ],
        response: `What {{child_name}} is experiencing is a major developmental milestone, not a sleep problem: they now understand that you exist when they can't see you, and they want you there. This is healthy attachment doing exactly what it should.\n\nThe most effective response is reliable predictability — the same routine, the same loving goodbye, the same brief check-in if needed. Don't sneak out; tell {{child_name}} you're leaving and that you'll be there if needed. This is harder in the short term but builds the trust that leads to genuine independent settling over weeks.`,
        boundary: false,
      },
      {
        key: 'nap_transitions',
        patterns: [
          'when to drop a nap',
          'baby fighting third nap',
          'how many naps at 9 months',
        ],
        response: `Most babies transition from 3 naps to 2 somewhere between 6 and 8 months, and this transition period often causes a few weeks of disrupted nighttime sleep as the schedule adjusts. Signs {{child_name}} is ready: consistently refusing the third nap, third nap pushing bedtime too late, or the third nap being very short.\n\nAfter dropping to 2 naps, aim for one mid-morning nap and one afternoon nap, with the afternoon nap ending at least 2 hours before bedtime. Don't rush to drop the second nap — most children need it until 3+ years.`,
        boundary: false,
      },
      {
        key: 'self_soothing',
        patterns: [
          'how do I teach baby to self soothe',
          'baby can\'t fall asleep without me',
          'sleep training 8 months',
        ],
        response: `Self-soothing is a skill that develops gradually — you cannot rush it before the brain is ready, but you can support it. The key is giving {{child_name}} frequent, low-stakes opportunities to practice settling: putting them down drowsy, staying nearby initially, and gradually reducing active intervention over days and weeks.\n\nFormal sleep training methods (various check-in approaches, gradual removal, etc.) are all safe and effective at this age when applied consistently. The best method is the one you can implement with calm and consistency. A half-hearted approach to one method is less effective than a committed approach to any method.`,
        boundary: false,
      },
      {
        key: 'night_feeds_at_this_age',
        patterns: [
          'does baby still need night feeds',
          'night weaning 9 months',
          'how many night feeds at 8 months',
        ],
        response: `By 6 months, most healthy babies who are growing well have the physical capacity to go 6–8 hours without a feed, though many continue to wake out of habit or for comfort rather than hunger. Whether to night-wean is a medical and personal decision — check with your pediatrician before dropping feeds.\n\nIf {{child_name}} is gaining well and your doctor gives the go-ahead, gradual approaches (reducing feed duration or volume over days) tend to cause less distress than abrupt removal. Some families choose to continue night feeds well into the first year for feeding relationship and comfort reasons, and that is also valid.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'two_nap_schedule',
        'Settled into a two-nap daily schedule',
        8,
        'Has {{child_name}} moved to two naps a day, and is the schedule fairly predictable?',
      ],
      [
        'self_settles_sometimes',
        'Occasionally settles to sleep without active parental intervention',
        10,
        'Is {{child_name}} able to fall asleep on their own at any point during the day or night?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-6-snoring',
        description: 'Loud, habitual snoring with pauses in breathing or mouth breathing during sleep',
        severity: 'discuss_with_ped',
        pattern: 'snoring every night|mouth breathing during sleep|pauses breathing while sleeping',
        action: 'Discuss with pediatrician — could indicate enlarged tonsils/adenoids or other airway issues.',
        referral: 'Pediatrician / ENT',
      },
    ],
    coping: {
      normalizations: [
        'A baby who was sleeping well but now cries at bedtime has not "forgotten" how to sleep — separation anxiety is a developmental surge that passes.',
        'Feeling guilty about leaving a crying baby is normal. Consistent loving goodbyes are not abandonment; they are teaching.',
      ],
      strategies: [
        'Write down what is and isn\'t working each week — sleep changes quickly at this age and a log helps you see progress.',
        'Agree on one approach with your partner and hold it for at least 2 weeks before evaluating — inconsistency is the main enemy.',
      ],
      selfCare: [
        'If you are doing all night wakings alone, have an honest conversation about sustainability. One or two nights off per week changes everything.',
        'Give yourself permission to not be "on" from the moment the baby sleeps to the moment they wake. You need idle time.',
      ],
      partner:
        'Compare notes at the end of each day so you both know what was tried. Divergent approaches between partners are confusing for babies.',
      warnings: [
        'If your anxiety about your baby\'s sleep is affecting your own ability to sleep when the baby sleeps, mention this to your doctor.',
        'Chronic sleep deprivation affecting your ability to work or care for yourself or your baby is a medical issue — do not wait it out alone.',
      ],
    },
    evidence:
      'Ferber R, Solve Your Child\'s Sleep Problems, 2006; Mindell et al., Pediatrics 2006; Sadeh A, Sleep assessment methods, Monographs SRCD 2015; WHO Child Growth Standards.',
  },

  // ── 12-24 months ────────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'One Nap, Bedtime Battles, and Night Terrors',
    whatToExpect:
      'The second year brings the transition to one afternoon nap, an explosion in language and independence that makes bedtime a prime arena for asserting will, and the possible onset of night terrors — dramatic events that scare parents far more than children.',
    keyMessage:
      'Bedtime resistance in a toddler is about independence and connection, not defiance. Clear, warm limits work better than either rigidity or endless negotiation.',
    dailyTips: [
      'Move to one nap between 15 and 18 months when you see consistent refusal of the morning nap for two or more weeks.',
      'Give a 5-minute and 2-minute warning before the bedtime routine starts — toddlers handle transitions better with advance notice.',
      'Offer limited choice within the routine ("Do you want the bear song or the star song?") — ownership reduces resistance.',
    ],
    doList: [
      'Keep the bedtime routine to 20–30 minutes and hold it to the same steps and sequence nightly.',
      'After the final goodbye, be brief and consistent about how you respond to calls — one check-in, same response, same exit.',
      'During night terrors: stay calm, keep the environment safe, do not try to wake or fully engage the child.',
    ],
    dontList: [
      "Don\'t get drawn into extended negotiations at bedtime — each negotiation teaches that negotiation works.",
      "Don\'t try to comfort or fully wake a child mid-night terror — it prolongs them.",
      "Don\'t move bedtime significantly later hoping tiredness will help — overtiredness usually makes settling worse, not better.",
    ],
    activities: [
      [
        'Bedtime Story with Choice',
        'Allow the child to choose one book from two options each night. The predictability of the ritual plus the autonomy of the choice is a powerful settling combination.',
        15,
        'nightly',
      ],
      [
        'Transition to Crib Practice',
        'If moving to a toddler bed, do daytime "practice" play in the new bed before using it for sleep — familiarity reduces nighttime anxiety about the change.',
        10,
        'during transition week',
      ],
    ],
    topics: [
      {
        key: 'night_terrors',
        patterns: [
          'baby screams in sleep but won\'t wake up',
          'night terror vs nightmare',
          'child screaming at night not responsive',
        ],
        response: `Night terrors occur during the deepest part of slow-wave sleep, typically in the first third of the night. {{child_name}} may sit up, scream, and appear awake but is actually deeply asleep — there is no conscious fear experience happening, and they will not remember it in the morning.\n\nYour job during a night terror is safety and patience, not comfort. Stay close, keep them from hurting themselves, speak calmly but don't try to fully wake them or engage the episode. It will end on its own in 5–30 minutes. If night terrors are very frequent (more than 2 per week), mention it to your pediatrician, but occasional night terrors in toddlers are common and benign.`,
        boundary: false,
      },
      {
        key: 'one_nap_transition',
        patterns: [
          'when to drop to one nap',
          'toddler refusing morning nap',
          'how many naps for a 15 month old',
        ],
        response: `The two-to-one nap transition typically happens between 15 and 18 months and is one of the trickier transitions because it often temporarily disrupts nighttime sleep and toddler mood for several weeks as the new schedule consolidates.\n\nSigns {{child_name}} is ready: consistently refusing the morning nap for at least two weeks, or taking such a long morning nap that the afternoon nap is refused and bedtime pushed too late. During the transition, temporarily move bedtime 30 minutes earlier to compensate for the lost sleep until the single nap fully consolidates.`,
        boundary: false,
      },
      {
        key: 'bedtime_resistance',
        patterns: [
          'toddler won\'t stay in bed',
          'bedtime is a battle every night',
          'toddler keeps calling out after bedtime',
        ],
        response: `Bedtime resistance in {{child_name}} is completely developmentally expected — they are practicing the new superpower of having a will of their own, and bedtime (separation from you) is the perfect proving ground. This is not a sign of bad habits; it is a sign of healthy development.\n\nThe most effective strategy is a predictable routine with limited, genuine choices built in, followed by a firm and loving exit with a clear, consistent response to any post-bedtime calls. Decide in advance exactly what you will do for the first call, and stick to it. The first week is hardest; most children adjust within 2 weeks of consistent practice.`,
        boundary: false,
      },
      {
        key: 'crib_to_bed_transition',
        patterns: [
          'when to move to toddler bed',
          'child climbing out of crib',
          'is it time for a big kid bed',
        ],
        response: `The safest time to move {{child_name}} out of the crib is when they can climb out — a climbing toddler in a crib is a fall risk. If they are not climbing and sleep is going well, there is no rush; many children are happiest in a crib through age 2.5 or even 3.\n\nWhen you do make the move, do it with fanfare ("your big-kid bed!"), keep everything else in the bedtime routine identical, and use a bed rail initially. Expect 1–3 weeks of getting-out-of-bed behavior — the key is a calm, zero-drama return every single time. The drama of your response is the reward; remove the reward and the behavior fades.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'one_nap_established',
        'Reliably sleeping one afternoon nap of 1.5–2.5 hours',
        18,
        'Has {{child_name}} settled into a single afternoon nap, and how long is it typically lasting?',
      ],
      [
        'routine_adherence',
        'Participates in and anticipates bedtime routine steps',
        20,
        'Does {{child_name}} know what comes next in the bedtime routine and show any signs of participating (getting pyjamas, choosing a book)?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-12-frequent_terrors',
        description: 'Night terrors occurring more than 3 times per week, or associated with sleepwalking that poses safety risks',
        severity: 'discuss_with_ped',
        pattern: 'night terror every night|sleepwalking toddler|screaming multiple times every night',
        action: 'Discuss with pediatrician. Very frequent parasomnia events warrant evaluation.',
        referral: 'Pediatrician / Pediatric Sleep Specialist',
      },
    ],
    coping: {
      normalizations: [
        'Toddler bedtime battles are so universal they are a cultural cliché — you are not failing, your child is developing normally.',
        'Night terrors are far more frightening for parents watching than for the child experiencing them.',
      ],
      strategies: [
        'Write the bedtime routine on a simple picture chart so your toddler can "run" it — ownership dramatically reduces resistance.',
        'Decide in advance what your one check-in response will be and practice saying it in a neutral tone before bedtime.',
      ],
      selfCare: [
        'Reclaim your evenings as adult time once the child is settled — a clear end to the parenting day restores your sense of self.',
        'If your child\'s sleep is preventing you from functioning, it is appropriate to seek a pediatric sleep consultation.',
      ],
      partner:
        'Agree on the bedtime routine and post-bedtime call response together. If one parent is more permissive, children will quickly learn who to call.',
      warnings: [
        'Persistent difficulties with your own sleep beyond the baby waking (lying awake anxious, intrusive thoughts) can indicate an anxiety disorder — speak to your own doctor.',
        'If you find yourself becoming very angry during bedtime resistance regularly, consider whether you need more support or respite.',
      ],
    },
    evidence:
      'Mindell JA et al., Bedtime problems and night wakings in children, Sleep Med Rev 2006; Owens JA, Classification and epidemiology of childhood sleep disorders, Sleep Med Clin 2007; Petit D et al., Sleep and Obesity in Children, Pediatrics 2012.',
  },

  // ── 2-3 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'Stalling Tactics, Nightmares, and the Crib-to-Bed Move',
    whatToExpect:
      'Two- and three-year-olds are masterful at bedtime stalling — one more hug, one more water request, one more question — as their language skills finally match their desire to delay separation. Nightmares (distressing dreams they recall) begin to appear alongside or replacing night terrors.',
    keyMessage:
      'Stalling is a language achievement and a sign of intelligence. Match it with warmth, clear limits, and rituals that give the need for "more" a structured outlet.',
    dailyTips: [
      'Build "extra" connection into the routine rather than having it extracted: a longer cuddle at a specific point, two books instead of one.',
      'Use a "bedtime pass" — a physical card the child can exchange once per night to call for a parent. One call, honored warmly; any card beyond that is calmly declined.',
      'For nightmares: brief comfort, acknowledge the fear, reassure reality, then return to sleep — don\'t extend into a full wake-up.',
    ],
    doList: [
      'Acknowledge fear of monsters or darkness as real to the child without confirming that monsters exist.',
      'Offer a flashlight or nightlight as a tool the child controls — agency over the scary thing reduces fear.',
      'After nightmares, keep the return to sleep quick and calm: brief hug, short reassurance, lights dim.',
    ],
    dontList: [
      "Don\'t dismiss fears as silly — to your child they are completely real, and dismissal increases anxiety.",
      "Don\'t begin a full investigation of the nightmare at 2 am — save the talking for the morning.",
      "Don\'t reward stalling with extended engagement — warmth and firmness are both possible at the same time.",
    ],
    activities: [
      [
        'Monster Spray',
        'A spray bottle of water (perhaps with a drop of lavender essential oil) the child gets to spray around their room before sleep. Giving the child agency over the fear is more effective than denying the fear.',
        5,
        'nightly as needed',
      ],
      [
        'Two-Book Ritual',
        'Two books chosen by the child from a small curated basket — the choice empowers, the limit is clear, the ritual is warm. End with the same song or phrase every night.',
        15,
        'nightly',
      ],
    ],
    topics: [
      {
        key: 'nightmares_vs_night_terrors',
        patterns: [
          'nightmare vs night terror how to tell',
          'child wakes screaming bad dream',
          'how do I help after a nightmare',
        ],
        response: `Nightmares occur during REM sleep, typically in the second half of the night. {{child_name}} will wake up, be fully conscious, remember the dream, and want comfort. Night terrors occur in deep slow-wave sleep in the first third of the night, with no full waking and no memory.\n\nFor nightmares: go to {{child_name}}, offer a hug, briefly acknowledge the fear ("that sounds scary"), reassure that it was a dream and they are safe, and keep the interaction calm and short before encouraging return to sleep. Lengthy processing at 2 am tends to amplify rather than resolve the fear — save deeper conversations for morning.`,
        boundary: false,
      },
      {
        key: 'stalling_tactics',
        patterns: [
          'child asks for things after bedtime',
          'toddler won\'t stay in room at bedtime',
          'my child has 100 requests at bedtime',
        ],
        response: `{{child_name}}'s elaborate bedtime requests are actually a cognitive achievement — creative, language-rich, socially aware. The challenge is channeling that creativity into the routine rather than letting it extend the routine indefinitely.\n\nTry building in a structured "extra" — one extra hug, one specific extended moment — so {{child_name}} gets the connection they're seeking within the routine, and subsequent requests come up against a clear, kind limit. The bedtime pass technique (one physical card per night to exchange for one additional parental visit) works remarkably well for 2.5–3 year olds who can grasp the concept.`,
        boundary: false,
      },
      {
        key: 'fear_of_dark',
        patterns: [
          'child scared of the dark',
          'afraid of monsters at bedtime',
          'won\'t sleep without the light on',
        ],
        response: `Fear of the dark is developmentally normal and peaks during the preschool years as imagination accelerates. {{child_name}}'s brain is now capable of generating vivid internal images — exactly the cognitive leap that also powers pretend play — and the dark is where those images feel real.\n\nDon't fight the fear; give it a tool. A nightlight, a flashlight that {{child_name}} controls, or "monster spray" all work through the same mechanism: giving the child agency over the scary thing. Avoid repeatedly checking under the bed together, as this can paradoxically confirm that something might be there.`,
        boundary: false,
      },
      {
        key: 'nap_phaseout',
        patterns: [
          'when does nap end',
          '2 year old refusing nap',
          'should I force nap',
        ],
        response: `Most children need an afternoon nap through age 3, and many through 3.5 or even 4. A child who refuses the nap but becomes extremely difficult by 4–5 pm is still biologically tired — the refusal is behavioral, not a sign the nap is no longer needed.\n\nIf {{child_name}} is consistently refusing but clearly tired, try "quiet time" in the same space and same cot — they don't have to sleep, but they do need to rest. Many children eventually fall asleep; others get through quiet time and are genuinely fine. Once you see two or more weeks of consistent nap refusal with no afternoon meltdowns, the transition is likely real.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nightmare_recovery',
        'Able to return to sleep after a nightmare with brief parental comfort',
        30,
        'When {{child_name}} has a scary dream, are they able to settle back to sleep relatively quickly with your comfort?',
      ],
      [
        'bedtime_independence',
        'Stays in bed after being settled without extended calling or coming out',
        34,
        'Once the routine is done and you say goodnight, does {{child_name}} generally stay in their room and settle?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-24-persistent_nightmares',
        description: 'Nightmares occurring every night for more than 4 weeks, especially with daytime fear, clinginess, or regression in other areas',
        severity: 'discuss_with_ped',
        pattern: 'nightmare every night for weeks|scared all day after dreams|daytime fear related to nighttime',
        action: 'Discuss with pediatrician. Persistent nightmares at this age can sometimes indicate stress, anxiety, or witnessed trauma.',
        referral: 'Pediatrician / Child Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'The bedtime stalling phase feels endless while you are in it — it is not. Most children are genuinely settling independently by age 4.',
        'Feeling manipulated by a 2-year-old at bedtime is extremely common and a sign of their growing social intelligence, not your failure.',
      ],
      strategies: [
        'Pre-decide your response to each common stalling request and practice it aloud so it comes out calm and automatic in the moment.',
        'After the first two weeks of consistent new limits, you will usually see measurable improvement — track it to stay motivated.',
      ],
      selfCare: [
        'Protecting your post-bedtime time as yours — even 45 minutes of uninterrupted quiet — is worth significant effort to achieve.',
        'If you dread bedtime every night, something about the current approach is unsustainable. Consult your pediatrician or a sleep coach.',
      ],
      partner:
        'If one partner always does bedtime, build in rotation. The parent who never does bedtime is not learning the routine, and you will need backup.',
      warnings: [
        'If your child\'s sleep fears are dominating daytime behavior or they are refusing to be in a room alone, this warrants a pediatric discussion.',
        'Be aware of your own distress level: if you are getting flooded with anger or helplessness at bedtime regularly, seek support.',
      ],
    },
    evidence:
      'Mindell & Owens, Behavioral Treatment of Sleep Disturbances, AASM 2017; Meltzer LJ, Behavioral Sleep Disorders in Children, Pediatr Clin N Am 2011; Nielsen T, Nightmares in childhood, Sleep Med Rev 2010.',
  },

  // ── 3-5 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'Dropping the Nap, Building Routines, Monsters Under the Bed',
    whatToExpect:
      'The preschool years see the nap gradually disappear (usually between 3 and 5), an expanded nighttime need for ritual and story, and active imagination making the dark feel genuinely dangerous. Sleep needs remain high at 10–13 hours total.',
    keyMessage:
      'A consistent, predictable bedtime routine is the most powerful sleep tool available for this age group — it is worth investing in getting it right.',
    dailyTips: [
      'Aim for 10–13 total hours of sleep; if the nap is gone, this all needs to come at night.',
      'Limit screens for at least one hour before bed — blue light suppresses melatonin and action content raises arousal.',
      'Use a picture-based routine chart on the wall that your child can follow themselves — ownership of the routine reduces negotiation.',
    ],
    doList: [
      'Even after the nap is dropped, maintain a 20–30 minute "quiet time" in the afternoon — it protects nighttime sleep and sanity.',
      'Validate bedtime fears specifically and briefly, then redirect to the comfort tools (nightlight, lovey, the routine).',
      'Celebrate independent sleeping with low-key acknowledgment in the morning — not a big reward system, just a warm notice.',
    ],
    dontList: [
      "Don\'t drop the nap abruptly before 3 years unless there is clear evidence the child is ready.",
      "Don\'t let the bedtime routine expand beyond 30 minutes — a bloated routine trains children that more is always possible.",
      "Don\'t use bedtime as a consequence or punishment — bed should remain a safe, positive space.",
    ],
    activities: [
      [
        'Breathing Buddy',
        'Child places a small soft toy on their belly and watches it rise and fall as they breathe deeply. Teaches diaphragmatic breathing as a self-calming tool from an early age.',
        5,
        'nightly',
      ],
      [
        'Gratitude Three',
        'Ask for three things that were good today, just before lights out. Ends the day on positive emotional content and provides a gentle cognitive cool-down.',
        5,
        'nightly',
      ],
    ],
    topics: [
      {
        key: 'dropping_nap',
        patterns: [
          'when does nap end for preschooler',
          '3 year old refusing nap',
          'should 4 year old still nap',
        ],
        response: `Nap readiness varies widely — some children naturally phase out naps at 3, others still genuinely need them at 4.5. The reliable signs that {{child_name}} is ready: consistently refusing the nap for 3+ weeks, no increase in nighttime sleep to compensate, and manageable late afternoon mood without it.\n\nEven after the nap ends, keep a "quiet time" in the same space and time slot. This preserves the circadian rhythm anchor, protects nighttime sleep by avoiding afternoon overstimulation, and gives parents a critical daily break. Many children will still occasionally nap during quiet time when they truly need it.`,
        boundary: false,
      },
      {
        key: 'imagination_fears',
        patterns: [
          'monsters under the bed',
          'scared of dark at preschool age',
          'imaginary fears keeping child awake',
        ],
        response: `{{child_name}}'s imagination is doing exactly what it should be doing at this age: running wild. The same neural machinery that generates a brilliant tea party with imaginary friends generates monsters under the bed at night. The fear is real; the threat is not.\n\nWork with the imagination rather than against it. Let {{child_name}} be the monster expert — have them declare what monsters are afraid of and make sure the room is equipped accordingly. Giving agency over the fear is neurologically more effective than simply reassuring it away.`,
        boundary: false,
      },
      {
        key: 'sleep_needs_preschool',
        patterns: [
          'how much sleep does a 4 year old need',
          'is 9 hours enough for preschooler',
          'early waking preschooler',
        ],
        response: `Preschoolers need 10–13 hours of total sleep in a 24-hour period. If {{child_name}} is not napping, all of this must come at night, which means an early bedtime (often 7–7:30 pm) is not just acceptable but necessary — especially if they are naturally an early riser.\n\nEarly waking (before 6 am) is common at this age and often linked to a too-late bedtime (overtired children enter light sleep early and wake early) rather than adequate rest. Counterintuitively, moving bedtime earlier by 30 minutes often produces later wake times.`,
        boundary: false,
      },
      {
        key: 'screen_and_sleep',
        patterns: [
          'tablet before bed affecting sleep',
          'screen time and sleep preschooler',
          'how long before bed to stop screens',
        ],
        response: `Screen use in the hour before bed affects {{child_name}}'s sleep through two mechanisms: blue light from the screen suppresses melatonin production, and the content (even calm programming) maintains a level of arousal that delays the sleepiness cascade.\n\nThe current evidence supports stopping screens at least 60 minutes before bed for preschoolers. Replace with physical books, drawing, or quiet play that serves as a genuine wind-down. If the transition from screens to bedtime is reliably difficult, experiment with moving screen time entirely to earlier in the afternoon.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nap_phased_out',
        'Nap consistently replaced by quiet time or phased out entirely without nighttime disruption',
        48,
        'Has {{child_name}} moved away from napping, and is nighttime sleep still adequate (10+ hours)?',
      ],
      [
        'self_initiates_routine',
        'Begins bedtime routine steps independently when reminded (gets pyjamas, chooses book)',
        42,
        'Is {{child_name}} able to do any steps of the bedtime routine on their own with a reminder?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-36-less_than_9hrs',
        description: 'Consistently sleeping fewer than 9 hours in 24 hours with signs of daytime sleepiness, hyperactivity, or behavioral dysregulation',
        severity: 'discuss_with_ped',
        pattern: 'sleeping less than 9 hours|constantly tired during day|hyperactive and sleep deprived',
        action: 'Discuss with pediatrician. Chronic sleep insufficiency at this age has significant impacts on behavior, growth, and immunity.',
        referral: 'Pediatrician / Pediatric Sleep Specialist',
      },
    ],
    coping: {
      normalizations: [
        'The nap phase-out is genuinely mourned by many parents — the loss of that daily break is significant and it\'s okay to feel that.',
        'Bedtime fears at this age are not manipulation; your child is genuinely experiencing something scary in their imagination.',
      ],
      strategies: [
        'Invest the time to get the routine truly consistent for two weeks — the payoff in easier evenings is worth the upfront effort.',
        'On hard nights, remind yourself the routine is the long game: you are building a skill and a habit, not just surviving tonight.',
      ],
      selfCare: [
        'Protect quiet time even after the nap ends — it is as much for you as for them.',
        'If you find you look forward to your child\'s bedtime but then cannot wind down yourself, consider your own sleep hygiene.',
      ],
      partner:
        'Preschool bedtime is intensive but usually short. Share it fairly and debrief briefly afterward — connection prevents resentment.',
      warnings: [
        'If your child\'s sleep fears are escalating rather than resolving over months, or if they are linked to trauma, seek a child psychologist.',
        'If you are consistently getting fewer than 6 hours of sleep yourself while parenting, this affects your health and parenting capacity — address it.',
      ],
    },
    evidence:
      'Hirshkowitz M et al., NSF sleep duration recommendations, Sleep Health 2015; Gruber R, Sleep and Academic Performance, Sleep Med Rev 2014; Carter KA et al., Common sleep problems, Paediatrics Child Health 2014.',
  },

  // ── 5-8 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'School Sleep, 10–11 Hours, Sleepover Jitters',
    whatToExpect:
      'School age children need 9–12 hours of sleep but are increasingly exposed to schedules, screens, and social demands that erode it. Sleep quality directly predicts academic performance, mood regulation, and physical health at this age.',
    keyMessage:
      'Sleep is a non-negotiable health behavior, like nutrition. This is the age to teach children why they need it, not just enforce it.',
    dailyTips: [
      'Set a consistent wake time first — the rest of the sleep schedule follows from when they must wake, working backwards.',
      'Charge all devices outside the bedroom — not as a punishment, but as a family standard.',
      'Discuss sleep as health with your child: "Your brain files away everything it learned today while you sleep."',
    ],
    doList: [
      'Maintain the same bedtime on school nights and within 30–60 minutes on weekends.',
      'Create a screen-free zone in the bedroom as a permanent policy, established now before habits harden.',
      'Acknowledge sleepover anxiety — it is common at this age and worth talking through before the event.',
    ],
    dontList: [
      "Don\'t allow devices in the bedroom at night, even with 'just music' or 'just a podcast' as entry points.",
      "Don\'t treat sleep as negotiable around homework or activity schedules — sleep deprivation makes learning inefficient.",
      "Don\'t dismiss sleepover anxiety — forcing participation before readiness can deepen social anxiety.",
    ],
    activities: [
      [
        'Wind-Down Routine Design',
        'Let your child design their own 30-minute wind-down routine from an approved menu (bath, reading, drawing, stretching). Agency improves adherence at this age.',
        30,
        'nightly',
      ],
      [
        'Sleep Science Conversation',
        'A brief weekly conversation about what happens in the brain during sleep, calibrated to the child\'s interest. Children who understand the "why" are more cooperative with the "what."',
        10,
        'weekly',
      ],
    ],
    topics: [
      {
        key: 'homework_vs_sleep',
        patterns: [
          'homework is cutting into sleep',
          'child up late doing homework',
          'is it okay to skip homework for sleep',
        ],
        response: `Sleep deprivation makes the homework {{child_name}} is doing much less effective — a tired brain retains less, processes more slowly, and makes more errors. In the tradeoff between one hour of tired homework and one hour of sleep, sleep usually wins for learning outcomes.\n\nIf homework is consistently taking too long and cutting into needed sleep, have a direct conversation with the teacher — this is a legitimate concern. Helping {{child_name}} build efficient homework habits (same time, same quiet place, no devices) protects both homework quality and sleep time.`,
        boundary: false,
      },
      {
        key: 'sleepover_anxiety',
        patterns: [
          'child doesn\'t want to sleep at friend\'s house',
          'sleepover anxiety',
          'scared to stay away from home',
        ],
        response: `Sleepover anxiety is extremely common between ages 5 and 8, when children are developing peer relationships but still deeply attached to home as a safe base. {{child_name}} is not unusual, and forcing early sleepovers before readiness can backfire.\n\nA graduated approach works well: start with very close family (grandparents, cousins) for overnight stays before attempting peer sleepovers. Brief pre-sleep check-ins by phone can help initially. Celebrate any successful overnight as the achievement it is. If anxiety about separation is broader than just sleepovers, mention it to your pediatrician.`,
        boundary: false,
      },
      {
        key: 'school_night_bedtime',
        patterns: [
          'what time should 7 year old go to bed',
          'bedtime for school age child',
          'too late bedtime affecting school',
        ],
        response: `Children aged 5–8 need 9–12 hours of sleep. Working backwards from a 7 am wake time for school, that means a bedtime of 7–8 pm. This often surprises parents who find it very early, but the research is consistent: children this age who go to bed before 8 pm perform measurably better academically and behaviorally.\n\nIf {{child_name}}'s current bedtime is significantly later than this, move it gradually — 15 minutes earlier every 3 days — rather than abruptly. Abrupt shifts cause more resistance than gradual ones.`,
        boundary: false,
      },
      {
        key: 'devices_bedroom',
        patterns: [
          'tablet in bedroom at night',
          'gaming before bed',
          'child using phone after bedtime',
        ],
        response: `Any device use after lights out represents a significant risk to {{child_name}}'s sleep quality. Even when children appear asleep, the presence of a device in the room is associated with shorter sleep duration — the potential for notification, light, or use creates a form of vigilance that reduces sleep depth.\n\nThe most effective policy is a household charging station outside all bedrooms — this removes the device from temptation rather than requiring willpower. Frame this as a family health policy, not a punishment, and apply it to adults too for maximum credibility.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'independent_bedtime',
        'Completes bedtime routine with only a final check-in, without ongoing parental presence',
        72,
        'Is {{child_name}} able to complete most of their bedtime routine independently and settle without you staying?',
      ],
      [
        'consistent_school_schedule',
        'Maintains consistent sleep–wake times on school days with minimal morning difficulty',
        84,
        'How are mornings going — does {{child_name}} wake reasonably well for school or is it a significant struggle?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-60-daytime_sleepiness',
        description: 'Persistent daytime sleepiness affecting school performance or mood, despite adequate opportunity for sleep',
        severity: 'discuss_with_ped',
        pattern: 'falling asleep at school|can\'t stay awake during day|chronic daytime tiredness school age',
        action: 'Discuss with pediatrician. Rule out sleep apnea, iron deficiency, or other medical causes.',
        referral: 'Pediatrician / Pediatric Sleep Specialist / ENT',
      },
    ],
    coping: {
      normalizations: [
        'Morning battles at school age are nearly universal. The struggle is real and does not mean your child is broken or that you are doing it wrong.',
        'Worrying about whether your child is getting enough sleep is one of the most common parental concerns — your awareness is itself protective.',
      ],
      strategies: [
        'Move all non-urgent evening activities earlier in the week to protect Thursday/Friday night sleep before the week\'s toll accumulates.',
        'Post the bedtime schedule visibly so it is a house rule, not a parental decision — it takes the negotiation target away from you.',
      ],
      selfCare: [
        'Model good sleep hygiene yourself — children notice when parents are on devices at 11 pm while enforcing different rules.',
        'If managing your child\'s sleep schedule is a source of significant daily conflict, a brief consultation with a pediatric sleep specialist can be clarifying.',
      ],
      partner:
        'Be explicit about weekend sleep expectations — if one partner allows significantly later weekend bedtimes, it creates Monday morning misery for everyone.',
      warnings: [
        'A child who is consistently difficult to wake for school may be genuinely sleep-insufficient — this is a health matter, not a character issue.',
        'If you are finding it very difficult to enforce bedtime without significant conflict every night, family counseling or a behavioral consultation may help.',
      ],
    },
    evidence:
      'Paruthi S et al., Consensus Statement on Sleep Duration for Children, J Clin Sleep Med 2016; Dewald JF et al., Influence of sleep quality on cognitive performance, Sleep Med Rev 2010; Owens JA, Insufficient Sleep, Pediatrics 2014.',
  },

  // ── 8-12 years ──────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Homework, Devices, and the 9–11 Hour Requirement',
    whatToExpect:
      'Middle childhood is when sleep deprivation often silently accumulates — activities multiply, homework grows, devices proliferate, and social needs expand, all competing against a fixed 24-hour day. Most children this age need 9–11 hours but routinely get 7–8.',
    keyMessage:
      'Sleep is a performance tool. Framing it this way — for sports, school, and mood — is often more motivating to this age group than parental authority alone.',
    dailyTips: [
      'Have your child track their own sleep for one week and compare how they feel on more-versus-less sleep days — personal data is persuasive.',
      'Keep the bedroom cool (65–68°F / 18–20°C) — body temperature drop is a key trigger for sleep onset.',
      'Move after-school physical activity to the afternoon rather than evening — exercise improves sleep quality but not when done within 2 hours of bed.',
    ],
    doList: [
      'Establish a clear device-off time (ideally 60+ minutes before bed) and hold to it consistently.',
      'Work with your child to build a bedtime schedule that gets them 9–11 hours — work backwards from wake time together.',
      'Talk openly about how sleep affects athletic performance, memory consolidation, and mood — make it relevant to what they care about.',
    ],
    dontList: [
      "Don\'t allow a TV, gaming console, or smartphone in the bedroom — this age is when those habits cement.",
      "Don\'t routinely allow weekend sleep to run 3+ hours past the school-night schedule — social jet lag affects Sunday night sleep.",
      "Don\'t use sleep deprivation as a consequence or threat — sleep is health, not a reward.",
    ],
    activities: [
      [
        'Sleep Audit Together',
        'Sit together and calculate how much sleep is actually happening each school week. Most children are surprised by the gap between what they need and what they are getting.',
        15,
        'once per term',
      ],
      [
        'Wind-Down Protocol',
        'Co-create a 20-minute wind-down that the child owns: could be reading, drawing, light stretching, or journaling. Autonomy-supportive approaches are more durable at this age than imposed routines.',
        20,
        'nightly',
      ],
    ],
    topics: [
      {
        key: 'device_interference',
        patterns: [
          'child on phone after bedtime',
          'gaming until midnight',
          'how to stop device use at night',
        ],
        response: `Device use after lights out is one of the most significant and underestimated threats to {{child_name}}'s sleep quality at this age. It is not just the blue light — it is the social engagement, the variable reward of notifications, and the sheer stimulation that suppress both sleepiness and sleep depth.\n\nThe most effective approach is structural: remove the device from the bedroom at a set time as a non-negotiable family policy. Router-based parental controls that switch off internet at a set time remove the willpower burden from both child and parent. Have this conversation when everyone is calm and not at bedtime.`,
        boundary: false,
      },
      {
        key: 'homework_sleep_tradeoff',
        patterns: [
          'up late every night doing homework',
          'homework is cutting into sleep at middle school',
          'should I let them stay up to finish work',
        ],
        response: `A tired brain does homework poorly. Research consistently shows that sleep deprivation impairs exactly the skills homework demands: working memory, processing speed, and error detection. Staying up an extra hour to finish homework typically produces lower-quality work than sleeping and finishing in the morning.\n\nIf homework volume is structurally incompatible with {{child_name}} getting 9 hours, this is worth raising with the school. Many schools have homework policies specifically to prevent this. Help {{child_name}} develop efficient study habits (timed sessions, no devices, single-tasking) that reduce total time needed.`,
        boundary: false,
      },
      {
        key: 'social_jet_lag',
        patterns: [
          'child sleeps in until noon on weekends',
          'late weekends affecting school week',
          'Monday is always terrible',
        ],
        response: `What you are describing is called "social jet lag" — the difference between the body clock and the social clock that accumulates when weekend sleep habits significantly diverge from school-night habits. Sleeping in until noon on Saturday is roughly equivalent to flying to a different time zone and back every week.\n\nA pragmatic compromise: allow {{child_name}} to sleep up to 60–90 minutes later on weekends but not more. This provides genuine recovery sleep without completely resetting the circadian rhythm. A Sunday evening wind-down protocol can also help prepare for the Monday morning transition.`,
        boundary: false,
      },
      {
        key: 'sleep_and_mental_health',
        patterns: [
          'child anxious at bedtime',
          'worrying keeping child awake',
          'sleep and anxiety in children',
        ],
        response: `Sleep and mental health have a bidirectional relationship that becomes particularly important at this age: poor sleep increases anxiety and irritability, and anxiety in turn makes it harder to sleep. If {{child_name}} is lying awake worrying, this is a real phenomenon that deserves attention, not dismissal.\n\nIn the short term, a brief "worry dump" — writing down worries before bed so the brain doesn't have to keep holding them — can help. If anxiety at bedtime is persistent, frequent, or expanding into daytime concerns, please discuss this with your pediatrician. Cognitive behavioral therapy for anxiety is highly effective and often brief at this age.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'self_manages_bedtime',
        'Initiates and largely manages own bedtime routine with general supervision',
        108,
        'Is {{child_name}} taking ownership of their bedtime routine, or does it still require significant parental management?',
      ],
      [
        'understands_sleep_need',
        'Can articulate why sleep matters and recognizes their own sleep debt signs',
        132,
        'Does {{child_name}} notice when they are tired and connect it to their sleep? Can they explain why sleep matters?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-96-insomnia',
        description: 'Difficulty falling or staying asleep more than 3 nights per week for a month or more, with significant daytime impairment',
        severity: 'discuss_with_ped',
        pattern: 'can\'t fall asleep for hours|lying awake most nights|insomnia and school problems',
        action: 'Discuss with pediatrician. Rule out anxiety, depression, sleep disorders, and screen habits. CBT-I is first-line treatment.',
        referral: 'Pediatrician / Child Psychiatrist / Pediatric Sleep Specialist',
      },
    ],
    coping: {
      normalizations: [
        'Sleep deprivation in school-age children is epidemic — you are dealing with a cultural and structural problem, not just a parenting one.',
        'Device battles at bedtime are universal at this age. You are not alone, and enforcement is genuinely hard.',
      ],
      strategies: [
        'Use data: apps that show your child their own actual screen time or sleep tracker output are often more convincing than parental authority.',
        'Make bedtime agreements collaboratively rather than imposingly — children this age are far more likely to honor agreements they helped create.',
      ],
      selfCare: [
        'Set your own device boundaries at the same time as your child\'s — consistency is both effective and fair.',
        'If the nightly device battle is causing significant family conflict, a family therapist or pediatric behaviorist can help establish new normals.',
      ],
      partner:
        'Ensure both parents are aligned on device policies and bedtime expectations. If one parent is significantly more lenient, the consistent parent carries an unfair burden.',
      warnings: [
        'Persistent sleep problems in this age group can be a sign of developing anxiety or depression. Don\'t wait for it to self-resolve.',
        'If your own relationship with sleep is poor, your child will struggle to prioritize theirs — both are worth addressing.',
      ],
    },
    evidence:
      'Cheng W et al., Bidirectional relationship between sleep and mental health, Lancet Psychiatry 2020; Cain N & Gradisar M, Electronic media use and sleep in school-aged children, Sleep Med 2010; Wolfson AR, Sleep schedules and academic performance, Child Dev 1998.',
  },

  // ── 12-15 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'The Biological Circadian Shift and School Start Conflict',
    whatToExpect:
      'Puberty triggers a genuine, biological delay in the circadian clock — teens are not lazy when they can\'t sleep before 11 pm, their melatonin release is physiologically delayed by 1–3 hours. This creates a direct collision with early school start times.',
    keyMessage:
      'Your teenager\'s late sleep is not a character flaw — it is biology. The fight is against a broken school schedule, not against your child.',
    dailyTips: [
      'Explain the circadian shift biology to your teenager — they are more cooperative when they understand what is happening to them.',
      'Protect morning light exposure: even 10 minutes outside first thing helps anchor the shifted rhythm slightly earlier.',
      'On weekends, allow sleeping in by up to 90 minutes but not more — larger discrepancies worsen school week functioning.',
    ],
    doList: [
      'Advocate with the school for later start times if possible — this is a genuine public health issue.',
      'Help your teen design their own sleep schedule, working backwards from school wake time.',
      'Treat sleep deprivation signs (moodiness, inability to regulate emotions, poor performance) as health issues, not attitude problems.',
    ],
    dontList: [
      "Don't frame the biological late sleep as laziness, bad behavior, or a choice — it undermines your relationship and doesn't help.",
      "Don\'t allow devices in the bedroom overnight — this is the age when this habit is most damaging and most entrenched.",
      "Don\'t dismiss the real distress of chronic sleep deprivation in teens — it is associated with depression, anxiety, and risk-taking.",
    ],
    activities: [
      [
        'Melatonin Timing Experiment',
        'If your teen struggles to fall asleep, discuss low-dose melatonin (0.5–1 mg) 60–90 minutes before target bedtime with your pediatrician. This can help shift the circadian clock forward, but dose and timing matter.',
        5,
        'nightly, short-term with pediatric guidance',
      ],
      [
        'Morning Light Protocol',
        'Open curtains or step outside immediately on waking — morning light is the most powerful natural signal to the circadian clock and helps shift sleep earlier over weeks.',
        10,
        'daily',
      ],
    ],
    topics: [
      {
        key: 'circadian_shift_biology',
        patterns: [
          'why can\'t teenager fall asleep at normal time',
          'teen stays up until 2am every night',
          'is late sleep normal for teenagers',
        ],
        response: `What {{child_name}} is experiencing is one of the best-documented phenomena in adolescent biology: puberty triggers a genuine delay in the circadian clock's melatonin release, causing sleepiness to arrive 1–3 hours later than in childhood or adulthood. This is not preference or laziness — it is physiology.\n\nThe challenge is that school start times have not adapted to this reality. Most early-start schools put teens in a chronic state of sleep deprivation that would be considered unacceptable if imposed on adults. Understanding this helps you approach {{child_name}}'s sleep struggles as a structural problem to solve together, rather than a willpower problem to criticize.`,
        boundary: false,
      },
      {
        key: 'school_start_conflict',
        patterns: [
          'teen can\'t wake up for school',
          'missing school because of sleep',
          'school is too early for teenagers',
        ],
        response: `The American Academy of Pediatrics, CDC, and American Medical Association all recommend that middle and high schools start no earlier than 8:30 am — yet most still start at 7 or 7:30 am. {{child_name}} is not uniquely failing; they are in a system that is misaligned with adolescent biology.\n\nIn the meantime, there are things that help: consistent sleep and wake times, morning light exposure, device management, and — where available — melatonin with guidance to gradually shift the sleep window earlier. If sleep timing is severely disrupted (unable to sleep before 3 am), discuss Delayed Sleep Phase Syndrome with your pediatrician.`,
        boundary: false,
      },
      {
        key: 'melatonin_use_teens',
        patterns: [
          'should teenager take melatonin',
          'melatonin for teen sleep',
          'how much melatonin for 14 year old',
        ],
        response: `Low-dose melatonin (0.5–1 mg) taken 60–90 minutes before the target bedtime can genuinely help shift the circadian clock in adolescents and is considered safe for short-term use. However, the over-the-counter doses available in many countries (5–10 mg) are far higher than what is physiologically effective and needed.\n\nFor {{child_name}}, discuss melatonin use with your pediatrician before starting. It is most helpful as a temporary clock-shifting tool combined with behavioral changes (morning light, consistent wake time), not as a nightly sleep medication long-term. It does not help if the fundamental issue is device use keeping the teen awake.`,
        boundary: false,
      },
      {
        key: 'sleep_mental_health_teen',
        patterns: [
          'teen depression and sleep',
          'anxiety keeping teenager awake',
          'sleep and mood in teenagers',
        ],
        response: `The relationship between sleep and mental health in adolescence is deeply bidirectional and becomes clinically important at this age. Chronic sleep deprivation is a significant risk factor for depression, anxiety, and emotional dysregulation in teens, while depression and anxiety in turn fragment and disturb sleep.\n\nIf {{child_name}} is showing persistent low mood, loss of interest in things they used to enjoy, or anxiety that is expanding beyond sleep, please speak to your pediatrician. Don't wait for sleep to resolve on its own when mental health concerns may need direct treatment. Sleep improvement often follows when the underlying mental health issue is addressed.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'understands_own_biology',
        'Can explain their own circadian shift and engage cooperatively in managing it',
        156,
        'Does {{child_name}} understand why they feel awake late at night? Are they engaged in finding solutions rather than just resisting?',
      ],
      [
        'device_self_regulation',
        'Shows some capacity to self-limit device use before bed without external enforcement',
        168,
        'Is {{child_name}} taking any independent steps to manage their own screen use before bed, or does this still require external enforcement every night?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-144-dsps',
        description: 'Unable to fall asleep before 2–3 am and unable to wake for school, pattern lasting more than 3 months',
        severity: 'discuss_with_ped',
        pattern: 'can\'t sleep before 2am|can\'t wake for school for months|delayed sleep phase',
        action: 'Discuss with pediatrician. Formal Delayed Sleep Phase Syndrome warrants structured treatment including light therapy and melatonin protocols.',
        referral: 'Pediatrician / Pediatric Sleep Specialist',
      },
    ],
    coping: {
      normalizations: [
        'Your teenager is not choosing to be difficult about sleep — their biology is genuinely fighting the school schedule, and that is not their fault.',
        'Parenting a chronically sleep-deprived teenager is relentlessly hard. Your frustration is understandable.',
      ],
      strategies: [
        'Move the conflict away from bedtime: have the conversation about sleep policy at a calm, connected moment, not during the struggle itself.',
        'Find at least one way to advocate structurally — school board meeting, letter to administration — so you are not just managing symptoms.',
      ],
      selfCare: [
        'Parenting sleep-deprived adolescents when you yourself are tired creates a volatile household. Your sleep matters too.',
        'Connect with parents of teens the same age — the shared struggle normalizes what feels like individual failure.',
      ],
      partner:
        'Agree on a consistent approach to morning and bedtime enforcement. A teen who can play parents against each other will, without malice — it is just effective.',
      warnings: [
        'If your teenager is falling asleep in class regularly, missing school for sleep, or showing significant mood changes, treat this as a medical concern.',
        'If you are extremely angry at your teen about sleep every morning, the anger is a signal that you need more support — not a solution.',
      ],
    },
    evidence:
      'Crowley SJ et al., Circadian phase in adolescents, J Biol Rhythms 2007; Hagenauer MH et al., Adolescent changes in sleep homeostasis, Sleep 2009; AAP Adolescent Sleep Working Group, School Start Times, Pediatrics 2014; Gradisar M et al., A randomized controlled trial of CBT-I in adolescents, Sleep 2011.',
  },

  // ── 15-18 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Sleep Deprivation Crisis, Mental Health, and Independence',
    whatToExpect:
      'Late adolescence is the most sleep-deprived period in the human lifespan, driven by the biological circadian shift, academic pressure, social demands, part-time work, and ubiquitous devices. The consequences — for mental health, driving safety, and academic performance — are serious and well-documented.',
    keyMessage:
      'Sleep in late adolescence is a genuine health and safety issue. This is not about bedtime rules anymore — it is about building a relationship with sleep that will protect your teenager for life.',
    dailyTips: [
      'Shift from enforcement to education: your teenager needs to own their sleep decisions and understand their consequences.',
      'Preserve a device-free bedroom as a household standard — even at this age, the bedroom environment matters.',
      'Talk about weekday vs. weekend sleep balance: the goal is not perfection but not letting the debt accumulate to the point of impairment.',
    ],
    doList: [
      'Treat persistent sleep problems as the health concern they are — offer to see a doctor together rather than trying to manage it alone.',
      'Keep one or two connection points in the evening that are screen-free — drives, shared meals, brief check-ins.',
      'Acknowledge the structural unfairness of early school start times explicitly — it validates your teen\'s experience and reduces friction.',
    ],
    dontList: [
      "Don\'t use early morning deprivation as a consequence — driving or major decisions on no sleep is genuinely dangerous.",
      "Don\'t give up on all sleep boundaries in the name of teen autonomy — they still live in your house and their health is your concern.",
      "Don't dismiss a teen who says they can't sleep or never feel rested — these are symptoms worth taking seriously.",
    ],
    activities: [
      [
        'Sleep and Performance Conversation',
        'Share research on sleep and athletic performance, memory consolidation, and decision-making in teens. Framing sleep as a performance enhancer — for sports, exams, driving — often resonates more than health arguments at this age.',
        15,
        'once, revisit if needed',
      ],
      [
        'Sleep Diary One Week',
        'Ask your teen to track their sleep for one school week — actual sleep time, wake time, and how they felt. Most teens are shocked by their own data and it opens productive conversations.',
        5,
        'for one week',
      ],
    ],
    topics: [
      {
        key: 'sleep_and_depression',
        patterns: [
          'teen sleeping too much and depressed',
          'insomnia and depression in teenager',
          'sleep changes and mental health teen',
        ],
        response: `Sleep changes — both too little and too much — are one of the most reliable early signals of mental health difficulties in teenagers. Hypersomnia (sleeping 10–12+ hours and still feeling unrefreshed) can be as significant as insomnia in this context.\n\nIf {{child_name}}'s sleep pattern has changed significantly, combined with any changes in mood, withdrawal from friends or activities, or changes in eating, please take this seriously and see a doctor together. Depression and anxiety in adolescence are common, treatable, and far easier to address when caught early. Sleep treatment alone will not resolve an underlying mental health condition.`,
        boundary: false,
      },
      {
        key: 'weekend_catch_up',
        patterns: [
          'teen sleeps until 2pm on weekends',
          'is weekend catch-up sleep helpful',
          'can you catch up on sleep',
        ],
        response: `Some recovery benefit from weekend sleep is real — sleeping in allows partial repayment of sleep debt accumulated during the week. However, sleeping 3–5 hours past the school-night wake time on weekends creates significant circadian disruption, making Sunday night sleep nearly impossible and Monday morning brutal.\n\nA pragmatic approach: allow {{child_name}} to sleep in up to 60–90 minutes on weekends, aim for some natural morning light soon after waking, and avoid complete schedule collapse. If the teen needs 3+ hours of weekend catch-up consistently, the school-week sleep is insufficient and the root cause needs addressing.`,
        boundary: false,
      },
      {
        key: 'driving_and_sleep',
        patterns: [
          'tired teen driver',
          'is it safe to drive on no sleep',
          'drowsy driving teenager',
        ],
        response: `Drowsy driving is responsible for a disproportionate share of teen motor vehicle accidents, and adolescents are particularly susceptible because they combine maximum circadian-driven sleepiness in the early morning with novice driving skills. This is not a hypothetical risk.\n\nBe explicit with {{child_name}}: driving on fewer than 6 hours of sleep, or when they feel they could fall asleep, is not allowed — full stop. Have a pre-arranged agreement that they can call you at any hour for a safe ride with no questions asked. The cost of that phone call is nothing compared to the alternative. Some families use written safe-driving agreements that include a no-drowsy-driving clause.`,
        boundary: true,
      },
      {
        key: 'independence_and_sleep',
        patterns: [
          'teenager won\'t follow bedtime rules',
          'how do I enforce sleep at 17',
          'teen says they can manage their own sleep',
        ],
        response: `By 16–17, the conversation about sleep genuinely shifts from enforcement to coaching. {{child_name}} is approaching adulthood and will soon have complete autonomy over their sleep. The goal is not compliance with your rules but building their own understanding of the relationship between sleep and how they function.\n\nShare your concern as a health concern rather than a rule. Ask them what they notice about how they feel on more versus less sleep. Agree on minimum household standards (devices off by a certain time, bedroom is a sleep space) while giving latitude over when exactly they sleep. If the health consequences of their choices are significant, treat it as you would any other health concern — with medical support, not just parental authority.`,
        boundary: false,
      },
    ],
    milestones: [
      [
        'sleep_ownership',
        'Takes genuine independent responsibility for managing their own sleep schedule',
        192,
        'Is {{child_name}} making any independent choices to protect their sleep — limiting late-night device use, going to bed at a consistent time? Or does everything require external enforcement?',
      ],
      [
        'sleep_health_awareness',
        'Understands and can articulate the relationship between their sleep and their mental health, performance, and safety',
        204,
        'Does {{child_name}} connect their mood, performance, and energy to their sleep quality? Have they ever voluntarily chosen sleep over a social activity?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-sleep-180-mental-health',
        description: 'Sleep changes (insomnia or hypersomnia) combined with mood changes, withdrawal, or loss of interest lasting more than two weeks',
        severity: 'discuss_with_ped',
        pattern: 'can\'t sleep and depressed|sleeping all the time and withdrawn|sleep and mood change together',
        action: 'Seek medical evaluation promptly. Combined sleep and mood changes in adolescence warrant mental health screening.',
        referral: 'Pediatrician / Adolescent Psychiatrist / Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Late adolescent sleep is a genuine public health crisis — you are parenting in the context of a system that is failing teenagers, not personally failing.',
        'Losing the ability to enforce sleep rules is a normal part of parenting a nearly-adult teenager, not a failure of authority.',
      ],
      strategies: [
        'Shift the frame from "enforcing bedtime" to "supporting their health" — the same boundary, different relationship.',
        'Pick your battles: household device policy and driving safety are non-negotiable; exact bedtime in a 17-year-old is less so.',
      ],
      selfCare: [
        'The worry and helplessness of watching a sleep-deprived teenager make risky decisions is genuinely stressful. Talk to other parents or your own doctor if it is affecting your wellbeing.',
        'Protect your own sleep — you cannot parent a struggling teenager on chronic sleep deprivation yourself.',
      ],
      partner:
        'Align on which sleep-related issues are health and safety concerns (driving, significant mental health impact) versus autonomy issues (exact weekend bedtime). Fight the former battles together.',
      warnings: [
        'A teen who consistently sleeps fewer than 6 hours on school nights is in a clinical state of sleep deprivation with measurable health consequences — this deserves medical attention.',
        'If your teenager has mentioned feeling hopeless, empty, or having thoughts of self-harm alongside sleep disturbance, seek mental health care urgently.',
      ],
    },
    evidence:
      'Tarokh L et al., Sleep in Adolescence, Progress in Neurobiology 2016; Cheng W et al., Bidirectional relationship sleep–mental health, Lancet Psychiatry 2020; NTSB, Drowsy Driving 2014; Colrain IM & Baker FC, Sleep in Adolescents, Curr Opin Psychiatry 2011.',
  },
]
