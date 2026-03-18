# Design Document: Smart Notifications

## Overview

Smart Notifications replaces the hardcoded mock data in `NotificationBell.tsx` with a live, rule-based notification engine. The system queries each child's real health data on login and daily via cron, evaluates a set of trigger rules, writes `Notification` records to the existing D1 `notifications` table, and surfaces them through the existing bell UI.

The design is intentionally simple: no ML, no external services, no new DB tables. Everything runs server-side on Cloudflare Pages/Workers using the existing D1 database and auth pattern.

---

## Architecture

```mermaid
flowchart TD
    A[Parent Login\n/api/auth/session] -->|POST after auth| B[/api/notifications/generate]
    C[Cron Worker\n03:30 UTC daily] -->|POST /api/cron/daily-notifications| B
    B --> D[NotificationService\nsrc/lib/notifications/service.ts]
    D -->|query child data| E[(D1: children\nmilestones\nhabits_log\ngrowth_records\nvaccination_records\nscreening_imports)]
    D -->|dedup check + insert| F[(D1: notifications)]
    G[NotificationBell.tsx] -->|GET /api/notifications| F
    G -->|POST /api/notifications mark_read| F
```

**Key design decisions:**

- `NotificationService` is a plain TypeScript module (not a class) — a set of exported async functions that accept `db` and `parentId`. This keeps it testable and avoids DI complexity.
- Generation is triggered in two places: (1) `POST /api/notifications/generate` called from the session endpoint after login, and (2) a new cron endpoint `POST /api/cron/daily-notifications` called by the existing `cron-worker`.
- The `NotificationBell` component fetches from `GET /api/notifications` on mount, replacing the `MOCK_NOTIFICATIONS` import entirely.
- No new DB tables are needed — the existing `notifications` table is sufficient. Child context is stored in `data_json` as `{ childId, childName, ...triggerSpecificData }`.

---

## Components and Interfaces

### NotificationService (`src/lib/notifications/service.ts`)

```typescript
// Core types
interface NotificationInput {
  parentId: string
  childId: string
  type: NotificationType
  title: string
  body: string
  actionUrl: string
  dataJson: Record<string, unknown>
}

// Public API
export async function runGenerationRun(db: D1Database, parentId: string): Promise<void>
export async function createNotification(db: D1Database, input: NotificationInput): Promise<void>
export async function isDuplicate(db: D1Database, parentId: string, childId: string, type: string, dedupeKey: string, cooldownDays: number): Promise<boolean>
```

`runGenerationRun` fetches all children for the parent, then calls each trigger function in sequence. Each trigger function is responsible for its own deduplication check before inserting.

### Trigger Functions (internal to service.ts)

| Function | Trigger condition | Cooldown |
|---|---|---|
| `checkMilestoneWindows` | child age in `[expectedAgeMin, expectedAgeMax]` AND status = `not_started` | 7 days per milestoneKey |
| `checkHabitStreaks` | `streakDays` ∈ {3, 7, 14, 30} on latest log | 1 day per habitType+streak |
| `checkVaccinationsDue` | `nextDue` is 7 days from today | 3 days per vaccineName |
| `checkGrowthReminder` | no `growthRecords` in last 30 days | 7 days per child |
| `checkScreeningResults` | new `screeningImports` record (checked via `data_json.screeningId`) | per screeningId (never repeat) |
| `checkBlogRecommendation` | no `blog_recommendation` notification in last 7 days | 7 days per parent |
| `checkHabitGaps` | no `habitsLog` for a `habitType` in last 3 days | 3 days per habitType |
| `checkWelcome` | child has zero `milestones` records | once per child (never repeat) |

### API Routes

**`src/pages/api/notifications.ts`** — GET + POST

```
GET  /api/notifications
  → { notifications: Notification[], unreadCount: number }

POST /api/notifications
  body: { action: "mark_read", id: string }
     | { action: "mark_all_read" }
  → { success: true }
```

**`src/pages/api/notifications/generate.ts`** — POST (internal, called from session)

