# Requirements Document

## Introduction

The growth-monetisation feature adds four capabilities to the SKIDS parent app (Astro 5 + Cloudflare Workers + D1 SQLite):

1. **Public Content Access** — Ensure unauthenticated users can browse blog, discover, and habits pages without being redirected, and that the "Track this habit" CTA gracefully handles unauthenticated state.
2. **Child Health Score** — A composite 0–100 score displayed on the child dashboard header, derived from growth, development, habits, and nutrition data, with color coding and trend indication.
3. **PDF Export** — Client-side PDF generation (via `@react-pdf/renderer`) of a child's health records, compatible with Cloudflare Workers (no Node.js-only dependencies).
4. **Admin-Controlled Tiered Pricing** — Replace hardcoded `care_plans` with a fully admin-managed pricing system including CRUD tiers, feature-flag gating, and parent subscription tracking.

---

## Glossary

- **Navbar**: The `src/components/common/Navbar.astro` component rendered on every page.
- **Habit_Page**: A statically pre-rendered page at `/habits/[habit]` (`prerender = true`).
- **PHR_Dashboard**: The authenticated child dashboard at `/me/child/[id]`, rendered by `ChildDashboard.tsx`.
- **Health_Score_Engine**: The server-side or client-side module that computes the composite child health score.
- **Health_Score**: The composite 0–100 integer score for a child derived from growth, development, habits, and nutrition inputs.
- **WHO_Z_Score**: A WHO-standard deviation score stored in `growth_records.who_zscore_json`.
- **Milestone_Completion_Rate**: The percentage of age-appropriate milestones with status `achieved` for a child.
- **Habit_Streak**: The `streak_days` value from the most recent `habits_log` entry per habit category for a child.
- **PDF_Exporter**: The client-side React component that uses `@react-pdf/renderer` to generate and download a child health PDF.
- **Pricing_Manager**: The React component at `src/components/admin/PricingManager.tsx` for admin CRUD of pricing tiers.
- **Pricing_Tier**: A row in the `pricing_tiers` table defining a subscription plan with feature flags.
- **Feature_Key**: A string identifier (e.g. `pdf_export`, `health_score_detailed`) that gates access to a premium capability.
- **Parent_Subscription**: A row in the `parent_subscriptions` table linking a parent to an active pricing tier.
- **Free_Tier**: The `pricing_tiers` row with `amount_cents = 0` that all parents receive by default.
- **Subscription_Snapshot**: The `features_json` value copied from the tier into the subscription record at the time of activation.
- **Admin_API**: Cloudflare Worker API routes under `/api/admin/` authenticated with the `ADMIN_KEY` bearer token.
- **Parent_API**: Cloudflare Worker API routes authenticated via `getParentId(request, env)` using Firebase Auth.

---

## Requirements

### Requirement 1: Public Content Navigation

**User Story:** As an unauthenticated visitor, I want to browse blog, discover, and habits pages without being redirected to login, so that I can explore SKIDS content freely.

#### Acceptance Criteria

1. WHEN an unauthenticated user visits `/blog/[slug]`, `/discover/[organ]`, or `/habits/[habit]`, THE Navbar SHALL render without triggering a redirect to `/login`.
2. WHILE a user is unauthenticated, THE Navbar SHALL display a "Sign In" link in place of the authenticated user menu.
3. THE Navbar SHALL NOT redirect unauthenticated users away from pages that do not require authentication.
4. WHEN an unauthenticated user visits any page with `prerender = true`, THE Navbar SHALL hydrate client-side without causing a full-page navigation to `/login`.

---

### Requirement 2: Habit Page Unauthenticated CTA

**User Story:** As an unauthenticated visitor reading a habit page, I want the "Track this habit" CTA to show a login prompt instead of redirecting me to a broken dashboard, so that I understand I need to sign in to use that feature.

#### Acceptance Criteria

1. WHEN an unauthenticated user clicks "Open PHR Dashboard" on a Habit_Page, THE Habit_Page SHALL display a login prompt modal or redirect to `/login?redirect=/me` instead of navigating directly to `/me`.
2. WHEN an authenticated user clicks "Open PHR Dashboard" on a Habit_Page, THE Habit_Page SHALL navigate directly to `/me`.
3. IF the user's authentication state cannot be determined within 2 seconds of page load, THEN THE Habit_Page SHALL treat the user as unauthenticated and show the login prompt on CTA click.

