# Requirements Document

## Introduction

The WHO Growth Chart feature transforms the existing `GrowthTracker` component from a plain number list into an emotionally resonant, interactive chart experience. Parents of children aged 0–19 years can see their child's weight, height, head circumference, and BMI plotted against WHO percentile reference bands — giving them immediate, meaningful context for their child's growth trajectory.

The feature uses WHO Child Growth Standards (0–5 years) and WHO Reference 2007 (5–19 years), with sex-specific curves, embedded as static TypeScript constants (no external API calls). It is built as a mobile-first React component within the existing Astro/Cloudflare Pages PWA.

---

## Glossary

- **Growth_Chart**: The React component that renders WHO percentile bands and child measurement data points on an SVG/canvas chart.
- **WHO_Data**: Static TypeScript constants embedding WHO Child Growth Standards (0–5 years) and WHO Reference 2007 (5–19 years) percentile lookup tables.
- **Percentile_Band**: A shaded region on the chart bounded by two WHO percentile curves (e.g., the band between the 15th and 85th percentile).
- **Measurement_Point**: A single data point plotted on the chart representing one `growth_records` entry for a specific metric on a specific date.
- **Metric**: One of four growth measurements — weight-for-age, height-for-age, head-circumference-for-age, or BMI-for-age.
- **Age_Months**: The child's age expressed in completed months, calculated from `children.dob` and the measurement `date`.
- **Percentile_Rank**: The estimated WHO percentile (3rd, 15th, 50th, 85th, 97th) at which the child's most recent measurement falls, derived by interpolating against WHO_Data.
- **Interpretation_Message**: A short, friendly, parent-facing string describing the child's current Percentile_Rank for a given Metric.
- **Inline_Form**: The measurement entry form rendered within the chart view, allowing parents to add a new `growth_records` entry without navigating away.
- **GrowthTracker**: The existing `src/components/phr/GrowthTracker.tsx` component, which the Growth_Chart replaces or augments.
- **Sex**: The child's biological sex (`male` or `female`) sourced from `children.gender`, used to select the correct WHO_Data table.

---

## Requirements

### Requirement 1: Embed WHO Percentile Reference Data

**User Story:** As a developer, I want WHO percentile data embedded as static TypeScript constants, so that the chart renders without any external API dependency and works offline as a PWA.

#### Acceptance Criteria

1. THE WHO_Data SHALL include percentile values (3rd, 15th, 50th, 85th, 97th) for weight-for-age, height-for-age, head-circumference-for-age, and BMI-for-age.
2. THE WHO_Data SHALL include separate tables for `male` and `female` sex.
3. THE WHO_Data SHALL cover Age_Months 0–60 (inclusive) using WHO Child Growth Standards for all four Metrics.
4. THE WHO_Data SHALL cover Age_Months 61–228 (inclusive) using WHO Reference 2007 for weight-for-age, height-for-age, and BMI-for-age.
5. THE WHO_Data SHALL cover Age_Months 0–36 (inclusive) for head-circumference-for-age, consistent with the WHO standard range for that Metric.
6. THE WHO_Data SHALL be stored as TypeScript constants in `src/lib/who/who-data.ts` and imported at build time with no runtime fetch.
7. WHEN Age_Months falls between two tabulated values, THE Growth_Chart SHALL interpolate linearly to derive the percentile boundary value.

---

### Requirement 2: Render Percentile Band Chart

**User Story:** As a parent, I want to see WHO percentile bands on a chart, so that I can understand the normal range for my child's age and sex.

#### Acceptance Criteria

1. THE Growth_Chart SHALL render five WHO percentile curves (3rd, 15th, 50th, 85th, 97th) as reference lines on the chart for the selected Metric and Sex.
2. THE Growth_Chart SHALL shade the region between the 15th and 85th percentile curves in a visually distinct colour to indicate the typical range.
3. THE Growth_Chart SHALL shade the regions between the 3rd–15th and 85th–97th percentile curves in a secondary colour to indicate borderline ranges.
4. THE Growth_Chart SHALL label each percentile curve with its value (e.g., "50th") at the right edge of the chart.
5. THE Growth_Chart SHALL render the x-axis as age in months (0–60 for 0–5 years view, 61–228 for 5–19 years view).
6. THE Growth_Chart SHALL render the y-axis with units appropriate to the selected Metric (kg for weight, cm for height and head circumference, kg/m² for BMI).
7. THE Growth_Chart SHALL select the correct WHO_Data table based on the child's Sex; WHEN `children.gender` is `other` or absent, THE Growth_Chart SHALL default to displaying both male and female 50th percentile curves with a visible label indicating the ambiguity.

---

### Requirement 3: Plot Child Measurement Data Points

