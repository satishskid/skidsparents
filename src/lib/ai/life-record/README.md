# SKIDS Probabilistic Life Record Engine

## The Paradigm

SKIDS is not a milestone tracker. Not a growth chart app. Not a symptom checker.

**SKIDS is a continuous pediatric life record with probabilistic intelligence.**

Think of a child's health journey as a wire with beads. Each milestone is a bead — but the wire *between* the beads is where 99.4% of childhood happens. Traditional pediatrics gives you 14 checkpoints across 6 years. SKIDS makes the wire itself aware, active, and intelligent.

**The wire knows:**
- What's expected in each age period
- Which diseases and conditions present during each period
- What the child's individual risk factors are (from their life record)
- What the parent should watch for — and what the doctor should examine

**When a parent types ANY observation, the system instantly projects probable conditions** — not by guessing, but by combining population-level epidemiology with the individual child's complete life record using Bayesian reasoning.

> *"SKIDS doesn't diagnose. It unfolds possibilities into probabilities. The doctor confirms into diagnoses. Nothing is missed because the parent is an informed, empowered partner in caregiving."*

---

## Core Architecture — Three Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARENT OBSERVATION                            │
│            "Aarav isn't walking yet, he bottom-shuffles"         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — KNOWLEDGE GRAPH (Population Epidemiology)            │
│                                                                  │
│  observation + age + body system → ranked conditions             │
│  Each entry has:                                                 │
│    • Base probability from epidemiological literature             │
│    • Age range where this mapping applies                        │
│    • Must-not-miss flag for rare but dangerous conditions        │
│    • ICD-10 code, urgency level, clinical citations              │
│                                                                  │
│  Sources: IAP 2024, AAP Bright Futures 4th Ed, WHO,             │
│           Nelson's 22nd Ed, Indian Pediatrics journal            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2 — LIFE RECORD PRIOR (Bayesian Update)                  │
│                                                                  │
│  The child's individual context modifies base probabilities:     │
│                                                                  │
│  12 Modifier Sources:                                            │
│    • Birth history (preterm, NICU, birth weight, complications)  │
│    • Growth trend (percentile crossing, Z-scores, velocity)      │
│    • Milestone status (achieved, delayed, regressed)             │
│    • Prior observations (temporal patterns, frequency)           │
│    • Screening results (vision, hearing, developmental)          │
│    • Vaccination status (up-to-date, overdue)                    │
│    • Family history (hereditary conditions, consanguinity)       │
│    • Active conditions (existing diagnoses)                      │
│    • Medications (current prescriptions)                         │
│    • Diet (breastfed, food diversity, supplements)               │
│    • Environment (urban/rural, pollution, SES)                   │
│    • Recent illness (URI, fever, GI illness)                     │
│                                                                  │
│  Each modifier has a multiplier:                                 │
│    >1.0 = increases probability                                  │
│    <1.0 = decreases probability                                  │
│                                                                  │
│  adjusted_probability = base_probability × Π(modifiers)          │
│  Clamped to [0.001, 0.999]                                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3 — DOCTOR REFINEMENT (Human-in-the-Loop)                │
│                                                                  │
│  The doctor sees the full differential with:                     │
│    • Ranked conditions by adjusted probability                   │
│    • Evidence for and against each condition                     │
│    • Exam points specific to each condition                      │
│    • What to rule out first (physiological-first protocol)       │
│    • Modifiers that fired and why                                │
│                                                                  │
│  Doctor actions:                                                 │
│    • CONFIRM → probability set to ≥0.9, condition moves to      │
│      active_conditions, feeds back into Layer 2 for future       │
│    • RULE OUT → probability set to 0.001                         │
│    • INVESTIGATE → orders tests, probability unchanged           │
│    • ADJUST → manual probability override with clinical notes    │
│                                                                  │
│  Full audit trail: who refined, when, what clinical findings     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Clinical Principles

