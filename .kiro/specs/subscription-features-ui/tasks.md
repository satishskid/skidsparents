# Implementation Plan: subscription-features-ui

## Overview

Implement three user-facing capabilities on top of the existing `growth-monetisation` pricing infrastructure: subscription management UI, health score detailed view, and teleconsult discount display. Tasks are ordered: pure functions + tests first, then API, then components, then integration. Commit after each logical phase.

## Tasks

- [x] 1. Implement pure pricing utility functions
  - [x] 1.1 Create `src/lib/pricing/discount.ts` with `computeDiscountedPrice`, `parseDiscountPct`, and `serializeDiscountPct`
    - `computeDiscountedPrice(priceCents, discountPct)` returns `Math.floor(priceCents * (1 - discountPct / 100))`
    - `parseDiscountPct(features)` matches `"teleconsult_discount_pct:N"`, returns N if in [0,100], else 0
    - `serializeDiscountPct(n)` returns `"teleconsult_discount_pct:${Math.round(n)}"`
    - _Requirements: 6.2, 6.3, 6.5, 7.3, 9.3, 9.4, 9.5_

  - [ ]* 1.2 Write unit tests for discount utilities in `src/lib/pricing/discount.test.ts`
    - `computeDiscountedPrice(10000, 20)` → `8000`; `(10000, 0)` → `10000`; `(10000, 100)` → `0`; `(999, 33)` → `669`
    - `parseDiscountPct(['teleconsult_discount_pct:20'])` → `20`; `([])` → `0`; `(['teleconsult_discount_pct:abc'])` → `0`; `(['teleconsult_discount_pct:150'])` → `0`
    - `serializeDiscountPct(20)` → `'teleconsult_discount_pct:20'`
    - _Requirements: 6.2, 6.3, 6.5, 7.3_

  - [ ]* 1.3 Write property test: discount config round-trip (Property 4)
    - `// Feature: subscription-features-ui, Property 4: Discount config round-trip`
    - `fc.integer({ min: 0, max: 100 })` → assert `parseDiscountPct([serializeDiscountPct(N)]) === N`
    - _Requirements: 6.2, 6.3, 9.5_

  - [ ]* 1.4 Write property tests: discount computation bounds and identity (Property 5)
    - `// Feature: subscription-features-ui, Property 5: Discount computation bounds and identity`
    - Bounds: `fc.tuple(fc.integer({ min: 0 }), fc.integer({ min: 0, max: 100 }))` with `{ numRuns: 500 }` → assert `0 ≤ result ≤ priceCents`
    - Identity: `fc.integer({ min: 0 })` → assert `computeDiscountedPrice(p, 0) === p`
    - Annihilation: `fc.integer({ min: 0 })` → assert `computeDiscountedPrice(p, 100) === 0`
    - _Requirements: 7.3, 9.3, 9.4_

- [ ] 2. Checkpoint — commit phase 1
  - Ensure all tests pass, ask the user if questions arise.
  - Git commit: `feat: add computeDiscountedPrice, parseDiscountPct, serializeDiscountPct with tests`

- [x] 3. Implement `POST /api/subscriptions/cancel` endpoint
  - [x] 3.1 Create `src/pages/api/subscriptions/cancel.ts`
    - Authenticate via `getParentId(request, env)`; return 401 if unauthenticated
    - Query most recent `active` row for parent (`ORDER BY created_at DESC LIMIT 1`)
    - Return 400 `{ error: 'no_active_subscription' }` if none found
    - `UPDATE parent_subscriptions SET status = 'cancelled' WHERE id = ? AND parent_id = ? AND status = 'active'`
    - Return 200 `{ ok: true }` on success; 500 on DB error
    - _Requirements: 2.4, 2.6, 2.7, 3.1, 3.2, 3.3_

  - [ ]* 3.2 Write unit tests for cancel endpoint in `src/pages/api/subscriptions/cancel.test.ts`
    - Unauthenticated request → 401
    - No active subscription → 400 `{ error: 'no_active_subscription' }`
    - Active subscription → 200 `{ ok: true }`, status updated to `'cancelled'`
    - Row with `status = 'expired'` → 400, row unchanged
    - _Requirements: 2.4, 2.6, 2.7, 3.1_

  - [ ]* 3.3 Write property test: cancel column isolation (Property 1)
    - `// Feature: subscription-features-ui, Property 1: Cancel column isolation`
    - Generate random subscription rows with `fc.record`; after cancel, assert only `status` changed and all other columns are byte-for-byte identical
    - `fc.constantFrom('expired', 'cancelled')` as initial status → assert 400 returned and row unchanged
    - _Requirements: 3.1, 3.2, 9.1_

- [ ] 4. Checkpoint — commit phase 2
  - Ensure all tests pass, ask the user if questions arise.
  - Git commit: `feat: add POST /api/subscriptions/cancel endpoint with tests`

