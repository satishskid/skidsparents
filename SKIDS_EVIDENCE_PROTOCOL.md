# SKIDS Evidence Protocol — Clinical Content Audit Framework

## Why This Exists

Every piece of guidance SKIDS gives to a parent traces back to published science. Not "AI thinks this is right" — but "AAP Bright Futures 4th Edition, Chapter 7, Page 142 says this." This document defines how we cite, grade, and audit our clinical content.

## The Three Layers of SKIDS Clinical Content

### Layer 0: Life Record Knowledge Graph (probability-engine.ts)
- Condition-observation mappings
- Base probabilities by age
- Must-not-miss flags
- **Evidence needed**: Epidemiological data, prevalence studies, sensitivity/specificity of clinical signs

### Layer 1: Growth Tracks (77 tracks, 8 domains)
- Developmental guidance for every child
- Coaching topics, milestones, red flags
- **Evidence needed**: Developmental science, clinical guidelines, longitudinal studies

### Layer 2: Intervention Protocols (15 protocols, 3 regions)
- Doctor-prescribed condition management
- Task sequences, playbooks, escalation rules
- **Evidence needed**: RCTs, clinical practice guidelines, Cochrane reviews, regional authority guidelines

---

## Evidence Grading System (Modified Oxford CEBM)

Every citation in SKIDS gets graded:

| Grade | Definition | Example |
|-------|-----------|---------|
| **1a** | Systematic review of RCTs | Cochrane Review of patching for amblyopia |
| **1b** | Individual RCT | PEDIG "Randomized Trial of Patching Regimens" (Arch Ophthalmol 2003) |
| **2a** | Systematic review of cohort studies | WHO Motor Development Study meta-analysis |
| **2b** | Individual cohort study | Mindell et al., behavioral sleep interventions, Sleep 2006 |
| **3** | Case-control study | Hauck et al., SIDS risk factors, Pediatrics 2011 |
| **4** | Expert opinion / Clinical guideline | AAP Safe Sleep Policy Statement 2022 |
| **5** | Developmental theory / Textbook | Brazelton (1962), Erikson's psychosocial stages |

### How grades map to content:

- **Intervention protocols** (Layer 2): MUST have at least one Grade 1a or 1b reference. These are prescribed treatments.
- **Growth track red flags**: MUST have Grade 1-3 reference. These trigger doctor referral.
- **Growth track coaching topics**: Grade 2-5 acceptable. These are developmental guidance.
- **Milestones**: Grade 2a+ preferred (WHO/CDC normative data).

---

## Structured Citation Format

### Current (single string, inadequate):
```
evidence: 'Ainsworth et al. (1978) Patterns of Attachment; Schore (2001) effects of early relational trauma, IMHJ'
```

### Target (structured, audit-ready):
```typescript
interface Citation {
  id: string                    // e.g., 'ainsworth-1978-attachment'
  authors: string               // 'Ainsworth MDS, Blehar MC, Waters E, Wall S'
  year: number                  // 1978
  title: string                 // 'Patterns of Attachment: A Psychological Study of the Strange Situation'
  source: string                // 'Lawrence Erlbaum Associates'
  type: 'rct' | 'systematic_review' | 'cohort' | 'case_control' | 'guideline' | 'textbook' | 'meta_analysis' | 'consensus'
  grade: '1a' | '1b' | '2a' | '2b' | '3' | '4' | '5'
  doi?: string                  // '10.1037/t28248-000'
  pmid?: string                 // PubMed ID
  isbn?: string                 // For books
  volume?: string               // Journal volume
  issue?: string                // Journal issue
  pages?: string                // '352-356'
  url?: string                  // Full-text URL if open access
  guidelineBody?: string        // 'AAP' | 'IAP' | 'WHO' | 'NICE' etc.
  guidelineVersion?: string     // '4th Edition' | '2022 Update'
  region?: string               // 'global' | 'india' | 'usa' | 'gcc'
}

interface EvidenceMapping {
  claim: string                 // 'Patching 2 hours/day is equivalent to 6 hours for moderate amblyopia'
  citationIds: string[]         // ['pedig-2003-patching-regimens']
  claimType: 'recommendation' | 'threshold' | 'milestone_age' | 'red_flag' | 'prevalence' | 'mechanism'
}
```