### 1. Physiological-First Protocol
Before labeling anything behavioral or neurological, the system requires ruling out physiological causes:
- **Iron deficiency** before ADHD (IAP: iron deficiency prevalence 50-90% in Indian children)
- **Sleep-disordered breathing** before behavioral issues
- **Vision problems** before learning difficulty
- **Hearing loss** before speech delay

Every condition entry has a `ruleOutBefore` field listing what should be excluded first.

### 2. Must-Not-Miss Conditions
Rare but dangerous conditions are **always surfaced** regardless of probability:
- Biliary atresia (pale stools in newborns — needs intervention within 60 days)
- Infantile spasms (subtle seizures — needs EEG within days)
- Retinoblastoma (absent red reflex — oncological emergency)
- Non-accidental injury (bruising in non-mobile infant)
- Cyanotic congenital heart disease (blue spells in newborns)
- Hydrocephalus (rapid head circumference growth)

These are flagged with `mustNotMiss: true` and sorted to the top of every projection.

### 3. Normal Variants Are Conditions Too
The system explicitly projects normal developmental variants with their own probabilities:
- "Not walking at 13 months" → 85% probability of normal variant (walking range 9-17 months)
- "Tantrums at 2 years" → 75% probability of normal toddler autonomy-seeking

This prevents over-pathologizing normal development while still surfacing the differential.

### 4. No Diagnosis Without Examination
SKIDS never diagnoses. The system:
- **Projects** probable conditions (AI + life record)
- **Informs** the parent with plain-language explanations and next steps
- **Prepares** the doctor with a pre-computed differential and exam points
- **Records** the doctor's clinical judgment as the source of truth

The parent view says: "Here are possibilities to discuss with your doctor."
The doctor view says: "Pre-computed differential based on life record — confirm or rule out."

### 5. The Parent as Informed Partner
Traditional pediatrics treats the parent as a passive reporter. SKIDS treats the parent as a continuous sensor:
- Domain prompts guide what to observe (without biasing what they see)
- Observations are logged with the parent's own words (no checkbox bias)
- Projections are explained in parent-friendly language
- Next steps empower the parent to gather more information

---

## Accuracy Framework

### Base Probabilities
Every condition in the knowledge graph has a `baseProbability` derived from epidemiological literature:

| Source | Used For |
|--------|----------|
| IAP Guidelines 2024 | Indian-specific prevalence, screening protocols |
| AAP Bright Futures 4th Ed | Developmental surveillance, anticipatory guidance |
| WHO Child Development Standards | Growth references, milestone ranges |
| Nelson's Textbook of Pediatrics 22nd Ed | Disease prevalence, clinical presentation |
| Indian Pediatrics journal | India-specific epidemiology |

Base probabilities represent **population-level prevalence** for a given observation at a given age. They are NOT diagnostic probabilities — they are starting points for Bayesian reasoning.

### Bayesian Modifier Accuracy
Each modifier's multiplier is derived from relative risk or odds ratio data:
- A family history of autism increases ASD probability by 3-5x (sibling recurrence risk 10-20%)
- Prematurity increases motor delay probability by 1.5-3x depending on gestational age
- Normal screening results decrease related condition probability by 0.3-0.5x

**Limitations:**
- Multipliers are approximations of epidemiological data, not precise Bayesian posteriors
- Modifier independence is assumed (no interaction effects between modifiers)
- Multipliers are static — they don't update based on the population using SKIDS
- Environmental modifiers are currently limited (data collection gap)

### Confidence Scoring
Each projection includes a confidence score (0.0 - 1.0) based on life record completeness:

| Confidence | Life Record State | Interpretation |
|------------|-------------------|----------------|
| 0.30 - 0.45 | Minimal — only child age + observation | Low confidence, broad differential |
| 0.45 - 0.65 | Partial — some birth/growth/milestone data | Moderate confidence |
| 0.65 - 0.85 | Good — birth + growth + milestones + screenings | Reliable projections |
| 0.85 - 0.95 | Comprehensive — full life record populated | High confidence |

**The system transparently reports its confidence.** A low-confidence projection says: "Limited life record data. Adding more history will improve accuracy."

