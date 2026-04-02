import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ── 0-3 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '0-3mo',
    ageMin: 0,
    ageMax: 3,
    title: 'Social Smile, Face Preference, and Caregiver Bonding',
    whatToExpect:
      'From the first hours of life, newborns are primed for social connection — preferring faces to all other visual stimuli, orienting to voice, and producing their first genuine social smiles around 6–8 weeks. The caregiver relationship is the entire social world at this age.',
    keyMessage:
      'Every face-to-face interaction, every tender response, is literally wiring the social brain. You cannot spoil a newborn with too much connection.',
    dailyTips: [
      'Hold your face 20–30 cm from the baby\'s face during alert time — this is the optimal focal distance for a newborn\'s vision.',
      'Narrate what you are doing throughout care routines: your voice is the primary social stimulus at this age.',
      'Imitate your baby\'s expressions back to them — they will notice, and this is the earliest proto-conversation.',
    ],
    doList: [
      'Respond consistently and promptly to cries — you cannot spoil a newborn and reliable responses build secure attachment.',
      'Include both parents and any consistent caregivers in face-to-face interaction early.',
      'Protect skin-to-skin time in the first weeks — it directly supports bonding hormones (oxytocin) and social brain development.',
    ],
    dontList: [
      "Don't worry if your baby doesn't smile immediately — genuine social smiles typically emerge at 6–8 weeks, not earlier.",
      "Don\'t leave newborns in bouncy chairs or swings for extended periods during alert time — social interaction with faces is irreplaceable.",
      "Don\'t underestimate the power of your voice: even ordinary conversation while feeding or changing is developmental input.",
    ],
    activities: [
      [
        'Face Time (the real kind)',
        'Lie baby on your lap facing you during alert windows. Talk, make expressions, wait for reactions. This is the first social conversation.',
        10,
        'during each alert period',
      ],
      [
        'Narrated Care',
        'Talk continuously during every nappy change, feed, and bath. "Now I\'m washing your left foot..." Your running commentary is social scaffolding.',
        5,
        'each care routine',
      ],
    ],
    topics: [
      {
        key: 'first_social_smile',
        patterns: [
          'when will baby smile',
          'baby not smiling at 6 weeks',
          'social smile timeline',
        ],
        response: `The social smile — the genuine, whole-face response to your face and voice — typically emerges between 6 and 8 weeks and is one of the most rewarding developmental moments in early parenthood. Before that, the smiles you see are usually reflex events during sleep.\n\nWhen {{child_name}} does smile socially for the first time, it marks the activation of circuits dedicated to human social recognition. Smile back, match the energy, give them a moment to "respond" again — this is their first experience of reciprocal conversation, and it is building the social architecture they will use for life.`,
        boundary: false,
      },
      {
        key: 'bonding_anxiety',
        patterns: [
          'I don\'t feel bonded to my baby',
          'love didn\'t come immediately',
          'how long does bonding take',
        ],
        response: `Not all parents experience an immediate overwhelming rush of love at birth, and this does not predict the quality of the bond or the relationship that follows. Bonding is a process, not an event, and it often builds gradually through the accumulating experience of care, response, and face-to-face time.\n\nWhat supports bonding most reliably is exactly what you are doing day to day: responding to {{child_name}}'s cues, holding, feeding, and talking. If you are experiencing persistent emotional numbness, low mood, or a feeling of disconnection that doesn't lift after the first few weeks, please speak to your doctor — postpartum mood disorders are common and very treatable.`,
        boundary: true,
      },
      {
        key: 'multiple_caregivers',
        patterns: [
          'will baby get confused with multiple caregivers',
          'is it okay for grandparents to care for newborn',
          'how many people is too many',
        ],
        response: `Newborns can form multiple secure attachments — to two parents, grandparents, and regular caregivers. This is a feature, not a bug: the more securely attached relationships {{child_name}} builds, the more resilient their social brain becomes. There is no fixed "one primary attachment" rule.\n\nWhat matters is that caregivers are consistent, responsive, and warm. A calm, attentive grandparent who cares for {{child_name}} regularly will form a genuine attachment. Brief, varied encounters with many different people do not build attachment in the same way, but they also don't harm it.`,
        boundary: false,
      },
      {
        key: 'screen_exposure_newborn',
        patterns: [
          'is TV in the background okay for newborn',
          'baby looking at phone screen',
          'screen time for newborn',
        ],
        response: `Screens — including background TV — are not recommended for newborns. At this age, {{child_name}}'s rapidly developing visual and social brain is calibrated for human faces, natural light, and three-dimensional space. The flickering, two-dimensional stimulation of screens provides none of the social contingency (response, turn-taking, face-reading) that builds the social brain.\n\nBackground TV is a particular concern because it fragments parent speech and reduces the quality of face-to-face interaction that {{child_name}} needs most. The recommendation is no intentional screen exposure under 18–24 months (except video calls with family). This is not about perfectionism — it is about protecting the most sensitive period of social brain development.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'social_smile',
        'Produces first genuine social smile in response to face and voice',
        7,
        'Has {{child_name}} given you a real smile yet — not a reflex one in sleep, but one in response to your face or voice?',
      ],
      [
        'face_preference',
        'Clearly prefers to look at faces over other objects',
        4,
        'Does {{child_name}} turn towards your face or voice during alert time?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-0-no_smile',
        description: 'No social smile by 3 months of age, or no response to faces or voices',
        severity: 'discuss_with_ped',
        pattern: 'no smile at 3 months|doesn\'t look at faces|not responding to voice',
        action: 'Discuss with pediatrician at 3-month visit. Absence of social smile by 3 months warrants evaluation.',
        referral: 'Pediatrician / Developmental Pediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Feeling like you are talking to a blob who gives nothing back in the first weeks is common — the social payoff comes, and it is worth the wait.',
        'Not feeling an immediate overwhelming bond with your newborn is more common than parents admit and does not determine the outcome.',
      ],
      strategies: [
        'Find one daily ritual that is purely face-to-face with your baby — even 10 minutes of intentional social play pays forward.',
        'If bonding feels hard, increase skin-to-skin time — the physical proximity activates the same oxytocin system that supports emotional connection.',
      ],
      selfCare: [
        'The social isolation of new parenthood is real. Protect at least one adult connection per week — a friend, a group, a call.',
        'Your wellbeing directly shapes the quality of social interaction your baby receives. Taking care of yourself is taking care of them.',
      ],
      partner:
        'Involve both partners in face-to-face play time from day one — the relationship with each parent develops separately and in parallel.',
      warnings: [
        'If you are finding it difficult to make eye contact with or hold your baby, or are experiencing intrusive thoughts, please speak to your doctor today.',
        'Persistent low mood or anxiety in the postpartum period directly affects the quality of social interaction your baby receives — get treatment for yourself too.',
      ],
    },
    evidence:
      'Trevarthen C, The foundations of intersubjectivity, The Social Foundations of Language and Thought 1980; Feldman R, Oxytocin and social affiliation in humans, Hormones & Behavior 2017; Meltzoff AN & Moore MK, Imitation of facial expressions by neonates, Science 1977.',
  },

  // ── 3-6 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '3-6mo',
    ageMin: 3,
    ageMax: 6,
    title: 'Familiar Faces, Stranger Wariness, and Reciprocal Play',
    whatToExpect:
      'Between 3 and 6 months, babies begin to distinguish familiar from unfamiliar faces, show preferential delight for known people, and develop the turn-taking rhythms of early "conversation" — pause, respond, pause, wait. They are becoming social partners.',
    keyMessage:
      'Your baby is learning the fundamental grammar of social interaction — turn-taking, timing, response contingency. Every "conversation" you have is teaching it.',
    dailyTips: [
      'Pause after you speak or make an expression and wait for your baby to respond — this teaches the rhythm of conversation.',
      'Introduce new faces gradually and at a comfortable distance — stranger wariness starting around 4–5 months is a sign of healthy recognition memory.',
      'Laughter is a social milestone: look for it from about 4 months and actively try to find what {{child_name}} finds funny.',
    ],
    doList: [
      'Vary your facial expressions and vocal tone widely — babies this age are learning to read emotion from faces.',
      'Introduce your baby to a small number of consistent people beyond the immediate family — a few regular faces expand the social repertoire.',
      'Celebrate early vocalizing as the conversation it is: respond to babbles as if they are words.',
    ],
    dontList: [
      "Don\'t force interaction with strangers when baby shows discomfort — wariness is protective and appropriate.",
      "Don\'t underestimate the social power of singing — songs involve the rhythm, pattern, and responsiveness that babies find most engaging.",
      "Don\'t hand your phone over for stimulation during alert social time — your face remains the richest social input available.",
    ],
    activities: [
      [
        'Call and Response',
        'Make a sound, pause. Baby vocalizes or moves. You respond immediately. Pause again. This is the earliest dialogue, and it builds the neural timing of conversation.',
        10,
        'several times daily',
      ],
      [
        'Mirror Play',
        'Hold baby in front of a baby-safe mirror. Name the baby in the reflection, name their expressions. Begins the very long process of self-recognition and social self-awareness.',
        5,
        'daily',
      ],
    ],
    topics: [
      {
        key: 'stranger_wariness',
        patterns: [
          'baby cries when others hold them',
          'stranger anxiety starting early',
          'baby doesn\'t like grandparents holding',
        ],
        response: `The wariness {{child_name}} is showing with unfamiliar faces is a sign of excellent cognitive development: they have now formed clear internal representations of known faces, and anyone who doesn't match those representations triggers a cautious alert. This is the social immune system doing its job.\n\nSupport this by not forcing contact: ask new people to approach slowly, get to floor level, and let {{child_name}} warm at their own pace. Brief exposures to the same unfamiliar people repeatedly, without pressure, builds familiarity. Most babies warm significantly within 10–15 minutes when not rushed.`,
        boundary: false,
      },
      {
        key: 'social_laugh',
        patterns: [
          'when does baby laugh',
          'baby not laughing at 5 months',
          'how to make baby laugh',
        ],
        response: `Social laughter — the genuine belly laugh in response to something funny — typically emerges between 3.5 and 5 months. What babies find funny at this age tends to be surprising contrasts (a silly voice, an unexpected face), physical playfulness (raspberries, gentle bouncing), and above all, your genuine delight.\n\nIf {{child_name}} is not laughing yet, keep playing. Every baby has a different laugh trigger. Some babies are physically ticklish; others respond to voice; others to unexpected movements. The search itself is play, and play is development.`,
        boundary: false,
      },
      {
        key: 'reciprocal_play',
        patterns: [
          'baby not engaging back',
          'baby doesn\'t smile back consistently',
          'is my baby socially developing',
        ],
        response: `At 3–6 months, the back-and-forth rhythm of social play is still developing and will not be consistent or reliable. {{child_name}} will engage warmly one moment and look away the next — the looking away is not rejection, it is self-regulation. Babies this age need breaks from social stimulation just as they need the stimulation itself.\n\nFollow {{child_name}}'s lead: when they turn away or become fussy, give them a moment. When they return to eye contact, re-engage. This sensitive following of the child's cues — rather than persistent stimulation — is actually what builds the most secure social engagement over time.`,
        boundary: false,
      },
      {
        key: 'social_media_baby',
        patterns: [
          'posting baby photos online',
          'social media and baby privacy',
          'sharing baby videos online',
        ],
        response: `This is a meaningful question about {{child_name}}'s digital footprint and consent. Photos and videos shared publicly or even to large friend groups create a permanent digital presence that {{child_name}} has no ability to consent to and may one day have complex feelings about.\n\nMany families choose a private, controlled approach: sharing via a closed family group, a private gallery app, or physical prints rather than public social media. Consider what you are comfortable with {{child_name}} discovering as a teenager — that is a useful frame for current decisions. There is no single right answer, but intentionality now is valuable.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'social_laugh',
        'Produces first genuine laugh in social play',
        16,
        'Has {{child_name}} laughed yet — a real laugh, not just a smile? What was the trigger?',
      ],
      [
        'turn_taking_vocalization',
        'Engages in back-and-forth vocalization with caregiver',
        14,
        'Does {{child_name}} take turns vocalizing with you — do they seem to wait for you to respond and then respond back?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-3-no_engage',
        description: 'No social smiling, no vocalization directed at people, or no response to familiar voices by 4 months',
        severity: 'discuss_with_ped',
        pattern: 'no social smile at 4 months|not vocalizing to people|not responding to familiar voice',
        action: 'Discuss with pediatrician. These are flags for developmental evaluation.',
        referral: 'Pediatrician / Developmental Pediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Not all babies are equally socially expressive in the early months — temperament is real, and quieter babies are not less socially capable.',
        'The effort of sustained face-to-face interaction when you are exhausted is real. Short, genuine interactions are better than long, effortful ones.',
      ],
      strategies: [
        'Find the play format {{child_name}} most responds to — some babies love silly voices, others love gentle physical play, others love songs. Follow their lead.',
        'Include caregivers and family in playful interaction as soon as possible — a wider social network benefits both of you.',
      ],
      selfCare: [
        'If social interaction with your baby feels one-sided and unrewarding, that is common at this age and will change as responsiveness increases.',
        'Adult social connection is not a luxury — it is a necessity. Make time for it weekly.',
      ],
      partner:
        'Each parent builds their own play relationship with the baby. Encourage your partner\'s different play style rather than correcting it — variety is developmentally good.',
      warnings: [
        'If you consistently feel disconnected from your baby or find interactions aversive, please speak to your doctor — this can be a sign of postpartum depression.',
        'If family members are being dismissive of your baby\'s wariness or forcing contact, it is appropriate to set limits on this.',
      ],
    },
    evidence:
      'Jaffe J et al., Rhythms of Dialogue in Infancy, Monographs SRCD 2001; Stern DN, The Interpersonal World of the Infant, 1985; Holt-Lunstad J, Social connections and health, Perspectives Psychological Science 2015.',
  },

  // ── 6-12 months ─────────────────────────────────────────────────────────────
  {
    agePeriod: '6-12mo',
    ageMin: 6,
    ageMax: 12,
    title: 'Stranger Anxiety, Attachment Hierarchy, and Social Referencing',
    whatToExpect:
      'Between 6 and 12 months, stranger anxiety reaches its peak, a clear hierarchy of preferred people solidifies, and babies develop social referencing — checking the caregiver\'s face to know how to respond to new things. This is sophisticated social cognition in miniature.',
    keyMessage:
      'Stranger anxiety and strong preference for caregivers are signs of healthy, secure attachment — exactly what you have been building.',
    dailyTips: [
      'When {{child_name}} checks your face in a new situation, respond with clear, calm expressions — your face is the map they navigate by.',
      'Prepare new people to approach slowly, get low, and let baby set the pace — stranger anxiety is a feature, not a problem.',
      'Narrate social situations: "That\'s Auntie Priya — she is friendly, it\'s okay" — your words shape their read of the situation.',
    ],
    doList: [
      'Honor the attachment hierarchy: it is okay that {{child_name}} prefers you right now, and it does not diminish other relationships.',
      'Use peek-a-boo and hide-and-seek as both play and social training for the idea that separation has an end.',
      'When you must leave, give a real goodbye rather than sneaking away — predictable separations are less distressing than unexplained disappearances.',
    ],
    dontList: [
      "Don't force contact with strangers or family who visit rarely — the pressure amplifies the distress and doesn't build trust.",
      "Don\'t sneak away when leaving your baby — brief, clear goodbyes with reliable return build trust in separations.",
      "Don\'t worry that stranger anxiety means your baby is unsociable — the opposite is true.",
    ],
    activities: [
      [
        'Peek-a-Boo Variations',
        'Peek-a-boo with a cloth, around a door, with different faces — each variation builds object permanence and the social expectation of reunion after absence.',
        10,
        'daily',
      ],
      [
        'Guided Social Referencing',
        'When encountering something new (a dog, a noisy machine, a new room), pause and let {{child_name}} look at your face before they look at the thing. Respond with clear, calm positivity. You are the interpreter of the world.',
        5,
        'whenever something new is encountered',
      ],
    ],
    topics: [
      {
        key: 'stranger_anxiety_peak',
        patterns: [
          'baby cries with everyone except me',
          'stranger anxiety very intense',
          'grandparents upset baby won\'t go to them',
        ],
        response: `What {{child_name}} is experiencing at this age is peak stranger anxiety — a direct reflection of how clear and secure the attachment to you has become. They are not more anxious than other babies; they are more clearly recognizing who is safe and who is new. This is healthy social discrimination.\n\nHelp extended family understand this: it is not a rejection of them personally, and forcing contact makes it worse. Ask them to be patient, get to the baby's level, offer a toy rather than immediately reaching for the baby, and give it time. Most babies will warm in 10–15 minutes when the pressure is off.`,
        boundary: false,
      },
      {
        key: 'attachment_hierarchy',
        patterns: [
          'baby only wants mum',
          'baby crying when dad holds them',
          'primary caregiver preference',
        ],
        response: `A strong primary caregiver preference is normal and expected at this age — it reflects secure attachment to the primary caregiver, not insecurity about others or rejection of them. Both parents and multiple caregivers can form genuine attachments with the baby; they will develop at different rates and have different qualities.\n\nFor the less-preferred caregiver (often the one who does less physical care), consistency is key: regular one-on-one care time, finding a particular play activity they do together, and not being deterred by initial preference for the primary caregiver. The preference is rarely permanent and usually evens out significantly by 12–18 months.`,
        boundary: false,
      },
      {
        key: 'social_referencing',
        patterns: [
          'baby looks at me before reacting to things',
          'checking my face before deciding',
          'what is social referencing',
        ],
        response: `What {{child_name}} is doing — looking at your face to decide how to feel about something new — is called social referencing, and it is one of the most sophisticated social cognitive abilities to emerge in the first year. They are treating your face as an emotional GPS.\n\nThis is your cue to be intentional about your expressions in new situations. If you are startled or anxious, {{child_name}} will read that and be more cautious. If you respond with a calm smile, they will be more likely to engage. Your emotional expressions are genuinely guiding their social learning right now.`,
        boundary: false,
      },
      {
        key: 'daycare_separation',
        patterns: [
          'baby crying at daycare drop off',
          'separation at nursery starting',
          'is daycare bad for attachment',
        ],
        response: `Daycare separation can be hard for both baby and parent, and it is one of the most emotionally loaded transitions in early parenthood. The research is reassuring: quality childcare with responsive caregivers does not damage attachment to parents, and many babies adapt within a few weeks.\n\nA brief, consistent farewell ritual each morning — same words, same warmth, then leave — is more effective than extended or ambiguous goodbyes. Ask caregivers to share how long distress lasts; most babies settle within 5–15 minutes and are genuinely fine. If distress at drop-off continues beyond 4–6 weeks without improvement, discuss it with both the caregivers and your pediatrician.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'stranger_anxiety',
        'Shows clear preference for familiar caregivers and wariness with strangers',
        8,
        'Does {{child_name}} show a clear difference in how they respond to familiar people versus strangers?',
      ],
      [
        'social_referencing',
        'Checks caregiver\'s face before responding to a new or ambiguous situation',
        10,
        'Does {{child_name}} look at your face when they encounter something new or uncertain?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-6-no_stranger',
        description: 'No stranger anxiety and equal comfort with complete strangers and primary caregivers — lack of attachment differentiation by 9 months',
        severity: 'discuss_with_ped',
        pattern: 'no stranger anxiety|goes to anyone with no preference|no attachment to parent',
        action: 'Discuss with pediatrician. Absence of attachment differentiation warrants developmental evaluation.',
        referral: 'Pediatrician / Developmental Pediatrician / Child Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Feeling torn between relief at your baby\'s strong attachment and guilt about their distress at separation is one of parenting\'s most common contradictions.',
        'It is painful when your baby cries for grandparents or day care. Their distress does not mean permanent harm is being done.',
      ],
      strategies: [
        'Establish a clear, brief goodbye ritual and commit to it — ambiguous or extended goodbyes increase distress, not decrease it.',
        'Communicate with grandparents and family about stranger anxiety in a way that frames it as a compliment to your parenting, not a rejection of them.',
      ],
      selfCare: [
        'Separation from your baby is emotionally hard for parents too. Give yourself permission to have feelings about it.',
        'If drop-off distress is affecting your whole work day with guilt or anxiety, speak to your pediatrician or a parent coach.',
      ],
      partner:
        'If one parent is strongly preferred, the other parent needs consistent, regular solo care time to build their own relationship. This is worth prioritizing explicitly.',
      warnings: [
        'If you are experiencing significant anxiety about leaving your baby, beyond normal adjustment, this deserves attention for your own wellbeing.',
        'If your baby shows no change in demeanour with any person — familiar or stranger — mention this to your pediatrician.',
      ],
    },
    evidence:
      'Ainsworth MDS, Patterns of Attachment, 1978; Klinnert MD et al., Emotions as behavior regulators: Social referencing in infancy, Emotion: Theory, Research and Experience 1983; NICHD Early Child Care Research Network, Child Outcomes at 4.5 years, Child Dev 2003.',
  },

  // ── 12-24 months ────────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'Parallel Play, Possessiveness, and Early Empathy',
    whatToExpect:
      'Toddlers engage in parallel play — playing next to but not truly with other children — and this is developmentally correct. Sharing is neurologically beyond them yet. Early empathy appears in the form of noticing and responding to others\' distress, even before the language to discuss it arrives.',
    keyMessage:
      'A toddler who doesn\'t share is not selfish — they literally do not yet have the neural architecture for it. Parallel play next to peers is exactly the right social level for this age.',
    dailyTips: [
      'Arrange play dates where both children have their own sets of similar toys — parallel play works best when there is no forced sharing pressure.',
      'Name emotions out loud: "You look sad. Did that hurt?" — even before {{child_name}} can respond, this is building emotional vocabulary.',
      'Comment on other children\'s feelings in books and real life — "That baby is crying. I wonder what they need."',
    ],
    doList: [
      'Accept and protect possessiveness ("mine") as developmentally appropriate — it is actually a healthy assertion of self.',
      'Model sharing in your own life, narrated: "I\'m sharing my fruit with Daddy."',
      'Acknowledge early empathy behaviors when you see them — if {{child_name}} offers their toy to a crying child, that is remarkable at this age.',
    ],
    dontList: [
      "Don't force sharing — coerced sharing doesn't teach generosity, it teaches that adults can override your ownership of things.",
      "Don\'t scold possessiveness — it is developmentally expected and healthy.",
      "Don\'t arrange play dates with expectations of cooperative play — parallel is the goal.",
    ],
    activities: [
      [
        'Emotion Labeling in Books',
        'While reading, pause to name the emotions of characters: "He looks scared. His eyes are big and his mouth is open." Building emotional vocabulary is the first step to empathy.',
        10,
        'daily reading',
      ],
      [
        'Side-by-Side Play Setup',
        'Arrange play with one or two same-age peers with duplicates of appealing toys available. Observe without intervening unless safety is at stake. Let parallel play unfold.',
        30,
        'weekly',
      ],
    ],
    topics: [
      {
        key: 'sharing_too_early',
        patterns: [
          'toddler won\'t share',
          'how do I teach sharing',
          'my child grabs toys',
        ],
        response: `Sharing requires a set of cognitive capacities that are genuinely not in place yet for most toddlers: the ability to hold two perspectives simultaneously, to delay gratification, and to trust that giving something up is temporary. {{child_name}} is not being selfish — they literally cannot share yet in the way adults mean the word.\n\nWhat you can do: model turn-taking ("my turn, your turn"), use language like "you can have it back in two minutes" and then actually give it back, and create play situations where sharing isn't required. Forced sharing before readiness doesn't build generosity — it builds resentment and confusion.`,
        boundary: false,
      },
      {
        key: 'parallel_play_normal',
        patterns: [
          'toddler plays next to other kids but not with them',
          'not engaging with other children',
          'is parallel play normal',
        ],
        response: `Parallel play — playing side by side, watching each other, occasionally interacting but not truly playing together — is exactly the right social level for this age. {{child_name}} is doing precisely what they should be doing developmentally.\n\nThe value of parallel play is real: children this age are learning from each other through observation, beginning to copy play behaviors, and building familiarity that will eventually enable cooperative play. You don't need to engineer cooperative play at this age — the social observation and proximity of parallel play is the developmental work that needs to happen first.`,
        boundary: false,
      },
      {
        key: 'early_empathy',
        patterns: [
          'toddler upset when other child cries',
          'baby gives toy to crying child',
          'early signs of empathy',
        ],
        response: `The empathy you are seeing in {{child_name}} — noticing another child's distress and responding to it — is a genuinely remarkable early capacity. Infants as young as 14 months show this behavior, and it is considered one of the earliest expressions of moral motivation in human development.\n\nNurture it: acknowledge it warmly when you see it ("You noticed she was sad and offered your toy — that was very kind"). Don't ignore it or treat it as ordinary — it is the foundation of prosocial behavior that will serve {{child_name}} throughout life.`,
        boundary: false,
      },
      {
        key: 'aggression_toddler',
        patterns: [
          'toddler hitting other children',
          'biting at daycare',
          'aggressive toddler',
        ],
        response: `Hitting, biting, and grabbing in toddlers happen because they have big social and emotional experiences but almost no tools to process or communicate them. A toddler who bites is usually communicating something they cannot say: frustration, overwhelm, wanting something, or excitement.\n\nRespond calmly and immediately: "No biting. Biting hurts." Remove from the situation briefly. Then address the underlying need. Don't shame or over-punish — at this age the child is doing the best they can with the regulation they have. Consistent, calm limit-setting while teaching words and alternatives is the evidence-based approach. If biting or hitting is very frequent or intense, discuss with your pediatrician.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'parallel_play',
        'Engages in parallel play alongside peers without needing direct facilitation',
        15,
        'Does {{child_name}} play comfortably alongside other children, even without truly playing together?',
      ],
      [
        'early_empathy_response',
        'Shows a response to another person\'s distress (looking, approaching, offering comfort)',
        18,
        'Have you noticed {{child_name}} responding to another person\'s upset — looking concerned, offering a toy, or trying to help?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-12-no_interest',
        description: 'No interest in watching or being near other children, no pointing to share interest, or no response to own name by 12 months',
        severity: 'discuss_with_ped',
        pattern: 'no interest in other children|not pointing|doesn\'t respond to name at 12 months',
        action: 'Discuss with pediatrician. These are developmental surveillance flags for possible autism spectrum evaluation.',
        referral: 'Pediatrician / Developmental Pediatrician / Child Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Being embarrassed by your toddler\'s "not sharing" at a play date is one of the most universal parenting experiences. Every other parent in the room has been there.',
        'Feeling like you are failing social development because your toddler hits or bites is a common misread — you have not failed; they have a developing brain.',
      ],
      strategies: [
        'Go into play dates with lowered expectations: parallel play, some toy conflict, and the occasional meltdown are all entirely normal.',
        'Build a small group of parents whose children are the same age — shared experiences normalize what feels uniquely difficult.',
      ],
      selfCare: [
        'Play dates can be socially exhausting for parents too. Keep them short and pleasant rather than long and heroic.',
        'If your toddler\'s social behavior is causing you significant shame or anxiety, talk to your pediatrician — your peace of mind matters.',
      ],
      partner:
        'Discuss how you will handle toy conflicts and sharing pressure at play dates before you arrive — divergent in-the-moment responses confuse everyone.',
      warnings: [
        'If your toddler is hurting other children repeatedly despite consistent intervention, or shows no empathy response at all, discuss with your pediatrician.',
        'Social anxiety in the parent about toddler play dates can be inadvertently transmitted to the child — address your own anxiety if it is significant.',
      ],
    },
    evidence:
      'Parten MB, Social participation among preschool children, J Abnormal Social Psychology 1932; Vaish A et al., Not all emotions are created equal: Empathy and the young child, Psychological Bulletin 2009; Brownell CA, Towards a unifying theory of sharing and cooperation, Social Development 2009.',
  },

  // ── 2-3 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'Cooperative Play Emerging, Turn-Taking, and First Friendships',
    whatToExpect:
      'The third year of life sees a genuine leap toward cooperative play as language enables negotiation, role assignment, and shared narrative. First true friendships begin — preferential relationships with specific other children that persist over time.',
    keyMessage:
      'Cooperative play is brand new and effortful for your child. Social conflicts at this age are learning opportunities, not failures — your job is coach, not referee.',
    dailyTips: [
      'Provide play scenarios that naturally require turn-taking (rolling a ball, taking turns building) rather than explicitly policing sharing.',
      'Use "You can have it when I\'m done" language and model it yourself — it gives both children a framework.',
      'When conflict happens, narrate both perspectives: "You wanted the red car. She wanted it too. That\'s hard."',
    ],
    doList: [
      'Facilitate rather than direct play: stay close, narrate, support when stuck, but let children negotiate first.',
      'Validate the feelings of the child who didn\'t get the toy, not just the child who was wronged.',
      'Acknowledge and name the moments of genuine cooperative play you see — reinforcement is powerful.',
    ],
    dontList: [
      "Don\'t intervene in every conflict — some social problem-solving must happen without adult mediation.",
      "Don\'t make one child always be the one to share/give in — this teaches the wrong lessons to both children.",
      "Don\'t use playtime to teach abstract moral lessons — in-the-moment natural consequences are far more effective.",
    ],
    activities: [
      [
        'Cooperative Simple Games',
        'Simple games that require taking turns (ball rolling, simple card matching) give structure to turn-taking practice without the complexity of free play negotiation.',
        15,
        '2-3 times per week',
      ],
      [
        'Pretend Play Facilitation',
        'Set up a simple pretend scenario (tea party, shop, building site) and let children assign roles and negotiate the narrative. Stay in the background unless things break down.',
        20,
        'several times per week',
      ],
    ],
    topics: [
      {
        key: 'first_friendships',
        patterns: [
          'my child has a best friend at nursery',
          'what do first friendships look like',
          'child preferring one child',
        ],
        response: `The specific preference {{child_name}} is showing for a particular other child is a genuine first friendship — one of the most touching developmental achievements of the third year. These early friendships are based primarily on familiarity, compatible temperament, and shared play style rather than deep mutual understanding, but they are real and valuable.\n\nSupport it: arrange dedicated time with this friend, ask about them by name, and celebrate the relationship. Early friendships teach the most fundamental lessons about relationships: that consistent connection is possible, that someone can know and like you, and that relationships are worth investing in.`,
        boundary: false,
      },
      {
        key: 'cooperative_play_conflicts',
        patterns: [
          'children fighting over toys constantly',
          'how to handle toddler conflicts',
          'my child can\'t share at 2',
        ],
        response: `Conflict at this age is not a sign that something is going wrong in {{child_name}}'s social development — it is the learning laboratory for every adult social skill. The capacity to negotiate, compromise, tolerate frustration, and repair relationships all develops through exactly these conflicts.\n\nYour role is to keep it safe and provide the language: "You both want the same car. What can we do?" Then wait. Let them try. Support without solving. The solutions 2-year-olds come up with are sometimes remarkably creative and always more meaningful than solutions handed to them.`,
        boundary: false,
      },
      {
        key: 'gender_and_play',
        patterns: [
          'my son only wants to play with girls\' toys',
          'daughter won\'t play with dolls',
          'gender in play choices',
        ],
        response: `Children's play preferences across a wide range of toys and styles are completely normal at this age and tell us very little about anything beyond what that individual child finds interesting and enjoyable right now. Play preferences shift frequently between 2 and 5 years and are strongly influenced by what is available and modeled.\n\nThe most developmentally supportive approach is to offer a wide range of play options, follow {{child_name}}'s interests enthusiastically, and avoid communicating that any legitimate form of play is for "wrong" people. Children who feel free to explore a wide range of play types develop broader cognitive and social skills.`,
        boundary: false,
      },
      {
        key: 'social_skills_intervention',
        patterns: [
          'child has no friends at nursery',
          'not interacting with peers',
          'worried about social development',
        ],
        response: `Variation in social readiness at 2–3 years is enormous and mostly temperamental. Some children are naturally more reserved and take longer to warm up; this is not a social deficit. A child who is happily engaged in the environment but takes a long time to approach other children may simply have a slower-to-warm temperament, which is a valid and stable personality trait.\n\nConcerns worth discussing with your pediatrician: {{child_name}} shows no interest at all in watching other children, does not engage even in parallel play, does not point to share interest, or has significantly regressed in social behavior. These are different from simple shyness or slow-to-warm temperament.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'cooperative_play',
        'Engages in simple cooperative play with another child (shared goal, role assignment)',
        30,
        'Have you seen {{child_name}} genuinely playing with (not just next to) another child — with a shared game, roles, or narrative?',
      ],
      [
        'named_friend',
        'Has a specific preferred peer they talk about or seek out',
        28,
        'Does {{child_name}} mention any specific other children by name or show preference for a particular friend?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-24-regression',
        description: 'Significant regression in social skills (was interacting, now isolating), or loss of previously acquired language used socially',
        severity: 'discuss_with_ped',
        pattern: 'stopped interacting with peers|lost social words|social regression',
        action: 'Discuss with pediatrician promptly. Social regression or language loss warrants urgent developmental evaluation.',
        referral: 'Pediatrician / Developmental Pediatrician / Speech-Language Pathologist',
      },
    ],
    coping: {
      normalizations: [
        'Watching your child struggle in social situations — being excluded, losing a conflict, not connecting — is one of parenting\'s more painful experiences. Your discomfort is appropriate.',
        'Your child\'s social struggles are not a reflection of your parenting quality. Social development is highly individual.',
      ],
      strategies: [
        'Debrief social situations calmly after the fact: "That was hard when she took your toy. What could you try next time?" This builds both resilience and social strategy.',
        'Build in regular, familiar play with the same one or two children — familiarity is the biggest predictor of social comfort at this age.',
      ],
      selfCare: [
        'Play date facilitation is genuine work. Keep them short enough that everyone leaves on a positive note.',
        'If you are experiencing significant anxiety about your child\'s social development, speak to your pediatrician — accurate information helps.',
      ],
      partner:
        'Discuss your respective philosophies on conflict intervention beforehand — divergent responses in the moment confuse children and create tension between parents.',
      warnings: [
        'If you find yourself rescuing your child from every social difficulty, this can inadvertently signal that social situations are dangerous. Some struggle is necessary.',
        'If you are comparing your child\'s social development to specific other children in a way that is causing you distress, remember: the range of normal is very wide.',
      ],
    },
    evidence:
      'Howes C, Peer interaction of young children, Monographs SRCD 1988; Dunn J, The Beginnings of Social Understanding, 1988; Ladd GW, Peer relationships and social competence during early and middle childhood, Annual Review Psychology 1999.',
  },

  // ── 3-5 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'Imaginative Play, Best Friends, Exclusion, and Social Rules',
    whatToExpect:
      'Preschool years are the golden age of imaginative play, where social narratives are explored, tested, and refined. Best friendships deepen, but so does the capacity for exclusion — "you can\'t play with us" — which is painful but developmentally expected.',
    keyMessage:
      'Pretend play is the most powerful social learning tool available at this age. Its conflicts — including exclusion — are the curriculum, not the problem.',
    dailyTips: [
      'Enter pretend play as a follower, not a director — ask what role you can play and honor the child\'s scenario.',
      'When {{child_name}} reports being excluded, acknowledge the feeling fully before attempting any problem-solving.',
      'Help {{child_name}} practice social entry phrases: "Can I play? What are you playing?" — these are learnable skills.',
    ],
    doList: [
      'Give pretend play protected, uninterrupted time — it is the primary social development activity at this age.',
      'Read books about friendship conflicts and exclusion, then discuss them — fictional scenarios are less charged than real ones.',
      'Role-play social scenarios that are challenging — being left out, wanting to join, resolving a conflict.',
    ],
    dontList: [
      "Don\'t punish children for excluding — it needs to be addressed, but as a social learning moment, not a moral failing.",
      "Don\'t fix every friendship conflict — support and coach, but let children arrive at their own resolutions where possible.",
      "Don\'t dismiss preschool friendships as not real — they are real, the feelings about them are real, and they matter to your child.",
    ],
    activities: [
      [
        'Story Conflict Role Play',
        'Read a book where a character is left out or has a friendship conflict. Then ask "What could they have said? What could they have done?" Role-play different approaches.',
        15,
        'weekly',
      ],
      [
        'Open-Ended Dramatic Play',
        'Set up a scenario with minimal instructions (a small shop, a pretend kitchen, a building site) and two or three children. Stay out of it. The social negotiation that follows is the development.',
        30,
        '2-3 times per week',
      ],
    ],
    topics: [
      {
        key: 'exclusion_you_cant_play',
        patterns: [
          'child saying you can\'t play with us',
          'my child was excluded at preschool',
          'kids won\'t let my child join',
        ],
        response: `"You can\'t play with us" is one of the most painful phrases a parent hears about their child's experience, and it is also one of the most universal preschool social events. Children at this age are exploring the power of inclusion and exclusion as social tools — they are learning where the boundaries of their social groups are.\n\nFor {{child_name}} when they are excluded: acknowledge the pain first ("That hurt your feelings. You wanted to play and they said no. That's really hard."), then help them decide what to do — find someone else to play with, try a different approach, or talk to a teacher. For {{child_name}} if they are the excluder: name the impact calmly and directly, without shame: "When you say that, she feels left out and sad. We include people here."`,
        boundary: false,
      },
      {
        key: 'imaginative_play_importance',
        patterns: [
          'why is pretend play important',
          'is make believe just playing',
          'my child plays alone in fantasy a lot',
        ],
        response: `Pretend play is not "just playing" — it is the primary vehicle through which preschool children develop theory of mind (understanding what others think and feel), narrative thinking, emotional regulation, and social problem-solving. {{child_name}}'s fantasy play is doing the heavy cognitive lifting of social development.\n\nSolo imaginative play is also valuable — it builds internal narrative, emotional processing, and creativity. A child who plays elaborate solo fantasy scenarios is not socially behind; they are developing a rich internal world that will eventually support more complex social engagement. Both solo and social imaginative play matter.`,
        boundary: false,
      },
      {
        key: 'best_friend_intensity',
        patterns: [
          'only wants to play with one friend',
          'devastated when best friend isn\'t at school',
          'very intense friendship',
        ],
        response: `The intensity of preschool best friendships is real and developmentally important — they are the first experience of a chosen, mutual, specific attachment to a peer, distinct from family. The distress when a best friend is absent is genuine and worth acknowledging.\n\nEncourage the primary friendship while gently expanding {{child_name}}'s social repertoire alongside it: include the best friend in activities while also creating opportunities to play with others. The goal is not to dilute the friendship but to prevent the social risk of having all eggs in one basket if the friendship shifts (which preschool friendships do, frequently).`,
        boundary: false,
      },
      {
        key: 'teaching_social_rules',
        patterns: [
          'how do I teach manners and social rules',
          'child doesn\'t say please or thank you',
          'social greetings at this age',
        ],
        response: `Social rules — greetings, please and thank you, turn-taking, knocking before entering — are best learned through observation and low-pressure practice rather than correction. {{child_name}} is watching everything you do in social situations and absorbing the scripts you use.\n\nModel extensively and explicitly: "I say hello when I arrive somewhere." Prompt gently in the moment without demanding: "What do we say when someone gives us something?" Never shame for forgetting — this is new learning. Acknowledge consistently when they do use the rule correctly, even partially.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'cooperative_narrative_play',
        'Engages in sustained cooperative pretend play with assigned roles and shared narrative',
        42,
        'Does {{child_name}} play elaborate pretend games with other children — with characters, a story, and negotiated roles?',
      ],
      [
        'social_problem_solving',
        'Attempts to verbally resolve a social conflict before escalating to adult',
        48,
        'When {{child_name}} has a conflict with another child, do they try to use words to solve it before coming to you?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-36-persistent_isolation',
        description: 'Consistent preference for solitary play with no interest in peers, or active distress in any social setting, beyond temperamental shyness',
        severity: 'discuss_with_ped',
        pattern: 'never wants to play with other children|panic in social situations|no peer interaction at all at preschool age',
        action: 'Discuss with pediatrician. Distinguish temperamental shyness from social anxiety or developmental concerns.',
        referral: 'Pediatrician / Child Psychologist / Developmental Pediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Hearing that your child excluded or was unkind to another child is genuinely distressing. It does not mean you have raised a bad child — it means they are a preschooler.',
        'The intensity of preschool social dynamics surprises most parents. It matters greatly to children and the feelings are real.',
      ],
      strategies: [
        'Debrief social events at a low-key moment — in the car or at bath time often works better than immediately after.',
        'Build a small, stable peer group through consistent playdates — familiarity is the foundation of social ease at this age.',
      ],
      selfCare: [
        'Your own social anxiety can be inadvertently transmitted to your child through how you talk about social situations. Notice your own patterns.',
        'If preschool friendship dynamics are causing you significant stress, speak to the teacher — they have the broad view and can provide reassurance or flag real concerns.',
      ],
      partner:
        'Ensure both parents respond consistently to exclusion and unkindness — a significant gap between responses creates confusion about the social rules.',
      warnings: [
        'If your child is repeatedly targeted for exclusion or has no friends over months, discuss with the preschool and your pediatrician.',
        'If your child is the consistent excluder or instigator of social cruelty, this pattern warrants early intervention, not waiting.',
      ],
    },
    evidence:
      'Paley VG, You Can\'t Say You Can\'t Play, 1992; Howes C & Matheson CC, Sequences in the development of competent play, Developmental Psychology 1992; Ladd GW, Children\'s Peer Relations and Social Competence, 2005.',
  },

  // ── 5-8 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'Peer Groups, Social Comparison, and Bullying Awareness',
    whatToExpect:
      'School entry reshapes the social world entirely. Peer groups form and carry significant weight. Social comparison accelerates. Children begin to evaluate themselves through the eyes of peers, and bullying — both as target and as perpetrator — enters the picture for many families.',
    keyMessage:
      'Your relationship with your child remains their most important social anchor even as peer influence grows. Stay connected and curious.',
    dailyTips: [
      'Ask open questions about school social life at low-pressure moments: "What was fun today? Who did you sit with at lunch?"',
      'When {{child_name}} reports a social difficulty, listen fully before advising — being heard comes first.',
      'Normalize social ups and downs by sharing your own (age-appropriate) social experiences and how you handled them.',
    ],
    doList: [
      'Know your child\'s friends by name and meet their parents when possible.',
      'Teach the difference between reporting and tattling — one protects someone, the other seeks advantage.',
      'If bullying is suspected, take it seriously immediately and involve the school — early intervention matters.',
    ],
    dontList: [
      "Don't minimize social pain: \"Just ignore them\" rarely works and communicates that the pain isn't real.",
      "Don\'t problem-solve immediately — listen first. Children often need to feel heard before they are ready for solutions.",
      "Don't contact other children's parents directly about social conflicts without involving the school — it usually escalates.",
    ],
    activities: [
      [
        'Social Stories Practice',
        'Role-play common social challenges: "What would you say if someone was mean to you at lunch? What if you saw someone being mean to someone else?" Building scripts in advance helps enormously in-the-moment.',
        15,
        'weekly',
      ],
      [
        'Emotion Conversation Dinner',
        'Once a week at dinner, each family member shares one social/emotional highlight and one difficulty from the week. Normalizes emotional sharing as a family value.',
        10,
        'weekly',
      ],
    ],
    topics: [
      {
        key: 'bullying_vs_conflict',
        patterns: [
          'is my child being bullied',
          'difference between bullying and falling out',
          'child is mean to mine at school',
        ],
        response: `Understanding the difference matters for response: bullying is repeated, intentional, and involves a power imbalance — one child consistently targeting another. A conflict is a mutual disagreement between social equals that happens once or occasionally. Both need attention, but differently.\n\nIf you suspect {{child_name}} is being bullied: document specific incidents (dates, details), talk to their teacher promptly, and keep talking with {{child_name}} daily. Don't tell them to handle it alone — children cannot resolve bullying without adult support. If the school does not act, escalate to the principal. This is a child safety issue.`,
        boundary: false,
      },
      {
        key: 'social_comparison',
        patterns: [
          'child comparing themselves to others',
          'I\'m not as good as him',
          'social comparison and self esteem',
        ],
        response: `Social comparison explodes in the early school years as children gain the cognitive ability to systematically evaluate themselves against peers. This is universal and not something you can prevent — but you can shape how {{child_name}} processes it.\n\nFocus on effort and personal progress ("You ran faster than you did last week") rather than comparison to others. When {{child_name}} makes a downward comparison ("She\'s better than me"), validate the feeling ("It\'s hard to notice that") and then redirect to what they can do: "What do you want to get better at?"`,
        boundary: false,
      },
      {
        key: 'peer_group_belonging',
        patterns: [
          'child has no friends at school',
          'left out of the group',
          'not fitting in',
        ],
        response: `Not finding a social group in the first year or two of school is more common than it looks from the outside, where every child seems to be in a group. Many children take until second or third grade to find their people, especially those with more specific interests or slower-to-warm temperaments.\n\nThings that help: extracurricular activities (a sport, a club, a class) where {{child_name}} meets peers with shared interests; consistent one-on-one playdates rather than trying to break into an existing group; and conversations that help {{child_name}} identify who they most enjoy being around, even if not a formal "friend group" yet.`,
        boundary: false,
      },
      {
        key: 'child_as_bully',
        patterns: [
          'my child is bullying others',
          'school says my child is being mean',
          'child excluding others intentionally',
        ],
        response: `Receiving this news about {{child_name}} is deeply uncomfortable, and it takes real courage to take it seriously rather than defend. Children who bully are often experiencing something they don't have words for — social anxiety, a need for status, exposure to aggression, or a gap in empathy development.\n\nRespond with seriousness and calm: take the school\'s report seriously, talk with {{child_name}} about specific behaviors and their impact (not "you\'re a bully" but "when you did X, Y felt Z"), and involve a school counselor. This is a moment for intervention and support, not shame. Left unaddressed, bullying behavior in middle childhood predicts significant social problems later.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'stable_friendship',
        'Has at least one stable, reciprocal friendship outside family',
        72,
        'Does {{child_name}} have a specific friend they consider close, who also considers them a friend? Do they spend time together outside of school?',
      ],
      [
        'conflict_repair',
        'Able to repair a friendship after a conflict — apologize genuinely or accept an apology',
        84,
        'Have you seen {{child_name}} navigate a friendship conflict and come out the other side — through an apology, a conversation, or just reconnecting?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-60-chronic_victimization',
        description: 'Chronic social exclusion or victimization affecting school attendance, mood, or self-worth over more than a few weeks',
        severity: 'discuss_with_ped',
        pattern: 'refusing to go to school over social issues|chronic exclusion for months|says no one likes them persistently',
        action: 'Discuss with pediatrician and school counselor. Chronic social victimization can have lasting mental health effects and warrants active intervention.',
        referral: 'Pediatrician / School Counselor / Child Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'The social pain of the early school years is felt by almost every child at some point. You are not watching a unique failure — you are watching universal development.',
        'Wanting to fix every social problem for your child is a powerful parental impulse. Resisting it enough to let them build skills is genuinely hard.',
      ],
      strategies: [
        'Maintain the daily connection ritual — however brief — so {{child_name}} knows there is always a safe place to bring social difficulties.',
        'Know the names of their friends and enemies equally — the social world of your child matters and your interest in it matters to them.',
      ],
      selfCare: [
        'Your own social anxiety or painful school memories can be triggered by your child\'s social struggles. Notice this and keep it separate where possible.',
        'If your child\'s social situation is significantly affecting your own mood or functioning, speak to someone — a friend, a counselor, your own doctor.',
      ],
      partner:
        'Compare notes on what {{child_name}} is sharing with each of you — children sometimes tell each parent different pieces of the social story.',
      warnings: [
        'If school refusal is developing around social fear, address this promptly with the school and your pediatrician — it becomes harder to address the longer it continues.',
        'If you are seeing significant changes in {{child_name}}\'s mood, sleep, or appetite alongside social difficulties, seek a pediatric assessment.',
      ],
    },
    evidence:
      'Olweus D, Bullying at School, 1993; Rubin KH et al., Peer Interactions and Social Competence, Handbook Child Psychology 2006; Nolen-Hoeksema S, Emotion regulation in middle childhood, Child Development Perspectives 2012.',
  },

  // ── 8-12 years ──────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Cliques, Hierarchies, Peer Pressure, and Online Dynamics',
    whatToExpect:
      'Middle childhood social life becomes highly organized and hierarchical — cliques form, social status matters intensely, peer pressure appears, and for many children, online social life begins to mirror and complicate in-person relationships.',
    keyMessage:
      'Peer relationships are the primary social developmental task of middle childhood. Stay connected and keep talking — your influence matters more than it seems from the outside.',
    dailyTips: [
      'Keep the daily connection point — even a brief car conversation or a shared TV show — as an ongoing investment in trust.',
      'Ask about online friendships with the same interest as offline ones — they are real and equally important to your child.',
      'When {{child_name}} faces peer pressure, debrief afterward rather than lecturing beforehand — curiosity keeps the conversation alive.',
    ],
    doList: [
      'Know your child\'s online social world — not as surveillance, but as genuine interest and as a parent with responsibility.',
      'Teach and regularly revisit the concept of peer pressure and how to handle it — this is a skill set that needs rehearsal.',
      'Maintain family rituals that keep you connected even as peer relationships intensify.',
    ],
    dontList: [
      "Don\'t dismiss social media or online relationships as less real — for this age group, they can be the primary social channel.",
      "Don\'t try to manage every peer relationship — guide, but let {{child_name}} navigate with support.",
      "Don\'t react with alarm to normal clique behavior — it is painful but it is how social hierarchies are practiced.",
    ],
    activities: [
      [
        'Online Safety Conversation',
        'A regular, calm conversation about online social dynamics: "Has anything weird happened online this week? Has anyone said anything that felt off?" Not a lecture, a check-in.',
        10,
        'weekly',
      ],
      [
        'Peer Pressure Script Practice',
        'Role-play specific peer pressure scenarios with easy exit lines: "Nah, I\'m good." "I told my parents I\'d be home." "Not my thing." Practiced scripts work better than principles when the pressure is on.',
        15,
        'monthly',
      ],
    ],
    topics: [
      {
        key: 'cliques_social_hierarchies',
        patterns: [
          'my child is obsessed with being popular',
          'cliques are making my child miserable',
          'social hierarchy at middle school',
        ],
        response: `The intense social hierarchies of middle childhood are painful to watch — the exclusions, the status games, the way a child's entire emotional wellbeing can turn on their social standing that week. This is universal, not unique to your child or their school.\n\nHelp {{child_name}} develop a sense of identity and value that is not entirely dependent on peer approval — interests, skills, family belonging. This is a long-term project, not a crisis fix. When the clique drama is acute, mostly listen. When {{child_name}} is calmer, help them reflect on what kind of friend they want to be and be with.`,
        boundary: false,
      },
      {
        key: 'peer_pressure',
        patterns: [
          'child doing things to fit in',
          'peer pressure starting',
          'my child changed their behavior for friends',
        ],
        response: `Peer pressure becomes a significant force in middle childhood and will intensify through adolescence. {{child_name}} is developmentally wired to care more about peer approval now than they did before — this is not weakness or bad character, it is the social brain doing exactly what it is programmed to do.\n\nThe most effective preparation is rehearsal of specific scripts and situations. Generic "just say no" advice does not work under real social pressure. Help {{child_name}} identify their values, practice exit lines for specific scenarios, and establish that some situations are automatic "call home" situations with no questions asked. Keep the relationship open so they can come to you when they are stuck.`,
        boundary: false,
      },
      {
        key: 'online_social_dynamics',
        patterns: [
          'child upset about something online',
          'group chat drama',
          'online friendship falling out',
        ],
        response: `Online social dynamics amplify everything about in-person social dynamics and add the features of permanence, audience, and 24/7 availability. A conflict that would have lasted one afternoon in the schoolyard can now run for days across multiple platforms, with screenshots and witnesses.\n\nApproach online conflict with the same seriousness as in-person conflict, not more and not less. Help {{child_name}} understand that what goes online stays online, that audience size changes the emotional stakes, and that the best response to online drama is often to step away. If bullying or harmful content is involved, document it and involve the school and platform.`,
        boundary: false,
      },
      {
        key: 'cyberbullying',
        patterns: [
          'my child is being cyberbullied',
          'mean texts from classmates',
          'online harassment at school age',
        ],
        response: `Cyberbullying is serious, common, and requires adult action — it does not resolve itself. If {{child_name}} is being harassed or bullied online, take immediate steps: screenshot and document everything, report to the platform, block the individuals involved, and involve the school.\n\nSome children feel intense shame about cyberbullying — either as targets or as witnesses who didn't intervene. Reassure {{child_name}} that they have done nothing wrong by being targeted, and that coming to you was the right choice. If the bullying is severe or persistent, or if it is affecting {{child_name}}'s mood or attendance significantly, seek support from a school counselor or child psychologist promptly.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'navigates_conflict_independently',
        'Handles a peer conflict with minimal adult intervention, reaching a resolution',
        108,
        'Can {{child_name}} describe a time they handled a friendship problem largely on their own? What did they do?',
      ],
      [
        'values_based_choices',
        'Makes at least some social choices based on own values rather than peer approval alone',
        132,
        'Have you noticed {{child_name}} making a social choice that went against the group — staying out of something, standing up for someone, or choosing a different activity?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-96-isolation',
        description: 'Progressive social withdrawal, loss of all friendships, or development of significant social anxiety affecting school or daily function',
        severity: 'discuss_with_ped',
        pattern: 'no friends left|refusing social situations entirely|significant social anxiety middle school',
        action: 'Discuss with pediatrician. Progressive social withdrawal warrants evaluation for depression, anxiety, or other concerns.',
        referral: 'Pediatrician / Child Psychologist / School Counselor',
      },
    ],
    coping: {
      normalizations: [
        'Middle childhood social pain is often the worst of any developmental stage — the stakes feel enormous to children and the tools they have are limited.',
        'Watching your child navigate social hierarchies without intervening requires real restraint. Trusting the process while staying available is genuinely hard.',
      ],
      strategies: [
        'Make yourself a safe, non-reactive audience for social debriefs — if your child knows you won\'t panic or immediately intervene, they will tell you more.',
        'Find parallel activities where your child spends time with people across different age groups — this reduces the total dependence on single-age peer approval.',
      ],
      selfCare: [
        'Your own middle-school social memories may be reactivated by your child\'s experiences. Keeping these separate — and not projecting — takes conscious effort.',
        'If the social dynamics your child is navigating are causing you significant distress or flashbacks, speaking to your own therapist is genuinely appropriate.',
      ],
      partner:
        'Share what each parent knows about the social world — children tell different things to different parents. Pooling information keeps the picture clear.',
      warnings: [
        'If you notice {{child_name}} hiding device use, clearing history, or being secretive in ways that feel different from normal privacy, have a direct conversation.',
        'If your child\'s mood has significantly changed alongside social difficulties, seek a pediatric assessment — don\'t wait to see if it resolves.',
      ],
    },
    evidence:
      'Adler PA & Adler P, Peer Power: Preadolescent Culture and Identity, 1998; Lenhart A et al., Teens, kindness and cruelty on social network sites, Pew Research 2011; Espelage DL & Swearer SM, Bullying in American Schools, 2004.',
  },

  // ── 12-15 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'Identity Through Peers, Social Media, and Romantic Interests',
    whatToExpect:
      'Early adolescence is when peer relationships become the primary site of identity formation. Social media is no longer peripheral — it is the main social infrastructure. Romantic interests emerge, bringing new intensities, social risks, and developmental tasks.',
    keyMessage:
      'Your teenager is not replacing you with peers — they are using peer relationships to build an identity. Stay connected and curious rather than competing.',
    dailyTips: [
      'Express genuine interest in who your teenager\'s friends are rather than evaluating whether you approve — curious questions open doors that evaluative ones close.',
      'Don\'t dismiss social media drama as trivial — ask about it with real interest. To your teenager, it is genuinely significant.',
      'Establish that you are a no-judgment safe haven for romantic questions — even if your own discomfort makes it hard.',
    ],
    doList: [
      'Keep the family connection rituals even as they become harder — shared meals, car conversations, a brief daily check-in.',
      'Know your teenager\'s social media platforms, even if you don\'t monitor them closely — knowing they exist matters.',
      'When your teenager has a romantic crush or early relationship, respond with warmth and lightness rather than alarm.',
    ],
    dontList: [
      "Don\'t try to compete with or replace peer relationships — they are developmentally appropriate and necessary.",
      "Don\'t interrogate after social events in ways that feel like surveillance — curiosity and surveillance feel different to teenagers.",
      "Don\'t dismiss romantic feelings as \"too young\" or \"just a phase\" — the feelings are real and dismissal closes communication.",
    ],
    activities: [
      [
        'Social Media Audit Together',
        'Occasionally look at a social platform together with your teenager as a curious co-explorer rather than an inspector. Ask them to show you what they find interesting, funny, or confusing.',
        20,
        'monthly',
      ],
      [
        'Relationship Values Conversation',
        'A low-key conversation about what makes a good friendship or relationship: "What do you think makes someone a good friend? What would a relationship need to feel healthy?" Not a lecture — a conversation.',
        15,
        'a few times per year',
      ],
    ],
    topics: [
      {
        key: 'social_media_mental_health',
        patterns: [
          'social media making my teenager anxious',
          'Instagram affecting self esteem',
          'teenager always on phone',
        ],
        response: `The relationship between social media and adolescent mental health is real and nuanced. Heavy use of social comparison platforms (Instagram, TikTok in passive browsing mode) is associated with lower self-esteem and higher anxiety, particularly in girls aged 11–15. But social media is also how {{child_name}} maintains their social life — total prohibition creates social isolation.\n\nA more effective approach than banning: help {{child_name}} understand the mechanics of social media curation (everyone posts their highlight reel), monitor how they feel after different types of use, and build awareness of passive scrolling versus active social connection. Time limits on social comparison apps, combined with keeping social communication open, is more sustainable than prohibition.`,
        boundary: false,
      },
      {
        key: 'romantic_interests_early_teen',
        patterns: [
          'my 13 year old has a boyfriend',
          'teenage crush',
          'romantic relationship at 12',
        ],
        response: `Romantic interest emerging at 12–14 is completely developmentally normal — the same brain changes driving the circadian shift are also activating social-romantic circuitry. This is not premature; it is on schedule.\n\nYour job is to stay in the conversation: respond to romantic news with warmth and curiosity ("Tell me about them — what do you like about them?") rather than alarm. Families where parents are open and non-judgmental about early romantic feelings have teenagers who are more likely to come to them about harder things later. Keep the door open, set the example of how relationships should feel, and save the big conversations (consent, safety, pressure) for a calm moment when trust is established.`,
        boundary: false,
      },
      {
        key: 'identity_and_peer_groups',
        patterns: [
          'teenager changed completely since new friends',
          'don\'t recognize my child anymore',
          'peer group is changing who they are',
        ],
        response: `The transformation you are witnessing is developmentally expected and in many ways encouraging: {{child_name}} is doing the central work of early adolescence, which is building an identity that is distinct from family and verified by peers. It looks like loss because they are putting some distance from who they were as a child — that is the point.\n\nThe question to ask is whether the changes are about exploration (new interests, new styles, new language) or about genuine risk (dangerous behavior, complete withdrawal from family, significant decline in mood or functioning). The former is normal adolescent identity work; the latter warrants more active engagement and possibly professional support.`,
        boundary: false,
      },
      {
        key: 'lgbtq_social_concerns',
        patterns: [
          'teenager may be gay',
          'questioning gender or sexuality',
          'teenager coming out',
        ],
        response: `If {{child_name}} is exploring or sharing questions about their sexual orientation or gender identity, this is a moment that requires your warmest, most open response. Research is unambiguous: LGBTQ+ young people whose families respond with acceptance have dramatically better mental health outcomes than those who face rejection or dismissal.\n\nYou don't need to have all the answers or fully understand everything right now. What matters most is communicating unconditional love and openness: "Thank you for trusting me with this. I love you and I want to understand." If you have your own processing to do, do it with an adult — a counselor or trusted friend — not with your teenager. Their wellbeing must come first.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'stable_peer_identity',
        'Has a stable peer group that provides genuine belonging and support',
        156,
        'Does {{child_name}} have a group or at least one or two close friends where they genuinely feel they belong and are known?',
      ],
      [
        'healthy_romantic_understanding',
        'Can describe what a healthy relationship looks like and applies this to own romantic interest',
        168,
        'Has {{child_name}} expressed any views about what they want in a relationship, or been able to reflect on whether their current crush treats them well?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-144-social_anxiety',
        description: 'Significant social anxiety or social withdrawal affecting school attendance, peer relationships, or daily functioning for more than a month',
        severity: 'discuss_with_ped',
        pattern: 'refusing school for social reasons|no peer relationships at all|debilitating social anxiety',
        action: 'Discuss with pediatrician. Significant social anxiety in adolescence responds well to CBT and warrants prompt evaluation.',
        referral: 'Pediatrician / Adolescent Psychiatrist / Psychologist',
      },
    ],
    coping: {
      normalizations: [
        'Feeling sidelined by your teenager\'s peer world is almost universal in early adolescence. This is healthy development, not rejection.',
        'Being on the outside of your teenager\'s social world is appropriate — they need space to develop their own identity. Your job is to keep the connection alive, not to stay at the center.',
      ],
      strategies: [
        'Find the low-key connection that works for your teenager — car rides, shared shows, casual activities — and invest in those rather than trying to have formal conversations.',
        'Respond to whatever they share with curiosity, not evaluation — the goal is to stay in the information loop.',
      ],
      selfCare: [
        'Your sense of loss as your teenager pulls away is real and normal. Process it with your own support network, not with your teenager.',
        'If your relationship with your teenager feels significantly broken rather than just distant, family therapy is a reasonable and effective step.',
      ],
      partner:
        'Share what each of you knows about your teenager\'s social world and align on which issues are safety concerns versus normal adolescent privacy.',
      warnings: [
        'If your teenager has no peer relationships at all and is not distressed by this, or if they are engaging intensely with adults online in ways that feel unsafe, seek professional guidance immediately.',
        'If romantic relationships are involving pressure, control, or harm, treat this as a safety issue and seek support from a school counselor and pediatrician.',
      ],
    },
    evidence:
      'Steinberg L, Age of Opportunity: Lessons from the New Science of Adolescence, 2014; Twenge JM et al., Increases in depressive symptoms in US adolescents, Clinical Psychological Science 2018; Ryan C et al., Family acceptance and adolescent health, Pediatrics 2010.',
  },

  // ── 15-18 years ─────────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Deep Friendships, Romantic Relationships, Independence, and Identity',
    whatToExpect:
      'Late adolescence is when peer relationships reach their greatest depth and complexity — friendships become truly mutual and intimate, romantic relationships mature in scope and intensity, and the social self becomes increasingly distinct from family identity.',
    keyMessage:
      'The peer relationships your teenager builds now are rehearsals for adult intimacy, friendship, and community. Your role is coach and safe harbor, not manager.',
    dailyTips: [
      'Keep one non-negotiable connection point per week — even a brief one — that is just about being together, not talking about problems.',
      'When you meet your teenager\'s friends and partners, be genuinely warm and welcoming — they need to see you as someone their world can include.',
      'Model healthy relationship dynamics in your own life — your teenager is watching how adults handle conflict, intimacy, and friendship.',
    ],
    doList: [
      'Have explicit, non-preachy conversations about consent, healthy relationship dynamics, and what to do if a relationship feels unsafe.',
      'Know your teenager\'s significant friends and partner (if any) — this keeps you in the social loop and signals you take their relationships seriously.',
      'When your teenager comes to you with a relationship problem, lead with empathy before advice.',
    ],
    dontList: [
      "Don\'t try to veto normal, healthy relationships — it drives them underground and damages your relationship.",
      "Don\'t compare your teenager\'s social life to yours at their age or to their siblings\' — each adolescent develops their own social path.",
      "Don\'t treat romantic relationships as a phase to be managed away — they are central developmental experiences.",
    ],
    activities: [
      [
        'Relationship Check-In',
        'A low-key, regular check-in about how their important relationships are going: "How\'s it going with [friend/partner]? Anything you want to think through?" Not an interrogation, an open door.',
        10,
        'monthly',
      ],
      [
        'Independence Planning',
        'Help your teenager plan for a significant independent social experience — a trip with friends, a social event they organize. Supported independence builds social confidence better than supervised socializing.',
        30,
        'several times per year',
      ],
    ],
    topics: [
      {
        key: 'romantic_relationships_late_teen',
        patterns: [
          'teenager in serious relationship',
          'my 16 year old has a girlfriend',
          'how to talk about teen relationships',
        ],
        response: `Serious romantic relationships in late adolescence are developmentally significant — they are practicing the full repertoire of adult intimacy skills: communication, conflict resolution, vulnerability, commitment, and eventually, healthy separation. These relationships matter, and their outcomes — healthy or not — leave lasting templates.\n\nYour most important contributions: a genuine relationship with your teenager so they will come to you if something feels wrong; explicit, non-judgmental conversations about what healthy relationships look and feel like; and clear communication about consent, safety, and your household values. You do not manage these relationships, but you remain a crucial anchor.`,
        boundary: false,
      },
      {
        key: 'friendship_depth',
        patterns: [
          'teenager has very intense friendships',
          'best friend is everything to my teen',
          'deep friendships in adolescence',
        ],
        response: `The deep, intimate friendships of late adolescence are one of the most psychologically valuable experiences of this developmental period. A teenager who has at least one friendship of genuine mutual knowing and trust has a significant protective factor for their mental health.\n\nThese friendships are supposed to be intense — they are the blueprint for adult intimacy. If the friendship seems to be replacing all family connection or is involving unhealthy dynamics (constant drama, one-sided sacrifice, control), it is worth a gentle, curious conversation. But intensity alone is not a warning sign — it is the appropriate pitch of adolescent social life.`,
        boundary: false,
      },
      {
        key: 'independence_social',
        patterns: [
          'teenager wants to go out without me',
          'how much independence for 16 year old',
          'letting go socially',
        ],
        response: `The expansion of social independence in late adolescence is necessary, even when it is hard to watch. {{child_name}} needs increasing amounts of unmonitored social experience to develop the judgment and self-regulation that will carry them into adulthood. Managed gradually, this works. Kept too tight, it often produces either an underconfident young adult or a significant rupture.\n\nA useful framework: negotiate independence in exchange for communication. "You can go to the party. I need to know where you are, have you check in once during the evening, and know your plan for getting home safely." This maintains connection without surveillance and teaches accountability without control.`,
        boundary: false,
      },
      {
        key: 'unhealthy_relationship',
        patterns: [
          'teenager in unhealthy relationship',
          'partner is controlling my teenager',
          'worried about my teenager\'s relationship',
        ],
        response: `If you are seeing signs of an unhealthy relationship — controlling behavior, isolation from friends and family, mood changes linked to the partner, dismissiveness of your teenager\'s needs — take this seriously and act thoughtfully. Direct confrontation and ultimatums often backfire, driving the relationship underground.\n\nAn effective approach: maintain your connection with {{child_name}} and name what you observe without attacking the partner ("I notice you seem anxious when they don't reply"). Keep the relationship with you warm and non-conditional. If you see evidence of emotional, physical, or sexual harm, involve a professional — school counselor, pediatrician, or local support services. This is a safety issue that warrants more than careful parental management.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'intimate_friendship',
        'Has at least one friendship characterized by mutual trust, vulnerability, and genuine knowing',
        192,
        'Does {{child_name}} have a friend who they really trust — who knows them well and whose friendship feels mutual? Do they describe it that way?',
      ],
      [
        'healthy_relationship_framework',
        'Can articulate what a healthy relationship looks and feels like and applies this evaluation to their own relationships',
        204,
        'Has {{child_name}} ever reflected on whether their friendships or romantic relationships are healthy? Do they seem to have a framework for this?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-social-180-relationship-harm',
        description: 'Evidence of a controlling, coercive, or abusive relationship — either as target or perpetrator',
        severity: 'urgent_referral',
        pattern: 'controlling partner|evidence of relationship abuse|teenager being isolated by partner',
        action: 'Seek support from school counselor, pediatrician, or local relationship support services. Do not try to manage alone. This is a safety matter.',
        referral: 'Pediatrician / School Counselor / Adolescent Mental Health / Domestic Violence Support Services',
      },
    ],
    coping: {
      normalizations: [
        'Watching your teenager build a social and romantic world that increasingly does not include you is developmentally correct and still genuinely hard.',
        'Letting go of control over your teenager\'s social life while maintaining genuine connection is one of the most complex parenting tasks of the whole journey.',
      ],
      strategies: [
        'Invest in the low-key regular connection — shared meals, car trips, a brief daily greeting — rather than trying to have big conversations.',
        'When your teenager makes a social decision you disagree with, ask yourself: is this a safety issue or a preference issue? Only fight the safety battles.',
      ],
      selfCare: [
        'The transition to a less central role in your teenager\'s life can trigger its own grief process. This is worth naming and working through with your own support.',
        'Your own relationship quality and social life matter at this stage — modeling healthy adult relationships is parenting.',
      ],
      partner:
        'Align on which social concerns are safety issues that warrant direct action and which are autonomy issues where you provide guidance and step back.',
      warnings: [
        'If your teenager is completely secretive about all social relationships and also showing significant mood changes or behavior changes, seek professional support.',
        'If you are struggling significantly with letting go of control over your teenager\'s social life, explore this with a counselor — it affects your relationship with them.',
      ],
    },
    evidence:
      'Arnett JJ, Adolescence and Emerging Adulthood, 2018; Collins WA, More than myth: The developmental significance of romantic relationships in adolescence, Journal of Research on Adolescence 2003; Lerner RM & Steinberg L, Handbook of Adolescent Psychology, 2009.',
  },
]
