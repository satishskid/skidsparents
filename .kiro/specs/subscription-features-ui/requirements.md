# Requirements Document

## Introduction

The `subscription-features-ui` feature builds three user-facing capabilities on top of the existing `growth-monetisation` pricing infrastructure (already implemented):

1. **Subscription Management UI** — Parents can view their current plan (tier name, billing cycle, expiry date, feature list) and cancel it from their profile page. A new `POST /api/subscriptions/cancel` endpoint sets the subscription status to `cancelled`.
2. **Health Score Detailed View** — When a parent has the `health_score_detailed` feature key, the `HealthScoreGauge` expands to show a breakdown of the four component scores (growth, development, habits, nutrition) alongside the composite score. Parents without the feature see only the existing composite gauge.
3. **Teleconsult Discount** — When a parent has the `teleconsult_discount_pct` feature key, telehealth/teleconsult services in the marketplace and booking flow display a discounted price. The discount percentage is stored as a numeric value in the tier's `features_json` (e.g. `"teleconsult_discount_pct:20"`). Admins can set the percentage per tier via the existing `PricingManager`.

Stack: Astro 5 + React + Cloudflare Workers + D1 SQLite + Drizzle ORM + Firebase Auth. All server code runs in the Workers runtime (no Node.js-only APIs). Tests use Vitest + fast-check.

---

## Glossary

- **Subscription_Card**: The React component rendered inside `UserProfile.tsx` that displays the parent's active plan details and the cancel action.
- **Cancel_Endpoint**: The new `POST /api/subscriptions/cancel` Worker API route that sets the calling parent's active subscription status to `cancelled`.
- **Active_Subscription**: A `parent_subscriptions` row with `status = 'active'` for the authenticated parent.
- **Health_Score_Gauge**: The existing `src/components/phr/HealthScoreGauge.tsx` component that renders the composite health score ring.
- **Detailed_View**: The expanded mode of the Health_Score_Gauge that renders individual component scores when the `health_score_detailed` feature key is present.
- **Component_Score**: One of the four sub-scores (growth, development, habits, nutrition) returned in `components` by `GET /api/children/:childId/health-score`.
- **Teleconsult_Service**: A `services` row with `delivery_type = 'telehealth'` or `category = 'consultation'`.
- **Discount_Pct**: The numeric discount percentage (0–100) stored alongside the `teleconsult_discount_pct` feature key in a tier's `features_json` as `"teleconsult_discount_pct:N"` where N is an integer.
- **Discounted_Price**: `floor(original_price_cents * (1 - Discount_Pct / 100))`, always in the range [0, original_price_cents].
- **Pricing_Manager**: The existing React component at `src/components/admin/PricingManager.tsx` for admin CRUD of pricing tiers.
- **Feature_Key**: A string identifier that gates access to a premium capability, stored in `features_snapshot_json`.
- **Parent_API**: Cloudflare Worker API routes authenticated via Firebase Auth using `getParentId(request, env)`.
- **Free_Tier**: The `pricing_tiers` row with `amount_cents = 0`; parents with no active subscription fall back to this.

---

## Requirements

### Requirement 1: Subscription Plan Display

**User Story:** As a parent, I want to see my current subscription plan details on my profile page, so that I know what tier I am on, when it expires, and what features I have access to.

#### Acceptance Criteria

1. WHEN an authenticated parent visits `/me`, THE Subscription_Card SHALL display the tier name, billing cycle (`monthly` or `yearly`), expiry date (formatted as a human-readable date), and the list of Feature_Keys included in the Active_Subscription.
2. WHEN a parent has no Active_Subscription row, THE Subscription_Card SHALL display "Free Plan" with the Free_Tier feature list.
3. WHEN subscription data is loading, THE Subscription_Card SHALL display a skeleton placeholder.
4. THE Subscription_Card SHALL fetch subscription data from `GET /api/subscriptions/me` using the parent's Firebase auth token.
5. IF the `GET /api/subscriptions/me` request fails, THEN THE Subscription_Card SHALL display an error message and a retry action.

---

### Requirement 2: Subscription Cancellation

