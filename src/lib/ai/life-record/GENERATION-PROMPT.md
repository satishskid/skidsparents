# SKIDS Knowledge Graph — Entry Generation Prompt

Copy the ENTIRE prompt below (including the example) into Groq/Gemini.
Run it ONCE PER BATCH (see batches at the bottom).

---

## PROMPT START — COPY FROM HERE

You are a pediatric clinical knowledge engineer. Generate knowledge graph entries for a pediatric screening/surveillance system used in India.

### OUTPUT FORMAT

Output ONLY valid TypeScript array entries. No markdown, no explanation, no commentary. Each entry must match this exact structure:

```typescript
{
  id: string,                    // format: '{domain}_{observation}_{condition}_{ageMin}_{ageMax}'
  observationPatterns: string[], // 5-8 phrases a PARENT would say (not clinical terms)
  domain: BodySystem,            // one of: neurological, vision, hearing, cardiac, respiratory, dental, musculoskeletal, skin, gi_nutrition, behavioral, emotional, language, motor, cognitive, growth, immunological, endocrine, urogenital, general
  ageMinMonths: number,
  ageMaxMonths: number,
  conditionName: string,         // medical condition name
  icd10?: string,                // ICD-10 code if applicable
  conditionCategory: string,     // one of: normal_variant, developmental, infectious, nutritional, genetic, neurological, behavioral, sensory, metabolic, structural, allergic, autoimmune, neoplastic, functional, environmental, psychosocial, endocrine
  baseProbability: number,       // 0.0-1.0, from epidemiological literature for Indian population
  mustNotMiss: boolean,          // true = rare but dangerous, always surface
  urgency: string,               // one of: routine, soon, urgent, emergency
  citation: string,              // real reference: IAP Guidelines, AAP Bright Futures, Nelson's, WHO, Indian Pediatrics journal, with year
  parentExplanation: string,     // 2-3 sentences, warm, non-alarming, Indian English, empowering
  parentNextSteps: string[],     // 3-5 questions parent can observe at home
  doctorExamPoints: string[],    // 4-6 clinical exam steps for pediatrician
  ruleOutBefore?: string[],      // conditions to exclude first (physiological-first approach)
  modifiers: ConditionModifier[] // 2-4 modifiers from: birth_history, growth_trend, milestone_status, prior_observation, screening_result, vaccination_status, family_history, active_condition, medication, diet, environment, recent_illness
}
```

Each modifier:
```typescript
{ source: ModifierSource, key: string, description: string, multiplier: number, explanation: string }
```
- multiplier > 1.0 means INCREASES probability
- multiplier < 1.0 means DECREASES probability (protective)
- multiplier range: 0.2 to 10.0

### RULES

1. **Every observation in an age bracket MUST have at least one normal_variant entry** with baseProbability 0.5-0.85. Parents need reassurance — most things are normal.

2. **Every observation MUST have at least one must-not-miss entry** — the rare-but-dangerous condition that should never be missed. Set mustNotMiss: true, baseProbability low (0.001-0.05).

3. **observationPatterns must be PARENT language**, not clinical:
   - GOOD: "not talking", "doesn't say words", "only points", "very quiet"
   - BAD: "expressive language delay", "speech apraxia", "phonological disorder"

4. **baseProbability must be epidemiologically accurate** for Indian pediatric population. Cite the source. Common conditions: 0.3-0.85. Uncommon: 0.05-0.3. Rare: 0.001-0.05.

5. **For each observation concern, create 2-4 entries**: one normal variant, one common pathology, one rare must-not-miss. Same observationPatterns, different conditions, different age ranges.

6. **Indian context**: Reference IAP (Indian Academy of Pediatrics) guidelines where available. Mention Indian prevalence data. Use "paediatrician" not "pediatrician" in parent text.

7. **Age ranges should overlap appropriately**. A concern like "not talking" has different entries for 12-15mo (normal), 15-24mo (evaluate), 24-36mo (intervene).

8. **ICD-10 codes are required** for all non-normal-variant conditions.

### EXAMPLE ENTRY (for reference — do NOT include this in output)