---

### Requirement 3: Health Score Computation

**User Story:** As a parent, I want to see a composite health score for my child on the dashboard, so that I can quickly understand my child's overall wellbeing.

#### Acceptance Criteria

1. THE Health_Score_Engine SHALL compute a Health_Score as a weighted average: growth 30%, development 30%, habits 25%, nutrition 15%.
2. THE Health_Score_Engine SHALL produce a Health_Score that is an integer in the range [0, 100] inclusive for any valid combination of input data.
3. WHEN one or more input components (growth, development, habits, nutrition) have no data available for a child, THE Health_Score_Engine SHALL compute the score using only the components with available data, redistributing weights proportionally so that the weights of available components sum to 100%.
4. WHEN all four input components have data, THE Health_Score_Engine SHALL use weights that sum to exactly 100%.
5. THE Health_Score_Engine SHALL derive the growth component from WHO_Z_Score values for weight-for-age and height-for-age stored in `growth_records.who_zscore_json`, using the most recent record.
6. THE Health_Score_Engine SHALL derive the development component from the Milestone_Completion_Rate: the count of milestones with `status = 'achieved'` divided by the count of milestones with `expected_age_max` ≤ the child's current age in months, expressed as a percentage.
7. THE Health_Score_Engine SHALL derive the habits component from the average Habit_Streak across all six H.A.B.I.T.S. categories (`healthy_eating`, `active_movement`, `balanced_stress`, `inner_coaching`, `timekeepers`, `sufficient_sleep`), normalised to a 0–100 scale using a maximum reference streak of 30 days.
8. THE Health_Score_Engine SHALL derive the nutrition component from the most recent `parent_observations` record with `category = 'nutrition'` or from `screening_imports.four_d_json` nutrition data, whichever is more recent.
9. WHEN no nutrition data exists for a child, THE Health_Score_Engine SHALL exclude the nutrition component and redistribute its 15% weight proportionally among the remaining components.

---

### Requirement 4: Health Score Display

**User Story:** As a parent, I want to see the health score displayed as a visual gauge with color coding and a trend arrow on my child's dashboard, so that I can interpret the score at a glance.

#### Acceptance Criteria

1. THE PHR_Dashboard SHALL display the Health_Score as a ring or gauge graphic in the child header section.
2. WHEN the Health_Score is less than 40, THE PHR_Dashboard SHALL render the gauge in red.
3. WHEN the Health_Score is between 40 and 69 inclusive, THE PHR_Dashboard SHALL render the gauge in amber.
4. WHEN the Health_Score is 70 or above, THE PHR_Dashboard SHALL render the gauge in green.
5. THE PHR_Dashboard SHALL display a trend indicator alongside the Health_Score showing one of three states: up, down, or flat.
6. WHEN the Health_Score computed from the last 30 days of data exceeds the Health_Score from the previous 30-day period by more than 2 points, THE PHR_Dashboard SHALL display an upward trend arrow.
7. WHEN the Health_Score computed from the last 30 days of data is lower than the Health_Score from the previous 30-day period by more than 2 points, THE PHR_Dashboard SHALL display a downward trend arrow.
8. WHEN the difference between the current and previous 30-day Health_Score is 2 points or fewer, THE PHR_Dashboard SHALL display a flat trend indicator.
9. WHEN health score data is loading, THE PHR_Dashboard SHALL display a skeleton placeholder in place of the gauge.

---

### Requirement 5: PDF Export — Content

**User Story:** As a parent, I want to export my child's health records as a PDF, so that I can share them with doctors or keep an offline copy.

#### Acceptance Criteria

1. WHEN a parent initiates a PDF export for a child, THE PDF_Exporter SHALL include all `vaccination_records` rows for that child.
2. WHEN a parent initiates a PDF export for a child, THE PDF_Exporter SHALL include all `growth_records` rows for that child.
3. WHEN a parent initiates a PDF export for a child, THE PDF_Exporter SHALL include a milestone summary from the `milestones` table for that child.
4. WHEN a parent initiates a PDF export for a child, THE PDF_Exporter SHALL include the 10 most recent `parent_observations` rows for that child, ordered by `date` descending.
5. IF a child has zero records in any of the four sections, THEN THE PDF_Exporter SHALL include that section in the PDF with an explicit "No records available" message rather than omitting the section.
6. THE PDF_Exporter SHALL include the child's name, date of birth, and gender in the PDF header.

