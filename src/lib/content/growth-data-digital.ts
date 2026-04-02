/**
 * Digital Wellness Growth Track Data
 *
 * Evidence-based screen guidance across childhood — framed around healthy
 * tech relationships, not fear. Covers WHO/AAP recommendations with context.
 */
import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ── 12–24 months ──────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'Zero Solo Screens — and That Is Okay',
    whatToExpect:
      'Your toddler\'s brain is wiring itself at an extraordinary pace through touch, movement, and face-to-face interaction — digital screens simply cannot replicate that richness right now. WHO and AAP both recommend zero solo screen time under 24 months; the one exception is live video calls (FaceTime, WhatsApp) with a known family member, always with you present.',
    keyMessage:
      'No screen is not a deprivation — it is the single best gift you can give a 12–24-month-old brain.',
    dailyTips: [
      'When {{child_name}} is restless, reach for a board book, a textured toy, or a walk outside before any screen option.',
      'If you use a device yourself while {{child_name}} is awake, turn the screen away — background TV slows language development even when no one is watching.',
      'Video calls with grandparents count as quality interaction; sit beside {{child_name}} and narrate who they are seeing.',
    ],
    doList: [
      'Use live video calls as the only screen exception — and stay present throughout.',
      'Narrate your own day constantly; your voice is the richest media {{child_name}} has.',
      'Create a "no-phone zone" during meals and the hour before bedtime.',
    ],
    dontList: [
      'Do not use a screen as a pacifier for fussiness — it trains the brain to need escalating novelty.',
      'Do not leave a TV on as "background noise"; it fragments attention and interrupts parent-child talk.',
      'Do not feel guilty for not using "educational apps" — they are not evidence-based at this age.',
    ],
    activities: [
      [
        'Board-Book Co-Read',
        'Sit {{child_name}} in your lap and read a board book, pausing to point, name, and wait for their gaze. Repetition is the goal — the same book 20 times builds more than 20 different books once.',
        10,
        'daily',
      ],
      [
        'Sensory Exploration Tray',
        'Fill a shallow tray with rice, dried pasta, or sand. Let {{child_name}} pour, scoop, and feel while you describe textures and actions aloud. This builds vocabulary and tactile intelligence that no app can replicate.',
        15,
        '3x per week',
      ],
    ],
    topics: [
      {
        key: 'educational_apps',
        patterns: [
          'educational app for toddler',
          'is Baby Shark on YouTube okay',
          'learning videos for 1 year old',
        ],
        response: `That's one of the most common questions parents have — and the marketing around "educational baby apps" is genuinely misleading. The research is consistent: under 24 months, {{child_name}}\'s brain cannot transfer what it sees on a flat screen to the real world. This is called the "video deficit effect," and it holds even for well-designed content.\n\nThe best educational tool you have is your own voice narrating the world. Every time you say "there's the red cup — red, like your hat," you are building vocabulary, categorisation, and social connection simultaneously. No app comes close.`,
      },
      {
        key: 'video_calls',
        patterns: [
          'FaceTime grandparents',
          'video call with family',
          'is WhatsApp video okay',
        ],
        response: `Video calls with known, loving family members are the one meaningful exception to the no-screen guideline — and for good reason. A live, responsive person on a screen engages {{child_name}} in a real social exchange; pre-recorded video does not. Stay right beside {{child_name}} during the call, point to the screen and name the person, and keep it short (5–10 minutes is plenty).\n\nThis kind of supported video interaction actually supports language development and attachment with distant family. The key word is "supported" — {{child_name}} still needs you in the room bridging the experience.`,
      },
      {
        key: 'parent_phone_use',
        patterns: [
          'I am on my phone too much',
          'phone while baby plays',
          'distracted by my phone',
        ],
        response: `You are not alone — this is one of the most honest worries parents share. Research does show that when caregivers are absorbed in a device, back-and-forth conversational turns with the baby drop significantly, and those turns are the core ingredient for language development. That does not mean you can never look at your phone; it means being intentional about when.\n\nA practical framing: "serve and return" moments (when {{child_name}} looks at you, points, babbles, and you respond) are the real developmental engine. Designating phone-free windows — meals, outdoor play, the wind-down hour — protects enough of those moments without requiring perfection.`,
        boundary: true,
      },
      {
        key: 'screen_for_calm',
        patterns: [
          'only thing that calms meltdown',
          'phone is only way to eat',
          'screen during tantrums',
        ],
        response: `It works — that is the problem. Screens are powerfully effective at halting distress in toddlers, which makes them feel like a solution. But at 12–24 months, {{child_name}}\'s brain is learning emotion regulation almost entirely from the people around them. Each time a screen substitutes for co-regulation, it delays that learning and raises the threshold for the next meltdown.\n\nThis is not about blame — survival mode is real. If screens are the only calm strategy right now, the goal is not cold turkey but gradual substitution: a favourite song, a comfort object, a predictable movement routine. Those alternatives take longer to work at first but build the internal calm system that screens cannot.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'dw-12-screen-free-play',
        'Sustains 15+ minutes of independent or parallel play without any screen',
        18,
        'How long can {{child_name}} play with blocks, toys, or books before seeking screen stimulation?',
      ],
      [
        'dw-12-no-mealtime-screen',
        'Consistently eats meals without a device present at the table',
        15,
        'Are mealtimes screen-free in your home? How does {{child_name}} respond?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-dw-12-screen-dependency',
        description:
          'Child cannot transition away from any screen without prolonged inconsolable distress (>20 minutes) multiple times per week',
        severity: 'discuss_with_ped',
        pattern: 'screen withdrawal causing significant daily disruption',
        action:
          'Discuss with your paediatrician; rule out sensory processing differences and review sleep adequacy',
        referral: 'Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Almost every parent uses screens more than they planned — parenting is exhausting, and screens are everywhere.',
        'Guilt about screen use is so common it has its own research literature. Awareness is the first step; perfection is not the goal.',
      ],
      strategies: [
        'Commit to one screen-free ritual (morning wake-up or bedtime) and protect just that — do not try to overhaul everything at once.',
        'When you reach for your phone out of habit, pause and offer {{child_name}} a 60-second "serve and return" moment first — then check your phone.',
      ],
      selfCare: [
        'Your need for a mental break is legitimate. Arrange dedicated downtime so you are not stealing it in fragments while {{child_name}} is awake.',
        'If you are using screens heavily because you are depleted, that is a signal about support needs, not character flaws.',
      ],
      partner:
        'Discuss and agree on two or three specific screen-free family times rather than vague intentions — shared norms reduce the friction of enforcement.',
      warnings: [
        'If you find yourself using screens to manage your own anxiety around {{child_name}}, consider speaking with your own GP or counsellor.',
        'Chronic family tension around screen rules is worth a few sessions with a family therapist — it rarely resolves without a deliberate structure.',
      ],
    },
    evidence:
      'WHO 2019 guidelines on physical activity, sedentary behaviour and sleep for children under 5; AAP Council on Communications and Media (2016, updated 2023); Zimmerman et al., video deficit effect meta-analysis, Child Development 2023.',
  },

  // ── 2–3 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'One Hour Maximum — Quality and Company Matter Most',
    whatToExpect:
      'At 2–3 years, limited high-quality screen time becomes acceptable, but co-viewing with a caregiver is still essential for learning transfer. {{child_name}} cannot yet extract the full educational value of content independently — you are the bridge between what they see and what it means. WHO and AAP recommend no more than one hour daily of quality programming, with no screens during meals or in the hour before sleep.',
    keyMessage:
      'One hour of co-viewed quality content beats three hours of solo screen time for development every time.',
    dailyTips: [
      'Sit with {{child_name}} for at least half of any screen time and narrate, ask questions, and connect content to real life ("that is like the bird we saw at the park").',
      'Choose interactive over passive — apps that respond to {{child_name}}\'s voice or touch outperform passive video for this age.',
      'Use a visual timer so the transition off screens is predictable; sudden endings cause most screen-time battles.',
    ],
    doList: [
      'Preview content yourself before offering it — look for slow pacing, repetition, and characters who pause and wait for the child to respond.',
      'Use screen time as a bridge to offline activity: watch a programme about dinosaurs, then build them with blocks.',
      'Establish a consistent daily slot for screen time so {{child_name}} learns it is bounded, not random.',
    ],
    dontList: [
      'Do not allow screens in the bedroom or during mealtimes — these habits are far harder to undo at 8 than to establish now.',
      'Do not use screens as a reward or punishment — this elevates their emotional significance and intensifies wanting.',
      'Do not assume "educational" labelling means developmentally appropriate — check for co-viewing guidance on the packaging.',
    ],
    activities: [
      [
        'Watch-and-Do',
        'After watching a short clip together, immediately recreate one element in real life — sing the song, draw the character, act out the story. This closes the video-deficit gap and doubles retention.',
        20,
        'with each screen session',
      ],
      [
        'Talking Walk',
        'Take a 15-minute walk and narrate everything you notice. No devices. This builds the same vocabulary and curiosity that quality programming targets, with richer sensory input and movement.',
        15,
        'daily',
      ],
    ],
    topics: [
      {
        key: 'which_shows',
        patterns: [
          'best shows for 2 year old',
          'is Bluey okay',
          'what is good to watch',
        ],
        response: `Great question — content quality varies enormously, and developmental scientists have actually studied this. Shows with slow pacing, repeated vocabulary, pauses for child response (like Bluey, Daniel Tiger, or Sesame Street) support language and emotional learning. Fast-cut animation, surprise unboxing, or reaction videos are the opposite — high stimulation, low learning value.\n\nFor {{child_name}} right now, look for programmes where characters speak slowly, name emotions clearly, and face problems with simple steps. Equally important is that you sit alongside {{child_name}} for much of it — your commentary ("she looks sad, doesn't she? What do you think will happen?") is what converts watching into learning.`,
      },
      {
        key: 'mealtime_screens',
        patterns: [
          'only eats with tablet',
          'screen during dinner',
          'refuses food without show',
        ],
        response: `Mealtime screens are one of the hardest habits to break once established, and one of the most worth addressing early. When {{child_name}} is distracted by a screen, they eat by rote rather than attending to hunger and fullness cues — this is a genuine early contributor to disordered eating patterns in later childhood. Mealtimes are also one of the richest conversation and connection opportunities of the day.\n\nIf screens are currently essential for eating, the goal is gradual fading rather than abrupt removal: start by playing music instead of video, then move to conversation games. It will feel harder for a week or two, but most families report a calmer mealtime dynamic within a month. Your paediatrician can support if feeding anxiety is a significant factor.`,
        boundary: true,
      },
      {
        key: 'co_viewing',
        patterns: [
          'too tired to watch with them',
          'put on TV so I can cook',
          'is solo watching okay sometimes',
        ],
        response: `Solo watching happens — especially when you are cooking, managing a sibling, or running on empty. You do not need to be present for every minute, and occasional solo viewing will not derail {{child_name}}\'s development. The research concern is about the proportion: when most screen time is unsupported, learning transfer drops significantly for this age group.\n\nA workable middle ground is to aim for active co-viewing at least half the time, and when you cannot be present, choose the slowest-paced, most language-rich content available. Even brief check-ins ("oh, what happened?") after the screen goes off help {{child_name}} consolidate what they saw.`,
      },
      {
        key: 'bedtime_screens',
        patterns: [
          'video to fall asleep',
          'tablet at bedtime',
          'screen helps them settle',
        ],
        response: `Screens before bed are one of the clearest findings in paediatric sleep research: the blue-spectrum light from devices suppresses melatonin onset, and the stimulating content (even calm content) raises cortical arousal at exactly the time it needs to come down. For 2–3 year olds, this typically means delayed sleep onset and more frequent night waking.\n\nThe hour before sleep should be screen-free for {{child_name}}. A replacement wind-down routine — bath, dim lights, songs, story, predictable goodnight sequence — usually produces better sleep within two to three weeks of consistent application. This is one guideline worth the short-term push-back.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'dw-24-one-hour-limit',
        'Screen time consistently stays at or under one hour daily without major conflict',
        30,
        'On a typical day, how much total screen time does {{child_name}} have? How do transitions off screens go?',
      ],
      [
        'dw-24-co-view-engagement',
        'Engages in back-and-forth conversation about screen content with caregiver during or after viewing',
        28,
        'Does {{child_name}} point, comment, or ask questions during shows? Do they reference screen content in play afterward?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-dw-24-language-delay',
        description:
          'Child under 3 with fewer than 50 words or not combining two words, and high daily screen exposure (2+ hours solo)',
        severity: 'discuss_with_ped',
        pattern: 'language delay concurrent with high unsupported screen exposure',
        action:
          'Flag both findings to paediatrician together; request speech-language evaluation and screen-time guidance',
        referral: 'Speech-Language Pathologist',
      },
    ],
    coping: {
      normalizations: [
        'Keeping a 2-year-old off screens when every restaurant, waiting room, and tired afternoon pulls toward a device is genuinely hard — you are swimming upstream against the culture.',
        'Most parents of toddlers exceed the one-hour guideline regularly. The goal is a workable average, not a perfect daily score.',
      ],
      strategies: [
        'Create a small "boredom basket" of novel low-prep activities to rotate — new stickers, a small jar of buttons, a magnifying glass — that can be your first reach before screens.',
        'Track screen time for one week without judgment — awareness alone often shifts habits more than resolute intention.',
      ],
      selfCare: [
        'If toddler management feels impossible without screens, look at what you are carrying: sleep, support, your own device use. Address the root before blaming yourself.',
        'You are also allowed to sit down. A rested parent who uses 30 extra minutes of screen time occasionally is a better parent than an exhausted one who never does.',
      ],
      partner:
        'Agree on which screen rules are non-negotiable (bedtime and mealtime) and which are flexible — arguing about every instance creates resentment and mixed signals for {{child_name}}.',
      warnings: [
        'If screen removal consistently produces more than 30 minutes of inconsolable distress, discuss sensory processing or behavioural evaluation with your paediatrician.',
        'If you find yourself hiding your own screen use to avoid modelling, it is a signal that the family norms need an honest reset conversation.',
      ],
    },
    evidence:
      'AAP media use guidelines for children 2–5 years (2023); WHO guidelines on sedentary behaviour in under-5s (2019); Kirkorian et al., co-viewing and learning transfer, Child Development 2008; Anderson & Hanson, screen media and language development review, 2022.',
  },

  // ── 3–5 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'Interactive Beats Passive — Choosing Screens Wisely',
    whatToExpect:
      'Preschoolers can now extract meaningful learning from screens independently, especially from content designed for their developmental stage. The one-hour daily limit remains appropriate, though the quality-versus-quantity distinction becomes even more important. {{child_name}} is ready to begin learning about what screens are for and how they fit into a day — digital literacy starts here, not at adolescence.',
    keyMessage:
      'Helping {{child_name}} make choices about screen time is more valuable long-term than simply restricting it.',
    dailyTips: [
      'Give {{child_name}} two content options to choose between — offering choice builds the decision-making muscle that will matter enormously at 14.',
      'Name what screens do and do not do: "screens are for watching stories or learning — not for when we are bored or upset."',
      'After screen time, ask one open question: "what happened in that episode?" — it builds comprehension and makes you a co-participant.',
    ],
    doList: [
      'Explore interactive apps that require creative input — drawing, simple coding, storytelling tools — rather than passive consumption.',
      'Use screen content as a jumping-off point for craft, outdoor play, or imaginative games.',
      'Begin teaching {{child_name}} that some things we do without screens: meals, sleep, family time, playing outside.',
    ],
    dontList: [
      'Do not allow unrestricted YouTube — the autoplay algorithm serves engagement, not development; disable autoplay and curate playlists.',
      'Do not use screens as the default "quiet time" — build in screen-free quiet time (audiobooks, drawing, rest) equally.',
      'Do not negotiate the bedtime or mealtime screen boundaries — consistency now prevents larger battles later.',
    ],
    activities: [
      [
        'Digital Storytelling',
        'Use a simple drawing or photo app together to create a three-panel story — beginning, middle, end. {{child_name}} narrates and you type the words. Print it and add it to a home-made book collection.',
        20,
        'weekly',
      ],
      [
        'Nature Detective Walk',
        'Go outside with a "nature checklist" (drawn, not digital) and find five things. Explicitly link this to "no screens outside" as a household value rather than a punishment.',
        20,
        '2x per week',
      ],
    ],
    topics: [
      {
        key: 'youtube_kids',
        patterns: [
          'YouTube Kids safe',
          'kids video platform',
          'how to manage YouTube',
        ],
        response: `YouTube Kids is significantly safer than unfiltered YouTube, but it still uses engagement-maximising design — autoplay, recommended videos, stimulating thumbnails — that can easily push beyond your intended time and content boundaries. For {{child_name}} at this age, supervised use with autoplay disabled is the most protective approach.\n\nA practical setup: create a parent-approved playlist of 3–5 specific shows or channels, and make those the only options available. This both limits exposure to inappropriate content and begins teaching {{child_name}} that screen choices are made intentionally, not algorithmically.`,
      },
      {
        key: 'educational_apps',
        patterns: [
          'best learning apps for preschool',
          'coding app for 4 year old',
          'reading app recommendations',
        ],
        response: `At 3–5, {{child_name}} genuinely can learn from well-designed apps — the video deficit effect fades as symbolic thinking matures. What separates high-quality apps from edutainment is interactivity with feedback: the app responds to {{child_name}}\'s specific input, adjusts difficulty, and requires active participation rather than passive observation.\n\nLook for apps that are open-ended (no single right answer), that do not incentivise rapid tapping or rushing, and that have no advertising or in-app purchases. Apps built on Montessori, Froebel, or evidence-based literacy/numeracy frameworks (Starfall, Khan Academy Kids, Toca Boca series) are well-studied. The best app still pairs with a brief conversation with you afterward.`,
      },
      {
        key: 'screen_tantrums',
        patterns: [
          'meltdown when screen turns off',
          'screaming when TV ends',
          'transition off device so hard',
        ],
        response: `Screen-transition meltdowns at 3–5 are nearly universal — the dopaminergic pull of screen media is real, and executive function (the brain system that manages transitions) is still very immature at this age. This does not mean {{child_name}} is "addicted" or that you have created a behavioural problem; it means they are a normal preschooler with a normal brain.\n\nThe most effective strategies are: a two-minute and then one-minute verbal warning; use of a visual timer {{child_name}} can see counting down; and an immediate transition activity ready ("when the show ends, we are going to..."). Consistency across a few weeks does reduce the intensity of protests significantly — the brain learns what to expect.`,
      },
      {
        key: 'screen_free_activities',
        patterns: [
          'my child only wants screens',
          'nothing interests them except TV',
          'how do I compete with screens',
        ],
        response: `This is one of the most demoralising feelings in parenting young children — everything you offer feels second-rate compared to the screen. It is worth understanding why: screens are engineered by teams of psychologists to maximise engagement; a cardboard box and some stickers are not. You are not competing on a level playing field, and your child preferring screens is not a verdict on your parenting.\n\nThe reframe that helps most families: do not compete, anchor. Instead of offering something "better than screens," make screen time an island in a day that is otherwise full of movement, texture, and human interaction. When screens are bounded and predictable, they stop being the constant horizon {{child_name}} is angling toward — they become one part of the day, like lunch.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'dw-36-transition-cooperation',
        'Accepts screen-off transitions with reminders, without prolonged meltdown, on most days',
        48,
        'On a scale of 1–10, how does {{child_name}} handle screen transitions this month? What strategies work best?',
      ],
      [
        'dw-36-choice-making',
        'Can articulate what they want to watch and why, choosing between two offered options',
        42,
        'Does {{child_name}} request specific content by name or theme? Can they explain their choice?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-dw-36-social-withdrawal',
        description:
          'Child consistently prefers screen time over all peer play opportunities and shows no interest in imaginative or physical play even when screens are unavailable',
        severity: 'discuss_with_ped',
        pattern: 'social disengagement and play rigidity centred on screen content',
        action:
          'Discuss with paediatrician; consider developmental evaluation for social communication and sensory processing',
        referral: 'Developmental Paediatrician or Occupational Therapist',
      },
    ],
    coping: {
      normalizations: [
        'Managing screen time for a preschooler while also working, cooking, and staying sane is one of the harder invisible labours of parenting.',
        'The gap between "guidelines" and daily life is wide for almost every family — what matters is the overall pattern, not individual days.',
      ],
      strategies: [
        'Set up the physical environment to make screens less accessible rather than relying on willpower alone: unplug the TV after use, keep tablets in a drawer, charge phones in another room.',
        'Create a "daily rhythm" visual chart with {{child_name}} that includes screen time as one clearly bounded slot — children who can see the structure fight it less.',
      ],
      selfCare: [
        'It is appropriate to have 30–60 minutes of your own uninterrupted time during a child\'s quiet period — screen or no screen. Your need for rest is not a parenting failure.',
        'If managing screen time is causing daily high conflict, it is worth a consultation — not because you are doing it wrong, but because the approach may need adjusting for {{child_name}}\'s specific temperament.',
      ],
      partner:
        'Compare notes weekly on what screen approaches are working and not — inconsistency between caregivers is the single biggest predictor of escalating screen battles.',
      warnings: [
        'If you are using screens for long stretches specifically because you cannot face the alternative, examine what support or respite you need.',
        'Persistent refusal to do anything but screen-related activities across multiple weeks is worth a paediatric conversation regardless of screen-time hours.',
      ],
    },
    evidence:
      'Radesky & Christakis, AAP Technical Report on Media and Young Minds, Pediatrics 2016; Linebarger & Vaala, interactive media and early learning review, Developmental Review 2022; Lillard & Peterson, fast-paced TV and executive function, Pediatrics 2011.',
  },

  // ── 5–8 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'First Device Decisions — Gaming, Homework, and Online Safety',
    whatToExpect:
      'The school years bring legitimate screen purposes — homework, reading programmes, educational platforms — alongside entertainment and the first exposure to gaming. {{child_name}} is ready to begin learning that different screens serve different purposes, and that some require more caution than others. This is the age to build the habits and vocabulary of digital citizenship before the social pressures of pre-adolescence arrive.',
    keyMessage:
      'The goal is not screen-free — it is helping {{child_name}} develop a compass for what screens are for.',
    dailyTips: [
      'Create distinct categories with {{child_name}}: "school screens," "learning screens," and "fun screens" — and have a brief daily conversation about which they used.',
      'Gaming can be positive: cooperative games that require communication, strategy games that build planning, creative games like Minecraft build genuine skills.',
      'Revisit and reinforce the personal information rule regularly: full name, school name, address, and phone number are never shared online.',
    ],
    doList: [
      'Set up any device {{child_name}} uses with parental controls — not as surveillance but as an age-appropriate fence that you will expand as they demonstrate readiness.',
      'Play games with {{child_name}} regularly — understanding their digital world is the foundation of every future conversation about it.',
      'Introduce the concept of online privacy: "some things are just for our family."',
    ],
    dontList: [
      'Do not give {{child_name}} a personal device with unrestricted internet access — a shared family tablet in a common room is appropriate for this age.',
      'Do not use screen time as the primary reward in a behaviour system — it over-inflates the emotional value and makes everything else feel less worthwhile.',
      'Do not ignore gaming content — PEGI/ESRB ratings exist for good reasons; a 7-year-old playing a 16-rated game will encounter things they are not ready to process.',
    ],
    activities: [
      [
        'Co-Gaming Session',
        'Play one of {{child_name}}\'s games together weekly — ask them to teach you. This builds your credibility as a safe person to come to about digital experiences, and gives you genuine insight into the content.',
        30,
        'weekly',
      ],
      [
        'Family Media Agreements',
        'Sit down with {{child_name}} and co-create a simple "house rules for screens" document — devices in common areas, no screens before school, charge in kitchen. Children who help make rules are more likely to follow them.',
        20,
        'once, then review every 3 months',
      ],
    ],
    topics: [
      {
        key: 'gaming_concerns',
        patterns: [
          'gaming addiction 7 year old',
          'all they want to do is play Minecraft',
          'is too much gaming bad',
        ],
        response: `Gaming in middle childhood is genuinely a mixed picture — and the research reflects that. Cooperative games, strategy games, and creative sandbox games (Minecraft being the most studied) are associated with problem-solving development, social cooperation skills, and persistence. The concern arises with games designed around variable reward schedules (loot boxes, randomised rewards) or with violent content beyond the child\'s processing capacity.\n\nFor {{child_name}} at this age, the most important variables are content appropriateness, time balance, and whether gaming is replacing physical activity and in-person social time. If {{child_name}} can transition off gaming reasonably, maintains other interests, sleeps and eats normally, and socialises outside screens — gaming is likely not a problem, just a prominent hobby.`,
      },
      {
        key: 'online_safety',
        patterns: [
          'online safety for kids',
          'stranger danger online',
          'inappropriate content',
        ],
        response: `Online safety at 5–8 is best approached as ongoing conversation rather than a single talk. {{child_name}} needs three core ideas, repeated in age-appropriate language throughout this period: not everything online is true, not everyone online is safe, and you can always come to a parent without getting in trouble.\n\nThe "without getting in trouble" piece is perhaps the most important — children who fear punishment for online encounters are significantly less likely to disclose when something worrying happens. Keep your reactions to disclosures calm and focused on problem-solving: "I'm glad you told me — let us figure out what to do together." That response builds the trust that will protect {{child_name}} through adolescence.`,
      },
      {
        key: 'homework_screen_balance',
        patterns: [
          'homework on screen then TV',
          'too much screen time with school devices',
          'school tablet plus home tablet',
        ],
        response: `This is a real tension of modern schooling — {{child_name}} may already be meeting or exceeding recommended screen time with school-mandated device use before any home entertainment. A helpful reframe: WHO and AAP guidelines were designed primarily around passive entertainment screens, not educational or interactive use. The relevant question for school screens is quality and purpose, not hours.\n\nFor home screens after a school screen day, a brief outdoor or physical activity break before home screen time is evidence-backed — it refreshes attentional resources and helps {{child_name}} transition between context-types. A "homework first, then outdoor break, then optional fun screen" sequence tends to work better than trying to enforce total daily screen limits that do not account for school use.`,
      },
      {
        key: 'personal_device',
        patterns: [
          'should I get my 6 year old a phone',
          'all kids at school have tablets',
          'when to give first device',
        ],
        response: `The social pressure to give children personal devices early is real, and often the "everyone has one" claim is at least partly true. However, personal ownership of an internet-connected device is a fundamentally different category from supervised shared access — it removes the natural oversight that comes from using a device in a common area.\n\nFor 5–8 year olds, a shared family tablet with parental controls in a common room is appropriate and provides access to everything educationally useful. Personal devices, even basic ones, shift the locus of control in ways that are harder to walk back. The conversation worth having with {{child_name}} is: "when you show me you can handle the shared tablet well, we will talk about more independence." This frames the progression as earned rather than arbitrarily withheld.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'dw-60-privacy-awareness',
        'Can articulate at least three types of personal information that should not be shared online',
        72,
        'What does {{child_name}} know about online privacy? Can they explain in their own words what information is private?',
      ],
      [
        'dw-60-self-regulation',
        'Can complete homework or a task on a device without switching to entertainment without prompting on most days',
        84,
        'How does {{child_name}} manage device transitions between purposes — school work to games, for example?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-dw-60-gaming-interference',
        description:
          'Gaming or screen use is consistently interfering with sleep, school performance, meals, or in-person friendships over multiple weeks',
        severity: 'discuss_with_ped',
        pattern: 'screen use displacing multiple core developmental activities',
        action:
          'Document specific impacts and discuss with paediatrician; consider referral for behavioural assessment if pattern is entrenched',
        referral: 'Child Psychologist or Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Navigating devices, gaming, homework screens, and entertainment for a 5–8 year old simultaneously is genuinely complex — there is no simple rulebook.',
        'Most parents feel behind on the digital world their child is inhabiting. You do not need to know everything; you need to stay curious and keep asking.',
      ],
      strategies: [
        'Rather than monitoring screen content from a distance, get inside it with {{child_name}} — ask them to show you their favourite game or video regularly.',
        'A family media plan (AAP has a free online tool) built collaboratively with {{child_name}} is more durable than a list of rules handed down.',
      ],
      selfCare: [
        'Your own screen habits are more visible to {{child_name}} now that they are older — brief, honest acknowledgement of your own digital limits goes further than expecting rules you do not follow yourself.',
        'If digital parenting feels overwhelming, one conversation with a paediatric digital wellness specialist can reorient your priorities quickly.',
      ],
      partner:
        'Discuss the rationale behind each screen rule with your co-parent — rules without shared understanding collapse when enforced by only one parent.',
      warnings: [
        'If {{child_name}} is hiding screen use, deleting history, or lying about device activity, do not immediately escalate — it usually signals that the environment feels punitive. Explore curiosity before consequences.',
        'Your own screen anxiety (overmonitoring, frequent phone checks, high conflict about rules) can inadvertently increase {{child_name}}\'s screen preoccupation. Calibrate your own regulation first.',
      ],
    },
    evidence:
      'Przybylski & Weinstein, digital screen time limits for children, Psychological Science 2017; Granic et al., benefits of video games, American Psychologist 2014; UK Children\'s Commissioner report on gaming, 2019; AAP Family Media Plan tool, 2023.',
  },

  // ── 8–12 years ────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Social Media Pressure, Gaming Balance, and Digital Footprint',
    whatToExpect:
      'The 8–12 window is when peer digital culture explodes: group chats, gaming with friends online, YouTube creators, TikTok awareness. {{child_name}} is not yet on social media platforms (minimum age 13), but is orbiting them — seeing what older siblings and friends engage with, hearing about influencers, and beginning to internalise comparison. Cyberbullying, digital footprint awareness, and gaming time management become the core digital wellness themes.',
    keyMessage:
      'Your relationship with {{child_name}} is the most protective digital safety tool available — it outperforms every monitoring app.',
    dailyTips: [
      'Ask about {{child_name}}\'s online social world with genuine curiosity: "who did you play with online today? what happened in the game?" — not interrogation.',
      'Introduce digital footprint thinking: "everything posted can last forever — would you be okay if a teacher or future employer saw this?"',
      'Keep charging stations in common areas, not bedrooms — this one structural choice prevents a large proportion of problematic late-night use.',
    ],
    doList: [
      'Have an explicit conversation about cyberbullying — what it looks like, that it is never the victim\'s fault, and the exact steps {{child_name}} should take if it happens.',
      'Review privacy settings on any platforms {{child_name}} uses together, as a skill-building exercise not a surveillance measure.',
      'Acknowledge when {{child_name}} shows you something online without immediately critiquing it — reward disclosure with curiosity first.',
    ],
    dontList: [
      'Do not secretly monitor all messages and activity without {{child_name}}\'s knowledge — if discovered, it destroys the trust relationship that is your most important safety tool.',
      'Do not dismiss gaming friendships as "not real" — online friendships have genuine emotional significance for this age group.',
      'Do not use shame around screen use ("you are addicted," "all you do is stare at screens") — shame increases secrecy and reduces disclosure.',
    ],
    activities: [
      [
        'Digital Dilemma Discussions',
        'Once a week at dinner, pose a "what would you do?" scenario: "someone sends you a mean screenshot about a classmate — what do you do?" This builds ethical reasoning before the stakes are real.',
        10,
        'weekly',
      ],
      [
        'Creator Project',
        'Help {{child_name}} create something with technology rather than just consuming: a short video, a simple website, a game level in Minecraft or Roblox. Creation shifts the relationship with screens from passive to agentic.',
        45,
        'monthly',
      ],
    ],
    topics: [
      {
        key: 'cyberbullying',
        patterns: [
          'cyberbullying',
          'being bullied online',
          'mean comments in game',
          'excluded from group chat',
        ],
        response: `Cyberbullying at this age is common enough that it should be part of proactive conversations, not reactive ones. It ranges from exclusion from group chats and mocking comments in games to screenshot sharing and impersonation — and the 24/7 nature of digital connection means there is no geographic escape from it in the way there was when bullying was confined to school grounds.\n\nIf {{child_name}} is experiencing it: the first step is listening fully before problem-solving, so they do not regret telling you. Then: screenshot and document, report on the platform, and contact the school if another student is involved. The most common error is taking away {{child_name}}\'s device as a response — which punishes the victim, reduces trust, and removes an important social connection. Address the behaviour, not the technology.`,
      },
      {
        key: 'social_media_pressure',
        patterns: [
          'wants TikTok at 10',
          'all friends have Instagram',
          'begging for social media',
        ],
        response: `This is one of the most consistent social pressures parents of 8–12 year olds describe. The minimum age of 13 for most platforms (set by COPPA in the US and similar legislation elsewhere) exists because the platforms' own risk assessments acknowledge the developmental risks. The comparison culture, follower counts, comment exposure, and algorithmically-curated content on Instagram and TikTok are genuinely associated with body image concerns and anxiety in early adolescence, particularly for girls.\n\nThe most useful framing for {{child_name}} is not "you are too young" (which feels arbitrary) but "your brain is still developing the resilience this requires — we will revisit this at 13 and build up to it together." Offering age-appropriate social digital alternatives (YouTube with supervised account, creative platforms like Scratch or Canva) reduces the feeling of exclusion while maintaining age-appropriate boundaries.`,
        boundary: true,
      },
      {
        key: 'gaming_time_management',
        patterns: [
          'gaming all weekend',
          'skipping homework for games',
          'up late gaming',
          'gaming instead of friends',
        ],
        response: `Gaming time management in this age group is one of the most common family conflict sources — and the research suggests the framing matters enormously. The question is not "how much is too much?" in isolation but "what is gaming replacing, and is {{child_name}} able to disengage willingly?" Children who game heavily but sleep adequately, maintain school performance, and have in-person friendships show different risk profiles from those where gaming is displacing these domains.\n\nPractical levers that work for this age: co-created screen schedules with {{child_name}} having genuine input, earned gaming time rather than restricted gaming time, natural stopping points in games rather than arbitrary cutoffs, and open conversations about what {{child_name}} gets from gaming (social connection, competence, relaxation) — those needs do not go away if screens are removed and need alternative routes.`,
      },
      {
        key: 'digital_footprint',
        patterns: [
          'what is digital footprint',
          'child posting things online',
          'privacy for kids',
        ],
        response: `Digital footprint conversations are most effective when they are concrete rather than abstract. Rather than "be careful what you post," try walking {{child_name}} through a real example: search their own name together and see what appears. Then explore: "if someone who did not know you saw this, what would they think?" This makes the permanence tangible rather than hypothetical.\n\nFor {{child_name}} at this age, the core messages are: photos and comments can be shared without your permission, screenshots last forever, and the internet remembers things you forget. Frame it as a power concept — "you get to decide what you want your digital story to be" — rather than purely as risk. Agency is more motivating than fear for this age group.`,
      },
    ],
    milestones: [
      [
        'dw-96-self-reporting',
        'Voluntarily tells a parent about a concerning or uncomfortable online experience within a day of it happening',
        120,
        'Has {{child_name}} ever brought an online problem to you unprompted? How did that go? How do they typically handle something that bothers them online?',
      ],
      [
        'dw-96-time-management',
        'Can manage own gaming or screen schedule with minimal conflict on most days, using agreed-upon limits',
        132,
        'How is {{child_name}} managing their own screen schedule? What does conflict around it look like now versus a year ago?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-dw-96-problematic-gaming',
        description:
          'Screen use meeting multiple criteria for problematic use: sleep disruption, school decline, social withdrawal, deception, and significant distress when access is limited — persisting over 12+ weeks',
        severity: 'discuss_with_ped',
        pattern: 'multi-domain functional impairment attributable to screen use',
        action:
          'Seek assessment from child psychologist experienced in behavioural addictions; avoid abrupt removal which typically escalates the problem',
        referral: 'Child/Adolescent Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Parenting a pre-teen through the digital landscape is genuinely new territory — no previous generation of parents has navigated this, and there is no established playbook.',
        'Conflict about screens with 8–12 year olds is nearly universal. It means {{child_name}} has a normal developing autonomy drive, not that you are failing.',
      ],
      strategies: [
        'When digital conflicts escalate, step back from the immediate battle and ask: "what does {{child_name}} need from their digital life right now — connection, escape, competence?" Addressing the need is more effective than the rule.',
        'Build in "no-shame disclosure" explicitly: tell {{child_name}} once a month "you can show me anything you see online and I won\'t take your device away — I want you to feel safe coming to me."',
      ],
      selfCare: [
        'Parental anxiety about digital threats is partly rational but can become its own problem — fearful parenting restricts the independence children this age need for healthy development.',
        'If digital parenting conflicts are the dominant emotional texture of your relationship with {{child_name}}, it is worth asking what you both need from the relationship that is currently not being met.',
      ],
      partner:
        'Revisit your family media agreement with your co-parent every six months — what worked at 9 may need updating at 11, and being in sync reduces the appeal of playing caregivers off each other.',
      warnings: [
        'Secretly reading all of your child\'s messages without their knowledge — beyond agreed transparent monitoring — typically destroys trust when discovered and reduces future disclosure significantly.',
        'If your own anxiety about {{child_name}}\'s digital life is causing significant daily distress, consider speaking with a therapist who works with parents — this is an increasingly common presenting concern.',
      ],
    },
    evidence:
      'Twenge et al., screen time and psychological wellbeing, Preventive Medicine Reports 2020; Kuss & Griffiths, internet gaming disorder review, Mental Health and Addiction Research 2017; Valkenburg et al., social media effects on adolescent wellbeing meta-analysis, Nature Reviews Psychology 2022; UK Internet Watch Foundation annual report 2023.',
  },

  // ── 12–15 years ───────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'Social Media Entry, Comparison Culture, and Privacy',
    whatToExpect:
      'Early adolescence brings platform-age eligibility, peer social media pressure, and a brain that is uniquely vulnerable to social comparison and validation-seeking. {{child_name}}\'s developing prefrontal cortex is particularly sensitive to social reward signals — likes, comments, follower counts — while impulse control and long-term thinking are still maturing. This period requires an expansion of digital autonomy alongside intensified conversations about emotional wellbeing and privacy.',
    keyMessage:
      'Normal teenage digital behaviour is not the same as healthy digital behaviour — staying connected keeps you able to guide the difference.',
    dailyTips: [
      'Ask about {{child_name}}\'s social media experience specifically: "anything on your feed today that was annoying, interesting, or weird?"',
      'Model your own digital boundaries out loud: "I put my phone away after 9pm because it helps me sleep."',
      'Celebrate the positive uses: activism, creativity, finding community around niche interests — social media is not only harmful.',
    ],
    doList: [
      'Start social media use together: set up the first account with {{child_name}} present, discuss settings, agree on what kinds of things are appropriate to post.',
      'Discuss sexting and image-sharing explicitly and without shame — criminal and social consequences are serious, and {{child_name}} needs accurate information before they encounter pressure.',
      'Check in about online relationships — who {{child_name}} follows, who follows them, and whether any online interactions feel uncomfortable.',
    ],
    dontList: [
      'Do not require {{child_name}} to follow you or keep their accounts public as a condition of having them — it creates workarounds, not transparency.',
      'Do not respond to social media disclosures with immediate rule changes — this is the fastest way to stop disclosure.',
      'Do not compare {{child_name}}\'s social media use unfavourably to imagined "other kids" — it mirrors the very comparison culture you are trying to counter.',
    ],
    activities: [
      [
        'Media Literacy Deconstruction',
        'Spend 15 minutes together analysing a piece of content: a fitness influencer, a news story, an advertisement. Ask: "what is this trying to make us feel or do? What is not being shown?" This builds critical consumption skills.',
        15,
        'weekly',
      ],
      [
        'Digital Detox Weekend',
        'Once a term, propose a 48-hour device-free family weekend with {{child_name}} having input into the substitute activities. Frame it as resetting, not punishment — even brief breaks shift the relationship with devices noticeably.',
        120,
        'once per school term',
      ],
    ],
    topics: [
      {
        key: 'social_comparison',
        patterns: [
          'everyone looks so much better',
          'Instagram makes me feel bad',
          'feeling ugly after scrolling',
          'their life looks perfect',
        ],
        response: `What {{child_name}} is describing is documented in hundreds of studies and is sometimes called "social comparison via social media" — the tendency for upward comparison to curated highlight-reel versions of others' lives to decrease satisfaction with one's own. The fact that {{child_name}} can name this feeling is actually a significant protective factor.\n\nThe research-backed framing that helps most: social media shows everyone's best moments, not their real moments. But more importantly, validate the feeling first before offering the reframe — "that makes complete sense, and I'm glad you're paying attention to how it makes you feel." The skill being built is noticing the emotional impact of content and being able to choose to disengage — that is advanced emotional intelligence, and {{child_name}} is practising it.`,
      },
      {
        key: 'sexting_awareness',
        patterns: [
          'sexting',
          'asked to send photos',
          'someone sent me an inappropriate picture',
          'pressure to share images',
        ],
        response: `This is one of the conversations where your calm, non-reactive response matters more than your words. If {{child_name}} has come to you with this, something important happened — lead with "I'm really glad you told me" before anything else.\n\nThe facts {{child_name}} needs to know: sharing sexual images of anyone under 18 is illegal in most countries, including by the person in the image. Pressure to share images is a form of coercion regardless of who is applying it. If {{child_name}} has received unsolicited images, they are not in trouble — the person who sent them is. Screenshot, report, and do not forward. If pressure is being applied by a peer, the school and if necessary the police have clear processes for this. You are on {{child_name}}'s side, not the side of the rule.`,
        boundary: true,
      },
      {
        key: 'screen_and_sleep',
        patterns: [
          'on phone until 2am',
          'can not sleep without phone',
          'phone in bedroom',
          'tired from late night scrolling',
        ],
        response: `Late-night phone use and sleep disruption is one of the clearest causal links in adolescent digital wellness research. For {{child_name}}'s developing brain, adequate sleep is not optional — it underpins mood regulation, academic performance, and social functioning in ways that are more significant in adolescence than at almost any other life stage.\n\nThe structural solution that works best: device charging outside the bedroom, ideally in a common area, with {{child_name}}'s genuine buy-in rather than imposed compliance. The conversation worth having is not "you have to charge your phone downstairs" but "your sleep affects your mood, your relationships, and your brain — what would help you actually get enough sleep?" Young people who understand the mechanism are more likely to maintain the boundary independently over time.`,
        boundary: true,
      },
      {
        key: 'online_relationship',
        patterns: [
          'talking to someone online',
          'online friend I have never met',
          'this person online really understands me',
        ],
        response: `Online friendships and connections are emotionally real and important to adolescents — dismissing them tends to push them underground rather than into the open. The question is not whether {{child_name}} should have online relationships but whether they are safe and reciprocal.\n\nThe protective factors you are looking for: {{child_name}} can tell you who the person is and how they met, the relationship feels reciprocal and does not involve pressure, {{child_name}} has not been asked to keep the friendship secret, and requests for photos or in-person meetings have not occurred. If any of those are not true, lead with curiosity and concern rather than prohibition — "tell me more about this person, I want to understand." Your goal is to stay in the conversation, not to end it.`,
      },
    ],
    milestones: [
      [
        'dw-144-critical-media-literacy',
        'Can identify and articulate when social media content is making them feel negatively and independently adjust consumption',
        162,
        'Does {{child_name}} ever mention unfollowing someone or taking breaks from platforms? Can they explain why?',
      ],
      [
        'dw-144-privacy-management',
        'Manages own privacy settings on social platforms with understanding of what is public versus private',
        156,
        'Has {{child_name}} reviewed their privacy settings recently? Do they understand the difference between followers and friends, public and private accounts?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-dw-144-social-media-mental-health',
        description:
          'Social media use is directly linked to significant mood disruption, body image distress, sleep disorder, or social withdrawal lasting more than four weeks',
        severity: 'discuss_with_ped',
        pattern: 'social media use correlated with identifiable functional decline',
        action:
          'Discuss with GP and consider referral for adolescent mental health assessment; a collaborative rather than prohibitive approach to platform use is more effective',
        referral: 'Adolescent Psychologist or CAMHS',
      },
    ],
    coping: {
      normalizations: [
        'Parenting a 12–15 year old through social media is new to every parent — there is no generation above you that did this first.',
        'The combination of a teenager\'s drive for autonomy and a smartphone\'s constant availability is genuinely difficult to navigate — your ongoing conflicts are evidence of engagement, not failure.',
      ],
      strategies: [
        'Use the "hear first, advise second" principle: when {{child_name}} shares something from their digital world, resist the instinct to problem-solve immediately — listening doubles disclosure rates over time.',
        'Pick two or three non-negotiable digital health boundaries (sleep, no phones at meals, keeping you in the loop about major online events) and hold those, letting smaller battles go.',
      ],
      selfCare: [
        'Your anxiety about your teenager\'s social media is proportionate to the genuine risks — but anxiety-driven parenting typically backfires at this age. Find somewhere to process your own fear, whether with a partner, friend, or therapist.',
        'Stay connected to your teenager as a person, not just as a digital risk to manage — the warmth of your relationship is the most protective factor research consistently identifies.',
      ],
      partner:
        'Adolescent digital parenting requires more co-parent coordination than any previous stage — differing approaches are immediately exploited. A monthly 20-minute "how is it going?" conversation between co-parents prevents most of the gaps.',
      warnings: [
        'If you have discovered something on {{child_name}}\'s device that concerns you significantly, seek professional consultation before confronting them — how you handle the disclosure shapes all future trust.',
        'Significant parental anxiety about a teenager\'s online activities that is disrupting your own functioning is worth professional support — you cannot provide calm guidance from a place of chronic fear.',
      ],
    },
    evidence:
      'Orben & Przybylski, social media and wellbeing in adolescents, Nature Human Behaviour 2019; Twenge & Campbell, screen time paradox, Emotion 2019; UK RSPH Young People and Social Media report 2017; Australian eSafety Commissioner, sexting and young people guidance 2023.',
  },

  // ── 15–18 years ───────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Digital Independence — Building a Healthy Tech Relationship for Life',
    whatToExpect:
      '{{child_name}} is approaching digital adulthood — in a few years they will manage all of this without parental oversight. The goal now is less monitoring and more mentoring: helping them develop the internal compass to manage their own digital wellbeing. Concerns at this age include pornography exposure, information quality in political and health spaces, and the wellbeing impact of algorithms tuned to engagement over flourishing.',
    keyMessage:
      'The capacity for digital self-regulation that {{child_name}} builds in these years will shape their adult mental health more than any device policy.',
    dailyTips: [
      'Move from rules to conversations: "I noticed you seem drained after long social media sessions — what do you think is going on?"',
      'Talk about your own tech relationship honestly: when it helps, when it does not, what you have learnt about yourself.',
      'Discuss the design of digital platforms explicitly — how algorithms work, how attention is monetised — as structural critique rather than personal failure.',
    ],
    doList: [
      'Have a frank, shame-free conversation about pornography: that most online pornography depicts unrealistic and often harmful scenarios, that it affects expectations of real relationships, and that {{child_name}} can talk to you without judgment.',
      'Help {{child_name}} develop their own digital detox practice — not as a punishment but as a skill, like exercise.',
      'Discuss digital wellbeing tools: screen time tracking, notification management, app limits — as things {{child_name}} controls for their own benefit.',
    ],
    dontList: [
      'Do not continue the same monitoring approach you used at 13 — it is developmentally inappropriate by 16 and damages the trust relationship.',
      'Do not expect digital independence to look perfect — periods of overcorrection and heavy use are part of learning self-regulation.',
      'Do not make digital wellbeing a source of shame or regular conflict — if it is, the topic becomes too loaded for {{child_name}} to explore honestly with you.',
    ],
    activities: [
      [
        'Algorithm Audit',
        'Spend 30 minutes together looking at what algorithms are serving {{child_name}} — their YouTube recommendations, Instagram Explore, TikTok For You page. Ask: "does this reflect who you want to be? Is anything here making you feel worse?" This is media literacy in action.',
        30,
        'once per term',
      ],
      [
        'Phone-Free Activity',
        'Choose one recurring shared activity that is consistently device-free — a walk, a meal out, a sport, a drive. Not as a screen-time intervention but as a shared value: "some things we do fully present."',
        60,
        'weekly',
      ],
    ],
    topics: [
      {
        key: 'pornography',
        patterns: [
          'watched porn',
          'online pornography',
          'sex content online',
          'pornography and relationships',
        ],
        response: `Most young people {{child_name}}\'s age have encountered online pornography — often well before 15. The conversation about it is important not because exposure is a catastrophe but because pornography is a very poor sex educator and {{child_name}} deserves accurate information about what it depicts and what it does not.\n\nThe core messages: most pornography is performance, not documentation of real sexual relationships; what it shows about consent, bodies, and pleasure is frequently distorted; and regular consumption changes expectations of real partners in ways that reduce relationship satisfaction. This is not a moral lecture — it is media literacy applied to one specific category of content. Keep your tone factual and open, and specifically say: "you can ask me anything about this without getting in trouble."`,
        boundary: true,
      },
      {
        key: 'digital_detox',
        patterns: [
          'taking a break from social media',
          'deleting Instagram',
          'overwhelmed by my phone',
          'need a break from screens',
        ],
        response: `The fact that {{child_name}} is recognising when their digital environment is affecting their wellbeing is genuinely sophisticated self-awareness — many adults never develop this. The impulse to detox or take a break is healthy and worth supporting warmly, without the layer of "I told you so."\n\nDetox works best when it is chosen and planned rather than reactive and abrupt. Help {{child_name}} think through: what specifically needs a break, for how long, and what will fill the time that is currently occupied by scrolling. Social media detox studies show two-to-four week breaks produce measurable improvements in mood and life satisfaction — and short-term discomfort (the first few days of FOMO) is a normal part of the process.`,
      },
      {
        key: 'misinformation',
        patterns: [
          'read something online that scared me',
          'conspiracy theories online',
          'health information online',
          'how to know what is true',
        ],
        response: `Information literacy is one of the most important skills for {{child_name}}'s generation to develop — the volume of deliberately misleading content online is unprecedented. A few practical tools worth discussing: lateral reading (open a new tab and look for coverage of the same story from multiple independent sources before accepting it), checking the publication date and source credibility, and identifying who financially benefits from the claim being believed.\n\nFor health information specifically, the pattern {{child_name}} needs is: "does this source tell me to seek professional advice, or does it tell me professionals are wrong and I should buy this instead?" That question alone catches most health misinformation. Keep the frame curious rather than dismissive — {{child_name}} will encounter compelling false content, and a reflexive "don't believe everything you read" is less useful than genuine reasoning tools.`,
      },
      {
        key: 'digital_identity',
        patterns: [
          'online persona',
          'different person online',
          'social media is exhausting',
          'performing for followers',
        ],
        response: `This level of self-reflection — recognising the gap between online presentation and real self — is genuinely healthy and worth exploring with curiosity. Many adults find social media performance exhausting but have never named it. The fact that {{child_name}} can identify this is a strength.\n\nThe conversation worth having is not prescriptive but exploratory: "what do you get from your online presence that you value? What does it cost you? If you were designing it from scratch, what would it look like?" {{child_name}} is building their identity in this period, and digital identity is a real part of that — helping them be intentional about it rather than reactive is one of the most valuable parental contributions of this stage.`,
      },
    ],
    milestones: [
      [
        'dw-180-self-regulation',
        'Demonstrates consistent ability to self-limit screen use when it is affecting sleep, mood, or performance — without parental prompting',
        198,
        'Can {{child_name}} identify when their own screen use is affecting them negatively and adjust it independently? What does that look like?',
      ],
      [
        'dw-180-digital-literacy',
        'Can critically evaluate online sources, identify algorithmic influence on their feed, and articulate their own approach to digital wellbeing',
        210,
        'How does {{child_name}} decide what to trust online? Do they have their own strategies for managing their tech relationship?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-dw-180-compulsive-use',
        description:
          'Screen use meets criteria for compulsive or dependent use: persistent failed attempts to cut back, use despite significant negative consequences, withdrawal symptoms, and functional impairment across multiple life domains',
        severity: 'discuss_with_ped',
        pattern: 'behavioural addiction pattern with functional impairment',
        action:
          'Seek adolescent mental health or addiction evaluation; co-occurring anxiety and depression are common and need assessment',
        referral: 'Adolescent Psychiatrist or Clinical Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Parenting a 15–18 year old in the digital age means largely watching them navigate a landscape you cannot fully see — that helplessness is real and valid.',
        'The transition from oversight to trust is uncomfortable for most parents, but {{child_name}} genuinely needs the practice of self-management before leaving home.',
      ],
      strategies: [
        'Replace device rules with curiosity practices: "what did you learn this week about how tech affects you?" is a more generative conversation at this age than any rule.',
        'Share your own digital struggles honestly — when you mindlessly scroll, when you feel worse after social media, what you are trying to change. Authenticity over authority.',
      ],
      selfCare: [
        'Letting go of oversight is a form of grief for many parents — the active protection role that felt clear at 8 is no longer the right tool at 17. That transition is worth acknowledging with a trusted person.',
        'Your relationship with {{child_name}} is the one thing that will extend your influence into adulthood — invest in that connection more than in the rules.',
      ],
      partner:
        'At this stage, the most important co-parenting conversation is about trust versus control — where are your lines, and how do you align without presenting a unified front that {{child_name}} rightfully experiences as infantilising.',
      warnings: [
        'If digital concerns have become the primary texture of your relationship with {{child_name}}, consider family therapy — the digital conflict is usually a proxy for something else.',
        'Your own anxiety about your teenager\'s online life is worth professional attention if it is significantly affecting your wellbeing or your relationship with {{child_name}}.',
      ],
    },
    evidence:
      'Hunt et al., no more FOMO, Journal of Social and Clinical Psychology 2018; Braghieri et al., social media and mental health, American Economic Review 2022; Valkenburg et al., social media effects meta-analysis, Nature Reviews Psychology 2022; WHO digital wellness frameworks for adolescents 2023; BBFC Young People, Pornography and Age Verification research 2020.',
  },
]