**User Story:** As a parent, I want to cancel my subscription from my profile page, so that I can stop being billed at the end of my current cycle.

#### Acceptance Criteria

1. WHEN an authenticated parent has an Active_Subscription, THE Subscription_Card SHALL display a "Cancel Plan" button.
2. WHEN a parent clicks "Cancel Plan", THE Subscription_Card SHALL display a confirmation dialog before proceeding.
3. WHEN a parent confirms cancellation, THE Subscription_Card SHALL call `POST /api/subscriptions/cancel` with the parent's Firebase auth token.
4. WHEN the Cancel_Endpoint receives a valid authenticated request, THE Cancel_Endpoint SHALL set the parent's Active_Subscription `status` to `cancelled` and return `200 { "ok": true }`.
5. WHEN cancellation succeeds, THE Subscription_Card SHALL update to reflect the cancelled state and hide the "Cancel Plan" button.
6. IF the parent has no Active_Subscription, THEN THE Cancel_Endpoint SHALL return `400 { "error": "no_active_subscription" }`.
7. IF the Cancel_Endpoint request is unauthenticated, THEN THE Cancel_Endpoint SHALL return `401 { "error": "Unauthorized" }`.
8. WHEN a parent has no Active_Subscription, THE Subscription_Card SHALL NOT display the "Cancel Plan" button.

---

### Requirement 3: Cancel Endpoint — Status Transition

**User Story:** As a developer, I want the cancel endpoint to enforce valid status transitions, so that subscription state remains consistent.

#### Acceptance Criteria

1. THE Cancel_Endpoint SHALL only transition a subscription from `active` to `cancelled`; it SHALL NOT modify subscriptions with `status = 'expired'` or `status = 'cancelled'`.
2. WHEN the Cancel_Endpoint successfully cancels a subscription, THE Cancel_Endpoint SHALL update only the `status` column of the target row; all other columns (including `features_snapshot_json`, `expires_at`, `billing_cycle`) SHALL remain unchanged.
3. THE Cancel_Endpoint SHALL cancel the most recently created Active_Subscription row for the authenticated parent (ordered by `created_at DESC`).

---

### Requirement 4: Health Score Detailed View — Feature Gating

**User Story:** As a parent on a premium plan, I want to see a breakdown of my child's health score components, so that I can understand which areas need attention.

#### Acceptance Criteria

1. WHERE the `health_score_detailed` Feature_Key is present in the parent's active `features_snapshot_json`, THE Health_Score_Gauge SHALL render in Detailed_View mode showing individual Component_Scores alongside the composite score.
2. WHERE the `health_score_detailed` Feature_Key is absent from the parent's active `features_snapshot_json`, THE Health_Score_Gauge SHALL render only the composite score ring (existing behaviour).
3. THE Health_Score_Gauge SHALL accept a `features` prop (string array) to determine whether to render in Detailed_View mode.
4. WHEN the `health_score_detailed` Feature_Key is present and the API response includes `components`, THE Health_Score_Gauge SHALL display each available Component_Score with its label (Growth, Development, Habits, Nutrition).

---

### Requirement 5: Health Score Detailed View — Component Display

**User Story:** As a parent, I want each component score to be visually distinct and labelled, so that I can quickly identify which area is strongest or weakest.

#### Acceptance Criteria

1. WHEN rendering in Detailed_View mode, THE Health_Score_Gauge SHALL display each present Component_Score as a labelled bar or mini-gauge with a numeric value in [0, 100].
2. WHEN a Component_Score is absent from the API response (e.g. no growth data), THE Health_Score_Gauge SHALL omit that component from the Detailed_View rather than showing a zero or placeholder.
3. WHEN rendering in Detailed_View mode, THE Health_Score_Gauge SHALL apply the same color coding as the composite gauge: red for scores < 40, amber for 40–69, green for ≥ 70.
4. THE Health_Score_Gauge SHALL remain accessible: each component bar or gauge SHALL have an accessible label readable by screen readers.

---

### Requirement 6: Teleconsult Discount — Storage and Configuration