---

### Requirement 6: PDF Export — Technical Constraints

**User Story:** As a developer, I want the PDF export to run entirely in the browser, so that it is compatible with the Cloudflare Workers runtime without Node.js-only dependencies.

#### Acceptance Criteria

1. THE PDF_Exporter SHALL use `@react-pdf/renderer` to generate the PDF document entirely in the browser.
2. THE PDF_Exporter SHALL NOT invoke any server-side PDF generation endpoint.
3. THE PDF_Exporter SHALL NOT depend on `puppeteer`, `playwright`, `canvas`, or any other Node.js-only library.
4. WHEN PDF generation is complete, THE PDF_Exporter SHALL trigger a browser file download with a filename in the format `skids-[child-name]-[YYYY-MM-DD].pdf`.
5. WHEN PDF generation fails, THE PDF_Exporter SHALL display an error message to the parent without crashing the dashboard.
6. WHEN PDF generation is in progress, THE PDF_Exporter SHALL display a loading indicator and disable the export button to prevent duplicate submissions.

---

### Requirement 7: PDF Export — Feature Gating

**User Story:** As a product owner, I want PDF export to be available on the free tier with basic content, so that all parents get value while paid tiers unlock richer exports.

#### Acceptance Criteria

1. WHEN a parent with a Free_Tier subscription initiates a PDF export, THE PDF_Exporter SHALL generate a PDF containing vaccination records, growth records, milestone summary, and recent observations.
2. WHERE the `pdf_export` Feature_Key is present in the parent's active Subscription_Snapshot, THE PDF_Exporter SHALL make the export action available.
3. THE Free_Tier SHALL include the `pdf_export` Feature_Key by default.

---

### Requirement 8: Pricing Tiers — Data Model

**User Story:** As a developer, I want a well-defined database schema for pricing tiers and subscriptions, so that the system can support admin-managed plans and feature gating.

#### Acceptance Criteria

1. THE System SHALL maintain a `pricing_tiers` table with columns: `id`, `name`, `description`, `currency` (default `INR`), `amount_cents`, `amount_yearly_cents`, `features_json`, `is_active`, `created_at`.
2. THE System SHALL maintain a `parent_subscriptions` table with columns: `id`, `parent_id` (FK → `parents.id`), `tier_id` (FK → `pricing_tiers.id`), `status` (`active` | `expired` | `cancelled`), `started_at`, `expires_at`, `payment_id`, `billing_cycle` (`monthly` | `yearly`), `features_snapshot_json`.
3. THE System SHALL store `features_json` in `pricing_tiers` as a JSON array of Feature_Key strings.
4. THE System SHALL store `features_snapshot_json` in `parent_subscriptions` as a copy of the tier's `features_json` at the time the subscription was created.
5. WHEN a new parent account is created, THE System SHALL automatically create a `parent_subscriptions` row linking the parent to the Free_Tier with `status = 'active'`.
6. THE System SHALL ensure exactly one `pricing_tiers` row exists with `amount_cents = 0` designated as the Free_Tier at all times.

---

### Requirement 9: Pricing Tiers — Admin CRUD

**User Story:** As an admin, I want to create, update, and deactivate pricing tiers via a dashboard UI, so that I can manage the product's pricing without code deployments.

#### Acceptance Criteria

1. THE Pricing_Manager SHALL display a list of all `pricing_tiers` rows, showing name, monthly price, yearly price, active status, and feature keys.
2. WHEN an admin submits a valid new tier form, THE Admin_API SHALL insert a new row into `pricing_tiers` and THE Pricing_Manager SHALL reflect the new tier without a full page reload.
3. WHEN an admin submits an updated tier form, THE Admin_API SHALL update the corresponding `pricing_tiers` row and THE Pricing_Manager SHALL reflect the changes without a full page reload.
4. WHEN an admin deactivates a tier, THE Admin_API SHALL set `is_active = false` on the `pricing_tiers` row and THE Pricing_Manager SHALL update the tier's displayed status.
5. IF an admin attempts to delete or deactivate the Free_Tier, THEN THE Admin_API SHALL return a 400 error with the message "Free tier cannot be deactivated" and THE Pricing_Manager SHALL display this error to the admin.
6. THE Admin_API SHALL require a valid `ADMIN_KEY` bearer token for all `/api/admin/pricing` endpoints.
7. WHEN an admin sets `features_json` for a tier, THE Pricing_Manager SHALL present a checklist of known Feature_Keys for selection.