### Known Limitations and Honest Boundaries

1. **Pattern matching, not NLP**: Observation matching uses keyword patterns with fuzzy matching, not deep NLP. Complex or ambiguous observations may not match correctly. Future: Workers AI for semantic understanding.

2. **Knowledge graph coverage**: Currently ~40 condition-observation entries. Comprehensive for common presentations but not exhaustive. Rare conditions with atypical presentations may be missed. The knowledge graph must be continuously expanded.

3. **No interaction effects**: Modifiers are applied independently (multiplicative). In reality, some modifiers interact (e.g., prematurity + low birth weight is more than the product of individual effects). Future: interaction terms.

4. **Cultural context**: Base probabilities are primarily from published literature which may not reflect local epidemiology. India-specific prevalence data is used where available (IAP, Indian Pediatrics) but gaps exist.

5. **Temporal dynamics**: The system doesn't yet model how probabilities change over time for the same observation. "Not walking at 12 months" and "not walking at 20 months" use different base entries, but the velocity of concern isn't modeled.

6. **Not a substitute for clinical examination**: Probabilities are computed from reported observations and life record data. Physical examination findings (tone, reflexes, auscultation, etc.) are only available after doctor refinement.

---

## Data Model

### Input Tables (Life Record)

| Table | What It Stores |
|-------|---------------|
| `children` | Demographics, DOB, gender, allergies |
| `birth_history` | Gestational age, delivery mode, birth weight, NICU, Apgar, complications |
| `growth_records` | Height, weight, head circumference, BMI, WHO Z-scores over time |
| `milestones` | Developmental milestones — status (achieved/delayed/regressed), observed date |
| `parent_observations` | Free-text observations with date, domain, concern level |
| `screening_results` | Vision, hearing, developmental screening outcomes |
| `vaccination_records` | Immunization history and overdue vaccines |
| `family_history` | Hereditary conditions with relation |
| `active_conditions` | Current diagnoses |
| `medications` | Current medications with dosage |
| `diet_records` | Feeding mode, food diversity, supplements |

### Output Tables (Projections)

| Table | What It Stores |
|-------|---------------|
| `projection_results` | Per-observation: domains detected, clarifying questions, confidence, timestamp |
| `observation_projections` | Per-condition: base/adjusted probability, modifiers, evidence, urgency, must-not-miss |
| `doctor_refinements` | Audit trail: who refined, action, clinical findings, adjusted probability |

### Knowledge Graph (Code)

| File | What It Contains |
|------|-----------------|
| `knowledge-graph.ts` | `OBSERVATION_CONDITION_MAP` — the master mapping of observations to conditions with age ranges, base rates, modifiers, and clinical metadata |
| `domain-prompts.ts` | `DOMAIN_PROMPTS` — age-period domain questions that guide parent observations |
| `onboarding.ts` | `ONBOARDING_PHASES` — conversational intake questions from birth to present |

---

## File Reference

```
src/lib/ai/life-record/
├── README.md                 ← This document
├── index.ts                  ← Barrel export for the module
├── types.ts                  ← Type definitions (BodySystem, ConditionCategory, etc.)
├── knowledge-graph.ts        ← Condition-observation map (Layer 1)
├── probability-engine.ts     ← Bayesian projection engine (Layer 2)
├── context-builder.ts        ← Assembles LifeRecordContext from D1
├── domain-prompts.ts         ← Age-period domain prompts (the wire → parent)
└── onboarding.ts             ← Conversational life record intake (birth → present)

src/pages/api/
├── observations.ts           ← POST triggers probabilistic projection
├── observation-prompts.ts    ← GET returns personalized domain prompts
├── onboarding.ts             ← Multi-turn conversational onboarding
└── doctor/
    └── refinements.ts        ← Doctor confirm/rule-out/investigate API
```

---

## API Reference

### `GET /api/observation-prompts?childId=xxx`
Returns age-appropriate domain prompts personalized with child's name and life record flags.

