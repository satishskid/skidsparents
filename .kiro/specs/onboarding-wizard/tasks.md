# Implementation Plan: Onboarding Wizard

## Overview

Implement the 3-step onboarding wizard as a full-screen overlay mounted inside the dashboard layout. The wizard guides new parents through adding a child profile (Step 1), logging a developmental milestone (Step 2), and logging a H.A.B.I.T.S. entry (Step 3), ending with a celebration screen. Built with React + Tailwind CSS on Astro/Cloudflare Pages.

## Tasks

- [x] 1. DB migration — add `onboarding_completed` to `parents` table
  - Create `migrations/0004_onboarding_wizard.sql` with `ALTER TABLE parents ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0;`
  - Add `onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false)` to the `parents` table definition in `src/lib/db/schema.ts`
  - _Requirements: 7.1_

- [x] 2. API routes — `GET /api/parents/me` and `PATCH /api/parents/me`
  - [x] 2.1 Create `src/pages/api/parents/me.ts` with `GET` handler
    - Use `getParentId` auth pattern from `@/pages/api/children`
    - Query `SELECT id, name, email, onboarding_completed FROM parents WHERE id = ?`
    - Return `{ id, name, email, onboarding_completed: Boolean(...) }` with 200, or 401/404
    - Add `export const prerender = false`
    - _Requirements: 7.2, 7.3_
  - [x] 2.2 Add `PATCH` handler to the same file
    - Accept `{ onboarding_completed: true }` in request body
    - Run `UPDATE parents SET onboarding_completed = 1 WHERE id = ?`
    - Return `{ updated: true }` with 200
    - _Requirements: 6.3, 7.2_
  - [ ]* 2.3 Write unit tests for `GET /api/parents/me` and `PATCH /api/parents/me`
    - Test 401 when no valid token
    - Test 404 when parent not found
    - Test GET returns correct `onboarding_completed` boolean shape
    - Test PATCH sets flag and returns `{ updated: true }`
    - _Requirements: 7.2_

- [x] 3. `OnboardingGate.tsx` — trigger logic, localStorage fast path, parallel API fetches
  - Create `src/components/auth/OnboardingGate.tsx`
  - On mount: synchronously check `localStorage.getItem('skids_onboarding_complete') === 'true'` — if true, suppress immediately (no API calls)
  - Fetch `GET /api/parents/me` and `GET /api/children` in parallel using `Promise.all`
  - Evaluate trigger: show wizard if `onboarding_completed === false` AND (`isNew === true` OR `children.length === 0`)
  - Suppress wizard on any API error (render children normally)
  - Show loading skeleton (3 pulse divs) for max 2 s via `setTimeout` fallback that suppresses wizard if APIs haven't resolved
  - Render `<OnboardingWizard>` overlay when trigger conditions met; render `children` prop always (behind overlay on desktop, hidden on mobile)
  - Apply `document.body.style.overflow = 'hidden'` while wizard is open; restore on unmount via `useEffect` cleanup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.3, 7.4, 7.6_
  - [x]* 3.1 Write property test for trigger logic (Property 1)
    - Property 1: `onboarding_completed = true` always suppresses regardless of `isNew` or `childCount`
    - Use `fc.record({ onboardingCompleted: fc.constant(true), isNew: fc.boolean(), childCount: fc.nat() })`
    - _Validates: Requirements 1.3, 7.4, 7.6_
  - [x]* 3.2 Write property test for trigger conditions (Property 2)
    - Property 2: `onboarding_completed = false` + `childCount = 0` always shows wizard; `childCount > 0` only shows if `isNew = true`
    - Use `fc.record({ onboardingCompleted: fc.constant(false), isNew: fc.boolean(), childCount: fc.nat(10) })`
    - _Validates: Requirements 1.1, 1.2_

