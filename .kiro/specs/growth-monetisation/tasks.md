# Implementation Plan: growth-monetisation

## Overview

Implement four capabilities in order: DB schema, health score engine, health score display, subscription utilities, admin pricing API, admin pricing UI, PDF export, and public content navigation fix. Each phase builds on the previous. TypeScript throughout; Cloudflare Workers runtime (no Node.js-only APIs).

## Tasks

- [x] 1. DB schema + migration
  - [x] 1.1 Add `pricingTiers` and `parentSubscriptions` tables to `src/lib/db/schema.ts`
    - Add `pricingTiers` table definition matching design data model (id, name, description, currency, amount_cents, amount_yearly_cents, features_json, is_active, created_at)
    - Add `parentSubscriptions` table definition (id, parent_id FK→parents.id, tier_id FK→pricing_tiers.id, status enum, started_at, expires_at, payment_id, billing_cycle, features_snapshot_json, created_at)
    - Export both tables and their inferred types
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 1.2 Create migration file `migrations/0007_pricing_tiers.sql`
    - `CREATE TABLE IF NOT EXISTS pricing_tiers` with all columns and CHECK constraints
    - `CREATE TABLE IF NOT EXISTS parent_subscriptions` with FK references and status CHECK constraint
    - Seed the free tier row: `id='free'`, `amount_cents=0`, `features_json='["pdf_export","health_score_basic"]'`
    - _Requirements: 8.1, 8.2, 8.5, 8.6_

  - [x] 1.3 Git commit: "feat: add pricing_tiers and parent_subscriptions schema + migration"

- [x] 2. Health score engine
  - [x] 2.1 Create `src/lib/phr/health-score.ts` with pure scoring functions
    - Define `GrowthInput`, `DevelopmentInput`, `HabitsInput`, `NutritionInput`, `HealthScoreInputs`, `HealthScoreResult` interfaces
    - Implement `computeHealthScore(inputs)`: weight redistribution for absent components, per-component scoring formulas from design, return integer [0, 100]
    - Implement `computeTrend(current, previous)`: returns `'up'` | `'down'` | `'flat'` based on >2 point threshold
    - Implement `getScoreColor(score)`: returns `'red'` | `'amber'` | `'green'` per thresholds 40 / 70
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x]* 2.2 Write property test — Property 1: Health Score Bounds
    - File: `src/lib/phr/health-score.test.ts`
    - Use `fc.record` with optional growth/dev/habits/nutrition fields; assert score ∈ [0, 100] and is integer
    - `{ numRuns: 1000 }`
    - // Feature: growth-monetisation, Property 1: output bounds
    - _Requirements: 3.2, 3.3, 3.9, 13.1_

  - [x]* 2.3 Write property test — Property 2: Weight Invariant
    - File: `src/lib/phr/health-score.test.ts`
    - All four components present; verify effective weights sum to 1.0 by back-calculating from component scores
    - // Feature: growth-monetisation, Property 2: weight invariant
    - _Requirements: 3.1, 3.4, 13.2_

  - [x]* 2.4 Write property test — Property 3: Color Coding Exhaustive
    - File: `src/lib/phr/health-score.test.ts`
    - `fc.integer({ min: 0, max: 100 })`; assert `getScoreColor` returns one of the three valid values and matches thresholds
    - // Feature: growth-monetisation, Property 3: color coding
    - _Requirements: 4.2, 4.3, 4.4_

  - [x]* 2.5 Write property test — Property 4: Trend Computation
    - File: `src/lib/phr/health-score.test.ts`
    - `fc.tuple(fc.integer({min:0,max:100}), fc.integer({min:0,max:100}))`; assert up/down/flat rules
    - // Feature: growth-monetisation, Property 4: trend computation
    - _Requirements: 4.5, 4.6, 4.7, 4.8_

  - [x]* 2.6 Write unit tests for health score engine
    - All four components with known values → expected weighted score
    - Growth-only input → score equals growth component at 100% weight
    - All streaks = 0 → habits component = 0; all streaks = 30 → habits component = 100
    - `getScoreColor(39)` → `'red'`, `getScoreColor(40)` → `'amber'`, `getScoreColor(70)` → `'green'`
    - `computeTrend(75, 70)` → `'up'`, `computeTrend(70, 75)` → `'down'`, `computeTrend(70, 71)` → `'flat'`
    - _Requirements: 3.1–3.9, 4.2–4.8_

  - [x] 2.7 Create API route `src/pages/api/children/[childId]/health-score.ts`
    - Authenticate via `getParentId(request, env)`; return 401 if unauthenticated
    - Verify child belongs to parent; return 403 if not
    - Query D1: most recent `growth_records.who_zscore_json`, milestone counts (achieved vs eligible), latest `habits_log.streak_days` per category, most recent `parent_observations` with `category='nutrition'`
    - Call `computeHealthScore` and `computeTrend` (compare last-30-days vs previous-30-days scores)
    - Return `{ score, trend, components }`; return `{ score: 0, trend: 'flat', components: {} }` when no data
    - _Requirements: 3.1–3.9, 4.5–4.8_

  - [ ]* 2.8 Write integration tests for health-score API route
    - File: `src/pages/api/children/[childId]/health-score.test.ts`
    - Unauthenticated request → 401
    - Child not owned by parent → 403
    - Valid request with mocked D1 → 200 with score ∈ [0, 100]
    - _Requirements: 3.2_

  - [x] 2.9 Git commit: "feat: health score engine + API route"

