# Implementation Plan: Smart Notifications

## Overview

Replace the hardcoded `MOCK_NOTIFICATIONS` in `NotificationBell.tsx` with a live, rule-based notification engine. The engine evaluates 8 trigger rules against real child health data, writes to the existing `notifications` D1 table, and surfaces results through the existing bell UI. No new DB tables required.

## Tasks

- [ ] 1. Create NotificationService core (`src/lib/notifications/service.ts`)
  - Define `NotificationInput` interface and re-export `NotificationType` from schema
  - Implement `isDuplicate(db, parentId, childId, type, dedupeKey, cooldownDays)` — queries `notifications` table for matching `(parentId, type, dataJson.dedupeKey)` within cooldown window
  - Implement `createNotification(db, input)` — inserts a record into `notifications` with a generated UUID, `read = false`, and `createdAt = datetime('now')`
  - Implement `buildDedupeKey(triggerType, ...parts)` — returns a stable colon-separated string (e.g. `milestone:first_words`, `habit_streak:active_movement:7`)
  - Implement `getAgeStage(ageMonths)` — returns `infant | toddler | preschooler | school-age | adolescent`
  - Define `HABIT_LABELS` map
  - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 1.1 Write unit tests for pure logic functions
    - Test `getAgeStage` at all boundary ages: 0, 11, 12, 35, 36, 71, 72, 143, 144 months
    - Test `buildDedupeKey` produces stable, correctly formatted strings for each trigger type
    - Test `isDuplicate` returns correct true/false given mock DB responses for various cooldown scenarios
    - _Requirements: 12.1, 12.2_

- [ ] 2. Implement the 8 trigger functions (internal to `service.ts`)
  - [ ] 2.1 `checkMilestoneWindows(db, parentId, child)` — query `milestones` for `not_started` records where child age in months is within `[expectedAgeMin, expectedAgeMax]`; call `isDuplicate` with 7-day cooldown per `milestoneKey`; call `createNotification` with type `milestone_reminder`, ActionUrl `/dashboard/milestones`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.2 Write property test for Property 8 (milestone trigger correctness)
    - **Property 8: Milestone trigger only fires for not_started milestones in age window**
    - Generate random children with milestones at various statuses (`not_started`, `in_progress`, `achieved`) and age windows; assert only `not_started` in-window milestones produce `milestone_reminder` notifications
    - Tag: `Feature: smart-notifications, Property 8`
    - **Validates: Requirements 3.1, 3.4**

  - [ ] 2.3 `checkHabitStreaks(db, parentId, child)` — query latest `habits_log` per `habitType`; if `streakDays` ∈ {3, 7, 14, 30}, call `isDuplicate` with 1-day cooldown per `habitType+streak`; call `createNotification` with type `habit_streak`, ActionUrl `/dashboard/habits`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 2.4 `checkHabitGaps(db, parentId, child)` — query `habits_log` per `habitType` for last 3 days; if no entry exists, check no streak celebration was created today for same child+habitType; call `isDuplicate` with 3-day cooldown; call `createNotification` with type `habit_streak`, ActionUrl `/dashboard/habits`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 2.5 Write property test for Property 4 (habit gap/streak mutual exclusion)
    - **Property 4: Habit gap and streak are mutually exclusive on the same day**
    - Generate random (child, habitType, streakDays ∈ {3,7,14,30}); assert no gap nudge notification exists for the same child+habitType on the same calendar day as a streak celebration
    - Tag: `Feature: smart-notifications, Property 4`
    - **Validates: Requirements 9.4**

  - [ ] 2.6 `checkVaccinationsDue(db, parentId, child)` — query `vaccination_records` where `nextDue` is exactly 7 days from today; call `isDuplicate` with 3-day cooldown per `vaccineName`; call `createNotification` with type `general`, ActionUrl `/dashboard/vaccinations`
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 2.7 `checkGrowthReminder(db, parentId, child)` — query `growth_records` for last 30 days; if none found, call `isDuplicate` with 7-day cooldown per child; call `createNotification` with type `general`, ActionUrl `/dashboard/growth`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 2.8 `checkScreeningResults(db, parentId, child)` — query `screening_imports` for new records; for each, use `screeningId` as dedupeKey with `isDuplicate` (no cooldown — never repeat); call `createNotification` with type `screening_alert`, ActionUrl `/dashboard/reports`
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 2.9 `checkBlogRecommendation(db, parentId, child)` — check if any `blog_recommendation` notification exists for this parent in last 7 days; if not, call `createNotification` with type `blog_recommendation`, body including `getAgeStage(child.ageMonths)`, ActionUrl `/blog`
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 2.10 `checkWelcome(db, parentId, child)` — query `milestones` count for child; if zero, call `isDuplicate` (never repeat — use very long cooldown or check for any existing welcome); call `createNotification` with type `general`, ActionUrl `/dashboard/milestones`
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 3. Implement `runGenerationRun(db, parentId)` in `service.ts`
  - Fetch all children for `parentId` from `children` table; compute `ageMonths` from `dob` for each child
  - For each child, call all 8 trigger functions in sequence inside a `try/catch` per child
  - Each trigger function is also wrapped in its own `try/catch` — log error and continue on failure
  - Return total count of notifications created
  - _Requirements: 11.3, 11.4_

  - [ ]* 3.1 Write property test for Property 1 (deduplication invariant)
    - **Property 1: Deduplication invariant**
    - Generate random (parentId, childId, type, dedupeKey, cooldownDays) tuples; simulate two consecutive `isDuplicate` + insert cycles; assert count of matching notifications ≤ 1
    - Tag: `Feature: smart-notifications, Property 1`
    - **Validates: Requirements 12.1, 12.2**

  - [ ]* 3.2 Write property test for Property 2 (welcome notification at most once)
    - **Property 2: Welcome notification is created at most once per child**
    - Generate random children with zero milestones; run `runGenerationRun` twice; assert exactly 1 welcome notification per child in the notifications table
    - Tag: `Feature: smart-notifications, Property 2`
    - **Validates: Requirements 10.3**

  - [ ]* 3.3 Write property test for Property 3 (screening notification at most once per screeningId)
    - **Property 3: Screening notification is created at most once per screeningId**
    - Generate random `screeningImports` IDs; run `runGenerationRun` twice; assert exactly 1 `screening_alert` per screeningId in `dataJson`
    - Tag: `Feature: smart-notifications, Property 3`
    - **Validates: Requirements 7.3**

