# Tasks — Screening Results

## Task List

- [x] 1. Create screening utility library
  - [x] 1.1 Create `src/lib/phr/screening-utils.ts` with all exported types and pure functions: `deriveScreeningType`, `deriveStatus`, `extractReportUrl`, `getNextStepsMessage`, `getInterventionLink`, `formatScreeningDate`, `groupAndSortRecords`, `resolveInitialChild`, `SCREENING_TYPE_CONFIG`, `SCREENING_TYPE_ORDER`
  - [x] 1.2 Write unit tests in `src/lib/phr/screening-utils.test.ts` covering all edge cases listed in the Testing Strategy section

- [x] 2. Write property-based tests for screening utilities
  - [x] 2.1 Write property test for Property 4: Status derivation from fourDJson
  - [x] 2.2 Write property test for Property 5: Grouping and ordering by Screening_Type
  - [x] 2.3 Write property test for Property 6: Next-steps lookup table completeness
  - [x] 2.4 Write property test for Property 7: Report URL button visibility
  - [x] 2.5 Write property test for Property 8: Deep-link child pre-selection
  - [x] 2.6 Write property test for Property 10: Date formatting produces human-readable output

- [x] 3. Create the ScreeningResults API route
  - [x] 3.1 Create `src/pages/api/screening-results.ts` with `export const prerender = false`, GET handler using `getParentId` auth pattern, optional `?childId=` filter, child ownership check returning 403, and query returning the required fields ordered by `imported_at` descending

- [x] 4. Create the ScreeningCard component
  - [x] 4.1 Create `src/components/phr/ScreeningCard.tsx` rendering: formatted date, status badge (green/amber/red with correct labels), summaryText or fallback message, next-steps message, intervention link for needs-attention status, campaignCode label, and conditional "View Report" button

- [x] 5. Create the ScreeningResults_View component
  - [x] 5.1 Create `src/components/phr/ScreeningResultsView.tsx` with child selector (horizontal scrollable pill tabs, hidden for single child), fetch logic for `/api/children` and `/api/screening-results`, loading skeleton, empty state, error state with retry button, grouped sections by Screening_Type, and deep-link scroll-to on `initialScreeningId`

- [x] 6. Create the reports page
  - [x] 6.1 Create `src/pages/dashboard/reports.astro` as an SSR page that checks Firebase session server-side, redirects unauthenticated users to `/login?redirect=/dashboard/reports`, and renders `ScreeningResultsView` with `initialChildId` and `initialScreeningId` from URL search params

- [x] 7. Add Reports tab to MobileTabBar
  - [x] 7.1 Add a "Reports" tab entry to `src/components/common/MobileTabBar.astro` with path `/dashboard/reports`, a chart/document icon, and active state matching `p.startsWith('/dashboard/reports')`