---

## Master Reference Library Structure

```
src/lib/evidence/
├── citations.ts               # Master citation database (all references)
├── evidence-map.ts            # Claim → citation mappings
├── grading.ts                 # Evidence grade utilities
├── audit-report.ts            # Generate audit reports per domain/protocol
├── index.ts                   # Barrel exports
│
├── sources/                   # Organized by authority
│   ├── aap.ts                 # American Academy of Pediatrics guidelines
│   ├── iap.ts                 # Indian Academy of Pediatrics guidelines
│   ├── who.ts                 # WHO guidelines and studies
│   ├── nice.ts                # UK NICE guidelines
│   ├── cochrane.ts            # Cochrane systematic reviews
│   ├── gulf-ap.ts             # Gulf Academy of Pediatrics
│   └── developmental.ts       # Foundational developmental science (Piaget, Erikson, Bowlby, etc.)
│
└── domains/                   # Evidence maps per growth domain
    ├── emotional.ts           # Citations for emotional development tracks
    ├── behavioral.ts          # Citations for behavioral tracks
    ├── nutrition.ts           # Citations for nutrition tracks
    ├── physical.ts            # Citations for physical activity tracks
    ├── sleep.ts               # Citations for sleep hygiene tracks
    ├── social.ts              # Citations for social development tracks
    ├── digital.ts             # Citations for digital wellness tracks
    ├── parental.ts            # Citations for parental coping tracks
    └── interventions.ts       # Citations for intervention protocols
```

---

## Canonical Source Textbooks (The SKIDS Bookshelf)

These are the foundational texts that underpin SKIDS. Every pediatrician recognizes these.

### Core Pediatric References
1. **Nelson Textbook of Pediatrics** (22nd Ed., 2024) — Kliegman et al. — ISBN: 978-0323883054
   - The gold standard. If it's in Nelson's, it's defensible.
2. **AAP Bright Futures: Guidelines for Health Supervision** (4th Ed., 2017) — Hagan, Shaw, Duncan
   - Preventive care, developmental surveillance, anticipatory guidance by age
3. **Palpalaya (IAP Textbook of Pediatrics)** (8th Ed., 2019) — IAP
   - Indian standard. Regional nutrition, tropical diseases, vaccination schedules
4. **WHO Child Growth Standards** (2006) — WHO Multicentre Growth Reference Study
   - Z-scores, motor development milestones, growth velocity

### Developmental Science
5. **Developmental-Behavioral Pediatrics** (5th Ed., 2022) — Palpalaya, Palpalaya & Palpalaya
   - Carey WB, Crocker AC, Coleman WL, Elias ER, Feldman HM
6. **Handbook of Infant Mental Health** (4th Ed., 2019) — Zeanah CH
   - Attachment, early intervention, parent-infant relationship
7. **Touchpoints** (2006) — Brazelton TB, Sparrow JD
   - Developmental touchpoints framework, anticipatory guidance
8. **The Whole-Brain Child** — Siegel DJ, Bryson TP — Neuroscience-based parenting

### Nutrition
9. **Child of Mine: Feeding with Love and Good Sense** (2000) — Satter E
   - Division of Responsibility in feeding — parent decides what/when/where, child decides whether/how much
10. **IAP National Iron+ Initiative Guidelines** (2019 update)
11. **WHO Complementary Feeding Guidelines** (2023 update)

### Sleep
12. **AAP Safe Sleep Policy Statement** (2022)
13. **Principles and Practice of Pediatric Sleep Medicine** (3rd Ed., 2021) — Sheldon, Ferber, Kryger

### Behavioral/Mental Health
14. **DC:0-5: Diagnostic Classification of Mental Health and Developmental Disorders of Infancy and Early Childhood** — Zero to Three (2016)
15. **NICE CG28/PH11** — Depression/Anxiety in children; Antenatal/Postnatal Mental Health