- [ ] 4. Checkpoint — Ensure all NotificationService tests pass
  - Run `vitest --run src/lib/notifications` and confirm all unit and property tests pass. Ask the user if questions arise.

- [ ] 5. Create Notifications API route (`src/pages/api/notifications.ts`)
  - Add `export const prerender = false`
  - `GET`: call `getParentId`; query `notifications` table for parent ordered by `createdAt DESC`; compute `unreadCount`; return `{ notifications, unreadCount }`
  - `POST mark_read`: validate `id` belongs to parent (403 if not); set `read = true` for that record; return `{ success: true }`
  - `POST mark_all_read`: set `read = true` for all unread notifications for parent; return `{ success: true }`
  - Return 401 for missing/invalid auth token on all methods
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 5.1 Write property test for Property 5 (unreadCount accuracy)
    - **Property 5: Only unread notifications contribute to unreadCount**
    - Generate random sets of read/unread notification records for a parent; assert `unreadCount` in GET response equals count of records with `read = false`
    - Tag: `Feature: smart-notifications, Property 5`
    - **Validates: Requirements 1.2**

  - [ ]* 5.2 Write property test for Property 6 (mark_all_read zeroes unreadCount)
    - **Property 6: mark_all_read sets all to read**
    - Generate random sets of unread notifications; call POST `mark_all_read` then GET; assert `unreadCount = 0`
    - Tag: `Feature: smart-notifications, Property 6`
    - **Validates: Requirements 1.4, 2.3**

  - [ ]* 5.3 Write property test for Property 7 (notifications ordered newest-first)
    - **Property 7: Notifications are ordered newest-first**
    - Generate random notification sets with varying `createdAt` timestamps; assert response array satisfies `notifications[i].createdAt >= notifications[i+1].createdAt` for all i
    - Tag: `Feature: smart-notifications, Property 7`
    - **Validates: Requirements 1.1**

  - [ ]* 5.4 Write unit tests for API route auth and error paths
    - Test 401 returned when no auth token provided
    - Test 403 returned when `mark_read` targets a notification belonging to a different parent
    - Test happy-path GET returns correct shape `{ notifications, unreadCount }`
    - _Requirements: 1.5, 1.6_

