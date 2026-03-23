# Tasks — Screening Results

## Task List

- [ ] 1. Create screening utility library
  - [ ] 1.1 Create `src/lib/phr/screening-utils.ts` with all exported types and pure functions: `deriveScreeningType`, `deriveStatus`, `extractReportUrl`, `getNextStepsMessage`, `getInterventionLink`, `formatScreeningDate`, `groupAndSortRecords`, `resolveInitialChild`, `SCREENING_TYPE_CONFIG`, `SCREENING_TYPE_ORDER`
  - [ ] 1.2 Write unit tests in `src/lib/phr/screening-utils.test.ts` covering all edge cases listed in the Testing Strategy section

- [ ] 2. Write property-based tests for screening utilities
  - [ ] 2.1 Write property test for Property 4: Status derivation from fourDJson
  - [ ] 2.2 Write property test for Property 5: Grouping and ordering by Screening_Type
  - [ ] 2.3 Write property test for Property 6: Next-steps lookup table completeness
  - [ ] 2.4 Write property test for Property 7: Report URL button visibility
  - [ ] 2.5 Write property test for Property 8: Deep-link child pre-selection
  - [ ] 2.6 Write property test for Property 10: Date formatting produces human-readable output

- [ ] 3. Create the ScreeningResults API route
  - [ ] 3.1 Create `src/pages/api/screening-results.ts` with `export const prerender = false`, GET handler using `getParentId` auth pattern, optional `?childId=` filter, child ownership check returning 403, and query returning the required fields ordered by `imported_at` descending

- [ ] 4. Create the ScreeningCard component
  - [ ] 4.1 Create `src/components/phr/ScreeningCard.tsx` rendering: formatted date, status badge (green/amber/red with correct labels), summaryText or fallback message, next-steps message, intervention link for needs-attention status, campaignCode label, and conditional "View Report" button

- [ ] 5. Create the ScreeningResults_View component
  - [ ] 5.1 Create `src/components/phr/ScreeningResultsView.tsx` with child selector (horizontal scrollable pill tabs, hidden for single child), fetch logic for `/api/children` and `/api/screening-results`, loading skeleton, empty state, error state with retry button, grouped sections by Screening_Type, and deep-link scroll-to on `initialScreeningId`

- [ ] 6. Create the reports page
  - [ ] 6.1 Create `src/pages/dashboard/reports.astro` as an SSR page that checks Firebase session server-side, redirects unauthenticated users to `/login?redirect=/dashboard/reports`, and renders `ScreeningResultsView` with `initialChildId` and `initialScreeningId` from URL search params

- [ ] 7. Add Reports tab to MobileTabBar
  - [ ] 7.1 Add a "Reports" tab entry to `src/components/common/MobileTabBar.astro` with path `/dashboard/reports`, a chart/document icon, and active state matching `p.startsWith('/dashboard/reports')`
