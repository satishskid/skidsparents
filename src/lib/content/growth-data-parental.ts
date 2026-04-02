/**
 * Parental Coping Growth Track Data
 *
 * The parent's journey alongside their child — normalising, supporting, and
 * building parental resilience from birth through launching. Milestones and
 * red flags here are about PARENT wellbeing, not the child's development.
 *
 * Tone: warm, honest, de-shaming. "You don't have to enjoy every moment."
 */
import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ── 0–3 months ────────────────────────────────────────────────────────────
  {
    agePeriod: '0-3mo',
    ageMin: 0,
    ageMax: 3,
    title: 'The Fourth Trimester — Survival, Not Bliss',
    whatToExpect:
      'The first three months after birth are among the most physiologically and psychologically intense of any human experience. You are recovering from a major bodily event, operating on severely fragmented sleep, navigating a completely changed identity, and keeping a new person alive — often with less support than any of this requires. The cultural expectation that you should feel overwhelmed with joy is a disservice; exhaustion, ambivalence, and disorientation are equally normal.',
    keyMessage:
      'You do not have to enjoy this. Getting through it is enough. You are doing enough.',
    dailyTips: [
      'Sleep when you possibly can — not "when the baby sleeps" as a blanket prescription, but whenever a window opens. Sleep debt compounds every organ system.',
      'Accept every offer of practical help: food, laundry, being sat with, someone else holding the baby while you shower. Receiving help is a parenting skill.',
      'Lower the threshold for calling your midwife, health visitor, or GP. There is no question too small when a new baby is involved.',
    ],
    doList: [
      'Tell your partner or support person one specific thing each day that you need — not "more help," but "please take the 3am feed tonight."',
      'Check in honestly with yourself about your emotional state at least weekly — not to assess performance, but to notice if you need support.',
      'Reach out to one other new parent — the shared reality of this stage reduces isolation significantly.',
    ],
    dontList: [
      'Do not measure yourself against social media versions of new parenthood — they are a performance, not a documentary.',
      'Do not dismiss low mood or intrusive thoughts as "just hormones" — these warrant a professional conversation.',
      'Do not attempt to maintain your pre-baby productivity, social schedule, or self-expectations. This is a different chapter with different demands.',
    ],
    activities: [
      [
        'Five-Minute Outside',
        'Step outside for five minutes alone each day — just air, light, and space. This is not exercise or self-improvement; it is a minimum neurological reset that costs almost nothing.',
        5,
        'daily',
      ],
      [
        'Feeding Check-In',
        'During one feeding session per day, put down your phone, notice three things in the room, and breathe. Brief grounding practices accumulate into genuine resilience over weeks.',
        5,
        'daily',
      ],
    ],
    topics: [
      {
        key: 'baby_blues_ppd',
        patterns: [
          'crying all the time',
          'do not feel connected to baby',
          'is this postpartum depression',
          'not feeling like myself',
        ],
        response: `What you are describing is worth taking seriously and speaking with a healthcare provider about. Baby blues — tearfulness, emotional swings, low mood — are common in the first two weeks due to the dramatic hormonal shift after birth. Postnatal depression (PND) is different: it persists beyond two weeks, does not lift on its own, and can affect your relationship with yourself, your baby, and everyone around you.\n\nAmbivalence about the baby, feeling detached, or not recognising yourself are symptoms, not moral failures. PND is highly treatable and affects roughly one in five new mothers and one in ten new fathers. Telling your midwife, health visitor, or GP what you just said here is the right first step. You are not complaining; you are reporting a clinical picture that deserves care.`,
        boundary: true,
      },
      {
        key: 'identity_loss',
        patterns: [
          'who am I now',
          'lost myself',
          'do not feel like me anymore',
          'miss my old life',
        ],
        response: `Grieving the person you were before becoming a parent is one of the most common and least acknowledged experiences of new parenthood. The research term is "matrescence" (or "patrescence") — the profound identity transition that parenthood requires. It is not ingratitude and it is not a sign you made the wrong choice; it is the natural consequence of a genuinely massive life reorganisation.\n\nThis transition typically does not resolve in three months, or six, or twelve. The relationship you have with yourself is changing at a fundamental level, and that takes time. What helps most is naming it (which you are doing), having at least one person who can receive the feeling without rushing you to the "but you love them, right?" reassurance, and small deliberate acts of continuity with the person you were — one thing per week that belongs to you, not to parenthood.`,
      },
      {
        key: 'partner_conflict',
        patterns: [
          'fighting more with partner',
          'feel alone even with partner',
          'partner does not understand',
          'resentment toward partner',
        ],
        response: `Relationship satisfaction dips in the first year after a baby for the majority of couples — not because the relationship is failing but because the entire structure of your shared life has changed without a clear shared map. Different recovery timelines, different interpretations of who is doing more, different bids for connection getting missed — all of this is common and does not mean you chose the wrong person.\n\nThe single most evidence-backed relationship practice for this period is turning explicit requests into specific asks: "I need you to do the 6am feed on Saturday so I can sleep past 5" rather than "I am exhausted." It feels transactional, but ambiguous bids for support lead to ambiguous responses, and the resentment compounds. You will need to keep renegotiating the division of labour as {{child_name}}'s needs change — building the habit of direct conversation now matters enormously.`,
      },
      {
        key: 'intrusive_thoughts',
        patterns: [
          'scary thoughts about baby',
          'keep imagining something bad happening',
          'intrusive thoughts new parent',
          'afraid I might hurt baby',
        ],
        response: `Intrusive thoughts about harm coming to a new baby — including intrusive images of dropping them, accidents, or worse — are experienced by the majority of new parents and are a normal feature of the brain's hypervigilance in caring for something so vulnerable. They are involuntary, distressing, and do not reflect your intentions or character.\n\nHowever, they are worth mentioning to your GP or health visitor, particularly if they are frequent, distressing, or accompanied by rituals to prevent the feared harm. There is a spectrum from normal protective worry to postpartum anxiety or OCD that a professional can assess quickly. You are not a danger; you are a new parent with a brain that is working overtime. Naming it is not dangerous — it is the right thing to do.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pc-0-support-network',
        'Parent has identified and used at least one support person or service beyond their immediate partner',
        2,
        'Who have you leaned on this month outside of your household? What has been most helpful from others?',
      ],
      [
        'pc-0-ppd-screen',
        'Parent has been screened for postnatal depression (Edinburgh scale or equivalent) and result has been reviewed with a healthcare provider',
        1,
        'Have you completed a postnatal mood check with your midwife, health visitor, or GP? How are you honestly doing emotionally?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-0-ppd',
        description:
          'Parent reports persistent low mood, inability to feel connection with baby, intrusive thoughts, or inability to function in daily tasks for more than two weeks postpartum',
        severity: 'discuss_with_ped',
        pattern: 'symptoms consistent with postnatal depression or anxiety beyond baby blues window',
        action:
          'Encourage same-day contact with GP, midwife, or maternal mental health line; this is a clinical presentation requiring evaluation',
        referral: 'GP or Maternal Mental Health Service',
      },
    ],
    coping: {
      normalizations: [
        'Feeling overwhelmed, resentful, or joyless in the fourth trimester is normal — not a sign you are not cut out for this.',
        'Most people do not "fall in love instantly" with their baby. Attachment deepens over weeks and months; you are not behind schedule.',
      ],
      strategies: [
        'Lower your floor — not "what kind of parent do I want to be?" but "what is the minimum I need to do today to keep us both safe?" Everything above that is a bonus.',
        'Text one person each day — a friend, a family member, a new parent group — one true sentence about how you are doing. Verbalising the reality reduces its weight.',
      ],
      selfCare: [
        'Sleep is self-care right now — not baths, not yoga. Prioritise sleep above all other forms of "looking after yourself."',
        'Eating a real meal once a day is a goal worth protecting. The physical baseline matters enormously for emotional resilience.',
      ],
      partner:
        'Write down the concrete things you each need this week and swap lists — not to negotiate fairly, but to make invisible needs visible. Do this every Sunday.',
      warnings: [
        'Thoughts of harming yourself or your baby, or feeling so detached that {{child_name}} does not feel real, require same-day professional contact — not a GP appointment in two weeks.',
        'If you are drinking or using substances to cope with the intensity of this period, speak with your GP without shame — this is common and there is help.',
      ],
    },
    evidence:
      'NICE guideline PH11, Antenatal and postnatal mental health (2014, updated 2020); Dekel et al., postpartum PTSD prevalence, Psychological Medicine 2017; Mayes & Leckman, matrescence concept review, Child Development 2007; Radesky et al., postpartum parental stress, Pediatrics 2016.',
  },

  // ── 3–6 months ────────────────────────────────────────────────────────────
  {
    agePeriod: '3-6mo',
    ageMin: 3,
    ageMax: 6,
    title: 'Finding Your Rhythm — Guilt, Work, and the Comparison Trap',
    whatToExpect:
      'By 3–6 months, the acute survival crisis of the newborn period is easing, but a new layer of parental challenge arrives: the return-to-work decision, the guilt of doing anything for yourself, and the relentless comparison with other parents who seem to be managing better. This is also when postnatal depression can first fully crystallise — the initial shock of newborn care masked some symptoms that now become clearer.',
    keyMessage:
      'Guilt is not a reliable measure of your parenting quality. You will feel guilty whether you are doing it right or wrong.',
    dailyTips: [
      'Notice one thing you did well each day — not perfectly, just adequately. Competence-recognition counteracts the negativity bias that parental guilt amplifies.',
      'Reduce social media exposure to parent accounts that make you feel worse about yourself — curate your feed as actively as you curate {{child_name}}\'s diet.',
      'Say "I am having a hard day" out loud to someone, at least once this week.',
    ],
    doList: [
      'Make the return-to-work decision (if relevant) based on what works for your family, not on what you think you are supposed to feel about it.',
      'Build at least one hour per week that belongs entirely to you — not childcare, not household tasks, not work.',
      'Find one peer parent and agree to be honest with each other about how you are actually doing.',
    ],
    dontList: [
      'Do not take online parenting advice as a measure of your adequacy — it is produced for engagement, not for the specific texture of your family.',
      'Do not expect your previous energy, social life, or professional focus to have fully returned by six months. Recovery is slower than the culture pretends.',
      'Do not compare your internal experience to other people\'s external presentation.',
    ],
    activities: [
      [
        'Weekly State-of-the-Union',
        'Once a week, set a 20-minute timer and each partner answers: what is working, what is hard, and one specific thing I need from you this week. Same structure every time reduces conflict and increases follow-through.',
        20,
        'weekly',
      ],
      [
        'Your Own Appointment',
        'Schedule one appointment this month that is entirely for you — a GP check, a physio visit, a hair appointment, a coffee with a friend — and protect it as non-negotiable. Modelling that your needs matter is part of parenting.',
        60,
        'monthly',
      ],
    ],
    topics: [
      {
        key: 'return_to_work_guilt',
        patterns: [
          'going back to work guilt',
          'leaving baby with childcare',
          'should I go back to work',
          'missing milestones at work',
        ],
        response: `The guilt that accompanies the return-to-work decision is one of the most intense and least productive forms of parental guilt — because it attaches to a choice that most families do not experience as freely made. Financial necessity, career irreversibility, and mental health needs all legitimately factor in, and yet the cultural narrative tells you that a good parent's first preference is always to be present.\n\nThe research on childcare outcomes is largely reassuring: {{child_name}}'s development is far more dependent on the quality of attachment across all caregivers than on the number of hours with any one. High-quality childcare is not a developmental harm. What matters for {{child_name}} is that their primary caregivers are emotionally available when present — and a parent who is working and mentally well is often more present during the hours they are there than an exhausted, depleted parent who is home full-time.`,
      },
      {
        key: 'comparison_other_parents',
        patterns: [
          'other parents seem to have it together',
          'she makes it look easy',
          'why am I struggling when others are not',
          'everyone else seems happier',
        ],
        response: `The comparison experience you are describing is nearly universal among parents of this age group, and it is worth understanding its mechanics: you are comparing your interior experience — all your doubt, fatigue, and uncertainty — to other people's exterior performances. Everyone performing competence is hiding a comparable interior. The parent who "seems to have it together" is often having the same conversation with themselves about you.\n\nThe more useful comparison is longitudinal: how are you doing compared to three months ago? Are you managing things you could not manage then? Growth in parenting is internal and gradual, and it is invisible to anyone watching from outside — including to you, until you compare across time rather than across people.`,
      },
      {
        key: 'postnatal_depression_late_onset',
        patterns: [
          'feeling worse now than in first weeks',
          'depression getting worse not better',
          'anxiety building not settling',
        ],
        response: `Postnatal depression does not always present in the immediate postpartum — for a significant minority of parents, symptoms build over the first six months as the initial adrenaline and support recedes. The fact that you were "fine" in the first weeks does not mean this is not PND.\n\nWhat you are describing — worsening mood, increasing anxiety, not improving as the acute phase recedes — deserves a direct conversation with your GP today, not at your next routine appointment. This is a clinical presentation, not a coping failure. Treatment works well, starts working faster than you expect, and does not have to mean time away from {{child_name}}.`,
        boundary: true,
      },
      {
        key: 'body_image_postpartum',
        patterns: [
          'do not recognise my body',
          'hate how I look since baby',
          'pressure to lose baby weight',
          'my body feels wrong',
        ],
        response: `The cultural pressure on postpartum bodies — to "bounce back," to celebrate weight loss, to return to a pre-pregnancy shape — is one of the more damaging currents in modern parenting culture. Your body has done something extraordinary over the past year and is still recovering. The timelines social media presents for postpartum body change are not representative, and the pursuit of rapid weight loss at this stage is at direct odds with the energy demands of new parenthood.\n\nIf your feelings about your body are affecting your daily functioning, your relationship with food, or your ability to be present with {{child_name}}, that is worth a conversation with your GP — postpartum body image distress is a genuine clinical concern, not vanity. You deserve to feel at home in your body. That is a reasonable aspiration — just not on a timeline set by Instagram.`,
      },
    ],
    milestones: [
      [
        'pc-3-personal-time',
        'Parent has established at least one regular hour per week of personal time — consistently protected across three weeks',
        5,
        'What does your own time look like this month? Is there anything that belongs just to you?',
      ],
      [
        'pc-3-emotional-check',
        'Parent can accurately describe their current emotional state beyond "tired" — and has shared it with at least one person',
        4,
        'How are you honestly feeling this month? Not as a parent — as a person?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-3-anxiety',
        description:
          'Parent describes escalating anxiety, persistent intrusive thoughts, or panic episodes that are increasing in frequency or intensity after three months postpartum',
        severity: 'discuss_with_ped',
        pattern: 'postpartum anxiety with functional impairment, not improving over time',
        action:
          'Prompt GP appointment for anxiety assessment; NICE guidelines recommend low-intensity CBT or medication as first-line — ask specifically for postnatal anxiety, not just general anxiety',
        referral: 'GP and Maternal Mental Health Service',
      },
    ],
    coping: {
      normalizations: [
        'The six-month mark is often when the adrenaline of newborn survival wears off and the cumulative weight of sleep debt and identity change fully arrives. Feeling worse at six months than at two is common.',
        'Most parental guilt is not a signal of actual problems — it is a signal of high standards in a system with insufficient support.',
      ],
      strategies: [
        'Write down five things you have done for {{child_name}} this week. Read the list. You are doing more than guilt tells you.',
        'Choose one social media account or WhatsApp group that makes you feel inadequate and mute it for one month. Note any change in your internal state.',
      ],
      selfCare: [
        'At this stage, self-care is not a luxury — your depletion directly affects your capacity to parent. Reframe it as maintaining the instrument.',
        'Five minutes of physical activity daily — a walk around the block, stretching, anything — has measurable mood impact and does not require a gym or scheduled time.',
      ],
      partner:
        'If the division of parenting and domestic labour feels deeply unequal, name it specifically with data — "I did X on Y days last week" — rather than escalating to global fairness arguments. Specificity gets traction.',
      warnings: [
        'If you are not sleeping even when the opportunity exists — lying awake, unable to turn off — discuss this with your GP. Sleep maintenance difficulties are a clinical sign, not just "being a worried parent."',
        'If you find yourself frequently thinking you are inadequate as a parent in a way that feels certain rather than anxious, seek evaluation for postnatal depression — hopeless certainty is a different clinical signal than normal worry.',
      ],
    },
    evidence:
      'Paulson & Bazemore, prevalence of paternal depression, JAMA 2010; Haga et al., postpartum anxiety prevalence, Scandinavian Journal of Public Health 2012; Keesler & Riesz, comparison behaviour in parents, Journal of Family Psychology 2019; NHS postnatal depression guidance 2023.',
  },

  // ── 6–12 months ───────────────────────────────────────────────────────────
  {
    agePeriod: '6-12mo',
    ageMin: 6,
    ageMax: 12,
    title: 'Cumulative Exhaustion, Relationship Changes, and Working-Parent Guilt',
    whatToExpect:
      'By 6–12 months, the acute crisis has stabilised but chronic exhaustion is fully established. Sleep deprivation is cumulative and neurologically significant — decision-making, emotional regulation, and relationship quality are all compromised in ways that are hard to perceive from inside. The relationship with your partner (if you have one) is under structural strain, and working parents are managing a complexity that rarely has adequate support.',
    keyMessage:
      'Chronic sleep deprivation is a medical condition, not a parenting rite of passage. Your brain and body deserve acknowledgement.',
    dailyTips: [
      'Name your tiredness to someone each day — not to complain, but to track. Chronic depletion normalises itself and becomes invisible without naming.',
      'Choose one relationship investment per week: a specific conversation with your partner, a phone call with a friend, something that maintains a connection you value.',
      'Lower your standards in at least two domains to preserve capacity in the ones that matter most.',
    ],
    doList: [
      'Have an explicit conversation with your partner about the current division of responsibility — not as a conflict, but as an audit.',
      'If you have returned to work, give yourself a genuine transition period of 6–8 weeks before judging whether it is working.',
      'Ask your paediatrician or health visitor how you are doing as a parent — many will not ask unless you do.',
    ],
    dontList: [
      'Do not attempt to sustain the same relationship with your partner, your friendships, your work, and your self simultaneously at full intensity — something has to flex.',
      'Do not assume your emotional flatness or irritability is permanent — it is heavily influenced by sleep, which will change.',
      'Do not compare your parenting to parents of children the same age who have different support structures, finances, or temperament profiles.',
    ],
    activities: [
      [
        'Exhaustion Triage',
        'Once a week, write three lists: what must happen, what is nice to have, and what can wait or be delegated. Review the "must happen" list — it is probably shorter than the anxiety about it suggests.',
        10,
        'weekly',
      ],
      [
        'Relationship Maintenance',
        'Schedule one 30-minute non-parenting conversation with your partner per week — topic agreed in advance, no devices. This counteracts the gradual drift toward being co-managers rather than partners.',
        30,
        'weekly',
      ],
    ],
    topics: [
      {
        key: 'cumulative_sleep_deprivation',
        patterns: [
          'so tired I cannot think',
          'sleep deprivation affecting me',
          'running on empty',
          'I am not functioning',
        ],
        response: `What you are describing is a genuine neurological state — chronic sleep deprivation at the level most parents of 6–12 month olds experience impairs executive function comparably to moderate alcohol intoxication. Your difficulty thinking clearly, managing emotions, and sustaining patience is not weakness; it is physiology.\n\nThe honest answer about what helps is limited: the only real solution is more sleep, which requires either a sleeping baby (not yet in your control) or a rotation with another caregiver. If you have a partner, now is the time to have the explicit conversation about rotating night coverage rather than both being awake together. If you are parenting alone, the priority is identifying even one person who can take a block of hours — not to "help out," but because it is a health necessity.`,
      },
      {
        key: 'relationship_strain',
        patterns: [
          'partner feels like a stranger',
          'intimacy gone since baby',
          'we only talk about logistics',
          'growing apart from partner',
        ],
        response: `The experience you are describing — being logistically partnered but emotionally distant from your co-parent — is one of the most consistently reported relationship experiences of the 6–12 month period. The research is fairly stark: relationship satisfaction reaches its lowest point in the first year of parenthood for most couples, but for most it also recovers significantly once sleep normalises and the acute demands ease.\n\nThis does not mean it will fix itself without attention. The investment that pays off most in this period is protecting small, regular connection moments — not grand romantic gestures, just brief genuine conversations about things that are not baby-related. Even 10 minutes per evening of "how are you actually?" before the evening ends maintains enough of the connection to rebuild on.`,
      },
      {
        key: 'working_parent_guilt',
        patterns: [
          'missing milestones at work',
          'feel terrible leaving baby',
          'childcare guilt',
          'bad parent for working',
        ],
        response: `Working-parent guilt is particularly sharp at 6–12 months because {{child_name}}'s development is visibly rapid and the fear of "missing it" feels acute. The evidence on child outcomes is reassuring but rarely makes the guilt less visceral — logic and guilt do not operate on the same circuits.\n\nWhat tends to help most is radical presence during the time you are with {{child_name}} — not compensatory "enrichment activities" but genuine, distraction-free engagement. Twenty minutes of full, present interaction is more developmentally significant than two hours of parallel presence with a distracted parent. You cannot be there for every moment, but being fully there for the moments you are present has a measurable protective effect on attachment.`,
      },
      {
        key: 'solo_parenting',
        patterns: [
          'doing this alone',
          'single parent exhaustion',
          'no support partner',
          'managing everything myself',
        ],
        response: `Parenting a 6–12 month old without consistent support from a co-parent is among the hardest things an adult human being can sustain. The fatigue is not linear — it compounds in ways that make simple tasks feel enormous after months of solo management. The fact that you are functioning is a significant achievement, not a baseline expectation.\n\nThe most important thing in your situation is not advice about parenting — it is identifying sources of practical relief, even small ones: a family member who takes {{child_name}} for two hours, a trusted friend, a community resource. If isolation is significant, speak with your health visitor about local postnatal groups, family support services, and any welfare provisions you may be entitled to. Asking for institutional support is not failure; it is resource management.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pc-6-sleep-strategy',
        'Parent has a consistent, shared plan with their support network for managing sleep deprivation — rather than both caregivers absorbing it together',
        9,
        'What is your current plan for managing night waking? Is it working for you both? What would you change?',
      ],
      [
        'pc-6-relationship-check',
        'Parent has had at least one honest non-logistics conversation with their partner (or a close friend if single) about how they are doing as a person',
        8,
        'Who in your life knows how you genuinely feel right now — not just your schedule, but your internal state?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-6-burnout',
        description:
          'Parent describes emotional numbness, inability to feel positive emotions, or chronic low-level despair that has persisted for more than 4 weeks with no improvement',
        severity: 'discuss_with_ped',
        pattern: 'parental burnout or depressive episode, not improving with time',
        action:
          'Prompt GP appointment — distinguish between burnout (primarily needs resource change) and clinical depression (needs treatment); both are treatable',
        referral: 'GP, with possible onward referral to IAPT or equivalent',
      },
    ],
    coping: {
      normalizations: [
        'Most parents hit a wall somewhere between 6 and 12 months — the novelty has worn off, the sleep debt is at maximum, and the end is not in sight. This is the hardest stretch for many families.',
        'Irritability with your baby, your partner, and yourself at this stage is primarily physiological — your brain is running depleted. It is not character.',
      ],
      strategies: [
        'Reduce your "ought-to" list aggressively — write down everything you feel you should be doing and cross out everything that does not directly affect {{child_name}}\'s safety or your own survival.',
        'Identify your one non-negotiable self-preservation practice and protect it actively: a walk, a podcast, a shower with the door closed, whatever costs the least and returns the most.',
      ],
      selfCare: [
        'At this stage, self-care is fundamentally about sleep, food, and brief moments of not being needed. Focus there before any higher-level intervention.',
        'Physical contact with other adults — a hug, a real conversation, time in the same room as someone who is not dependent on you — is a genuine need, not a luxury.',
      ],
      partner:
        'If resentment has built up over the past months, name it without escalation: "I have been feeling resentful and I want to talk about what is driving it." Suppressed resentment leaks out through the texture of every interaction.',
      warnings: [
        'If you are having thoughts of escape — leaving, disappearing, not being here — tell someone today. These thoughts are more common than acknowledged but need professional attention.',
        'If either parent is using alcohol or substances to manage the intensity of this period, a GP conversation is warranted. This period is a known risk time for problematic use.',
      ],
    },
    evidence:
      'Mikolajczak et al., parental burnout prevalence and consequences, Clinical Psychological Science 2019; Saxbe et al., couple relationship and infant outcomes, Developmental Psychology 2018; Berger, working parent guilt and child outcomes review, Journal of Marriage and Family 2011.',
  },

  // ── 12–24 months ──────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'Toddler Intensity — Patience, Depletion, and Discipline Guilt',
    whatToExpect:
      'Toddlerhood arrives with a unique combination of delightfulness and relentlessness. {{child_name}}\'s drive for autonomy, their emotional volatility, and their physical energy are developmentally appropriate and simultaneously demanding in ways the first year was not. Parental patience is a finite resource, and yours will be exceeded regularly. Feeling like you are "losing your temper too much" is the single most common concern of parents of 12–24 month olds.',
    keyMessage:
      'Losing your patience with a toddler is normal. What matters is the repair, not the perfection.',
    dailyTips: [
      'Before engaging a meltdown, take one breath. Not to be calm — just to insert one second of intentionality between the trigger and your response.',
      'Repair after losing your temper is not optional. "I got cross, and that was too much. I love you." A 20-second repair undoes most of the harm.',
      'Track one thing per day that went well in your parenting — not to balance the ledger but to counteract the negativity bias that makes difficult moments feel representative.',
    ],
    doList: [
      'Build in regular transitions between caregivers or solo time — toddlers can absorb enormous patience, and the tank needs refilling.',
      'Normalise your anger with another parent — "I lost it at nap refusal again this week" said out loud reduces shame and isolation simultaneously.',
      'Remind yourself, regularly and out loud if needed: "this is developmental, it will change, I am not failing."',
    ],
    dontList: [
      'Do not expect yourself to manage a toddler\'s fourth meltdown of the day with the same equanimity as the first. Resources are depleted by use.',
      'Do not let guilt about losing your patience prevent the repair. The repair is more important than the original response.',
      'Do not compare your internal emotional experience of toddler parenting to the visible calm of other parents in public — public is performance.',
    ],
    activities: [
      [
        'End-of-Day Reset',
        'At the end of each day, spend five minutes away from all caregiving responsibilities — even if {{child_name}} is asleep. This is decompression time, not productive time. No parenting content.',
        5,
        'daily',
      ],
      [
        'Patience Audit',
        'Once a month, honestly reflect: what conditions most reliably deplete my patience? (Hunger, sleep, noise level, time pressure?) Then identify one structural change to reduce that condition.',
        15,
        'monthly',
      ],
    ],
    topics: [
      {
        key: 'losing_temper',
        patterns: [
          'I yell at my toddler',
          'losing my temper every day',
          'scared of my own anger',
          'shouting too much',
        ],
        response: `This is the most commonly named concern among parents of toddlers — and the guilt around it is often disproportionate to the impact, particularly when repair follows. What matters most in the attachment research is not whether ruptures occur (they always do) but whether repair is consistent. A parent who loses their voice occasionally and then reconnects — "I got too loud, I am sorry, I love you" — is meeting the core requirement.\n\nIf the frequency or intensity concerns you, two things help most: first, identifying the depletion pattern (what conditions reliably precede losing it) and addressing those conditions; second, practising the one-breath pause as a circuit-breaker rather than a full calm-down. The goal is not to eliminate anger — it is to insert enough space between feeling and reacting to choose your response.`,
      },
      {
        key: 'discipline_uncertainty',
        patterns: [
          'how to discipline toddler',
          'is time-out okay',
          'am I too strict or too soft',
          'discipline methods contradictory advice',
        ],
        response: `The volume of contradictory discipline advice available to parents of toddlers is genuinely overwhelming, and the guilt it generates ("am I too harsh? Too permissive? Using the wrong method?") is often more harmful than any particular approach. The research consensus is broader than the advice culture suggests: what matters is the overall relational climate — consistent warmth, clear expectations, predictable responses — not the specific technique.\n\nFor {{child_name}} at this age, the most evidence-backed framing is "authoritative" — warm but structured, with brief, consistent consequences for unsafe or hurtful behaviour and generous attention to good behaviour. Time-outs are not harmful when age-appropriate (one minute per year of age, maximum), but their impact is modest. Connection after correction is more important than the correction method itself.`,
      },
      {
        key: 'parental_anger',
        patterns: [
          'afraid of how angry I get',
          'anger feels out of control',
          'worried I am going to hurt baby',
          'rage at baby',
        ],
        response: `Anger toward babies and toddlers is more common than is ever acknowledged publicly — the relentlessness of care, the helplessness of a crying baby, and the chronic sleep deprivation create conditions for intense emotional responses in virtually all parents. Having the feelings is not the same as acting on them.\n\nHowever, if the anger feels out of control — if you are not confident that you can step away and not act on it — this is a situation where asking for help is the right response. Put {{child_name}} in a safe place (crib, floor), step outside the room, and call someone. If this pattern is frequent, please speak with your GP; anger management support in the postpartum context is effective and more available than parents realise. Asking for help before something happens is the protective choice.`,
        boundary: true,
      },
      {
        key: 'parental_identity_toddler',
        patterns: [
          'I am only a parent now',
          'nothing about my life is mine anymore',
          'resenting my child for taking my freedom',
        ],
        response: `Resentment about the loss of personal freedom in toddlerhood is more honest than most parents allow themselves to express. The toddler years are extraordinarily demanding of time, energy, and patience, and the "I love this and would not change it" narrative does not have room for the genuine grief of lost autonomy.\n\nYou can love your child deeply and simultaneously miss your previous freedom. These are not in conflict. What they do signal is that you need more of yourself back — not eventually, but now. Even one recurring thing per week that belongs entirely to you — a hobby, a solo walk, an evening out — changes the texture of the week enough to reduce resentment significantly. This is not selfish; it is sustainable.`,
      },
    ],
    milestones: [
      [
        'pc-12-repair-practice',
        'Parent consistently repairs emotional ruptures with toddler — returns to connection within 20 minutes of conflict on most occasions',
        18,
        'What does repair look like in your household after a difficult moment? How quickly do you typically reconnect after losing your temper?',
      ],
      [
        'pc-12-personal-time',
        'Parent has at least one activity or regular time block per week that is not defined by caregiving or domestic responsibility',
        15,
        'What exists in your life this month that is just yours? What happened to the things that used to restore you?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-12-anger',
        description:
          'Parent describes anger toward child that feels genuinely out of control, fear of acting on it, or episodes where they have handled the child roughly',
        severity: 'urgent_referral',
        pattern: 'parental anger with potential for or history of physical expression toward child',
        action:
          'Urgent GP contact; in immediate risk situations, call a crisis line. This is a clinical and safeguarding matter — reaching out for help is the protective action.',
        referral: 'GP, Crisis Line, or Child and Family Social Work depending on severity',
      },
    ],
    coping: {
      normalizations: [
        'Every parent of a toddler has lost their temper more than they would like. You are not the exception; you are the rule.',
        'Toddlers are specifically designed (developmentally) to test every boundary with persistence — their behaviour is not a referendum on your parenting.',
      ],
      strategies: [
        'Identify your top three depletion triggers and address one structurally this month: earlier bedtime for yourself, snacks available before mealtime chaos, five-minute transition time between work and home caregiving.',
        'Build a mental "permission list" — things you are explicitly allowed to feel without it meaning you are a bad parent. Start with: exhaustion, frustration, wanting to be alone, not enjoying every moment.',
      ],
      selfCare: [
        'Physical exercise for even 15 minutes daily has more evidence behind it for parental mood than most interventions. It does not need to be a workout — a walk counts.',
        'Social connection with people who are not parents of young children is protective — it reminds you that there is a world outside toddlerhood and that you are a person in it.',
      ],
      partner:
        'The toddler years are a high-conflict period for many couples. Monthly "relationship state" conversations — what is working, what is not, one specific request each — prevent accumulated resentment better than annual resets.',
      warnings: [
        'If you find yourself having persistent fantasies of escape from your family — not as a passing thought but as a recurring plan — please speak with someone today.',
        'If your primary emotion toward {{child_name}} has shifted to resentment or irritation rather than love, seek professional support without shame — this is treatable and more common than is ever publicly acknowledged.',
      ],
    },
    evidence:
      'Mikolajczak & Roskam, parental burnout model, Frontiers in Psychology 2018; Baumrind, authoritative parenting outcomes, Developmental Psychology review 2012; Zeifman & St James-Roberts, toddler demands and parental stress, Infant and Child Development 2017.',
  },

  // ── 2–3 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'Autonomy Battles and the Shame of Public Tantrums',
    whatToExpect:
      'The two-to-three year window is famous for good reason: {{child_name}}\'s drive for autonomy is neurologically driven and developmentally appropriate, but it creates daily conflict that is physically and emotionally exhausting. The public tantrum — in the supermarket, at the park, in front of other parents — carries a unique shame burden that the private meltdown at home does not. This is also when parenting style differences between co-parents often become most visible and contentious.',
    keyMessage:
      'A public tantrum says nothing about your parenting and everything about normal brain development.',
    dailyTips: [
      'Before each outing, do a brief "tank check" for yourself — hunger, fatigue, stress level. Your reserves determine how you will handle the next meltdown.',
      'When the public tantrum happens, silently remind yourself: "every parent in this space has been here. No one thinks what I think they think."',
      'Give {{child_name}} limited, real choices throughout the day — this pre-empts some autonomy battles by meeting the underlying need before it escalates.',
    ],
    doList: [
      'Build a consistent, brief response to tantrums and use it — predictability reduces the length and intensity over time.',
      'Repair and reconnect after each major conflict — a brief hug, a warm word. Do not stay in the correction.',
      'Discuss with your co-parent what your agreed-upon approach is before the next tantrum — not during it.',
    ],
    dontList: [
      'Do not escalate your own emotional response during a tantrum — the co-regulation research is clear: your calm is the intervention.',
      'Do not punish yourself for how a public meltdown was handled in the moment. Post-hoc judgement of an adrenaline-state response is not useful information.',
      'Do not apologise to strangers for your child\'s developmental behaviour — it models to {{child_name}} that their emotional expression is shameful.',
    ],
    activities: [
      [
        'Tantrum Debrief',
        'After a particularly difficult meltdown, spend three minutes writing what happened, what you did, and what you would do differently — not as self-criticism but as data collection. Patterns emerge that enable preparation.',
        5,
        'as needed',
      ],
      [
        'Co-Parent Alignment',
        'Monthly 15-minute conversation with your co-parent about what is working in your shared approach to {{child_name}}\'s behaviour and one thing you want to adjust. Same structure each time, low conflict, forward-looking.',
        15,
        'monthly',
      ],
    ],
    topics: [
      {
        key: 'public_tantrum_shame',
        patterns: [
          'embarrassed by meltdown in public',
          'people judging me',
          'other parents looking at me',
          'so ashamed when they tantrum outside',
        ],
        response: `The shame that accompanies a public tantrum is intense and almost universal — and it is worth examining what is driving it. Other people's judgement is overwhelmingly less severe than you perceive in the moment: most adults in that space have been exactly where you are, and most parents recognise a tired toddler having a normal developmental meltdown.\n\nThe shame response is partly about you feeling watched and partly about the gap between the parent you imagined being and the parent you feel you are in that moment. What helps most is not trying to suppress the shame but to respond to it with the same compassion you would offer a friend: "this is hard, everyone can see you are doing your best, and this will pass." You are right in front of yourself in those moments. How you speak to yourself matters.`,
      },
      {
        key: 'co_parent_disagreement',
        patterns: [
          'partner does it differently',
          'we disagree on discipline',
          'inconsistent parenting',
          'spouse undermines my approach',
        ],
        response: `Parenting style differences between co-parents are among the most common sources of relationship conflict in the early childhood years. Some inconsistency between caregivers is actually developmentally useful — {{child_name}} learns to navigate different expectations with different people. The concern is not difference but persistent, visible conflict between caregivers in front of {{child_name}}.\n\nThe most productive framing is to identify your two or three non-negotiable shared rules (safety, kindness, consistent bedtime routine) and allow flexibility in everything else. Undermining each other in front of {{child_name}} — "daddy does it wrong" — is what creates the most damage. A standing monthly conversation about what is working creates an update loop without making every incident a flashpoint.`,
      },
      {
        key: 'hitting_behaviour',
        patterns: [
          'hitting me',
          'child biting',
          'physical aggression from toddler',
          'how to stop hitting',
        ],
        response: `Physical aggression in 2–3 year olds is developmentally common — the impulse-control circuitry is simply not mature enough to reliably override the physical expression of big feelings. Your role is not to eliminate the impulse but to teach {{child_name}} what to do instead, over many repetitions. This will not change quickly; it changes through consistent, calm, repeated responses across months.\n\nThe response pattern that works: immediate, calm, consistent consequence ("we do not hit — I am going to move away for a moment"), followed by reconnection when calm is restored ("when you are ready, come and we will try again"). Intensity of your reaction tends to intensify the behaviour — the circuit breaker is your neutrality, not your seriousness. If biting or hitting is frequent, intense, or escalating, your paediatrician and health visitor can offer further support.`,
      },
      {
        key: 'loving_hard_moments',
        patterns: [
          'do not like my child right now',
          'is it okay to not enjoy this age',
          'not enjoying parenting',
          'find this age really hard',
        ],
        response: `It is completely okay to find this age hard and to not be enjoying it. "You have to cherish every moment" is one of the least helpful things said to parents of 2–3 year olds — a child who is relentlessly testing every limit while lacking the language to express what they need is genuinely exhausting to live with. Not enjoying this specific phase is not ingratitude for your child; it is an honest response to the demands of this developmental stage.\n\nLove and enjoyment are different things. You can love {{child_name}} deeply and completely while finding the two-to-three year window genuinely difficult. Acknowledging the difficulty honestly is actually a form of self-respect — it allows you to seek support rather than performing a joy you do not feel.`,
      },
    ],
    milestones: [
      [
        'pc-24-tantrum-strategy',
        'Parent has a consistent, calm response strategy for meltdowns that they can deploy even when depleted',
        30,
        'What does your current approach to tantrums look like? What works? What tends to escalate things?',
      ],
      [
        'pc-24-shame-management',
        'Parent can recover their equilibrium within 20 minutes of a difficult public parenting moment — without sustained self-criticism',
        28,
        'How do you typically feel an hour after a difficult public moment with {{child_name}}? Are you able to let it go?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-24-shame-spiral',
        description:
          'Parent describes persistent, intrusive thoughts of inadequacy as a parent that feel certain rather than anxious, or compulsive avoidance of situations where parenting will be observed',
        severity: 'discuss_with_ped',
        pattern: 'parental shame of clinical intensity affecting social functioning',
        action:
          'GP referral for anxiety and/or depression assessment; targeted CBT for parental shame is effective and available',
        referral: 'GP and IAPT or Clinical Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'The two-to-three year period is described as the hardest parenting stretch by a higher proportion of parents than any other — you are in the thick of it, not failing at something others find easy.',
        'No one who knows what this stage actually involves judges you for how you handle a public meltdown.',
      ],
      strategies: [
        'Before a high-risk scenario (supermarket, long car journey, post-nap outing), mentally rehearse your response to a meltdown — what you will say, what you will do first. Rehearsal reduces reactivity.',
        'Identify two or three phrases you can say to yourself mid-meltdown: "this is developmental, it will pass, I am enough." Short and repeatable is better than elaborate.',
      ],
      selfCare: [
        'After a particularly difficult day, do one thing that is genuinely restorative before sleeping — not productive, not caregiving-related. Even 10 minutes.',
        'Shared laughter about the absurdity of this stage — with a friend, a partner, a parenting group — is one of the most effective short-term regulators available.',
      ],
      partner:
        'If you find yourselves having the same argument about discipline repeatedly, ask for one session with a family therapist or parenting consultant to get an outside view — the circular conflict is more tiring than the underlying disagreement.',
      warnings: [
        'If you are avoiding social situations with {{child_name}} specifically to avoid the shame of a public meltdown, this is worth a conversation with your GP — social avoidance in parents affects children too.',
        'If you find yourself consistently taking out your frustration with {{child_name}} on your partner (or vice versa), a brief course of couples support can break the pattern before it becomes structural.',
      ],
    },
    evidence:
      'Eisenberg et al., emotion regulation and parenting, Child Development 2001; Tangney & Dearing, shame and guilt in parents, Guilford Press 2002; Ramsden & Hubbard, family emotional climate and outcomes, Developmental Psychology 2002.',
  },

  // ── 3–5 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'Preschool Transition, Academic Comparison, and Overscheduling',
    whatToExpect:
      'Preschool entry marks the first significant handover of {{child_name}}\'s day to another institution, bringing a complicated mix of relief and guilt. The first comparisons about "readiness," "advanced" children, and developmental milestones begin arriving with new intensity. The pressure to enrich, stimulate, and schedule is at its cultural peak — and the gap between what you are providing and the Instagram version of childhood can feel significant.',
    keyMessage:
      'Boredom is developmental. Unscheduled time is not neglect. You do not have to be your child\'s entertainment director.',
    dailyTips: [
      'Check whether each activity on {{child_name}}\'s schedule is there because they love it or because you feel it should be there. Both are fine — but knowing which is which is important.',
      'Notice your own emotional state at school pick-up — how you are carrying the day lands on {{child_name}} in the first five minutes of reconnection.',
      'When another parent mentions their child\'s milestone or achievement, notice your internal response before you speak. What does it tell you about your current anxiety?',
    ],
    doList: [
      'Ask {{child_name}}\'s key worker one positive observation about {{child_name}} each week — not to collect reassurance, but to broaden your picture beyond what you see at home.',
      'Build in at least two after-school periods per week with no structured activity — the value of unstructured time is real and research-backed.',
      'Give yourself permission to not enjoy every school-year obligation. School plays, committees, and bake sales are optional forms of involvement.',
    ],
    dontList: [
      'Do not compare {{child_name}}\'s preschool "readiness" to peers — the developmental range at 3–5 years is enormous and letter recognition at 3 does not predict outcomes at 10.',
      'Do not schedule more activities than you can transport to without resentment.',
      'Do not treat nursery/preschool as a failure of your own care — institutional learning environments offer genuine developmental goods that home cannot replicate.',
    ],
    activities: [
      [
        'Weekly Unscheduled Afternoon',
        'Protect one afternoon per week with no plans, no activities, no structured play. If {{child_name}} says they are bored, the answer is "I know — what could you do?" This is not neglect; it is developmental provision.',
        120,
        'weekly',
      ],
      [
        'Parental Permission Practice',
        'Write down five things you feel you "should" be doing for {{child_name}}\'s development that are not currently happening. For each one, ask: what is the evidence this matters? This is not to reassure yourself but to evaluate whether the "should" is yours or borrowed.',
        15,
        'monthly',
      ],
    ],
    topics: [
      {
        key: 'milestone_comparison',
        patterns: [
          'other children reading already',
          'behind compared to classmates',
          'should they know letters by now',
          'why is everyone else further ahead',
        ],
        response: `The developmental range for literacy and numeracy skills at 3–5 years is genuinely enormous — children who begin reading at 3.5 and those who begin at 5.5 typically converge by age 7 with equivalent outcomes. Early "advancement" at this age is far more likely to reflect teaching exposure and temperament than underlying ability.\n\nThe comparison anxiety you are feeling is both understandable and worth examining gently: whose standard is being applied here? If {{child_name}}'s preschool has no concerns, the most useful question is whether they are curious, engaged, and happy — not whether they are keeping pace with a peer cohort who are themselves all over the developmental map. Your paediatrician can give you an objective view if specific concerns persist.`,
      },
      {
        key: 'overscheduling_guilt',
        patterns: [
          'should I do more activities',
          'only one class this term',
          'am I under-stimulating them',
          'everyone does more than us',
        ],
        response: `The pressure to schedule and enrich preschool-age children is one of the most sustained cultural pressures on modern parents — and the evidence does not support its intensity. Child development research consistently finds that free, unstructured play is the most powerful learning medium available to 3–5 year olds. Structured activities have a place, particularly when chosen by the child, but they do not replace or outperform free play.\n\nIf {{child_name}} has one activity they love and adequate unstructured time, they are well-provided for. The metric that matters is not busyness but engagement — does {{child_name}} explore, create, and play imaginatively when given space? A child who can occupy themselves for 20 minutes is thriving, regardless of their weekly activity list.`,
      },
      {
        key: 'preschool_separation',
        patterns: [
          'cries at drop off',
          'so hard leaving them',
          'I cry after drop off',
          'feel guilty about preschool',
        ],
        response: `Separation distress at preschool drop-off is almost universal, and importantly — it is often harder on the parent than on the child. {{child_name}} typically settles within minutes of you leaving, while your day carries the memory of the tearful face at the door. This is not a sign you are doing something wrong or that preschool is wrong for {{child_name}}; it is the attachment system doing exactly what it is designed to do.\n\nA brief, warm, consistent goodbye routine reduces distress faster than prolonged reassurance — one hug, one clear phrase ("I will pick you up after lunch"), and then go, ideally without looking back. Your own separation feelings are real and worth acknowledging — to a friend, in a journal, to a GP if they are significant. Grief at handover is a form of love, not a signal to reverse course.`,
      },
      {
        key: 'perfect_childhood_pressure',
        patterns: [
          'pressure to give them the best childhood',
          'not enough memories',
          'should be doing more special things',
          'regular life not enough',
        ],
        response: `The idea that childhood should be a curated sequence of meaningful experiences, adequate stimulation, and beautiful family moments is a relatively modern and largely middle-class construction — and it generates enormous parental anxiety that has no proportionate benefit for children. {{child_name}}'s most formative experiences will be the texture of daily life: how you talk to them, how quickly you repair after conflict, whether they feel fundamentally safe and known.\n\nThe "perfect childhood" aspiration conflates provision with presence. A parent who is emotionally available and warm on an ordinary Tuesday provides more developmental nourishment than one who arranges extraordinary experiences while managing chronic anxiety about their adequacy. You are enough. The ordinary is enough.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pc-36-preschool-adjustment',
        'Parent has reached a stable emotional equilibrium with preschool separation — drop-offs are consistent and parent resumes own day without prolonged distress',
        42,
        'How are drop-offs going for you emotionally now? What does the rest of your morning feel like after leaving {{child_name}}?',
      ],
      [
        'pc-36-comparison-awareness',
        'Parent can notice when comparison thoughts arise without immediately acting on them — and can assess whether they are accurate',
        48,
        'When you hear about another child\'s milestone, what happens internally? Are you able to hold it with curiosity rather than anxiety?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-36-anxiety',
        description:
          'Parent reports chronic, disproportionate anxiety about child\'s development or their own parenting adequacy that is occupying significant mental bandwidth daily and resisting reassurance',
        severity: 'discuss_with_ped',
        pattern: 'parental health anxiety focused on child development, not resolving with information',
        action:
          'GP referral for assessment of anxiety disorder; this pattern is common, responds well to brief CBT, and is distinct from appropriate parental concern',
        referral: 'GP, with onward referral to IAPT or Clinical Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Every parent of a preschooler is navigating the gap between the childhood they imagined providing and the one they are actually delivering. The gap is universal; your version of it is not a personal failure.',
        'The preschool comparison culture is at its most intense and least useful right now. The differences you are seeing largely disappear by age 7–8.',
      ],
      strategies: [
        'Whenever you catch a comparison thought, append three words: "for this moment." Another child reading at 3 is ahead "for this moment" — it says nothing about trajectories.',
        'Build a weekly 10-minute ritual of noticing what {{child_name}} can do now that they could not three months ago. Longitudinal attention resets comparison-driven anxiety.',
      ],
      selfCare: [
        'Your identity is larger than your parenting performance. Invest at least one hour per week in something that has nothing to do with {{child_name}} or your household.',
        'Seek out one or two parents who are honest about the gap between their projected and actual parenting life. Honest peer company is protective.',
      ],
      partner:
        'Discuss what you each consider non-negotiable for {{child_name}}\'s childhood — not what you feel you should provide, but what actually matters to you. Finding the real shared values reduces the competitive noise.',
      warnings: [
        'If anxiety about {{child_name}}\'s development is significantly affecting your sleep, your daily functioning, or your relationship with {{child_name}} (overprotecting, over-monitoring), seek professional support.',
        'If you find yourself frequently unhappy despite your family being objectively well, examine your own wellbeing independent of parenting — depression does not always look like sadness.',
      ],
    },
    evidence:
      'Gray, free play and child development, American Journal of Play 2011; Lareau, concerted cultivation and parental anxiety, Unequal Childhoods 2011; Furedi, Paranoid Parenting, Continuum 2008; NHS antenatal and postnatal mental health guidelines 2020.',
  },

  // ── 5–8 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'School Performance Anxiety and the Parenting Style Comparison Trap',
    whatToExpect:
      'School entry begins a decade of institutional comparison — reports, reading groups, maths assessments — and the feedback loop between {{child_name}}\'s performance and your own sense of parental adequacy tightens. How other parents parent becomes more visible, and the pressure to adopt the dominant parenting culture of your peer group is real. This is also a period when many parents re-examine the parenting they received and its influence on their current approach.',
    keyMessage:
      'Your child\'s school performance is not a score on your parenting. There are many contributors, and you are only one of them.',
    dailyTips: [
      'Separate your emotional reaction to {{child_name}}\'s school results from your response to them — they need encouragement about effort, not reflection of your anxiety.',
      'Check in with one parent this week whose approach is different from yours — curiosity about difference is more useful than competition.',
      'Notice how often your concerns about {{child_name}} are about developmental outcomes versus relational warmth — the latter predicts the former more than the reverse.',
    ],
    doList: [
      'Frame school feedback — including challenges — as information for planning, not verdicts.',
      'Speak with {{child_name}}\'s teacher twice per term about wellbeing, not just attainment.',
      'Reflect periodically on what you are trying to provide that you did not receive — and whether that reflection is productive or compulsive.',
    ],
    dontList: [
      'Do not outsource your parenting confidence to school reports — they measure a narrow slice of {{child_name}}\'s capacity.',
      'Do not turn homework or reading practice into a daily conflict — the relationship cost outweighs the academic benefit.',
      'Do not make your parenting choices primarily in reaction to what other families are doing.',
    ],
    activities: [
      [
        'Strengths Inventory',
        'Once per term, write down ten things {{child_name}} is genuinely good at — not academics, just as a person: persistence, kindness, curiosity, humour. This counteracts the institutional narrowing of how you see your child.',
        10,
        'once per term',
      ],
      [
        'Parenting Values Audit',
        'Annually, write down the three values you most want {{child_name}} to carry into adulthood. Then assess honestly: does your current approach reinforce those values or undermine them? This is not a guilt exercise — it is a compass check.',
        20,
        'annually',
      ],
    ],
    topics: [
      {
        key: 'school_performance_anxiety',
        patterns: [
          'worried about reading level',
          'behind in maths',
          'teacher has concerns',
          'anxious about SATS',
        ],
        response: `The anxiety that school performance feedback generates in parents is often more intense than the situation warrants — and significantly more intense than it needs to be transmitted to {{child_name}}. Children whose parents express high anxiety about their academic performance show increased school avoidance and test anxiety, independently of their actual ability.\n\nIf a teacher has genuine concerns, treat it as information: what does {{child_name}} need, and how can home and school work together? If the concern is primarily comparison-driven — "other children in the class are further ahead" — it is worth examining what you actually know about {{child_name}}'s learning trajectory versus what you are inferring from peer position at a single point. A learning support assessment can give you reliable data if uncertainty is significant.`,
      },
      {
        key: 'parenting_style_comparison',
        patterns: [
          'other parents do everything differently',
          'strict parents at school',
          'permissive parents judging me',
          'should I do what other families do',
        ],
        response: `The social pressure of visible parenting differences — strictness, screen time, food rules, bedtime, extracurricular choices — is most intense in the school years when you are suddenly parenting in a community that observes you. It is worth distinguishing between two types of comparison: the useful kind (noticing an approach that might work better for your family) and the depleting kind (measuring your value against another family's approach).\n\nThe most secure parenting position is one grounded in your own values rather than your peer group's norms. That does not mean being defensive about your approach — openness to updating is part of good parenting. But the question to ask is not "what are other families doing?" but "what do I actually believe is right for {{child_name}}, and why?"`,
      },
      {
        key: 'intergenerational_patterns',
        patterns: [
          'parenting like my parents',
          'doing things I swore I would not do',
          'repeating patterns from childhood',
          'scared of my own upbringing affecting my parenting',
        ],
        response: `The awareness you are showing — recognising when you are repeating patterns from your own childhood — is genuinely one of the most powerful protective factors in developmental psychology. The research on intergenerational transmission of parenting styles consistently shows that awareness of the pattern is the key moderating variable: parents who have processed their own childhood tend to parent more securely than their history alone would predict.\n\nThis does not need to be a crisis. Most intergenerational patterns contain both resources (resilience, values) and liabilities (ways of managing emotions, conflict styles). A brief course of reflective parenting support or personal therapy targeted at this specific question can have outsized impact on {{child_name}}'s experience — and on your own wellbeing. It is some of the most efficient investment you can make.`,
      },
      {
        key: 'helicopter_versus_free_range',
        patterns: [
          'am I too protective',
          'should I give more independence',
          'overprotective parent',
          'other kids have more freedom',
        ],
        response: `The helicopter-versus-free-range framing in parenting culture creates a false binary that generates more anxiety than clarity. The developmental evidence supports graduated autonomy — steadily expanding {{child_name}}'s independence in line with demonstrated competence and your knowledge of the specific environment's actual risk level.\n\nThe question is not "am I too protective?" but "is my protectiveness based on assessed risk or on my own anxiety?" A parent who carefully evaluates a situation and decides {{child_name}} is not ready for a specific independence yet is making a calibrated decision. A parent who restricts based on anxiety that does not track to actual risk is worth gently examining with curiosity. Your own nervous system's threat response is not always an accurate guide to {{child_name}}'s actual safety.`,
      },
    ],
    milestones: [
      [
        'pc-60-school-equilibrium',
        'Parent maintains a relatively stable emotional baseline through school report cycles — able to receive feedback without significant distress or self-criticism',
        72,
        'How do you typically feel after parent-teacher meetings? What is your internal narrative after receiving feedback about {{child_name}}?',
      ],
      [
        'pc-60-values-anchoring',
        'Parent can articulate two or three core parenting values that guide decisions independently of peer group norms',
        80,
        'What guides your parenting decisions when you are uncertain? How do you distinguish your own values from social pressure?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-60-perfectionism',
        description:
          'Parent reports parenting perfectionism of clinical intensity: persistent intrusive self-criticism, inability to tolerate ordinary parenting mistakes, significant daily distress, or vicarious anxiety through child\'s performance',
        severity: 'discuss_with_ped',
        pattern: 'perfectionism driving chronic parental distress and potentially transmitting anxiety to child',
        action:
          'GP referral for assessment of perfectionism and anxiety; CBT with specific perfectionism focus is highly effective',
        referral: 'GP and Clinical Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Parental anxiety about school performance is normal — the system is designed to generate comparison, and opting out of the anxiety entirely is harder than it sounds.',
        'Repeating aspects of your own parents\' approach is universal — the question is never whether you will, but which parts and whether you want to.',
      ],
      strategies: [
        'When school-related anxiety spikes, ask yourself: "am I responding to {{child_name}}\'s actual experience, or to my own story about what this means?" They are often different.',
        'Find one parent you trust to be honest with about school-performance anxiety — it is far more common than the composed faces at the school gate suggest.',
      ],
      selfCare: [
        'Your own learning and development does not have to be on hold because {{child_name}} is in school. Investing in something that grows you — a course, a skill, a project — maintains your identity as a person beyond your parenting role.',
        'Therapy or coaching focused specifically on the intergenerational material is highly efficient at this life stage. The return on investment is large.',
      ],
      partner:
        'Academic anxiety tends to map differently onto co-parents — one may be more anxious than the other. An explicit conversation about how you will communicate with {{child_name}} about school performance reduces inconsistent messaging.',
      warnings: [
        'If your anxiety about {{child_name}}\'s school performance is being communicated to them through your body language, your questions, or your reactions — and if {{child_name}} appears to be absorbing it — seek support promptly. Transmitted parental anxiety is a genuine risk factor.',
        'If you are significantly unhappy despite your family being objectively functional, examine your own wellbeing. Parenting is not the only contributor to adult life satisfaction.',
      ],
    },
    evidence:
      'Gottman et al., emotion coaching and child outcomes, Raising an Emotionally Intelligent Child 1997; Luthar, privileged but pressured, Child Development 2003; Fonagy & Target, mentalization and parenting, Development and Psychopathology 2005.',
  },

  // ── 8–12 years ────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Pre-Teen Distance, Letting Go, and the Social Media Parenting Pressure',
    whatToExpect:
      '{{child_name}} is beginning the gradual process of moving toward peer orientation and away from parent-orientation — a developmentally necessary shift that can feel like rejection. The warmth that came easily at 5 requires more effort to access at 10. Simultaneously, the social media parenting discourse about screens, activities, and monitoring reaches its most intense pitch. The grief of the relationship changing is one of the least acknowledged aspects of this developmental stage.',
    keyMessage:
      '{{child_name}} moving away from you is the plan — it means you did it right. Stay warm and available even when the door is closing.',
    dailyTips: [
      'Accept the cuddles and conversations when they come without remarking on their rarity — commenting on the shift makes {{child_name}} self-conscious and reduces recurrence.',
      'Find the access points that remain: car journeys, side-by-side activities, shared interests. Connection does not have to be face-to-face.',
      'Resist the urge to fill every silence with a question. Comfortable silence with a pre-teen is a form of closeness.',
    ],
    doList: [
      'Show genuine interest in {{child_name}}\'s peer world — not to monitor it but because what matters to them matters to you.',
      'Give {{child_name}} enough privacy to practise independence before it is required.',
      'Name the shift warmly: "you are growing up — I like who you are becoming even when I miss who you were."',
    ],
    dontList: [
      'Do not personalise the pulling-away — it is developmental, not a verdict on your relationship.',
      'Do not compete with {{child_name}}\'s peers for emotional primacy — the peer group is where they are supposed to be turning.',
      'Do not withdraw your warmth in response to their cool — they are watching whether you are still there even when they push.',
    ],
    activities: [
      [
        'Side-by-Side Time',
        'Establish one regular activity where you are both present but not face-to-face: cooking together, driving to an activity, watching a series together. Pre-teens often talk more when not directly questioned.',
        30,
        'weekly',
      ],
      [
        'Interest Follow',
        'Once per term, engage genuinely with something {{child_name}} is passionate about — watch one of their videos, learn one thing about their favourite game, listen to their music. Not to manage them, but to know them.',
        30,
        'once per term',
      ],
    ],
    topics: [
      {
        key: 'pre_teen_distance',
        patterns: [
          'does not want to be with me anymore',
          'only wants to be with friends',
          'not interested in family time',
          'feels like they are pulling away',
        ],
        response: `What you are describing is one of the most common and least discussed grief experiences of parenthood — the gradual shift of your child's primary attachment from family to peer group. It is developmentally correct and healthy; a 10-year-old who prefers family over friends is statistically less well-adjusted, not more. But that does not make the transition less poignant to experience.\n\nThe most important thing to know is that your availability still matters enormously — perhaps more than at any time since early childhood. {{child_name}} is not leaving you; they are practising independence from a secure base. The security of that base is maintained by your consistent warmth even when they are cool, your continued interest even when they are dismissive, and your being there when the peer world inevitably disappoints.`,
      },
      {
        key: 'parenting_pressure_comparison',
        patterns: [
          'other parents do so much more',
          'not doing enough activities',
          'perfect parent online',
          'parenting influencers',
        ],
        response: `The parenting content industry has its most intense effect on parents of 8–12 year olds — the advice about screens, development, enrichment, and monitoring is voluminous and frequently contradictory. The implicit message is that vigilant, involved parents manage their children's development actively; the reality is that the most protective factor in this age group is the warmth and security of the parent-child relationship, which is not optimised by technique.\n\nA useful filter for any parenting advice or comparison: is this information helping me be more present and connected with {{child_name}}, or is it making me more anxious about whether I am doing it right? If the latter, the information may not be serving you or {{child_name}}.`,
      },
      {
        key: 'letting_go_anxiety',
        patterns: [
          'scared of giving them independence',
          'not ready for them to grow up',
          'holding on too tight',
          'grief about them getting older',
        ],
        response: `The grief of a child growing up is one of the cleanest forms of love — you are mourning who they were, not losing what you have now. Most parents of 8–12 year olds carry a complicated emotional mix of pride in who {{child_name}} is becoming and sadness about what is passing, and very few spaces acknowledge both simultaneously.\n\nLetting go is not abandonment — it is an active parenting skill that requires as much effort as holding on. The most useful frame is not "I have to let them go" (which emphasises loss) but "I am building the conditions for them to come back freely" — people return to places where they felt known and safe. Your job in these years is to remain that place, even as {{child_name}} ranges further from it.`,
      },
      {
        key: 'being_liked_by_your_child',
        patterns: [
          'they do not like me',
          'only want dad not me',
          'I am the mean parent',
          'feel rejected by my own child',
        ],
        response: `Being the enforcer parent — the one who sets limits, holds boundaries, and says no — is genuinely thankless in the short term. The child who currently resents you for being consistent is developing the internalised values that come from having limits held warmly and without exception.\n\nBeing liked right now and being the parent {{child_name}} needs right now are sometimes different things — and most parents oscillate between the two rather than choosing one. The research on this is reassuring: children who describe their parents as "strict but fair" in adolescence consistently show better outcomes than those who describe them as exclusively permissive or exclusively harsh. You are building something that will matter more at 25 than it does at 10.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'pc-96-grief-processing',
        'Parent has named and processed the relational shift with their pre-teen — rather than personalising the pulling-away or suppressing the grief',
        120,
        'How are you experiencing {{child_name}}\'s move toward independence? What feels like loss, what feels like pride?',
      ],
      [
        'pc-96-access-maintenance',
        'Parent has at least one consistent side-by-side activity with {{child_name}} that maintains connection without requiring face-to-face emotional exchange',
        108,
        'What are the access points for connection with {{child_name}} right now? What still works?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-96-grief',
        description:
          'Parent reports significant depressive symptoms centred on child\'s growing independence — loss of purpose, persistent low mood, or relationship functioning significantly impaired',
        severity: 'discuss_with_ped',
        pattern: 'parental depression associated with child individuation, identity disruption',
        action:
          'GP appointment for mood assessment; brief therapy addressing identity transition is highly appropriate at this life stage',
        referral: 'GP and Therapist or Counsellor',
      },
    ],
    coping: {
      normalizations: [
        'Missing your younger child while loving the older one is not confusion — it is a normal and healthy response to loss and growth existing simultaneously.',
        'Being the uncool parent, the mean parent, or the one they roll their eyes at is not evidence you are failing. It is evidence you are holding boundaries.',
      ],
      strategies: [
        'Maintain regular contact with parents of similar-aged children — the normalisation of pre-teen dynamics that comes from peer conversation is genuinely stabilising.',
        'Find the narrative that helps you: not "they are leaving" but "they are practising" — and your job is to be the place they practise coming back to.',
      ],
      selfCare: [
        'As {{child_name}} needs you differently, your own identity may feel less anchored. Investment in your own interests, friendships, and goals is not neglect — it is modelling.',
        'Therapy focused on identity and life-stage transitions is particularly valuable at this point — the mid-parenting years are an underserved life stage.',
      ],
      partner:
        'The shift in your child\'s attachment can paradoxically create space to reinvest in your couple relationship — a conscious choice to do so is worth making now rather than waiting until {{child_name}} leaves home.',
      warnings: [
        'If {{child_name}}\'s growing independence has left you feeling purposeless or persistently low, this is worth professional attention — parent identity crisis is a genuine clinical presentation.',
        'If you are increasing monitoring, restriction, or conflict with {{child_name}} as they become more independent, examine whether anxiety is driving overcontrol — and whether that overcontrol is serving anyone.',
      ],
    },
    evidence:
      'Steinberg, separating-and-connecting framework, Current Directions in Psychological Science 1990; Luthar & Ciciolla, who mothers the mothers?, Development and Psychopathology 2016; Arnett & Schwab, Clark Univ Poll of Parents of Young Adults 2012.',
  },

  // ── 12–15 years ───────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'Teen Rebellion Coping, Picking Battles, and Grief for the "Lost Child"',
    whatToExpect:
      'Early adolescence often feels like a relationship earthquake — the child you knew has been temporarily replaced by a version who is hostile, private, and certain that you understand nothing. This is one of the most emotionally demanding parenting experiences, and one of the least socially supported. The "lost child" grief — for the warm, accessible younger child — is real and deserves acknowledgment. Most relationships do recover, but the path through is demanding.',
    keyMessage:
      'The adolescent who is hardest to be close to is often the one who most needs you to stay. Keep showing up.',
    dailyTips: [
      'Do not require reciprocity right now — give warmth without needing it returned, and trust that the investment is banking for later.',
      'Pick one or two battles and let the rest go. Non-negotiables (safety, basic respect, school attendance) and everything else is negotiable.',
      'Name what you appreciate about {{child_name}} out loud at least once per week — not their achievements, their character.',
    ],
    doList: [
      'Maintain connection rituals even when they are unilateral — a regular meal together, a brief check-in, a text that does not require a response.',
      'Tell {{child_name}} explicitly that you will not punish them for being honest with you about difficult things.',
      'Seek your own support — a therapist, a parent group, a trusted friend — to process the intensity of this stage.',
    ],
    dontList: [
      'Do not withdraw your warmth because theirs is absent — your consistency is the anchor in a sea of their developmental instability.',
      'Do not escalate every conflict — the goal is the relationship at 25, not winning the argument tonight.',
      'Do not share your distress about the relationship with {{child_name}} in ways that make them responsible for managing it.',
    ],
    activities: [
      [
        'Undemanding Presence',
        'Make yourself physically present in a shared space with {{child_name}} regularly — kitchen, living room — without asking questions or making demands. Just being there. Pre-teens and young teenagers often open up sideways when there is no direct conversational pressure.',
        20,
        'daily',
      ],
      [
        'Parental Support Circle',
        'Identify one other parent of a teenager and establish a regular brief check-in — not to compare or problem-solve, but to normalise and witness. "I see you, this is hard" is the most valuable thing available in this stage.',
        20,
        'weekly',
      ],
    ],
    topics: [
      {
        key: 'teen_rebellion',
        patterns: [
          'hates everything I do',
          'arguing every day',
          'nothing I do is right',
          'constant conflict',
        ],
        response: `The conflict you are describing is not a sign of relationship failure — it is a sign of a developing adolescent doing exactly what their neurobiology requires: differentiating from parents to form an independent identity. The irritability, the eye-rolls, and the argument-picking are the social mechanisms of individuation. This does not make it easier to live in; it just means the intensity is not a verdict on you or your relationship.\n\nThe most important longitudinal predictor of adolescent wellbeing is the quality of the parent-adolescent relationship despite conflict — not the absence of conflict. Families that argue regularly but maintain warmth, humour, and repair produce better outcomes than those that either avoid conflict or sustain ongoing cold distance. You are building the relationship that matters at 25 — keep investing.`,
      },
      {
        key: 'picking_battles',
        patterns: [
          'which battles to pick',
          'when to let things go',
          'fighting about everything',
          'how to choose what matters',
        ],
        response: `The ability to choose which conflicts are worth pursuing is one of the more sophisticated parenting skills and develops through the teenage years rather than arriving fully formed. The framework that helps most families: sort every potential conflict into "safety," "values," and "preferences." Safety issues are non-negotiable and worth consistent, firm responses. Values issues (honesty, kindness, basic respect) are worth the investment of conversation even when the conversation is hard. Preferences (bedroom state, clothing, hair, music) are almost never worth the relational cost.\n\nThe tactical question when facing a potential conflict is: "in five years, does this matter, or does it just bother me right now?" If the honest answer is "it just bothers me," that is information about which category it belongs in.`,
      },
      {
        key: 'lost_child_grief',
        patterns: [
          'miss who they used to be',
          'do not recognise my child',
          'grieving the younger child',
          'teenager is a stranger',
        ],
        response: `The grief you are describing is one of the most universal and least acknowledged experiences of parenting an adolescent. The warm, accessible child who thought you were wonderful has been replaced — temporarily — by someone who treats you as an obstacle or an embarrassment. This is a real loss, and the fact that it is developmental does not make it less painful.\n\nMost parents report that the relationship recovers and deepens in early adulthood in ways they did not anticipate during the storm of adolescence. But knowing that does not help much at 1am after a difficult evening. What helps is having people who can witness the grief without rushing you to acceptance — and reminding yourself regularly that the adolescent standing in front of you and the child you miss are the same person, temporarily remapping.`,
        boundary: true,
      },
      {
        key: 'parental_mental_health_teen',
        patterns: [
          'teenager is affecting my mental health',
          'cannot cope with adolescent behaviour',
          'depressed by my teenager',
          'constantly anxious about teen',
        ],
        response: `The impact of parenting an adolescent on parental mental health is real and documented — parents of teenagers report lower wellbeing than parents of younger children or adults without children. This is not moral failure; it is an honest acknowledgement that sustained conflict, worry, and emotional unavailability in a relationship you care about deeply has a cost.\n\nWhat you are describing deserves direct attention — not because something is wrong with you or your teenager, but because you need support to sustain this stage well. A therapist who works with parents of adolescents, a parenting support group, or even a GP appointment to describe what you have just described here is the appropriate first step. You being well is not separate from {{child_name}} being well; it is a prerequisite.`,
      },
    ],
    milestones: [
      [
        'pc-144-conflict-management',
        'Parent has a consistent approach to adolescent conflict that maintains connection even through disagreement — using repair and not withdrawing warmth',
        162,
        'How do conflicts with {{child_name}} typically resolve? Is there repair? How is the relationship the day after a difficult exchange?',
      ],
      [
        'pc-144-support-access',
        'Parent is accessing regular support from at least one source (friend, group, therapist) specifically for the demands of parenting a teenager',
        150,
        'Where are you getting support for this stage of parenting? Who in your life can witness what this is like without judgment?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-144-depression',
        description:
          'Parent describes low mood, hopelessness, or loss of pleasure that has persisted for more than two weeks and is significantly affecting daily functioning — not episodic distress but sustained depression',
        severity: 'discuss_with_ped',
        pattern: 'parental depressive episode during adolescent-parenting stage',
        action:
          'Prompt GP appointment for depression assessment and treatment planning; this stage of parenting is a known risk period for parental depression',
        referral: 'GP and Therapist or Psychiatrist',
      },
    ],
    coping: {
      normalizations: [
        'Parenting a 12–15 year old is described by most parents retrospectively as the most emotionally demanding stage of the entire journey.',
        'Feeling rejected, dismissed, and ineffective as a parent of an adolescent is universal — it says nothing about the quality of what you have built or what is coming.',
      ],
      strategies: [
        'Establish a strict "not now, later" rule for yourself in high-conflict moments — removing yourself before escalation is more effective than trying to win or de-escalate in the moment.',
        'Write down three ways your relationship with {{child_name}} is still intact — moments of connection, humour, or warmth that happened this month. Document them when they occur; memory in this stage is biased toward the difficult.',
      ],
      selfCare: [
        'Your own therapy or counselling right now is not a luxury — parenting a teenager without personal support is unnecessarily hard, and the return on investment is significant.',
        'Physical activity, social connection, and at least one source of enjoyment that is entirely independent of your family are protective. Build them deliberately.',
      ],
      partner:
        'Parenting an adolescent tests co-parent alignment more than any previous stage. Regular brief conversations about approach consistency are valuable — and a family therapist who can hold both perspectives neutrally is worth considering if you are significantly misaligned.',
      warnings: [
        'If conflict with your teenager is becoming the dominant feature of your family\'s emotional climate for extended periods, family therapy is warranted — not as a last resort but as a sensible intervention.',
        'If you are managing your distress about {{child_name}}\'s adolescence primarily through alcohol, overwork, or avoidance, this pattern needs direct attention.',
      ],
    },
    evidence:
      'Steinberg & Morris, adolescent development, Annual Review of Psychology 2001; Luthar & Ciciolla, parenting in the age of teens, Development and Psychopathology 2016; McGoldrick et al., The Expanded Family Life Cycle, Pearson 2015.',
  },

  // ── 15–18 years ───────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Launching Anxiety, Empty Nest Anticipation, and Trust Versus Control',
    whatToExpect:
      'The final stretch of active parenting brings a complicated emotional cocktail: pride in who {{child_name}} is becoming, grief about what is ending, anxiety about the risks of increased autonomy, and the beginning of an identity renegotiation for yourself. The practical tasks — university or work decisions, driving, relationships, mental health — are significant. So is the internal task of preparing to let go in a way that leaves the relationship intact for the decades ahead.',
    keyMessage:
      'The goal of all the years of parenting is standing right in front of you — a person who is ready to leave. Your job now is to make leaving feel safe, not punitive.',
    dailyTips: [
      'Offer counsel without requiring it to be taken. The habit of consulting you is what you are building — not compliance.',
      'Name what you are proud of about {{child_name}} specifically and regularly. They need to hear it from you more than from anyone else.',
      'Examine your control impulses with honest curiosity: is this about {{child_name}}\'s safety, or your own anxiety?',
    ],
    doList: [
      'Have the launching conversations explicitly: what independence looks like, what staying connected looks like, what will and will not change.',
      'Process your own anticipatory grief — with a therapist, a friend, your partner — rather than with {{child_name}}.',
      'Begin investing in what your life looks like after {{child_name}} is launched — not to rush the leaving, but to be ready.',
    ],
    dontList: [
      'Do not make {{child_name}}\'s departure feel dangerous or guilty — they need permission to go forward as much as they need a home to return to.',
      'Do not confuse control with protection at this stage — the distinction matters enormously to your long-term relationship.',
      'Do not treat the transition as a loss until it is one — {{child_name}} is not disappearing; the relationship is changing form.',
    ],
    activities: [
      [
        'Launching Conversation',
        'Have one explicit, warm conversation with {{child_name}} about the upcoming transition — what you hope for them, what you will miss, what you want your relationship to look like in five years. Not as a negotiation, as a gift.',
        45,
        'once in this period',
      ],
      [
        'Identity Investment',
        'Commit to one new project, interest, or relationship that is entirely yours and not contingent on {{child_name}}\'s presence. This is preparation, not abandonment — being ready for this stage is a gift to both of you.',
        60,
        'weekly',
      ],
    ],
    topics: [
      {
        key: 'launching_anxiety',
        patterns: [
          'terrified of them leaving',
          'what if they cannot manage',
          'not ready for them to go',
          'anxious about university',
        ],
        response: `Launching anxiety is a genuine and under-acknowledged emotional experience for parents — the prospect of the daily presence that has structured your life for 18 years changing fundamentally is a major life transition, not a minor adjustment. Anxiety about whether {{child_name}} is ready, whether they will be safe, and whether you have prepared them adequately is universal among parents at this stage.\n\nThe research on outcomes is largely reassuring: young people from warm, connected families navigate the transition to independence considerably better than parental anxiety would predict. The most protective thing you can do now is communicate — explicitly and warmly — that you trust {{child_name}}'s capacity to manage, that you are available for support without managing the situation, and that the relationship continues in a new form. Fear communicated to {{child_name}} about their readiness undermines the very confidence they need to launch.`,
      },
      {
        key: 'empty_nest',
        patterns: [
          'dreading empty nest',
          'who am I when they leave',
          'my identity is my children',
          'life feels purposeless after 18',
        ],
        response: `The identity disruption of the empty nest is one of the most significant adult developmental transitions and one that gets the least cultural preparation. If parenting has been the primary organising principle of your identity for 18 years, the prospect of its conclusion is genuinely destabilising — and the fact that it is "supposed to happen" does not reduce the significance of the transition.\n\nThis is the moment when the investment in your own interests, relationships, and goals that you may have deferred across the parenting years becomes most urgently relevant. Not as consolation for loss, but as the ground on which your next chapter stands. A therapist who works with life-stage transitions can be enormously valuable here. This is not a crisis; it is a developmental transition that deserves as much intentional preparation as any other.`,
        boundary: true,
      },
      {
        key: 'trust_versus_control',
        patterns: [
          'how much do I let them do',
          'should I track their phone',
          'checking in or controlling',
          'where is the line',
        ],
        response: `The trust-versus-control tension at 15–18 is genuinely complex because the stakes are real: the risks {{child_name}} can encounter now — substances, relationships, driving, mental health — are significant. The question is not whether to stay involved but how to stay involved in a way that keeps communication open rather than closing it down.\n\nThe research on adolescent autonomy is consistent: young people who feel trusted make safer decisions than those who feel surveilled. Covert monitoring — secret phone tracking, reading messages without knowledge — damages the trust relationship when discovered and reduces disclosure precisely when you need it most. Transparent agreements — "I can see your location and you know it; come to me if you are ever in a situation you need help out of" — maintain both safety and trust. The goal is {{child_name}} calling you when something goes wrong, not you discovering it afterward.`,
      },
      {
        key: 'parental_identity_post_child',
        patterns: [
          'who am I after parenting',
          'relationship with partner after kids',
          'reclaiming identity',
          'what do I do now',
        ],
        response: `The identity question you are sitting with — "who am I after this primary parenting phase?" — is one of the most important and least discussed questions in adult development. The answer is not primarily about what you will do, but about reacquainting yourself with who you are independent of your parenting role.\n\nThis is an invitation, not a loss. The parts of yourself that were present before parenthood — curiosity, ambition, creativity, the specific quality of your relationships — were not extinguished; they were deferred. What is beginning now is a retrieval. Many parents report that the post-launching years bring a quality of presence and personal investment in their own lives that they had forgotten was available. This is the beginning of that, not the end of something.`,
      },
    ],
    milestones: [
      [
        'pc-180-identity-investment',
        'Parent has identified and begun investing in at least two areas of personal identity that are not defined by parenting — a relationship, interest, or project that will carry them into the next chapter',
        204,
        'What exists in your life right now that is entirely yours? What do you imagine your days looking like in three years?',
      ],
      [
        'pc-180-launching-communication',
        'Parent has had at least one explicit, warm conversation with {{child_name}} about the approaching transition — expressing trust, pride, and continued availability',
        198,
        'Have you and {{child_name}} talked openly about what leaving home and staying connected will look like? What was said? What still needs to be said?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-pc-180-empty-nest-depression',
        description:
          'Parent reports significant depressive symptoms anticipated or experienced with {{child_name}}\'s launching — loss of purpose, identity crisis with functional impairment, or relationship crisis with partner',
        severity: 'discuss_with_ped',
        pattern: 'empty nest depression or major life-stage identity crisis with functional impairment',
        action:
          'GP appointment for mood assessment; life-stage transition therapy is highly effective here and is distinct from treatment-as-usual depression',
        referral: 'GP and Life-Stage Therapist or Counsellor',
      },
    ],
    coping: {
      normalizations: [
        'Most parents of 15–18 year olds are simultaneously proud and bereft, ready and terrified, holding on and letting go. These are not contradictions; they are the texture of this stage.',
        'You have spent 18 years building a person who is ready to leave. That was the goal. Feeling ambivalent about achieving it is profoundly human.',
      ],
      strategies: [
        'Begin the identity retrieval now, before launching — not as preparation for loss but as parallel investment. What do you want the next 20 years to contain?',
        'Tell {{child_name}} about your experience of this stage with warmth and without burden — "I am going to miss you enormously and I am so proud of who you are." They need to know they are going with your blessing.',
      ],
      selfCare: [
        'Investment in your couple relationship (if applicable) now, before the empty nest, dramatically changes the experience of the empty nest. It is not too late to begin.',
        'Professional support for this transition — a therapist or life coach specialising in midlife transitions — is well-evidenced and available. It is not a crisis intervention; it is developmental support.',
      ],
      partner:
        'The empty nest is a major couple transition as well as a parenting one. Many couples have been so thoroughly co-managers of parenting that the relationship underneath needs deliberate rediscovery. Begin that conversation now.',
      warnings: [
        'If the prospect of {{child_name}} leaving is producing significant anxiety, depression, or relationship strain, seek professional support before rather than after — anticipatory distress is treatable and often easier to address earlier.',
        'If you find yourself creating obstacles to {{child_name}}\'s launching — subtly undermining their confidence, creating family crises that require their presence — examine this honestly with a therapist. It is more common than acknowledged.',
      ],
    },
    evidence:
      'Mitchell, revisiting the "empty nest" syndrome, Journal of Marital and Family Therapy 2010; Arnett, emerging adulthood, American Psychologist 2000; Bowen, family systems theory and individuation, Basic Books 1978; MIND UK, parental mental health in adolescence 2022.',
  },
]