- [x] 3. Health score display
  - [x] 3.1 Create `src/components/phr/HealthScoreGauge.tsx`
    - Props: `{ childId: string; token: string }`
    - Fetch from `/api/children/:childId/health-score` on mount
    - SVG ring gauge using `stroke-dasharray` / `stroke-dashoffset`, radius 40, stroke-width 8
    - Apply Tailwind stroke color from `getScoreColor(score)`: red/amber/green
    - Render trend arrow: ↑ green, ↓ red, → gray
    - Show animated pulse skeleton while loading
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.9_

  - [x] 3.2 Integrate `HealthScoreGauge` into `src/components/phr/ChildDashboard.tsx`
    - Import and render `<HealthScoreGauge childId={childId} token={token} />` inside the child header card, after the child name/age block
    - Only render when `token` is available
    - _Requirements: 4.1, 4.9_

  - [x] 3.3 Git commit: "feat: HealthScoreGauge component + ChildDashboard integration"

- [x] 4. Subscription utilities
  - [x] 4.1 Create `src/lib/subscriptions.ts`
    - Implement `getParentFeatures(parentId, db)`: query most recent active `parent_subscriptions` row, parse `features_snapshot_json`; fall back to `['pdf_export', 'health_score_basic']` on no row or DB error
    - Implement `hasFeature(parentId, feature, db)`: call `getParentFeatures` and check inclusion
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x]* 4.2 Write property test — Property 7: Feature Gating Access Granted
    - File: `src/lib/subscriptions.test.ts`
    - `fc.array(fc.string())` for features; pick one as key; mock DB returning that snapshot; assert `hasFeature` returns true
    - // Feature: growth-monetisation, Property 7: feature gating access granted
    - _Requirements: 7.2, 10.1_

  - [x]* 4.3 Write property test — Property 8: Feature Gating Access Denied
    - File: `src/lib/subscriptions.test.ts`
    - `fc.array(fc.string())` for features; use a key guaranteed absent; assert `hasFeature` returns false
    - // Feature: growth-monetisation, Property 8: feature gating access denied
    - _Requirements: 10.2, 10.4_

  - [x]* 4.4 Write property test — Property 9: Free Tier Fallback
    - File: `src/lib/subscriptions.test.ts`
    - Mock DB returning no rows; assert `getParentFeatures` returns `['pdf_export', 'health_score_basic']`
    - // Feature: growth-monetisation, Property 9: free tier fallback
    - _Requirements: 10.3_

  - [x]* 4.5 Write property test — Property 14: Features JSON Round-Trip
    - File: `src/lib/subscriptions.test.ts`
    - `fc.array(fc.string())`; serialize to JSON and deserialize; assert deep equality
    - // Feature: growth-monetisation, Property 14: features JSON round-trip
    - _Requirements: 8.3_

  - [x]* 4.6 Write unit tests for subscription utilities
    - Parent with active subscription containing `pdf_export` → `hasFeature` returns true
    - Parent with no subscription → `getParentFeatures` returns free tier features
    - Free tier seed row has `amount_cents = 0` and includes `pdf_export`
    - _Requirements: 7.3, 10.1, 10.3_

  - [x] 4.7 Git commit: "feat: subscription utilities (getParentFeatures, hasFeature)"