- [x] 4. `OnboardingWizard.tsx` — shell, step indicator, step transitions, close button
  - Create `src/components/onboarding/OnboardingWizard.tsx`
  - Implement `WizardState` interface: `step` (0–3), `childId`, `childName`, `childAgeMonths`, `selectedMilestoneId`, `selectedMilestoneStatus`, `selectedHabitKey`, `milestoneLogged`, `habitLogged`, `step1Complete`
  - Mobile layout: `fixed inset-0 z-[9999] bg-white flex flex-col`
  - Desktop layout (≥ 768px): `fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center` with inner `bg-white rounded-3xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto`
  - Add `role="dialog"` and `aria-modal="true"` on root container
  - Implement `StepIndicator` inline or as sub-component: 3 dots, active = `w-3 h-3 bg-green-500`, inactive = `w-2 h-2 bg-gray-200`, with `aria-label="Step {current} of 3"` and `role="progressbar"`
  - Implement CSS step transitions: outgoing step `translate-x-[-100%] opacity-0`, incoming `translate-x-0 opacity-100`, `transition-all duration-300 ease-in-out`
  - Implement close (×) button: visible only when `step1Complete === true`; `aria-label="Close wizard"`; on click, call `PATCH /api/parents/me` then redirect `/dashboard`
  - Trap keyboard focus within overlay while open (Tab/Shift+Tab cycle within wizard)
  - Move focus to first interactive element of step 1 on open; announce new step heading via `aria-live` region on step advance
  - Fire `onboarding_wizard_started` analytics event on first render
  - _Requirements: 2.1, 2.2, 2.7, 2.8, 2.9, 2.10, 2.11, 8.1, 8.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 9.10_
  - [ ]* 4.1 Write property test for StepIndicator (Property 3)
    - Property 3: for any step in {1, 2, 3}, exactly one active dot at the correct position
    - Use `fc.integer({ min: 1, max: 3 })`
    - _Validates: Requirements 2.2_

- [x] 5. `Step1ChildForm.tsx` — name/DOB/gender form, validation, `POST /api/children`
  - Create `src/components/onboarding/Step1ChildForm.tsx`
  - Name input: `minLength=1`, `maxLength=50`, placeholder `"e.g. Arjun, Priya"`, `aria-describedby` wired to error span
  - DOB input: `type="date"` (native on mobile per Req 8.4), `min` = today − 16 years, `max` = today; custom calendar widget on desktop via CSS/JS detection
  - Gender selector: Boy / Girl / Other with emoji icons, each `aria-label` set
  - "Continue" CTA: enabled only when `name.trim().length > 0 && dob !== ''`; disabled + loading spinner while request in flight
  - On submit: validate inline first (show "Please enter your child's name" / "Please enter your child's date of birth" without API call), then `POST /api/children` with `{ name, dob, gender }`
  - On success: call `onSuccess(childId, name, ageMonths)` — compute `ageMonths` from dob to today
  - On failure: show inline error, stay on step 1
  - All touch targets ≥ 44×44px; input font-size ≥ 16px (prevents iOS auto-zoom)
  - Fire `onboarding_step_completed` analytics event with `{ step: 1, childId }` on success
  - _Requirements: 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 8.3, 8.4, 8.6, 9.4, 9.6, 10.2_
  - [ ]* 5.1 Write property test for CTA enabled state (Property 4)
    - Property 4: CTA enabled iff `name.trim().length > 0 && dob !== ''`
    - Use `fc.record({ name: fc.string(), dob: fc.string() })`
    - _Validates: Requirements 2.3, 3.1, 3.6, 3.7_
  - [ ]* 5.2 Write property test for name validation (Property 5)
    - Property 5: empty/whitespace/length > 50 names are rejected with inline error, no API call
    - Use `fc.oneof(fc.constant(''), fc.stringOf(fc.constant(' ')), fc.string({ minLength: 51 }))`
    - _Validates: Requirements 3.1, 3.6_
  - [ ]* 5.3 Write property test for DOB validation (Property 6)
    - Property 6: dates outside [today − 16 years, today] are rejected with inline error, no API call
    - Use `fc.date()` filtered to outside valid range
    - _Validates: Requirements 3.2, 3.7_
  - [ ]* 5.4 Write property test for step 1 submission round-trip (Property 7)
    - Property 7: valid form data results in `POST /api/children` with exact field values; returned `childId` stored in state
    - Use `fc.record({ name: fc.string({ minLength: 1, maxLength: 50 }), dob: fc.date({ min: ..., max: ... }) })`
    - _Validates: Requirements 3.4, 3.5_

