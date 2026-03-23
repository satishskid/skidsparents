# Requirements Document

## Introduction

Screening Results is the parent-facing view for SKIDS clinical screening data. When clinic staff import screening results into the `screening_imports` table, parents currently have no way to see them. This feature delivers that view at `/dashboard/reports` — the ActionUrl already used by the `screening_alert` notification in the smart-notifications spec.

The view surfaces results from all four SKIDS screening products: Vision (WelchAllyn eye screening), Chatter (developmental), Nutrition, and Symphony (hearing). Results are presented in plain, parent-friendly language — not raw clinical data — with clear status indicators, next-step recommendations, and access to any attached report files.

The feature supports parents with multiple children and is designed mobile-first for Indian parents on the SKIDS Parent PWA.

## Glossary

- **ScreeningResults_Page**: The Astro page rendered at `/dashboard/reports` that hosts the screening results UI.
- **ScreeningResults_API**: The API route at `/api/screening-results` that returns `screening_imports` records for the authenticated parent's children.
- **ScreeningCard**: The React component that renders a single screening result in a parent-friendly format.
- **ScreeningResults_View**: The React component that manages child selection, data fetching, and the list of ScreeningCards.
- **Screening_Import**: A record in the `screening_imports` table representing one completed screening event for a child.
- **Screening_Type**: The category of screening derived from the `dataJson` field — one of: Vision, Chatter, Nutrition, Hearing.
- **Result_Status**: The interpreted outcome of a screening — one of: `normal`, `borderline`, `needs-attention`.
- **Four_D**: The four clinical dimensions stored in `fourDJson`: Defects, Delay, Disability, Deficiency.
- **Summary_Text**: The AI-generated plain-language summary stored in `summaryText` on a Screening_Import record.
- **Report_File**: An attached clinical report file referenced by a URL within `dataJson`.
- **Child_Selector**: The UI control that allows a parent to switch between their children when viewing results.

## Requirements

### Requirement 1: Screening Results API

**User Story:** As a parent, I want to retrieve my children's screening results via a secure API, so that the app can display them in my dashboard.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/screening-results` with a valid Firebase auth token, THE ScreeningResults_API SHALL return all `screening_imports` records for all children belonging to the authenticated parent, ordered by `importedAt` descending.
2. WHEN a GET request is made to `/api/screening-results?childId=<id>` with a valid auth token, THE ScreeningResults_API SHALL return only the Screening_Import records for the specified child.
3. IF the `childId` query parameter references a child that does not belong to the authenticated parent, THEN THE ScreeningResults_API SHALL return HTTP 403.
4. IF a request is made to `/api/screening-results` without a valid auth token, THEN THE ScreeningResults_API SHALL return HTTP 401.
5. WHEN returning Screening_Import records, THE ScreeningResults_API SHALL include the fields: `id`, `childId`, `screeningDate`, `importedAt`, `summaryText`, `fourDJson`, `dataJson`, `campaignCode`.
6. IF a Screening_Import record has no `summaryText`, THEN THE ScreeningResults_API SHALL return `summaryText` as `null` without error.

---

### Requirement 2: Screening Results Page and Route

**User Story:** As a parent, I want to navigate to `/dashboard/reports` and see my child's screening results, so that the notification deep-link takes me to the right place.

#### Acceptance Criteria

1. THE ScreeningResults_Page SHALL be accessible at the path `/dashboard/reports`.
2. WHEN an unauthenticated user navigates to `/dashboard/reports`, THE ScreeningResults_Page SHALL redirect the user to `/login?redirect=/dashboard/reports`.
3. WHEN an authenticated parent navigates to `/dashboard/reports`, THE ScreeningResults_Page SHALL render the ScreeningResults_View component.
4. THE ScreeningResults_Page SHALL be included in the mobile tab bar navigation under a "Reports" label.

---

### Requirement 3: Child Selector

**User Story:** As a parent with multiple children, I want to switch between my children's results, so that I can view each child's screening history separately.

#### Acceptance Criteria

1. WHEN the ScreeningResults_View loads and the parent has more than one child, THE ScreeningResults_View SHALL render a Child_Selector displaying each child's name.
2. WHEN a parent selects a child in the Child_Selector, THE ScreeningResults_View SHALL fetch and display only the Screening_Import records for that child.
3. WHEN the ScreeningResults_View loads and the parent has exactly one child, THE ScreeningResults_View SHALL display that child's results directly without rendering the Child_Selector.
4. WHEN the ScreeningResults_View first loads, THE ScreeningResults_View SHALL default to displaying results for the first child in the parent's children list.

---

### Requirement 4: Results List Grouped by Screening Type

**User Story:** As a parent, I want to see my child's results organised by screening type, so that I can quickly find Vision, Hearing, Developmental, or Nutrition results.

#### Acceptance Criteria