- [x] 5. Admin pricing API routes
  - [x] 5.1 Create `src/pages/api/admin/pricing/tiers.ts`
    - `GET`: return all `pricing_tiers` rows ordered by `created_at`
    - `POST`: validate body (name, amount_cents, features_json array), insert new row, return created tier
    - Require `Authorization: Bearer ${env.ADMIN_KEY}`; return 401 if missing/invalid
    - _Requirements: 9.1, 9.2, 9.6_

  - [x] 5.2 Create `src/pages/api/admin/pricing/tiers/[id].ts`
    - `PUT`: update name, description, prices, features_json, is_active for the given tier id; do NOT mutate `features_snapshot_json` on any existing active `parent_subscriptions`
    - `DELETE` (deactivate): set `is_active = false`; if tier has `amount_cents = 0` return 400 `"Free tier cannot be deactivated"`
    - Require `ADMIN_KEY` bearer token
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 12.1_

  - [x]* 5.3 Write property test — Property 10: Free Tier Protection
    - File: `src/pages/api/admin/pricing/tiers/[id].test.ts`
    - Any deactivate/delete request targeting the free tier row → assert 400 with correct message
    - // Feature: growth-monetisation, Property 10: free tier protection
    - _Requirements: 9.5, 13.5_

  - [x]* 5.4 Write property test — Property 11: Subscription Status Transition DAG
    - File: `src/lib/subscriptions.test.ts`
    - `fc.constantFrom('expired', 'cancelled')` as current status; attempt to set `active` in-place; assert 400 with correct message
    - // Feature: growth-monetisation, Property 11: status transition DAG
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 13.6_

  - [x]* 5.5 Write property test — Property 12: Snapshot Immutability
    - File: `src/lib/subscriptions.test.ts`
    - Generate tier update; verify all active `parent_subscriptions.features_snapshot_json` values are unchanged after PUT
    - // Feature: growth-monetisation, Property 12: snapshot immutability
    - _Requirements: 12.1, 12.2, 13.4_

  - [x] 5.6 Create `src/pages/api/subscriptions/me.ts`
    - `GET`: return parent's most recent active subscription row + parsed features array; 401 if unauthenticated
    - _Requirements: 10.1, 10.3_

  - [x] 5.7 Create `src/pages/api/subscriptions/index.ts`
    - `POST`: create new `parent_subscriptions` row with `features_snapshot_json` copied from tier's current `features_json`; reject reactivation of existing expired/cancelled rows (400 `"Reactivation requires a new payment"`)
    - _Requirements: 8.4, 8.5, 11.3, 11.5, 12.3_

  - [x] 5.8 Git commit: "feat: admin pricing API routes + subscription endpoints"

- [x] 6. Admin pricing UI
  - [x] 6.1 Create `src/components/admin/PricingManager.tsx`
    - Fetch and display all tiers in a table: name, monthly price, yearly price, active status, feature keys
    - "New Tier" button opens a modal with `TierForm` (name, description, currency, amount_cents, amount_yearly_cents, is_active toggle)
    - Feature checklist in form for known keys: `pdf_export`, `health_score_basic`, `health_score_detailed`, `unlimited_children`, `priority_support`, `teleconsult_discount_pct`
    - "Edit" button per row opens same modal pre-populated
    - "Deactivate" button per row; display inline error on 400 response (e.g. free tier protection message)
    - All mutations update local state without full page reload
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_

  - [x] 6.2 Create `src/pages/admin/pricing.astro`
    - Mount `<PricingManager client:load />` inside the existing admin layout
    - _Requirements: 9.1_

  - [x] 6.3 Git commit: "feat: PricingManager admin UI + pricing admin page"