- [ ] 6. Create Notifications Generate API route (`src/pages/api/notifications/generate.ts`)
  - Add `export const prerender = false`
  - `POST`: call `getParentId` (401 if missing); call `runGenerationRun(env.DB, parentId)`; return `{ generated: number }`
  - _Requirements: 11.1_

- [ ] 7. Create Daily Notifications Cron endpoint (`src/pages/api/cron/daily-notifications.ts`)
  - Add `export const prerender = false`
  - `POST`: validate `Authorization: Bearer <CRON_SECRET>` header (401 if missing/wrong)
  - Query all distinct `parentId` values from `children` table
  - Call `runGenerationRun(env.DB, parentId)` for each parent; accumulate `processed` and `generated` counts
  - Return `{ processed: number, generated: number }`
  - _Requirements: 11.2, 11.3, 11.4_

- [ ] 8. Update cron-worker to call daily-notifications endpoint (`cron-worker/index.ts`)
  - After the existing `POST /api/cron/daily-broadcast` call, add a second `fetch` call to `POST /api/cron/daily-notifications` with the same `Authorization: Bearer CRON_SECRET` header
  - Log the response from both calls
  - _Requirements: 11.2_

- [ ] 9. Checkpoint — Ensure API routes and cron wiring are correct
  - Run `vitest --run src/pages/api` and confirm all API route tests pass. Ask the user if questions arise.

- [ ] 10. Wire NotificationBell.tsx to real API (replace mock)
  - Remove the `MOCK_NOTIFICATIONS` import and `src/lib/content/mock-notifications.ts` reference
  - On mount, fetch `GET /api/notifications` using the Firebase auth token from `localStorage`/`sessionStorage`; store `notifications` and `unreadCount` in component state
  - Display a loading skeleton (`animate-pulse` divs) while fetching (`isLoading` state)
  - On fetch error, set `notifications = []` and render a subtle "Could not load notifications" message — do not crash
  - Replace the hardcoded `typeLabel` map with the `TYPE_CONFIG` object from the design (label, emoji, color per type); update type values to match DB enum: `screening_alert`, `milestone_reminder`, `habit_streak`, `service_update`, `blog_recommendation`, `general`
  - On "Mark all read" click, call `POST /api/notifications { action: "mark_all_read" }` and set local `unreadCount = 0`
  - On notification item click, navigate to `notification.actionUrl` (use `window.location.href` or router push)
  - Preserve all existing visual design (dropdown layout, badge, colors)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 11. Trigger notification generation on login (update session endpoint)
  - In `src/pages/api/auth/session.ts`, after the parent record is upserted and `parentId` is resolved, add a fire-and-forget `fetch` call to `POST /api/notifications/generate` with the parent's auth token
  - Use a non-blocking pattern (do not `await` the fetch) so generation does not delay the login response
  - _Requirements: 11.1_

- [ ] 12. Final checkpoint — Full integration verification
  - Run `vitest --run` to confirm all tests (unit + property) pass
  - Verify `NotificationBell.tsx` has no remaining references to `MOCK_NOTIFICATIONS`
  - Verify `cron-worker/index.ts` calls both `/api/cron/daily-broadcast` and `/api/cron/daily-notifications`
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property tests use `fast-check` (already in `package.json`) with minimum 100 iterations per run
- D1 is mocked in tests using an in-memory object mock — no real Cloudflare binding needed
- The `notifications` table already exists in `src/lib/db/schema.ts`; no schema migrations required
- `CRON_SECRET` must be set via `wrangler pages secret put CRON_SECRET`
- Each property test must include the tag comment: `Feature: smart-notifications, Property N: <property_text>`
- `NotificationBell.tsx` currently uses a legacy type enum (`milestone`, `promotion`, `screening`, `habit`, `blog`) — task 10 must align it with the DB enum values
- `src/lib/content/mock-notifications.ts` can be deleted once task 10 is complete
