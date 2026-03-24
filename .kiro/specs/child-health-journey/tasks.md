# Implementation Plan: Child Health Journey

## Overview

Six targeted changes to existing files. Ordered by impact — the mobile chat fix and milestone seeding are highest priority and fully independent. Each task references the specific file to modify.

## Tasks

- [x] 1. Fix mobile chat widget visibility
  - [x] 1.1 Remove `hidden md:flex` from the floating button in `src/components/chat/ChatWidget.tsx`
    - Change `className="... hidden md:flex"` to `className="... flex"` on the floating `<button>` element
    - Verify the panel already uses responsive positioning (`bottom-4 right-4 md:bottom-24 md:right-6`) — no change needed there
    - _Requirements: 2.1, 2.3, 2.4_
  - [ ]* 1.2 Write example test for chat widget button visibility
    - Render `ChatWidget` and assert the floating button element does not have a `hidden` class
    - Assert the button has a `z-50` class ensuring it renders above other elements
    - **Feature: child-health-journey, Property: Chat widget button is always visible (no hidden class)**
    - _Requirements: 2.1, 2.4_

- [x] 2. Add milestone auto-seeding on child creation
  - [x] 2.1 Add `seedMilestones` function to `src/pages/api/children.ts`
    - Import `getMilestonesForAge` from `@/lib/content/milestones`
    - Write `async function seedMilestones(childId, ageMonths, db)` that iterates `getMilestonesForAge(ageMonths)` and inserts each milestone using the existing upsert pattern from `milestones.ts` (SELECT then INSERT if not exists) — do NOT use `INSERT OR IGNORE` since there is no DB-level unique constraint
    - Wrap the entire function body in `try/catch` — log errors but never throw
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Call `seedMilestones` inside the `POST` handler in `src/pages/api/children.ts`
    - After the child `INSERT` succeeds and before returning the `201` response, call `await seedMilestones(id, ageMonths, env.DB)` where `ageMonths` is computed from `body.dob`
    - Compute `ageMonths` using the same formula as `ChildDashboard.tsx`: `(now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())`
    - _Requirements: 1.1, 1.5_
  - [ ]* 2.3 Write property test for milestone seeding completeness
    - Use **fast-check** to generate random `ageMonths` values (0–192)
    - For each, call `seedMilestones` against an in-memory mock DB, then verify the seeded keys exactly match `getMilestonesForAge(ageMonths).map(m => m.key)`
    - Also verify each row's `title`, `category`, `expected_age_min`, `expected_age_max` match the source `MilestoneDefinition`
    - **Feature: child-health-journey, Property 1: Milestone seeding completeness and field fidelity**
    - _Requirements: 1.1, 1.2_
  - [ ]* 2.4 Write property test for milestone seeding idempotence
    - Use **fast-check** to generate random `ageMonths` values
    - Call `seedMilestones` twice for the same `childId` and verify the row count after the second call equals the row count after the first call
    - **Feature: child-health-journey, Property 2: Milestone seeding idempotence**
    - _Requirements: 1.3_

- [ ] 3. Checkpoint — verify child creation + seeding
  - Ensure all tests pass. Manually verify via `/me` that adding a new child populates the Milestones tab immediately. Ask the user if questions arise.

- [x] 4. Extend chat context with vaccination and growth data
  - [x] 4.1 Extend `ChatContext` interface in `src/lib/ai/prompt.ts`
    - Add optional fields: `vaccinationHistory?: string[]` and `latestGrowth?: { height?: number; weight?: number; date?: string }`
    - In `buildSystemPrompt`, append a `CHILD HEALTH RECORDS` section when either field is present, listing vaccination entries and growth values
    - _Requirements: 5.4_
  - [x] 4.2 Load vaccination and growth data in `src/pages/api/chat.ts`
    - After the existing `achievedMilestones` and `recentObservations` queries, add two new `try/catch` blocks:
      1. Query `vaccination_records` — `SELECT vaccine_name, date_given WHERE child_id = ? ORDER BY date_given DESC LIMIT 5`
      2. Query `growth_records` — `SELECT height_cm, weight_kg, recorded_date WHERE child_id = ? ORDER BY recorded_date DESC LIMIT 1`
    - Pass results into `chatContext` as `vaccinationHistory` and `latestGrowth`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x]* 4.3 Write property test for enriched system prompt
    - Use **fast-check** to generate arbitrary `ChatContext` objects with non-empty `vaccinationHistory` arrays and `latestGrowth` objects
    - Assert `buildSystemPrompt(context)` output string contains each vaccination entry string and the height/weight values
    - **Feature: child-health-journey, Property 7: buildSystemPrompt includes all provided context fields**
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 5. Add "Ask Dr. SKIDS" to Observation Journal
  - [x] 5.1 Add `askDrSkids` helper and button to `src/components/phr/ObservationJournal.tsx`
    - Add helper: `function askDrSkids(text: string) { window.dispatchEvent(new CustomEvent('open-dr-skids', { detail: { question: \`I noticed: "${text}" — what should I do?\` } })) }`
    - In the observation card render, add an "Ask Dr. SKIDS" button below the observation text when `obs.concern_level !== 'none'`; on click, call `askDrSkids(obs.observation_text)`
    - In the empty-state block, add an "Ask Dr. SKIDS" button that calls `askDrSkids("I'd like to share my child's current health status")`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 5.2 Write property test for askDrSkids event payload
    - Use **fast-check** to generate arbitrary observation text strings and childId strings
    - For each, call `askDrSkids(text)` and capture the dispatched `CustomEvent`
    - Assert `event.detail.question` contains the observation text
    - **Feature: child-health-journey, Property 6: Ask Dr. SKIDS event contains observation text**
    - _Requirements: 4.2, 4.3_
  - [ ]* 5.3 Write example test for empty-state Ask Dr. SKIDS button
    - Render `ObservationJournal` with an empty observations array
    - Assert the "Ask Dr. SKIDS" button is present in the rendered output
    - _Requirements: 4.4_