### `POST /api/observations`
Saves observation + fires probabilistic projection engine. Returns parent-friendly summary with ranked possibilities.

### `POST /api/onboarding` (action: start | answer | skip)
Multi-turn conversational onboarding. AI walks parent from birth to present, extracting structured data.

### `GET /api/onboarding?childId=xxx`
Returns current onboarding state and next question.

### `POST /api/doctor/refinements`
Doctor confirms, rules out, investigates, or adjusts probability on a projection. Full audit trail.

### `GET /api/doctor/refinements?childId=xxx`
Returns all projections for a child with parsed modifiers and evidence.

---

## For Researchers

This engine is designed to support pediatric health research:

1. **Longitudinal data**: Every observation, projection, and refinement is timestamped and linked to the child's life record. This creates a continuous developmental trajectory dataset.

2. **Probability calibration**: By comparing projected probabilities against doctor-confirmed diagnoses, calibration curves can be computed. Over time, base probabilities and modifier multipliers can be empirically refined.

3. **Observation patterns**: The domain prompts capture what parents notice and when. This data can reveal population-level patterns in developmental surveillance — what gets caught early vs. late.

4. **Modifier validation**: Each modifier's multiplier is derived from literature. Real-world data can validate whether these multipliers hold in the Indian pediatric population.

5. **Must-not-miss effectiveness**: Tracking how often must-not-miss conditions are confirmed vs. ruled out measures the system's safety net performance.

6. **Doctor refinement patterns**: Which projections do doctors confirm? Which do they rule out? This feedback loop identifies where the knowledge graph needs expansion or correction.

7. **Onboarding completeness**: Which life record fields do parents fill vs. skip? This identifies data gaps and informs UX design for maximum clinical utility.

### Research Data Access
All data is stored in Cloudflare D1 (SQLite). The following tables form the research dataset:
- `observation_projections` — every condition projected, with probability and evidence
- `doctor_refinements` — every clinical judgment applied
- `projection_results` — per-observation metadata and confidence
- `parent_observations` — longitudinal observation timeline
- `milestones` — developmental trajectory
- `growth_records` — anthropometric trajectory with WHO Z-scores

### Ethical Considerations
- All data is de-identifiable (UUID-based, no PII in projection tables)
- Parent consent is obtained at registration
- The system explicitly does NOT diagnose — it projects possibilities for clinical review
- Must-not-miss conditions are always surfaced as a safety mechanism
- Doctor refinement ensures human oversight on every projection

---

## Expanding the Knowledge Graph

To add new condition-observation entries to `knowledge-graph.ts`:

```typescript
{
  id: 'unique_id',                          // e.g., 'motor_toe_walking_2_5yr'
  observationPatterns: ['keyword1', ...],    // what parent might type
  domain: 'motor',                          // BodySystem
  ageMinMonths: 24, ageMaxMonths: 60,       // age range
  conditionName: 'Condition Name',
  icd10: 'F82',                             // optional
  conditionCategory: 'developmental',
  baseProbability: 0.15,                    // from epidemiological data
  mustNotMiss: false,
  urgency: 'routine',
  citation: 'Source, Year',
  parentExplanation: 'Plain language...',
  parentNextSteps: ['What to check...'],
  doctorExamPoints: ['What to examine...'],
  ruleOutBefore: ['Condition to exclude first'],
  modifiers: [
    {
      source: 'birth_history',
      key: 'preterm',
      description: 'Born before 37 weeks',
      multiplier: 1.5,
      explanation: 'Why this modifier applies'
    },
  ],
}
```

**Requirements for new entries:**
- `baseProbability` must be sourced from published literature (cite in `citation` field)
- `mustNotMiss` should be `true` only for conditions where delayed diagnosis causes irreversible harm
- `ruleOutBefore` should enforce physiological-first protocol
- `parentExplanation` must be in plain language — no medical jargon
- `modifiers` should have literature-supported multipliers

---

*The SKIDS Life Record: Because every child's health story deserves to be heard completely, understood scientifically, and acted upon wisely.*