- [x] 7. PDF export component
  - [x] 7.1 Install `@react-pdf/renderer` (browser-compatible build) — add to `package.json` dependencies
    - Verify no Node.js-only transitive dependencies are introduced
    - _Requirements: 6.1, 6.3_

  - [x] 7.2 Create `src/components/phr/PhrPdfExport.tsx`
    - Props: `{ child: { id, name, dob, gender? }, token: string, features: string[] }`
    - Render export button only when `features.includes('pdf_export')`
    - On click: set loading, disable button, fetch in parallel `/api/vaccinations?childId=`, `/api/growth?childId=`, `/api/milestones?childId=`, `/api/observations?childId=`
    - Build `@react-pdf/renderer` `<Document>` with header (name, DOB, gender, export date) and four sections; each section shows "No records available" when empty
    - Trigger download with filename `skids-${sanitisedName}-${YYYY-MM-DD}.pdf`
    - On error: display error banner, re-enable button; do not use partial data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3_

  - [x]* 7.3 Write property test — Property 5: PDF Data Completeness
    - File: `src/components/phr/PhrPdfExport.test.tsx`
    - Generate arbitrary counts of vaccinations, growth records, milestones, observations; assert all N vaccinations, M growth, K milestones, min(P,10) observations appear in document tree
    - // Feature: growth-monetisation, Property 5: PDF data completeness
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 13.3_

  - [x]* 7.4 Write property test — Property 6: PDF Filename Format
    - File: `src/components/phr/PhrPdfExport.test.tsx`
    - `fc.string()` for child name, arbitrary date; assert filename matches `skids-{sanitised}-{YYYY-MM-DD}.pdf`
    - // Feature: growth-monetisation, Property 6: PDF filename format
    - _Requirements: 6.4_

  - [x] 7.5 Integrate `PhrPdfExport` into `src/components/phr/ChildDashboard.tsx`
    - Fetch subscription features from `/api/subscriptions/me` on mount
    - Render `<PhrPdfExport child={child} token={token} features={features} />` in the child header section
    - _Requirements: 7.1, 7.2_

  - [x] 7.6 Git commit: "feat: PhrPdfExport component + ChildDashboard integration"

- [x] 8. Public content navigation fix
  - [x] 8.1 Update `src/pages/habits/[habit].astro` to add auth-aware CTA
    - Change the "Open PHR Dashboard" anchor `href` to `#`
    - Add an inline `<script>` that on CTA click checks `localStorage` for a Firebase auth token (key pattern `firebase:authUser:<projectId>:[DEFAULT]`)
    - If token found: navigate to `/me`; if absent or indeterminate after 2 s: navigate to `/login?redirect=/me`
    - _Requirements: 2.1, 2.2, 2.3_

  - [x]* 8.2 Write property test — Property 13: CTA Auth-Check Routing
    - File: `src/pages/habits/habit-cta.test.ts` (test the extracted `ctaAuthCheck` helper)
    - Extract `ctaAuthCheck(localStorage)` as a pure function returning `'/me'` or `'/login?redirect=/me'`
    - `fc.option(fc.string())` for token value; assert routing rule
    - // Feature: growth-monetisation, Property 13: CTA auth-check routing
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 8.3 Git commit: "fix: habit page CTA auth-awareness"

- [-] 9. Final checkpoint
  - Run `vitest --run` and confirm all 344+ tests pass (no regressions)
  - Verify Cloudflare Workers compatibility: no `process`, `fs`, `path`, or other Node.js-only APIs imported in any new file
  - Git commit: "chore: final checkpoint — all tests passing"
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fc.assert(fc.property(...))` from fast-check with the comment `// Feature: growth-monetisation, Property N: <title>`
- All new Worker API routes must use `getParentId(request, env)` for auth — no Node.js `crypto` or `fs`
- The free tier seed (`id='free'`, `amount_cents=0`) must exist before any subscription logic runs
