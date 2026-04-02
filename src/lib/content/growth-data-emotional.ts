import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 0 – 3 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '0-3mo',
    ageMin: 0,
    ageMax: 3,
    title: 'The First Connection: Cry, Calm, and Co-Regulation',
    whatToExpect:
      'Your newborn communicates every need — hunger, pain, loneliness, overwhelm — through crying, because it is their only language. Emotional regulation is entirely external at this stage: your calm, your voice, your warmth literally wire the circuits of your baby\'s developing nervous system.',
    keyMessage:
      'You cannot spoil a newborn. Every time you respond, you build the brain.',
    dailyTips: [
      'Respond to cries promptly — research shows this builds security, not dependency.',
      'Use skin-to-skin contact daily to stabilise your baby\'s heart rate, temperature, and cortisol levels.',
      'Talk or sing in a calm, slightly sing-song voice (parentese) even when your baby cannot answer.',
    ],
    doList: [
      'Pick up and soothe crying without worry about "giving in" — needs at this age are physical and real.',
      'Mirror your baby\'s facial expressions to begin the dance of emotional attunement.',
      'Share soothing duty with a partner or support person so you stay regulated enough to co-regulate.',
    ],
    dontList: [
      'Don\'t let newborns "cry it out" — the nervous system is too immature for self-soothing.',
      'Don\'t feel you have failed when soothing takes a long time — some babies are simply more sensitive.',
      'Don\'t compare your baby\'s cry-frequency to other babies; temperament varies enormously from birth.',
    ],
    activities: [
      [
        'Face-to-Face Gaze',
        'Hold your baby 20–30 cm from your face during an alert, calm moment. Make slow, exaggerated expressions — smile, raise your eyebrows, open your mouth wide. Pause and wait; watch your baby begin to imitate. This is the first emotional conversation.',
        5,
        'Twice daily during alert windows',
      ],
      [
        'The Calm-Down Hold',
        'When your baby is fussy, hold them upright against your chest with one hand supporting the bottom and the other across the back. Sway gently, hum a low monotone sound, and take three slow visible deep breaths yourself. Your regulated body regulates theirs.',
        10,
        'As needed during fussy periods',
      ],
    ],
    topics: [
      {
        key: 'wont_stop_crying',
        patterns: [
          'my baby cries all the time',
          'nothing soothes {{child_name}}',
          'I think something is wrong because {{child_name}} just screams',
        ],
        response:
          'Constant crying in the early weeks is one of the most exhausting experiences a parent can face, and it is completely understandable to feel desperate and even frightened. {{child_name}}\'s nervous system is not yet able to manage sensory input smoothly, and some babies — especially those with higher baseline sensitivity — simply cry more. This is not a sign that you are doing anything wrong.\n\nTry working through a quick checklist: hunger, wet or soiled nappy, temperature (too hot or cold), wind or gas pain, overstimulation, and then the need for contact and motion. If {{child_name}} has regular inconsolable crying lasting more than three hours a day, more than three days a week, for more than three weeks, that meets the clinical definition of colic — which is real, temporary, and resolves by 3–4 months. Please do mention it at your next paediatric visit so colic, reflux, or milk-protein intolerance can be ruled out.',
      },
      {
        key: 'am_i_bonding',
        patterns: [
          'I don\'t feel bonded to my baby',
          'I love {{child_name}} but don\'t feel a rush of love',
          'is it normal not to feel attached yet',
        ],
        response:
          'Bonding is a process, not a switch. For many parents — especially those who had difficult births, are dealing with sleep deprivation, or are managing their own anxiety or low mood — the profound rush of love they expected does not arrive immediately, and that is far more common than parenting culture lets on. What matters is showing up consistently, even when feeling emotionally flat.\n\nEvery nappy change, every feed, every time you pick up {{child_name}} and hold them while they cry is building attachment from {{child_name}}\'s side regardless of what you feel in that moment. If you feel persistent detachment, numbness, or a sense that {{child_name}} is not yours, please speak with your doctor — postnatal depression and anxiety are highly treatable and affect one in five new parents.',
      },
      {
        key: 'spoiling_worry',
        patterns: [
          'am I spoiling my baby by picking them up so much',
          'my mother-in-law says I\'m making {{child_name}} too dependent',
          'should I let {{child_name}} cry to learn to self-soothe',
        ],
        response:
          'The science on this is clear and reassuring: you cannot spoil a baby under six months by responding to their needs. The concept of spoiling simply does not apply neurologically at this age. Every responsive interaction deposits trust and security into {{child_name}}\'s developing attachment system, which will actually lead to greater independence — not less — as they grow.\n\nThe "leave to cry" advice for newborns comes from an older tradition not supported by contemporary developmental neuroscience. Well-meaning family members may be working from outdated guidance. A gentle explanation — "our paediatrician says responsive settling is recommended at this age" — gives you a factual, non-confrontational response when the topic comes up.',
        boundary: true,
      },
      {
        key: 'own_emotions',
        patterns: [
          'I cry as much as my baby does',
          'I feel overwhelmed all the time',
          'is it normal to feel this anxious about a newborn',
        ],
        response:
          'What you are feeling is the collision of massive biological change, radical sleep deprivation, and a level of responsibility that has no precedent in your life before now. Feeling overwhelmed, tearful, or anxious in the first weeks is an extremely common and understandable response to that reality.\n\nThe "baby blues" — tearfulness and emotional lability in the first 2 weeks — affects up to 80% of new parents and resolves on its own. If intense anxiety or low mood persists beyond two weeks, or if you feel unable to care for {{child_name}} or yourself, please reach out to your doctor promptly. Postnatal mood disorders are medical conditions, not personal failures, and they respond very well to treatment.',
      },
    ],
    milestones: [
      [
        'em-0-social-smile',
        'Produces a genuine, responsive social smile in response to a face or voice (distinct from reflex smiles during sleep)',
        6,
        'Does {{child_name}} smile back when you smile and talk to them during a calm, alert moment?',
      ],
      [
        'em-0-gaze-preference',
        'Shows a clear preference for gazing at faces over other visual stimuli',
        1,
        'When you hold {{child_name}} at face distance, do they consistently look towards your eyes and face?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-0-no-response',
        description: 'Absence of any social smile or responsive facial expression by 3 months',
        severity: 'discuss_with_ped',
        pattern:
          'Baby has reached 12 weeks with no responsive smile and shows no difference in state when held by a caregiver versus lying alone',
        action:
          'Document observations and raise at the next well-child visit. The paediatrician will assess visual acuity, hearing, and early social engagement as part of a standard developmental screen.',
        referral: 'Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Feeling touched-out, exhausted, and tearful in the first weeks is not a sign you are not cut out for parenting — it is a sign you are a human being under extraordinary pressure.',
        'Most parents privately admit that the newborn phase was harder than they expected; the social pressure to appear joyful 100% of the time is not realistic.',
      ],
      strategies: [
        'Take turns with a partner for a single stretch of uninterrupted sleep — even 3–4 hours makes a measurable difference in emotional regulation.',
        'When you feel the panic rising during an inconsolable cry episode, put the baby safely in their cot and take two minutes in another room to breathe. A brief pause is safer than holding a baby when you are at the edge of overwhelm.',
      ],
      selfCare: [
        'Eating one proper meal a day and drinking enough water are not luxuries — they directly affect your ability to emotionally regulate and respond calmly to your baby.',
        'Accept all offers of practical help (cooking, cleaning, older sibling care) and resist the pressure to perform wellness for visitors.',
      ],
      partner:
        'Share specific, concrete needs rather than hoping your partner intuitively knows what would help — for example, "I need you to take the 2 am feed three nights a week" rather than "I need more support." Specific requests get specific results.',
      warnings: [
        'Seek help immediately if you have any thoughts of harming yourself or your baby — these thoughts can occur in postnatal psychosis, which is a medical emergency and is treatable.',
        'If one parent is consistently bearing the majority of nighttime care and emotional labour while the other sleeps undisturbed, that imbalance will erode relationship health within weeks — address it early.',
      ],
    },
    evidence:
      'Ainsworth et al. (1978) Patterns of Attachment; Schore (2001) "The effects of early relational trauma on right brain development" Infant Mental Health Journal; Zero to Three (2016) DC:0–5 Diagnostic Classification; AAP (2022) Safe Sleep Guidelines; Murray & Cooper (1997) Postpartum depression and child development, Psychological Medicine.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3 – 6 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '3-6mo',
    ageMin: 3,
    ageMax: 6,
    title: 'Joy Arrives: Social Smiles, Laughter, and Early Frustration',
    whatToExpect:
      'This is often described as the "honeymoon" period of early infancy — babies begin to express delight, laughter, and clear preference for familiar faces, making the relationship feel genuinely reciprocal for the first time. Alongside joy comes early frustration: your baby now has intentions (reach for toy, get held) but cannot always make things happen, and the mismatch produces the first faint signals of frustration.',
    keyMessage:
      'Delight shared is delight doubled — your mirrored joy teaches {{child_name}} what happiness feels like.',
    dailyTips: [
      'Narrate your baby\'s emotions out loud as you see them: "Oh you\'re so excited about that rattle!" — this begins emotional labelling years before they can do it themselves.',
      'Let frustration last a few seconds before swooping in — a brief pause builds early tolerance and lets you see what {{child_name}} is attempting.',
      'Make sure {{child_name}} gets daily stretches of interaction with their primary caregivers — face-time is brain-building at this age.',
    ],
    doList: [
      'Respond to and amplify positive emotions — laugh together, show excitement, clap.',
      'Introduce gentle "serve and return" games: make a sound, wait for a response, mirror it back.',
      'Allow brief, manageable frustration with a toy before helping — this is the beginning of persistence.',
    ],
    dontList: [
      'Don\'t over-stimulate with rapid input, loud noise, or too many faces at once — watch for the "gaze aversion" that signals overload.',
      'Don\'t rush to remove all frustration — it is a necessary emotional signal, not a crisis.',
      'Don\'t worry if your baby prefers you or their main caregiver strongly at this age — selectivity is healthy attachment, not a problem.',
    ],
    activities: [
      [
        'Emotional Vocabulary Narration',
        'Throughout nappy changes, baths, and feeds, describe what you see your baby feeling: "You look so content right now." "Oh, that was a surprise — you look startled!" "I can see you\'re frustrated — that toy keeps moving away." This builds the neural groundwork for emotional literacy years before language arrives.',
        5,
        'Continuously throughout daily caregiving routines',
      ],
      [
        'Peek-a-Boo Variations',
        'Play classic peek-a-boo but vary the timing and expression — sometimes joyful, sometimes wide-eyed surprise, sometimes exaggerated sadness when you disappear. This teaches {{child_name}} about a range of emotional expressions, anticipation, and the relief of reunion — a tiny template for managing separation.',
        8,
        'Once daily during a playful alert period',
      ],
    ],
    topics: [
      {
        key: 'laughing_and_delight',
        patterns: [
          '{{child_name}} laughed for the first time',
          'my baby is so smiley now',
          'when does laughter develop',
        ],
        response:
          'That first belly laugh is one of the most profound moments in early parenting and you are right to celebrate it. Laughter at 3–5 months is genuinely socially motivated — {{child_name}} is finding you funny, which means they are reading your face, anticipating your actions, and experiencing something that can only be called joy. This is emotional development in real time.\n\nRepeat whatever made {{child_name}} laugh — consistently. Infants this age love predictable funny routines because repetition consolidates emotional learning. Your willingness to be silly, to exaggerate, to do the same ridiculous thing seventeen times in a row is genuinely developmentally therapeutic.',
      },
      {
        key: 'baby_frustration',
        patterns: [
          '{{child_name}} gets frustrated when they can\'t reach something',
          'my baby gets really upset when a toy is out of reach',
          'is it normal for a 4 month old to get angry',
        ],
        response:
          'Yes, completely normal and actually a wonderful developmental sign. Frustration requires two cognitive achievements: forming a goal (I want that toy) and recognising a gap between the goal and the current state. A baby who gets frustrated with a toy is demonstrating motivation, intentionality, and cause-effect understanding — all of which are emerging rapidly at this age.\n\nThe key is tolerating a brief period of frustration before helping — even 15–30 seconds gives {{child_name}} the experience of effort, which is the earliest form of persistence. You are not being unkind by pausing; you are giving {{child_name}} the chance to discover their own resourcefulness. When you do help, narrate it: "You were working so hard on that — let me give you a little help."',
      },
      {
        key: 'overstimulation_shutdown',
        patterns: [
          '{{child_name}} suddenly goes blank and stops interacting',
          'my baby turns away and goes quiet during play',
          'is {{child_name}} upset when they look away from me',
        ],
        response:
          'What you are observing is called gaze aversion, and it is a sophisticated self-regulation strategy, not rejection or upset. When the nervous system reaches its input limit, infants turn away, glaze over, or go quiet to reduce arousal. It is a healthy, self-protective response and a sign that {{child_name}}\'s regulatory system is working.\n\nWhen you see it, follow {{child_name}}\'s lead: pause, reduce stimulation, go quieter, and wait. Often {{child_name}} will return to engagement within 30–60 seconds. This "break and return" cycle is actually the earliest version of managing emotional overwhelm — a skill that will serve {{child_name}} for life.',
      },
      {
        key: 'stranger_preference',
        patterns: [
          '{{child_name}} only wants me and cries with everyone else',
          'my baby screams when my mother holds them',
          'is it bad that {{child_name}} prefers me so strongly',
        ],
        response:
          'The growing preference for familiar faces and wariness of strangers that begins around 4–5 months is a sign of healthy attachment development, not a problem to solve. {{child_name}} is demonstrating that they have formed a clear internal model of who their safe people are — which is exactly what secure attachment is supposed to achieve.\n\nHelp extended family understand that this is a developmental achievement, not a rejection. Suggest they approach {{child_name}} slowly while you are present, let {{child_name}} set the pace, and avoid reaching for {{child_name}} immediately. Forcing interactions when {{child_name}} is showing clear distress will not build tolerance — gradual, respectful exposure will.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-3-belly-laugh',
        'Produces spontaneous laughter in response to social play or a familiar funny stimulus',
        4,
        'Has {{child_name}} laughed out loud at something you did, such as a funny sound or peek-a-boo?',
      ],
      [
        'em-3-reciprocal-play',
        'Engages in turn-taking "conversations" — vocalisations, pauses, response, pause — sustained over 3+ exchanges',
        5,
        'When you make a sound and wait, does {{child_name}} respond and then wait for your reply, creating a back-and-forth exchange?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-3-flat-affect',
        description:
          'Consistently flat affect — no smiling, laughing, or visible emotional response to social interaction by 5 months',
        severity: 'discuss_with_ped',
        pattern:
          'At 5 months {{child_name}} does not smile responsively, shows no difference in expression during social play versus alone, and does not appear to track or respond to familiar caregivers\' emotional expressions',
        action:
          'Raise at the next paediatric appointment. The doctor will evaluate social engagement, vision, and hearing as part of a developmental screen. A referral to a developmental paediatrician may be warranted if concerns persist.',
        referral: 'Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'The 3–6 month period is genuinely more interactive and rewarding for most parents — but if you are still finding it relentlessly hard, you are not broken; recovery from the newborn phase takes time and looks different for everyone.',
        'Many parents feel a pang of grief when their newborn becomes a more interactive baby — change in any direction can bring unexpected emotion, and that is perfectly human.',
      ],
      strategies: [
        'If you are struggling to feel joy during play, try narrating what you see rather than performing happiness — "look at you working on that toy" is authentic and effective even on low-energy days.',
        'Short, frequent connection moments (5 minutes of face-to-face play three times a day) are as developmentally valuable as long stretches — quality of attention matters more than duration.',
      ],
      selfCare: [
        'By 3–6 months many babies have a more predictable rhythm — use any consistent nap window for a non-caregiving activity that restores you, even briefly.',
        'Return to or maintain at least one social connection of your own — postnatal isolation is a significant risk factor for parental depression in this period.',
      ],
      partner:
        'The 3–6 month stage often reveals emerging differences in parenting style and tolerance for baby-led scheduling. Address disagreements about routines early and specifically; "we need to talk about the evenings" is a starting point, not an attack.',
      warnings: [
        'If you find yourself feeling consistently irritated, resentful, or emotionally numb when interacting with your baby at this age — beyond the normal moments of exhaustion — please speak with your doctor; this can be a presentation of postnatal depression.',
        'Screen time (phones, tablets) held in front of babies during interaction time reduces the serve-and-return exchanges that wire social-emotional development — be mindful of devices during face-to-face play.',
      ],
    },
    evidence:
      'Tronick (2007) The Neurobehavioral and Social-Emotional Development of Infants and Children; Sroufe (1995) Emotional Development: The Organization of Emotional Life in the Early Years; Gergely & Watson (1999) Early socio-emotional development: Contingency perception and the social biofeedback model, in Early Social Cognition (Rochat, ed.); CDC (2022) Developmental Milestones 4 Months.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6 – 12 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '6-12mo',
    ageMin: 6,
    ageMax: 12,
    title: 'Stranger Anxiety and the Safe Base: A Sign of Healthy Attachment',
    whatToExpect:
      'Between 6 and 12 months, {{child_name}} undergoes one of the most significant emotional developments of childhood: the clear emergence of attachment. They cling when you leave, cry with strangers, and use you as a "secure base" to venture out from — and return to — when exploring. Stranger anxiety and separation distress, though hard to live with, are clinically reliable indicators that healthy attachment is forming.',
    keyMessage:
      'A baby who cries when you leave is a baby who knows you are their safe place — that is the whole point.',
    dailyTips: [
      'Always say a real goodbye before leaving — disappearing without warning increases anxiety; predictable departures reduce it.',
      'Practise brief, cheerful separations at home (leave the room and return) to build confidence that you always come back.',
      'Use consistent farewell rituals — the same words, wave, or kiss each time creates a predictable emotional script.',
    ],
    doList: [
      'Respond warmly and quickly to separation distress — this builds security, not helplessness.',
      'Allow time for {{child_name}} to warm up to new people from the safety of your arms before expecting them to engage.',
      'Acknowledge the emotion: "I know you miss Mama — Mama always comes back."',
    ],
    dontList: [
      'Don\'t sneak away to avoid tears — it increases vigilance and anxiety once {{child_name}} discovers the pattern.',
      'Don\'t force interactions with strangers or unfamiliar relatives when {{child_name}} is clearly distressed.',
      'Don\'t dismiss the distress as manipulation — at this age it is neurologically genuine fear.',
    ],
    activities: [
      [
        'Object Permanence Peek Games',
        'Hide a toy under a cloth and encourage {{child_name}} to find it. As object permanence develops, so does the emotional understanding that things that disappear still exist — the cognitive scaffold for tolerating your absence. Make finding the toy a joyful moment.',
        8,
        'Daily during floor play',
      ],
      [
        'Goodbye and Return Practice',
        'Step out of the room for 5 seconds and come back joyfully. Gradually extend to 15, 30, 60 seconds over weeks. Say the same phrase each time ("I\'ll be right back!") and celebrate reunion warmly. This is evidence-based gradual desensitisation to separation, built into everyday life.',
        5,
        'Two or three times daily, embedded in routine',
      ],
    ],
    topics: [
      {
        key: 'stranger_anxiety',
        patterns: [
          '{{child_name}} screams when anyone but me holds them',
          'my baby is terrified of strangers suddenly',
          'my parents are upset that {{child_name}} cries with them',
        ],
        response:
          'Stranger anxiety peaks between 8 and 12 months and is one of the clearest developmental signs that {{child_name}} has formed a specific, discriminating attachment to their primary caregivers. It literally means: "I know the difference between safe and unfamiliar, and I understand that unfamiliar carries risk." That is a cognitive and emotional achievement, not a problem.\n\nHelp extended family understand this is temporary and nothing personal. The most effective approach is for new people to allow {{child_name}} to approach them rather than the reverse — sitting nearby, offering a toy, making no demands. Within a few visits most babies warm up significantly. Forcing the interaction, however well-intentioned, tends to entrench the fear rather than resolve it.',
      },
      {
        key: 'separation_distress',
        patterns: [
          '{{child_name}} screams every time I leave the room',
          'going back to work is breaking my heart because {{child_name}} cries so hard',
          'how do I handle separation anxiety at daycare',
        ],
        response:
          'Separation distress is one of the hardest experiences for parents because it engages your attachment system as powerfully as it engages {{child_name}}\'s. What you are feeling — guilt, grief, and the near-physical pull to stay — is your parenting instinct working correctly. And {{child_name}}\'s distress is also normal and meaningful, not a sign that something is wrong.\n\nThe critical piece of research to hold onto is this: babies at good quality childcare who cry at drop-off almost universally settle within minutes and have positive emotional states throughout the day. The transition itself is hard; the rest of the day typically is not. A consistent, brief, warm goodbye ritual — same time, same words, same hug — reduces distress faster than prolonging the goodbye or going back for "one more hug." Trust your caregiver to complete the soothing.',
      },
      {
        key: 'clinginess',
        patterns: [
          '{{child_name}} is so clingy I can\'t put them down',
          'I can\'t even go to the bathroom without {{child_name}} crying',
          'is this level of clinginess normal',
        ],
        response:
          'This is developmentally typical, peak-intensity behaviour for this age. As {{child_name}}\'s mobility increases and they become capable of moving away from you, their attachment system simultaneously becomes more insistent — a biological counter-pressure that keeps infants close to safety while they are most mobile but still most vulnerable. Clinginess at 8–11 months is not regression; it is the system working as designed.\n\nPractical strategies that help: set {{child_name}} up near you (in a safe space) before transitioning, give a running commentary ("I\'m just going to get the laundry — I can still see you"), and use consistent short separations so {{child_name}} accumulates the experience of your return. This phase peaks and then eases as object permanence and trust consolidate, typically around 12–15 months.',
      },
      {
        key: 'new_caregiver',
        patterns: [
          'we\'re starting a new childminder and I\'m worried about {{child_name}}',
          'how do I help {{child_name}} adjust to a new caregiver',
          'my baby cries with the babysitter for hours',
        ],
        response:
          'Transitions to a new caregiver require a settling-in period and are harder when skipped. The gold standard is a staggered start: visit the new setting together for short periods first, then leave briefly and return, then gradually extend your absence over days to weeks. This gives {{child_name}} time to build a secondary attachment to the new caregiver before relying on them in your full absence.\n\nChoosing a caregiver who is attuned — who makes eye contact, mirrors emotions, responds to crying, and speaks warmly to {{child_name}} — is the single most important quality indicator. When {{child_name}} is consistently inconsolable after more than 20–30 minutes at a new placement even after a proper settling-in period, that is worth investigating rather than assuming will resolve.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-6-stranger-anxiety',
        'Shows clear differentiated response to unfamiliar adults versus familiar caregivers — distress, gaze aversion, or clinging with strangers',
        8,
        'Does {{child_name}} react noticeably differently to familiar family members versus unfamiliar adults — for example, clinging to you when a stranger approaches?',
      ],
      [
        'em-6-secure-base',
        'Uses caregiver as a secure base for exploration — ventures away, checks back visually, returns when uncertain or frightened',
        10,
        'When exploring a new environment, does {{child_name}} look back to check where you are, and return to you if something startles them?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-6-no-attachment',
        description:
          'No differential response to primary caregiver versus strangers by 9 months; appears equally comfortable or indifferent with anyone',
        severity: 'discuss_with_ped',
        pattern:
          'At 9 months, {{child_name}} does not preferentially seek primary caregiver for comfort, shows no distress with strangers, and does not use caregiver as a secure base',
        action:
          'Raise at next paediatric visit. While some temperamental variation exists, absence of any attachment differentiation warrants a developmental screen. The paediatrician may refer for early intervention or a developmental evaluation.',
        referral: 'Developmental Paediatrician or Child Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Feeling suffocated by clinginess and then feeling guilty for feeling suffocated is extremely common in this period — both feelings can be true at the same time.',
        'Going back to work while {{child_name}} has peak separation anxiety is one of the worst timing clashes in early parenting and the guilt it creates is almost universal — it does not mean you are making the wrong choice.',
      ],
      strategies: [
        'Establish a predictable, brief goodbye ritual and commit to it every single time — consistency reduces anxiety far more than staying longer.',
        'Ask your caregiver for a brief update (text or photo) 15 minutes after drop-off; most parents find {{child_name}} is settled and playing, which makes the next goodbye easier.',
      ],
      selfCare: [
        'The clinginess phase is physically and emotionally draining — building in at least one hour of complete non-caregiver time each day (with a trusted person covering) is a minimum, not a luxury.',
        'Acknowledge to yourself that the intensity of this phase is temporary; it typically peaks between 8 and 12 months and gradually eases.',
      ],
      partner:
        'If one parent is the strongly preferred person right now, the other parent can feel rejected and helpless. Name this explicitly — "I know it\'s hard that {{child_name}} only wants me right now" — and find ways for the less-preferred parent to build their own rituals and moments with {{child_name}}.',
      warnings: [
        'If separation anxiety at a childcare setting is so extreme that {{child_name}} is not eating, sleeping, or engaging in play even after a full settling-in period, raise this with your paediatrician — it warrants assessment.',
        'If your own anxiety about leaving is significantly greater than your assessment of the actual risk, it may be worth speaking with someone — parent anxiety powerfully amplifies child anxiety.',
      ],
    },
    evidence:
      'Ainsworth (1978) Patterns of Attachment; Bowlby (1982) Attachment and Loss Vol.1; Cassidy & Shaver (2016) Handbook of Attachment 3rd Ed.; Ahnert et al. (2004) Transition to child care: Associations with infant-mother attachment, Child Development; CDC (2023) Developmental Milestones 9 Months.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12 – 24 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'Big Feelings in a Small Body: The Emotional Explosion of Toddlerhood',
    whatToExpect:
      '{{child_name}} now feels frustration, rage, joy, pride, shame, and jealousy with adult intensity — but the prefrontal cortex that regulates these feelings is years from maturity. Tantrums are not behaviour problems; they are the neurological signature of this developmental mismatch. The toddler period brings the most rapid expansion of emotional experience alongside the least developed capacity to manage it.',
    keyMessage:
      'Tantrums are not failures of parenting — they are proof that your toddler is experiencing life with full intensity while their brain is still under construction.',
    dailyTips: [
      'Narrate feelings throughout the day before they escalate: "You look frustrated that the block fell" — this builds emotional vocabulary from the bottom up.',
      'Anticipate tantrum triggers (hunger, tiredness, transition) and pre-empt where possible — prevention is always easier than management.',
      'Offer two acceptable choices wherever possible: "Do you want the red cup or the blue cup?" — this respects autonomy within a boundary.',
    ],
    doList: [
      'Stay physically calm during tantrums — your regulated nervous system is the only regulation tool available to a dysregulated toddler.',
      'Acknowledge the emotion before addressing the behaviour: "You are so angry that we\'re leaving the park. It\'s okay to feel angry."',
      'Reconnect warmly after every tantrum — the rupture-repair cycle builds emotional resilience.',
    ],
    dontList: [
      'Don\'t try to reason during a full-blown tantrum — the reasoning brain is offline and logic will not penetrate.',
      'Don\'t shame or mock the tantrum ("You\'re being ridiculous") — shame teaches {{child_name}} that intense emotions are unacceptable, which drives them underground.',
      'Don\'t give in to tantrum demands to stop the tantrum — this teaches that escalation is an effective strategy.',
    ],
    activities: [
      [
        'Feelings Face Book',
        'Create or buy a simple board book with photographs of faces showing different emotions. Look through it daily, naming each feeling and making the face together. At this age, naming and recognising emotions in a low-stakes context (a book) builds neural pathways for identification under pressure.',
        5,
        'Daily, works well before nap or bedtime',
      ],
      [
        'Emotion Weather Check-In',
        'Once a day, ask {{child_name}} what their "emotion weather" is today — sunny, cloudy, rainy, stormy. Even if {{child_name}} only points to a picture, this creates a daily habit of self-reflection and normalises the full range of emotional states as valid weather, not good or bad character.',
        3,
        'Once daily — morning or after nap works well',
      ],
    ],
    topics: [
      {
        key: 'tantrum_intensity',
        patterns: [
          '{{child_name}}\'s tantrums are so extreme I worry something is wrong',
          'the rage in my toddler seems disproportionate',
          'is it normal for {{child_name}} to scream for 40 minutes',
        ],
        response:
          'The intensity of toddler tantrums is regularly underestimated. A full-blown tantrum can last 20–45 minutes, involve screaming, throwing, hitting, and breath-holding, and leave both {{child_name}} and you feeling like you\'ve been through something significant — because you have. What makes this stage so hard is the combination of enormous emotional experience and zero regulatory capacity. {{child_name}} is not choosing to be dramatic; the prefrontal cortex that would interrupt and redirect the emotion simply cannot do so yet.\n\nThe most effective documented response is what researchers call "supportive presence with minimal engagement" — stay nearby, stay calm, acknowledge the feeling briefly and warmly, and wait. Do not attempt to fix, distract, reason, or escalate. When the storm passes, {{child_name}} will typically return to baseline quickly and is often ready for a hug within minutes. That rapid recovery is also developmentally typical.',
      },
      {
        key: 'emotional_vocabulary',
        patterns: [
          'how do I teach {{child_name}} to use words instead of hitting',
          '{{child_name}} can\'t tell me what\'s wrong',
          'how do I build emotional vocabulary in a toddler',
        ],
        response:
          'Emotional vocabulary at this age is built primarily through observation and repetition, not instruction. The most powerful tool you have is narrating feelings as you see them — yours, {{child_name}}\'s, and characters in books — consistently and without requiring {{child_name}} to reproduce the words. "You\'re so frustrated." "I can see you\'re really excited." "That made you feel proud." Every observation deposits the word-feeling pairing into {{child_name}}\'s developing emotional lexicon.\n\nMost toddlers begin to use a few feeling words spontaneously between 18 and 24 months, and this expands dramatically into the third year of life. Using picture books with clear emotional expressions, validating feelings before redirecting behaviour, and avoiding emotional dismissal ("you\'re fine") all accelerate this process. Hitting and biting are not deliberate misbehaviour — they are the pre-verbal communication of overwhelming emotion, and they reduce as language develops.',
      },
      {
        key: 'separation_at_bedtime',
        patterns: [
          '{{child_name}} screams when we put them to bed',
          'bedtime has become a battle every night',
          '{{child_name}} needs me to stay until they fall asleep',
        ],
        response:
          'Bedtime resistance and separation distress at sleep are very common in the second year and often intensify precisely as {{child_name}}\'s object permanence and awareness of your absence is becoming more sophisticated. {{child_name}} now genuinely understands you are somewhere else — which is both a cognitive achievement and a source of genuine overnight anxiety.\n\nA consistent, calm, brief bedtime routine (same sequence, same length, same endpoint) is the most effective behavioural support. Predictability reduces anxiety because the routine itself becomes the signal for what comes next. Gradual retreat approaches — where you remain in the room but progressively further away over nights — are gentler and often more effective than immediate full separation for children who are highly distressed.',
      },
      {
        key: 'jealousy_new_sibling',
        patterns: [
          'we have a new baby and {{child_name}} is acting out badly',
          '{{child_name}} is regressing since the new baby arrived',
          'my toddler is hitting the new baby',
        ],
        response:
          'Regression and acting out following a new sibling\'s arrival are almost universal responses and represent {{child_name}}\'s very normal attempt to process a massive disruption to their emotional world. From {{child_name}}\'s perspective, a being who was the centre of everything has now been asked to share the universe — and that is genuinely hard. Increased clinginess, toilet training regression, returning to baby talk, and aggression toward the baby are all behavioural expressions of this emotional reality.\n\nThe most effective response is deliberately investing in special one-on-one time with {{child_name}} each day — even 10 focused, screen-free minutes where {{child_name}} directs the play is powerful. Narrate {{child_name}}\'s feelings openly: "It\'s really hard sometimes when I\'m busy with the baby — you still matter so much to me." When {{child_name}} approaches the baby with aggression, redirect rather than punish: "Gentle hands — show me how you\'d stroke a baby."',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-12-uses-feeling-word',
        'Spontaneously uses at least one feeling word (sad, mad, happy, scared) in an appropriate context',
        20,
        'Has {{child_name}} used a word like "sad", "mad", "happy" or "scared" to describe how they feel, without being prompted?',
      ],
      [
        'em-12-empathic-response',
        'Shows a spontaneous empathic response to another person\'s visible distress — for example, patting, offering a toy, or showing a worried face when someone cries',
        18,
        'Has {{child_name}} ever responded to you or another person crying or being upset — for example by coming to comfort, looking concerned, or offering something?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-12-no-empathy',
        description:
          'Complete absence of any empathic or social-referencing response by 18 months — does not check your face for emotional cues and does not respond to others\' distress',
        severity: 'discuss_with_ped',
        pattern:
          'At 18 months, {{child_name}} does not look to parent\'s face to gauge how to respond in new situations, does not show concern or interest when a caregiver appears upset, and has not used a pointing gesture to share interesting things with others',
        action:
          'Raise at the 18-month developmental check. The M-CHAT-R/F screen should be administered. Absence of joint attention, social referencing, and proto-empathic responses warrants prompt developmental evaluation.',
        referral: 'Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'The toddler period is widely rated by parents as the most emotionally taxing stage of early parenting — you are not alone if this is harder than the newborn phase.',
        'Feeling triggered, overwhelmed, or occasionally furious by toddler behaviour is a universal parental experience and does not make you a bad parent.',
      ],
      strategies: [
        'When {{child_name}} is in a full tantrum, the single most effective parental strategy is to regulate your own nervous system first — slow your breathing, soften your posture, lower your voice — before attempting to co-regulate {{child_name}}.',
        'Debrief your hardest parenting moments with a trusted friend or partner — externalising the story rather than ruminating privately reduces the cortisol load and gives you perspective.',
      ],
      selfCare: [
        'The relentless demand of toddler emotional containment is genuinely depleting — protect at least one period per week that is completely free of caregiving demands.',
        'Physical exercise, even 20 minutes of brisk walking, is one of the most evidence-based tools for parental stress regulation during the toddler years.',
      ],
      partner:
        'Toddler behaviour has a way of exposing different parental values and tolerances. When you and your partner disagree about how to handle a tantrum, discuss this out of {{child_name}}\'s hearing and earshot, and aim for "consistent enough" rather than identical — the goal is a united front that {{child_name}} can read, not perfect synchrony.',
      warnings: [
        'If you find yourself losing control of your own anger during tantrums — shouting, threatening, or losing the ability to stay physically safe — this is a signal to seek support, not a character flaw; parenting under sustained stress without support is genuinely overwhelming.',
        'Persistent emotional withdrawal or flatness in a toddler — not tantrums, but the absence of emotional expression and social engagement — warrants a developmental check more than high-intensity tantrums do.',
      ],
    },
    evidence:
      'Siegel & Bryson (2011) The Whole-Brain Child; Gross (1998) The emerging field of emotion regulation: An integrative review, Review of General Psychology; Kopp (1989) Regulation of distress and negative emotions: A developmental view, Developmental Psychology; Zero to Three (2020) Infant and Early Childhood Mental Health; AAP (2021) Emotional Development in Toddlers.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2 – 3 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'Words for Feelings: Vocabulary, Fears, and the Emotional Imagination',
    whatToExpect:
      'The third year of life brings a quantum leap in emotional vocabulary and self-awareness, alongside a new and sometimes bewildering suite of fears, nightmares, and separation concerns. {{child_name}} is now able to narrate feelings — sometimes in complete sentences — and begins to understand that emotions have causes, consequences, and can be talked about. Imagination also brings its first shadow: fears of monsters, darkness, and things that don\'t exist are entirely normal cognitive-emotional developments.',
    keyMessage:
      'A child who can name their feeling has already begun to tame it — build the vocabulary and the regulation follows.',
    dailyTips: [
      'Expand beyond happy/sad/angry to include scared, surprised, embarrassed, proud, frustrated, and lonely — the wider the vocabulary, the finer the self-understanding.',
      'Take nighttime fears completely seriously — what is clearly imaginary to you is genuinely frightening to {{child_name}}, and dismissal teaches {{child_name}} not to bring fears to you.',
      'Use storybooks and their characters as emotional laboratories — "How do you think the bear felt when everyone left?"',
    ],
    doList: [
      'Validate feelings before problem-solving: "That sounds really scary" before "it\'s just a shadow."',
      'Use simple cause-and-effect language: "You\'re sad because Grandma left — it\'s okay to miss her."',
      'Create a predictable goodbye ritual for all separations — the 2-year-old\'s emotional memory means ritual is powerfully reassuring.',
    ],
    dontList: [
      'Don\'t say "there\'s nothing to be scared of" — from {{child_name}}\'s perspective, there is something to be scared of, and being told otherwise teaches distrust.',
      'Don\'t skip bedtime routines to manage time — the predictability of the routine is the emotional regulation tool.',
      'Don\'t punish emotional expression — "stop crying or I\'ll give you something to cry about" produces shame, not regulation.',
    ],
    activities: [
      [
        'Worry Monster or Worry Jar',
        'Create a simple "worry monster" (a stuffed animal with a mouth pocket) or a physical jar. Each evening, name any worries or big feelings from the day and put them in — either as drawings, words you write for {{child_name}}, or just symbolically said aloud. Then close the jar or the monster\'s mouth. This externalises anxiety from inside {{child_name}} to outside, where it feels more manageable.',
        7,
        'Each evening as part of wind-down routine',
      ],
      [
        'Feelings Charades',
        'Act out a feeling — sad face, happy jumping, scared hiding — and have {{child_name}} guess. Then swap. This gamifies emotional recognition in a joyful, low-pressure context and builds the ability to read body language and facial expression — foundational emotional intelligence.',
        10,
        'Two or three times weekly during unstructured play',
      ],
    ],
    topics: [
      {
        key: 'nighttime_fears',
        patterns: [
          '{{child_name}} is suddenly terrified of the dark',
          'monsters under the bed have become a huge problem',
          '{{child_name}} wakes up screaming from nightmares',
        ],
        response:
          'Nighttime fears and nightmares peak in the preschool years and are driven by one of the most exciting and most challenging developments of this age: the awakening of imagination. {{child_name}} can now vividly picture things that are not there, which is the foundation of creativity, empathy, and pretend play — and also of monsters. The fear is real even if the monster is not, and the most effective response is to treat it with complete seriousness.\n\nDo not try to reason {{child_name}} out of the fear — instead, validate it and co-regulate around it. Practical tools that help: a nightlight or a specific "monster spray" (water in a spray bottle {{child_name}} chooses), a brief but consistent bedtime ritual that includes an explicit "checking" of the room together, and a comfort object with a story about how it protects {{child_name}} at night. Nightmares (waking up upset, remembering the dream) are different from night terrors (partially waking, inconsolable, no memory). Both are normal; if nightmares are happening nightly and causing significant daytime anxiety, mention it to your paediatrician.',
      },
      {
        key: 'emotional_meltdowns',
        patterns: [
          '{{child_name}} still has major meltdowns even though they can talk',
          'why does {{child_name}} still lose it when they have words',
          'the tantrums have not improved at 2.5',
        ],
        response:
          'Language development does not instantly unlock emotional regulation — and this surprises many parents who expected that talking would end the meltdowns. The reason is that language is processed in the prefrontal cortex, which is the same part of the brain that is most overwhelmed during a tantrum. Under sufficient emotional load, the verbal and reasoning capacities genuinely go offline, regardless of how many words {{child_name}} knows in a calm state.\n\nWhat does change in the third year is the period before and after a meltdown. {{child_name}} is increasingly able to name feelings when calm, to recognise warning signs (with your help), and to recover more quickly with language-supported comfort. Focus your energy on the windows outside of meltdowns — building the vocabulary and the co-regulation skills in calm moments — and on staying regulated yourself during the storm.',
      },
      {
        key: 'fears_and_phobias',
        patterns: [
          '{{child_name}} is terrified of dogs, loud noises, and hand dryers',
          'the fear of hand dryers is out of proportion',
          '{{child_name}} has a very specific fear that is affecting our daily life',
        ],
        response:
          'Specific fears in the 2–3 year window are extremely common and often cluster around loud noises, animals, and unfamiliar situations. They represent {{child_name}}\'s rapidly developing threat-detection system operating on imperfect information — a system that is appropriately sensitive at this age because {{child_name}} genuinely cannot assess physical risk accurately. Most specific childhood fears resolve on their own within months to a year or two.\n\nAvoidance (crossing the road to avoid dogs) provides temporary relief but increases long-term fear. Gradual, gentle, {{child_name}}-paced exposure — looking at pictures of dogs, then watching a dog from a distance, then being near a calm dog with you — is the evidence-based approach. Never force exposure, but also try not to make avoidance reflexive. If a fear is severely restricting daily activity, a brief consultation with your paediatrician or a child psychologist is worthwhile.',
      },
      {
        key: 'preschool_transition',
        patterns: [
          '{{child_name}} cries every morning at preschool drop off',
          'the preschool teacher says {{child_name}} is fine five minutes after I leave',
          'is {{child_name}} traumatised by preschool',
        ],
        response:
          'The threshold-of-separation distress you are experiencing at the preschool door is one of the most reliable features of this developmental stage and does not indicate that preschool is wrong for {{child_name}}. The teacher\'s report that {{child_name}} is fine within minutes is the most important data point — it means {{child_name}} has the capacity to regulate with the support of a new trusted adult, which is precisely the social-emotional skill that preschool develops.\n\nKeep your goodbye brief, warm, and consistent — the same words, the same hug, every day. Prolonging the goodbye because you feel guilty does not reduce {{child_name}}\'s distress; it extends the transition and signals to {{child_name}} that your anxiety about leaving is real and warranted. If {{child_name}} is not settling after 3–4 weeks of consistent attendance, raise this with the teacher and your paediatrician.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-24-feeling-sentences',
        'Uses simple sentences to express emotional states spontaneously, such as "I feel sad" or "I scared of that"',
        28,
        'Has {{child_name}} used a sentence to describe their own feeling — for example "I don\'t like it" or "I feel happy" — without you prompting them?',
      ],
      [
        'em-24-empathy-in-play',
        'Demonstrates empathy toward characters in stories or pretend play — expresses concern for a hurt character or attempts to comfort them',
        30,
        'When a character in a book is sad or hurt, does {{child_name}} show any reaction — looking concerned, commenting, or trying to "help" the character?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-24-persistent-anxiety',
        description:
          'Persistent, pervasive anxiety that significantly restricts daily activities across multiple settings — not situational fear but constant, high-level worry',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} refuses to participate in age-typical activities across multiple settings due to fear, becomes severely distressed in situations that do not distress peers, and has not shown improvement over several weeks',
        action:
          'Discuss with paediatrician. Document the specific situations, frequency, and intensity. A referral to a child psychologist may be appropriate if the anxiety is significantly impairing daily life.',
        referral: 'Child Psychologist or Paediatric Psychiatrist',
      },
    ],
    coping: {
      normalizations: [
        'Nighttime fears mean more night wakings, more bedtime resistance, and less sleep for everyone — the exhaustion of the 2–3 year sleep-regression-meets-nightmares phase is real and not your fault.',
        'The emotional intensity of a 2–3 year old is frequently described by parents as more overwhelming than infancy, even though the child seems "older" — the emotional demands genuinely are very high.',
      ],
      strategies: [
        'Pre-empt difficult transitions with a verbal "countdown" — "In ten minutes we\'ll be leaving the park, so start saying goodbye to the slide" — giving {{child_name}} time to prepare emotionally reduces the intensity of transitions.',
        'Build a personal library of 2–3 specific scripts you use in {{child_name}}\'s most common meltdown triggers — having a plan prevents your own emotional escalation in the moment.',
      ],
      selfCare: [
        'Recognise that your child\'s fear and distress activate your own stress response involuntarily — this is biology, not weakness, and it means you need recovery time after intense emotional interactions.',
        'Practise your own emotional labelling out loud ("I\'m feeling a bit overwhelmed right now — I\'m going to take three deep breaths") — you are modelling the skill and it genuinely works for you too.',
      ],
      partner:
        'Nighttime fears and nighttime waking are a significant source of parental conflict at this age — who gets up, how long to stay, whether to bring {{child_name}} into the bed. Agree on an approach when both of you are rested and calm, not at 2 am after the third waking.',
      warnings: [
        'If your own sleep deprivation is severe and sustained, your emotional regulation capacity is genuinely impaired — this is not metaphorical, and it increases the risk of responding harshly to {{child_name}}\'s night fears. Protecting your sleep is also protecting {{child_name}}.',
        'Watch for your own anxiety being amplified by {{child_name}}\'s fears — if you are finding {{child_name}}\'s specific fears are triggering significant anxiety in you, it may be worth exploring that separately.',
      ],
    },
    evidence:
      'Denham (1998) Emotional Development in Young Children; Lagattuta & Wellman (2002) Differences in early parent-child conversations about negative versus positive emotions, Developmental Psychology; Muris et al. (2000) Fears in young children: Frequencies, content, and developmental patterns, Journal of Clinical Child Psychology; Mindell & Owens (2015) A Clinical Guide to Pediatric Sleep.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3 – 5 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'The Moral Emotions: Empathy, Jealousy, Guilt, and Pride',
    whatToExpect:
      'The preschool years see the emergence of the "moral emotions" — guilt, shame, pride, jealousy, and empathy. {{child_name}} is now aware of themselves as an object of others\' evaluation and begins to feel emotions in response to how they believe others see them. These are profoundly important developmental achievements and the substrate of conscience — but they require sensitive handling to ensure guilt rather than shame becomes the dominant moral emotion.',
    keyMessage:
      'Teach {{child_name}} "I did something wrong" (guilt, repairable) — not "I am wrong" (shame, crushing).',
    dailyTips: [
      'Focus feedback on the behaviour, never the person: "That wasn\'t kind" rather than "you\'re unkind."',
      'Notice and name positive moral emotions: "I can see you feel proud — you worked hard on that."',
      'When {{child_name}} shows jealousy, name it without shaming: "It\'s hard when someone else gets something we want — that\'s a feeling called jealousy."',
    ],
    doList: [
      'Model empathy out loud: "I noticed our neighbour looked sad today — I wonder how she\'s feeling."',
      'Encourage repair after conflict: "What could you do to help them feel better?"',
      'Read stories where characters experience the full range of moral emotions and discuss them.',
    ],
    dontList: [
      'Don\'t force apologies without genuine understanding — a hollow "sorry" teaches performance, not empathy.',
      'Don\'t compare {{child_name}} to siblings or peers in emotional performance: "Why can\'t you share like your brother?"',
      'Don\'t dismiss jealousy as babyish — it is a sophisticated social emotion requiring acknowledgment.',
    ],
    activities: [
      [
        'Feelings Detective',
        'When watching a family film or reading a book together, pause at emotionally charged moments and ask {{child_name}} to be a "feelings detective" — "What do you think they\'re feeling? How can you tell? What would you feel?" This builds theory of mind and empathic reasoning in a genuinely engaging format.',
        15,
        'Two to three times weekly during story or screen time',
      ],
      [
        'The Sorry Garden',
        'When {{child_name}} hurts someone (physically or emotionally), instead of demanding an immediate apology, sit together and draw or talk about: what happened, what {{child_name}} thinks the other person felt, what {{child_name}} could do to make it better. This builds guilt-as-repair rather than shame-as-punishment, which is the healthy moral emotion pathway.',
        10,
        'As needed after conflict or social difficulty',
      ],
    ],
    topics: [
      {
        key: 'empathy_development',
        patterns: [
          'how do I teach {{child_name}} to think about other people\'s feelings',
          '{{child_name}} doesn\'t seem to care when others are upset',
          'is my 4 year old supposed to show empathy',
        ],
        response:
          'Empathy in the preschool years is genuinely developing — most 3–4 year olds are only beginning to grasp that other people have inner states different from their own, a concept researchers call theory of mind. At 3, {{child_name}} may understand that someone is sad and want to comfort them but may offer what would comfort {{child_name}} (their own toy, their own mum) rather than what would comfort the other person. This is not selfishness; it is where theory of mind is at this age.\n\nBy 4–5, most children are able to take another\'s perspective more accurately, particularly with adults who model and narrate emotional states consistently. The most powerful tool for building empathy is conversational — "I wonder how they felt when {{child_name}} took that toy" asked genuinely and repeatedly during daily life, combined with modelling your own empathic responses to others. Empathy cannot be taught through commands; it grows through observation, narration, and emotional safety.',
      },
      {
        key: 'jealousy_fairness',
        patterns: [
          '{{child_name}} is obsessed with fairness and gets furious at any perceived inequality',
          '{{child_name}} is so jealous of their sibling',
          'my child rages when another child gets something they don\'t',
        ],
        response:
          'The ferocious fairness radar that powers up around age 3–4 is developmentally well-documented and is actually the beginning of moral reasoning. {{child_name}} is learning that the world operates on systems of fairness and reciprocity — and is in the early, all-or-nothing phase where any deviation from strict equality feels like a genuine injustice. Sibling jealousy at this age is particularly acute because siblings represent the most direct comparison point {{child_name}} has.\n\nThe goal is not to eliminate jealousy (which is not possible) but to help {{child_name}} develop the language to express it and the understanding that feelings of jealousy are normal and temporary. Acknowledge the feeling directly: "You wanted that too — it\'s hard to watch someone else get something you want, isn\'t it. That feeling has a name: jealousy." Do not try to convince {{child_name}} that the situation was fair if they clearly don\'t experience it that way — that argument rarely works and feels dismissive.',
      },
      {
        key: 'guilt_and_shame',
        patterns: [
          '{{child_name}} is devastated when they make a mistake',
          '{{child_name}} says "I\'m bad" when they do something wrong',
          'my child has very harsh self-talk after getting things wrong',
        ],
        response:
          'The distinction between guilt and shame is one of the most clinically important in child emotional development. Guilt — "I did something bad" — is tied to a specific behaviour and motivates repair. Shame — "I am bad" — is tied to the whole self and motivates hiding, withdrawal, and aggression. When {{child_name}} says "I\'m bad" or "I\'m stupid" after a mistake, that is shame language, and it deserves a careful response.\n\nRespond to shame language by separating the self from the behaviour firmly and gently: "You are not bad — you did something that wasn\'t kind, and that\'s different. Everyone makes mistakes. What could you do differently?" This reframes the experience into the guilt-repair cycle rather than the shame-spiral. Also look at whether your own response to {{child_name}}\'s mistakes has emphasised the behaviour or the person — children largely learn their self-evaluation language from what they hear from us.',
      },
      {
        key: 'overly_sensitive',
        patterns: [
          '{{child_name}} cries at the slightest thing',
          'people say {{child_name}} is too sensitive',
          'how do I help {{child_name}} cope with disappointment without falling apart',
        ],
        response:
          'Emotional sensitivity — the tendency to feel things intensely and respond visibly — is a temperament trait, not a flaw. Highly sensitive children process stimuli more deeply, feel emotions more intensely, and are often more empathic, creative, and morally aware than less sensitive peers. The parenting challenge is to help {{child_name}} manage and express sensitivity constructively rather than trying to reduce the sensitivity itself.\n\nAvoiding dismissive language ("you\'re too sensitive", "stop being so dramatic") is the first priority — these messages teach {{child_name}} that their inner experience is a problem, which drives it underground and tends to increase anxiety and shame over time. Instead, validate first and then support: "That really upset you — that makes sense. Let\'s take a breath together and then talk about what happened." Help {{child_name}} gradually develop tolerance for mild frustration and disappointment through practice, not through toughening-up interventions.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-36-theory-of-mind',
        'Demonstrates basic theory of mind — understands that another person can believe something different from what they ({{child_name}}) know to be true',
        48,
        'If you play a simple "where does the other person think the ball is?" game where {{child_name}} knows something the other person doesn\'t, can {{child_name}} predict what the other person thinks?',
      ],
      [
        'em-36-spontaneous-comfort',
        'Spontaneously offers comfort to someone who is visibly distressed in a way that is calibrated to that person\'s perspective',
        42,
        'Has {{child_name}} ever noticed someone was upset and tried to comfort them in a way appropriate to that person — for example, offering a specific thing the person likes, not just what {{child_name}} would want?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-36-no-theory-of-mind',
        description:
          'No evidence of theory of mind by age 5 — consistently unable to understand that others have thoughts, beliefs, and perspectives different from their own',
        severity: 'discuss_with_ped',
        pattern:
          'At 5 years, {{child_name}} consistently fails standard theory-of-mind tasks, does not adjust behaviour based on what others know or don\'t know, and does not use mental state language ("he thinks", "she wants", "I know")',
        action:
          'Raise at the five-year developmental check. This may indicate a delay in social-cognitive development that warrants assessment. The paediatrician should administer a developmental screen and may refer for autism spectrum or language assessment.',
        referral: 'Developmental Paediatrician or Child Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Navigating preschool-age moral drama — the betrayals, the jealousies, the fierce fairness arguments — is genuinely emotionally demanding for parents who were not expecting to be conflict mediators at this stage.',
        'Feeling a mix of pride and exasperation at your child\'s strong emotions is entirely normal — the same intensity that makes {{child_name}} seem "too much" in difficult moments is often what makes them wonderfully expressive in joyful ones.',
      ],
      strategies: [
        'When {{child_name}} is in a shame spiral, your calm, certain voice is the most powerful intervention — "You are a good person who made a mistake" spoken quietly and repeated is more effective than any argument or reassurance.',
        'Notice your own guilt/shame calibration — parents who were raised with high levels of shame often find their children\'s mistakes trigger disproportionate distress or harshness in themselves.',
      ],
      selfCare: [
        'The moral and emotional complexity of parenting a preschooler benefits from adult emotional processing too — a trusted friend, partner conversation, or reflective journaling about hard parenting moments is restorative and clarifying.',
        'Do not require yourself to navigate every emotionally complex situation perfectly in real time — repair conversations ("I\'m sorry I spoke harshly earlier, that wasn\'t fair") are themselves powerful models of emotional health.',
      ],
      partner:
        'The preschool age is when parental differences in emotional responding become most visible to the child. Discuss your respective approaches to guilt, shame, punishment, and emotional expression when {{child_name}} is not present, and aim for a shared language for moral emotions that you both feel comfortable using.',
      warnings: [
        'Pervasive shame in a 3–5 year old — expressed as "I\'m stupid", "I\'m bad", persistent self-criticism, or extreme reaction to mistakes — warrants attention; if this is a consistent pattern, mention it to your paediatrician.',
        'If {{child_name}} is consistently aggressive toward peers in social settings and this is not improving with the strategies above, an evaluation for social-emotional difficulties is worthwhile at this age — early intervention is highly effective.',
      ],
    },
    evidence:
      'Tangney & Dearing (2002) Shame and Guilt; Wellman (1992) The Child\'s Theory of Mind; Eisenberg & Fabes (1998) Prosocial development, in Handbook of Child Psychology Vol.3 (Damon & Eisenberg, eds.); Lagattuta (2014) Linking past, present, and future: Children\'s ability to connect mental states and emotions across time, Child Development Perspectives.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5 – 8 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'School, Comparison, and Performance Anxiety',
    whatToExpect:
      'Starting formal school introduces {{child_name}} to a social world of comparison, evaluation, and performance for the first time. It is perfectly normal for anxiety to surface around academic tasks, social inclusion, and perceived ability at this stage. {{child_name}} is simultaneously developing a more sophisticated self-concept and an awareness that others judge it — a combination that creates fertile ground for self-doubt if not navigated thoughtfully.',
    keyMessage:
      'Effort and strategies — not talent — are what you want {{child_name}} to believe drive their success.',
    dailyTips: [
      'Ask "what did you try today?" rather than "what did you get right?" — reframe daily.',
      'Notice and name {{child_name}}\'s courage: "You tried that even though it was hard" is more powerful than "you\'re so smart."',
      'Take school worries seriously — even if the worry seems small, it is real to {{child_name}}.',
    ],
    doList: [
      'Praise process, strategy, and effort specifically rather than intelligence or talent.',
      'Share your own manageable struggles: "I found this really tricky — let me try a different way."',
      'Help {{child_name}} identify what they can control in anxiety-provoking situations.',
    ],
    dontList: [
      'Don\'t dismiss "I\'m no good at maths" — take it seriously and help {{child_name}} locate where the difficulty is.',
      'Don\'t compare performance to siblings or classmates.',
      'Don\'t communicate your own anxiety about academic achievement directly to {{child_name}} — they absorb it.',
    ],
    activities: [
      [
        'The Brave Folder',
        'Keep a physical folder where {{child_name}} places things that represent moments of courage — a drawing of something scary they tried, a first attempt at a difficult problem, a social risk they took. Review it together monthly. Courage is a trainable muscle, and externalising its evidence builds {{child_name}}\'s sense of self as a brave person.',
        8,
        'Add to it as moments arise; review monthly',
      ],
      [
        'Worry Time',
        'Designate a specific 10-minute "worry time" each day — typically after school. During this window, any worry is welcome, written or drawn, and discussed. Outside this time, when {{child_name}} brings worries, acknowledge them and "save them for worry time." This contains anxiety rather than suppressing or amplifying it, and gives {{child_name}} the experience of managing worry rather than being managed by it.',
        10,
        'Daily — after school works well for most children',
      ],
    ],
    topics: [
      {
        key: 'school_anxiety',
        patterns: [
          '{{child_name}} has a stomachache every Monday morning',
          '{{child_name}} says they hate school but won\'t say why',
          'the Sunday night dread is becoming a big issue',
        ],
        response:
          'Physical symptoms (stomach aches, headaches) that occur predictably before school or other anxiety-provoking events are among the most common presentations of childhood anxiety. The symptoms are real — the connection between anxiety and the gut is physiological, not imaginary — and dismissing them ("you\'re fine, get in the car") tends to increase both the anxiety and the physical symptoms over time.\n\nThe most effective approach is a two-step one: acknowledge the discomfort without accepting avoidance as the solution. "I can see your stomach is really hurting. I wonder if you\'re worried about something today. You\'re still going to school, and I believe you can handle it." Investigative conversations — at the dinner table or in the car, not face-to-face — often reveal the specific worry (a child, a teacher, a task) that can then be problem-solved. If school refusal escalates, consult your paediatrician promptly — early intervention is far more effective than late.',
      },
      {
        key: 'academic_comparison',
        patterns: [
          '{{child_name}} says they\'re the worst in their class',
          '{{child_name}} is devastated that their friend reads better than them',
          'how do I help {{child_name}} handle being in the middle ability group',
        ],
        response:
          'Social comparison — evaluating oneself against others — begins in earnest at around 6–7 years and is a normal cognitive-social development. The question is not whether {{child_name}} will compare themselves to others (they will) but what narrative they construct from those comparisons. Children who believe their abilities are fixed ("I\'m not a reader") interpret comparisons as confirming judgments. Children who believe abilities grow with effort ("I\'m still learning to read") interpret comparisons as irrelevant information.\n\nWhen {{child_name}} says "I\'m the worst", respond with genuine curiosity rather than reassurance: "That sounds frustrating. What part is hardest for you? What have you tried?" Reassurance ("of course you\'re not the worst") is well-intentioned but often not believed and shortcuts the problem-solving conversation. Locating the specific difficulty and identifying a specific next step is more empowering than general encouragement.',
      },
      {
        key: 'social_exclusion',
        patterns: [
          '{{child_name}} says they have no friends',
          '{{child_name}} was left out at lunch and is heartbroken',
          'there is a child being mean to {{child_name}} at school',
        ],
        response:
          'Social exclusion at primary school age is one of the most emotionally painful experiences a child this age can face, and it registers neurologically as physical pain — which is worth knowing because it explains why the distress often seems "disproportionate" to adults. {{child_name}} is not over-reacting; they are reporting genuine hurt.\n\nYour first job is to listen fully without immediately problem-solving or minimising: "That sounds really painful. Tell me what happened." Full emotional presence before action. Once {{child_name}} feels heard, you can move to gentle problem-solving: "What do you think you could try tomorrow?" Building {{child_name}}\'s social problem-solving toolkit (exit strategies, asking to join play, finding a kindred-spirit rather than the most popular group) is more durable than solving the specific situation for them. If bullying is occurring — repeated, intentional exclusion or harassment — involve the school directly.',
        boundary: true,
      },
      {
        key: 'perfectionism',
        patterns: [
          '{{child_name}} tears up work if it isn\'t perfect',
          '{{child_name}} refuses to try things they might not be good at',
          '{{child_name}} has meltdowns over small mistakes in schoolwork',
        ],
        response:
          'Perfectionism in the 5–8 age group is increasingly common and can look like conscientiousness from the outside while being quietly limiting and distressing from the inside. {{child_name}} who refuses tasks they may not excel at, tears up imperfect work, or melts down over errors is experiencing the anxiety-performance loop — where the fear of imperfection becomes the obstacle to the performance that would reduce the fear.\n\nThe most powerful antidote is deliberate normalisation of error and modelling of imperfection by trusted adults. Share your own mistakes visibly and matter-of-factly. Celebrate attempts. Have a family language for errors: "brilliant mistake," "that\'s how we learn," "first attempts aren\'t supposed to be perfect." If perfectionism is causing {{child_name}} to avoid new activities, experience daily distress around schoolwork, or is accompanied by significant anxiety more broadly, raise this with your paediatrician — child-focused CBT is highly effective for perfectionism-driven anxiety at this age.',
      },
    ],
    milestones: [
      [
        'em-60-growth-mindset-language',
        'Uses growth-oriented language spontaneously — "I\'m still learning", "I\'ll try a different way", "I can\'t do it yet" — without prompting',
        72,
        'Has {{child_name}} ever responded to a difficulty with language that suggests effort can improve the outcome — without you saying it first?',
      ],
      [
        'em-60-manages-anxiety',
        'Identifies a personal strategy for managing anxiety or worry that they can use with some independence',
        84,
        'Does {{child_name}} have any technique they use when they feel anxious or worried — for example deep breathing, telling someone, or a physical activity — that they can apply without being told to use it?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-60-school-refusal',
        description:
          'Persistent school refusal or severe morning anxiety lasting more than two weeks, with significant functional impairment',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} refuses to attend school, produces significant physical symptoms in the morning, cannot be reasoned with about attending, and this has continued for more than two consecutive weeks despite parental consistency',
        action:
          'Contact paediatrician for evaluation. School refusal with this profile warrants assessment for anxiety disorder, and early referral to a child psychologist using CBT-based approaches is recommended. Prolonged avoidance worsens prognosis.',
        referral: 'Child Psychologist (CBT)',
      },
    ],
    coping: {
      normalizations: [
        'Watching your child experience social pain at school and not being able to fix it is one of the most helpless feelings in parenting — and it is one of the most common.',
        'Your own unprocessed experiences of school difficulty, social exclusion, or academic pressure will be activated by {{child_name}}\'s similar experiences — this is normal and worth being aware of.',
      ],
      strategies: [
        'Resist the powerful urge to rescue {{child_name}} immediately from every social difficulty — building {{child_name}}\'s own problem-solving agency is the goal, and that requires some manageable distress.',
        'Create a debrief routine — a consistent time and place (often the car ride home) where {{child_name}} shares about the day — that is predictable enough that {{child_name}} knows the space exists.',
      ],
      selfCare: [
        'Stay connected to {{child_name}}\'s school experience through the teacher, not just through {{child_name}} — knowing the full picture reduces both your anxiety and your unintentional transmission of that anxiety.',
        'Acknowledge to yourself when your worry about {{child_name}}\'s social or academic life is out of proportion to the evidence — and seek your own support if your anxiety is persistently high.',
      ],
      partner:
        'School-age parenting brings concrete decisions (homework help, tutoring, which school friendships to support) that couples may disagree on. Make these decisions collaboratively when {{child_name}} is not present, and present a consistent view to {{child_name}} even when your private opinions differ.',
      warnings: [
        'If {{child_name}} is consistently asking to stay home from school, developing physical symptoms on school days, or describing the school environment as overwhelmingly hostile, take this seriously — it is worth investigating rather than pushing through with attendance alone.',
        'Parental anxiety about academic achievement, when communicated to {{child_name}} (even indirectly through reactions to grades or comparisons), is one of the most reliable predictors of child academic anxiety. Monitor your own emotional responses to {{child_name}}\'s school performance.',
      ],
    },
    evidence:
      'Dweck (2006) Mindset: The New Psychology of Success; Kearney (2008) School absenteeism and school refusal behavior in youth: A contemporary review, Clinical Psychology Review; Crick & Grotpeter (1995) Relational aggression, gender, and social-psychological adjustment, Child Development; Kendall (2012) Child and Adolescent Therapy 4th Ed.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8 – 12 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Self-Esteem, Body Image, and the Pre-Pubertal Shift',
    whatToExpect:
      'The middle childhood years are a critical window for the consolidation of self-esteem — and increasingly, they are the years when body image concerns, social media influences, and the first hormonal signals of puberty begin to shape how {{child_name}} sees themselves. {{child_name}} is constructing a more stable, coherent sense of self while simultaneously becoming more vulnerable to peer evaluation and external appearance standards.',
    keyMessage:
      'The stories {{child_name}} tells themselves about who they are right now will form the foundation of the identity they build in adolescence.',
    dailyTips: [
      'Comment specifically on {{child_name}}\'s character, not just appearance: "You are such a loyal friend" is more self-esteem-building than "you look great."',
      'Stay curious about {{child_name}}\'s inner life — ask about opinions, preferences, moral views, not just events.',
      'Monitor and discuss media messages about bodies and appearance openly and without panic.',
    ],
    doList: [
      'Create space for {{child_name}} to voice negative self-talk so you can hear it — not to immediately fix it but to understand it.',
      'Help {{child_name}} identify competence across multiple domains: sport, creativity, relationships, humour, care.',
      'Talk openly about puberty before it arrives — normalisation in advance dramatically reduces anxiety.',
    ],
    dontList: [
      'Don\'t comment negatively on {{child_name}}\'s body, eating, or weight — ever.',
      'Don\'t dismiss self-critical statements as fishing for compliments.',
      'Don\'t communicate that your love or pride is conditional on achievement or appearance.',
    ],
    activities: [
      [
        'Identity Map',
        'Collaboratively create a visual "identity map" — a large piece of paper with {{child_name}}\'s name in the centre and branches for: things I\'m good at, things I love, people who matter to me, things I believe, what I\'m working on. Return to it once a term and notice what has changed. This externalises identity-building as a positive, ongoing process rather than a fixed judgement.',
        20,
        'Once per term — can be an extended creative session',
      ],
      [
        'Media Literacy Audit',
        'Watch a short video or look at a social media feed together and practise asking: "Who made this? What are they trying to make us think or feel? What is left out? How does this make you feel about yourself?" This builds critical media literacy directly within the relationship, not as a lecture but as a shared investigation.',
        15,
        'Once weekly — works well as part of existing screen time',
      ],
    ],
    topics: [
      {
        key: 'body_image',
        patterns: [
          '{{child_name}} says they\'re fat',
          '{{child_name}} is refusing to eat certain foods because of weight',
          '{{child_name}} compares their body to their friends constantly',
        ],
        response:
          'Body image concerns in middle childhood are increasingly common and earlier in onset than previous generations, partly driven by social media exposure and partly by the genuine awareness of peer body comparisons that comes with this developmental stage. When {{child_name}} expresses body criticism, the first priority is to take it seriously and listen fully — avoiding both dismissal ("you\'re perfect, stop being silly") and alarm (which communicates that the concern is valid and serious).\n\nRespond with curiosity: "Tell me more about what you mean" and "where did you hear that?" are more useful opening moves than counter-arguments. Help {{child_name}} develop a body-function rather than body-appearance frame: "What does your body let you do?" If {{child_name}} is changing eating behaviour, expressing persistent body dissatisfaction across many weeks, or withdrawing from activities due to body concerns, raise this with your paediatrician — early presentations of disordered eating respond well to early intervention.',
      },
      {
        key: 'self_esteem_dip',
        patterns: [
          '{{child_name}} has lost all their confidence',
          '{{child_name}} used to be so self-assured and now doubts everything',
          '{{child_name}} says they\'re not good at anything',
        ],
        response:
          'A dip in self-esteem in the 9–11 year window is a well-documented developmental pattern, particularly as {{child_name}} moves into the more socially complex and comparison-rich environment of upper primary school. The confident 7-year-old becomes the uncertain 10-year-old not because something has gone wrong but because {{child_name}}\'s self-assessment is becoming more accurate and socially informed — which is also more painful in the short term.\n\nThe most protective factor against self-esteem collapse is breadth — children with competence and connection across multiple domains (not just academic) are more resilient to dips in any single area. Help {{child_name}} stay connected to activities where they feel capable, help them maintain at least one or two close friendships, and provide specific positive feedback on character and effort regularly. If the dip is severe, persistent (more than a few months), or accompanied by withdrawal from activities, sleep changes, or appetite changes, a conversation with your paediatrician about screening for depression or anxiety is appropriate.',
      },
      {
        key: 'pre_puberty_mood',
        patterns: [
          '{{child_name}} has become moody and emotional lately and they\'re only 10',
          '{{child_name}} cries over small things suddenly',
          'my child seems sad a lot but says nothing is wrong',
        ],
        response:
          'Emotional lability, irritability, and increased tearfulness in the 9–12 year window often precede visible physical signs of puberty by 1–2 years, driven by the hormonal changes that begin in adrenal function (adrenarche) before the more familiar pubertal markers appear. This is developmentally normal and can be very confusing for both {{child_name}} and parents who are not expecting emotional puberty before physical puberty.\n\nThe most important thing is to stay curious and connected, not alarmed and diagnostic. Regular, relaxed one-on-one time (car journeys, cooking together, shared activities) creates the non-pressure contexts where {{child_name}} is most likely to share what is really going on. "I\'ve noticed you seem to be carrying something heavy lately — I\'m always here when you\'re ready" is more effective than direct questioning. If low mood is persistent (more than 2 weeks), if {{child_name}} has withdrawn from previously enjoyed activities or from friends, or if sleep is significantly disrupted, raise this with your paediatrician — depression does occur in middle childhood and early treatment changes outcomes.',
      },
      {
        key: 'social_media_impact',
        patterns: [
          '{{child_name}} spends hours on social media and is miserable after',
          'I think social media is making {{child_name}} feel bad about themselves',
          'how do I manage {{child_name}}\'s screen time at this age',
        ],
        response:
          'The evidence linking social media use and lower self-esteem and wellbeing in pre-adolescent children — particularly around appearance comparison — is substantial and growing. The mechanism is clear: passive scrolling through curated, appearance-focused content generates social comparison at a rate and intensity that has no equivalent in offline life. Children in this age group lack the cognitive tools to critically evaluate the unreality of what they are seeing.\n\nLimits on both duration and content type are appropriate and well-supported by current evidence. Where limits create conflict, the most effective approach is collaborative rule-making: involve {{child_name}} in setting the limits so they are experienced as shared decisions rather than parental impositions. Regular, curious conversations about what {{child_name}} is watching, who they are following, and how it makes them feel — without reactive alarm — build the media literacy that eventually becomes self-protective.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-96-stable-self-concept',
        'Demonstrates a relatively stable, multi-dimensional self-concept that persists across contexts — can describe themselves in terms of characteristics, values, and relationships, not only activities',
        120,
        'Ask {{child_name}} to describe themselves in 5 words or sentences. Do their descriptions include character traits and values, not just activities or appearance? Are they consistent across time?',
      ],
      [
        'em-96-independent-coping',
        'Independently uses at least two emotion regulation strategies when distressed — without needing to be told which strategy to use',
        132,
        'When {{child_name}} is visibly upset or stressed, do they have strategies they go to on their own — for example, going for a walk, listening to music, or talking to a friend — without needing adult direction?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-96-depression-screen',
        description:
          'Persistent low mood, loss of interest in previously enjoyed activities, and withdrawal from friends lasting more than two weeks',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} has been noticeably low in mood, less engaged with activities and friends they previously enjoyed, with possible sleep or appetite changes, for more than two weeks with no clear precipitating event',
        action:
          'Schedule a paediatric appointment for a formal depression screen. The PHQ-A or equivalent can be administered from age 11. A referral to a child or adolescent mental health professional is appropriate if screen is positive or clinical concern is high.',
        referral: 'Child Psychologist or CAMHS',
      },
    ],
    coping: {
      normalizations: [
        'Watching your child\'s self-esteem dip in the primary school years is painful, especially when you can see qualities in them they cannot see in themselves — this is one of the harder aspects of parenting this age group.',
        'Pre-pubertal mood shifts can feel sudden and bewildering even when you know intellectually they are hormonal — the lived experience of your warm, open child becoming moody and closed is genuinely hard.',
      ],
      strategies: [
        'Do not attempt deep emotional conversations face-to-face with this age group — side-by-side activities (walking, cooking, driving) produce more authentic sharing than direct questioning.',
        'When {{child_name}} rejects your input, resist the urge to push harder — state your availability once, leave the door open, and the conversation often comes when {{child_name}} is ready rather than when you initiate.',
      ],
      selfCare: [
        'Your own relationship with your body, with social media, and with achievement will be observed and absorbed by {{child_name}} at this age — this is a genuine invitation to examine those patterns in yourself.',
        'The pre-teen relational complexity of your child\'s social life may activate your own childhood social memories; having your own support system means this does not all land on {{child_name}}.',
      ],
      partner:
        'Middle childhood is when gender-differentiated parenting tensions sometimes emerge — who talks to the child about puberty, bodies, and friendships. Divide these conversations based on your relative comfort, not only gender, and ensure {{child_name}} has access to at least one parent for each kind of conversation.',
      warnings: [
        'Any comment from {{child_name}} about not wanting to be alive, feeling like things would be better without them, or explicit hopelessness should be taken seriously immediately and not dismissed as drama — consult your paediatrician the same day.',
        'Persistent changes in appetite, sleep, or social engagement that last more than two weeks in this age group are clinical flags for depression or anxiety and warrant medical attention, not a wait-and-see approach.',
      ],
    },
    evidence:
      'Harter (2012) The Construction of the Self 2nd Ed.; Twenge et al. (2018) Increases in depressive symptoms, suicide-related outcomes, and suicide rates among US adolescents, Clinical Psychological Science; Orben & Przybylski (2019) The association between adolescent well-being and digital technology use, Nature Human Behaviour; Nolen-Hoeksema et al. (2008) Rethinking rumination, Perspectives on Psychological Science.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12 – 15 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'Emotional Volatility, Identity, and Adolescent Intensity',
    whatToExpect:
      'Early adolescence is characterised by genuine neurological reorganisation — the brain\'s emotional centres become more reactive while the regulatory prefrontal cortex is still undergoing its decade-long maturation. {{child_name}}\'s emotional volatility, intensity, and seemingly disproportionate reactions are not drama or poor character; they are the predictable output of a brain in a specific developmental phase. Identity questions become central and urgent.',
    keyMessage:
      'Adolescent emotional intensity is biological before it is chosen — connection before correction is the most effective approach.',
    dailyTips: [
      'Maintain daily low-pressure contact rituals — dinner, a car journey, a brief check-in — without requiring depth.',
      'When {{child_name}} is in emotional escalation, match energy down (quieter voice, slower movement) rather than escalating to meet them.',
      'Separate the immediate emotional response from the later problem-solving conversation — don\'t try to do both at once.',
    ],
    doList: [
      'Stay curious about {{child_name}}\'s evolving identity, values, and opinions — even when they differ radically from yours.',
      'Offer empathy before advice: "That sounds really hard" before "have you tried..."',
      'Be explicitly available: "I\'m here whenever you want to talk — no judgment."',
    ],
    dontList: [
      'Don\'t dismiss emotional intensity as "just hormones" — the emotion is real, even if the trigger seems small.',
      'Don\'t lecture during emotional escalation — the reasoning brain is partially offline.',
      'Don\'t threaten relationship withdrawal: "If you keep acting like this I can\'t talk to you" — connection is the therapy.',
    ],
    activities: [
      [
        'Weekly One-on-One Time',
        'Commit to one weekly activity chosen by {{child_name}} — food, a walk, a game, a film — where you are present, put your phone away, ask questions, and listen without agenda. No teachable moments required. The experience of regular, low-pressure parental attention is one of the most protective factors in adolescent mental health.',
        60,
        'Once weekly — {{child_name}} chooses the activity',
      ],
      [
        'Feelings-to-Action Bridge',
        'When {{child_name}} shares a strong emotion, practise reflecting it back and then, when they are calm, exploring together: "So when that happened, you felt humiliated — what do you need to feel less humiliated in that situation?" This builds the connection between emotional experience and intentional action rather than reactive behaviour — the core of emotional maturity.',
        15,
        'As needed following emotionally significant events',
      ],
    ],
    topics: [
      {
        key: 'emotional_volatility',
        patterns: [
          '{{child_name}} explodes over tiny things',
          'one minute fine, one minute in tears',
          'living with {{child_name}} right now is like walking on eggshells',
        ],
        response:
          'What you are living with has a neurological explanation. During early adolescence the amygdala (the brain\'s threat and emotion detector) is highly reactive, while the prefrontal cortex (which would modulate that reactivity) is in a decade-long rewiring process. The result is predictably intense, fast-rising, and apparently disproportionate emotional responses. This is not who {{child_name}} is becoming — it is what {{child_name}}\'s brain is doing right now.\n\nThe most effective parental response is to remain the regulated adult in the room — which is genuinely difficult but genuinely powerful. When {{child_name}} escalates, matching that energy amplifies it; remaining calm and quiet tends to de-escalate over minutes. After the storm passes (and it will), when {{child_name}} is physiologically calm, brief connection — a simple "that was intense, you okay?" — is more effective than a post-mortem debrief or a consequences conversation.',
      },
      {
        key: 'identity_questions',
        patterns: [
          '{{child_name}} is questioning everything including their own identity',
          '{{child_name}} says they might be gay or trans and I don\'t know how to respond',
          'my teenager\'s values are so different from mine and it feels personal',
        ],
        response:
          'Identity exploration — including questioning sexuality, gender, values, beliefs, and social identity — is the primary developmental work of adolescence, as described by Erik Erikson and confirmed by decades of subsequent research. {{child_name}} questioning their identity is not a failure of your parenting; it is {{child_name}} doing exactly what adolescence is designed to facilitate.\n\nWhen {{child_name}} shares explorations of identity — especially sexuality or gender — the evidence is clear that the parental response in that first conversation has an outsized and lasting impact on both mental health and relationship quality. Expressing acceptance and curiosity — "thank you for trusting me with that" and "tell me more about what you\'re thinking" — rather than distress, argument, or dismissal protects {{child_name}}\'s mental health and keeps the line of communication open. This does not require you to have resolved your own feelings in real time; it requires you to stay in the relationship while you do.',
      },
      {
        key: 'depression_awareness',
        patterns: [
          '{{child_name}} seems really down and it\'s been weeks',
          'I\'m worried {{child_name}} might be depressed',
          '{{child_name}} is withdrawn, sleeping all the time, and won\'t engage',
        ],
        response:
          'The peak onset of depression and anxiety disorders is early to mid-adolescence, making this one of the most important windows for parental vigilance. The challenge is that adolescent depression often does not look like adult depression — it may present as irritability rather than sadness, social withdrawal rather than overt tearfulness, sleeping excessively rather than insomnia, and school disengagement rather than explicit hopelessness.\n\nIf you are observing: persistent low or irritable mood lasting more than two weeks, withdrawal from friends and activities they previously enjoyed, significant changes in sleep or appetite, declining school performance, increased risk-taking, or any statements about death, dying, or hopelessness — please schedule a same-week paediatric appointment and be direct about your concerns. Adolescent depression is a medical condition with effective treatments, and the delay between onset and treatment in adolescence averages years in many countries — early identification changes outcomes significantly.',
      },
      {
        key: 'romantic_feelings',
        patterns: [
          '{{child_name}} has their first boyfriend or girlfriend and I\'m not sure how to handle it',
          'how do I talk to my teenager about relationships',
          '{{child_name}} is heartbroken after their first breakup',
        ],
        response:
          'The first romantic relationships of early adolescence are emotionally significant even when brief. {{child_name}} is navigating entirely new emotional territory — attraction, jealousy, rejection, and the particular pain of a first breakup — without a map. The intensity of feeling in these relationships is not naive or temporary; the neurological experience is of genuine love and genuine loss, and dismissing it as "puppy love" closes the conversational door.\n\nThe most useful parental stance is to be available, curious, and non-alarmist about the relationship itself while staying engaged with the emotional content. "That sounds really painful — how are you doing with it?" is more connective than relationship advice. Conversations about consent, reciprocity, and emotional respect are best had outside the heat of a specific situation. Your ability to discuss relationships as a topic without panic is the precondition for {{child_name}} bringing you the harder conversations.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-144-emotional-insight',
        'Demonstrates emotional insight — can identify not just what they feel but why, and can connect current emotions to past experiences or patterns',
        162,
        'In a calm conversation after an upsetting event, is {{child_name}} able to explain not just what happened but why it upset them specifically — including something about themselves?',
      ],
      [
        'em-144-seeks-help',
        'Independently seeks social or emotional support from a trusted adult or peer when distressed, rather than exclusively internalising or externalising',
        168,
        'Has {{child_name}} ever proactively come to you, a teacher, or a friend and asked for help or support when they were struggling emotionally?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-144-depression-risk',
        description:
          'Persistent low mood, social withdrawal, sleep disruption, and loss of interest across more than two weeks, especially with any statements about hopelessness or not wanting to be here',
        severity: 'urgent_referral',
        pattern:
          '{{child_name}} has been low, withdrawn, and disengaged for more than two weeks; has expressed hopelessness about the future or statements that could suggest suicidal ideation; sleep and appetite are significantly disrupted',
        action:
          'Seek same-week paediatric appointment. Be direct with the doctor about specific concerning statements. If {{child_name}} has made any direct statement about suicidal thoughts or intent, this is a mental health emergency requiring same-day assessment.',
        referral: 'CAMHS / Adolescent Psychiatry — urgent',
      },
    ],
    coping: {
      normalizations: [
        'Being rejected, shouted at, or told you are the worst parent in the world by a teenager you love deeply is an experience the vast majority of parents of adolescents share — the intensity of your own hurt in those moments is real and valid.',
        'Many parents of early teenagers report that this is the most disorienting parenting period — the child is still there, but the easy access and clear role of earlier childhood has shifted and no one told you exactly what the new rules were.',
      ],
      strategies: [
        'Do not personalise every attack — when {{child_name}} says "I hate you" in a rage, they are reporting the intensity of their emotional state, not a considered evaluation of the relationship. Return to the relationship when calm.',
        'Repair matters more than never rupturing — the willingness to come back after conflict and reconnect ("yesterday was hard — I love you") models the emotional skill you want {{child_name}} to develop.',
      ],
      selfCare: [
        'Parenting a volatile early adolescent is genuinely depleting — ensure you have at least one adult relationship (friend, partner, therapist) where you can process the experience honestly without filtering for {{child_name}}\'s wellbeing.',
        'Your own emotional regulation in the moments of highest adolescent intensity will be the thing {{child_name}} eventually remembers and internalises — investing in your own regulation capacity is directly parenting-relevant.',
      ],
      partner:
        'The early adolescent period often increases couple conflict as two adults with different relational styles, different histories with their own parents, and different tolerances navigate a child who is testing all boundaries simultaneously. Scheduled, child-free debriefs about parenting approach are worth protecting.',
      warnings: [
        'If {{child_name}}\'s emotional volatility is so intense or unpredictable that it is consistently unsafe — for {{child_name}} or for other family members — consult a child and adolescent mental health professional promptly; this level of dysregulation warrants assessment.',
        'Watch for your own emotional withdrawal or defensive distancing from {{child_name}} in response to being rejected repeatedly — parental disconnection in the adolescent period is one of the most significant risk factors for adolescent mental health outcomes.',
      ],
    },
    evidence:
      'Casey et al. (2008) The adolescent brain, Developmental Review; Steinberg (2014) Age of Opportunity: Lessons from the New Science of Adolescence; NICE (2019) Depression in Children and Young People; Haidt & Allen (2020) Scrutinizing the effects of digital technology on mental health, Nature; Erikson (1968) Identity: Youth and Crisis.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 15 – 18 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Towards Emotional Maturity: Resilience, Romantic Complexity, and the Self',
    whatToExpect:
      'Late adolescence sees genuine movement towards adult emotional functioning — greater regulation capacity, more stable identity, improved perspective-taking, and the beginnings of emotional maturity. {{child_name}} is simultaneously navigating romantic relationships with real complexity, forming a differentiated sense of self independent of family, and confronting the pressures and uncertainties of the transition to adulthood.',
    keyMessage:
      'Your job is shifting from emotional container to emotional consultant — {{child_name}} increasingly needs your perspective, not your management.',
    dailyTips: [
      'Shift from directive to consultative: offer your view when asked, and explicitly say "what do you think you should do?" before telling them.',
      'Stay present and available without requiring {{child_name}} to open up on your schedule.',
      'Acknowledge and name {{child_name}}\'s emotional growth: "I\'ve noticed how you handled that — that took real maturity."',
    ],
    doList: [
      'Have honest conversations about your own emotional challenges and how you navigate them.',
      'Trust {{child_name}}\'s growing judgment more, and adjust the degree of parental oversight gradually.',
      'Actively celebrate evidence of resilience — {{child_name}} needs to know you see them.',
    ],
    dontList: [
      'Don\'t treat 17-year-old emotional struggles as equivalent to 13-year-old struggles — the regulatory capacity genuinely has grown.',
      'Don\'t use emotional intimacy as a parenting lever ("I\'ll only talk to you if you\'re calm") — this conditions emotional suppression.',
      'Don\'t panic at every emotional fluctuation — not every difficult period is a disorder.',
    ],
    activities: [
      [
        'Future Self Conversation',
        'Have a genuine, non-directive conversation about where {{child_name}} sees themselves emotionally in ten years — what they want their relationships to feel like, what kind of person they want to be, how they hope to handle difficulty. This is identity work, not career planning. Your role is to ask questions and listen, not to provide the answers.',
        30,
        'Once or twice across the year — works during long car journeys or quiet walks',
      ],
      [
        'Shared Difficult Story',
        'Share (age-appropriately) a genuine story from your own adolescence or young adulthood about a time you failed emotionally — a relationship that fell apart, a decision you regret, a time you acted from fear rather than values — and what you learned. This models that emotional failure is survivable, learnable, and not shameful.',
        20,
        'As occasions arise naturally — not engineered',
      ],
    ],
    topics: [
      {
        key: 'romantic_heartbreak',
        patterns: [
          '{{child_name}} is devastated after a breakup and won\'t leave their room',
          'how serious should I take teenage heartbreak',
          '{{child_name}} says they\'ll never feel better after this relationship ended',
        ],
        response:
          'Romantic heartbreak in late adolescence is neurologically and emotionally closer to adult grief than to the earlier "crushes" of early adolescence — the attachments are real, the losses are real, and the sense that the pain will never end is a genuine feature of how the teenage brain processes loss. Dismissing it risks {{child_name}} stopping bringing these experiences to you.\n\nThe most helpful parental stance is full presence and validation for the pain, combined with gentle scaffolding of perspective — not "you\'ll get over it" but "this is one of the hardest feelings there is, and I believe you\'ll come through it — let me sit with you." Practical support (keeping regular rhythms of food, sleep, and activity during acute grief), presence without pressure, and allowing {{child_name}} to set the pace for talking all help. If grief following a breakup leads to persistent depression, self-harm, or complete functional collapse lasting more than two weeks, consult your paediatrician.',
      },
      {
        key: 'resilience_building',
        patterns: [
          'how do I build resilience in my teenager',
          '{{child_name}} falls apart when things go wrong',
          'I want {{child_name}} to be tougher but don\'t want to be harsh',
        ],
        response:
          'Resilience is not the absence of emotional response to difficulty — it is the ability to experience difficulty and return to functioning. Paradoxically, the most reliable builder of resilience is a secure emotional base rather than deliberate exposure to hardship. Children who know they are unconditionally loved, who have experienced successful problem-solving with adult support, and who have a growth-oriented relationship with failure are more resilient than children who have been toughened through minimisation of their distress.\n\nFor {{child_name}} at 15–18, resilience building looks like: being allowed to face age-appropriate challenges without parental rescue, being supported through emotional distress without being told to suppress it, and having their problem-solving competence trusted. "What do you think you\'re going to do about this?" asked with genuine curiosity is more resilience-building than either solving it for them or pushing them away with "figure it out yourself."',
      },
      {
        key: 'emotional_maturity',
        patterns: [
          'how do I know if {{child_name}}\'s emotional development is on track',
          '{{child_name}} seems emotionally immature compared to their peers',
          'when should my teenager be able to regulate their emotions better',
        ],
        response:
          'Full prefrontal cortex maturity — the biological substrate of adult emotional regulation — is not complete until the mid-twenties. This means that some emotional dysregulation in even an 18-year-old is neurologically normal, not pathological. The trajectory matters more than any single moment: is {{child_name}} generally moving towards greater self-awareness, more effective use of coping strategies, and more consistent recovery from emotional difficulty over time? That trajectory, not perfection, is the measure.\n\nSigns that emotional development is on track at 15–18: {{child_name}} can name their emotions with reasonable accuracy, can identify some of their own patterns and triggers, can seek support when needed, can recover from emotional difficulty within hours to a day for ordinary events, and can manage their behaviour even when experiencing strong emotions most of the time. Significant persistent regression from a previously more functional state, or consistent inability to manage daily life due to emotional reactivity, warrants a clinical conversation.',
      },
      {
        key: 'leaving_home',
        patterns: [
          '{{child_name}} is leaving for university and I\'m worried how they\'ll cope',
          'my teenager is very anxious about leaving home',
          'how do I prepare {{child_name}} emotionally for the transition out of home',
        ],
        response:
          'The transition out of home is one of the most significant attachment-related events of {{child_name}}\'s life to date, and both anticipatory anxiety and genuine grief on your part and theirs are normal and appropriate. {{child_name}}\'s emotional readiness is not the same as academic or practical readiness — you can prepare someone practically for departure while underestimating the emotional weight of it.\n\nThe most effective preparation is not pep talks about independence but consistent experience of manageable autonomy in the years before: making their own decisions, problem-solving their own difficulties, developing their own identity outside of the family. In the months before leaving, normalise the complexity of the transition: "It\'s okay to be excited and terrified at the same time — most people feel both." Establish a communication pattern that {{child_name}} shapes, not you. Clear, maintained connection is not the same as maintained dependence.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'em-180-emotion-regulation',
        'Demonstrates consistent adult-range emotion regulation in most situations — can delay behavioural response to emotional trigger, use strategies, and reflect on emotional experience',
        204,
        'When {{child_name}} encounters something frustrating or upsetting in daily life, do they generally manage to respond without an escalation they later regret? Can they identify what helped them manage it?',
      ],
      [
        'em-180-empathy-and-perspective',
        'Demonstrates mature empathy — can take multiple perspectives simultaneously and appreciate that people with very different values may experience situations very differently from themselves',
        192,
        'In conversations about conflict or disagreement, is {{child_name}} able to articulate the other person\'s perspective in a way the other person would recognise as accurate, even when they disagree with it?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-em-180-self-harm',
        description:
          'Evidence or disclosure of self-harm, eating disorder behaviour, or persistent suicidal ideation',
        severity: 'urgent_referral',
        pattern:
          'Discovery of or disclosure of self-harm (cutting, burning), persistent restriction or purging behaviour, or any statement indicating active suicidal thoughts or a plan',
        action:
          'This requires same-day clinical response. Contact your paediatrician or nearest emergency mental health service immediately. Do not leave {{child_name}} alone until assessed. Remove access to means if safe to do so.',
        referral: 'Emergency psychiatric assessment — same day',
      },
    ],
    coping: {
      normalizations: [
        'Grief about the approaching end of {{child_name}}\'s childhood and your daily role in it is a real and significant emotional experience for parents — the transition-to-adulthood phase asks something of you emotionally that is rarely acknowledged.',
        'Many parents of late teenagers describe a quiet loneliness as the daily intimacy of active parenting recedes — this is a real adjustment and one worth tending to.',
      ],
      strategies: [
        'Begin gradually transferring responsibility for your own emotional life back to yourself as {{child_name}} naturally reduces daily contact — cultivate relationships, interests, and purposes that exist independently of your parenting role.',
        'When {{child_name}} returns home after being away (overnight, weekend trips), resist the urge to immediately debrief or question — let them lead the re-engagement at their own pace.',
      ],
      selfCare: [
        'The approaching empty nest, for parents whose primary identity has been parenting, is a real psychological transition that may require active attention — therapy, peer support, new investment in old relationships and interests.',
        'Maintaining a full life outside of your parenting role is not neglect of {{child_name}} — it is the precondition for the kind of relaxed, non-anxious presence that is most supportive at this stage.',
      ],
      partner:
        'Late adolescence and the approaching departure of a child is one of the most common precipitants of couple relational review — either reconnection or the surfacing of deferred difficulties. If the approaching empty nest is bringing up significant relationship questions, attending to them now rather than after {{child_name}} has left is advisable.',
      warnings: [
        'Parental anxiety about a late teenager\'s emotional readiness for independence is sometimes more about the parent\'s attachment than the teenager\'s actual capacity — reflect honestly on whether your worry is calibrated to the evidence.',
        'If you are consistently unable to trust {{child_name}}\'s judgment at 17 in age-appropriate domains, examine whether this represents legitimate concern or an attachment difficulty of your own that may be inhibiting {{child_name}}\'s development.',
      ],
    },
    evidence:
      'Arnett (2004) Emerging Adulthood; Steinberg et al. (2009) Age differences in future orientation and delay discounting, Child Development; McLean & Mansfield (2012) The co-construction of identity in adolescence, in The Oxford Handbook of Identity Development; WHO (2021) Adolescent mental health factsheet; Linehan (1993) Cognitive-Behavioral Treatment of Borderline Personality Disorder (DBT framework).',
  },
]