```typescript
  {
    id: 'motor_not_walking_normal_10_15',
    observationPatterns: ['not walking', 'hasn\'t started walking', 'can\'t walk', 'doesn\'t walk', 'no walking', 'late walker', 'not taking steps'],
    domain: 'motor',
    ageMinMonths: 10, ageMaxMonths: 15,
    conditionName: 'Normal variant — within expected range',
    conditionCategory: 'normal_variant',
    baseProbability: 0.85,
    mustNotMiss: false,
    urgency: 'routine',
    citation: 'WHO Motor Development Study 2006; walking range 9-17 months',
    parentExplanation: 'Most children walk between 9 and 15 months. Your child is within the normal range. Some children who crawl well or bottom-shuffle start walking later.',
    parentNextSteps: ['Does your child pull to stand?', 'Does your child cruise along furniture?', 'Is your child a bottom-shuffler? (they tend to walk later)'],
    doctorExamPoints: ['Check muscle tone', 'Assess pull-to-stand', 'Check for asymmetry', 'Review birth history'],
    modifiers: [
      { source: 'birth_history', key: 'preterm', description: 'Born before 37 weeks', multiplier: 1.2, explanation: 'Preterm babies use corrected age — this child may be effectively younger' },
      { source: 'milestone_status', key: 'pulls_to_stand_achieved', description: 'Can pull to stand', multiplier: 1.3, explanation: 'Pulling to stand is the precursor — walking is coming' },
      { source: 'family_history', key: 'late_walkers', description: 'Family history of late walking', multiplier: 1.2, explanation: 'Late walking often runs in families' },
    ],
  },
```

### GENERATE ENTRIES FOR: {{BATCH_TITLE}}

{{BATCH_INSTRUCTIONS}}

Output the entries as a TypeScript array. Start with `[` and end with `]`. No other text.

## PROMPT END

---

## BATCHES — Run one at a time

### Batch 1: MOTOR (all ages)
Replace {{BATCH_TITLE}} with: `Motor Development — All Ages (0-18yr)`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for motor development observations across all ages:

0-3mo: not holding head up, floppy baby, stiff baby, not moving arms/legs equally
3-6mo: not rolling, not reaching for toys, poor head control, hand fisting
6-9mo: not sitting, not transferring objects, not bearing weight on legs
9-12mo: not crawling (already exists — SKIP), not pulling to stand, not picking up small objects (pincer grasp)
12-18mo: not walking (already exists — SKIP), clumsy/falls a lot, toe walking
18-24mo: not running, not climbing stairs, not kicking a ball
2-3yr: poor balance, can't jump, not pedaling tricycle, frequent tripping
3-5yr: can't hop on one foot, poor throwing/catching, can't button clothes, poor pencil grip
5-8yr: poor handwriting, clumsy in sports, avoids physical activity, poor coordination
8-12yr: clumsy/uncoordinated, can't keep up with peers in sports, deteriorating motor skills
12-18yr: sudden weakness, muscle cramps during activity, declining sports performance

For each observation, create 2-4 entries:
- Normal variant (reassurance)
- Common condition (developmental coordination disorder, benign hypotonia, etc.)
- Must-not-miss (CP, muscular dystrophy, spinal cord issue, brain tumor, etc.)

Expect ~25-30 entries total for this batch.
```

### Batch 2: LANGUAGE + HEARING (all ages)
Replace {{BATCH_TITLE}} with: `Language & Hearing Development — All Ages`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for language/speech and hearing observations:

0-3mo: not startling to loud sounds, not cooing, not turning to voice
3-6mo: not babbling, not laughing, no response to name (already have 5-9mo — extend to younger)
6-12mo: not babbling consonants (exists — SKIP), no gestures (pointing, waving), doesn't understand "no"
12-18mo: no words (exists — SKIP but add "late talker" pattern), doesn't follow simple commands, doesn't point to show
18-24mo: fewer than 20 words, doesn't combine words, only parents understand speech
2-3yr: stuttering, unclear speech, can't form sentences, doesn't answer questions
3-5yr: can't tell a story, pronunciation problems, doesn't understand instructions, lisp
5-8yr: reading difficulty, can't follow multi-step instructions, speech unclear to strangers
8-12yr: difficulty with written expression, word finding problems, voice changes (hoarseness)
12-18yr: voice breaks/hoarseness, social communication difficulty

For each: normal variant + common condition + must-not-miss. ~25-30 entries.
```

### Batch 3: VISION + DENTAL (all ages)
Replace {{BATCH_TITLE}} with: `Vision & Dental Development — All Ages`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for vision and dental observations:

