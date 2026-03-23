# Design Document — WHO Growth Chart

## Overview

The WHO Growth Chart feature replaces the plain number list in `GrowthTracker.tsx` with an interactive, percentile-band chart. Parents see their child's weight, height, head circumference, and BMI plotted against WHO reference curves, with a friendly interpretation message and an inline form to add new measurements.

The implementation is entirely client-side: WHO data is embedded as static TypeScript constants (no external API), the chart is rendered with Recharts (React 18 compatible, SVG output), and the existing `/api/growth` endpoint is reused unchanged. The component is lazy-loaded to keep the initial bundle small.

Key design decisions:
- **Recharts** over Victory/Chart.js: React 18 peer dep, composable SVG primitives, good tree-shaking, ~40 KB gzipped.
- **Static TS constants** over JSON fetch: works offline (PWA), tree-shakeable per metric+sex, zero latency.
- **Linear interpolation** between tabulated WHO values: sufficient accuracy for clinical reference display; WHO tables are already at 1-month intervals for 0–60 months.
- **Bottom sheet** for inline form: avoids navigation, keeps chart visible, familiar mobile pattern.
- **GrowthChart wraps GrowthTracker**: `GrowthTracker.tsx` is replaced by `GrowthChart.tsx`; the old component is kept as a fallback during the transition.

---

## Architecture

```mermaid
graph TD
    A[ChildDashboard.tsx] -->|lazy import| B[GrowthChart.tsx]
    B --> C[MetricTabs]
    B --> D[PercentileBands]
    B --> E[MeasurementLine]
    B --> F[InterpretationMessage]
    B --> G[InlineForm]
    D -->|reads| H[src/lib/who/who-data.ts]
    E -->|reads| I[/api/growth GET]
    G -->|writes| J[/api/growth POST]
    J -->|triggers refetch| I
    H -->|interpolate| K[src/lib/who/interpolate.ts]
    K --> D
    K --> F
```

Data flow:
1. `GrowthChart` mounts → fetches `GET /api/growth?childId=…` → receives `{ records: GrowthRecord[] }`
2. For each record, `calcAgeMonths(record.date, child.dob)` converts to `Age_Months`
3. `getWhoSeries(metric, sex)` returns the correct static constant (lazy-imported)
4. `interpolatePercentile(ageMonths, value, series)` computes the child's percentile rank
5. Recharts renders `<AreaChart>` with `<ReferenceLine>` per percentile curve and `<Line>` for child data
6. `InterpretationMessage` receives the latest percentile rank and child name → renders friendly string

---

## Components and Interfaces

### Component Tree

```
GrowthChart (src/components/phr/GrowthChart.tsx)
├── MetricTabs          — tab bar: Weight | Height | Head | BMI
├── <Suspense fallback>
│   └── ChartCanvas     — lazy-loaded Recharts wrapper
│       ├── PercentileBands  — Area fills + ReferenceLine per percentile
│       └── MeasurementLine  — Line + Dot for child's data points
├── InterpretationMessage   — friendly percentile summary
└── InlineForm          — bottom sheet overlay for adding measurements
```

### GrowthChart Props

```typescript
interface GrowthChartProps {
  childId: string
  childName: string
  dob: string        // ISO date, e.g. "2021-03-15"
  sex: 'male' | 'female' | 'other' | null
  token: string
}
```

### Internal Types

```typescript
type Metric = 'weight' | 'height' | 'head' | 'bmi'

interface GrowthRecord {
  id: string
  date: string       // ISO date
  height_cm?: number | null
  weight_kg?: number | null
  head_circ_cm?: number | null
  bmi?: number | null
}

// A single point on the child's line
interface ChartPoint {
  ageMonths: number
  value: number
  date: string
  percentileRank: number | null  // null if outside WHO range
}

// One row in a WHO lookup table
interface WhoRow {
  month: number
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}

type WhoSeries = WhoRow[]
```

### MetricTabs

```typescript
interface MetricTabsProps {
  active: Metric
  onChange: (m: Metric) => void
}
```

Renders four pill buttons. Highlights active tab. No external state.