- [x] 6. `Step2Milestones.tsx` — age-appropriate milestone cards, status selection, non-blocking API
  - Create `src/components/onboarding/Step2Milestones.tsx`
  - On mount: fetch `GET /api/milestones?childId={id}`, then filter using `getMilestonesForAge(ageMonths)` from `src/lib/content/milestones.ts` to get 3–6 cards prioritising `expectedAgeMin <= ageMonths <= expectedAgeMax`
  - Render contextual message: `"Here are some milestones for {childName} at {ageMonths} months."`
  - Each milestone card: `title`, `category` label, category emoji from `MILESTONE_CATEGORIES`; default card style, selected style `bg-green-50 border-green-500`
  - On card tap: show "Achieved ✓" and "In Progress →" inline options
  - On status select: call `POST /api/milestones` (upsert) with `{ childId, milestoneKey, title, category, status, observedAt? }`; on failure show non-blocking toast, still advance to step 3
  - "Skip" button: advances to step 3 without any API call; fire `onboarding_step_skipped` with `{ step: 2 }`
  - "Continue" / "Done" CTA: enabled when a milestone + status is selected
  - Responsive grid: 2-column on ≥ 400px, 1-column on < 400px
  - Fire `onboarding_step_completed` analytics event with `{ step: 2 }` on advance (non-skip)
  - _Requirements: 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 8.7, 10.3_
  - [ ]* 6.1 Write property test for age-appropriate milestone filtering (Property 8)
    - Property 8: for any age in months 0–192, milestone count is in [3, 6] and all within age range
    - Use `fc.integer({ min: 0, max: 192 })`
    - _Validates: Requirements 4.1, 4.2_
  - [ ]* 6.2 Write property test for milestone status update round-trip (Property 9)
    - Property 9: any status selection results in `POST /api/milestones` with correct `milestoneKey`, `childId`, `status`, and `observedAt` (for "achieved")
    - Use `fc.record({ milestoneKey: fc.string(), status: fc.oneof(fc.constant('achieved'), fc.constant('in_progress')) })`
    - _Validates: Requirements 4.4, 4.5_
  - [ ]* 6.3 Write property test for milestone card rendering (Property 10)
    - Property 10: every rendered card contains `title`, `category` label, and category emoji
    - Use `fc.constantFrom(...MILESTONES)`
    - _Validates: Requirements 4.6_
  - [ ]* 6.4 Write property test for contextual message containing child name (Property 11 — Step 2)
    - Property 11: contextual message above milestone list always contains the child's name as a substring
    - Use `fc.string({ minLength: 1 })` as child name
    - _Validates: Requirements 4.9_
  - [ ]* 6.5 Write property test for skip — no API call (Property 14 — Step 2)
    - Property 14: tapping Skip on step 2 advances without calling `POST /api/milestones`
    - _Validates: Requirements 2.6, 4.7_

- [x] 7. `Step3Habits.tsx` — 6 HABITS cards, selection, `POST /api/habits`, non-blocking
  - Create `src/components/onboarding/Step3Habits.tsx`
  - Render all 6 HABITS cards from `src/lib/content/habits.ts`: each card shows `emoji`, `name`, `tagline`
  - Contextual message: `"Pick one healthy habit to log for {childName} today."`
  - On card tap: highlight with habit's brand colour (`bg-green-50 border-green-500` as default), show "Log for Today" CTA button; display habit's `tip` text below the grid
  - On "Log for Today": call `POST /api/habits` with `{ childId, habitType: selectedKey, date: todayISO, valueJson: {} }`; on success advance to celebration; on failure show non-blocking toast, still advance
  - Handle `{ removed: true }` response as no-op success (habit already logged today)
  - "Skip" button: advances to celebration without API call; fire `onboarding_step_skipped` with `{ step: 3 }`
  - Responsive grid: 2-column on ≥ 400px, 1-column on < 400px; all touch targets ≥ 44×44px
  - _Requirements: 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 8.3, 8.7, 10.3_
  - [ ]* 7.1 Write property test for all 6 HABITS cards rendering (Property 12)
    - Property 12: Step 3 always renders all 6 HABITS keys, each card has `emoji`, `name`, `tagline`
    - _Validates: Requirements 5.1_
  - [ ]* 7.2 Write property test for habit log round-trip (Property 13)
    - Property 13: any selected habit key results in `POST /api/habits` with correct `childId`, `habitType`, today's ISO date, and `valueJson: {}`
    - Use `fc.constantFrom(...HABITS.map(h => h.key))`
    - _Validates: Requirements 5.3_
  - [ ]* 7.3 Write property test for contextual message containing child name (Property 11 — Step 3)
    - Property 11: contextual message above habit grid always contains the child's name as a substring
    - Use `fc.string({ minLength: 1 })` as child name
    - _Validates: Requirements 5.7_
  - [ ]* 7.4 Write property test for skip — no API call (Property 14 — Step 3)
    - Property 14: tapping Skip on step 3 advances without calling `POST /api/habits`
    - _Validates: Requirements 2.6, 5.5_