VISION:
0-3mo: not fixing/following, white reflex in photos, eyes not moving together
3-6mo: not reaching for objects, one eye wandering (exists partially — SKIP if exact overlap)
6-12mo: bumping into things, not recognizing faces across room
12-36mo: squinting (exists — SKIP), rubbing eyes excessively, tilting head to see
3-5yr: sitting close to TV (exists — SKIP), difficulty with puzzles/coloring
5-8yr: complains of headaches when reading, holds book very close, loses place while reading
8-12yr: difficulty seeing board at school, eye strain with screens, frequent headaches
12-18yr: sudden vision change, floaters, eye pain

DENTAL:
0-12mo: no teeth by 12 months, discolored first teeth, excessive drooling with no teeth
12-24mo: brown spots on teeth, not chewing solids, grinding teeth, tooth pain
2-5yr: cavities/black teeth, thumb sucking affecting teeth, mouth breathing, not losing baby teeth
5-8yr: crooked permanent teeth, teeth growing behind baby teeth (shark teeth), tooth knocked out
8-12yr: teeth not coming in, jaw pain, bad breath despite brushing
12-18yr: wisdom tooth pain, teeth grinding, TMJ clicking/pain

~25-30 entries total.
```

### Batch 4: BEHAVIORAL + EMOTIONAL (all ages)
Replace {{BATCH_TITLE}} with: `Behavioral & Emotional Development — All Ages`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for behavioral and emotional observations:

0-3mo: excessive crying/colic, not smiling, irritable all the time, poor sleep-wake cycle
3-6mo: not smiling socially, no interest in surroundings, stiff when held
6-12mo: no stranger anxiety by 9mo, not imitating, excessive head banging, not responding to emotions
12-24mo: tantrums (exists — SKIP), no pretend play, doesn't bring things to show, repetitive behaviors, extreme separation anxiety
2-3yr: aggressive biting/hitting, can't play with other kids, obsessive routines, extreme fears
3-5yr: can't sit still, doesn't follow rules, still having tantrums, selective mutism, imaginary friends concern
5-8yr: school refusal, bullying/being bullied, lying/stealing, can't make friends, attention problems
8-12yr: mood swings, low self-esteem, perfectionism/anxiety, screen addiction, defiant behavior
12-18yr: social withdrawal, self-harm, eating disorder signs, substance experimentation, identity confusion, rage outbursts

~25-30 entries total.
```

### Batch 5: GROWTH + NUTRITION + GI (all ages)
Replace {{BATCH_TITLE}} with: `Growth, Nutrition & Gastrointestinal — All Ages`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for growth, nutrition, and GI observations:

GROWTH:
0-6mo: not gaining weight (exists partially — extend), head growing too fast (exists — SKIP), too small
6-12mo: weight plateauing, length not increasing
12-36mo: shorter than all peers, overweight toddler, head shape flat
3-5yr: shortest in class, gaining weight rapidly
5-12yr: tall/short for age, early growth spurt, body proportions unusual
12-18yr: not growing in height, growth spurt too early/late

NUTRITION:
0-6mo: poor feeding, refusing breast/bottle, not gaining on feeds
6-12mo: refusing solids, gagging on all textures, only wants milk
12-36mo: picky eating (exists — SKIP), craving non-food items (pica), excessive thirst
3-8yr: always hungry, eats very little, craving ice/chalk/dirt

GI:
0-6mo: vomiting after feeds (exists — SKIP), blood in stool, constipation, green stool
6-12mo: chronic diarrhea, hard stools, bloated belly
12-36mo: recurrent abdominal pain, foul-smelling bulky stools, not tolerating milk/wheat
3-8yr: stomachaches before school, constipation chronic, blood in stool
8-18yr: recurrent abdominal pain, weight loss with appetite change, acid reflux symptoms

