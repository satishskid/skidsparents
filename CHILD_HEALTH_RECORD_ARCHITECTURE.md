# Child Longitudinal Health Record (CLHR) — Architecture

## What It Is

A **complete, growing health profile** for each child — built from multiple sources over time. When a parent visits ANY pediatrician (SKIDS or non-SKIDS), they have a one-tap handover of the child's full health story.

## Data Sources (6 Pillars)

### 1. Milestones (`milestones` table)
- **What**: Developmental milestone tracking across 4 domains (motor, language, cognitive, social)
- **How**: Parent marks milestones as achieved/not_started, with optional notes and observed_at date
- **Content**: Age-based milestone library in `lib/content/milestones.ts` (e.g., "first words" at 12mo, "walks independently" at 12-15mo)
- **API**: `GET/POST /api/milestones?childId=X`
- **Component**: `MilestoneTracker.tsx` — shows age-appropriate milestones, checkmark to record, parent notes, share to WhatsApp
- **Schema**: `id, child_id, category, milestone_key, title, status, observed_at, parent_notes, expected_age_min, expected_age_max`

### 2. Parent Observations (`parent_observations` table)
- **What**: Free-text health notes with concern levels (none/mild/moderate/severe)
- **How**: Parent journals observations ("child not eating well", "fever for 3 days", "first smile")
- **Categories**: Development, Behavior, Physical, Feeding, Sleep, General
- **API**: `GET/POST /api/observations?childId=X`
- **Component**: `ObservationJournal.tsx` — date, category selector, concern level, text input, AI-powered response
- **Schema**: `id, child_id, date, category, observation_text, concern_level, ai_response, created_at`
- **AI**: Each observation gets an AI response (via Workers AI) — reassurance, guidance, or screening nudge

### 3. Growth Records (`growth_records` table)
- **What**: Height, weight, head circumference, BMI, WHO Z-scores over time
- **How**: Parent enters measurements periodically (e.g., monthly, at well-child visits)
- **API**: `GET/POST /api/growth?childId=X`
- **Component**: `GrowthTracker.tsx` — latest stats cards (height/weight/BMI), add measurement form, WHO Z-score interpretation
- **Schema**: `id, child_id, date, height_cm, weight_kg, head_circ_cm, bmi, who_zscore_json, created_at`
- **Z-scores**: Stored as JSON — `{ height_for_age, weight_for_age, bmi_for_age }` with percentile interpretation

### 4. Screening Results (`screening_imports` table)
- **What**: SKIDS school/camp screening results imported from V3 screening platform
- **How**: Auto-imported when parent's child matches a screening record (by campaign code + child link)
- **Data**: Full observation JSON (`data_json`), 4D clinical summary (`four_d_json`), human-readable summary (`summary_text`)
- **API**: `GET /api/screening?childId=X`
- **Component**: `ScreeningTab.tsx` → `ScreeningReport.tsx` — displays campaign name, date, summary, and detailed findings
- **Schema**: `id, child_id, source, campaign_code, imported_at, screening_date, data_json, four_d_json, summary_text`
- **V3 Integration**: data_json contains `{ child, observations[], reviews[] }` from the V3 screening workflow

### 5. Uploaded Records (`health_records` + `uploaded_reports` tables)
- **What**: Photos/scans of ANY medical document — doctor visit notes, lab tests, prescriptions, dental checkups, eye exams
- **How**: Parent takes photo → AI extracts structured data → parent reviews → saved
- **Record Types**: doctor_visit, lab_test, vaccination, prescription, dental, eye_checkup, hearing_test, growth_chart, screening, general
- **API**: `POST /api/records/upload` (multipart form), `GET/POST /api/records?childId=X`
- **Components**:
  - `UploadDialog.tsx` — camera/file capture → processing → AI review → confirm
  - `RecordsTimeline.tsx` — chronological display of all uploaded records