---

### Requirement 10: Pricing Tiers — Feature Gating

**User Story:** As a developer, I want API routes to check a parent's active subscription before allowing premium actions, so that feature access is enforced server-side.

#### Acceptance Criteria

1. WHEN a Parent_API route requires a Feature_Key, THE Parent_API SHALL read the parent's active `parent_subscriptions` row and check whether the Feature_Key is present in `features_snapshot_json`.
2. IF the Feature_Key is not present in the parent's `features_snapshot_json`, THEN THE Parent_API SHALL return a 403 response with a JSON body `{ "error": "feature_not_available", "feature": "<key>" }`.
3. WHEN a parent has no active `parent_subscriptions` row, THE Parent_API SHALL treat the parent as having Free_Tier access.
4. THE System SHALL gate the following actions behind Feature_Keys: `pdf_export` (PDF generation endpoint), `health_score_detailed` (detailed score breakdown), `unlimited_children` (adding more than 1 child).

---

### Requirement 11: Subscription Status Transitions

**User Story:** As a developer, I want subscription status transitions to be strictly controlled, so that subscriptions cannot be reactivated without a new payment.

#### Acceptance Criteria

1. THE System SHALL allow a `parent_subscriptions` status transition from `active` to `expired`.
2. THE System SHALL allow a `parent_subscriptions` status transition from `active` to `cancelled`.
3. IF a request attempts to transition a `parent_subscriptions` status from `expired` or `cancelled` to `active` without a new `payment_id`, THEN THE Parent_API SHALL return a 400 error with the message "Reactivation requires a new payment".
4. WHEN a subscription expires (current datetime ≥ `expires_at`), THE System SHALL update the subscription `status` to `expired` and the parent SHALL retain Free_Tier access.
5. WHEN a parent purchases a new subscription, THE System SHALL create a new `parent_subscriptions` row rather than updating the status of an existing expired or cancelled row.

---

### Requirement 12: Feature Key Immutability on Active Subscriptions

**User Story:** As a developer, I want the feature flags on an active subscription to be immutable, so that mid-cycle tier changes do not affect a parent's current subscription.

#### Acceptance Criteria

1. WHEN an admin updates `features_json` on a `pricing_tiers` row, THE System SHALL NOT modify the `features_snapshot_json` of any existing `parent_subscriptions` rows with `status = 'active'`.
2. THE System SHALL apply updated `features_json` only to new `parent_subscriptions` rows created after the tier update.
3. WHEN a parent's subscription renews, THE System SHALL create a new `parent_subscriptions` row with the tier's current `features_json` as the new `features_snapshot_json`.

---

### Requirement 13: Correctness Properties

**User Story:** As a developer, I want the system's core computations to satisfy verifiable correctness properties, so that edge cases are caught by automated tests.

#### Acceptance Criteria

1. FOR ALL valid combinations of growth, development, habits, and nutrition inputs (including partial data), THE Health_Score_Engine SHALL produce a Health_Score in the range [0, 100] inclusive. *(Property: output bounds)*
2. FOR ALL valid input combinations where all four components have data, the sum of component weights used by THE Health_Score_Engine SHALL equal 100%. *(Property: weight invariant)*
3. FOR ALL children, the set of records included in a PDF generated by THE PDF_Exporter SHALL equal the complete set of records returned by the Parent_API for that child at the time of export — no records SHALL be omitted. *(Property: data completeness)*
4. WHEN an admin updates a tier's `features_json`, THE System SHALL preserve the `features_snapshot_json` of all currently active `parent_subscriptions` unchanged. *(Property: snapshot immutability)*
5. THE System SHALL ensure the Free_Tier exists and has `amount_cents = 0` at all times; no admin action SHALL result in zero active free tiers. *(Property: free tier invariant)*
6. FOR ALL `parent_subscriptions` rows, the `status` field SHALL only transition from `active` → `expired` or `active` → `cancelled`; a transition from `expired` or `cancelled` to `active` SHALL only occur via insertion of a new row with a valid `payment_id`. *(Property: status transition DAG)*