**User Story:** As an admin, I want to set a teleconsult discount percentage per pricing tier, so that I can offer different discount levels to different subscriber tiers.

#### Acceptance Criteria

1. THE Pricing_Manager SHALL allow an admin to enter a numeric discount percentage (0–100) for the `teleconsult_discount_pct` feature when editing or creating a tier.
2. THE System SHALL store the discount percentage as part of the tier's `features_json` in the format `"teleconsult_discount_pct:N"` where N is an integer in [0, 100].
3. WHEN a tier's `features_json` contains `"teleconsult_discount_pct:N"`, THE System SHALL parse N as the Discount_Pct for that tier.
4. IF an admin enters a Discount_Pct outside the range [0, 100], THEN THE Pricing_Manager SHALL display a validation error and SHALL NOT save the tier.
5. WHEN a tier does not include `teleconsult_discount_pct` in its `features_json`, THE System SHALL treat the Discount_Pct as 0 (no discount).

---

### Requirement 7: Teleconsult Discount — Price Display

**User Story:** As a parent with a teleconsult discount, I want to see the discounted price on telehealth services before booking, so that I know the actual amount I will pay.

#### Acceptance Criteria

1. WHEN a parent with the `teleconsult_discount_pct` Feature_Key views a Teleconsult_Service listing, THE Service_Listing SHALL display both the original price and the Discounted_Price.
2. WHEN a parent without the `teleconsult_discount_pct` Feature_Key views a Teleconsult_Service listing, THE Service_Listing SHALL display only the original price (no discount UI).
3. THE Discounted_Price SHALL be computed as `floor(original_price_cents * (1 - Discount_Pct / 100))` and displayed in the same currency as the original price.
4. THE Service_Listing SHALL visually distinguish the Discounted_Price from the original price (e.g. strikethrough on original, highlighted discounted price).
5. WHEN the Discount_Pct is 0, THE Service_Listing SHALL display only the original price with no discount UI, even if the feature key is present.

---

### Requirement 8: Teleconsult Discount — Booking Flow

**User Story:** As a parent with a teleconsult discount, I want the discounted price to be reflected in the booking confirmation, so that I am charged the correct amount.

#### Acceptance Criteria

1. WHEN a parent with the `teleconsult_discount_pct` Feature_Key initiates a booking for a Teleconsult_Service, THE Booking_Flow SHALL display the Discounted_Price in the order summary.
2. THE Booking_Flow SHALL pass the Discount_Pct to the order creation API so that the `amount_cents` stored in `service_orders` reflects the Discounted_Price.
3. WHEN a parent without the `teleconsult_discount_pct` Feature_Key initiates a booking, THE Booking_Flow SHALL use the full `priceCents` from the `services` table with no discount applied.

---

### Requirement 9: Correctness Properties

**User Story:** As a developer, I want the system's core computations to satisfy verifiable correctness properties, so that edge cases are caught by automated tests.

#### Acceptance Criteria

1. FOR ALL valid `parent_subscriptions` rows with `status = 'active'`, after a successful call to the Cancel_Endpoint, the row's `status` SHALL equal `'cancelled'` and all other columns SHALL be unchanged. *(Property: cancel idempotence and column isolation)*
2. FOR ALL feature arrays, if the array contains `health_score_detailed` then the Detailed_View SHALL be rendered; if the array does not contain `health_score_detailed` then only the composite view SHALL be rendered. *(Property: feature gate determinism)*
3. FOR ALL integers `priceCents` ≥ 0 and `discountPct` in [0, 100], the Discounted_Price SHALL satisfy `0 ≤ Discounted_Price ≤ priceCents`. *(Property: discount bounds)*
4. FOR ALL integers `discountPct` in [0, 100], `computeDiscountedPrice(price, 0)` SHALL equal `price` and `computeDiscountedPrice(price, 100)` SHALL equal `0`. *(Property: discount identity and annihilation)*
5. FOR ALL `teleconsult_discount_pct:N` strings where N is an integer in [0, 100], parsing then re-serialising SHALL produce the original string. *(Property: discount config round-trip)*