- **AI Extraction** (`lib/ai/extract.ts`): Workers AI vision model reads the image and extracts:
  ```json
  {
    "recordType": "lab_test",
    "title": "Complete Blood Count - Apollo Hospital",
    "providerName": "Apollo Hospital",
    "recordDate": "2026-01-15",
    "findings": [{ "name": "Hemoglobin", "value": "12.5", "unit": "g/dL", "status": "normal" }],
    "vaccinations": [],
    "summary": "All values within normal range",
    "confidence": 0.85
  }
  ```
- **Schema (health_records)**: `id, child_id, record_type, title, provider_name, record_date, summary, data_json, image_url, ai_extracted, confidence, created_at`

### 6. Vaccinations (`vaccination_records` table)
- **What**: Full NIS/IAP vaccination schedule tracking with due dates and completed records
- **How**: System generates age-based schedule, parent marks as done with date/provider
- **Schedule**: Birth → 6wk → 10wk → 14wk → 9mo → 12mo → 15mo → 16-18mo → 4-6yr → 9-12yr
- **API**: `GET/POST /api/vaccinations?childId=X`
- **Component**: `VaccinationTracker.tsx` — summary (done/due/overdue), grouped by age, mark as administered
- **Schema**: `id, child_id, vaccine_name, dose, administered_date, provider, next_due, created_at`
- **Status logic** (`lib/content/vaccinations.ts`): Computes done/due/overdue/upcoming from child's DOB + records

---

## Cross-Cutting Systems

### Habits Tracking (`habits_log` table)
- **What**: Daily logging of HABITS framework activities (H-A-B-I-T-S)
- **Component**: `HabitsTracker.tsx` — daily check-in cards, streak tracking
- **Schema**: `id, child_id, date, habit_type, value_json, streak_days`

### Smart Recommendations (`SmartRecommendations.tsx`)
- **What**: AI-powered contextual suggestions based on child's age and recent activity
- **Logic**: Checks milestones progress, upcoming vaccinations, habit streaks, recent observations
- **Output**: 2-3 actionable cards like "Time for 9-month vision check" or "Log this week's growth"

### Dr. SKIDS Chatbot (`ChatWidget.tsx` + `/api/chat`)
- **What**: AI health companion that knows the child's full context
- **RAG Pipeline** (`lib/ai/context.ts`):
  1. Detect topics from user message (speech, motor, nutrition, sleep, etc.)
  2. Load relevant content from milestones, organs, HABITS, services libraries
  3. Load child-specific context: achieved milestones, recent observations
  4. Build system prompt (`lib/ai/prompt.ts`) with child profile + relevant content
  5. Call Workers AI (Llama 3.1 8B) with conversation history (last 10 messages)
- **Persona**: Warm family pediatrician, Indian context, HABITS framework, screening nudge triggers
- **Conversations**: Persisted in `chatbot_conversations` table with `messages_json`

### Doctor Integration
- **Doctor Portal**: `/doctor/*` pages with `DoctorDashboard`, `PatientPHRView`, `LinkPatientModal`
- **Tables**: `doctors`, `doctor_patients` (links doctors to children)
- **APIs**: `/api/doctor/patients` (link/unlink), `/api/doctor/profile`, `/api/doctor/ai-assist`
- **AI Assist**: Doctor gets AI help for documentation — suggest chips for protocol steps, generate clinical notes
- **Child Access**: `verifyDoctorChildAccess()` ensures doctor can only see linked children's data
- **Protocols**: `protocols` + `protocol_assignments` tables for clinical protocols (e.g., follow-up after screening)

---

## The Pediatrician Handover Flow

### Current State
1. Parent taps **My Child** → sees `ChildDashboard` with 6 tabs (Milestones, Habits, Growth, Screening, Notes, Records)
2. Each tab shows real data from D1 database (Cloudflare)
3. Doctor can be linked via `doctor_patients` table and access `PatientPHRView`
4. Share via WhatsApp (milestones) or screen share at clinic visit

