/**
 * Nutrition Habits Domain — Growth Track Data
 *
 * Philosophy: Ellyn Satter's Division of Responsibility — parents decide what,
 * when, and where. Children decide whether and how much. Food is connection,
 * culture, and joy — never a battleground.
 */
import type { TrackData } from './growth-track-factory'

export const TRACKS: TrackData[] = [
  // ── 0–3 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '0-3mo',
    ageMin: 0,
    ageMax: 3,
    title: 'First Feeds: Learning the Language of Hunger',
    whatToExpect:
      'Your newborn is born with an exquisite hunger-satiety system — they know exactly when they are hungry and when they are full. Your job right now is to read those cues and respond, not to manage a schedule or volume.',
    keyMessage: 'Feed the baby in front of you, not the clock or the chart.',
    dailyTips: [
      'Watch for early hunger cues — rooting, hand-to-mouth, stirring — before crying starts; crying is a late cue and makes latching harder.',
      'Breast-fed newborns typically nurse 8–12 times in 24 hours; this frequency builds your supply and is not a sign of insufficient milk.',
      'One wet diaper per day of life in the first week (6+ by day 6) is the simplest output check that feeding is going well.',
    ],
    doList: [
      'Feed on demand (or "cue-based") rather than on a fixed schedule in the first 4–6 weeks.',
      'Allow the baby to finish the first breast before offering the second — hindmilk matters.',
      'Skin-to-skin contact in the first hour after birth and during early feeds supports milk let-down and latch.',
    ],
    dontList: [
      'Don\'t watch the clock during a feed — some babies are slow, leisurely feeders and that is fine.',
      'Don\'t supplement with formula without a medical indication in the first days — this can reduce breast-milk supply before it is established.',
      'Don\'t try to "tank up" before bed by overfeeding; a newborn\'s stomach is the size of a marble at birth and cannot safely hold extra.',
    ],
    activities: [
      [
        'Skin-to-Skin Time',
        'Hold your undressed baby against your bare chest for at least one feed per day. Warmth and heartbeat calm the baby and stabilise feeding cues.',
        20,
        'Daily',
      ],
      [
        'Feed Cue Journal',
        'For one week, note what your baby does just before crying — rooting, sucking fist, turning head. You\'ll quickly learn their personal early signals.',
        5,
        'Daily for 1 week',
      ],
    ],
    topics: [
      {
        key: 'breastfeeding_challenges',
        patterns: [
          'milk not coming in',
          'baby not latching',
          'nipple pain',
          'worried not enough milk',
          'formula top-up',
        ],
        response: `It's incredibly common to feel uncertain about whether {{child_name}} is getting enough in the first weeks — you can't see what's going in the way you can with a bottle, and that uncertainty is exhausting. The most reliable signs that things are working are: your baby returns to birth weight by two weeks, has 6+ wet nappies by day 6, and is settling (even briefly) after most feeds.\n\nIf latching is painful beyond the first 30 seconds of a feed, or if {{child_name}} has fewer than 6 wet nappies per day past day 6, those are good reasons to ask for a lactation consultant review. A single session with an IBCLC can change everything. Pain-free breastfeeding is possible, and you don't have to white-knuckle through it.`,
      },
      {
        key: 'formula_feeding',
        patterns: [
          'formula feeding',
          'bottle feeding',
          'which formula',
          'how much formula',
          'formula schedule',
        ],
        response: `Formula feeding {{child_name}} is a completely valid choice — fed, calm, and connected is the goal, not the method. Standard infant formula regulated to WHO/national standards is nutritionally complete; you don't need the most expensive option on the shelf.\n\nFor amounts, a rough guide is 150–200 ml per kg per day in the first months, but more useful is pacing bottle feeds: hold the bottle horizontal, let the baby pause and suck rather than tipping milk in passively. This preserves the baby's own satiety signals and reduces overfeeding, which is the main nutritional risk with formula.`,
      },
      {
        key: 'feeding_frequency_worry',
        patterns: [
          'feeding too often',
          'cluster feeding',
          'feeding all the time',
          'baby always hungry',
          'growth spurt',
        ],
        response: `Cluster feeding — when {{child_name}} seems to want to feed every 45–60 minutes for several hours, usually in the evening — is completely normal and does not mean your milk supply is low. It is a growth spurt behaviour that typically lasts 1–3 days and then resolves. It is also the mechanism by which babies signal the breast to make more milk.\n\nThe hardest part is sitting with the uncertainty and the tiredness. If cluster feeding goes on for more than 4–5 days without any settling, that is worth mentioning to your paediatrician — but in the vast majority of cases it is a temporary, healthy phase.`,
      },
      {
        key: 'safe_formula_preparation',
        patterns: [
          'how to make formula',
          'boiling water formula',
          'formula hygiene',
          'sterilising bottles',
          'making bottles in advance',
        ],
        response: `Safe formula preparation for {{child_name}} uses water boiled and cooled to at least 70°C (to kill any bacteria in the powder) — this means boiling the kettle and waiting no more than 30 minutes before making the feed. Let the finished bottle cool under running cold water before offering it.\n\nYou can pre-measure the powder into a clean container and carry the cooled boiled water in a flask when out, mixing just before the feed. Pre-made liquid formula is the safest option away from home. Don't make batches in advance and refrigerate — the WHO recommends preparing each feed fresh.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_0_return_birth_weight',
        'Returns to birth weight',
        14,
        'Has {{child_name}} been weighed since leaving hospital — have they regained their birth weight by two weeks?',
      ],
      [
        'nut_0_feeding_rhythm',
        'Predictable feeding rhythm emerging',
        84,
        'Are you starting to notice a loose pattern to {{child_name}}\'s feeds and sleep — even if it\'s not a strict schedule yet?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_0_weight_loss',
        description: 'Weight loss >10% of birth weight or failure to regain birth weight by 2 weeks',
        severity: 'discuss_with_ped',
        pattern:
          'parent reports weight check showing significant loss, or baby still below birth weight at 2-week visit',
        action:
          'Ask the parent to bring their weight record. Arrange a same-week paediatric review if weight loss exceeds 10% or birth weight has not returned by day 14. A lactation consultant referral should accompany any feeding review.',
        referral: 'Lactation consultant (IBCLC); paediatric dietitian if weight gain remains poor beyond 4 weeks',
      },
    ],
    coping: {
      normalizations: [
        'Almost every new parent questions whether their baby is getting enough to eat — this doubt is nearly universal and does not reflect your competence.',
        'Breastfeeding is a learned skill for both you and your baby. The first two weeks are often the hardest, and it typically gets significantly easier.',
      ],
      strategies: [
        'Pick one trusted measure of feeding adequacy (wet nappies is the simplest) and check that daily — let go of the rest until your anxiety settles.',
        'If you are using a scale at home, weigh the baby once per day at the same time, not before and after every feed — that leads to anxiety spirals.',
      ],
      selfCare: [
        'Eating and drinking enough yourself directly affects breast-milk supply — keeping a water bottle and snacks next to your feeding spot is a medical recommendation, not a luxury.',
        'Night feeds are exhausting; if you have a partner, the non-feeding parent doing the nappy change and settle before and after the feed halves the sleep disruption.',
      ],
      partner:
        'Partners often feel helpless during breastfeeding. Concrete jobs — bringing water, doing burping, taking the baby skin-to-skin after a feed — make a real difference and keep the partner engaged in feeding even when they aren\'t doing the feeding.',
      warnings: [
        'If you feel dread, panic, or intense anger specifically when your baby latches (a skin-crawling feeling), this may be Dysphoric Milk Ejection Reflex (D-MER) — it is physiological, not psychological, and has specific management. Mention it to your doctor.',
        'Persistent sadness, inability to feel joy, or intrusive thoughts about harm coming to your baby beyond the first two weeks warrants a postnatal depression screen — feeding worry is sometimes an early presentation of PND.',
      ],
    },
    evidence:
      'WHO (2003) Global Strategy for Infant and Young Child Feeding. Satter E (1986) The feeding relationship. JADA 86(3):352-356. Renfrew MJ et al (2012) Breastfeeding promotion for infants in neonatal units — Cochrane Review. ABM Clinical Protocol #5: Peripartum Breastfeeding Management (2020 revision).',
  },

  // ── 3–6 months ──────────────────────────────────────────────────────────────
  {
    agePeriod: '3-6mo',
    ageMin: 3,
    ageMax: 6,
    title: 'Still on Milk, Watching the World Eat',
    whatToExpect:
      'Breast milk or formula remains the complete nutritional source for your baby through six months — no solids are needed yet, and introducing them too early is associated with increased allergy and obesity risk. Your baby is, however, becoming intensely interested in watching you eat, which is lovely preparation for later.',
    keyMessage: 'Interest in food is not readiness for food — watch for the three signs of solid readiness at 6 months.',
    dailyTips: [
      'Let your baby watch family meals from a bouncer or your lap — this exposure to the sight, smell, and social ritual of eating is early food education.',
      'If you are breastfeeding, your diet flavours your milk — varied maternal eating introduces your baby to a wide flavour palette before they ever have a spoon.',
      'Around 4 months many babies go through a "fussing at the breast" phase — this is distraction and developmental change, not a sign of low supply or readiness for solids.',
    ],
    doList: [
      'Continue exclusive breastfeeding or formula to 6 months (WHO recommendation) unless your paediatrician advises otherwise.',
      'Introduce a bottle occasionally if breastfeeding, so the baby will accept one if needed — the window for easy bottle acceptance can narrow after 4 months.',
      'Talk to your baby during feeds — feeding time is social and sensory learning time.',
    ],
    dontList: [
      'Don\'t add cereal to bottles to "fill up" the baby and extend sleep — this does not improve sleep and can overload immature kidneys.',
      'Don\'t interpret grabbing at your food or watching you eat as readiness for solids — these appear at 3–4 months; true readiness signs appear at around 6 months.',
      'Don\'t introduce fruit juice — it is not recommended before 12 months and displaces nutrient-dense milk feeds.',
    ],
    activities: [
      [
        'Family Table Observation',
        'Seat your baby in a supported chair at the table during at least one family meal per day. Narrate what you\'re eating in simple words — this builds food vocabulary and positive food associations.',
        20,
        'Daily',
      ],
      [
        'Flavour Priming via Breastfeeding',
        'If breastfeeding, eat one new vegetable or spice you want your baby to eventually enjoy, twice a week — garlic, cumin, broccoli, bitter greens. Research suggests this exposure reduces later vegetable refusal.',
        0,
        '2x weekly',
      ],
    ],
    topics: [
      {
        key: 'early_solids_pressure',
        patterns: [
          'starting solids at 4 months',
          'grandparents say start earlier',
          'baby seems hungry',
          'formula not enough',
          'when to start solids',
        ],
        response: `Family pressure to start solids early is one of the most common feeding tensions new parents face — grandparents often started solids at 3–4 months based on older guidance. Current WHO and AAP evidence is clear that exclusive milk feeding to around 6 months has the lowest allergy, infection, and obesity risk for most babies.\n\n{{child_name}} seeming hungry can have many explanations — a growth spurt, a developmental leap, shorter feeds due to distraction — none of which are solved by early solids. The three signs of readiness to look for around 6 months are: head control (baby holds head steady), sitting with support without slumping, and loss of the tongue-thrust reflex (baby no longer automatically pushes food out with the tongue).`,
      },
      {
        key: 'bottle_refusal',
        patterns: [
          'won\'t take a bottle',
          'refusing bottle',
          'only takes breast',
          'going back to work',
          'bottle introduction',
        ],
        response: `Bottle refusal is frustrating and stressful, especially if you need to return to work. The 3–4 month window is actually the most reliable time to introduce a bottle, so starting now gives you a good chance of success before {{child_name}} becomes more opinionated.\n\nTips that work: have someone other than the breastfeeding parent offer the bottle (your scent triggers the expectation of breast), offer when the baby is calm and slightly hungry (not frantically hungry), try different teat shapes, and try skin-to-skin bottle feeding. If refusal continues past a week of daily attempts, a feeding therapist can often resolve it in one or two sessions.`,
      },
      {
        key: 'supply_doubts_mid_age',
        patterns: [
          'milk supply dropping',
          'breast feels empty',
          'baby fussy after feeding',
          'not pumping much',
          'supply decreasing',
        ],
        response: `Around 3–4 months, breast milk production shifts from supply-driven-by-fullness to supply-driven-by-demand — breasts stop feeling engorged between feeds as they regulate. This is a maturation of supply, not a drop, and is frequently misread as "milk going away."\n\nThe signs that supply is genuinely insufficient are weight gain slowing on the growth chart, fewer than 5–6 wet nappies per day, and a baby who seems unsettled after every single feed for several days. Pumping output is an unreliable measure — many women who produce plenty pump small amounts. If {{child_name}}'s nappies and weight are good, trust that.`,
      },
      {
        key: 'cow_milk_protein_allergy',
        patterns: [
          'blood in nappy',
          'mucus in stool',
          'eczema',
          'reflux',
          'dairy allergy',
          'CMPA',
          'formula intolerance',
        ],
        response: `Symptoms like persistent eczema, blood-streaked stools, chronic runny nappy, or severe reflux in a formula-fed baby can sometimes indicate cow\'s milk protein allergy (CMPA) — this affects around 2–3% of infants and is medically managed, not a lifestyle choice. A paediatric review is appropriate if these symptoms are present.\n\nFor breastfed babies with the same symptoms, a 2–4 week maternal dairy elimination trial (done properly, with calcium supplementation) is the diagnostic standard. This is worth discussing with your doctor rather than doing alone, as dairy is hidden in many foods and a partial elimination gives misleading results.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_3_readiness_watching',
        'Shows interest in watching others eat',
        16,
        'Does {{child_name}} turn toward food smells or watch intently when others eat?',
      ],
      [
        'nut_3_tongue_thrust_fading',
        'Tongue-thrust reflex fading by 6 months',
        24,
        'If you touch {{child_name}}\'s lips with a clean finger or spoon, do they still automatically push it out with their tongue, or are they beginning to draw it in?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_3_cmpa_signs',
        description: 'Signs consistent with cow\'s milk protein allergy: blood in stool, severe eczema, persistent vomiting',
        severity: 'discuss_with_ped',
        pattern:
          'parent reports blood in nappy, mucusy stools, eczema not responsive to cream, or forceful vomiting at multiple feeds',
        action:
          'Arrange paediatric review. Do not advise maternal elimination or formula change without medical guidance — CMPA management requires a proper diagnostic protocol.',
        referral: 'Paediatric allergist or paediatric dietitian if CMPA confirmed',
      },
    ],
    coping: {
      normalizations: [
        'The hunger-cry is identical to many other types of crying at this age — it is genuinely hard to tell them apart, and "always feeding a hungry baby" is a myth sold to parents.',
        'Pumping less than you did at 6 weeks does not mean your supply dropped — it almost certainly means your body has regulated, which is a sign of success.',
      ],
      strategies: [
        'If you are anxious about supply, commit to a single weekly weight check for two weeks — if weight gain is on track, write that number down somewhere visible and refer back to it when doubt hits.',
        'For bottle refusal stress, set a calm 10-minute daily attempt and then stop — high-stakes marathon attempts increase both parent and baby stress and make refusal worse.',
      ],
      selfCare: [
        'Returning to work while breastfeeding is logistically complex — begin pumping practice 2–3 weeks before you return so you and your supply have time to adjust.',
        'Ask your employer about your legal right to pumping breaks and a private space — knowing this in advance reduces the anxiety of the transition.',
      ],
      partner:
        'The non-breastfeeding partner offering the bottle is both practical (more likely to succeed) and emotionally connecting — it gives the partner a direct feeding role that builds their confidence too.',
      warnings: [
        'If a parent is spending several hours per day tracking feeding times, volumes, and worrying between feeds, this level of anxiety is disproportionate and worth discussing with a GP.',
        'Persistent thoughts that your baby is not thriving despite clear evidence they are (good weight gain, wet nappies, alert) may be a sign of postnatal anxiety — this is treatable.',
      ],
    },
    evidence:
      'WHO (2001) Expert Consultation on the Optimal Duration of Exclusive Breastfeeding. Mennella JA et al (2001) Prenatal and postnatal flavor learning by human infants. Pediatrics 107(6):e88. Ierodiakonou D et al (2016) Timing of allergenic food introduction and allergic disease — JAMA 316(11):1181.',
  },

  // ── 6–12 months ─────────────────────────────────────────────────────────────
  {
    agePeriod: '6-12mo',
    ageMin: 6,
    ageMax: 12,
    title: 'First Foods: The Adventure Begins',
    whatToExpect:
      'Starting solids is one of the most exciting and nerve-wracking transitions of the first year. Your baby will eat very little at first — breast milk or formula still provides most nutrition until 9–10 months — and that is entirely normal. The goal of early solids is exposure, not intake.',
    keyMessage: 'Your job is to offer; your baby\'s job is to decide how much — trust the process.',
    dailyTips: [
      'Start with one meal per day of a single ingredient, increasing to two then three meals by 9 months — there is no rush.',
      'Offer the same vegetable 8–15 times before concluding your baby "doesn\'t like it" — initial rejection is a normal protective reflex, not a preference.',
      'Eat together whenever possible — babies learn what is safe to eat by watching trusted adults eat it first.',
    ],
    doList: [
      'Introduce common allergens (peanut, egg, tree nut, dairy, wheat, fish, sesame, soy) one at a time, early, and continue offering them regularly — early regular exposure is protective.',
      'Offer water (in a cup, not a bottle) with solid meals from 6 months — small amounts are fine.',
      'Let your baby touch, smear, and explore food with their hands — messy eating is sensory learning and builds willingness to try new textures.',
    ],
    dontList: [
      'Don\'t add salt, sugar, or honey to baby food — honey is unsafe under 12 months (botulism risk) and salt loads immature kidneys.',
      'Don\'t restrict food textures out of fear of choking — appropriate textures (soft, meltable finger foods by 7–8 months) actually build oral motor skills and reduce later texture refusal.',
      'Don\'t use food as a reward or distraction — "eat this and you can have dessert" starts a reward hierarchy that research links to overeating later.',
    ],
    activities: [
      [
        'First Foods Tasting Session',
        'Offer one pureed or mashed vegetable (broccoli, carrot, pea, sweet potato) before milk feed. Sit face-to-face, narrate the colour and smell, let the baby touch it. Success is touching it — not eating it.',
        10,
        'Daily from 6 months',
      ],
      [
        'Baby-Led Exploration Meal',
        'From 7 months, place soft finger-food pieces (steamed carrot sticks, banana, avocado) on the tray and let the baby handle and mouth them entirely independently. Stay nearby but hands-off.',
        15,
        '1x daily',
      ],
    ],
    topics: [
      {
        key: 'allergen_introduction',
        patterns: [
          'when to introduce peanuts',
          'egg introduction',
          'afraid of allergic reaction',
          'nut allergy risk',
          'allergen introduction timing',
          'family history of allergy',
        ],
        response: `Introducing allergens to {{child_name}} is one of the most anxiety-provoking parts of starting solids, especially if there is a family history of allergy. The science here has genuinely changed — the LEAP trial (2015) showed that early, regular introduction of peanut reduces peanut allergy by 80% in high-risk infants. The same principle applies across the major allergens.\n\nThe practical approach: introduce each allergen individually, in a small amount, in the morning so you can observe for 2 hours. A mild reaction is red cheeks or a small rash around the mouth — this is common and usually not allergic. Stop and seek medical advice if you see hives spreading, lip/tongue swelling, vomiting, or any breathing change. If {{child_name}} has severe eczema or a known egg allergy, discuss allergen introduction timing with an allergist before starting — the protocol is slightly different.`,
      },
      {
        key: 'gagging_vs_choking',
        patterns: [
          'baby gagging',
          'scared of choking',
          'baby coughing on food',
          'is gagging normal',
          'baby choking on food',
          'finger foods scary',
        ],
        response: `Gagging is protective and completely normal — {{child_name}}\'s gag reflex sits much further forward in the mouth than an adult\'s, which is why babies gag dramatically on very small lumps. Gagging involves noise (retching, coughing), colour stays normal, and the baby recovers quickly. Choking is silent, the baby turns red then blue, and they cannot cough effectively.\n\nThe best prevention for actual choking is appropriate textures: soft, squishable finger foods that dissolve in the mouth (cooked carrot sticks, steamed broccoli florets, ripe banana). Hard round pieces (whole grapes, raw apple, whole nuts) are the highest-risk shapes and should be avoided or modified under 3 years. Sitting upright without distraction, and never leaving the baby alone while eating, are the other key safeguards.`,
      },
      {
        key: 'food_rejection_early',
        patterns: [
          'baby refusing food',
          'spits everything out',
          'hates vegetables',
          'only eats one food',
          'not interested in solids',
          'taking too long to start',
        ],
        response: `It is completely normal for {{child_name}} to reject the same food multiple times before accepting it — neophobia (fear of new food) is a normal developmental protective response. Research consistently shows it takes 8–15 exposures before a new food is typically accepted, and the initial tongue-push is often just unfamiliarity with the texture and concept of food, not a preference.\n\nThe most useful frame is: offering is your job, eating is their job. A meal where {{child_name}} touches the food, smells it, and puts it near their mouth is a successful meal in terms of the exposure journey — whether any is swallowed is secondary. Pressure to eat more actually increases food rejection, while relaxed repeated exposure without pressure increases acceptance over time.`,
      },
      {
        key: 'iron_and_micronutrients',
        patterns: [
          'iron deficiency',
          'iron rich foods',
          'anaemia in babies',
          'vitamin D',
          'baby supplements',
          'fortified food',
        ],
        response: `Iron is the most critical micronutrient transition when solids start — {{child_name}}\'s iron stores from birth begin to deplete around 6 months, and breast milk alone cannot replace this. Iron-rich first foods are therefore a priority: pureed red meat, chicken, lentils, fortified iron cereals, and beans. Offering vitamin C alongside (e.g., mashed tomato or fruit) doubles non-haem iron absorption.\n\nIn India and many other regions, vitamin D supplementation is recommended from birth (400 IU daily) and continued through the first year — dark-skinned babies, exclusively breastfed babies, and those with limited sun exposure are at highest risk of deficiency. Check with your paediatrician about the current recommendation for your region and your child specifically, as needs vary.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_6_accepts_spoon',
        'Accepts spoon without pushing it out with tongue',
        24,
        'When you offer a spoon with soft food, does {{child_name}} open their mouth and draw the food in rather than pushing it out?',
      ],
      [
        'nut_6_self_feeds_finger_food',
        'Picks up and mouths finger food independently',
        32,
        'Can {{child_name}} pick up a soft piece of food and bring it to their mouth on their own?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_6_allergic_reaction',
        description: 'Signs of allergic reaction after new food introduction: hives, vomiting, swelling, breathing change',
        severity: 'urgent_referral',
        pattern:
          'parent reports rash spreading beyond the face, swelling of lips/tongue, vomiting after allergen introduction, unusual lethargy, or any respiratory symptom',
        action:
          'For breathing difficulty, call emergency services immediately. For isolated hives or vomiting, advise urgent GP or emergency department review today. Document the food and timing.',
        referral: 'Paediatric allergist for allergy testing and management plan',
      },
    ],
    coping: {
      normalizations: [
        'A baby who barely eats at 6–7 months is completely typical — the first weeks of solids are almost entirely about exploration, not nutrition.',
        'Mess is not a sign of wasted time; it is the sensory experience through which your baby learns to trust new textures and flavours.',
      ],
      strategies: [
        'Lay a mat under the high chair and dress the baby in a pelican bib — removing the clean-up anxiety lets you stay relaxed at mealtimes, which is more important than keeping the kitchen tidy.',
        'If you are anxious about allergen introduction, do it on a weekday morning when a GP is available, and keep an antihistamine in the house just in case — preparation reduces anxiety without preventing the introduction.',
      ],
      selfCare: [
        'Making separate baby food is exhausting and unnecessary — most family foods, de-salted and mashed to appropriate texture, are perfect baby food.',
        'Batch cooking and freezing in ice-cube trays one afternoon a week eliminates the daily pressure of meal preparation for your baby.',
      ],
      partner:
        'Solids is a great opportunity for the non-primary-feeding parent to take ownership of one meal per day — it builds their confidence, gives you a break, and diversifies the baby\'s experience of being fed.',
      warnings: [
        'If mealtimes are consistently ending in tears (yours or your baby\'s) or you feel high anxiety every time you put food in front of your baby, this warrants a conversation with a feeding therapist or dietitian.',
        'If your baby is 9 months and still refusing to open their mouth for a spoon or handle any food textures, a paediatric occupational therapist assessment for oral sensory sensitivity is worth discussing with your paediatrician.',
      ],
    },
    evidence:
      'Du Toit G et al (2015) LEAP trial: Randomized trial of peanut consumption in infants at risk. NEJM 372:803-813. Satter EM (2000) Child of Mine: Feeding with Love and Good Sense. Daniels L et al (2015) NOURISH RCT: Maternal feeding practices and child diet. Public Health Nutrition. WHO (2005) Guiding principles for complementary feeding.',
  },

  // ── 12–24 months ────────────────────────────────────────────────────────────
  {
    agePeriod: '12-24mo',
    ageMin: 12,
    ageMax: 24,
    title: 'Joining the Family Table',
    whatToExpect:
      'The transition to family foods is marked by growing independence and, often, surprising fussiness — a baby who ate everything at 9 months may seem to narrow their repertoire at 12–18 months. This is normal developmental neophobia and does not require intervention, just patient repetition.',
    keyMessage: 'Neophobia at this age is protective evolution — it is not stubbornness and it is not your fault.',
    dailyTips: [
      'Serve meals family-style with everyone eating the same food — a toddler who sees their parent eating broccoli is far more likely to try it than one served a separate "toddler meal."',
      'Three meals and two planned snacks per day is the standard structure — grazing and constant access to food prevents hunger cues from developing and reduces mealtime appetite.',
      'Full-fat dairy (milk, yoghurt, cheese) is appropriate until age 2 — fat is critical for brain development and should not be restricted in this age group.',
    ],
    doList: [
      'Transition away from the bottle to a cup by 12–18 months — prolonged bottle use is associated with iron deficiency (milk displaces iron-rich foods) and dental caries.',
      'Continue offering rejected foods at family meals without comment — exposure without pressure is the evidence-based approach.',
      'Include your toddler in food preparation at a level they can manage — stirring, tearing lettuce, washing vegetables.',
    ],
    dontList: [
      'Don\'t make a separate meal because your toddler rejected the family food — this creates a pattern of food refusal that is difficult to reverse.',
      'Don\'t limit milk to less than 300–500 ml per day or more than 500 ml — below this risks nutrient gap; above this displaces solid food intake.',
      'Don\'t label your child as a "picky eater" in their presence — children tend to live up to the labels we assign them.',
    ],
    activities: [
      [
        'Family Meal Practice',
        'Commit to eating at least one meal per day together at a table, with the same food, phones away. Your toddler\'s willingness to try new foods is directly correlated with family meal frequency.',
        25,
        'Daily',
      ],
      [
        'Vegetable Garden Pot',
        'Plant cherry tomatoes, herbs, or snow peas in a pot your toddler can reach. Children who grow food are dramatically more likely to eat it — the "garden effect" is robust in research.',
        10,
        '2x weekly',
      ],
    ],
    topics: [
      {
        key: 'picky_eating_onset',
        patterns: [
          'suddenly picky',
          'won\'t eat vegetables',
          'only eats five foods',
          'food refusal',
          'mealtime battles',
          'refusing what they used to eat',
        ],
        response: `The shift from adventurous baby eater to suspicious toddler is one of the most disorienting feeding moments for parents — {{child_name}} seemed to love everything, and now refuses half of it. This is a developmental phenomenon called neophobia that peaks between 18 months and 3 years, and it is universal across cultures. Evolutionary theory suggests it protected mobile toddlers from poisoning themselves by exploring.\n\nThe research-backed approach (Ellyn Satter\'s Division of Responsibility) is: you decide what is on the table, when meals happen, and where eating occurs. {{child_name}} decides whether to eat and how much. This sounds simple but requires genuine commitment to not short-order cooking, not coaxing, and not commenting on what is or isn\'t eaten. Studies show this approach produces the most varied diet long-term compared with any pressure strategy.`,
      },
      {
        key: 'milk_dependence',
        patterns: [
          'still on bottle',
          'only wants milk',
          'milk all day',
          'won\'t drink cup',
          'refusing solids drinking milk',
        ],
        response: `Excessive milk intake (over 500–600 ml per day) is one of the most common hidden causes of picky eating and iron deficiency anaemia in toddlers — milk fills {{child_name}} up, displaces appetite for solid food, and provides almost no iron. Transitioning away from the bottle by 12–18 months is medically recommended, not just a parenting preference.\n\nThe practical approach: cold turkey bottle removal works for some families; a gradual reduction (cut one bottle every 3–4 days, starting with the least emotionally significant one) works for others. Offering milk in a cup only means the milk is available but the comfort-sucking pattern is broken. The first 3 days are hard; appetite for solid food usually increases noticeably within a week.`,
      },
      {
        key: 'division_of_responsibility',
        patterns: [
          'how to handle picky eating',
          'force to eat',
          'just one more bite',
          'bribe with dessert',
          'worried not eating enough',
        ],
        response: `The pressure to ensure {{child_name}} eats enough is one of the most powerful forces in parenting — and ironically, it is also one of the forces most likely to make eating worse. When children are coaxed, bribed, distracted, or pressured to eat, they lose the internal experience of "I was hungry and now I\'m full" that is the foundation of healthy lifelong eating.\n\nEllyn Satter\'s Division of Responsibility, now the basis of multiple national dietary guidelines, gives you a clear framework: your responsibilities are what is served, when meals happen, and the atmosphere at the table. {{child_name}}\'s responsibilities are whether to eat any particular food and how much. When parents fully commit to this — which usually takes 2–4 weeks of discomfort — children almost always expand their diet and mealtimes become calmer.`,
      },
      {
        key: 'growth_slowdown_worry',
        patterns: [
          'not gaining weight',
          'growth slowing',
          'dropped percentile',
          'too thin',
          'eating very little',
        ],
        response: `Growth velocity naturally slows dramatically in the second year — {{child_name}} may gain as little as 2–3 kg in the entire year between 12 and 24 months, compared with 6–7 kg in the first year. Appetite drops proportionally. This is normal physiology, not inadequate feeding.\n\nIf your paediatrician has noted growth slowing (dropping two or more centile lines) rather than just slow growth within a centile band, that deserves a medical review. However, a toddler who is active, developing normally, has energy, and is otherwise well, eating small amounts is almost always consuming enough — toddlers are excellent at self-regulation when not pressured.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_12_family_foods',
        'Eating modified family foods at most meals',
        18,
        'Is {{child_name}} eating some version of what the family eats at most meals, rather than entirely separate toddler food?',
      ],
      [
        'nut_12_cup_transition',
        'Drinking from a cup independently',
        18,
        'Can {{child_name}} drink from an open cup or straw cup without help?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_12_failure_to_thrive',
        description: 'Drop of 2+ centile lines on weight-for-age chart, or weight below the 3rd centile with poor linear growth',
        severity: 'discuss_with_ped',
        pattern:
          'parent brings growth chart showing significant centile drop, or child appears visibly thin with prominent ribs and reduced energy',
        action:
          'Arrange paediatric review with growth chart. Assess feeding history, food intake 24-hour recall, and rule out medical causes. Refer to paediatric dietitian if feeding history is concerning.',
        referral: 'Paediatric dietitian; investigate for underlying medical conditions (coeliac, malabsorption) if indicated',
      },
    ],
    coping: {
      normalizations: [
        'A toddler eating 10 bites at a meal when they used to eat a full bowl is normal — their appetite genuinely is that much smaller because their growth rate has slowed.',
        'Making a separate meal every night for your toddler is exhausting and unsustainable — it is also not recommended. One family meal, served family-style, is both easier and better for long-term eating.',
      ],
      strategies: [
        'Keep a two-week food diary of everything your toddler eats — parents are systematically shocked to see how varied the diet actually is across two weeks versus how restricted it seems meal to meal.',
        'When anxiety about food intake peaks, ask: is my child growing? Are they energetic? Are they happy? If yes to all three, the intake is sufficient.',
      ],
      selfCare: [
        'The emotional labour of managing a picky eater three times a day is significant — it is reasonable to acknowledge this is hard without treating it as a crisis.',
        'Finding a community of parents with toddlers (in person or online) normalises picky eating and reduces the shame that often accompanies it.',
      ],
      partner:
        'Feeding disagreements between parents ("just make him eat it" vs. "let her choose") are extremely common and erode the feeding environment. Aligning on the Division of Responsibility framework before a conflict arises gives you a shared language.',
      warnings: [
        'If you are spending more than 30 minutes per meal coaxing a toddler to eat, or if mealtimes are consistently ending in distress, a feeding therapist consultation is warranted.',
        'If your own food anxiety (history of dieting, disordered eating, weight preoccupation) is surfacing in how you feed your toddler, this is worth addressing — parental feeding behaviour patterns transfer, and a dietitian who specialises in family feeding can help.',
      ],
    },
    evidence:
      'Satter E (2000) Child of Mine: Feeding with Love and Good Sense. Bull Mountain Press. Dovey TM et al (2008) Food neophobia and picky/fussy eating in children — review. Appetite 50(2-3):181-193. Emmett PM & Jones LR (2015) Diet, growth and obesity development through childhood in the ALSPAC cohort. World Rev Nutr Diet 111:1-19.',
  },

  // ── 2–3 years ────────────────────────────────────────────────────────────────
  {
    agePeriod: '2-3yr',
    ageMin: 24,
    ageMax: 36,
    title: 'Picky Eating Peak: Normal, Not Broken',
    whatToExpect:
      'Ages two to three are widely acknowledged as the peak of selective eating — food jags (only wanting the same food every day), categorical rejection of mixed foods, and insistence on specific brands or presentations are common and developmentally normal. This is the age at which the Division of Responsibility pays the greatest dividends for families who have been practising it.',
    keyMessage: 'Picky eating peaks and then declines — your consistent, calm, pressure-free response is the most evidence-backed intervention.',
    dailyTips: [
      'Serve at least one "safe" food alongside any new or challenging food at every meal — this removes the fear of going hungry and makes the child more likely to try the challenging food.',
      'Food jags (wanting the same food repeatedly) are normal and self-limiting — continue offering other foods without comment, and the jag usually ends within a few weeks.',
      'Avoid letting hunger go too long between planned meals and snacks — an over-hungry two-year-old is far less flexible than one who is appropriately hungry.',
    ],
    doList: [
      'Maintain regular meal and snack times with a predictable structure — this is the single most effective management strategy for picky eating at this age.',
      'Serve food family-style where possible, letting your child serve themselves — choice and autonomy reduce opposition.',
      'Model trying new foods yourself with genuine enthusiasm — your toddler is watching everything you do.',
    ],
    dontList: [
      'Don\'t allow continuous grazing or unlimited snacking between meals — this kills appetite at mealtimes and is the most common driver of "not eating dinner."',
      'Don\'t use dessert as a reward for eating vegetables — this increases desire for the reward food and reduces willingness to eat the vegetable.',
      'Don\'t describe yourself as a picky eater in front of your child — children adopt the food identity they hear modelled.',
    ],
    activities: [
      [
        'New Food Exploring Game',
        'Place a small amount of a new or rejected food on the table alongside a safe food. The rule is "you don\'t have to eat it, but let\'s look at it/smell it/touch it." Rate it 1–5 stars for smell, colour, feel. Remove without comment if uneaten.',
        10,
        '3–4x weekly',
      ],
      [
        'Simple Kitchen Helper',
        'Give your toddler an age-safe kitchen job: washing vegetables, tearing lettuce, stirring, pouring. Children who prepare food are significantly more likely to eat it.',
        15,
        'Daily if possible',
      ],
    ],
    topics: [
      {
        key: 'food_jags',
        patterns: [
          'only eats crackers',
          'wants the same food every day',
          'food jag',
          'same meal every night',
          'won\'t eat anything else',
        ],
        response: `A food jag — when {{child_name}} insists on having the same food at almost every meal for days or weeks — is completely normal at this age and almost always self-limiting. The mistake to avoid is either giving in completely (making only the jag food and nothing else) or refusing it entirely. The middle path: include the jag food as one item on the plate with other foods served without pressure.\n\nFood jags typically last 2–6 weeks and then fade on their own. If {{child_name}}\'s jag food is reasonably nutritious (pasta, rice, a specific fruit), let it provide comfort and familiarity while you continue offering variety. If the jag food is nutritionally very narrow (e.g., plain crackers only), offer it but also offer other items without comment.`,
      },
      {
        key: 'mealtime_structure',
        patterns: [
          'grazing all day',
          'snacking constantly',
          'not hungry at dinner',
          'eating too many snacks',
          'structure for eating',
        ],
        response: `Constant grazing is the most common feeding mistake at this age and the most fixable one. When {{child_name}} has access to food all day, they never develop genuine hunger — and the hunger drive is what makes new foods and less preferred foods acceptable. Three meals and two planned snacks, with nothing except water in between, creates the predictable rhythm that makes mealtimes successful.\n\nThe transition can take 3–5 days of discomfort — {{child_name}} will likely be more irritable before meals for the first few days. This is the process working, not a sign to go back to grazing. Within a week, mealtime appetite almost always improves significantly.`,
      },
      {
        key: 'beige_diet_worry',
        patterns: [
          'only eats white foods',
          'beige diet',
          'refuses all vegetables',
          'won\'t touch anything green',
          'only carbs',
          'nutritional worry',
        ],
        response: `The "beige diet" — pasta, bread, crackers, chips, and maybe a fruit — is so common at this age that nutritional researchers have a name for it: selective eating. It is almost never nutritionally catastrophic in the short term. A daily multivitamin can bridge the gap while the diet expands, which it almost always does between ages 3 and 6 with continued patient exposure.\n\nThe most effective long-term strategy is continued calm exposure without pressure. "Green food bridge" strategies — blending vegetables into preferred foods, serving dipping sauces, or gradually changing the colour or preparation of familiar foods — can help some children, but should not replace continued whole vegetable exposure at the table. If by age 4 the diet remains fewer than 15–20 foods, a paediatric feeding therapist assessment is worth requesting.`,
      },
      {
        key: 'supplement_requests',
        patterns: [
          'giving supplements',
          'multivitamin for toddlers',
          'protein powder',
          'which vitamins',
          'iron supplement',
        ],
        response: `A daily children\'s multivitamin is a reasonable nutritional safety net for a toddler with a restricted diet — it is not a substitute for working on diet variety, but it reduces the risk of micronutrient gaps in the short term. Look for one with iron (especially important if milk intake is high) and vitamin D.\n\nBeyond a basic multivitamin, most supplements marketed for children are unnecessary and some (fat-soluble vitamin megadoses) can cause harm. Protein supplements, omega-3 gummies, and probiotic products are largely unregulated for children and not evidence-based for otherwise healthy toddlers. Discuss any supplement beyond a standard multivitamin with your paediatrician.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_2yr_tolerates_variety_table',
        'Tolerates multiple different foods on the same plate without distress',
        30,
        'Can {{child_name}} sit at a meal where different foods are on their plate without becoming very distressed, even if they don\'t eat all of them?',
      ],
      [
        'nut_2yr_uses_utensils',
        'Uses spoon and fork with reasonable independence',
        36,
        'Can {{child_name}} use a spoon or fork to feed themselves most of a meal?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_2yr_arfid_signs',
        description: 'Fewer than 10–15 accepted foods with strong sensory aversion to textures, colours, or mixed foods, limiting nutrition and social participation',
        severity: 'discuss_with_ped',
        pattern:
          'parent describes extreme distress (gagging, vomiting, panic) at sight or smell of non-preferred foods, diet limited to fewer than 15 foods, child cannot eat in social settings',
        action:
          'This may represent Avoidant/Restrictive Food Intake Disorder (ARFID) rather than developmental picky eating. Refer to paediatric feeding team or paediatric occupational therapist with feeding specialisation. Do not dismiss as a phase.',
        referral: 'Paediatric occupational therapist (feeding); paediatric dietitian; ARFID-specialised therapist if available',
      },
    ],
    coping: {
      normalizations: [
        'Picky eating is the norm, not the exception, at this age — surveys suggest 50–80% of parents of 2-year-olds describe their child as picky. You are not alone and you have not caused this.',
        'Feeling frustrated and exhausted by mealtimes after months of food rejection is a completely understandable response — it doesn\'t mean you\'re doing it wrong.',
      ],
      strategies: [
        'Lower the definition of "successful meal" to: everyone sat together, food was offered, the atmosphere was calm. This immediately removes the outcome pressure that makes meals worse.',
        'Find one or two things {{child_name}} reliably eats and make peace with those appearing at meals regularly — this is not defeat, it is tactical structure.',
      ],
      selfCare: [
        'If cooking family dinner only to have it rejected is demoralising, batch cook one or two "safe" family staples for the week and reduce the daily cooking investment.',
        'Sharing the feeding responsibility with a partner, grandparent, or childcare worker is not giving up — children often eat better for other trusted adults than for their primary caregiver.',
      ],
      partner:
        'Agree on a feeding approach together before sitting down to eat — nothing undermines calm mealtimes faster than one parent pressuring while the other is trying not to. Read about or discuss the Division of Responsibility together.',
      warnings: [
        'If you are using the television, tablet, or phone to distract your child into eating more — a very common coping strategy — this prevents the child from noticing hunger and fullness signals and increases the problem long-term.',
        'If the stress of mealtimes is affecting your own appetite, mood, or relationship with your partner, speaking to a professional (dietitian, psychologist, or feeding therapist) is appropriate — this is a significant daily stressor.',
      ],
    },
    evidence:
      'Mascola AJ et al (2010) Picky eating during childhood. J Am Diet Assoc 110(12):1861-1868. Satter E (1990) The feeding relationship — problems and interventions. J Pediatr 117(2 Pt 2):S181-9. Birch LL (1999) Development of food preferences. Annu Rev Nutr 19:41-62.',
  },

  // ── 3–5 years ────────────────────────────────────────────────────────────────
  {
    agePeriod: '3-5yr',
    ageMin: 36,
    ageMax: 60,
    title: 'Kitchen Adventurers: Growing Food Curiosity',
    whatToExpect:
      'Between three and five, most children begin to slowly expand their food repertoire as neophobia gradually softens. This is the age where kitchen involvement, food growing, and positive food experiences have the most powerful effect on willingness to try new foods. Snack management and sweet food boundaries also become increasingly relevant as children gain social access to processed food.',
    keyMessage: 'Involvement in food preparation is the most powerful tool you have to expand a young child\'s diet.',
    dailyTips: [
      'Give your child a meaningful kitchen job most days — stirring, pouring, washing, cutting with a child-safe knife. Ownership drives eating.',
      'Serve vegetables alongside preferred dips (hummus, yoghurt, tomato sauce) — the bridge food helps acceptance without hiding the vegetable.',
      'Keep the treat/dessert conversation neutral — "we have fruit for dessert today" rather than "if you eat your dinner you can have dessert."',
    ],
    doList: [
      'Visit a market or farm and let your child choose one vegetable or fruit they want to try preparing.',
      'Establish a predictable snack time (one or two per day) with the rest of the time as water-only — this protects mealtime appetite.',
      'Continue offering rejected foods at least monthly — research shows that diet variety increases gradually with repeated low-pressure exposure through early childhood.',
    ],
    dontList: [
      'Don\'t restrict treats so severely that they become intensely desirable — children given unconditional access to a treat alongside a meal are less preoccupied with it than those who must earn it.',
      'Don\'t comment on portion sizes or how much the child eats — "you\'re eating so much today" and "you\'re not hungry today" are both forms of external regulation that disrupt internal cues.',
      'Don\'t use sweets as comfort, reward, or distraction from feelings — this establishes an emotional eating pattern that persists into adulthood.',
    ],
    activities: [
      [
        'Weekly Cooking Project',
        'Choose one simple recipe per week that your child helps make from start to finish — smoothies, salads, simple soups, egg dishes. Eat together and let them describe what they made.',
        30,
        'Weekly',
      ],
      [
        'Supermarket Colour Challenge',
        'At the supermarket, ask your child to choose one food for each colour of the rainbow this week. Buy and try the choices without pressure.',
        20,
        'Weekly',
      ],
    ],
    topics: [
      {
        key: 'sweet_food_boundaries',
        patterns: [
          'too much sugar',
          'sugar meltdowns',
          'obsessed with sweets',
          'asking for treats all day',
          'birthday party food',
          'junk food at parties',
        ],
        response: `Children between 3 and 5 develop a strong awareness of sweet and processed foods, particularly through peers and media. {{child_name}} asking for sweets constantly is normal, not a sign of addiction or moral failure. The most robust research approach is neither total restriction nor unlimited access.\n\nServing a small treat alongside a balanced meal (not after as reward) removes the "forbidden fruit" status that makes sweets hyperdesirable. Avoiding labelling foods as "bad" or "junk" in front of your child — while being clear about which foods are everyday foods and which are occasional foods — is the language approach associated with the healthiest long-term relationship with sweet food.`,
      },
      {
        key: 'kitchen_involvement',
        patterns: [
          'how to involve child in cooking',
          'age appropriate cooking',
          'toddler helping cook',
          'kitchen safety',
          'cooking with preschoolers',
        ],
        response: `Kitchen involvement at this age is genuinely one of the most evidence-backed strategies for expanding food acceptance — children who help prepare a food are significantly more likely to taste it. Age-appropriate tasks for {{child_name}} at 3–4 years include: washing vegetables, tearing salad, stirring, pouring pre-measured ingredients, and peeling bananas. By 4–5 years: using a child-safe knife for soft foods (banana, strawberry), cracking eggs with guidance, operating a child-safe grater.\n\nThe key is genuine involvement, not supervised watching. Let {{child_name}} do the messy, imperfect version of the task — the mess is the learning. Narrate what you\'re doing together in simple language, taste as you go, and make it a relaxed shared activity rather than an efficiency exercise.`,
      },
      {
        key: 'preschool_food_influence',
        patterns: [
          'eating differently at school',
          'eating better at childcare',
          'won\'t eat at home what they eat at school',
          'peer food influence',
          'food from friends',
        ],
        response: `It is remarkably common for {{child_name}} to eat a broader range of food at preschool or childcare than at home — and this can feel both relieving and slightly frustrating. The preschool effect is well-documented: social eating, peer modelling (seeing other children eat), and the absence of the parent-child feeding dynamic all contribute to greater willingness to try.\n\nThe most useful thing you can do at home is try to replicate some of the conditions: eat together with other families when you can, serve food the way it looks at school, and ask {{child_name}} what their favourite preschool food is and try making it at home. Don\'t be discouraged that home eating looks different — the eating repertoire is building even if it only shows up at school for now.`,
      },
      {
        key: 'media_and_food_advertising',
        patterns: [
          'wants food they saw on TV',
          'food advertising to kids',
          'cartoon character food',
          'wants junk food brands',
          'YouTube food',
        ],
        response: `Children between 3 and 5 become susceptible to food marketing — research shows that after seeing a single advertisement, children prefer the taste of food in branded packaging. This is a genuine environmental pressure you cannot fully eliminate, but you can buffer.\n\nThe most effective approaches are: limiting screen exposure to content with restricted advertising (public broadcasting, curated streaming), using branded characters on vegetables and healthy foods as counter-programming, and talking openly about advertising in age-appropriate terms ("that company wants us to buy their food — let\'s think about whether we want to"). Children who can identify advertising from a young age are more resistant to it.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_3yr_helps_prepare',
        'Participates in simple food preparation tasks',
        48,
        'Is {{child_name}} able to help with at least one step of preparing a meal or snack — washing, stirring, pouring?',
      ],
      [
        'nut_3yr_variety_increasing',
        'Food variety gradually expanding (20+ accepted foods)',
        60,
        'Has {{child_name}}\'s range of accepted foods grown since starting preschool — are there foods they eat now that they refused at 2?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_3yr_persistent_restriction',
        description: 'Diet restricted to fewer than 15 foods at age 4-5 with signs of nutritional deficiency or significant social impairment',
        severity: 'discuss_with_ped',
        pattern:
          'parent describes child unable to eat at birthday parties, school lunch, or friends\' homes; diet hasn\'t expanded from toddler period; signs of fatigue, pallor, or stunted growth',
        action:
          'Refer for paediatric feeding team evaluation. Screen for iron deficiency anaemia and vitamin D deficiency with blood tests. Assess for ARFID and sensory processing differences.',
        referral: 'Paediatric dietitian; occupational therapist with feeding specialisation; consider ARFID assessment if appropriate',
      },
    ],
    coping: {
      normalizations: [
        'It is entirely normal to find food preparation with a small child chaotic and inefficient — the developmental payoff is real even when the process is exhausting.',
        'Children eating better at school or at grandparents\' house than at home is so universal it has been studied — it is about the social context, not a reflection of your parenting.',
      ],
      strategies: [
        'Pick one meal per week to involve your child in cooking — start small. Even one session per week shows measurable effects on willingness to try new foods within a month.',
        'If sweet food battles are draining, try the "everyday food / sometimes food" language consistently for two weeks and notice whether the urgency around treats reduces.',
      ],
      selfCare: [
        'Meal planning for 3–5-year-olds is easier when you have a bank of 10–15 reliable recipes rather than trying to vary endlessly — simplicity and reliability serve this age group better than novelty.',
        'If you have your own complicated relationship with certain foods, it is worth noticing when that surfaces at the table — children are remarkably sensitive to parental food anxiety.',
      ],
      partner:
        'At this age, parents sometimes begin to disagree about sweet food rules between households (one parent is stricter) — agreeing on a shared framework and applying it consistently in both households prevents the child from learning to play parents off each other around food.',
      warnings: [
        'If you are hiding vegetables in all foods to avoid rejection, this is a short-term strategy that prevents genuine food exposure — continue offering visible vegetables alongside preferred foods.',
        'If food is routinely being used to manage tantrums or emotional distress ("have a biscuit, you\'ll feel better"), the pattern is worth gently interrupting before school age, when emotional eating patterns solidify.',
      ],
    },
    evidence:
      'Van der Horst K et al (2012) Involving children in the preparation of family meals — a pilot study. Public Health Nutr 15(8):1403-9. Fisher JO & Birch LL (1999) Restricting access to palatable foods affects children\'s behavioral response. Am J Clin Nutr 69(6):1264-72. WHO (2003) Diet, nutrition and the prevention of chronic diseases.',
  },

  // ── 5–8 years ────────────────────────────────────────────────────────────────
  {
    agePeriod: '5-8yr',
    ageMin: 60,
    ageMax: 96,
    title: 'School Foods: Peers, Lunchboxes, and Growing Independence',
    whatToExpect:
      'Starting school shifts food decision-making significantly — your child now eats at least one meal per day outside your sight, with peer influence increasing dramatically. The lunchbox becomes a negotiation, breakfast becomes a battle, and the canteen or tuck shop introduces comparison with processed food. This is a critical window for establishing breakfast habits and the understanding of food as fuel.',
    keyMessage: 'The lunchbox is a bridge between your values and your child\'s social world — make it good enough, not perfect.',
    dailyTips: [
      'Breakfast within 30–60 minutes of waking protects concentration and reduces impulsive food choices later in the day — this is among the most replicated nutrition findings in school-age children.',
      'Let your child have some say in what goes in their lunchbox from a set of healthy options — ownership increases the chance the lunch is actually eaten.',
      'After-school hunger is real and predictable — have a planned substantive snack ready so dinner appetite isn\'t sabotaged by grazing while waiting.',
    ],
    doList: [
      'Eat breakfast as a family when possible — even once or twice a week of shared breakfast has measurable benefits for children\'s dietary quality.',
      'Teach your child the name and origin of foods you eat regularly — food knowledge builds food confidence.',
      'Pack a lunchbox that looks like the food you eat at home — don\'t pack processed "kid food" at school if you wouldn\'t serve it at home.',
    ],
    dontList: [
      'Don\'t comment negatively on what comes back from the lunchbox — ask with curiosity rather than disappointment.',
      'Don\'t use "clean your plate" rules — these override internal satiety signals at exactly the age when children are learning to self-regulate.',
      'Don\'t ban all "canteen food" — complete restriction increases forbidden fruit desirability; planned occasional canteen meals are fine.',
    ],
    activities: [
      [
        'Lunchbox Building Game',
        'On Sunday, lay out lunchbox options on the kitchen counter and let your child build their lunch from categories (something filling, something crunchy, something colourful, something sweet-natural). They pack it; you approve from a pre-agreed list.',
        15,
        'Weekly (Sunday)',
      ],
      [
        'Breakfast Experiment Week',
        'Let your child choose a new breakfast food to try each Monday for a month — oats, eggs, yoghurt parfait, savoury toast. Rate it together. This builds the skill of trying new things in the morning.',
        10,
        'Weekly',
      ],
    ],
    topics: [
      {
        key: 'school_lunch_battles',
        patterns: [
          'lunchbox comes back uneaten',
          'swapping lunch with friends',
          'wants canteen food',
          'lunch not eaten at school',
          'school lunch refusal',
        ],
        response: `An uneaten lunchbox is one of the most consistent sources of parent stress during the early school years — and it is very common. The reasons are varied: {{child_name}} may be too excited to sit still and eat, may be prioritising social time, or may be swapping with friends. It is rarely about the food itself.\n\nStrategies that help: keep lunchbox items to familiar easy-to-eat foods (this is not the time for food exploration); include a small treat so swapping isn\'t as appealing; make items manageable without adult help (pre-cut fruit, easy-open containers). Ask {{child_name}} what they like seeing in their lunchbox and negotiate from that list. Some lunch eating at school is social — eating together with friends is a reasonable substitute for eating alone at the desk.`,
      },
      {
        key: 'breakfast_skipping',
        patterns: [
          'won\'t eat breakfast',
          'not hungry in morning',
          'no time for breakfast',
          'rushing in mornings',
          'skipping breakfast',
        ],
        response: `Breakfast skipping at school age is associated with poorer concentration, lower morning academic performance, and higher intake of processed foods later in the day — this is one of the most consistent nutritional findings across studies. For {{child_name}}, a breakfast of even 200–300 calories within the first hour of waking makes a measurable difference.\n\nFor children who genuinely aren\'t hungry in the morning (often because of large late dinners), gradually shifting dinner to earlier in the evening can open up morning appetite within 1–2 weeks. For time-pressed mornings, a banana and a handful of nuts eaten in the car or on the walk to school is vastly better than nothing. Overnight oats prepared the night before remove almost all morning preparation.`,
      },
      {
        key: 'peer_food_comparison',
        patterns: [
          'why don\'t we have that food',
          'friends have better food',
          'everyone eats chips',
          'my lunch is boring',
          'jealous of friends\' food',
        ],
        response: `"But everyone else has [processed food item] in their lunch" is a sentence almost every parent of a school-age child hears. This is real — food is social at school, and {{child_name}} is right that lunchboxes are compared. The goal is not to make the healthiest lunchbox; it is to make one that is healthy enough and doesn\'t make your child feel excluded.\n\nA practical approach: include one item that is similar to what peers eat (a small packet of something, a treat), alongside the foods you\'d normally pack. This removes the "deprivation" experience while maintaining the overall quality. Having a family language around food choices ("we eat this most of the time, that sometimes") gives {{child_name}} a way to answer friends\' questions without feeling ashamed of their food.`,
      },
      {
        key: 'breakfast_nutrition_content',
        patterns: [
          'what\'s a good breakfast',
          'cereal choices',
          'sugar in cereal',
          'protein at breakfast',
          'best foods for school morning',
        ],
        response: `The ideal school breakfast for {{child_name}} combines protein (to sustain concentration), complex carbohydrate (for quick energy), and some fat (for satiety through the morning). Practical examples: egg on wholegrain toast; yoghurt with fruit and granola; nut butter on toast with banana; warm oats with milk and berries.\n\nBreakfast cereals vary enormously — many children\'s cereals have more sugar per serving than a biscuit. A cereal with less than 10g sugar per 100g, eaten with dairy milk, is a reasonable choice. Teaching {{child_name}} to read the nutritional label together in the supermarket — as a detective game, not a health lesson — builds food literacy in an age-appropriate way.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_5yr_manages_lunchbox',
        'Can manage own lunchbox independently at school',
        72,
        'Can {{child_name}} open all their own containers, eat their lunch without assistance, and manage their own food at school?',
      ],
      [
        'nut_5yr_food_knowledge',
        'Can name and describe 20+ foods and where they come from',
        84,
        'Does {{child_name}} know the names of a range of foods and where they come from (e.g., milk from cows, carrots grow underground)? Can they describe how some are prepared?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_5yr_extreme_restriction',
        description: 'Child significantly underweight, consistently skipping meals, or showing early signs of disordered eating (food rituals, extreme guilt about eating)',
        severity: 'discuss_with_ped',
        pattern:
          'parent describes child refusing almost all foods outside a very narrow list, visible weight loss or failure to grow, or child expressing fear or guilt about eating specific foods',
        action:
          'Refer for paediatric assessment with growth measurement. Screen for ARFID, early anorexia presentations (rare but possible at this age), and thyroid or other medical causes of poor growth.',
        referral: 'Paediatric dietitian; child psychologist if disordered eating cognitions present; paediatric gastroenterologist if malabsorption suspected',
      },
    ],
    coping: {
      normalizations: [
        'A lunchbox that comes home partly uneaten is the norm, not the exception — school is very exciting and eating is not always the priority.',
        'Your child eating processed food at a friend\'s birthday party is not undoing your work at home — food values are built over thousands of meals, not undermined by one.',
      ],
      strategies: [
        'Take a photo of what comes back from the lunchbox once a week for a month — this gives you actual data on what is and isn\'t being eaten, rather than anxiety-driven guessing.',
        'Involve {{child_name}} in one food shopping trip per week and let them choose one item — even a small amount of ownership dramatically shifts compliance.',
      ],
      selfCare: [
        'Lunchbox preparation takes a cognitive load that is often invisible — batch preparing components (cut fruit, portioned snacks) on Sunday reduces daily decision fatigue.',
        'If you are competitive about lunchbox quality with other parents (in person or on social media), notice this and redirect — the benchmark is your child\'s appetite and wellbeing, not an Instagram standard.',
      ],
      partner:
        'Breakfast preparation is a task that can rotate between parents — agreeing on a simple regular menu (not a different creative breakfast each day) reduces morning conflict and makes handover seamless.',
      warnings: [
        'If you are consistently commenting on your child\'s weight, body shape, or food intake quantity, this is associated with elevated eating disorder risk by early adolescence — redirect to enjoyment of food and energy level.',
        'If your own dieting behaviour (skipping meals, commenting on your own weight, following restrictive rules) is visible to your child at this age, it is being absorbed as a template for how people relate to food.',
      ],
    },
    evidence:
      'Rampersaud GC et al (2005) Breakfast habits, nutritional status, body weight, and academic performance. J Am Diet Assoc 105(5):743-60. Birch LL & Fisher JO (1998) Development of eating behaviors among children. Pediatrics 101(3 Pt 2):539-49. Savage JS et al (2007) Parental influence on eating behavior. J Law Med Ethics 35(1):22-34.',
  },

  // ── 8–12 years ───────────────────────────────────────────────────────────────
  {
    agePeriod: '8-12yr',
    ageMin: 96,
    ageMax: 144,
    title: 'Pre-Puberty Nutrition: Fuelling the Leap',
    whatToExpect:
      'The pre-pubertal years are a period of accelerating growth and increasing independence in food decision-making. Your child is beginning to make food choices outside the home more frequently, is exposed to diet culture and body commentary through peers and media, and is navigating the complex relationship between food, identity, and belonging.',
    keyMessage: 'Your most powerful tool now is conversation — about how food makes them feel, not what they look like.',
    dailyTips: [
      'Keep a variety of healthy food visible and accessible — fruit on the counter, cut vegetables in the fridge — because independent snacking will increase and environment predicts choice.',
      'Eat together as a family as often as possible — research shows 3+ family dinners per week is associated with healthier diet quality and lower eating disorder risk in adolescence.',
      'Talk about food in terms of energy and how it makes them feel, not calories or weight — this builds internal cues rather than external rules.',
    ],
    doList: [
      'Teach basic cooking skills — scrambled eggs, a simple pasta dish, a salad, making a smoothie. These are the life skills that will feed them in adulthood.',
      'Discuss media and peer messaging about bodies and food openly — ask what they hear, what they think, and offer your perspective without lecturing.',
      'Include your child in meal planning for the family one night per week — real responsibility with real stakes.',
    ],
    dontList: [
      'Don\'t comment on your child\'s weight, body shape, or the bodies of others in their presence — these comments are strongly associated with eating disorder development.',
      'Don\'t put your child on a diet — this is associated with disordered eating in adolescence, regardless of the child\'s weight.',
      'Don\'t use food as emotional regulation ("stressed? have a biscuit") or prohibition ("you don\'t need that").',
    ],
    activities: [
      [
        'Solo Cooking Night',
        'Once a week, your child plans and prepares one meal for the family (with support as needed). Build the recipe repertoire over the year — simple, achievable, progressively more complex.',
        40,
        'Weekly',
      ],
      [
        'Food Detective',
        'Pick one processed food your child loves and read the ingredients list together — not as a prohibition exercise, but as curiosity. Look up what each ingredient is. No judgement, just information.',
        15,
        'Monthly',
      ],
    ],
    topics: [
      {
        key: 'body_image_and_food',
        patterns: [
          'calling themselves fat',
          'comparing body to friends',
          'doesn\'t want to eat',
          'worried about getting fat',
          'diet talk at school',
          'friends are on diets',
        ],
        response: `Body image concerns are emerging earlier than ever — many children report hearing diet talk and body criticism from peers as early as age 7–8. When {{child_name}} makes comments about their own body or others\' in relation to food, the response matters more than the comment itself.\n\nA useful response approach: take it seriously without amplifying panic, ask open questions ("what makes you think that?"), and redirect toward function ("your body is amazing at football — what does it need to play well?"). Avoid immediately reassuring ("you\'re not fat!") as this confirms the frame that fatness would be bad. Model body neutrality in your own language — what bodies do matters more than what they look like.`,
      },
      {
        key: 'independence_and_food_choices',
        patterns: [
          'buying food without me',
          'canteen choices',
          'pocket money and food',
          'eating at friends\' houses',
          'food independence',
        ],
        response: `{{child_name}} is increasingly making food decisions without you — at the canteen, at friends\' houses, and eventually with pocket money at shops. This is developmentally appropriate and the goal is to build the internal skills to navigate it, not to extend control.\n\nHaving clear but not rigid home food norms gives {{child_name}} a reference point for choices outside the home. Avoiding shame about independent choices while expressing curiosity ("what did you choose? was it good?") keeps the conversation open. Giving {{child_name}} regular practice making choices within agreed parameters at home — choosing the snack, choosing one item at the supermarket — builds the decision-making muscle.`,
      },
      {
        key: 'pre_puberty_nutrition_needs',
        patterns: [
          'growing quickly',
          'always hungry',
          'how much should they eat',
          'nutrition before puberty',
          'calcium for growing',
          'iron for girls',
        ],
        response: `The two to three years before puberty onset are a period of accelerating growth that increases nutritional requirements significantly. {{child_name}} being hungrier than usual is a reliable sign of a growth phase — this is the time to ensure adequate calcium (dairy or fortified alternatives, leafy greens), iron (red meat, legumes, fortified cereals), zinc, and protein.\n\nFor girls approaching puberty, iron needs increase before menstruation begins — establishing iron-rich eating habits now is good preparation. The practical message: honour bigger appetites with more food, not smaller portions of healthier food. Calorie restriction is contraindicated during growth phases regardless of body weight.`,
      },
      {
        key: 'eating_disorder_early_signs',
        patterns: [
          'not eating at school',
          'hiding food',
          'afraid of food',
          'obsessed with healthy eating',
          'eating very little',
          'cutting out food groups',
        ],
        response: `Early eating disorder warning signs in this age group can be subtle and are often framed as "healthy eating" — cutting out whole food groups, being unusually preoccupied with food ingredients, eating very small amounts while insisting they are full, or disappearing to the bathroom after meals. These warrant gentle but direct attention.\n\nApproach {{child_name}} with curiosity and care rather than alarm: "I\'ve noticed you\'ve been eating less lately — can you tell me how food has been feeling?" Keep the conversation open. If you are concerned about what you\'re seeing, a GP visit that includes a growth measurement and weight check is the appropriate first step — do not try to manage suspected eating disorder concerns alone.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_8yr_prepares_simple_meal',
        'Can prepare a simple meal independently',
        108,
        'Can {{child_name}} prepare a simple meal (e.g., toast with toppings, scrambled eggs, bowl of cereal with fruit) without adult assistance?',
      ],
      [
        'nut_8yr_nutrition_knowledge',
        'Has basic nutrition knowledge and can identify food groups',
        120,
        'Does {{child_name}} know the major food groups, understand why protein and vegetables matter, and make reasonable food choices when given options?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_8yr_eating_disorder',
        description: 'Early eating disorder signs: restriction, food rituals, weight loss, distress around eating, excessive "healthy eating" focus',
        severity: 'urgent_referral',
        pattern:
          'parent reports weight loss over 1–2 months, avoidance of eating with the family, secretive eating or eating very small amounts, excessive interest in "clean eating" or calorie content, bathroom visits after meals',
        action:
          'Do not wait and watch. Arrange GP review within the week for weight measurement and screening. Early intervention is critical for eating disorder outcomes — delays of even weeks increase treatment complexity. Do not frame this as "going through a phase."',
        referral: 'Child and adolescent psychiatrist or eating disorder service; paediatric dietitian with eating disorder experience',
      },
    ],
    coping: {
      normalizations: [
        'An 8–12 year old who is increasingly opinionated about food is developmentally healthy — the goal is not compliance, it is gradual transfer of responsibility.',
        'Hearing your child repeat diet culture language is alarming, but it means they are navigating a real social environment — the response is conversation, not isolation.',
      ],
      strategies: [
        'Family dinner conversation that includes what you each ate and enjoyed during the day normalises talking about food as pleasure and fuel, not anxiety.',
        'If you have concerns about your child\'s eating, keep a private two-week log of what you observe before raising it with a doctor — this gives the professional something concrete to work with.',
      ],
      selfCare: [
        'Your own relationship with food and your body is the most powerful thing modelling your child\'s — if you are struggling with food anxiety or disordered eating yourself, this is worth addressing for both your sake and theirs.',
        'Parenting a child through growing food independence requires letting go of control, which is hard — finding other parents navigating the same phase can be grounding.',
      ],
      partner:
        'Disagreements about food restriction, weight commenting, or feeding approach are common as children approach puberty. The research on parental weight commentary and eating disorder risk is strong enough to warrant a direct conversation about shared language.',
      warnings: [
        'If your child is spending significant time on social media accounts focused on "clean eating," diet tips, or body transformation, this is an evidence-based risk factor for eating disorders — a conversation and boundary around this content is appropriate.',
        'If you are feeling relieved that your child is "finally" eating less because of weight concerns, check this instinct against professional guidance — restricting intake during growth phases has serious consequences regardless of current weight.',
      ],
    },
    evidence:
      'Neumark-Sztainer D et al (2010) Family meals and disordered eating in adolescents. Arch Pediatr Adolesc Med 164(5):433-439. Loth KA et al (2014) Food-related parenting practices and adolescent weight status. Pediatrics 133(5):e1344. Stice E et al (2011) Psychological and behavioral risk factors for onset of binge eating. J Abnorm Psychol 120(1):166.',
  },

  // ── 12–15 years ──────────────────────────────────────────────────────────────
  {
    agePeriod: '12-15yr',
    ageMin: 144,
    ageMax: 180,
    title: 'Growth Spurt Nutrition: Resistance and Resilience',
    whatToExpect:
      'Adolescence brings the second-highest nutritional requirements of any life stage (after pregnancy), arriving at exactly the moment when diet culture, peer appearance norms, and media body ideals are at their most intense. Supporting your teenager\'s nutritional needs while protecting their relationship with food requires careful balance between guidance and autonomy.',
    keyMessage: 'Talk about food as fuel and pleasure — never as a tool for managing the body\'s appearance.',
    dailyTips: [
      'Keep the kitchen stocked with substantial, accessible snacks — growing teenagers need 2000–3000+ calories per day and will forage if healthy options aren\'t available.',
      'Maintain family dinner at least 3–4 times per week without screens — this is one of the most protective factors for adolescent mental health and eating.',
      'Don\'t police snacking or second servings during active growth periods — adequate energy intake is the priority.',
    ],
    doList: [
      'Take eating disorder warning signs seriously and act early — outcomes are significantly better with early intervention.',
      'Teach your teenager to read a nutrition label critically — both for actual health information and to spot marketing language.',
      'Support your teenager\'s interest in cooking by increasing their kitchen autonomy — let them cook for the family, experiment with cuisines, fail safely.',
    ],
    dontList: [
      'Don\'t comment on your teenager\'s body shape or weight, even positively ("you\'ve lost weight, you look great") — this reinforces the idea that the body\'s appearance is your primary concern.',
      'Don\'t engage in fad diets yourself or discuss following them in front of your teenager.',
      'Don\'t restrict a hungry teenager\'s intake without a strong medical reason — hunger in growth spurts is physiological, not gluttony.',
    ],
    activities: [
      [
        'Cultural Food Night',
        'Once a month, your teenager picks a cuisine they\'ve never tried and prepares one dish from scratch. This builds cooking skills, cultural curiosity, and food confidence at the same time.',
        60,
        'Monthly',
      ],
      [
        'Meal Plan for the Week',
        'Once a month, your teenager takes full responsibility for planning dinners for one week — budget, shopping list, and cooking. Parent supports without taking over.',
        30,
        'Monthly',
      ],
    ],
    topics: [
      {
        key: 'diet_culture_and_teens',
        patterns: [
          'wants to go on a diet',
          'intermittent fasting teen',
          'cutting carbs',
          'influenced by social media eating',
          'wants to be vegan for weight loss',
          'calorie counting',
        ],
        response: `Teenagers are swimming in a sea of diet culture — TikTok nutritional misinformation, fad diets presented as wellness, and social norms that frame restriction as virtue. When {{child_name}} expresses interest in a new diet or restriction, the approach matters enormously.\n\nAvoid direct prohibition, which increases the behaviour\'s appeal. Instead: get curious about where the idea came from and what they\'re hoping to achieve. Distinguish between genuine ethical or value-based dietary changes (plant-based for environmental reasons) and restriction motivated by body appearance change — these require different conversations. For any significant dietary restriction, a review with a dietitian ensures nutritional needs are met and gives your teenager expert information rather than just parental opinion.`,
      },
      {
        key: 'eating_disorder_recognition',
        patterns: [
          'not eating',
          'obsessed with calories',
          'eating disorder signs',
          'purging',
          'very thin',
          'binge eating',
          'food guilt',
          'scared to eat',
        ],
        response: `Eating disorders are the most common serious mental health condition in adolescent girls, and increasingly common in boys and non-binary young people. Early warning signs include: significant restriction of intake, intense preoccupation with food and calories, avoidance of eating with others, large secret eating followed by guilt, using exercise to "compensate" for eating, or visible weight change.\n\nIf you are concerned about {{child_name}}, trust your instinct. A GP visit for a weight and growth check is the first step — be direct with the GP about your concerns so they can screen appropriately. The earlier an eating disorder is identified and treated, the better the outcomes. Do not be reassured by "I\'m eating fine" if the behaviours concern you.`,
        boundary: true,
      },
      {
        key: 'sports_and_performance_nutrition',
        patterns: [
          'protein shakes for teenager',
          'sports nutrition',
          'performance eating',
          'pre-game food',
          'post-workout eating',
          'athlete diet',
        ],
        response: `For an active teenager involved in sport, nutritional needs are genuinely higher — timing protein around training (within an hour of exercise), ensuring adequate carbohydrate for energy, and staying hydrated are evidence-based strategies. A whole-food approach (lean meat, eggs, dairy, legumes, wholegrains) meets these needs without supplementation for the vast majority of teenagers.\n\nProtein supplements and sports drinks are heavily marketed to this age group and largely unnecessary — most teenagers doing recreational or even competitive sport get sufficient protein from food. Creatine and other performance supplements are not recommended under 18 years. If {{child_name}} is training at high intensity or at competitive level, a session with a sports dietitian is a worthwhile investment.`,
      },
      {
        key: 'vegetarian_or_vegan_request',
        patterns: [
          'wants to be vegan',
          'going vegetarian',
          'ethical eating',
          'refusing meat',
          'plant-based teenager',
          'no meat',
        ],
        response: `A teenager wanting to go vegetarian or vegan deserves to be taken seriously — this is often a genuinely values-driven decision about environment, animal welfare, or health, and dismissing it misses an opportunity for engagement. It is also nutritionally manageable with planning.\n\nThe nutritional watch-points for a plant-based teenage diet are iron, vitamin B12 (essential from animal products or fortification — requires supplementation if fully vegan), calcium, zinc, and omega-3 fatty acids. Helping {{child_name}} plan meals that meet these needs, and arranging a dietitian review, supports both their values and their health. Distinguish clearly between vegetarianism as a value and vegetarianism as weight loss — if it\'s the latter, that conversation is different and more urgent.`,
      },
    ],
    milestones: [
      [
        'nut_12yr_cooks_independently',
        'Can plan and cook a nutritionally balanced meal independently',
        156,
        'Can {{child_name}} plan and prepare a meal that includes a protein source, vegetables, and a carbohydrate, without guidance?',
      ],
      [
        'nut_12yr_food_critical_literacy',
        'Can critically evaluate nutritional claims and identify marketing language',
        168,
        'Can {{child_name}} look at a food label or a social media health claim and identify whether it is accurate or misleading?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_12yr_eating_disorder_active',
        description: 'Active eating disorder signs: weight loss, food restriction, purging behaviours, or binge-purge cycle',
        severity: 'urgent_referral',
        pattern:
          'parent reports weight loss of 5%+ of body weight, food restriction that is affecting daily functioning, sounds of vomiting after meals, laxative use, or excessive secretive eating followed by distress',
        action:
          'Urgent GP referral today. This is a medical emergency if significant weight loss is occurring. Early eating disorder intervention is time-sensitive. Do not manage alone. Be direct with the GP about specific observed behaviours.',
        referral: 'Child and adolescent mental health service (CAMHS) or eating disorder unit; paediatric dietitian with eating disorder specialisation; GP to assess medical stability',
      },
    ],
    coping: {
      normalizations: [
        'A hungry teenager who seems to eat constantly during a growth spurt is not overeating — their caloric needs have genuinely doubled, and honouring that hunger is appropriate.',
        'Conflict over food is common in adolescence because food is also about autonomy, identity, and peer belonging — it is rarely just about food.',
      ],
      strategies: [
        'Maintain family meals as a connection ritual, not a food supervision exercise — the conversation and togetherness matters more than what is on the plate.',
        'If you are worried about your teenager\'s eating, writing down specific observed behaviours (not impressions) before speaking to a doctor helps the professional assess severity quickly.',
      ],
      selfCare: [
        'Parenting a teenager through diet culture requires active media literacy yourself — understanding what they are seeing on social media about food and bodies helps you have better conversations.',
        'If your teenager\'s eating is causing you significant ongoing anxiety, a single session with a family therapist or adolescent eating specialist can give you a framework to respond rather than react.',
      ],
      partner:
        'Eating disorders and disordered eating are deeply stigmatised — parents sometimes disagree about whether something is "serious enough" to act on. The research supports erring on the side of early assessment. Having a shared position that "we take food concerns seriously in this family" removes the barrier to action.',
      warnings: [
        'If your own anxiety about your teenager\'s weight or body is leading to food monitoring, calorie commentary, or food restriction at home, this is a risk factor for eating disorder development that is worth addressing through your own professional support.',
        'If a teenager is exercising more than 2 hours daily in addition to a sports programme, and is restricting food intake, this may be Relative Energy Deficiency in Sport (RED-S) — a specific condition with serious bone and hormonal consequences that requires sports medicine review.',
      ],
    },
    evidence:
      'Schebendach JE (2012) Nutrition in eating disorders. In: Shils ME et al (eds) Modern Nutrition in Health and Disease. Golden NH et al (2003) Eating disorders in adolescents. J Adolesc Health 33(6):496-503. Thomas JJ & Eddy KT (2019) Cognitive-Behavioral Therapy for Avoidant/Restrictive Food Intake Disorder. Cambridge University Press.',
  },

  // ── 15–18 years ──────────────────────────────────────────────────────────────
  {
    agePeriod: '15-18yr',
    ageMin: 180,
    ageMax: 216,
    title: 'Independent Eating: Skills for a Lifetime',
    whatToExpect:
      'Your teenager is moving toward full independence in food — cooking for themselves, navigating food outside the home, and building the eating patterns they will carry into adulthood. This is the window to consolidate cooking skills, establish a positive relationship with food, and launch a young adult who can feed themselves well without you.',
    keyMessage: 'The goal of all this work is a young adult who trusts their body\'s signals, can cook, and enjoys food without guilt.',
    dailyTips: [
      'Gradually hand over more cooking responsibility — by 17–18, your teenager should be able to feed themselves nutritionally for a week without you.',
      'Talk openly about food budgeting, food waste, and practical food planning — these are the skills that determine eating quality in adulthood.',
      'Model a healthy relationship with food in your own eating — flexible, enjoyable, without guilt or compensation language.',
    ],
    doList: [
      'Teach the ten core recipes that make someone food-independent: a protein dish, a grain dish, a vegetable preparation, a soup, a salad, a breakfast, a snack, eggs three ways, a sauce, and a one-pot meal.',
      'Have frank conversations about alcohol and its interaction with nutrition — this is the age when alcohol becomes accessible.',
      'Discuss eating away from home — university canteens, budget cooking, cooking for oneself.',
    ],
    dontList: [
      'Don\'t control food choices as they prepare to leave home — the goal is trusted independence, not supervised compliance.',
      'Don\'t create dependence by refusing to teach cooking because it\'s "easier to do it yourself."',
      'Don\'t make leaving-home nutrition lectures anxiety-inducing — equip and trust rather than warn and worry.',
    ],
    activities: [
      [
        'Full Week Meal Ownership',
        'For one week each school holiday, your teenager plans, shops for, and prepares all family evening meals on a set budget. Debrief at the end of the week.',
        45,
        'School holidays',
      ],
      [
        'Batch Cooking Workshop',
        'Teach your teenager to batch-cook for a week in one 2-hour session — staples that can be assembled into multiple meals. This is the skill that enables healthy eating on a student budget.',
        120,
        'Termly',
      ],
    ],
    topics: [
      {
        key: 'leaving_home_nutrition',
        patterns: [
          'going to university',
          'living away from home',
          'cooking for one',
          'student food budget',
          'eating alone',
          'halls of residence food',
        ],
        response: `The nutrition transition when {{child_name}} leaves home is one of the most significant food environment shifts of their life — suddenly responsible for 100% of their own eating on a limited budget, often in a shared kitchen, with unlimited access to cafeterias and takeaways. Research shows diet quality typically drops in the first year of independent living.\n\nThe most protective factor is practical cooking competence before they leave — the ability to cook 8–10 reliable meals from scratch is more valuable than any nutrition knowledge. Help them build a repertoire: simple pasta dishes, rice and protein, stir-fries, egg-based meals, soups, and a few things they genuinely enjoy making. A batch cooking habit (cooking for 3–4 days at once) is the single most effective budget and quality strategy for student living.`,
      },
      {
        key: 'body_image_late_teen',
        patterns: [
          'unhappy with body',
          'gym obsession',
          'protein diet for muscles',
          'wants to lose weight',
          'hates their body',
          'body dysmorphia signs',
        ],
        response: `Body dissatisfaction is at its most intense in late adolescence — this is true for young people of all genders, though it manifests differently. For {{child_name}}, unhappiness with their body in relation to food choices warrants a careful, non-reactive conversation rather than reassurance or agreement.\n\nFor young men, excessive focus on muscle building, protein supplements, and body transformation can be an expression of body dysmorphia (Muscle Dysmorphic Disorder) rather than healthy fitness. For young women, weight loss focus at this age is a risk period for eating disorder onset or relapse. An open conversation that distinguishes between "what your body does" from "how your body looks" — and takes seriously what you\'re hearing without catastrophising — is the right starting point.`,
      },
      {
        key: 'exercise_and_eating',
        patterns: [
          'gym and eating',
          'not eating enough to exercise',
          'sports diet',
          'pre-workout food',
          'eating disorder and exercise',
          'exercise to burn calories',
        ],
        response: `The relationship between exercise and eating in late adolescence is complex — exercise can be genuinely health-promoting, or it can become a mechanism for calorie control that tips into disordered territory. The key distinction is whether {{child_name}} is eating more to support exercise, or restricting eating because of exercise.\n\nHealthy exercise and eating: appetite increases, food choices shift to support performance, energy levels are good, rest days happen without distress. Concerning patterns: inability to take rest days without guilt, eating less than hunger dictates to "keep calories down," exercise used to "compensate" for eating, energy levels declining despite training. The second pattern warrants a GP or sports medicine review.`,
      },
      {
        key: 'food_budget_and_choices',
        patterns: [
          'healthy eating on budget',
          'cheap healthy food',
          'student nutrition',
          'food costs',
          'eating cheaply',
        ],
        response: `Healthy eating on a student or limited budget is genuinely possible — and learning to do it is one of the most valuable life skills {{child_name}} can develop now. The foundations: dried legumes, eggs, whole grains, seasonal vegetables, tinned fish, and frozen vegetables are consistently among the most nutritious and cheapest foods available in almost every country.\n\nTeach the "cheap nutritious staples" toolkit: lentil dal, egg fried rice, bean burritos, oat porridge, pasta with tinned tomatoes and protein. These can be made for under 50–100 rupees per meal and are nutritionally complete. The expensive part of eating is usually either takeaway or branded/processed convenience food — learning to cook a cheap real meal fast is the way to avoid both.`,
        boundary: true,
      },
    ],
    milestones: [
      [
        'nut_15yr_food_independent',
        'Can feed themselves nutritionally for a week without assistance',
        192,
        'If {{child_name}} had to feed themselves for a week — planning, shopping, and cooking — do they have the skills and knowledge to do it nutritionally and within a budget?',
      ],
      [
        'nut_15yr_positive_food_relationship',
        'Demonstrates flexible, guilt-free relationship with food',
        210,
        'Does {{child_name}} seem to enjoy food without guilt, eat a variety without rigid rules, and trust their own hunger and fullness signals?',
      ],
    ],
    redFlags: [
      {
        id: 'rf_nut_15yr_eating_disorder_transition',
        description: 'Eating disorder concerns around transition to independence — restriction, purging, or severe body dysmorphia increasing as home support reduces',
        severity: 'urgent_referral',
        pattern:
          'parent reports increased food restriction as departure from home approaches, escalating exercise rituals, purging behaviours, or young person expressing intense body hatred that is affecting functioning',
        action:
          'Do not wait for departure. Arrange urgent GP or CAMHS review. Transition points (leaving school, leaving home) are high-risk periods for eating disorder onset and relapse. Ensure any eating disorder treatment provider is notified of upcoming transition.',
        referral: 'Adult eating disorder service (preparing for transition from CAMHS); GP for medical stability assessment; university student health services should be pre-registered',
      },
    ],
    coping: {
      normalizations: [
        'Watching your teenager make food choices you would not make as they gain independence is part of the deal — the goal was always for them to be in charge of their own eating.',
        'Not every family launches a teenager with perfect cooking skills — what matters is that they have some foundation and a willingness to learn.',
      ],
      strategies: [
        'A "cooking curriculum" over the last two years before they leave — one new skill per month — is more achievable and less overwhelming than a panic-intensive cooking crash course.',
        'Sending them with a small collection of favourite family recipes written down (or in a shared digital note) is both practical and emotionally grounding.',
      ],
      selfCare: [
        'The loss of daily oversight of your child\'s eating as they move toward independence is a genuine transition that can trigger parental anxiety — especially if food has been a source of worry throughout childhood.',
        'Reflecting on what food values you have genuinely passed on, rather than focusing on what you didn\'t achieve, is a healthier frame for this transition.',
      ],
      partner:
        'The transition out of the home is a good time to revisit your own food habits as a couple — family meals will look different, and building a post-children food culture together can be a positive reorientation.',
      warnings: [
        'If your worry about your teenager\'s eating or body is causing you significant distress as they approach leaving home, a session with a therapist — rather than increased food monitoring — is the appropriate response.',
        'If you are planning to send regular food parcels, meal kits, or money specifically for food because you don\'t trust them to eat well, reflect on whether this is about their competence or your own anxiety about separation.',
      ],
    },
    evidence:
      'Larson NI et al (2012) Food preparation and purchasing roles among adolescents. J Am Diet Assoc 106(2):211-218. Nelson MC et al (2008) Emerging adulthood and college-aged youth — an overlooked age for obesity prevention. Obesity 16(10):2205-11. Neumark-Sztainer D (2005) Can we simultaneously work toward prevention of obesity and eating disorders in children and adolescents? Int J Eat Disord 38(3):220-7.',
  },
]