**User Story:** As a parent, I want to see my child's actual measurements plotted on the WHO chart, so that I can see how my child's growth compares to the reference curves over time.

#### Acceptance Criteria

1. THE Growth_Chart SHALL plot each `growth_records` entry as a Measurement_Point on the chart at the correct (Age_Months, metric value) coordinate.
2. THE Growth_Chart SHALL connect consecutive Measurement_Points with a line in chronological order.
3. WHEN a `growth_records` entry has a null value for the selected Metric, THE Growth_Chart SHALL omit that entry from the chart for that Metric without error.
4. THE Growth_Chart SHALL visually distinguish Measurement_Points from the percentile curves (e.g., filled circle markers on the child's line vs. plain reference lines).
5. WHEN a parent taps a Measurement_Point on a touch device, THE Growth_Chart SHALL display a tooltip showing the date, metric value, and estimated Percentile_Rank for that point.
6. THE Growth_Chart SHALL calculate Age_Months for each measurement by computing the difference between `growth_records.date` and `children.dob`, rounding down to completed months.

---

### Requirement 4: Support All Four Growth Metrics

**User Story:** As a parent, I want to switch between weight, height, head circumference, and BMI charts, so that I can monitor all aspects of my child's growth.

#### Acceptance Criteria

1. THE Growth_Chart SHALL provide a tab or segmented control allowing the parent to select one of four Metrics: weight-for-age, height-for-age, head-circumference-for-age, BMI-for-age.
2. WHEN the parent selects a Metric, THE Growth_Chart SHALL re-render the chart with the corresponding WHO_Data and Measurement_Points for that Metric within 300ms.
3. WHEN the selected Metric is head-circumference-for-age and the child's Age_Months exceeds 36, THE Growth_Chart SHALL display a message stating that WHO head circumference reference data is only available up to 36 months and show only the available data range.
4. WHEN the selected Metric is BMI-for-age and the child has no recorded BMI values, THE Growth_Chart SHALL display a prompt explaining that BMI is calculated automatically when both height and weight are recorded.

---

### Requirement 5: Age Range and Dataset Switching

**User Story:** As a parent, I want the chart to automatically use the correct WHO dataset for my child's age, so that I always see clinically accurate reference curves.

#### Acceptance Criteria

1. WHEN the child's current Age_Months is 0–60, THE Growth_Chart SHALL use WHO Child Growth Standards data by default.
2. WHEN the child's current Age_Months is 61–228, THE Growth_Chart SHALL use WHO Reference 2007 data by default.
3. WHEN the child's growth records span both the 0–60 and 61–228 age ranges, THE Growth_Chart SHALL render a continuous chart joining both datasets with a visible marker at the 60-month boundary indicating the dataset transition.
4. THE Growth_Chart SHALL display the age range on the x-axis covering only the range from birth to the child's current age plus 6 months, to avoid showing empty future space beyond a reasonable projection window.

---

### Requirement 6: Sex-Specific Charts

**User Story:** As a parent, I want the chart to use the correct WHO reference curves for my child's sex, so that the comparison is clinically accurate.

#### Acceptance Criteria

1. THE Growth_Chart SHALL load the `male` WHO_Data table when `children.gender` is `male`.
2. THE Growth_Chart SHALL load the `female` WHO_Data table when `children.gender` is `female`.
3. WHEN `children.gender` is `other` or null, THE Growth_Chart SHALL display a notice informing the parent that WHO reference data is sex-specific and invite them to update the child's profile.
4. THE Growth_Chart SHALL display the child's sex and the active WHO dataset name (e.g., "WHO Standards · Boys") in a subtitle below the chart title.

---

### Requirement 7: Mobile-First Responsive Chart

**User Story:** As a parent using a mobile phone, I want the chart to be fully usable on a small screen without horizontal scrolling, so that I can check my child's growth on the go.

#### Acceptance Criteria

1. THE Growth_Chart SHALL render within the full width of its container with no horizontal overflow on viewports 320px wide and above.
2. THE Growth_Chart SHALL use a touch-friendly tap target of at least 44×44px for Measurement_Points and interactive controls.
3. THE Growth_Chart SHALL support pinch-to-zoom on the chart area to allow parents to inspect dense data regions on small screens.
4. THE Growth_Chart SHALL support horizontal swipe within the chart area to pan along the age axis when the chart is zoomed in.
5. THE Growth_Chart SHALL render legibly at 1x and 2x pixel density (standard and retina displays) using SVG or canvas rendering.
6. THE Growth_Chart SHALL not depend on hover interactions as the primary means of accessing data; all information accessible via hover SHALL also be accessible via tap.

---

### Requirement 8: Contextual Percentile Interpretation

**User Story:** As a parent, I want to see a friendly message telling me which percentile band my child is in, so that I understand what the chart means without needing medical training.

#### Acceptance Criteria

1. THE Growth_Chart SHALL calculate the Percentile_Rank for the child's most recent Measurement_Point for the selected Metric by interpolating against WHO_Data.
2. THE Growth_Chart SHALL display an Interpretation_Message below the chart summarising the child's current Percentile_Rank for the selected Metric.
3. THE Interpretation_Message SHALL use warm, non-alarming language for all percentile ranges; it SHALL NOT use clinical terms such as "underweight", "obese", or "failure to thrive".
4. THE Interpretation_Message SHALL follow this mapping:
   - Below 3rd percentile: "Your child's [metric] is below the typical range. Consider discussing this with your paediatrician at the next visit."
   - 3rd–15th percentile: "Your child is on the smaller side but within the WHO reference range — every child grows at their own pace."
   - 15th–85th percentile: "Your child's [metric] is right in the typical range. Keep up the great work."
   - 85th–97th percentile: "Your child is on the larger side but within the WHO reference range — growth patterns vary widely."
   - Above 97th percentile: "Your child's [metric] is above the typical range. Consider discussing this with your paediatrician at the next visit."
5. WHEN the child has fewer than 2 Measurement_Points for the selected Metric, THE Growth_Chart SHALL display an Interpretation_Message encouraging the parent to add more measurements to see a trend.
6. THE Interpretation_Message SHALL reference the child's first name (sourced from `children.name`) to make the message personal.

---

### Requirement 9: Inline Measurement Entry

**User Story:** As a parent, I want to add a new measurement directly from the chart view, so that I can record a measurement and immediately see it plotted without navigating away.

#### Acceptance Criteria

1. THE Growth_Chart SHALL include an "Add Measurement" button visible within the chart view.
2. WHEN the parent taps "Add Measurement", THE Growth_Chart SHALL display the Inline_Form as a bottom sheet or modal overlay without navigating to a new page.
3. THE Inline_Form SHALL accept date, height (cm), weight (kg), and head circumference (cm) as inputs, matching the fields in `growth_records`.
4. WHEN the parent submits the Inline_Form with at least one metric value provided, THE Growth_Chart SHALL POST to `/api/growth` and, on success, re-fetch and re-render the chart with the new Measurement_Point visible within 1 second.
5. IF the POST to `/api/growth` fails, THEN THE Growth_Chart SHALL display an error message within the Inline_Form and retain the entered values so the parent can retry.
6. THE Inline_Form SHALL auto-populate the date field with today's date in ISO format.
7. WHEN height and weight are both provided in the Inline_Form submission, THE Growth_Chart SHALL calculate BMI as `weight_kg / (height_m ^ 2)` and include it in the POST payload.

---

### Requirement 10: Chart Library and Performance

**User Story:** As a developer, I want the chart to use a lightweight, React 18-compatible charting library, so that the PWA bundle size stays small and the chart renders smoothly on mid-range Android devices.

#### Acceptance Criteria

1. THE Growth_Chart SHALL use Recharts or a pure SVG implementation; no charting library with a peer dependency incompatible with React 18 SHALL be introduced.
2. THE Growth_Chart SHALL lazy-load the charting library and WHO_Data using dynamic import so that the initial page bundle is not increased by more than 50 KB (gzipped).
3. THE Growth_Chart SHALL render the initial chart frame within 500ms on a mid-range Android device on a 4G connection, measured from when the component mounts with data already available.
4. THE WHO_Data constants SHALL be tree-shakeable; only the data for the active Metric and Sex SHALL be loaded into memory at runtime.
5. WHEN the `growth_records` API response contains more than 100 data points, THE Growth_Chart SHALL downsample the displayed Measurement_Points to a maximum of 100 while preserving the most recent point and all clinically significant outliers (points outside the 3rd–97th percentile range).

---

### Requirement 11: Round-Trip Data Integrity

**User Story:** As a developer, I want growth record data to survive a full save-and-reload cycle without loss or distortion, so that parents always see accurate historical data.

#### Acceptance Criteria

1. FOR ALL valid `growth_records` entries, saving a measurement via the Inline_Form and then fetching the records list SHALL return a record with values equal to the submitted values within floating-point precision (±0.01).
2. THE Growth_Chart SHALL correctly re-derive Age_Months from `growth_records.date` and `children.dob` on every render, producing the same Age_Months value for the same date pair regardless of the order records are fetched.
3. WHEN the same measurement date is submitted twice for the same child, THE Growth_Chart SHALL display both records as distinct Measurement_Points (no silent deduplication).