### PercentileBands

```typescript
interface PercentileBandsProps {
  series: WhoSeries
  xDomain: [number, number]
}
```

Renders three `<Area>` fills (p3–p15, p15–p85, p85–p97) and five `<ReferenceLine>` labels using Recharts primitives.

### MeasurementLine

```typescript
interface MeasurementLineProps {
  points: ChartPoint[]
  onPointTap: (point: ChartPoint) => void
}
```

Renders a `<Line>` with `<Dot>` markers. Tap/click on a dot fires `onPointTap` to show a tooltip.

### InterpretationMessage

```typescript
interface InterpretationMessageProps {
  childName: string
  metric: Metric
  percentileRank: number | null
  recordCount: number
}
```

Pure display component. Returns a `<p>` with the appropriate message string.

### InlineForm

```typescript
interface InlineFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void   // triggers refetch
  childId: string
  token: string
}
```

Fixed-position bottom sheet (`position: fixed; bottom: 0; left: 0; right: 0`). Renders date, height, weight, head circumference inputs. Calculates BMI client-side before POST.

---

## Data Models

### WHO Data File Structure (`src/lib/who/who-data.ts`)

Each metric+sex combination is a separate named export so bundlers can tree-shake unused tables. The file is dynamically imported by `GrowthChart` only when the component mounts.

```typescript
// src/lib/who/who-data.ts

export const WHO_WEIGHT_MALE: WhoSeries = [
  { month: 0,  p3: 2.1, p15: 2.8, p50: 3.3, p85: 3.9, p97: 4.4 },
  { month: 1,  p3: 2.9, p15: 3.6, p50: 4.3, p85: 5.1, p97: 5.7 },
  // ... months 0–228
]

export const WHO_WEIGHT_FEMALE: WhoSeries = [ /* ... */ ]
export const WHO_HEIGHT_MALE: WhoSeries = [ /* ... */ ]
export const WHO_HEIGHT_FEMALE: WhoSeries = [ /* ... */ ]
export const WHO_HEAD_MALE: WhoSeries = [ /* ... months 0–36 only */ ]
export const WHO_HEAD_FEMALE: WhoSeries = [ /* ... months 0–36 only */ ]
export const WHO_BMI_MALE: WhoSeries = [ /* ... months 0–228 */ ]
export const WHO_BMI_FEMALE: WhoSeries = [ /* ... months 0–228 */ ]
```

The data source is the official WHO tabulated values:
- 0–60 months: WHO Child Growth Standards (wgsr package / WHO website tables)
- 61–228 months: WHO Reference 2007 (WHO AnthroPlus reference tables)

Each export is a flat array sorted by `month` ascending. No nested objects — this keeps the JSON-like structure simple and the interpolation function O(log n) with binary search.

### Dataset Selector

```typescript
// src/lib/who/who-data.ts
export function getWhoSeries(metric: Metric, sex: 'male' | 'female'): WhoSeries {
  const key = `WHO_${metric.toUpperCase()}_${sex.toUpperCase()}` as const
  return exports[key]
}
```

### Age Calculation (`src/lib/who/interpolate.ts`)

```typescript
/**
 * Returns completed months between two ISO date strings.
 * Uses 30.4375 days/month (365.25 / 12) for consistency with WHO methodology.
 */
export function calcAgeMonths(measurementDate: string, dob: string): number {
  const ms = new Date(measurementDate).getTime() - new Date(dob).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30.4375))
}
```

### Interpolation Function (`src/lib/who/interpolate.ts`)