### Digital Wellness
16. **AAP Council on Communications and Media Policy** (2016, updated 2023)
17. **WHO Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children Under 5** (2019)

### Key RCTs and Landmark Studies
18. **PEDIG Amblyopia Treatment Studies** (2003-2023) — Multiple papers, Arch Ophthalmol / JAMA Ophthalmol
19. **LEAP Trial** — Du Toit et al. (2015) NEJM 372:803-813 — Peanut allergy prevention
20. **EAT Study** — Perkin et al. (2016) NEJM 374:1733-43 — Early allergen introduction
21. **Ainsworth Strange Situation** (1978) — Attachment classification
22. **WHO Multicentre Growth Reference Study** (2006) — Motor development windows

---

## Audit Process

### Per-Track Audit Checklist:
- [ ] Every coaching topic has at least one citation
- [ ] Every red flag threshold has a citation (Grade 1-3)
- [ ] Every milestone age range has a citation (WHO/CDC normative data)
- [ ] Evidence grade assigned to each citation
- [ ] Claim-to-citation mapping is specific (not "these 5 sources generally support this track")
- [ ] Regional variants cite regional authority (IAP for India, AAP for USA, Gulf_AP for GCC)
- [ ] No coaching guidance relies solely on Grade 5 (textbook/theory) without supporting empirical evidence

### Per-Protocol Audit Checklist (Interventions):
- [ ] Protocol has at least one Grade 1a or 1b reference
- [ ] Task parameters (duration, frequency) cite the source RCT or guideline
- [ ] Escalation thresholds cite clinical evidence (e.g., "3 missed days" — where does this come from?)
- [ ] Regional playbook differences cite regional authority
- [ ] Boundary topics (what AI must NOT answer) are documented with rationale

### Audit Output Format:
```
SKIDS Evidence Audit Report
Generated: 2026-04-02
Domain: Emotional Development
Track: 0-3mo Emotional Foundation

Claims: 12
Citations: 8
  Grade 1a/1b: 1
  Grade 2a/2b: 3
  Grade 3: 1
  Grade 4: 2
  Grade 5: 1

Uncited claims: 2
  - "Skin-to-skin contact for 60 minutes post-birth" — NEEDS CITATION
  - "Co-regulation reduces cortisol by 40%" — NEEDS CITATION

Weakest evidence: Red flag "No social smile by 8 weeks"
  Current: Grade 5 (Brazelton textbook)
  Needed: Grade 2+ (longitudinal study with sensitivity/specificity)
```

---

## Implementation Plan

### Phase 1: Citation Verification (manual + AI-assisted)
For each of the ~300 citations currently in the codebase:
1. Verify the reference exists (PubMed search, Google Scholar)
2. Add DOI/PMID where available
3. Add volume/issue/pages
4. Assign evidence grade
5. Flag any citation that cannot be verified

### Phase 2: Evidence Mapping
For each track's coaching topics, milestones, red flags:
1. Map specific claims to specific citations
2. Identify uncited claims
3. Fill gaps with proper references

### Phase 3: Structured Migration
1. Build `src/lib/evidence/citations.ts` with the full structured citation database
2. Migrate from single `evidence: string` to `citationIds: string[]` per topic/milestone/red flag
3. Build audit report generator

### Phase 4: Expert Review
1. Have 2-3 practicing pediatricians review the evidence mappings
2. Flag any guidance they disagree with
3. Add "reviewer approved" status per track

---

## The Standard We're Aiming For

When a pediatrician asks: **"Why does SKIDS tell parents to patch for 2 hours instead of 6?"**

We answer: **"PEDIG RCT (Arch Ophthalmol 2003;121:603-611, PMID: 12742836) — 'A Randomized Trial of Patching Regimens for Treatment of Moderate Amblyopia in Children' — demonstrated that 2 hours/day was statistically non-inferior to 6 hours/day for moderate amblyopia (visual acuity improvement of 1.8 vs 2.2 lines, p=0.24). This is cited as Grade 1b evidence in our intervention protocol IAP_AMBLYOPIA_PATCHING, task parameter patching_duration."**

That's audit-ready. That's what we're building toward.
