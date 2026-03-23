# Implementation Plan: WHO Growth Chart

## Overview

Implement the WHO Growth Chart feature by building pure utility functions, embedding WHO percentile data, creating the chart component tree, and wiring it into `ChildDashboard.tsx` to replace the existing `GrowthTracker` number list.

## Tasks

- [x] 1. Create `src/lib/who/interpolate.ts` with pure utility functions
  - Implement `calcAgeMonths(measurementDate, dob)` using 30.4375 days/month
  - Implement `interpolateWho(ageMonths, percentile, series)` with binary search
  - Implement `interpolatePercentile(ageMonths, value, series)` inverting the percentile table
  - Implement `calcBmi(weightKg, heightCm)` returning `weightKg / (heightCm/100)²`
  - Implement `getInterpretationMessage(childName, metric, percentileRank)` per Req 8.4 band mapping
  - Implement `calcXDomain(currentAgeMonths)` returning `[0, currentAgeMonths + 6]`
  - Export a `toChartPoints(records, metric, dob)` helper that filters null values and maps to `ChartPoint[]`
  - _Requirements: 1.7, 3.3, 3.6, 5.4, 8.3, 8.4, 8.6, 9.7, 11.2_

  - [ ]* 1.1 Write unit tests for all pure functions in `src/lib/who/interpolate.test.ts`
    - `calcAgeMonths`: known date pairs including leap years, same-day, month boundaries
    - `interpolateWho`: exact tabulated values, midpoint between rows, out-of-range inputs returning null
    - `interpolatePercentile`: values at each band boundary, below p3, above p97
    - `calcBmi`: standard values, very small/large inputs
    - `getInterpretationMessage`: one example per band, name substitution, all four metrics
    - `calcXDomain`: age 0, age 60, age 228
    - `toChartPoints`: mixed null/non-null records, all-null records, empty array
    - _Requirements: 1.7, 3.3, 3.6, 5.4, 8.4, 8.6, 9.7, 11.2_

  - [ ]* 1.2 Write property test — Property 2: Linear interpolation correctness
    - **Property 2: For any two adjacent rows and fractional age x between them, `interpolateWho` must equal the linear formula within ±1e-9**
    - **Validates: Requirements 1.7**

  - [ ]* 1.3 Write property test — Property 3: Age calculation determinism
    - **Property 3: For any ISO date pair, `calcAgeMonths` returns the same non-negative integer on repeated calls**
    - **Validates: Requirements 3.6, 11.2**

  - [ ]* 1.4 Write property test — Property 5: BMI round-trip
    - **Property 5: For any weightKg > 0 and heightCm > 0, `calcBmi` equals `weightKg / (heightCm/100)²` within ±1e-9**
    - **Validates: Requirements 9.7, 11.1**

  - [ ]* 1.5 Write property test — Property 6: Interpretation message correctness
    - **Property 6: For any child name and percentile rank in [0,100], `getInterpretationMessage` returns a string containing the child's name**
    - **Validates: Requirements 8.4, 8.6**

  - [ ]* 1.6 Write property test — Property 7: Null metric values filtered without error
    - **Property 7: For any array of GrowthRecord with some null metric values, `toChartPoints` returns only non-null entries without throwing**
    - **Validates: Requirements 3.3**

  - [ ]* 1.7 Write property test — Property 8: X-axis domain
    - **Property 8: For any age a ≥ 0, `calcXDomain(a)` returns `[0, a + 6]`**
    - **Validates: Requirements 5.4**

- [x] 2. Create `src/lib/who/who-data.ts` with WHO percentile constants
  - Export `WHO_WEIGHT_MALE` and `WHO_WEIGHT_FEMALE` as `WhoSeries` covering months 0–228
  - Export `WHO_HEIGHT_MALE` and `WHO_HEIGHT_FEMALE` as `WhoSeries` covering months 0–228
  - Export `WHO_HEAD_MALE` and `WHO_HEAD_FEMALE` as `WhoSeries` covering months 0–36 only
  - Export `WHO_BMI_MALE` and `WHO_BMI_FEMALE` as `WhoSeries` covering months 0–228
  - Export `getWhoSeries(metric, sex)` selector function
  - Use WHO Child Growth Standards for months 0–60 and WHO Reference 2007 for months 61–228
  - Each export is a flat array sorted by `month` ascending; no nested objects
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.1 Write property test — Property 1: WHO data covers the full expected age range
    - **Property 1: For any metric in {weight, height, bmi} and sex in {male, female}, the series contains entries for every integer month 0–228; for head, 0–36**
    - **Validates: Requirements 1.3, 1.4, 1.5**

  - [ ]* 2.2 Write property test — Property 4: Dataset selection by age
    - **Property 4: For ages 0–60 the series first entry is month 0 and last ≥ 60; for ages 61–228 the series extends to month 228**
    - **Validates: Requirements 5.1, 5.2**