- [x] 8. `CelebrationScreen.tsx` — animated checkmark, confetti, summary, auto-redirect, `PATCH /api/parents/me`
  - Create `src/components/onboarding/CelebrationScreen.tsx`
  - Animated checkmark: large green circle (`w-20 h-20`) with SVG checkmark using `stroke-dashoffset` animation (600ms)
  - CSS confetti: 12 `<span>` elements with `@keyframes confetti-fall` (random x, rotation, delay)
  - Respect `prefers-reduced-motion`: skip confetti and use static checkmark when set
  - Heading: `"You're all set for {childName}! 🎉"` — `text-2xl font-bold text-gray-900`
  - Summary block (`bg-green-50 rounded-2xl p-4`): always show child name; show milestone title only if `milestoneLogged = true`; show habit name only if `habitLogged = true`
  - On render: call `PATCH /api/parents/me { onboarding_completed: true }` and `localStorage.setItem('skids_onboarding_complete', 'true')`
  - On PATCH failure: still redirect; retry PATCH once after 3 s in background
  - Auto-redirect to `/dashboard` after 2500ms via `setTimeout`
  - Hide `StepIndicator` and all navigation buttons
  - Fire `onboarding_wizard_completed` analytics event with `{ childId, milestoneLogged, habitLogged }`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.5, 9.8, 10.4_
  - [ ]* 8.1 Write property test for celebration screen summary (Property 15)
    - Property 15: for any `(childName, milestoneLogged, habitLogged)`, heading contains child name; summary includes milestone iff `milestoneLogged = true`; includes habit iff `habitLogged = true`
    - Use `fc.record({ childName: fc.string({ minLength: 1 }), milestoneLogged: fc.boolean(), habitLogged: fc.boolean() })`
    - _Validates: Requirements 6.2, 6.6_
  - [ ]* 8.2 Write property test for completion flag persistence round-trip (Property 16)
    - Property 16: after celebration, `PATCH /api/parents/me` sets `onboarding_completed = 1` in DB; subsequent `GET /api/parents/me` returns `onboarding_completed: true`; `localStorage` has `"true"`
    - _Validates: Requirements 6.3, 7.2, 7.5_

- [x] 9. Integration — mount `OnboardingGate` in dashboard layout
  - Locate the dashboard Astro page/layout (e.g. `src/pages/dashboard.astro` or `src/layouts/`)
  - Import `OnboardingGate` with `client:load`
  - Pass Firebase ID token from server-side session as `token` prop
  - Wrap existing dashboard content (e.g. `<ChildDashboard>`) as children of `<OnboardingGate>`
  - Verify wizard overlay sits above navbar, notification bell, and all dashboard content (`z-[9999]`)
  - _Requirements: 1.4, 2.1, 2.11_

- [x] 10. Analytics events wiring
  - In `OnboardingGate`: fire `onboarding_wizard_started` with `{ parentId, trigger: 'new_user' | 'no_children' }` when wizard is shown, using the existing `contentEngagement` analytics pattern (GA4 via `src/lib/analytics/ga4.ts`)
  - Confirm `onboarding_step_completed` (step 1), `onboarding_step_skipped` (steps 2/3), and `onboarding_wizard_completed` events are wired in their respective components (Steps 5, 6, 7, 8 above)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [ ]* 10.1 Write property test for analytics event shapes (Property 17)
    - Property 17: all four analytics events fire with correct property shapes at each wizard stage
    - Use `fc.record({ parentId: fc.uuid(), trigger: fc.oneof(fc.constant('new_user'), fc.constant('no_children')) })`
    - _Validates: Requirements 10.1, 10.2, 10.3, 10.4_

- [x] 11. Checkpoint — ensure all tests pass
  - Run `vitest --run` and confirm all unit and property tests pass
  - Verify no TypeScript errors via `tsc --noEmit`
  - Manually confirm wizard renders on a fresh parent account and suppresses on a returning parent
  - Ask the user if any questions arise before closing out.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with `{ numRuns: 100 }` minimum; each test must include the comment tag `// Feature: onboarding-wizard, Property {N}: {property_text}`
- Steps 2 and 3 are non-blocking — API failures show a toast but never prevent the parent from advancing
- Only Step 1 (`POST /api/children`) is a hard gate; all other API failures are graceful