- [x] 5. Implement `SubscriptionCard` component
  - [x] 5.1 Create `src/components/subscription/SubscriptionCard.tsx`
    - Accept `token: string` prop; fetch from `GET /api/subscriptions/me`
    - Loading state: skeleton placeholder; error state: error banner + retry button
    - Loaded state: tier name (or "Free Plan"), billing cycle badge, expiry formatted as `DD MMM YYYY` (or "—"), feature pills using a `FEATURE_LABELS` map
    - Show "Cancel Plan" button only when `subscription !== null && subscription.status === 'active'`
    - Cancel flow: inline confirmation → `POST /api/subscriptions/cancel` → on success refetch; on error show inline error
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.5, 2.8_

  - [ ]* 5.2 Write unit tests for `SubscriptionCard` in `src/components/subscription/SubscriptionCard.test.tsx`
    - `subscription = null` → renders "Free Plan"
    - `subscription.status = 'active'` → renders "Cancel Plan" button
    - `subscription.status = 'cancelled'` → does not render "Cancel Plan" button
    - Expiry date formatted correctly from ISO string
    - Loading state renders skeleton; error state renders retry button
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.8_

- [x] 6. Integrate `SubscriptionCard` into `UserProfile.tsx`
  - Import and render `<SubscriptionCard token={token} />` between the profile card and the children section
  - Render only when `token` is available
  - _Requirements: 1.1, 1.4_

- [ ] 7. Checkpoint — commit phase 3
  - Ensure all tests pass, ask the user if questions arise.
  - Git commit: `feat: add SubscriptionCard component and integrate into UserProfile`

- [x] 8. Update `HealthScoreGauge` with detailed view
  - [x] 8.1 Add `features?: string[]` prop to `HealthScoreGauge` in `src/components/phr/HealthScoreGauge.tsx`
    - Default `features` to `[]`
    - When `features.includes('health_score_detailed')` AND `data.components` has at least one key, render Detailed View below the existing ring
    - Detailed View: for each key in `data.components`, render a labelled progress bar using `COMPONENT_LABELS` (`growth`, `development`, `habits`, `nutrition`), numeric score, color from `getScoreColor(score)`, and `aria-label="${label} score: ${score} out of 100"`
    - Omit components absent from `data.components`; do not show zero placeholders
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

  - [x]* 8.2 Write property test: feature gate determinism (Property 2)
    - `// Feature: subscription-features-ui, Property 2: Feature gate determinism`
    - `fc.array(fc.string())` with and without `'health_score_detailed'` → assert Detailed View rendered iff feature present
    - _Requirements: 4.1, 4.2, 9.2_

  - [x]* 8.3 Write property test: component rendering completeness (Property 3)
    - `// Feature: subscription-features-ui, Property 3: Component rendering completeness`
    - `fc.record` with optional component score fields in [0,100] → assert rendered labels equal exactly the keys present in `components`
    - _Requirements: 4.4, 5.1, 5.2_

- [x] 9. Pass `features` prop to `HealthScoreGauge` in `ChildDashboard.tsx`
  - `ChildDashboard` already fetches `features` from `GET /api/subscriptions/me`; pass it as `features={features}` to `<HealthScoreGauge>`
  - _Requirements: 4.1, 4.3_

- [ ] 10. Checkpoint — commit phase 4
  - Ensure all tests pass, ask the user if questions arise.
  - Git commit: `feat: add HealthScoreGauge detailed view with feature gating`

- [x] 11. Add teleconsult discount display to `BookingFlow`
  - [x] 11.1 Fetch parent features in `BookingFlow.tsx` from `GET /api/subscriptions/me` after auth
    - Store `features: string[]` in component state
    - Compute `discountPct = parseDiscountPct(features)` and `discountedPriceCents = computeDiscountedPrice(service.priceCents, discountPct)` for the selected service
    - _Requirements: 7.1, 7.2, 7.5, 8.1, 8.3_

  - [x] 11.2 Update `ServiceSelector` in `BookingFlow.tsx` to show discounted price for teleconsult services
    - Accept `discountPct` prop; for services where `deliveryType === 'telehealth'` or `category === 'consultation'` and `discountPct > 0`: show original price with strikethrough + discounted price in green
    - When `discountPct === 0`: show original price only
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 11.3 Update `OrderSummary` in `BookingFlow.tsx` to show discounted price
    - Accept `discountPct` prop; display `computeDiscountedPrice(service.priceCents, discountPct)` as the payable amount when `discountPct > 0`
    - Pass `discountPct` to the order creation API call in `PaymentGate` so `amount_cents` reflects the discounted price
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 12. Update `PricingManager` with teleconsult discount input
  - [x] 12.1 Add `discountPct` state to `TierForm` in `src/components/admin/PricingManager.tsx`
    - Initialise from `parseDiscountPct(initial.features)` using the new utility
    - Show a numeric input (0–100) when `teleconsult_discount_pct` is checked in the features list
    - Inline validation: if checked and value outside [0,100], show `"Discount must be between 0 and 100"` and block save
    - On save, replace any existing `teleconsult_discount_pct:*` entry in features with `serializeDiscountPct(discountPct)` before calling `onSave`
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 13. Final checkpoint — commit phase 5
  - Ensure all 383+ tests pass, ask the user if questions arise.
  - Git commit: `feat: teleconsult discount in BookingFlow and PricingManager`

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use `fc.assert(fc.property(...))` from fast-check with default 100 runs; discount bounds use `{ numRuns: 500 }`
- Each property test must include the tag comment: `// Feature: subscription-features-ui, Property N: <title>`
- The services listing at `/services` is a static Astro page using `@/lib/content/services` — discount display is only needed in the dynamic `BookingFlow` component
- No DB migrations required; all changes use existing tables