```
POST /api/notifications/generate
  → { generated: number }
  Auth: same Firebase bearer token
```

**`src/pages/api/cron/daily-notifications.ts`** — POST (cron-protected)

```
POST /api/cron/daily-notifications
  Auth: Bearer CRON_SECRET
  → { processed: number, generated: number }
```

### NotificationBell.tsx (updated)

The component drops the `MOCK_NOTIFICATIONS` import and instead:
1. Calls `GET /api/notifications` on mount using the Firebase token from `localStorage` / `sessionStorage`.
2. Maps the DB `type` enum to display labels and emoji (replacing the old `typeLabel` map).
3. Calls `POST /api/notifications { action: "mark_all_read" }` on "Mark all read".
4. Shows a loading skeleton while fetching.
5. Gracefully renders an empty state on fetch failure.

The existing visual design (dropdown, badge, colors) is preserved — only the data source changes.

---

## Data Models

### Notification record (existing table, no schema change)

```typescript
{
  id: string                  // UUID
  parentId: string
  type: NotificationType      // existing enum
  title: string               // e.g. "Arjun's MMR vaccine is due in 7 days"
  body: string                // supporting detail
  dataJson: string            // JSON: { childId, childName, dedupeKey, ...extras }
  read: boolean               // default false
  createdAt: string           // datetime('now')
}
```

`dataJson` is the key to deduplication. Every notification stores at minimum:
```json
{ "childId": "uuid", "childName": "Arjun", "dedupeKey": "milestone:first_words" }
```

The `dedupeKey` is a stable string that uniquely identifies the trigger instance (e.g. `milestone:first_words`, `habit_streak:active_movement:7`, `vaccination:MMR`, `screening:<screeningId>`).

### Age Stage Mapping (for blog recommendations)

```typescript
function getAgeStage(ageMonths: number): string {
  if (ageMonths < 12)  return 'infant'       // 0–11 months
  if (ageMonths < 36)  return 'toddler'      // 12–35 months
  if (ageMonths < 72)  return 'preschooler'  // 3–5 years
  if (ageMonths < 144) return 'school-age'   // 6–11 years
  return 'adolescent'                         // 12–16 years
}
```

### Habit Type Labels (for human-readable notification text)

```typescript
const HABIT_LABELS: Record<string, string> = {
  healthy_eating:   'Healthy Eating',
  active_movement:  'Active Movement',
  balanced_stress:  'Balanced Stress',
  inner_coaching:   'Inner Coaching',
  timekeepers:      'Timekeepers',
  sufficient_sleep: 'Sufficient Sleep',
}
```

### Notification Type → Display Config (in NotificationBell)