1. WHEN Screening_Import records are displayed, THE ScreeningResults_View SHALL group them by Screening_Type derived from the `dataJson` field, with groups ordered: Vision, Chatter, Nutrition, Hearing.
2. WHEN a Screening_Type group contains at least one Screening_Import record, THE ScreeningResults_View SHALL render a labelled section header with the SKIDS product name (e.g. "SKIDS Vision", "SKIDS Chatter") and its corresponding emoji.
3. WHEN a Screening_Type group has no records for the selected child, THE ScreeningResults_View SHALL not render a section header for that group.
4. WITHIN each Screening_Type group, THE ScreeningResults_View SHALL display records ordered by `screeningDate` descending, with the most recent result first.

---

### Requirement 5: Screening Card — Parent-Friendly Display

**User Story:** As a parent, I want each screening result shown in plain language with a clear status, so that I understand what the result means without medical training.

#### Acceptance Criteria

1. WHEN rendering a ScreeningCard, THE ScreeningCard SHALL display the `screeningDate` formatted as a human-readable date (e.g. "15 Jan 2025").
2. WHEN a Screening_Import has a non-null `summaryText`, THE ScreeningCard SHALL display the `summaryText` as the primary result description.
3. WHEN a Screening_Import has a null `summaryText`, THE ScreeningCard SHALL display a fallback message: "Results recorded. Please consult your SKIDS provider for details."
4. THE ScreeningCard SHALL derive and display the Result_Status from the `fourDJson` field according to the following rule: if all Four_D dimensions are absent or negative, status is `normal`; if any dimension is flagged as a concern, status is `borderline` or `needs-attention` based on severity indicated in `fourDJson`.
5. WHEN the Result_Status is `normal`, THE ScreeningCard SHALL display a green status badge with the label "All Clear".
6. WHEN the Result_Status is `borderline`, THE ScreeningCard SHALL display an amber status badge with the label "Monitor".
7. WHEN the Result_Status is `needs-attention`, THE ScreeningCard SHALL display a red status badge with the label "Follow Up Needed".
8. THE ScreeningCard SHALL display the `campaignCode` as a secondary label when it is non-null, prefixed with "Screening ID:".

---

### Requirement 6: Next Steps and Recommendations

**User Story:** As a parent, I want to see recommended next steps after each result, so that I know what action to take.

#### Acceptance Criteria

1. WHEN the Result_Status is `normal`, THE ScreeningCard SHALL display a next-steps message appropriate to the Screening_Type (e.g. for Vision: "Next vision screening recommended in 12 months.").
2. WHEN the Result_Status is `borderline`, THE ScreeningCard SHALL display a next-steps message advising the parent to monitor and rescreen (e.g. "We recommend a follow-up screening in 3 months.").
3. WHEN the Result_Status is `needs-attention`, THE ScreeningCard SHALL display a next-steps message advising the parent to book a consultation, with a link to the relevant SKIDS intervention page (e.g. `/interventions/vision` for Vision results).
4. THE next-steps messages SHALL be defined per Screening_Type and Result_Status combination and SHALL NOT contain medical diagnoses or clinical terminology.

---

### Requirement 7: Report File Access

**User Story:** As a parent, I want to view or download the original screening report if one is available, so that I can share it with my doctor.

#### Acceptance Criteria

1. WHEN a Screening_Import record contains a report file URL within `dataJson`, THE ScreeningCard SHALL display a "View Report" button.
2. WHEN a parent taps "View Report", THE ScreeningCard SHALL open the report URL in a new browser tab.
3. WHEN a Screening_Import record contains no report file URL, THE ScreeningCard SHALL not render the "View Report" button.
4. IF the report URL is not a valid URL format, THEN THE ScreeningCard SHALL not render the "View Report" button.

---

### Requirement 8: Empty and Loading States

**User Story:** As a parent, I want clear feedback when results are loading or when no results exist yet, so that I am not confused by a blank screen.

#### Acceptance Criteria

1. WHILE the ScreeningResults_View is fetching data from the ScreeningResults_API, THE ScreeningResults_View SHALL display a loading skeleton in place of the results list.
2. WHEN the ScreeningResults_API returns an empty array for the selected child, THE ScreeningResults_View SHALL display an empty state message: "No screening results yet for [child name]. Results will appear here after your child's SKIDS screening."
3. IF the ScreeningResults_API request fails, THEN THE ScreeningResults_View SHALL display an error message: "Unable to load results. Please try again." with a retry button.
4. WHEN the retry button is tapped, THE ScreeningResults_View SHALL re-fetch from the ScreeningResults_API.

---

### Requirement 9: Notification Deep-Link Integration

**User Story:** As a parent who tapped a screening alert notification, I want to land directly on the correct child's results, so that I don't have to navigate manually.

#### Acceptance Criteria

1. WHEN the ScreeningResults_Page is loaded with a `childId` query parameter (e.g. `/dashboard/reports?childId=<id>`), THE ScreeningResults_View SHALL pre-select that child in the Child_Selector and display their results.
2. WHEN the ScreeningResults_Page is loaded with a `childId` query parameter that does not belong to the authenticated parent, THE ScreeningResults_View SHALL ignore the parameter and default to the first child.
3. WHEN the ScreeningResults_Page is loaded with a `screeningId` query parameter, THE ScreeningResults_View SHALL scroll the matching ScreeningCard into view after the results load.