~25-30 entries total.
```

### Batch 6: NEURO + COGNITIVE (all ages)
Replace {{BATCH_TITLE}} with: `Neurological & Cognitive Development — All Ages`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for neurological and cognitive observations:

NEUROLOGICAL:
0-3mo: seizure-like movements, excessive jitteriness, sunset eyes, bulging fontanelle
3-12mo: infantile spasms (exists — extend patterns), sudden head drops, staring episodes, not fixing on faces
12-36mo: febrile seizure (exists — SKIP), sudden loss of skills (regression), unsteady walking, head banging
3-5yr: staring spells, night terrors vs seizures, sudden confusion episodes
5-12yr: headaches (exists — extend), fainting, tics, numbness/tingling
12-18yr: first seizure, migraine with aura, sudden personality change, memory problems

COGNITIVE:
0-6mo: not tracking objects, not recognizing mother, no social smile
6-12mo: not exploring objects, not problem-solving (finding hidden toy), no cause-and-effect play
12-24mo: not following commands, can't identify body parts, no symbolic play
2-3yr: can't sort shapes/colors, poor memory, doesn't understand "same/different"
3-5yr: can't count to 10, doesn't know colors, poor attention span for stories
5-8yr: learning difficulty (exists — extend), can't read by age 7, number confusion
8-12yr: declining grades, homework takes forever, can't organize, forgetful
12-18yr: can't focus in class, executive function problems, declining academic performance

~25-30 entries total.
```

### Batch 7: CARDIAC + RESPIRATORY + SKIN (all ages)
Replace {{BATCH_TITLE}} with: `Cardiac, Respiratory & Skin — All Ages`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for cardiac, respiratory, and skin observations:

CARDIAC:
0-6mo: blue spells (exists — extend patterns), sweating during feeds, fast breathing at rest, poor feeding + blue lips
6-24mo: tires easily, can't keep up during play, chest pain during feeding
2-5yr: easily tired during play, lips turn blue during running, chest pain, fainting during activity
5-12yr: chest pain during sports, heart racing, fainting during exercise, murmur detected (exists — SKIP)
12-18yr: palpitations, exercise intolerance, chest pain

RESPIRATORY:
0-3mo: noisy breathing (stridor), fast breathing, grunting, nasal flaring, chest indrawing
3-12mo: wheezing (exists — extend to younger), persistent cough, recurrent croup
12-36mo: recurrent cough, wheezing episodes, snoring (exists — SKIP), mouth breathing, chronic runny nose
3-8yr: exercise-triggered cough, nighttime cough, can't keep up in running
8-18yr: shortness of breath, chest tightness during sports, chronic cough

SKIN:
0-6mo: birthmarks, red spots, cradle cap, diaper rash that won't clear, blisters
6-24mo: eczema (exists — extend patterns), hives, spreading rash with fever, ringworm
2-8yr: warts, molluscum, skin peeling, unexplained bruises, hair loss patches
8-18yr: acne, stretch marks, moles changing, excessive sweating, skin lightening/darkening

~25-30 entries total.
```

### Batch 8: ENDOCRINE + UROGENITAL + MSK + IMMUNOLOGICAL
Replace {{BATCH_TITLE}} with: `Endocrine, Urogenital, Musculoskeletal & Immunological — All Ages`
Replace {{BATCH_INSTRUCTIONS}} with:
```
Generate entries for remaining systems:

ENDOCRINE:
0-12mo: undescended testis concern, ambiguous genitalia signs
2-5yr: excessive thirst + frequent urination (diabetes), rapid weight gain
5-8yr: early breast development (girls), body odor too early
8-12yr: early puberty (exists — extend patterns), delayed puberty, thyroid swelling, excessive weight gain
12-18yr: irregular periods, no periods by 16, gynecomastia in boys, excessive body hair

UROGENITAL:
0-12mo: abnormal urine stream, swollen scrotum, undescended testis
12-36mo: UTI symptoms (exists — SKIP), pain during urination, blood in urine
3-8yr: bedwetting (exists — extend daytime wetting), holding urine, vaginal discharge
8-18yr: testicular pain/swelling, menstrual irregularities, vaginal discharge

MUSCULOSKELETAL:
0-12mo: hip click (DDH), uneven leg creases, limited hip opening, twisted feet (clubfoot)
12-36mo: limping (exists — SKIP), bowing legs, knock knees, flat feet concern
3-8yr: growing pains, limping after sports, refuses to use arm (pulled elbow/nursemaid)
8-18yr: back pain, scoliosis (spine curve), knee pain (Osgood-Schlatter), sports injuries, joint hypermobility

IMMUNOLOGICAL:
0-12mo: recurrent infections, slow wound healing, thrush that won't clear
12-36mo: always sick, recurrent ear infections, swollen lymph nodes
3-12yr: frequent sore throats, allergic reactions, asthma + eczema + food allergy (atopic triad)
12-18yr: chronic fatigue with recurrent infections, unexplained fevers, joint pain + rash (autoimmune)

~25-30 entries total.
```