### What's Missing for True Handover
1. **Export/PDF**: No PDF generation yet — parent can't download a summary report
2. **QR Code Share**: No quick-share mechanism (QR → temporary link to child's health summary)
3. **Non-SKIDS Doctor View**: Need a public-facing read-only summary page that doesn't require SKIDS doctor login
4. **Event Timeline**: All 6 data sources not unified in one chronological view — each lives in its own tab
5. **Structured Handover Summary**: AI-generated "At-a-glance" for the pediatrician:
   - Demographics, allergies, blood group
   - Key milestones achieved/pending
   - Growth trajectory (Z-score trend)
   - Vaccination status (done/due/overdue)
   - Recent observations + concern levels
   - Screening results summary (if any)
   - Parent's top concerns

---

## Database: 18 Tables Total

| # | Table | Purpose |
|---|-------|---------|
| 1 | `parents` | Parent accounts (Firebase UID linked) |
| 2 | `children` | Child profiles (name, DOB, gender, blood group, allergies) |
| 3 | `milestones` | Developmental milestone tracking |
| 4 | `habits_log` | Daily HABITS framework logging |
| 5 | `growth_records` | Height/weight/head circ/BMI/Z-scores |
| 6 | `parent_observations` | Free-text health notes + AI responses |
| 7 | `chatbot_conversations` | Dr. SKIDS chat history |
| 8 | `health_records` | Uploaded medical documents (AI-extracted) |
| 9 | `uploaded_reports` | Raw file references for uploads |
| 10 | `vaccination_records` | Immunization records |
| 11 | `screening_imports` | V3 screening results |
| 12 | `products` | SKIDS intervention products |
| 13 | `campaigns` | Marketing/screening campaigns |
| 14 | `doctors` | Doctor accounts |
| 15 | `doctor_patients` | Doctor↔Child link table |
| 16 | `protocols` | Clinical follow-up protocols |
| 17 | `protocol_assignments` | Protocol instances assigned to children |
| 18 | `leads` | CRM lead tracking |

---

## File Map

```
src/components/phr/
├── ChildDashboard.tsx      # Main PHR dashboard (6-tab view)
├── MyChildPage.tsx         # Smart entry: auto-selects child, zero clicks to dashboard
├── MilestoneTracker.tsx    # Milestone tracking with share
├── HabitsTracker.tsx       # Daily HABITS check-in
├── GrowthTracker.tsx       # Height/weight/BMI with Z-scores
├── ObservationJournal.tsx  # Parent health notes + AI feedback
├── RecordsTimeline.tsx     # Chronological uploaded documents
├── VaccinationTracker.tsx  # NIS/IAP schedule tracking
├── SmartRecommendations.tsx # AI-powered suggestions
├── UploadDialog.tsx        # Camera → AI extract → save
└── ShareMilestone.tsx      # WhatsApp milestone sharing

src/components/screening/
├── ScreeningTab.tsx        # Screening results tab in dashboard
└── ScreeningReport.tsx     # Detailed screening result display

src/components/doctor/
├── DoctorDashboard.tsx     # Doctor portal main view
├── PatientPHRView.tsx      # Doctor's view of child's PHR
└── LinkPatientModal.tsx    # Link doctor to child

src/lib/ai/
├── context.ts              # RAG topic detection + content retrieval
├── prompt.ts               # Dr. SKIDS system prompt builder
├── extract.ts              # AI document extraction (Workers AI vision)
└── doctor-prompt.ts        # Doctor AI assist prompt builder

src/lib/content/
├── milestones.ts           # Age-based milestone definitions
├── vaccinations.ts         # NIS/IAP vaccine schedule + status logic
├── organs.ts               # 16 organ modules
└── habits.ts               # 6 HABITS definitions

src/pages/api/
├── milestones.ts           # GET/POST milestones
├── observations.ts         # GET/POST observations
├── growth.ts               # GET/POST growth records
├── screening.ts            # GET screening imports
├── vaccinations.ts         # GET/POST vaccination records
├── records.ts              # GET/POST health records
├── records/upload.ts       # POST multipart upload + AI extraction
├── children.ts             # GET/POST children
├── chat.ts                 # POST chatbot (Workers AI + RAG)
└── doctor/
    ├── patients.ts         # Link/unlink doctor↔child
    ├── profile.ts          # Doctor profile CRUD
    ├── ai-assist.ts        # Doctor AI documentation help
    └── protocols.ts        # Clinical protocol management

src/lib/ai/life-record/           # Probabilistic Life Record Engine (7,000+ lines)
├── knowledge-graph.ts             # Condition→observation Bayesian network
├── probability-engine.ts          # Prior calculation from observations
├── context-builder.ts             # Builds full life record context for AI
├── domain-prompts.ts              # 80+ age-specific conversation prompts
├── conversational-onboarding.ts   # Progressive onboarding flow
├── types.ts                       # LifeRecordContext, projection types
├── index.ts                       # Barrel export
└── projection-prompt.ts           # Doctor refinement prompts

src/lib/ai/daily-insights/         # Daily Experience Layer
├── insight-generator.ts           # Personalized daily insights + growth/intervention insights
├── types.ts                       # InsightGenerationContext types
└── index.ts

src/lib/ai/nudges/                 # Smart Nudges
├── nudge-engine.ts                # 10 nudge sources: milestones, gaps, interventions, growth tracks
└── types.ts                       # Nudge types incl. intervention_reminder, growth_guidance

src/lib/ai/growth-tracks/          # Layer 1: Developmental Nurturing
├── types.ts                       # GrowthTrack, GrowthDomain, coaching playbook interfaces
└── track-engine.ts                # Track matching by age, red flag detection, prompt building

src/lib/ai/interventions/          # Layer 2: Doctor-Prescribed Interventions
├── types.ts                       # InterventionProtocol, task, streak, escalation types
├── task-generator.ts              # Lazy task materialization (next 7 days on demand)
├── coach-prompt.ts                # 8-part protocol-bound system prompt builder
└── escalation-engine.ts           # Rule evaluation, streak updates, de-duplication

src/lib/content/                   # Content Libraries
├── growth-track-factory.ts        # TrackData → GrowthTrack builder (factory pattern)
├── growth-track-library.ts        # Barrel: 77 tracks from 8 domain files
├── growth-data-emotional.ts       # 10 tracks: co-regulation → emotional maturity
├── growth-data-behavioral.ts      # 10 tracks: reflexes → self-regulation
├── growth-data-nutrition.ts       # 10 tracks: first foods → nutrition literacy
├── growth-data-physical.ts        # 10 tracks: tummy time → lifelong fitness
├── growth-data-sleep.ts           # 10 tracks: newborn cycles → teen sleep crisis
├── growth-data-social.ts          # 10 tracks: social smile → identity & relationships
├── growth-data-digital.ts         # 7 tracks: zero screens → digital independence (starts 12-24mo)
├── growth-data-parental.ts        # 10 tracks: postpartum → launching anxiety
└── intervention-protocols.ts      # 15 protocols: 5 conditions × 3 regions (IAP/AAP/Gulf_AP)

src/components/growth/
├── GrowthTrackCard.tsx            # Active developmental guidance for child's age
└── (GrowthCoach.tsx)              # Growth-track-scoped coaching chat (planned)

src/components/interventions/
├── InterventionStrip.tsx          # Today's tasks per assignment
├── InterventionProgress.tsx       # Compliance stats, streaks, progress bars
└── (InterventionCoach.tsx)        # Protocol-scoped coaching chat (planned)

src/components/doctor/
├── InterventionsTab.tsx           # Doctor intervention management tab
└── (InterventionPrescribeModal)   # Protocol browser + prescribe flow (planned)
```

---

## Growth & Intervention Engine

Two-layer system that completes the pediatric life record — Layer 1 grows every child, Layer 2 treats conditions.

### Layer 1: Developmental Growth Tracks (Universal, Continuous)

Every child gets age-appropriate developmental nurturing — automatically activated by age period. **This is growing the child, not treating a condition.** Parent feels AWARE and EQUIPPED, not caught late and guilty.

**8 Domains**: emotional, behavioral, nutrition_habits, physical_activity, sleep_hygiene, social, digital_wellness, parental_coping

**10 Age Periods**: 0-3mo, 3-6mo, 6-12mo, 12-24mo, 2-3yr, 3-5yr, 5-8yr, 8-12yr, 12-15yr, 15-18yr

**77 Total Tracks** — each with:
- 4 coaching topics (3 general + 1 boundary:true → HITL doctor referral)
- Milestones to observe
- Red flags (normal → concerning threshold)
- Parental coping guidance
- Evidence base (Brazelton, AAP Bright Futures, WHO, Piaget, Erikson, Bowlby)

**Factory Pattern**: Compact `TrackData` interface in domain data files → `buildTrack()` inflates to full `GrowthTrack` objects at runtime. Keeps content files manageable (~1,300 lines each vs 2,000+).

**Integration**: Growth tracks feed daily insights, smart nudges, general chat context, and red flag alerts to doctor daily brief.

### Layer 2: Intervention Protocols (Doctor-Prescribed, Condition-Specific)

When a pediatrician diagnoses a condition, they prescribe a structured home intervention. 99% of pediatric treatment happens at HOME. SKIDS coaches + tracks adherence strictly within protocol playbook (never internet).

**15 Seed Protocols** — 5 conditions × 3 regions:
| Condition | IAP (India) | AAP (USA) | Gulf_AP (GCC) |
|-----------|------------|-----------|---------------|
| Amblyopia Patching | ✓ | ✓ | ✓ |
| Iron Deficiency Nutrition | Vegetarian-first, ragi, jaggery | Red meat, fortified cereals | Dates, regional grains |
| Speech Stimulation | Hindi+English bilingual | English phonemes | Arabic+English bilingual |
| Behavioral Routine | Joint family dynamics | Nuclear family, play-based | Cultural hierarchy context |
| Gross Motor Physio | ✓ | ✓ | ✓ |

**Key Features**:
- **Protocol-bound AI coaching**: 8-part system prompt built entirely from playbook (persona → protocol → child → regional → params → compliance → playbook → guardrails)
- **Lazy task generation**: Tasks materialized on-demand (next 7 days)
- **Streak tracking**: Rolling 7-day compliance, current/longest streak
- **Escalation engine**: Evaluates after each task log/chat, de-duplicated within 7 days
- **Boundary detection**: Unmatched questions → HITL flag to doctor
- **Localization**: Same condition, different playbooks by region. Indian child vs Qatari child vs Indian child in Qatar.
- **12 subspecialty assistants**: vision_ai, hearing_ai, dental_ai, neuro_dev_ai, nutrition_ai, skin_ai, respiratory_ai, posture_ai, cardio_ai, behavior_ai, immune_ai, growth_ai

### Database (8 New Tables, 39 Total)

Growth: `growth_tracks`, `growth_track_progress`
Intervention: `intervention_protocols`, `intervention_assignments`, `intervention_tasks`, `intervention_streaks`, `intervention_escalations`, `intervention_chat_sessions`

### API Endpoints (10 New)

**Parent**: `/api/growth-tracks/active`, `/api/growth-tracks/chat`, `/api/interventions/active`, `/api/interventions/tasks`, `/api/interventions/chat`, `/api/interventions/progress`
**Doctor**: `/api/doctor/interventions` (GET library, POST prescribe, PUT adjust), `/api/doctor/interventions/escalations`, `/api/doctor/interventions/compliance`
**Admin**: `/api/admin/seed-interventions`

### The Distinction

A tantruming 3-year-old = **Layer 1** (normal development, parent needs guidance).
A diagnosed ODD 3-year-old = **Layer 2** (structured behavioral intervention prescribed by ped).
Both use the same engine, different entry points.