- [x] 3. Checkpoint — Ensure all tests pass
  - Run `npx vitest --run src/lib/who` and confirm zero failures before proceeding to UI work.
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create `src/components/phr/GrowthChart.tsx` with core component structure
  - Define and export `GrowthChartProps` interface (`childId`, `childName`, `dob`, `sex`, `token`)
  - Define internal types: `Metric`, `GrowthRecord`, `ChartPoint`, `WhoRow`, `WhoSeries`
  - Implement `GrowthChart` component with `useState` for `activeMetric`, `records`, `loading`, `error`, `inlineFormOpen`, `tooltipPoint`
  - Fetch `GET /api/growth?childId=…` on mount using the `token` for auth; handle loading/error states
  - Lazy-import `who-data.ts` and `ChartCanvas` using `React.lazy` + `<Suspense>`
  - Render `MetricTabs`, `<Suspense><ChartCanvas /></Suspense>`, `InterpretationMessage`, and `InlineForm`
  - Show dataset subtitle per Req 6.4 (e.g., "WHO Standards · Boys")
  - Handle `children.gender === 'other' | null` notice per Req 6.3
  - _Requirements: 2.7, 4.1, 4.2, 6.1, 6.2, 6.3, 6.4, 10.2_

- [x] 5. Create `MetricTabs` sub-component
  - Render four pill buttons: Weight | Height | Head | BMI
  - Highlight active tab; fire `onChange` callback on tap
  - Touch target ≥ 44×44px per Req 7.2
  - _Requirements: 4.1, 7.2_

- [x] 6. Create `ChartCanvas`, `PercentileBands`, and `MeasurementLine` sub-components
  - `ChartCanvas` wraps a Recharts `<ResponsiveContainer><ComposedChart>` with the WHO bands and child line
  - `PercentileBands` renders three `<Area>` fills (p3–p15 secondary, p15–p85 primary, p85–p97 secondary) and five `<ReferenceLine>` labels at the right edge
  - `MeasurementLine` renders a `<Line>` with `<Dot>` markers; tap/click on a dot fires `onPointTap`
  - X-axis: age in months using `calcXDomain`; Y-axis: units per metric (kg / cm / kg/m²)
  - Show dataset boundary marker at month 60 when records span both ranges per Req 5.3
  - Show head-circumference-only-to-36-months message per Req 4.3
  - Show BMI-no-records prompt per Req 4.4
  - Support pinch-to-zoom and horizontal swipe pan per Req 7.3, 7.4
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.4, 3.5, 4.3, 4.4, 5.3, 7.1, 7.3, 7.4, 7.5, 10.1, 10.3_

- [x] 7. Create `InterpretationMessage` sub-component
  - Pure display component receiving `childName`, `metric`, `percentileRank`, `recordCount`
  - When `recordCount < 2`, render encouragement message per Req 8.5
  - Otherwise call `getInterpretationMessage` and render the result in a `<p>`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 8. Create `InlineForm` bottom sheet sub-component
  - Fixed-position bottom sheet (`position: fixed; bottom: 0; left: 0; right: 0`)
  - Inputs: date (auto-populated with today's ISO date), height (cm), weight (kg), head circumference (cm)
  - Client-side BMI calculation when both height and weight are provided per Req 9.7
  - POST to `/api/growth` with `Authorization: Bearer <token>`; on success call `onSaved()` and close
  - On POST failure, show inline error and retain entered values per Req 9.5
  - Require at least one metric value before enabling submit per Req 9.4
  - "Add Measurement" button in `GrowthChart` opens this sheet per Req 9.1, 9.2
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 9. Implement downsampling and performance optimisations
  - In `GrowthChart`, after fetching records, downsample to ≤ 100 points when count > 100, preserving the most recent point and all outliers outside p3–p97 per Req 10.5
  - Ensure `who-data.ts` is only imported dynamically (never in the static import graph of `GrowthChart`) per Req 10.2, 10.4
  - _Requirements: 10.2, 10.4, 10.5_

- [x] 10. Replace `GrowthTracker` with `GrowthChart` in `ChildDashboard.tsx`
  - In `src/components/phr/ChildDashboard.tsx`, replace the `<GrowthTracker …>` usage with `<GrowthChart childId={…} childName={…} dob={…} sex={…} token={…} />`
  - Keep `GrowthTracker.tsx` in place as a fallback (referenced in the Recharts dynamic-import error boundary per design error-handling table)
  - Pass all required props from the existing child data already available in `ChildDashboard`
  - _Requirements: 2.7, 6.1, 6.2, 10.2_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Run `npx vitest --run` and confirm zero failures across the full test suite.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property-based tests use `fast-check` (`npm install --save-dev fast-check`)
- Each property test must include the comment `// Feature: who-growth-chart, Property N: <text>`
- WHO data values must be sourced from official WHO Child Growth Standards (0–60 months) and WHO Reference 2007 (61–228 months) tables
- `GrowthTracker.tsx` is retained as an error-boundary fallback; do not delete it