```typescript
/**
 * Linearly interpolates a percentile boundary value from a WHO series
 * at a fractional age in months.
 *
 * @param ageMonths  - exact age (may be fractional, e.g. 6.3)
 * @param percentile - 'p3' | 'p15' | 'p50' | 'p85' | 'p97'
 * @param series     - sorted WhoSeries array
 * @returns interpolated value, or null if ageMonths is out of range
 */
export function interpolateWho(
  ageMonths: number,
  percentile: keyof Omit<WhoRow, 'month'>,
  series: WhoSeries
): number | null {
  if (series.length === 0) return null
  if (ageMonths < series[0].month || ageMonths > series[series.length - 1].month) return null

  // Binary search for the surrounding rows
  let lo = 0, hi = series.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (series[mid].month <= ageMonths) lo = mid
    else hi = mid
  }

  const x0 = series[lo].month,  y0 = series[lo][percentile]
  const x1 = series[hi].month,  y1 = series[hi][percentile]
  if (x0 === x1) return y0
  return y0 + (y1 - y0) * (ageMonths - x0) / (x1 - x0)
}

/**
 * Returns the estimated percentile rank (0–100) for a given measurement value
 * at a given age, by inverting the WHO percentile table via linear interpolation.
 *
 * Returns null if ageMonths is outside the series range.
 */
export function interpolatePercentile(
  ageMonths: number,
  value: number,
  series: WhoSeries
): number | null {
  const p3  = interpolateWho(ageMonths, 'p3',  series)
  const p15 = interpolateWho(ageMonths, 'p15', series)
  const p50 = interpolateWho(ageMonths, 'p50', series)
  const p85 = interpolateWho(ageMonths, 'p85', series)
  const p97 = interpolateWho(ageMonths, 'p97', series)

  if (p3 === null) return null

  // Map value to percentile rank by linear interpolation between known bands
  const bands: [number, number][] = [
    [p3!, 3], [p15!, 15], [p50!, 50], [p85!, 85], [p97!, 97]
  ]

  if (value <= bands[0][0]) return 3
  if (value >= bands[4][0]) return 97

  for (let i = 0; i < bands.length - 1; i++) {
    const [v0, r0] = bands[i]
    const [v1, r1] = bands[i + 1]
    if (value >= v0 && value <= v1) {
      return r0 + (r1 - r0) * (value - v0) / (v1 - v0)
    }
  }
  return null
}
```

### BMI Calculation

```typescript
export function calcBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}
```

### Interpretation Message Logic

