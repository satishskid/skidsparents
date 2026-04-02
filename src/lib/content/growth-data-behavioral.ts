import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 0 – 3 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '0-3mo',
    ageMin: 0,
    ageMax: 3,
    title: 'Reflexive Beginnings: Understanding Newborn Behaviour',
    whatToExpect:
      'All newborn behaviour is reflexive or need-driven in the first weeks — there is no intentional behaviour, no defiance, no manipulation. Your baby roots, sucks, grasps, startles, and cries as a direct expression of biological programming. The first signs of self-soothing — thumb or fist to mouth, turning away from overstimulation — emerge as early as week 2 to 4 and represent the nervous system beginning to regulate itself.',
    keyMessage:
      'Newborn behaviour is pure communication — there is no manipulation, only need.',
    dailyTips: [
      'Learn to recognise pre-cry cues (rooting, hand-to-mouth, turning away) so you can respond before full escalation.',
      'Allow and support self-soothing attempts — if your baby brings their hand to their mouth, this is healthy, help them succeed.',
      'Respond to reflexive behaviours (startles, crying) consistently and promptly to build neurological security.',
    ],
    doList: [
      'Recognise that sleep cycles of 45–90 minutes are biological, not behavioural — night waking is normal at this age.',
      'Respond to rooting and sucking cues promptly to support feeding regulation.',
      'Create predictable sensory environments — consistent sounds, smells, and touch are soothing to the undeveloped nervous system.',
    ],
    dontList: [
      'Don\'t interpret crying as "bad behaviour" — it is the only available communication channel.',
      'Don\'t try to impose adult sleep schedules or feeding schedules before the nervous system is ready, typically before 3 months.',
      'Don\'t over-stimulate with rapid movements, loud sounds, or too many people at once — the sensory system saturates quickly.',
    ],
    activities: [
      [
        'Supported Self-Soothing',
        'When your baby brings their hand towards their mouth, gently guide it there and hold it in place. You are supporting an emerging self-regulation behaviour that the nervous system is just beginning to practice. Over weeks this becomes more autonomous. Narrate it: "You\'re finding your hand — that helps you feel better."',
        5,
        'Whenever self-soothing attempts are observed',
      ],
      [
        'Predictable Stimulus Sequence',
        'Before sleep, create the same brief sensory sequence every time: dim light, same soft sound or voice, gentle swaddle or hold. Repetition over days and weeks begins to condition the nervous system to associate this sequence with rest. This is the earliest form of behavioural scheduling — stimulus association, not willpower.',
        10,
        'Before every sleep — day and night',
      ],
    ],
    topics: [
      {
        key: 'manipulative_crying',
        patterns: [
          'I\'ve been told I\'m teaching {{child_name}} to manipulate me by picking them up',
          'is {{child_name}} trying to control me with crying',
          'my family says I\'m creating bad habits by responding every time',
        ],
        response:
          'Manipulation requires two cognitive abilities that a newborn does not yet possess: theory of mind (understanding that another person has a separate internal state) and intentional deception (deliberately producing behaviour to achieve a predicted effect in another person). Neither of these is remotely available before 12–18 months at the earliest. When {{child_name}} cries, they are reporting a state of need or distress — there is no strategic intent.\n\nThe "bad habit" concern is also not supported by developmental research. Studies consistently show that prompt, sensitive responding to infant crying produces more securely attached, more independent toddlers — not more demanding ones. The attachment system is built by responsive caregiving, and a well-built attachment system is the basis for later emotional and behavioural regulation. Your instinct to respond is correct.',
      },
      {
        key: 'routine_too_early',
        patterns: [
          'should I be putting {{child_name}} on a schedule already',
          'everyone says routine is important but {{child_name}} won\'t follow one',
          'when can I start a feed and sleep schedule',
        ],
        response:
          'The developmental readiness for a predictable schedule emerges gradually over the first 3–4 months as circadian rhythms consolidate. A newborn\'s feeding and sleep cycles are driven by hunger signals, developmental stage, and gut capacity — all of which change week by week. Imposing rigid timing before this readiness can interfere with milk supply (for breastfeeding parents) and with {{child_name}}\'s early experience of need-response matching.\n\nWhat you can do from week one is build consistency of environment and sequence (same pre-sleep cues, same feeding positions, same soothing approach) which is the precursor to a schedule without the rigidity that causes distress at this age. By 10–12 weeks many babies begin to show natural patterns that can be gently supported into a more predictable rhythm.',
      },
      {
        key: 'too_much_holding',
        patterns: [
          'am I holding {{child_name}} too much',
          'will {{child_name}} become unable to sleep alone if I always hold them',
          'my mother says I\'ll never get {{child_name}} out of my arms',
        ],
        response:
          'The developmental need for physical contact and carrying in the first three months is genuinely high — human infants are among the most contact-dependent mammals at birth, and proximity to a caregiver regulates heart rate, temperature, cortisol, and breathing. The instinct to hold {{child_name}} is well-calibrated to {{child_name}}\'s biological needs.\n\nIndependence is not built by withdrawing contact early — it is built by providing a secure base from which {{child_name}} eventually ventures out. A baby who is held consistently does not become permanently dependent; they build the internal security that makes later independence possible. Transitions to independent sleep can be introduced gently in the 3–6 month window when the nervous system is more capable of self-regulation.',
        boundary: true,
      },
      {
        key: 'sleep_behaviour',
        patterns: [
          '{{child_name}} only sleeps on me or in my arms',
          'I can\'t put {{child_name}} down without them waking',
          'how do I teach {{child_name}} to sleep in their cot',
        ],
        response:
          'Contact sleeping and the inability to transfer to a flat surface is nearly universal in newborns and reflects both the need for physical warmth and regulation, and the fact that the arc of a caring adult\'s body approximates the sensory environment of the womb. This is not a trained behaviour that needs untraining — it is a developmental stage that changes as {{child_name}}\'s nervous system matures.\n\nBefore 12 weeks, the most important safety consideration is where {{child_name}} sleeps — not training them to sleep independently. A safe sleep surface that has been warmed, a swaddle that mimics gentle containment, and a transfer when {{child_name}} is in the deeper phase of sleep (relaxed muscles, no eye movement) all improve transfer success. Cot sleep independence can be gently introduced between 3 and 6 months. For now, safe contact sleep options are more appropriate than sleep training.',
      },
    ],
    milestones: [
      [
        'beh-0-hand-to-mouth',
        'Brings hand or fist to mouth as a self-soothing attempt — the earliest observable self-regulation behaviour',
        2,
        'Have you noticed {{child_name}} bringing their hand towards their mouth when unsettled or between feeds?',
      ],
      [
        'beh-0-gaze-aversion',
        'Turns head or gaze away when overstimulated — the earliest behavioural self-regulation response to overwhelm',
        1,
        'When {{child_name}} is being interacted with and reaches an input limit, do they turn away from the stimulus — looking away, closing eyes, or turning their head?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-0-inconsolable',
        description:
          'Consistently inconsolable crying lasting more than 3 hours per day, more than 3 days per week, for more than 3 weeks (colic definition) — especially if accompanied by arching, difficulty feeding, or blood in stool',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} has regular inconsolable crying episodes that do not respond to any soothing technique, that occur at similar times each day, and that are causing significant family distress',
        action:
          'Raise at paediatric visit. Rule out GERD, milk protein allergy, tongue tie, and other physiological causes before attributing to colic. Document timing, duration, and any associated symptoms.',
        referral: 'Paediatrician — consider lactation consultant and paediatric GI if feeding difficulties co-exist',
      },
    ],
    coping: {
      normalizations: [
        'The experience of being unable to leave your baby without tears or to put them down without waking is almost universal in the newborn period — you are not doing something wrong.',
        'Well-meaning advice from the previous generation about schedules, independence, and "not spoiling" is frequently at odds with current developmental evidence — you are not obliged to follow guidance that conflicts with what your paediatrician recommends.',
      ],
      strategies: [
        'Distribute the physical carrying load across any available adults — both for your own physical recovery and for {{child_name}}\'s benefit of multiple regulatory relationships.',
        'Use a safe carrier or sling if carrying is the only way {{child_name}} settles — this frees your hands without abandoning the contact {{child_name}} needs.',
      ],
      selfCare: [
        'Physical recovery from birth, combined with the demands of a newborn, is genuinely extreme — ask for and accept practical help so that your own recovery is not entirely sacrificed.',
        'Sleep when {{child_name}} sleeps wherever this is possible — sleep debt is a genuine physiological state with real effects on emotional regulation and decision-making.',
      ],
      partner:
        'The behavioural demands of a newborn are easier to sustain when divided clearly — specific shifts, specific responsibilities, and explicit check-ins about who is most depleted are more effective than the assumption that the most capable person will manage.',
      warnings: [
        'If physical exhaustion is making it unsafe to care for {{child_name}} — difficulty staying awake during feeding, difficulty holding {{child_name}} safely — this is a safety issue, not a parenting failure. Seek help immediately.',
        'Shaken baby syndrome occurs most commonly during extended inconsolable crying when a caregiver reaches the end of their resources. If you feel close to this point, place {{child_name}} safely in their cot and step away for 5–10 minutes.',
      ],
    },
    evidence:
      'Brazelton (1962) Crying in infancy, Pediatrics; Hunziker & Barr (1986) Increased carrying reduces infant crying, Pediatrics; Kirjavainen et al. (2004) Sleep and development in infants, Early Human Development; AAP (2022) Safe Sleep Policy Statement; Feldman et al. (2010) Skin-to-skin contact and neurobehavioural outcomes, Biological Psychiatry.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3 – 6 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '3-6mo',
    ageMin: 3,
    ageMax: 6,
    title: 'Intentional Reaching: The Birth of Cause-and-Effect Behaviour',
    whatToExpect:
      'Between 3 and 6 months a profound shift occurs: {{child_name}}\'s behaviour becomes intentional. Reaching for a toy, batting at a hanging object, vocalising to get your attention — these are not reflexes but goal-directed actions. The discovery that "I can make things happen" is one of the most important cognitive-behavioural milestones of infancy and the beginning of agency.',
    keyMessage:
      'Every time {{child_name}} reaches and succeeds, they are learning "I have power in this world" — that is foundational.',
    dailyTips: [
      'Place toys just within reach to motivate intentional reaching rather than handing them directly.',
      'Respond consistently to {{child_name}}\'s vocal bids for attention — this teaches the social rule that communication has effect.',
      'Allow {{child_name}} to kick, reach, and manipulate objects freely during floor time — movement and agency are connected.',
    ],
    doList: [
      'Provide safe objects that respond to {{child_name}}\'s actions — rattles that make noise, crinkle toys, faces that react.',
      'Follow {{child_name}}\'s lead in play — let them direct what is interesting rather than always directing from your end.',
      'Celebrate successful reaches and cause-effect discoveries with enthusiastic response.',
    ],
    dontList: [
      'Don\'t over-assist — if {{child_name}} is working towards a toy, allow the effort rather than handing it over immediately.',
      'Don\'t use screens as a primary interaction tool at this age — they do not respond to {{child_name}}\'s actions and provide no cause-effect learning.',
      'Don\'t restrict floor time and movement — physical agency and behavioural agency develop together.',
    ],
    activities: [
      [
        'Cause-and-Effect Toy Play',
        'Sit {{child_name}} supported on your lap or on the floor with a toy that responds to touch — a rattle, a squeaky toy, a toy that lights up. Let {{child_name}} discover what makes it respond. When they succeed, show delight. When they lose the thread, guide their hand gently and let them feel the effect again. This is intentionality training.',
        10,
        'Daily during alert floor time',
      ],
      [
        'Social Cause-and-Effect',
        'Play a simple game where {{child_name}}\'s vocalisation or movement produces a consistent response from you — a tickle when they kick, a funny noise when they vocalise, a peek-a-boo when they reach out. Repeat the sequence predictably. This builds the understanding that social behaviour produces social effect — the foundation of communication and social regulation.',
        8,
        'Daily during interactive play windows',
      ],
    ],
    topics: [
      {
        key: 'object_reaching',
        patterns: [
          '{{child_name}} is starting to grab everything',
          'how do I support {{child_name}}\'s reaching and grabbing',
          'when should {{child_name}} start reaching for things intentionally',
        ],
        response:
          'The emergence of intentional reaching, typically between 3 and 5 months, is one of the most significant behavioural milestones of infancy and represents {{child_name}}\'s first experience of agency — "I decided to do something, and it happened." This discovery will reshape {{child_name}}\'s entire relationship with the world, so it deserves your full encouragement.\n\nThe best thing you can do is create rich opportunities for intentional reaching and manipulation: floor time with a variety of textures and responsive objects, hanging toys at reaching height, and crucially — allowing the effort of reaching rather than moving everything within easy grasp. The brief frustration of almost-reaching is motivating and developmentally valuable. Hold back your helpful instinct just long enough for {{child_name}} to experience the attempt.',
      },
      {
        key: 'grabbing_and_mouthing',
        patterns: [
          '{{child_name}} puts everything in their mouth',
          'should I stop {{child_name}} mouthing objects',
          '{{child_name}} grabs my glasses, my food, my hair constantly',
        ],
        response:
          'Mouthing objects is the primary sensory exploration method of infancy — the lips and tongue are densely packed with sensory receptors and provide more detailed information to the developing brain than the hands can at this age. {{child_name}} is not being naughty by mouthing everything; they are doing science. Support this by ensuring {{child_name}} has access to a range of clean, safe, appropriately sized objects to mouth.\n\nGrabbing — at glasses, hair, plates, faces — is the natural extension of intentional reaching and represents a genuine inability to modulate grip strength or target selection at this age. Redirect rather than restrict: gently move {{child_name}}\'s hand to an appropriate target while narrating "not glasses — here is something you can hold." Consistent, patient redirection over weeks gradually shapes selective reaching.',
      },
      {
        key: 'screen_time',
        patterns: [
          'is it okay to use the phone to keep {{child_name}} calm',
          '{{child_name}} stares at the TV and seems soothed by it',
          'when can I start some screen time',
        ],
        response:
          'Screen time recommendations from the WHO and AAP are clear for this age group: no screen time (apart from video calls with family) before 18 months. The reasoning is specifically behavioural and neurological — screens do not respond to {{child_name}}\'s actions, which means they provide stimulation without agency. The cause-effect learning that is critical right now requires responsive environments, not passive viewing.\n\nThe soothing effect of screens is real and neurologically similar to mild dissociation — the visual stimulation is absorbing enough to interrupt distress. But this is not the same as learning to self-regulate, and it comes at the cost of the active interaction time that builds regulation capacity. In the rare emergency (a medical procedure, an unavoidable situation), brief exposure is not harmful. As a routine soothing strategy, it is worth replacing with responsive caregiving.',
        boundary: true,
      },
      {
        key: 'night_waking',
        patterns: [
          '{{child_name}} is still waking every 2 hours at 5 months',
          'when will {{child_name}} sleep through the night',
          'is frequent night waking normal at this age',
        ],
        response:
          'Night waking at 3–6 months is developmentally normal. Most infants in this age range have not yet consolidated sleep into long nocturnal stretches — their sleep cycles are shorter (45–50 minutes), their stomachs are small, and their capacity to re-settle independently between cycles is still developing. "Sleeping through the night" in research terms means a 5-hour stretch — not 8–10 hours, which most infants cannot sustain until 6 months or later, and many not until considerably later.\n\nThere is a range of normal: some 5-month-olds sleep a 6–7 hour stretch; others wake 3–4 times. Both are within the normal developmental range. Gentle approaches to supporting independent settling (such as putting {{child_name}} down drowsy rather than fully asleep) can be introduced at 4–6 months, but formal sleep training is not recommended before 4–6 months and is most effective when started with a developmental framework rather than out of desperation.',
      },
    ],
    milestones: [
      [
        'beh-3-intentional-reach',
        'Reaches deliberately and accurately for a desired object — arm extends towards object, not in a random direction',
        4,
        'When you hold a toy at arm\'s reach and {{child_name}} is interested, do they extend their arm towards it in a directed way?',
      ],
      [
        'beh-3-social-vocalization',
        'Vocalises intentionally to attract attention or sustain social interaction — not reflexively but when seeking engagement',
        5,
        'Does {{child_name}} make sounds specifically when they want you to look at them or engage with them, and stop when they get the response they were looking for?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-3-no-reaching',
        description:
          'No evidence of intentional reaching or directed arm movement towards objects by 5 months',
        severity: 'discuss_with_ped',
        pattern:
          'At 5 months {{child_name}} shows no directed reaching or arm extension towards desired objects; movements remain reflexive; no attempts to grasp objects held in front of them',
        action:
          'Raise at paediatric visit. The doctor will assess motor and neurological development. If reaching is absent or significantly delayed, a referral for occupational therapy or developmental paediatrics is appropriate.',
        referral: 'Developmental Paediatrician or Occupational Therapist',
      },
    ],
    coping: {
      normalizations: [
        'The constant grabbing and mouthing phase is tiring — having your hair pulled, your glasses taken, and every object investigated with a wet mouth is genuinely relentless.',
        'Night waking at this age is so common it is statistically normal — if your antenatal group appears full of sleeping babies, the parents are either very lucky or not being entirely honest.',
      ],
      strategies: [
        'Set up "yes spaces" — areas where every object is safe to touch, grab, and mouth without you having to say no — so that your child has full freedom to explore without constant redirection.',
        'Prepare physically for the grabbing phase: tie back hair, remove dangly earrings, and keep glasses somewhere predictable when {{child_name}} is in active play mode.',
      ],
      selfCare: [
        'If night waking is at an unsustainable level for your health or functioning, explore safe approaches to supporting longer sleep stretches with your paediatrician — there are options that do not involve extended crying.',
        'The 3–6 month stage is one where many parents return to work — plan the logistics of this transition with your caregiver well in advance and expect an adjustment period.',
      ],
      partner:
        'Agreeing on a shared approach to night waking — who responds, how quickly, using what method — when you are both rested and calm prevents mid-night conflict and inconsistency that confuses {{child_name}}.',
      warnings: [
        'If {{child_name}} is not making eye contact during social interactions or does not respond to your face and voice with any visible interest by 5 months, raise this with your paediatrician rather than waiting for the next routine check.',
        'Excessive use of bouncers, swings, and rockers as primary containment devices at this age reduces the active floor time that builds intentional reaching, core strength, and self-regulation. Use them as tools, not as alternatives to interaction.',
      ],
    },
    evidence:
      'von Hofsten (2004) An action perspective on motor development, Trends in Cognitive Sciences; Kagan (1971) Change and Continuity in Infancy; Needham et al. (2002) A pick-me-up for infants\' exploratory skills, Infant Behavior and Development; WHO (2019) Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5 Years.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6 – 12 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '6-12mo',
    ageMin: 6,
    ageMax: 12,
    title: 'Boundary Testing: "No" and the First Social Rules',
    whatToExpect:
      'As {{child_name}} becomes mobile, the world opens up — and so does the need for limits. By 8–10 months, {{child_name}} begins to understand the word "no" and to recognise that caregivers react differently to different behaviours. This is the beginning of social learning: watching your face to gauge what is permitted, testing limits to understand consistency, and beginning to associate specific behaviours with specific responses.',
    keyMessage:
      'Consistent, calm limits at this age are teaching — not punishing. {{child_name}} is learning how the social world works.',
    dailyTips: [
      'Use "no" sparingly and consistently — reserve it for genuine safety concerns and follow through every time.',
      'Redirect before restricting — physically moving {{child_name}} towards an appropriate alternative is more effective than repeated no\'s.',
      'Baby-proof the environment so the number of necessary limits is manageable — you cannot be effective if you say "no" forty times per hour.',
    ],
    doList: [
      'Say "no" with a calm, firm voice — not angry, not amused. Consistency of tone matters.',
      'Follow through immediately on every limit you set — follow-through builds predictability.',
      'Offer an alternative when you restrict: remove the forbidden item and hand {{child_name}} something that is permitted.',
    ],
    dontList: [
      'Don\'t laugh at limit testing — even if it is genuinely funny, an amused response teaches {{child_name}} that the limit is negotiable.',
      'Don\'t negotiate or explain at length at this age — a brief, clear, consistent response is more effective than an explanation.',
      'Don\'t use physical punishment — at this developmental stage it produces fear and confusion, not understanding.',
    ],
    activities: [
      [
        'Exploration-with-Limits Environment',
        'Set up a play space where everything within reach is permitted — not valuable, not dangerous, and varied. Then baby-proof so forbidden objects are simply absent. When {{child_name}} reaches a genuine limit (an electric socket, your hot cup), redirect calmly and immediately. Having 3–5 redirections per hour rather than 30 makes consistent follow-through possible.',
        20,
        'Daily free play in a prepared environment',
      ],
      [
        'Gentle Cause-and-Consequence Play',
        'During play, set up simple sequences where {{child_name}}\'s actions produce predictable responses: knock the tower over → you look surprised and rebuild it; hand the toy to you → you make a funny sound and hand it back. This builds the understanding that behaviour has social consequence in a joyful context, preparing the neural circuitry for more complex social rules.',
        10,
        'Daily during interactive play',
      ],
    ],
    topics: [
      {
        key: 'limit_testing',
        patterns: [
          '{{child_name}} touches the forbidden thing and looks at me while doing it',
          'my baby seems to deliberately do things I\'ve said no to',
          'is {{child_name}} being naughty on purpose',
        ],
        response:
          'What you are observing is one of the most intellectually remarkable behaviours of infancy: social referencing combined with rule testing. When {{child_name}} reaches for the forbidden object and looks at you, they are not being defiant — they are running an experiment: "Is this rule stable? Will the response be the same as last time?" The gaze is itself the test. This requires a theory of your mind (understanding that you have rules and will enforce them) which is a significant cognitive achievement.\n\nThe most effective response is the same calm, firm response every single time — remove the object, offer an alternative, do not react with amusement or alarm. {{child_name}} will stop testing that particular limit when the data consistently confirm that the rule is stable. If the response varies (sometimes amused, sometimes angry, sometimes ignored), the testing continues because the experiment is not yielding consistent results.',
      },
      {
        key: 'biting_and_hitting',
        patterns: [
          '{{child_name}} bites me during feeding or play',
          '{{child_name}} hits me in the face',
          'my baby pulls hair and laughs about it',
        ],
        response:
          'Biting, hitting, and hair-pulling at 6–12 months are virtually never aggressive in intent — they are exploratory behaviours (what happens if I bite?), or expressions of excitement that exceed motor control. The laughing response often occurs because your surprised or pained reaction is genuinely novel and interesting to {{child_name}}, not because {{child_name}} finds your pain amusing in any adult sense.\n\nThe response that works: end the interaction briefly and calmly. If {{child_name}} bites during breastfeeding, unlatch, say "ouch, that hurts, no biting" calmly, and pause feeding briefly. If {{child_name}} hits your face, hold their hands gently, make eye contact, and say "no hitting — gentle" while guiding their hand in a soft touch. The consequence (brief interaction ending) is consistent and immediate. Emotional displays (screaming ouch dramatically) tend to be reinforcing — the interesting reaction becomes the point.',
      },
      {
        key: 'following_to_other_room',
        patterns: [
          '{{child_name}} follows me everywhere now that they can crawl',
          'I can\'t leave the room without {{child_name}} crawling after me and crying',
          'is all this following normal',
        ],
        response:
          'The combination of new mobility and peak attachment intensity in the 8–12 month window produces exactly this pattern: {{child_name}} can now follow you, and the attachment system motivates them to do so. This is healthy and expected behaviour. {{child_name}} is not being clingy in a problematic sense; they are appropriately maintaining proximity to their secure base.\n\nThe most effective approach is not to prevent the following but to create brief, predictable practices of staying in a room alone while you narrate your location from the other room: "I\'m just in the kitchen — I can hear you!" Combined with the object permanence games described elsewhere, this gradually builds {{child_name}}\'s confidence that you exist and will return even when not visible.',
      },
      {
        key: 'food_behaviour',
        patterns: [
          '{{child_name}} throws food on the floor and thinks it\'s funny',
          'mealtimes are chaos with {{child_name}} throwing everything',
          'how do I stop {{child_name}} playing with food',
        ],
        response:
          'Food throwing at 8–12 months is a cause-and-effect experiment (what happens when I drop this?) combined with a gravity and trajectory exploration. {{child_name}} is not being deliberately naughty — they have discovered that objects thrown from heights follow a consistent, reproducible path, which is actually a physics lesson. The bowl thrown from the high chair is a scientific investigation.\n\nPractical management: use suction bowls and cups, offer small amounts at a time, and end the meal calmly when food throwing begins — "food goes in your mouth or on your tray. When you throw it, that tells me you\'re done." This is one of the earliest opportunities to practice a consistent behavioural consequence, and {{child_name}}\'s ability to learn from it is genuinely developing at this age. Keep your reaction as neutral as possible — dramatic reactions extend the experiment.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'beh-6-understands-no',
        'Pauses or changes behaviour in response to a firm "no" — demonstrates understanding of the word as a social signal',
        9,
        'When you say "no" firmly while {{child_name}} is doing something, do they pause, look at you, or change their behaviour — even briefly?',
      ],
      [
        'beh-6-social-referencing',
        'Looks to caregiver\'s face for permission or reaction before or during an uncertain action',
        8,
        'Does {{child_name}} look at your face before touching something new or forbidden, as if checking your reaction?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-6-no-social-referencing',
        description:
          'No social referencing by 9 months — does not look to caregiver\'s face to gauge safety, permission, or reaction in ambiguous situations',
        severity: 'discuss_with_ped',
        pattern:
          'At 9 months {{child_name}} does not look at caregiver\'s face when approaching something new or uncertain, does not appear to use caregiver\'s emotional expression to guide their own behaviour, and does not vary behaviour based on caregiver approval or disapproval',
        action:
          'Raise at paediatric visit alongside any other social engagement concerns. Social referencing is a key joint attention behaviour. Absence in combination with other social communication markers warrants an M-CHAT-R screen.',
        referral: 'Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Being bitten while breastfeeding, hit in the face during play, and having food thrown at you with apparent delight are genuinely unpleasant experiences — your frustrated reaction is entirely understandable.',
        'The mealtime chaos of the 8–12 month period is almost universal and temporary — it is not a sign that your child will be a difficult eater forever.',
      ],
      strategies: [
        'Identify your top 3 genuine safety limits (electrical sockets, stairs, hot objects) and enforce these with absolute consistency while being more relaxed about lower-stakes boundary testing — you cannot sustain consistent enforcement across 50 issues simultaneously.',
        'Prepare your environment so that the number of limits you need to enforce is naturally reduced — baby-proofing is a behavioural strategy, not just a safety measure.',
      ],
      selfCare: [
        'The physical demands of mobile baby containment are significant — bending, lifting, blocking, and redirecting all day is genuinely tiring. Honour that exhaustion rather than dismissing it.',
        'Allow yourself to find the limit-testing funny internally — the gaze-while-doing-the-forbidden-thing is objectively amusing, and being able to find it so (while responding consistently) makes the stage more bearable.',
      ],
      partner:
        'Consistency between caregivers on limits is genuinely important at this stage — if one caregiver enforces a limit and another doesn\'t, {{child_name}}\'s social-learning algorithm will correctly identify that the rule is not universal and will test accordingly. Agree on your short list of consistent limits together.',
      warnings: [
        'If you find your reactions to biting or hitting are not staying calm — if you are yelling, squeezing, or otherwise responding physically to {{child_name}}\'s physical behaviours — this is a signal to identify an alternative strategy before escalation occurs.',
        'If {{child_name}} shows absolutely no response to "no" or any social signal from caregivers by 10 months, and this is combined with absence of pointing or joint attention, mention this at your next paediatric visit.',
      ],
    },
    evidence:
      'Sorce et al. (1985) Maternal emotional signaling: Its effect on the visual cliff behavior of 1-year-olds, Developmental Psychology; Hollich et al. (2000) Breaking the language barrier: An emergentist coalition model for the origins of word learning, Monographs of the Society for Research in Child Development; Feldman (2007) Infant-parent synchrony and the origins of self- and other-regulation, Child Development.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12 – 24 months
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'Peak Tantrums, Biting, and the Beginning of Limits',
    whatToExpect:
      'The second year of life is the undisputed peak of behavioural challenge in early childhood. {{child_name}} has the desire, the mobility, and the intention to do almost everything — and the language, impulse control, and frustration tolerance to do almost none of it gracefully when blocked. Tantrums, biting, hitting, and screaming are not signs of a difficult child; they are the neurologically expected output of this developmental stage.',
    keyMessage:
      'Biting and hitting at this age are not aggression — they are the pre-verbal communication of overwhelming emotion. Name, respond, redirect.',
    dailyTips: [
      'Prevent where possible — hunger, fatigue, and overstimulation are the three biggest tantrum triggers and they are manageable.',
      'Keep the daily schedule predictable — toddlers regulate better when the sequence of events is reliably the same.',
      'Offer genuine choice within non-negotiable frames: "bath now or in five minutes?" gives autonomy while maintaining the limit.',
    ],
    doList: [
      'State limits clearly and calmly once, then follow through without negotiation.',
      'Acknowledge the feeling behind the behaviour before addressing the behaviour itself.',
      'Use physical proximity and calm presence during tantrums — your regulation is {{child_name}}\'s regulation tool.',
    ],
    dontList: [
      'Don\'t give in to tantrum demands after saying no — this teaches that escalation works.',
      'Don\'t punish biting with biting back — this is confusing, models the behaviour, and can cause injury.',
      'Don\'t require immediate compliance from a fully dysregulated toddler — wait for calm before expecting cooperation.',
    ],
    activities: [
      [
        'The Yes Environment',
        'Create a physical space in your home where everything is permitted — a designated play area where {{child_name}} can touch, climb, pull, and explore without any redirection. Balance the necessary limits of other areas with genuine freedom here. A child who gets some "yes" time is significantly easier to redirect with a "no" elsewhere — the frustration tank is less full.',
        30,
        'Daily — ideally as a consistent part of the routine',
      ],
      [
        'Emotion First, Behaviour Second Script',
        'Practise a consistent two-step script for any behavioural limit: first name the feeling ("I can see you\'re so frustrated"), then state the limit ("but we don\'t hit, hitting hurts"). Do this in the same calm tone whether the behaviour is biting, hitting, screaming, or throwing. The consistent script reduces your own emotional escalation and teaches {{child_name}} the emotional vocabulary at the same time.',
        3,
        'Every time a limit needs to be set — throughout the day',
      ],
    ],
    topics: [
      {
        key: 'biting',
        patterns: [
          '{{child_name}} is biting other children at playgroup',
          '{{child_name}} bites me when frustrated',
          'how do I stop the biting',
        ],
        response:
          'Biting in the 12–24 month window is extremely common and is the pre-verbal equivalent of a scream: "I am overwhelmed and I have no other way to discharge this." {{child_name}} does not understand that biting hurts in the same way an older child would, and biting is not intentionally cruel. That said, it does hurt, it can break skin, and it needs to be addressed immediately and consistently.\n\nThe most effective response is immediate, calm, and brief: move towards {{child_name}} quickly, crouch to their level, look directly at them, and say in a firm but not shouted voice: "No biting. Biting hurts." Do not bite back, do not spend minutes in explanation, do not send {{child_name}} to another room in anger. Then redirect to an appropriate oral input (something to chew on) if the bite was sensory-seeking, or a physical outlet (stomping, running) if the bite was frustration-driven. Track when biting occurs — most biting follows predictable triggers that can be pre-empted.',
      },
      {
        key: 'hitting_and_throwing',
        patterns: [
          '{{child_name}} hits when angry',
          '{{child_name}} throws things when they can\'t have what they want',
          'my toddler hits other children',
        ],
        response:
          'Hitting and throwing are the most common physical behaviour problems of toddlerhood and, like biting, represent the overflow of emotion that exceeds verbal and regulatory capacity. The hands and arms communicate what the words cannot yet. This will not continue indefinitely — as language develops, physical aggression at this age typically reduces significantly, which is why building the emotional vocabulary is the most important long-term strategy.\n\nFor immediate management: respond every time with the same brief, calm consequence. Remove {{child_name}} from the situation if another child was hit: "We don\'t hit. I\'m taking you away for a minute." Brief (30–60 second) time away from the situation — not a punitive time out but a removal of the overwhelm — combined with a rapid return to the situation once calm is the age-appropriate response. For throwing: "we throw balls, not toys. Here is the ball." Giving an appropriate outlet for the impulse is more effective than pure restriction.',
      },
      {
        key: 'tantrum_management',
        patterns: [
          'nothing works when {{child_name}} is in a tantrum',
          'how do I handle public tantrums',
          '{{child_name}} drops to the floor and screams for 30 minutes',
        ],
        response:
          'During a full-blown tantrum {{child_name}}\'s prefrontal cortex is not accessible — reasoning, explaining, threatening, and problem-solving will not reach a brain in this state. The most effective response is to provide safe physical proximity (not restraint unless {{child_name}} is in danger), maintain your own calm, and wait. Do not add new information, do not escalate, do not give in. Simply be present, regulated, and available.\n\nFor public tantrums: if safe, you can simply wait with {{child_name}} where you are — this avoids the rewarded-by-leaving-the-shop pattern. If the setting makes waiting impossible, remove {{child_name}} calmly without adding your own distress to theirs. "We\'re going to wait in the car until you\'re ready" is not a threat; it is a safe space for the storm to pass. The most important post-tantrum behaviour is the repair: return to warmth quickly, reconnect physically, and move forward without a lengthy debrief.',
      },
      {
        key: 'sleep_resistance',
        patterns: [
          '{{child_name}} fights sleep for an hour every night',
          '{{child_name}} climbs out of the cot',
          'we have a huge battle every bedtime',
        ],
        response:
          'Sleep resistance in the second year is driven by a genuine neurological change: {{child_name}} now understands that life is continuing without them when they sleep, and the autonomy drive that fuels all toddler behaviour is not paused at bedtime. This is not a sleep problem — it is a developmental reality that requires a behavioural solution.\n\nThe most effective evidence-based approach is a brief, consistent, predictable bedtime routine that ends in the same way every night — same words, same final hug, same exit. The routine provides enough certainty to overcome the resistance. If {{child_name}} calls out after you leave, brief check-ins at consistent intervals (the "camping out" or Ferber approaches) work for many families at this age. Cot climbing requires a safety response: a floor mattress or a toddler bed is safer than a cot with climbing risk. Avoid starting new bedtime associations (lying with {{child_name}} until asleep) that are not sustainable — they become the new requirement.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'beh-12-follows-simple-direction',
        'Follows a simple one-step instruction without physical guidance — for example "give me the ball" or "come here"',
        14,
        'Does {{child_name}} follow simple one-step requests without you needing to physically guide them — for example, handing you something when you ask for it by name?',
      ],
      [
        'beh-12-indicates-no',
        'Uses "no" or head-shaking to indicate refusal or disagreement with an intention, not just as imitation',
        14,
        'Does {{child_name}} use "no" or shake their head to refuse something they genuinely don\'t want, rather than just imitating the word?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-12-no-pretend-play',
        description:
          'No evidence of simple pretend or symbolic play by 18 months — no feeding a doll, no pretending a block is a phone, no copying household actions in play',
        severity: 'discuss_with_ped',
        pattern:
          'At 18 months {{child_name}} does not engage in any pretend play, does not imitate adult activities in play (stirring, sweeping, cooking), and does not use objects symbolically',
        action:
          'Raise at the 18-month developmental check alongside any language concerns. Absence of pretend play at 18 months is one of the key early markers assessed in autism screening tools.',
        referral: 'Developmental Paediatrician — M-CHAT-R administration',
      },
    ],
    coping: {
      normalizations: [
        'Being in the middle of a supermarket when a 15-month-old goes to the floor screaming is one of the defining experiences of toddler parenting and it happens to everyone.',
        'The second year is genuinely more behaviorally demanding than any other period — even parents who felt confident with newborns are often blindsided by the intensity of this stage.',
      ],
      strategies: [
        'Identify the three situations where {{child_name}}\'s behaviour is most challenging and prepare specifically for those — a script ready, snacks available, lower stakes plan. Generic preparation is less effective than targeted preparation.',
        'Keep a mental tally of the proportion of daily interactions that are positive versus conflictual — if negative interactions are dominating, find ways to add positive ones before adjusting your response to the negative ones.',
      ],
      selfCare: [
        'The emotional labour of staying calm during tantrums while feeling embarrassed, exhausted, or furious is significant — debriefing with a partner or friend after hard days is a legitimate need, not a complaint.',
        'Laughter is a genuine coping tool for toddler behaviour — many tantrum triggers are objectively absurd (broken cracker, wrong colour cup), and your ability to find them funny privately sustains your patience publicly.',
      ],
      partner:
        'The toddler stage is frequently when one parent becomes the "favourite" — the one {{child_name}} always wants for bedtime, for comfort, for everything. This is exhausting for the preferred parent and feels like rejection for the other. Rotate responsibility for hard behavioural moments so neither parent bears all the load.',
      warnings: [
        'If {{child_name}}\'s biting or hitting at a childcare setting is resulting in regular injuries to other children after a full month of consistent management, seek guidance from your paediatrician — some children at this age benefit from additional behavioural support.',
        'Tantrums that include prolonged breath-holding to the point of passing out (breath-holding spells) require paediatric assessment — they are usually benign but need to be clinically evaluated.',
      ],
    },
    evidence:
      'Potegal & Davidson (2003) Temper tantrums in young children: Behavioral composition, Journal of Developmental & Behavioral Pediatrics; Tremblay et al. (2004) Physical aggression during early childhood: Trajectories and predictors, Pediatrics; Mindell et al. (2006) Behavioral treatment of bedtime problems and night wakings in infants and young children, Sleep.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2 – 3 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'Defiance, Autonomy, and the Power of "No"',
    whatToExpect:
      'The third year of life is defined by one central developmental drive: the assertion of a separate self. "No", "mine", "I do it", and "myself" are not oppositional behaviours — they are the language of individuation, the process through which {{child_name}} discovers and declares that they are a distinct person with their own will. Toilet training introduces the first domain where {{child_name}} has genuine biological control, which is why it so frequently becomes a power struggle if approached as a compliance project.',
    keyMessage:
      'Defiance at this age is autonomy in development — the goal is not to eliminate it but to channel it.',
    dailyTips: [
      'Give {{child_name}} as much genuine choice as possible across the day — this fills the autonomy tank and reduces power struggles over non-negotiables.',
      'Offer specific transitions with advance notice: "We\'re leaving the park in 5 minutes" rather than a surprise departure.',
      'Approach toilet training as supporting a skill, not demanding compliance.',
    ],
    doList: [
      'Choose your battles deliberately — not every defiant moment requires a response.',
      'Follow through on every limit you set; empty threats erode your credibility quickly.',
      'Find legitimate domains where {{child_name}} can be in charge — what to wear, what snack to have, what order to do things in.',
    ],
    dontList: [
      'Don\'t get into a power struggle over toilet training — you cannot win a battle over another person\'s bodily functions.',
      'Don\'t ask questions when you mean statements: "Do you want to get dressed?" invites a "no" answer.',
      'Don\'t make threats you won\'t follow through on — "we\'re leaving" means leaving.',
    ],
    activities: [
      [
        'Special Helper Jobs',
        'Assign {{child_name}} a small set of genuine household responsibilities — putting napkins on the table, feeding a pet, sorting laundry by colour. These are not tasks to complete to your standard but domains where {{child_name}} has real agency and real purpose. The sense of contributing meaningfully reduces the oppositional drive because {{child_name}}\'s need for significance is being met constructively.',
        10,
        'Daily — woven into household routines',
      ],
      [
        'Choice Architecture',
        'Each morning, lay out two acceptable outfit options and let {{child_name}} choose. At breakfast, offer two acceptable foods. At bedtime, offer two acceptable books. This is not about wardrobe flexibility — it is about building the neural habit of decision-making within appropriate limits. The practice of choosing, across multiple daily contexts, directly develops the capacity for self-regulation.',
        5,
        'At every major transition point throughout the day',
      ],
    ],
    topics: [
      {
        key: 'toilet_training_resistance',
        patterns: [
          '{{child_name}} refuses to sit on the potty',
          'toilet training has become a huge battle',
          '{{child_name}} holds on until an accident rather than asking to go',
        ],
        response:
          'Toilet training resistance at 2–3 years is almost always a power struggle that has developed because the process has been framed as compliance. {{child_name}} has discovered, correctly, that they are the only person in the house with actual control over their bladder and bowel — and when pressure is applied, using that control becomes a way of asserting autonomy. You cannot force toilet training, and attempts to do so typically delay it.\n\nThe most effective approach is to completely remove pressure and return to a child-led readiness model: the toilet is available, accidents are handled matter-of-factly without praise or shame, and {{child_name}} is given credit for their own bodily awareness. Most children who have the physiological readiness (staying dry for 2+ hours, showing awareness of needing to go) train within weeks when parental anxiety is removed from the equation. If there are signs of genuine fear of the toilet (not just preference for nappies), a brief conversation with your paediatrician about toilet anxiety is worthwhile.',
      },
      {
        key: 'defiance_and_no',
        patterns: [
          '{{child_name}} says "no" to everything',
          'every request is an argument',
          'how do I get {{child_name}} to cooperate',
        ],
        response:
          'The reflexive "no" of the 2–3 year old is one of the most clinically reliable developmental signs you will encounter — it means {{child_name}} has formed enough of a separate self to decline, and enough agency to assert that decision. It is genuinely good news, even when it is exhausting to live with.\n\nThe most effective practical strategies: reduce the number of open yes/no questions (say "time to get dressed" rather than "do you want to get dressed?"), build in choice wherever possible so {{child_name}}\'s yes-or-no power is used on real decisions, and pick your battles consciously. If {{child_name}} has three genuine power struggles a day with you, that is manageable. If there are thirty, something about the structure of the environment or the approach needs to change. When you hit a genuine non-negotiable (car seat, medication, safety), one brief warning and then calm follow-through is more effective than extended negotiation.',
      },
      {
        key: 'sharing_difficulty',
        patterns: [
          '{{child_name}} won\'t share at all',
          '{{child_name}} grabs toys from other children',
          'playdate always ends in tears over sharing',
        ],
        response:
          'True sharing — giving something to another person while understanding their perspective and valuing their pleasure — requires theory of mind (not fully operational until 3–4 years), impulse control (not developed until much later), and the conviction that the item will be returned (which requires trust built over time). At 2–3 years, none of these prerequisites are reliably in place. "Forced sharing" (taking a toy from {{child_name}} and giving it to another child) teaches children nothing about sharing — it teaches that being bigger gives you power.\n\nMore developmentally appropriate approaches: parallel play with separate toys reduces the sharing demand; "turn-taking" (your turn, then their turn, then your turn) with a timer is more achievable than sharing because it preserves ownership while teaching patience; having two of popular items at playdates reduces conflict. Genuine sharing typically emerges naturally in the 3.5–4.5 year range as theory of mind and impulse control develop. Your job now is to reduce conflict and model turn-taking, not to demand a developmental capacity {{child_name}} does not yet have.',
      },
      {
        key: 'lying',
        patterns: [
          '{{child_name}} is starting to lie to avoid trouble',
          '{{child_name}} denied something I know they did',
          'my 2 year old told their first lie and I don\'t know what to think',
        ],
        response:
          'A child\'s first deliberate lie is, counterintuitively, a significant developmental milestone — it requires theory of mind (understanding that you have a separate perspective that can be influenced), understanding of cause and consequence (telling you x will produce outcome y), and working memory to hold the false version in mind. Lying is cognitively demanding, and a child who can do it at 2.5 is demonstrating sophisticated cognitive development.\n\nThis does not mean you should encourage or ignore it. The appropriate response is calm, matter-of-fact, and consistent: "I can see you spilled the milk. It\'s okay — accidents happen. But I need you to tell me the truth." Avoid setting up lie-traps (asking questions you already know the answer to with a tone that suggests punishment) — these teach children to lie more convincingly. Create an emotional environment where telling the truth is safe and truth-telling is explicitly praised: "I\'m really glad you told me the truth — that took courage."',
        boundary: true,
      },
    ],
    milestones: [
      [
        'beh-24-simple-turn-taking',
        'Participates in simple turn-taking games — waits for their turn with support and takes the appropriate action when it arrives',
        30,
        'Can {{child_name}} play a simple taking-turns game with an adult — for example, rolling a ball back and forth — waiting for their turn without grabbing?',
      ],
      [
        'beh-24-follows-two-step',
        'Follows two-step instructions without physical prompting — for example "put the book down and come sit with me"',
        28,
        'Can {{child_name}} follow a two-step instruction where the second step is not immediately visible — for example, going to another room to get something and bringing it back?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-24-extreme-rigidity',
        description:
          'Extreme rigidity in routine and severe distress at minor changes that significantly impairs daily functioning — beyond ordinary toddler preference',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} experiences significant and prolonged distress at minor routine changes (slightly different plate, different route to park), shows highly restricted and repetitive behaviours, and this is significantly impairing daily functioning across multiple settings',
        action:
          'Discuss at paediatric visit. While toddlers prefer routine, extreme rigidity that causes significant daily distress warrants a developmental screen. The paediatrician should assess the full developmental picture including language, play, and social engagement.',
        referral: 'Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'The constant "no" and defiance of this age is one of the most demoralising aspects of parenting a 2-year-old — the fact that it is developmentally healthy does not make it less exhausting.',
        'Toilet training battles affect a significant proportion of families and are almost always rooted in well-intentioned but pressure-creating approaches — you are not alone and the situation is resolvable.',
      ],
      strategies: [
        'Count the number of times per day you say "no" to {{child_name}} — if it is very high, problem-solve the environment before problem-solving the behaviour.',
        'When you are about to enter a known conflict zone (leaving a playground, ending screen time), take three slow breaths before initiating — your calm physiological state before the confrontation significantly affects its outcome.',
      ],
      selfCare: [
        'Parenting a toddler through the defiance stage requires enormous reserves of calm that can only be maintained with adequate rest, some adult conversation, and permission to find the stage difficult.',
        'Acknowledge the emotional labour of being the consistent, boundaried parent when {{child_name}}\'s other caregivers (grandparents, childminders) do not apply the same limits — this inconsistency is a specific source of parental frustration that deserves acknowledgment.',
      ],
      partner:
        'Defiance and autonomy battles are much easier to navigate when both parents have agreed on which limits are non-negotiable and which are flexible. A 30-minute weekly "alignment check" — are we consistent on the current top issues? — is worth more than either individual\'s best technique.',
      warnings: [
        'If toilet training is becoming a source of significant daily conflict and has been for more than 6–8 weeks, step back completely and consult your paediatrician — what begins as developmental normal can calcify into a genuine anxiety-based holding pattern that needs a different approach.',
        'Physical punishment at this age (smacking, aggressive physical restraint) is associated with increased aggression, reduced self-regulation, and damaged parent-child relationship in outcomes research — if you are finding yourself reaching for physical responses, seek support now.',
      ],
    },
    evidence:
      'Brazelton & Sparrow (2004) Toilet Training: The Brazelton Way; Polak-Toste & Gallagher (2006) Temperamental exuberance: Correlates and consequences, in Self-Regulation in Early Childhood (Balter & Tamis-LeMonda, eds.); Talwar & Lee (2002) Development of lying to conceal a transgression: Children\'s control of expressive behaviour during verbal deception, International Journal of Behavioral Development.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3 – 5 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'Rules, Lying, and the Beginning of Social Behaviour',
    whatToExpect:
      'The preschool years bring {{child_name}} into a wider social world — playgroups, nursery, friends\' houses — where behavioural rules are more complex and the consequences of behaviour are social as well as familial. {{child_name}} can now understand rules, sometimes follow them, and also deliberately circumvent them. Lying becomes more sophisticated. Physical aggression typically decreases as language increases, but relational behaviour (excluding, bossing, tattling) emerges as the new social challenge.',
    keyMessage:
      'Rule understanding is ahead of rule following at this age — {{child_name}} knowing the rule does not mean they can always follow it.',
    dailyTips: [
      'State rules positively where possible: "feet on the floor" rather than "stop jumping on the sofa."',
      'Keep rules few and consistent — three to five core house rules that are always enforced beat twenty that are sometimes enforced.',
      'Acknowledge rule-following as much as you address rule-breaking.',
    ],
    doList: [
      'Explain the reason behind rules briefly: "We hold hands in the car park because cars can\'t see small children."',
      'Use natural and logical consequences where possible, rather than arbitrary punishment.',
      'Praise specific prosocial behaviour: "I noticed you waited your turn just then — that was kind."',
    ],
    dontList: [
      'Don\'t treat lying as a moral catastrophe — respond with the same calm clarity you bring to other rule violations.',
      'Don\'t use shaming as a disciplinary strategy — it produces fear, not learning.',
      'Don\'t make rules that depend on {{child_name}}\'s sustained impulse control over long periods — that is beyond what the prefrontal cortex can deliver at this age.',
    ],
    activities: [
      [
        'House Rules Visual Chart',
        'Create a simple picture chart of 3–5 household rules with {{child_name}}\'s input — what rules does {{child_name}} think are important? Include one or two rules that are genuinely {{child_name}}\'s own suggestion. Put it where {{child_name}} can see it. Rules that children have helped create have significantly higher compliance than rules that are imposed. Review together weekly.',
        20,
        'Create once; review briefly each week',
      ],
      [
        'Social Problem-Solving Stories',
        'Use puppets, dolls, or small toys to play out common social scenarios: the toy that two friends both want, the child who didn\'t get invited to a game, the friend who said something unkind. Ask {{child_name}} what each character should do and why. This builds social problem-solving in a safe, low-stakes context and develops the understanding that behaviour has predictable social consequences.',
        15,
        'Two or three times weekly during quiet play time',
      ],
    ],
    topics: [
      {
        key: 'sophisticated_lying',
        patterns: [
          '{{child_name}} tells elaborate lies',
          '{{child_name}} lies even when I know the truth',
          'how do I teach {{child_name}} to be honest',
        ],
        response:
          'Lying becomes more sophisticated in the preschool years as {{child_name}}\'s theory of mind, language, and working memory all develop. A 4-year-old who tells an elaborate lie has demonstrated impressive cognitive machinery, even if the lie itself needs to be addressed. Responding to lying with severity tends to teach children to lie better (avoid detection) rather than less (moral concern about deception).\n\nThe most effective approach to building honesty is environmental and relationship-based: create conditions where truth-telling feels safe (mild reactions to admissions, explicit praise for honesty), avoid setups that virtually guarantee lying (asking "did you do that?" with a tone that signals punishment either way), and respond to lies calmly and practically: "I can see that\'s what you\'re telling me, but I think something different happened — let\'s talk about it." The research on building honesty emphasises the positive — praising truth-telling — far more than consequences for lying.',
      },
      {
        key: 'bossy_behaviour',
        patterns: [
          '{{child_name}} tries to control every game with other children',
          'other children don\'t want to play with {{child_name}} because they\'re too bossy',
          '{{child_name}} has a meltdown when others don\'t follow their rules',
        ],
        response:
          'Bossiness in preschool-age children reflects a desire for control and predictability that is developmentally normal — {{child_name}} has strong ideas, has practiced directing the play narrative (which is healthy), and is now discovering that other children have equally strong ideas. The collision is developmentally inevitable and socially important.\n\nThe work to do at home is two-fold: build {{child_name}}\'s awareness of others\' perspectives ("I wonder what {{child2}} wanted to do — did you ask them?"), and practise flexibility in low-stakes contexts (letting {{child_name}}\'s younger sibling or a parent occasionally direct play without {{child_name}} controlling it). Direct coaching rather than punishment is most effective: "Let\'s think of a way for both of you to have a turn being in charge." Also check whether {{child_name}} has enough domains where their leadership is fully welcomed — the bossiness drive often decreases when legitimate authority needs are being met.',
      },
      {
        key: 'tattling',
        patterns: [
          '{{child_name}} tells on other children for everything',
          '{{child_name}} tattles constantly at preschool',
          'how do I stop {{child_name}} from telling on everyone',
        ],
        response:
          'Tattling at preschool age reflects two things: genuine moral concern ({{child_name}} has internalised rules and wants them enforced) and a bid for adult attention and approval. Both are age-appropriate, though the rate can be exhausting for adults. Shaming {{child_name}} for tattling ("stop being a snitch") is counterproductive — it discourages reporting genuine safety concerns alongside trivial ones.\n\nA more useful distinction to teach is the difference between telling to get someone into trouble and telling to keep someone safe: "Is someone going to get hurt?" If yes, always tell. "Is someone doing something you don\'t like?" — try to handle it yourself first, and then come to an adult if you can\'t. This distinction, repeated consistently over months, helps {{child_name}} develop independent social problem-solving rather than defaulting to adult arbitration for every minor infraction.',
      },
      {
        key: 'aggression_at_preschool',
        patterns: [
          'the preschool says {{child_name}} is hitting other children',
          '{{child_name}} has bitten a child at nursery',
          'we\'re being asked to address {{child_name}}\'s physical behaviour at school',
        ],
        response:
          'Physical aggression that persists into the preschool years and occurs in structured settings (preschool, playgroup) warrants a collaborative response between home and setting. The first step is understanding the pattern: when does it occur? With which children? In which activities? Under what conditions? Physical aggression in 3–5 year olds is almost always triggered by specific conditions (transitions, competing for resources, fatigue, social overload) rather than being pervasive and unpredictable.\n\nWork with the preschool to identify triggers and develop a consistent response plan between home and setting. At home, continue to name the emotion before addressing the behaviour ("I can see you got very angry") and ensure {{child_name}} has words for distress and appropriate help-seeking ("tell a teacher if someone won\'t share"). If aggression is severe (biting that breaks skin, hitting that injures), frequent (multiple times daily), or not responding to consistent management after 4–6 weeks, a consultation with your paediatrician about additional support is appropriate.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'beh-36-rule-understanding',
        'Can state a household rule when asked and identify a situation in which it applies — demonstrating rule knowledge separate from rule compliance',
        42,
        'If you ask {{child_name}} "what\'s a rule in our house?", can they name one and describe when it matters?',
      ],
      [
        'beh-36-cooperative-play',
        'Engages in genuinely cooperative play with one or more peers — agreeing on a shared narrative, negotiating roles, and sustaining joint play for 5+ minutes',
        48,
        'Does {{child_name}} play cooperatively with another child for at least a few minutes — taking on roles, following a shared story, and negotiating without adult facilitation?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-36-persistent-aggression',
        description:
          'Persistent physical aggression that has not reduced with consistent management and is causing injury or significant disruption at home and in preschool settings by age 4',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} is regularly physically aggressive (hitting, biting, kicking) in multiple settings, has not responded to 4–6 weeks of consistent behavioural management, and the aggression is causing injury or significant exclusion from activities',
        action:
          'Paediatric consultation to rule out medical contributors (sleep disorder, pain, sensory processing) and discuss referral for behavioural support. Early intervention in preschool-age aggression has good outcomes.',
        referral: 'Child Psychologist or Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'Receiving a call from preschool about your child\'s behaviour is one of the most anxiety-provoking parenting experiences — it does not mean you are a bad parent or that {{child_name}} is a "problem child."',
        'Navigating the social complexity of preschool friendships and behaviour on behalf of your child is genuinely hard — you are simultaneously managing {{child_name}}\'s learning and your own emotions about how others perceive your child.',
      ],
      strategies: [
        'Request a specific meeting with {{child_name}}\'s preschool teacher to discuss a consistent strategy — the teacher managing the behaviour one way and you managing it a different way reduces the effectiveness of both.',
        'When {{child_name}} comes home with a behaviour report, resist the impulse to interrogate or punish immediately — gather information first, respond with {{child_name}} present second.',
      ],
      selfCare: [
        'The social judgement experienced by parents of physically aggressive preschoolers is real and painful — find at least one parent in your community who will be honest that their child is also not perfect.',
        'Your own shame about {{child_name}}\'s behaviour can amplify your response to it in unhelpful ways — addressing your own emotional reaction separately from addressing {{child_name}}\'s behaviour is more effective for both of you.',
      ],
      partner:
        'If one parent is regularly receiving the preschool feedback and managing behaviour consequences while the other is absent for this, that imbalance needs to be named and redistributed — behavioural management is most effective when shared consistently between both primary caregivers.',
      warnings: [
        'Children whose physical aggression at preschool is minimised at home ("they never do that with me") rather than taken seriously and worked on collaboratively are at higher risk of the behaviour escalating — school and home need a consistent message.',
        'If {{child_name}}\'s aggression is occurring in contexts where they were previously calm, and this is a new change, consider whether there have been any home stressors (parental conflict, new baby, house move) that might be driving a behavioural regression.',
      ],
    },
    evidence:
      'Webster-Stratton (2012) The Incredible Years; Eisenberg et al. (2004) The relations of effortful control and impulsivity to children\'s resiliency and adjustment, Child Development; Talwar et al. (2007) Children\'s lie-telling to conceal a parent\'s transgression, Child Development.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5 – 8 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'Impulse Control, Homework Habits, and Building Self-Discipline',
    whatToExpect:
      'School-age children are expected to sit still, attend to instruction, follow multi-step rules, and complete tasks they do not always want to do — all of which require impulse control and self-regulation that is still actively developing in the 5–8 year window. The demands of school are actually slightly ahead of neurological readiness for many children, which is normal and manageable with the right support. Homework habits, routine, and the development of self-discipline are key behavioural challenges of this period.',
    keyMessage:
      'Self-discipline at this age is a skill being built, not a character trait being tested — teach it with the same patience as reading.',
    dailyTips: [
      'Create a consistent after-school structure: snack, play, homework, dinner — predictable sequence reduces transition resistance.',
      'Break homework into small chunks with short breaks — the working memory of a 6-year-old is not designed for 45-minute sustained tasks.',
      'Praise the process of sitting down to work, not just the quality of the output.',
    ],
    doList: [
      'Establish a homework routine in the same place, at the same time, without screens present.',
      'Stay nearby but not over-the-shoulder during homework — presence is supportive, hovering is counterproductive.',
      'Work collaboratively on rules for screen time and enforce them consistently.',
    ],
    dontList: [
      'Don\'t complete work for {{child_name}} when frustration peaks — offer a scaffold, not a solution.',
      'Don\'t make screen time conditional on homework quality — this creates anxiety rather than motivation.',
      'Don\'t compare homework habits to siblings or classmates.',
    ],
    activities: [
      [
        'The After-School Routine Board',
        'Create a visual checklist of the after-school sequence with {{child_name}}\'s input — snack, outdoor time, homework, dinner, bath, story. Let {{child_name}} check off items. The visual externalises the sequence from parental nagging to a shared reference point, reduces the "you always have to tell me what to do" dynamic, and builds habitual routine that eventually becomes self-sustaining.',
        15,
        'Set up once; use daily',
      ],
      [
        'The Practice Timer',
        'For homework or any sustained task, use a visible timer (sand timer or digital countdown) for a time slightly shorter than {{child_name}}\'s comfortable attention span — perhaps 8–10 minutes for a 6-year-old. Agree that when the timer goes, a short break happens regardless. This teaches {{child_name}} to sustain effort knowing relief is coming, gradually extending the interval over weeks as attention develops.',
        Variable,
        'During every homework or sustained task session',
      ],
    ],
    topics: [
      {
        key: 'homework_battles',
        patterns: [
          'homework is a battle every single night',
          '{{child_name}} refuses to do homework or melts down over it',
          'I end up doing the work just to get it done',
        ],
        response:
          'Homework battles are among the most common parental complaints in the 5–8 age group and are usually driven by a mismatch between what the homework requires (sustained concentration on demand) and what the developing brain can deliver at the end of a school day when the attention reserve is depleted. {{child_name}} has spent all day exercising impulse control and attention in a structured environment — the tank is often genuinely empty by 3:30 pm.\n\nTiming matters more than most parents realise: if homework happens immediately after school, compliance is usually lowest. A 30–60 minute decompression window (outdoor play, free play, snack) before homework, at the same time every day, dramatically improves homework engagement. Keep your role supportive rather than directive — be present, be available, but don\'t hover. When {{child_name}} is stuck, ask a question rather than give the answer. When the battle is severe and consistent despite good structure, mention it to the teacher — sometimes homework load is adjusted, or there is an underlying learning difficulty worth investigating.',
      },
      {
        key: 'screen_time_battles',
        patterns: [
          '{{child_name}} won\'t get off screens without a massive tantrum',
          'screen transitions are the worst part of every day',
          'how do I manage {{child_name}}\'s gaming',
        ],
        response:
          'Screen transition battles at school age are partly behavioural and partly neurological — the dopaminergic reward of screens, particularly gaming, is genuinely difficult to interrupt, and the abrupt end of a high-stimulation activity produces a real physiological drop that the developing brain experiences as disproportionately aversive. This is not purely a compliance problem.\n\nThe most effective management is structural rather than willpower-based: predetermined screen time limits agreed in advance (not negotiated at ending time), a 5-minute warning system that is genuinely predictable, and a post-screen transition activity that is itself engaging (outdoor play, physical activity, something hands-on). Removing screens as punishment for transition behaviour tends to create a scarcity dynamic that intensifies the craving. If screen transitions are consistently extremely dysregulating (30+ minutes of distress, physical aggression), this warrants a conversation with your paediatrician.',
      },
      {
        key: 'impulsive_behaviour',
        patterns: [
          '{{child_name}} acts without thinking and then regrets it',
          '{{child_name}}\'s teacher says they blurt out answers and disturb the class',
          '{{child_name}} can\'t seem to stop themselves even when they know they should',
        ],
        response:
          'Impulse control — the ability to pause before acting on an urge — is a prefrontal cortex function that develops gradually across childhood and into early adulthood. At 5–8 years, most children can inhibit impulses some of the time, in low-demand situations, with adult scaffolding — but reliable independent impulse control in all contexts is not expected at this age.\n\n{{child_name}} knowing the rule ("I shouldn\'t blurt out") does not mean {{child_name}} can always follow it, especially when excited or under pressure. Strategies that help: short delays before responding (teach {{child_name}} to "think before you speak" by counting to three silently), physical signals that prompt a pause (teacher might use a hand signal), and reducing the stakes of mistakes so the cost of impulsive errors feels manageable. If impulsivity is significantly impairing learning or friendships and is not improving with consistent management, discuss a formal assessment for ADHD with your paediatrician — early identification and support makes a significant difference.',
      },
      {
        key: 'chore_refusal',
        patterns: [
          '{{child_name}} refuses to do any chores',
          'getting {{child_name}} to tidy their room is a war',
          'should I pay {{child_name}} for helping around the house',
        ],
        response:
          'The connection between children doing household chores and adult outcomes is one of the most robust in longitudinal developmental research — children who do regular household tasks develop greater sense of responsibility, better executive function, and stronger social-emotional skills than those who don\'t. The challenge is getting there without the relationship becoming one long daily negotiation.\n\nThe most effective approach is early and embedded: children who have always had small responsibilities find them normal and unremarkable. At 5–8 years, reasonable expectations include tidying their own belongings, helping with simple meal preparation, putting laundry away, and caring for pets. Make tasks part of the routine rather than a special request. For the paying question: small, genuine allowance not tied to chores builds financial literacy; some families link bonus amounts to above-and-beyond contributions. Tying basic household contributions to payment creates a transactional relationship with family responsibility that most family therapists advise against.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'beh-60-sustains-task',
        'Sustains attention on a self-chosen or required task for at least 10 minutes without adult prompting to continue',
        72,
        'Is {{child_name}} able to work on a task (homework, drawing, building) for at least 10 minutes without you needing to redirect them back to it?',
      ],
      [
        'beh-60-delay-gratification',
        'Demonstrates basic delay of gratification — can wait for a preferred item or activity for a short period when given a reason',
        72,
        'If you tell {{child_name}} they can have something they want after they finish a task, can they generally wait and complete the task rather than abandoning it for the immediate reward?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-60-adhd-screen',
        description:
          'Pervasive, impairing inattention and/or hyperactivity-impulsivity across home and school settings, present for more than 6 months',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} is significantly inattentive and/or hyperactive-impulsive in multiple settings (home and school), this has been present for more than 6 months, it is impairing academic and social functioning, and is beyond what is expected for developmental age',
        action:
          'Request a formal ADHD assessment through your paediatrician. This involves structured assessment across home and school settings. Early diagnosis and support dramatically improves outcomes.',
        referral: 'Developmental Paediatrician or Paediatric Neurologist',
      },
    ],
    coping: {
      normalizations: [
        'The daily homework battle is one of the top three most commonly reported sources of family stress in school-age parenting — if this is your household too, you are not alone.',
        'Having a naturally impulsive child in a school system designed for sustained, compliant attention is genuinely hard on both the child and the parent — the mismatch is real.',
      ],
      strategies: [
        'Invest effort in the structure and routine around homework rather than in the content of individual homework fights — a well-established routine that {{child_name}} internalises is worth more than any individual battle won.',
        'Establish a clear "off duty" parental signal for evenings — a specific time when homework and screens are settled and the relationship is just relationship.',
      ],
      selfCare: [
        'The cognitive and emotional labour of managing a school-age child\'s routine, homework, friendships, and behaviour is invisible to everyone except the parent doing it — acknowledging that it is work is the first step to not being silently depleted by it.',
        'Give yourself explicit permission to not be your child\'s teacher, entertainment director, and behavioural manager in the same evening — some evenings are just coexistence, and that is fine.',
      ],
      partner:
        'School-age homework routines are a frequent source of couple disagreement — one parent more involved, different standards, different reactions to struggle. The most important agreement is about which parent is on duty for which part of the evening, with minimal second-guessing of the on-duty parent\'s approach.',
      warnings: [
        'If {{child_name}}\'s teacher has raised concerns about attention, impulsivity, or learning more than once, take these seriously and seek a paediatric assessment — teachers see comparative samples every day and are reliable reporters of what is beyond typical.',
        'If homework battles are causing significant family relationship damage nightly, it is worth exploring whether a homework holiday (arrangement with the school to pause take-home work) while you establish a workable routine might be appropriate.',
      ],
    },
    evidence:
      'Barkley (2012) Executive Functions: What They Are, How They Work, and Why They Evolved; Rhoades et al. (2011) The role of executive functions in children\'s performance in school, Early Education and Development; Dunn (2013) Self-regulation in early childhood, in Handbook of Self-Regulatory Failure (Baumeister & Vohs, eds.); Markham (2012) Peaceful Parent, Happy Kids.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8 – 12 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Independence, Negotiation, and the Shift in Family Dynamics',
    whatToExpect:
      'Middle childhood is a period of gradual handover — {{child_name}} is increasingly capable of self-directed activity, is developing their own social life, and is beginning to negotiate rather than simply comply or rebel. The family dynamic shifts from management to collaboration, and the behavioural challenges evolve from impulse control to more complex questions of independence, responsibility, and the growing influence of peers.',
    keyMessage:
      'Your authority over {{child_name}} is shifting from positional to relational — respect earns cooperation more than command.',
    dailyTips: [
      'Move from monitoring to check-in: "How did that go?" rather than standing over {{child_name}}.',
      'Give {{child_name}} genuine areas of self-management with real responsibility and real consequences.',
      'Negotiate rules rather than dictate them where possible — {{child_name}} will comply with rules they helped create.',
    ],
    doList: [
      'Involve {{child_name}} in establishing household expectations and natural consequences.',
      'Hold {{child_name}} responsible for their responsibilities — completing homework, managing belongings, keeping agreements.',
      'Express confidence in {{child_name}}\'s judgment specifically and regularly.',
    ],
    dontList: [
      'Don\'t micro-manage at this age — the cost to the relationship and to {{child_name}}\'s developing competence outweighs the short-term compliance benefit.',
      'Don\'t punish {{child_name}} for expressing an opinion that differs from yours, even forcefully.',
      'Don\'t treat normal pushback on limits as serious defiance requiring escalation.',
    ],
    activities: [
      [
        'Family Meeting',
        'Hold a brief weekly family meeting — 15–20 minutes, same time each week — where the agenda includes: good things from the week, any concerns or issues from any family member (including {{child_name}}), and any rule or agreement changes needed. Give {{child_name}} equal agenda-setting rights. This models democratic problem-solving, gives {{child_name}} a legitimate channel for concerns, and reduces the number of unilateral rule arguments.',
        20,
        'Once weekly — a consistent family ritual',
      ],
      [
        'Responsibility Ladder',
        'Together with {{child_name}}, create a "responsibility ladder" — a progression of increasing independence in a specific domain (going to the park alone, managing their own homework, handling their pocket money) with clear milestones. Each rung requires demonstrated competence at the previous level. This externalises the independence-granting process from parental whim to a shared agreement, reducing conflict about "why can\'t I yet."',
        25,
        'Create once per domain; review as milestones are reached',
      ],
    ],
    topics: [
      {
        key: 'negotiation_and_argument',
        patterns: [
          '{{child_name}} argues with every single rule',
          '{{child_name}} negotiates everything and won\'t just accept a no',
          'my 10 year old has a counter-argument for everything',
        ],
        response:
          'A child who argues with rules and generates counter-arguments is developing exactly the cognitive and social skills that will serve them well as adults: understanding that rules have reasons, that authority can be questioned, that negotiation is a valid social tool. The fact that this is exhausting to parent does not make it pathological.\n\nThe key distinction is between negotiation (acceptable) and non-compliance after the final decision (not acceptable). You can engage with {{child_name}}\'s arguments, acknowledge good points, and still make a final decision. "That\'s a fair point — I\'ll think about it" is different from "okay, fine" after every argument. Establish a clear signal for when discussion is over: "I\'ve heard your argument. My decision stands for today. We can revisit this at our family meeting." {{child_name}} who has a legitimate channel for arguments (family meeting, designated discussion time) is more likely to accept final decisions.',
      },
      {
        key: 'chores_and_responsibility',
        patterns: [
          '{{child_name}} won\'t do their chores without being asked fifty times',
          'how do I get {{child_name}} to take responsibility for their own things',
          '{{child_name}} is old enough to be more independent but won\'t step up',
        ],
        response:
          'The gap between capability and initiative in middle childhood is one of the most reliably reported parenting frustrations of this age. {{child_name}} is capable of more than they spontaneously do — and this is often interpreted as laziness or defiance when it is frequently about the habit architecture not being in place.\n\nHabits are built through repetition, not reminding. The goal is to establish routines where completing the chore is the path of least resistance — not because {{child_name}} has been threatened into it, but because the sequence is so habitual it requires less decision-making. The science on this is clear: reducing friction (chores that are easy to find, well-defined, not dependent on parent initiation) is more effective than increasing motivation (rewards, punishments). Work with {{child_name}} to identify which responsibilities they can own completely, then step back and allow natural consequences to operate when they are not completed.',
      },
      {
        key: 'peer_influence',
        patterns: [
          '{{child_name}} is doing things because their friends do them',
          '{{child_name}}\'s friend group is a bad influence',
          '{{child_name}} is changing to fit in with certain peers',
        ],
        response:
          'Peer influence in middle childhood is developmentally normal and actually serves an important function: {{child_name}} is learning to navigate a social world independent of family, and peer relationships are the training ground for adult social life. The question is not whether {{child_name}} is influenced by peers (they are, and will be increasingly so through adolescence) but whether {{child_name}} has a strong enough internal compass to navigate that influence.\n\nThe most effective protective factor against negative peer influence is the quality of the parent-child relationship and the strength of {{child_name}}\'s own values. Direct criticism of specific friends tends to push {{child_name}} towards those friends rather than away. Instead: stay curious about {{child_name}}\'s social world, ask about the friends genuinely and non-judgmentally, and create conditions where {{child_name}}\'s own values are regularly discussed and examined. If a specific friendship is genuinely concerning (exposure to substance use, dangerous behaviour), address the behaviour directly rather than the friend: "I\'m not comfortable with what you described happening at that party — let\'s talk about it."',
      },
      {
        key: 'screen_management',
        patterns: [
          'the gaming is taking over {{child_name}}\'s life',
          '{{child_name}} is secretive about what they do online',
          'how do I manage social media at this age',
        ],
        response:
          'Digital behaviour management in middle childhood requires a combination of clear structural limits (agreed in advance, not negotiated nightly) and ongoing, curious conversation. The most effective digital safety strategy is maintaining a relationship where {{child_name}} feels they can tell you about something that happened online without certainty of immediate device confiscation.\n\nFor gaming: agreed daily limits (not in the moment), a clear end-of-gaming routine, and gaming visible to family rather than in bedrooms are the most evidence-supported structural interventions. For social media: most mainstream platforms require a minimum age of 13. Before that age, the research on social comparison, appearance content, and mental health in this age group consistently supports delaying access. When social media does begin, regular curious check-ins ("who do you follow — show me some of what you look at") are more protective than monitoring software alone. If {{child_name}} is secretive, the most important intervention is curiosity about why — secrecy about online life typically follows a situation where {{child_name}} has learned that honesty leads to device removal.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'beh-96-self-initiated-responsibility',
        'Completes at least one regular household responsibility without reminder, on a consistent basis',
        108,
        'Is there any regular responsibility (setting the table, feeding a pet, tidying their room once a week) that {{child_name}} completes without needing to be asked most of the time?',
      ],
      [
        'beh-96-manages-conflict',
        'Resolves a minor conflict with a peer or sibling independently — without requiring adult arbitration — using negotiation or problem-solving',
        120,
        'Has {{child_name}} ever sorted out a disagreement with a friend or sibling on their own — coming to a compromise without you having to step in?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-96-oppositional',
        description:
          'Persistent pattern of angry, defiant, or vindictive behaviour towards authority figures lasting more than 6 months and significantly impairing family and school functioning',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} regularly loses temper, argues with adults, actively defies reasonable requests, deliberately annoys others, blames others for their own mistakes, and has been doing so consistently for more than 6 months across home and school',
        action:
          'Seek paediatric assessment. A pattern meeting clinical criteria for Oppositional Defiant Disorder (ODD) responds well to early family-based intervention. Rule out underlying ADHD, anxiety, or depression which commonly present with oppositional behaviour.',
        referral: 'Child Psychologist or Developmental Paediatrician',
      },
    ],
    coping: {
      normalizations: [
        'The shift from managing a child to negotiating with one can feel like a loss of control — many parents of middle childhood children describe mourning the simpler authority structures of the toddler years.',
        'The gradual withdrawal of moment-to-moment oversight that healthy development requires from you is genuinely hard — investing in other domains of meaning and identity alongside parenting helps.',
      ],
      strategies: [
        'Pick the 3–4 domains where consistency matters most to you (safety, school, basics of respect) and invest your authority capital there — being flexible on everything else makes the consistent limits more powerful.',
        'When you and {{child_name}} have reached an impasse, call a brief adjournment: "Let\'s both take 10 minutes and come back to this" — this models emotional regulation and gives both of you time to de-escalate.',
      ],
      selfCare: [
        'The relational quality of parenting a 9–12 year old is more demanding in some ways than earlier stages because you are managing a genuine other person rather than a dependency — invest in your own relationships and interests as a parallel track.',
        'Noticing and naming what {{child_name}} does well — specific, honest, regular — is genuinely protective for the relationship and is itself a restorative act for parents who feel the conflict outweighs the connection.',
      ],
      partner:
        'Middle childhood is when single-parent households and divided-family households face some of the most complex co-parenting challenges — different rules in different houses, peer group management, digital supervision. If co-parenting is difficult, a brief session with a family therapist specifically on developing a consistent approach is worth the investment.',
      warnings: [
        'If your relationship with {{child_name}} feels consistently adversarial — more argument than connection across weeks — this is worth addressing proactively through family therapy rather than waiting for it to resolve with adolescence, which tends to intensify relational patterns rather than resolve them.',
        'Secretiveness that escalates to lying about whereabouts, friends, or activities in middle childhood is worth taking seriously — the question is what {{child_name}} believes needs to be hidden and why.',
      ],
    },
    evidence:
      'Steinberg & Silk (2002) Parenting adolescents, in Handbook of Parenting Vol.1 (Bornstein, ed.); Frick et al. (2014) Callous-unemotional traits in predicting the severity and stability of conduct problems and delinquency, Journal of Abnormal Child Psychology; Gardner et al. (2019) Screen time guidelines for children, BMJ.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12 – 15 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'Risk-Taking, Brain Development, and Peer Influence',
    whatToExpect:
      'Early adolescence is a neurologically distinct period in which the reward and risk systems of the brain (limbic system) are highly active while the regulatory and consequence-weighing systems (prefrontal cortex) are still under construction. {{child_name}} is genuinely more likely to take risks, to weight immediate rewards over future consequences, and to be influenced by peers in risk decisions than at any other developmental stage. This is biology, not failure of values.',
    keyMessage:
      'Risk-taking is not a character flaw — it is what the adolescent brain is built to do. Your job is to reduce harm, not eliminate the drive.',
    dailyTips: [
      'Know who {{child_name}} is with, where they are, and what they are doing — not as surveillance, but as the basic safety net every adolescent needs.',
      'Make your home the place friends come to — being present in that environment is more informative than any interrogation.',
      'Have conversations about risk directly and without catastrophising — normalising the topic is more protective than avoidance.',
    ],
    doList: [
      'Discuss specific risk scenarios (drinking, drugs, online behaviour) matter-of-factly, from a harm-reduction perspective.',
      'Establish a "no questions asked" call or text agreement — {{child_name}} can always contact you for extraction from a difficult situation.',
      'Maintain connection even when rules are broken — the relationship is more important than the compliance.',
    ],
    dontList: [
      'Don\'t use fear or graphic consequences as the primary deterrent — research consistently shows this backfires with adolescents.',
      'Don\'t over-surveil — monitoring that {{child_name}} discovers produces a countermeasure strategy, not changed behaviour.',
      'Don\'t respond to risk disclosure by removing access or contact — this teaches {{child_name}} not to tell you.',
    ],
    activities: [
      [
        'The "No Questions Asked" Agreement',
        'Formalise an agreement with {{child_name}}: if they are ever in a situation that feels unsafe — at a party, in a car, with someone behaving dangerously — they can call or text you without any questions asked that night. You will come and get them. There will be a debrief conversation later, but not that night. Research on adolescent risk outcomes consistently identifies parent extractability as a key protective factor.',
        20,
        'Establish as a one-time conversation; reaffirm periodically',
      ],
      [
        'Risk Scenario Discussion',
        'Using real news stories, films, or hypothetical scenarios, have occasional conversations with {{child_name}} about specific risky situations: "If your friend had too much to drink at a party, what would you do?" These conversations build {{child_name}}\'s pre-planned response to situations they haven\'t encountered yet. A teenager who has mentally rehearsed a scenario responds more effectively when it occurs than one who is making the decision for the first time under pressure and peer observation.',
        20,
        'Monthly or when relevant scenarios arise in news or conversation',
      ],
    ],
    topics: [
      {
        key: 'risk_behaviour',
        patterns: [
          'I found out {{child_name}} has been drinking at parties',
          '{{child_name}} was caught shoplifting',
          '{{child_name}} lied about where they were',
        ],
        response:
          'Discovering that {{child_name}} has taken a risk — drinking, shoplifting, lying about whereabouts — is frightening and often feels like a failure of parenting. Before responding, it is worth knowing that experimental risk-taking in early adolescence is statistically typical, that the brain is genuinely biased towards it at this developmental stage, and that the most important variable in adolescent outcomes is not the behaviour itself but the quality of the relationship and communication around it.\n\nThe most effective parental response is in two parts: first, a brief and genuine acknowledgment of your own emotional response (scared, angry, disappointed — {{child_name}} can handle this and it is authentic); second, a move to curiosity and problem-solving rather than punishment escalation. "What happened? What was going through your mind?" is a more productive conversation than "how could you do this." The research on adolescent risk outcomes consistently shows that warm, connected parents who maintain communication through rule violations have better outcomes than parents whose response drives disclosure underground.',
      },
      {
        key: 'peer_pressure',
        patterns: [
          '{{child_name}} is doing things to fit in that I\'m not comfortable with',
          'how do I help {{child_name}} resist peer pressure',
          '{{child_name}}\'s friend group is pushing limits I set',
        ],
        response:
          'Peer influence in early adolescence is not simply "pressure" that {{child_name}} is either strong enough to resist or not — it is a genuine feature of adolescent social cognition. The presence of peers literally increases risky decision-making in adolescents at a neurological level (increased activation of reward systems) in a way that does not occur in adults. This is one of the most robust findings in adolescent neuroscience.\n\nThe most effective protection is not resilience training or anti-peer-pressure scripts, though these have some value. It is the combination of: a strong parent-child relationship where {{child_name}}\'s own values are regularly explored and affirmed, a peer group with broadly prosocial norms (this is the single most powerful environmental protective factor), structured activities that provide belonging without risk (sport, music, drama), and the "no questions asked" extraction agreement. Direct criticism of specific peers rarely works and usually damages the relationship with you more than the relationship with the peer.',
      },
      {
        key: 'digital_risk',
        patterns: [
          'I found disturbing content on {{child_name}}\'s phone',
          '{{child_name}} is talking to strangers online',
          'there is a concerning situation developing on {{child_name}}\'s social media',
        ],
        response:
          'Online risk situations in early adolescence are common, increasingly varied, and require a response that is proportionate to the actual risk rather than reactive to the horror of discovery. The most important first step is to understand what you are actually looking at before responding: is this a one-time concerning exposure (seeing something disturbing), an ongoing risky relationship (talking to an unknown adult), or an imminent safety concern (someone threatening, grooming content)?\n\nFor one-time exposures: a curious, non-alarmist conversation about what {{child_name}} saw and what they made of it is both more informative and more protective than immediate device confiscation. For concerning online relationships with unknown adults: this requires immediate, calm intervention — "I need you to tell me about this person" — and potentially a report to the school or police depending on what is disclosed. The critical thing is to remain the person {{child_name}} can come to — the response to this disclosure will determine whether future disclosures happen.',
        boundary: true,
      },
      {
        key: 'substance_conversation',
        patterns: [
          'how do I talk to {{child_name}} about drugs and alcohol',
          'what is the right age to have the substances conversation',
          '{{child_name}} is asking me questions about cannabis',
        ],
        response:
          'The most effective time to have an honest conversation about alcohol, cannabis, and other substances is before {{child_name}} encounters them, not after. Research on adolescent substance use consistently shows that open, accurate, non-catastrophising parental communication is associated with delayed onset of use, reduced problematic use, and greater likelihood of {{child_name}} coming to you when a substance situation arises.\n\nWhat does not work: scare tactics, extreme exaggeration of consequences, or refusal to discuss. What works: factual information about what substances actually do to the developing brain (different from adult brain — adolescent brain is more vulnerable to lasting effects), honest discussion of risk rather than "never do this," and explicit statements of your own values and concerns. Including {{child_name}}\'s own curiosity and questions rather than delivering a lecture increases engagement and retention. If you are unsure of the facts, look them up together.',
      },
    ],
    milestones: [
      [
        'beh-144-autonomous-problem-solving',
        'Independently identifies and implements a solution to a social or practical problem without requiring adult prompting or rescue',
        156,
        'Has {{child_name}} ever dealt with a difficult situation (a conflict with a friend, a logistical problem) completely on their own and come back to tell you how they handled it?',
      ],
      [
        'beh-144-discloses-problems',
        'Voluntarily discloses a problem or mistake to a trusted adult without being discovered — demonstrating that the relationship feels safe for honesty',
        168,
        'Has {{child_name}} ever come to you to tell you something difficult — a mistake, a problem, a worry — that you had not already found out about? That they told you themselves?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-144-conduct',
        description:
          'Pattern of serious conduct problems: persistent lying, stealing, aggression, truancy, or engagement in illegal activities significantly beyond peer norms',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} is regularly engaging in behaviours that significantly violate social norms (consistent stealing, serious aggression, persistent truancy) that have not responded to parental management and are present across multiple settings',
        action:
          'Seek paediatric referral for assessment. A clinical-level conduct profile warrants evaluation for underlying ADHD, learning disability, trauma, depression, or anxiety — which frequently underlie conduct presentations. Family therapy alongside individual assessment is often recommended.',
        referral: 'Child and Adolescent Mental Health Service (CAMHS)',
      },
    ],
    coping: {
      normalizations: [
        'Discovering that your child has been engaging in risk behaviour you didn\'t know about is a genuinely frightening experience, and the instinct to lock everything down is completely understandable — it is also usually counterproductive.',
        'Early adolescent risk-taking that stays within the statistical norm for this age does not predict adult problems — the majority of adolescents who experiment with risk behaviours do not go on to develop clinical difficulties.',
      ],
      strategies: [
        'Develop your own clear hierarchy of risks — non-negotiable (safety-critical) versus serious concern versus expected experimentation — and respond proportionately rather than with the same intensity to everything.',
        'Build "soft surveillance" — being physically present, knowing friends\' parents, maintaining home as a social hub — rather than digital surveillance, which adolescents reliably circumvent and which damages trust when discovered.',
      ],
      selfCare: [
        'The anxiety of parenting an early adolescent who is actively taking risks is one of the most sustained sources of parental stress — and it is very rarely something you can solve by working harder. Maintaining your own calm is both self-care and strategic parenting.',
        'Find at least one parent in a similar situation who you can speak honestly with — the social isolation of parenting a teenager through a difficult period is a significant risk factor for parental mental health.',
      ],
      partner:
        'Risk behaviour by a teenager frequently creates sharp couple disagreement about severity and response — one parent more alarmed, one more permissive. Reach an agreed risk hierarchy and agreed response protocol when you are both calm, not in the immediate aftermath of a discovery.',
      warnings: [
        'If {{child_name}} has had more than two significant risk incidents within a short period, the pattern warrants a professional assessment rather than escalating home management — this density of risk behaviour usually indicates something that the family system alone cannot address.',
        'If {{child_name}}\'s risk behaviour is combined with significant withdrawal from the family, a dramatic change in friend group, decline in school functioning, and changes in mood — this clinical picture warrants a mental health assessment as a priority.',
      ],
    },
    evidence:
      'Steinberg (2007) Risk taking in adolescence: New perspectives from brain and behavioral science, Current Directions in Psychological Science; Gardner & Steinberg (2005) Peer influence on risk taking, risk preference, and risky decision making in adolescence and adulthood, Developmental Psychology; Dishion & McMahon (1998) Parental monitoring and the prevention of child and adolescent problem behavior, Clinical Child and Family Psychology Review.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 15 – 18 years
  // ─────────────────────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Self-Regulation Maturity and the Transition to Responsible Independence',
    whatToExpect:
      'Late adolescence sees meaningful consolidation of self-regulation — {{child_name}} is increasingly able to think through consequences, delay gratification, manage emotional responses, and act in line with their own stated values. The remaining gap between intention and action reflects the final maturation of prefrontal circuitry, which completes in the mid-twenties. The behavioural work of this stage is about internalising responsibility: {{child_name}} increasingly becomes the author of their own choices and their own life.',
    keyMessage:
      'Your goal is to raise a person who makes good decisions when you are not watching — invest in the internal compass, not just the external rules.',
    dailyTips: [
      'Reduce external monitoring in proportion to demonstrated competence — earned autonomy is the most powerful motivator of responsible behaviour.',
      'Have conversations about consequences in advance of situations, not in the aftermath of failures.',
      'Acknowledge and name specific instances of good judgment: "I noticed how you handled that — that was thoughtful."',
    ],
    doList: [
      'Allow {{child_name}} to experience the full natural consequences of their choices where these are not safety-critical.',
      'Treat {{child_name}} as a collaborative partner in household decisions that affect them.',
      'Have explicit conversations about values, ethics, and decision-making frameworks — {{child_name}} is genuinely ready for this.',
    ],
    dontList: [
      'Don\'t rescue {{child_name}} from the consequences of choices they made freely — this robs them of the most important data they have about decision-making.',
      'Don\'t make autonomy conditional on compliance with your specific preferences — that is not autonomy.',
      'Don\'t compare this teenager to who they were at 12 or 13 — the regulatory capacity has genuinely grown.',
    ],
    activities: [
      [
        'The Annual Agreement Review',
        'Once a year, sit down with {{child_name}} and review the household agreements — curfew, digital use, contributions, expected communication. What has changed in the past year? What responsibilities is {{child_name}} ready to take on? What freedoms has {{child_name}} demonstrated they can manage? This makes autonomy expansion an explicit, annual, collaborative process rather than a source of constant negotiation.',
        45,
        'Annually — works well around a birthday or new school year',
      ],
      [
        'Consequential Decision Practice',
        'When {{child_name}} faces a significant decision (a commitment, a friendship choice, a moral dilemma), practise the "thinking through consequences" conversation together: "What are your options? What happens if you choose each one? What are your values telling you?" Your role is facilitation, not direction. This builds the decision-making framework that {{child_name}} will use without you.',
        30,
        'When significant decisions arise — not manufactured but genuine',
      ],
    ],
    topics: [
      {
        key: 'breaking_curfew',
        patterns: [
          '{{child_name}} came home later than agreed',
          '{{child_name}} ignored the curfew we set',
          'what is an appropriate response when {{child_name}} breaks an agreement',
        ],
        response:
          'Curfew violations in late adolescence are among the most common rule transgressions and carry a specific developmental weight — they are often the first test of whether {{child_name}}\'s agreement-making and agreement-keeping systems are aligned. A single violation after a pattern of compliance is very different from a persistent pattern of violations.\n\nThe most effective response to a curfew violation is a conversation when everyone is calm — not the night of, when everyone is stressed — that focuses on two things: what happened (from {{child_name}}\'s perspective) and what the consequence will be (you determine this, with some proportionality). The consequence should be clear, time-limited, and directly related to the violated trust: a reduced window of autonomy that can be rebuilt with demonstrated reliability. Excessive punishment for a single violation is counterproductive and damages the relationship without building the reliability. A pattern of violations requires a more significant structural response.',
      },
      {
        key: 'autonomy_and_trust',
        patterns: [
          '{{child_name}} says I don\'t trust them',
          '{{child_name}} wants more freedom than I\'m comfortable giving',
          'how do I know when to give more independence',
        ],
        response:
          'The late adolescent push for autonomy is one of the most direct tests of the parenting relationship — and {{child_name}}\'s argument that trust is being withheld is often at least partly correct. Many parents extend autonomy based on age rather than demonstrated competence, or restrict it based on general anxiety rather than specific evidence of poor judgment. Neither serves {{child_name}} well.\n\nA framework that works: autonomy is earned through demonstrated competence in specific domains, not granted wholesale or withheld globally. "Show me you can manage X and I will be confident giving you Y" is a testable, fair proposition. Make the criteria explicit: "I\'ll be comfortable with later curfews when I see consistent communication about where you are and reliable return at agreed times." This moves the conversation from trust (subjective) to evidence (discussable) and gives {{child_name}} a genuine pathway to the autonomy they are seeking.',
      },
      {
        key: 'accepting_consequences',
        patterns: [
          '{{child_name}} is not learning from consequences',
          '{{child_name}} makes the same mistake repeatedly',
          'how do I help {{child_name}} take responsibility for their choices',
        ],
        response:
          'The gap between experiencing a consequence and changing the behaviour that produced it is often larger in adolescence than parents expect. This is partly neurological (the prefrontal systems that connect present-choice to future-outcome are still maturing), partly because the emotional salience of the immediate context (friends, fun, belonging) genuinely outweighs the anticipated consequence, and partly because some mistakes need to be made multiple times before the lesson is actually learned.\n\nWhat accelerates this learning is not escalating the consequence but improving the quality of the reflection conversation: "That has happened twice now — what do you make of that?" asked with genuine curiosity (not accusation) invites {{child_name}} to develop their own insight rather than defending against your judgment. The goal is {{child_name}} developing a relationship with their own pattern of behaviour — noticing it, naming it, and choosing to respond differently. That is a process that cannot be fully outsourced to parental consequence.',
      },
      {
        key: 'preparing_for_adulthood',
        patterns: [
          'how do I make sure {{child_name}} is ready to live independently',
          '{{child_name}} is heading to university and hasn\'t learned any practical life skills',
          'I\'ve done everything for {{child_name}} and now I\'m worried',
        ],
        response:
          'The transition to independent living requires a set of practical, relational, and self-regulatory competencies that can only be built through practice — not through instruction in the months before departure. If {{child_name}} is approaching 18 and has not been managing their own laundry, budgeting basic money, cooking simple meals, and navigating their own appointments, these skills need to be built now, through doing rather than watching.\n\nFor the next year, deliberately and explicitly transfer these responsibilities: {{child_name}} makes their own medical appointments, manages their own money for a defined category of expenses, cooks dinner one night a week, and handles their own laundry entirely. Accept that this will be done imperfectly. The imperfect execution at home with a safety net is the learning; the alternative is imperfect execution alone at 18 with no safety net. Also prepare for the reality that the transition itself — however practical competent {{child_name}} is — carries genuine emotional weight for both of you that is worth anticipating and discussing.',
        boundary: true,
      },
    ],
    milestones: [
      [
        'beh-180-self-directed-compliance',
        'Meets most key responsibilities (schoolwork, commitments, agreements) without external reminders on a consistent basis',
        204,
        'Is {{child_name}} reliably meeting their key responsibilities — getting to school, completing schoolwork, keeping agreements — without you needing to manage or remind them most of the time?',
      ],
      [
        'beh-180-ethical-reasoning',
        'Can articulate a considered ethical position on a real dilemma — identifying competing values, likely consequences, and their own reasoned judgment',
        192,
        'In a conversation about a real or hypothetical ethical dilemma, does {{child_name}} engage with the complexity — identifying more than one side, acknowledging uncertainty, and offering their own reasoned view?',
      ],
    ],
    redFlags: [
      {
        id: 'rf-beh-180-substance-use',
        description:
          'Regular substance use (alcohol or cannabis more than weekly, or any use of higher-risk substances) significantly impairing daily functioning, school attendance, or relationships',
        severity: 'discuss_with_ped',
        pattern:
          '{{child_name}} is using alcohol or cannabis regularly (more than once per week), this is impairing school attendance or performance, {{child_name}} is unable to maintain commitments due to substance use, or there is use of any substance beyond alcohol or cannabis',
        action:
          'Seek a paediatric consultation specifically focused on substance use. Adolescent substance use disorders respond best to early intervention. Motivational interviewing-based approaches have the strongest evidence base for this age group.',
        referral: 'Adolescent Mental Health Service or Substance Use Service',
      },
    ],
    coping: {
      normalizations: [
        'The final letting-go of late adolescence — watching {{child_name}} make decisions you would not make, with consequences you cannot control — is one of the hardest psychological transitions in parenting.',
        'Most parents of late teenagers experience a complex mixture of pride, grief, anxiety, and relief as the handover approaches — all of these are legitimate responses to a genuinely significant transition.',
      ],
      strategies: [
        'Distinguish between risks that are yours to manage (genuine safety) and risks that are {{child_name}}\'s to manage (their own choices with manageable consequences) — trying to manage both is both exhausting and counterproductive.',
        'Invest your parenting energy at this stage in the quality of the relationship and the quality of your conversations — the structure and rules matter less than the connection through which they are held.',
      ],
      selfCare: [
        'As {{child_name}}\'s daily need for you reduces, noticing and tending to what else gives your life meaning is not self-indulgence — it is the necessary preparation for the next phase of your own life.',
        'If the approaching empty nest or {{child_name}}\'s independence is producing significant anxiety or grief in you, this is worth exploring — a few sessions with a therapist specifically on the identity transition of late parenting is time well spent.',
      ],
      partner:
        'The late-adolescence transition is one of the most relationship-revealing phases of parenting — with {{child_name}} less central to the daily structure, couples discover what remains between them. Use this period proactively rather than waiting for the empty nest to discover the answer.',
      warnings: [
        'If you find yourself unable to allow {{child_name}} to experience natural consequences — repeatedly rescuing, excuse-making, or problem-solving on {{child_name}}\'s behalf — examine honestly whether this is serving {{child_name}}\'s development or your own anxiety management.',
        'Late adolescent substance use that goes unaddressed because confronting it risks the relationship creates a worse outcome than the difficult conversation — seek professional support in framing the conversation if you cannot have it alone.',
      ],
    },
    evidence:
      'Arnett (2004) Emerging Adulthood: The Winding Road from the Late Teens through the Twenties; Lerner & Steinberg (2009) Handbook of Adolescent Psychology 3rd Ed.; Dishion et al. (2012) A developmental model of negative peer influence, in Peer Influence Processes Among Youth (Vitaro & Dodge, eds.); National Institute on Drug Abuse (2020) Principles of Adolescent Substance Use Disorder Treatment.',
  },
]