```typescript
const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  milestone_reminder:  { label: 'Milestone',   emoji: '🎯', color: 'bg-blue-500'   },
  habit_streak:        { label: 'Habit',        emoji: '🔥', color: 'bg-purple-500' },
  screening_alert:     { label: 'Screening',    emoji: '📋', color: 'bg-orange-500' },
  blog_recommendation: { label: 'Article',      emoji: '📖', color: 'bg-teal-500'   },
  general:             { label: 'Reminder',     emoji: '💡', color: 'bg-green-500'  },
  service_update:      { label: 'Service',      emoji: '🏥', color: 'bg-pink-500'   },
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Deduplication invariant
*For any* parent, child, notification type, and dedupeKey, running `runGenerationRun` multiple times within the cooldown window should not increase the count of notifications matching that (parentId, type, dedupeKey) tuple beyond 1.
**Validates: Requirements 12.1, 12.2**

Property 2: Welcome notification is created at most once per child
*For any* child with zero milestones, running `runGenerationRun` N times should result in exactly 1 welcome notification for that child in the notifications table.
**Validates: Requirements 10.3**

Property 3: Screening notification is created at most once per screeningId
*For any* `screeningImports` record, running `runGenerationRun` N times should result in exactly 1 `screening_alert` notification referencing that screeningId in `dataJson`.
**Validates: Requirements 7.3**

Property 4: Habit gap and streak are mutually exclusive on the same day
*For any* child and habitType, if a habit streak celebration notification was created today, then no habit gap nudge notification should exist for the same child and habitType created on the same calendar day.
**Validates: Requirements 9.4**

Property 5: Only unread notifications contribute to unreadCount
*For any* parent, the `unreadCount` returned by `GET /api/notifications` must equal the count of notification records for that parent where `read = false`.
**Validates: Requirements 1.2**

Property 6: mark_all_read sets all to read
*For any* parent with N unread notifications, calling POST `mark_all_read` then GET `/api/notifications` should return `unreadCount = 0`.
**Validates: Requirements 1.4, 2.3**

Property 7: Notifications are ordered newest-first
*For any* parent with multiple notifications, the `notifications` array returned by GET must be sorted by `createdAt` descending — i.e. `notifications[i].createdAt >= notifications[i+1].createdAt` for all i.
**Validates: Requirements 1.1**

Property 8: Milestone trigger only fires for not_started milestones in age window
*For any* child, after `runGenerationRun`, every `milestone_reminder` notification in the DB for that child must correspond to a milestone whose status was `not_started` and whose `[expectedAgeMin, expectedAgeMax]` range contained the child's age in months at generation time.
**Validates: Requirements 3.1, 3.4**

---

## Error Handling

- **DB errors in triggers**: Each trigger function is wrapped in a `try/catch`. A failure in one trigger (e.g. `checkVaccinationsDue`) logs the error and does not abort the remaining triggers for that child.
- **DB errors across children**: `runGenerationRun` iterates children with a `try/catch` per child. One child failing does not abort others.
- **API 401/403**: All API routes use the standard `getParentId` pattern. Missing/invalid token → 401. Attempting to mark a notification belonging to another parent → 403.
- **NotificationBell fetch failure**: The component catches fetch errors and renders an empty list with a subtle "Could not load notifications" message. The bell icon remains functional.
- **Cron endpoint auth**: `POST /api/cron/daily-notifications` validates `Authorization: Bearer CRON_SECRET`. Missing or wrong secret → 401.

---

## Testing Strategy

### Unit Tests (Vitest)

Focus on the pure logic functions in `NotificationService`:
- `isDuplicate` — given mock DB responses, verify correct true/false returns for various cooldown scenarios.
- `getAgeStage` — verify correct stage string for boundary ages (0, 11, 12, 35, 36, 71, 72, 143, 144 months).
- `buildDedupeKey` — verify stable key format for each trigger type.
- API route handlers — mock `env.DB` and verify correct HTTP status codes for auth failures, missing params, and happy paths.

### Property-Based Tests (fast-check, minimum 100 runs each)

Each property from the Correctness Properties section maps to one property-based test.

**Tag format**: `Feature: smart-notifications, Property N: <property_text>`

- **Property 1** — Generate random (parentId, childId, type, dedupeKey, cooldownDays) tuples. Simulate two consecutive `isDuplicate` + insert cycles. Assert count ≤ 1.
- **Property 2** — Generate random children with zero milestones. Run generation twice. Assert exactly 1 welcome notification per child.
- **Property 3** — Generate random screeningImports IDs. Run generation twice. Assert exactly 1 screening_alert per screeningId.
- **Property 4** — Generate random (child, habitType, streakDays ∈ {3,7,14,30}). Assert no gap nudge created on same day as streak celebration.
- **Property 5** — Generate random sets of read/unread notifications. Assert `unreadCount` equals count of records with `read = false`.
- **Property 6** — Generate random unread notification sets. Call mark_all_read. Assert `unreadCount = 0`.
- **Property 7** — Generate random notification sets with varying `createdAt`. Assert response array is sorted descending.
- **Property 8** — Generate random children with milestones at various statuses and age windows. Assert only `not_started` in-window milestones produce notifications.

Both unit and property tests run via `vitest --run`. The D1 database is mocked using an in-memory SQLite adapter or a simple object mock for unit/property tests — no real Cloudflare binding needed.