- [x] 6. Add onboarding chat mode
  - [x] 6.1 Add `ONBOARDING_PROMPT` and `mode` support to `src/lib/ai/prompt.ts`
    - Add `mode?: 'standard' | 'onboarding'` to `ChatContext`
    - Add `ONBOARDING_PROMPT` constant with the 4-topic sequential intake script (birth history → past illnesses → allergies → developmental concerns), instructing the AI to ask one question at a time and acknowledge each answer warmly
    - In `buildSystemPrompt`, use `ONBOARDING_PROMPT` as the base persona when `context.mode === 'onboarding'`
    - _Requirements: 3.3_
  - [x] 6.2 Accept and handle `mode` in `src/pages/api/chat.ts`
    - Add `mode?: 'onboarding' | 'standard'` to the request body type
    - Pass `mode` into `chatContext` so `buildSystemPrompt` uses the correct prompt
    - After the AI responds during an onboarding turn, save the user's message as a `parent_observation` with `category: 'Health'`, `concern_level: 'none'`, and today's date — wrap in `try/catch`
    - _Requirements: 3.2, 3.4_
  - [x] 6.3 Add `mode` and `initialMessage` props to `src/components/chat/ChatWidget.tsx`
    - Add `mode?: 'standard' | 'onboarding'` and `initialMessage?: string` to `ChatWidgetProps`
    - When `mode === 'onboarding'`, replace `WELCOME_MESSAGE` with `initialMessage` (or a default onboarding opener: "Hi! I'm Dr. SKIDS. Let's build [child name]'s health record together. I'll ask you a few quick questions — it only takes 2 minutes.")
    - Include `mode` in the body of every `fetch('/api/chat', ...)` call when it is set
    - _Requirements: 3.2, 3.3_
  - [x] 6.4 Trigger onboarding chat from `src/components/auth/ChildRegistration.tsx`
    - Change `onComplete` prop signature to `onComplete: (childId: string) => void`
    - Pass the `id` from the `POST /api/children` response to `onComplete(id)`
    - Update the call site in `src/pages/me.astro` (or wherever `ChildRegistration` is rendered) to receive `childId`, check if the child has existing observations via `GET /api/observations?childId=`, and if none exist, open `ChatWidget` with `mode='onboarding'` and `childId` set
    - _Requirements: 3.1, 3.5, 3.6_
  - [x]* 6.5 Write property test for onboarding system prompt
    - Use **fast-check** to generate arbitrary `ChatContext` objects with `mode: 'onboarding'`
    - Assert `buildSystemPrompt(context)` output contains the intake topic keywords ("birth", "allerg", "illness", "development") and does NOT contain the standard `BASE_PERSONA` opener text
    - **Feature: child-health-journey, Property 3: Onboarding mode uses intake system prompt**
    - _Requirements: 3.3_
  - [ ]* 6.6 Write property test for skip-onboarding when observations exist
    - Use **fast-check** to generate child IDs with a non-empty observations array
    - Assert the component logic that decides whether to open onboarding mode returns `false` when observations exist
    - **Feature: child-health-journey, Property 5: Skip onboarding when observations exist**
    - _Requirements: 3.6_

- [x] 7. Fix Child Dashboard mobile tab bar and add Dr. SKIDS FAB
  - [x] 7.1 Add `short` labels to TABS and use them on mobile in `src/components/phr/ChildDashboard.tsx`
    - Add a `short` field to each entry in the `TABS` constant (e.g. `'Miles'`, `'Habits'`, `'Growth'`, `'Notes'`, `'Rec.'`)
    - In the tab button render, show `tab.short` on small screens and `tab.label` on `sm:` and above using `<span className="sm:hidden">{tab.short}</span><span className="hidden sm:inline">{tab.label}</span>`
    - _Requirements: 6.1, 6.2_
  - [x] 7.2 Add Dr. SKIDS FAB to `src/components/phr/ChildDashboard.tsx`
    - Add a fixed `<button>` inside the dashboard container with `className="fixed bottom-20 right-4 z-40 md:hidden ..."` (above mobile bottom nav, hidden on desktop where the floating ChatWidget is already visible)
    - On click, dispatch `window.dispatchEvent(new CustomEvent('open-dr-skids', { detail: { childId } }))`
    - Style as a pill button: green background, "Ask Dr. SKIDS" label with the S avatar icon
    - _Requirements: 6.3, 6.4_
  - [ ]* 7.3 Write example test for tab short label length
    - Import `TABS` from `ChildDashboard` and assert every `short` value has `length <= 6`
    - **Feature: child-health-journey, Property 8: Tab short labels are ≤6 characters**
    - _Requirements: 6.2_

- [x] 8. Final checkpoint — all tests pass
  - Ensure all tests pass. Verify the full journey: register child → milestone wall populated → onboarding chat opens → observation journal shows Ask Dr. SKIDS → chat widget visible on mobile. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Task 1 (mobile chat fix) is a one-line CSS change — do it first
- Task 2 (milestone seeding) is fully server-side with no UI changes
- Tasks 1 and 2 are independent and can be done in parallel
- The `open-dr-skids` CustomEvent is already handled by `ChatWidget` — no new event infrastructure needed
- fast-check install: `npm i -D fast-check`