```typescript
export function getInterpretationMessage(
  childName: string,
  metric: Metric,
  percentileRank: number
): string {
  const metricLabel: Record<Metric, string> = {
    weight: 'weight', height: 'height',
    head: 'head circumference', bmi: 'BMI'
  }
  const label = metricLabel[metric]
  if (percentileRank < 3)
    return `${childName}'s ${label} is below the typical range. Consider discussing this with your paediatrician at the next visit.`
  if (percentileRank < 15)
    return `${childName} is on the smaller side but within the WHO reference range — every child grows at their own pace.`
  if (percentileRank <= 85)
    return `${childName}'s ${label} is right in the typical range. Keep up the great work.`
  if (percentileRank <= 97)
    return `${childName} is on the larger side but within the WHO reference range — growth patterns vary widely.`
  return `${childName}'s ${label} is above the typical range. Consider discussing this with your paediatrician at the next visit.`
}
```

### X-Axis Domain Calculation

```typescript
export function calcXDomain(currentAgeMonths: number): [number, number] {
  return [0, currentAgeMonths + 6]
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: WHO data covers the full expected age range

*For any* metric in `{weight, height, bmi}` and sex in `{male, female}`, the WHO series must contain an entry for every integer month from 0 to 228 inclusive. For `head`, the series must contain every integer month from 0 to 36 inclusive.

**Validates: Requirements 1.3, 1.4, 1.5**

---

### Property 2: Linear interpolation correctness

*For any* two adjacent rows `(x0, y0)` and `(x1, y1)` in a WHO series and any fractional age `x` where `x0 ≤ x ≤ x1`, `interpolateWho(x, percentile, series)` must equal `y0 + (y1 - y0) * (x - x0) / (x1 - x0)` within floating-point tolerance (±1e-9).

**Validates: Requirements 1.7**

---

### Property 3: Age calculation determinism

*For any* pair of ISO date strings `(measurementDate, dob)` where `measurementDate ≥ dob`, `calcAgeMonths(measurementDate, dob)` must return the same non-negative integer regardless of the order in which records are fetched or the time of day the function is called.

**Validates: Requirements 3.6, 11.2**

---

### Property 4: Dataset selection by age

*For any* age in months in `[0, 60]`, the WHO series returned for weight/height/BMI must have its first entry at month 0 and its last entry at month ≥ 60 (CGS range). *For any* age in `[61, 228]`, the series must extend to month 228 (WHO Reference 2007 range).

**Validates: Requirements 5.1, 5.2**

---

### Property 5: BMI round-trip

*For any* `weightKg > 0` and `heightCm > 0`, `calcBmi(weightKg, heightCm)` must equal `weightKg / (heightCm / 100) ** 2` within floating-point tolerance (±1e-9). Additionally, the BMI value stored via POST and retrieved via GET must equal the client-computed value within ±0.01.

**Validates: Requirements 9.7, 11.1**

---

### Property 6: Interpretation message contains child name and correct band

*For any* child name string and any percentile rank in `[0, 100]`, `getInterpretationMessage(name, metric, rank)` must return a string that (a) contains the child's name and (b) maps to the correct band per the Requirement 8.4 mapping table.

**Validates: Requirements 8.4, 8.6**

---

### Property 7: Null metric values are filtered without error

*For any* array of `GrowthRecord` objects where some entries have `null` for the selected metric, the data transformation function must return only the non-null entries as `ChartPoint[]` without throwing, and the resulting array length must equal the count of non-null entries.

**Validates: Requirements 3.3**

---

### Property 8: X-axis domain includes current age plus 6 months

*For any* current age in months `a ≥ 0`, `calcXDomain(a)` must return `[0, a + 6]`.

**Validates: Requirements 5.4**

---

### Property 9: Growth record save-and-reload round trip

*For any* valid measurement submission `{ heightCm, weightKg, headCircCm }` with values in clinically plausible ranges, POSTing to `/api/growth` and then GETting the records list must return a record whose numeric values match the submitted values within ±0.01.

**Validates: Requirements 11.1**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `GET /api/growth` fails | Show skeleton loader, then an inline error banner with a retry button; do not crash |
| `POST /api/growth` fails | Keep InlineForm open, show error message inside the form, retain all entered values |
| `children.gender` is `other` or null | Show both male and female 50th percentile curves; display a notice inviting profile update |
| Age_Months < 0 (dob in future) | Clamp to 0; show a warning that the date of birth may be incorrect |
| Head circumference selected, Age_Months > 36 | Show an informational message; render only the available 0–36 month range |
| BMI tab selected, no BMI records | Show a prompt explaining BMI is auto-calculated when both height and weight are recorded |
| WHO series returns null for interpolation | Display "—" in tooltip percentile field; do not crash |
| Recharts dynamic import fails | Fall back to the plain `GrowthTracker` number list with an error notice |

---

## Testing Strategy

### Unit Tests (Vitest)

Focus on pure functions and edge cases:

- `calcAgeMonths`: known date pairs including leap years, same-day, and month boundaries
- `interpolateWho`: exact tabulated values, midpoint between two rows, out-of-range inputs
- `interpolatePercentile`: values at each band boundary, below p3, above p97
- `calcBmi`: standard values, very small/large inputs
- `getInterpretationMessage`: one example per band, name substitution, all four metrics
- `calcXDomain`: age 0, age 60, age 228
- Data transformation (null filtering): mixed null/non-null records

### Property-Based Tests (fast-check, minimum 100 iterations each)

The project uses TypeScript/Vitest; **fast-check** is the chosen PBT library (`npm install --save-dev fast-check`).

Each test is tagged with a comment in the format:
`// Feature: who-growth-chart, Property N: <property text>`

**Property 1 — WHO data coverage**
```typescript
// Feature: who-growth-chart, Property 1: WHO data covers the full expected age range
fc.assert(fc.property(
  fc.constantFrom('weight', 'height', 'bmi'),
  fc.constantFrom('male', 'female'),
  (metric, sex) => {
    const series = getWhoSeries(metric, sex)
    const expectedMax = 228
    return series.some(r => r.month === 0) && series.some(r => r.month === expectedMax)
  }
), { numRuns: 100 })
```

**Property 2 — Linear interpolation correctness**
```typescript
// Feature: who-growth-chart, Property 2: Linear interpolation correctness
fc.assert(fc.property(
  fc.integer({ min: 0, max: series.length - 2 }),
  fc.float({ min: 0, max: 1 }),
  (i, t) => {
    const x = series[i].month + t * (series[i+1].month - series[i].month)
    const result = interpolateWho(x, 'p50', series)
    const expected = series[i].p50 + t * (series[i+1].p50 - series[i].p50)
    return Math.abs(result! - expected) < 1e-9
  }
), { numRuns: 100 })
```

**Property 3 — Age calculation determinism**
```typescript
// Feature: who-growth-chart, Property 3: Age calculation determinism
fc.assert(fc.property(
  fc.date({ min: new Date('2000-01-01'), max: new Date('2024-01-01') }),
  fc.integer({ min: 0, max: 228 * 30 }),
  (dob, offsetDays) => {
    const measurement = new Date(dob.getTime() + offsetDays * 86400000)
    const iso = (d: Date) => d.toISOString().split('T')[0]
    const r1 = calcAgeMonths(iso(measurement), iso(dob))
    const r2 = calcAgeMonths(iso(measurement), iso(dob))
    return r1 === r2 && r1 >= 0
  }
), { numRuns: 100 })
```

**Property 5 — BMI round-trip**
```typescript
// Feature: who-growth-chart, Property 5: BMI round-trip
fc.assert(fc.property(
  fc.float({ min: 1, max: 150 }),
  fc.float({ min: 30, max: 250 }),
  (weightKg, heightCm) => {
    const bmi = calcBmi(weightKg, heightCm)
    const expected = weightKg / Math.pow(heightCm / 100, 2)
    return Math.abs(bmi - expected) < 1e-9
  }
), { numRuns: 100 })
```

**Property 6 — Interpretation message correctness**
```typescript
// Feature: who-growth-chart, Property 6: Interpretation message contains child name and correct band
fc.assert(fc.property(
  fc.string({ minLength: 1 }),
  fc.constantFrom('weight', 'height', 'head', 'bmi'),
  fc.float({ min: 0, max: 100 }),
  (name, metric, rank) => {
    const msg = getInterpretationMessage(name, metric, rank)
    return msg.includes(name)
  }
), { numRuns: 100 })
```

**Property 7 — Null filtering**
```typescript
// Feature: who-growth-chart, Property 7: Null metric values are filtered without error
fc.assert(fc.property(
  fc.array(fc.record({
    id: fc.uuid(),
    date: fc.string(),
    weight_kg: fc.option(fc.float({ min: 1, max: 100 }))
  })),
  (records) => {
    const points = toChartPoints(records, 'weight', '2020-01-01')
    const nonNull = records.filter(r => r.weight_kg != null)
    return points.length === nonNull.length
  }
), { numRuns: 100 })
```

**Property 8 — X-axis domain**
```typescript
// Feature: who-growth-chart, Property 8: X-axis domain includes current age plus 6 months
fc.assert(fc.property(
  fc.integer({ min: 0, max: 228 }),
  (age) => {
    const [lo, hi] = calcXDomain(age)
    return lo === 0 && hi === age + 6
  }
), { numRuns: 100 })
```

**Property 9 — Save-and-reload round trip** (integration test, run against local D1)
```typescript
// Feature: who-growth-chart, Property 9: Growth record save-and-reload round trip
fc.assert(fc.property(
  fc.float({ min: 30, max: 200 }),   // heightCm
  fc.float({ min: 1, max: 100 }),    // weightKg
  async (heightCm, weightKg) => {
    const postRes = await POST({ heightCm, weightKg, childId, date })
    const getRes  = await GET({ childId })
    const saved   = getRes.records.find(r => r.id === postRes.id)
    return Math.abs(saved.height_cm - heightCm) < 0.01
        && Math.abs(saved.weight_kg - weightKg) < 0.01
  }
), { numRuns: 100 })
```
