# Design Document — Screening Results

## Overview

The Screening Results feature delivers the parent-facing view for SKIDS clinical screening data at `/dashboard/reports`. When clinic staff import results into `screening_imports`, parents currently have no way to see them. This feature closes that gap.

The view surfaces results from all four SKIDS screening products — Vision (WelchAllyn), Chatter (developmental), Nutrition, and Symphony (hearing) — in plain, parent-friendly language with clear status indicators, next-step recommendations, and access to attached report files.

Key design decisions:

- **Status derivation is pure and client-side**: `fourDJson` is parsed in a pure function `deriveStatus(fourDJson)` that returns `normal | borderline | needs-attention`. No server-side interpretation needed.
- **Screening_Type is derived from `dataJson.type` or `dataJson.screeningType`**: The API returns raw `dataJson`; the client normalises the type key.
- **Next-steps messages are a static lookup table** keyed by `Screening_Type × Result_Status`. No AI call needed for this feature.
- **Child selector uses horizontal scrollable pill tabs**, matching the pattern in `ChildDashboard.tsx`.
- **Deep-link params (`?childId`, `?screeningId`) are read on mount** from `window.location.search` inside the React component (SSR page passes them as props).
- **Report URL is extracted from `dataJson.reportUrl`** (with `dataJson.report_url` as a fallback key).

---

## Architecture

```mermaid
graph TD
    A[MobileTabBar.astro] -->|Reports tab| B[/dashboard/reports]
    B[reports.astro SSR page] -->|auth gate + SSR props| C[ScreeningResults_View.tsx]
    C -->|GET /api/screening-results?childId=| D[screening-results.ts API route]
    D -->|SELECT screening_imports| E[(D1: screening_imports)]
    D -->|verifyChildOwnership| F[children.ts getParentId]
    C --> G[ChildSelector pills]
    C --> H[ScreeningCard.tsx × N]
    H -->|deriveStatus| I[src/lib/phr/screening-utils.ts]
    H -->|nextStepsMessage| I
    H -->|extractReportUrl| I
```

Data flow:

1. Parent navigates to `/dashboard/reports` (or taps a `screening_alert` notification deep-link).
2. `reports.astro` verifies Firebase session server-side; redirects to `/login?redirect=/dashboard/reports` if unauthenticated.
3. Page renders `ScreeningResults_View` with `initialChildId` and `initialScreeningId` from URL search params.
4. `ScreeningResults_View` fetches `/api/children` to build the child selector, then fetches `/api/screening-results?childId=<selected>`.
5. Records are grouped by `Screening_Type`, sorted within each group by `screeningDate` descending.
6. Each `ScreeningCard` calls pure utility functions to derive status, next-steps message, and report URL from the raw JSON fields.

---

## Components and Interfaces

### Component Tree

```
reports.astro  (SSR, auth-gated)
└── ScreeningResults_View.tsx   (client:load)
    ├── ChildSelector            — horizontal pill tabs, hidden when 1 child
    ├── LoadingSkeleton          — shown while fetching
    ├── EmptyState               — shown when results array is empty
    ├── ErrorState               — shown on fetch failure, includes retry button
    └── [ScreeningTypeSection × 4]
        ├── SectionHeader        — "SKIDS Vision 👁️" etc.
        └── ScreeningCard.tsx × N
            ├── StatusBadge      — green/amber/red pill
            ├── SummaryText      — summaryText or fallback
            ├── NextStepsMessage — static lookup
            └── ViewReportButton — conditional, opens new tab
```

### ScreeningResults_View Props

```typescript
interface ScreeningResultsViewProps {
  initialChildId?: string   // from URL ?childId=
  initialScreeningId?: string  // from URL ?screeningId=
}
```

### ScreeningCard Props

```typescript
interface ScreeningCardProps {
  record: ScreeningImportRecord
  childName: string
}
```

### API Response Shape

`GET /api/screening-results` and `GET /api/screening-results?childId=<id>`

```typescript
// Success 200
interface ScreeningResultsResponse {
  records: ScreeningImportRecord[]
}

interface ScreeningImportRecord {
  id: string
  childId: string
  screeningDate: string | null   // ISO date
  importedAt: string             // ISO datetime
  summaryText: string | null
  fourDJson: string | null       // raw JSON string
  dataJson: string | null        // raw JSON string
  campaignCode: string | null
}

// Error responses
// 401 { error: 'Unauthorized' }
// 403 { error: 'Forbidden' }
// 500 { error: 'Failed to fetch results' }
```

---

## Data Models

### Screening_Type Derivation

`dataJson` is a JSON string. The type is normalised from two possible keys:

```typescript
// src/lib/phr/screening-utils.ts

export type ScreeningType = 'vision' | 'chatter' | 'nutrition' | 'hearing' | 'unknown'

const TYPE_ALIASES: Record<string, ScreeningType> = {
  vision: 'vision', welchallyn: 'vision', eye: 'vision',
  chatter: 'chatter', developmental: 'chatter', speech: 'chatter',
  nutrition: 'nutrition', nutree: 'nutrition', diet: 'nutrition',
  hearing: 'hearing', symphony: 'hearing', audio: 'hearing',
}

export function deriveScreeningType(dataJson: string | null): ScreeningType {
  if (!dataJson) return 'unknown'
  try {
    const data = JSON.parse(dataJson)
    const raw = (data.type ?? data.screeningType ?? '').toLowerCase().trim()
    return TYPE_ALIASES[raw] ?? 'unknown'
  } catch {
    return 'unknown'
  }
}
```

### Result_Status Derivation from fourDJson

`fourDJson` encodes the Four D dimensions: Defects, Delay, Disability, Deficiency. Each dimension can be absent, `false`/`null` (not flagged), or present with a `severity` field (`"mild"` → borderline, `"moderate"` / `"severe"` → needs-attention).

Expected `fourDJson` shape (produced by SKIDS clinic import tooling):

```json
{
  "defects":     { "flagged": true,  "severity": "mild" },
  "delay":       { "flagged": false },
  "disability":  { "flagged": false },
  "deficiency":  { "flagged": true,  "severity": "moderate" }
}
```

Derivation logic:

```typescript
// src/lib/phr/screening-utils.ts

export type ResultStatus = 'normal' | 'borderline' | 'needs-attention'

interface FourDDimension {
  flagged?: boolean
  severity?: 'mild' | 'moderate' | 'severe'
}

interface FourD {
  defects?: FourDDimension
  delay?: FourDDimension
  disability?: FourDDimension
  deficiency?: FourDDimension
}

export function deriveStatus(fourDJson: string | null): ResultStatus {
  if (!fourDJson) return 'normal'
  let fourD: FourD
  try {
    fourD = JSON.parse(fourDJson)
  } catch {
    return 'normal'
  }

  const dims = [fourD.defects, fourD.delay, fourD.disability, fourD.deficiency]
  let highestSeverity: ResultStatus = 'normal'

  for (const dim of dims) {
    if (!dim?.flagged) continue
    const sev = dim.severity ?? 'mild'
    if (sev === 'moderate' || sev === 'severe') return 'needs-attention'
    if (sev === 'mild') highestSeverity = 'borderline'
  }

  return highestSeverity
}
```

### Report URL Extraction

```typescript
// src/lib/phr/screening-utils.ts

export function extractReportUrl(dataJson: string | null): string | null {
  if (!dataJson) return null
  try {
    const data = JSON.parse(dataJson)
    const url = data.reportUrl ?? data.report_url ?? null
    if (!url || typeof url !== 'string') return null
    // Validate URL format
    new URL(url)
    return url
  } catch {
    return null
  }
}
```

### Next-Steps Message Lookup Table

```typescript
// src/lib/phr/screening-utils.ts

type NextStepsKey = `${ScreeningType}:${ResultStatus}`

const NEXT_STEPS: Record<NextStepsKey, string> = {
  'vision:normal':           'Next vision screening recommended in 12 months.',
  'vision:borderline':       'We recommend a follow-up vision screening in 3 months.',
  'vision:needs-attention':  'Please book a SKIDS Vision consultation for a detailed assessment.',

  'chatter:normal':          'Your child\'s developmental screening looks great. Next check in 6 months.',
  'chatter:borderline':      'We recommend a follow-up developmental screening in 3 months.',
  'chatter:needs-attention': 'Please book a SKIDS Chatter session for a detailed developmental assessment.',

  'nutrition:normal':        'Your child\'s nutrition screening is on track. Keep up the healthy habits.',
  'nutrition:borderline':    'We recommend a follow-up nutrition check in 3 months.',
  'nutrition:needs-attention': 'Please book a SKIDS Nutrition consultation for a personalised plan.',

  'hearing:normal':          'Your child\'s hearing screening is clear. Next check recommended in 12 months.',
  'hearing:borderline':      'We recommend a follow-up hearing screening in 3 months.',
  'hearing:needs-attention': 'Please book a SKIDS Symphony session for a detailed hearing assessment.',

  'unknown:normal':          'Results recorded. Please consult your SKIDS provider for details.',
  'unknown:borderline':      'We recommend a follow-up screening in 3 months.',
  'unknown:needs-attention': 'Please book a consultation with your SKIDS provider.',
}

const INTERVENTION_LINKS: Partial<Record<ScreeningType, string>> = {
  vision:    '/interventions/vision',
  chatter:   '/interventions/chatter',
  nutrition: '/interventions/nutrition',
  hearing:   '/interventions/hearing',
}

export function getNextStepsMessage(type: ScreeningType, status: ResultStatus): string {
  return NEXT_STEPS[`${type}:${status}`] ?? NEXT_STEPS[`unknown:${status}`]
}

export function getInterventionLink(type: ScreeningType): string | null {
  return INTERVENTION_LINKS[type] ?? null
}
```

### Screening_Type Display Config

```typescript
// src/lib/phr/screening-utils.ts

export const SCREENING_TYPE_CONFIG: Record<ScreeningType, { label: string; emoji: string; order: number }> = {
  vision:    { label: 'SKIDS Vision',    emoji: '👁️',  order: 0 },
  chatter:   { label: 'SKIDS Chatter',   emoji: '🗣️',  order: 1 },
  nutrition: { label: 'SKIDS Nutrition', emoji: '🥗',  order: 2 },
  hearing:   { label: 'SKIDS Symphony',  emoji: '🎵',  order: 3 },
  unknown:   { label: 'Screening',       emoji: '📋',  order: 4 },
}

export const SCREENING_TYPE_ORDER: ScreeningType[] = ['vision', 'chatter', 'nutrition', 'hearing', 'unknown']
```

### Date Formatting

```typescript
// src/lib/phr/screening-utils.ts

export function formatScreeningDate(isoDate: string | null): string {
  if (!isoDate) return 'Date unknown'
  try {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return 'Date unknown'
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API returns only parent-owned records

*For any* authenticated parent with N children, a GET to `/api/screening-results` must return only records whose `childId` belongs to one of that parent's children, and the records must be ordered by `importedAt` descending. When filtered by `?childId=<id>`, only records for that specific child are returned.

**Validates: Requirements 1.1, 1.2**

---

### Property 2: Child ownership enforcement

*For any* authenticated parent and any `childId` that belongs to a different parent, a GET to `/api/screening-results?childId=<id>` must return HTTP 403.

**Validates: Requirements 1.3**

---

### Property 3: API response shape completeness

*For any* `screening_imports` record returned by the API, the response object must contain all of the following fields: `id`, `childId`, `screeningDate`, `importedAt`, `summaryText`, `fourDJson`, `dataJson`, `campaignCode`. Fields that are null in the database must be returned as `null`, not omitted.

**Validates: Requirements 1.5, 1.6**

---

### Property 4: Status derivation from fourDJson

*For any* `fourDJson` string, `deriveStatus(fourDJson)` must satisfy:
- If `fourDJson` is null, empty, or unparseable → `normal`
- If all dimensions have `flagged: false` or are absent → `normal`
- If at least one dimension has `flagged: true` and `severity: "mild"` and no dimension has `severity: "moderate"` or `"severe"` → `borderline`
- If at least one dimension has `flagged: true` and `severity: "moderate"` or `"severe"` → `needs-attention`

**Validates: Requirements 5.4, 5.5, 5.6, 5.7**

---

### Property 5: Grouping and ordering by Screening_Type

*For any* array of `ScreeningImportRecord` objects, the grouping function must produce groups in the fixed order `[vision, chatter, nutrition, hearing, unknown]`, and within each group the records must be sorted by `screeningDate` descending (nulls last).

**Validates: Requirements 4.1, 4.4**

---

### Property 6: Next-steps lookup table completeness

*For any* combination of `ScreeningType × ResultStatus`, `getNextStepsMessage(type, status)` must return a non-empty string. For `needs-attention` status and any known `ScreeningType` (vision, chatter, nutrition, hearing), `getInterventionLink(type)` must return a non-null string starting with `/interventions/`.

**Validates: Requirements 6.1, 6.2, 6.3**

---

### Property 7: Report URL button visibility

*For any* `dataJson` string, `extractReportUrl(dataJson)` must return a non-null string if and only if `dataJson` contains a `reportUrl` or `report_url` key whose value is a valid URL. Invalid URL strings and missing keys must return `null`.

**Validates: Requirements 7.1, 7.3, 7.4**

---

### Property 8: Deep-link child pre-selection

*For any* list of children belonging to the authenticated parent, if `initialChildId` matches one of them, the view must pre-select that child. If `initialChildId` is absent, null, or does not match any child in the list, the view must default to the first child in the list.

**Validates: Requirements 9.1, 9.2**

---

### Property 9: Child selector renders all children

*For any* parent with N > 1 children, the `ChildSelector` must render exactly N pill buttons, each containing the corresponding child's name. For N = 1, the selector must not be rendered.

**Validates: Requirements 3.1, 3.3, 3.4**

---

### Property 10: Date formatting produces human-readable output

*For any* valid ISO date string (YYYY-MM-DD), `formatScreeningDate` must return a string matching the pattern `D MMM YYYY` (e.g. "15 Jan 2025") using the `en-IN` locale. For null or invalid input, it must return `"Date unknown"` without throwing.

**Validates: Requirements 5.1**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| No auth token on API request | Return 401 `{ error: 'Unauthorized' }` |
| `childId` belongs to different parent | Return 403 `{ error: 'Forbidden' }` |
| `fourDJson` is null or malformed JSON | `deriveStatus` returns `'normal'`; card renders without crashing |
| `dataJson` is null or malformed JSON | `deriveScreeningType` returns `'unknown'`; `extractReportUrl` returns `null` |
| `screeningDate` is null | `formatScreeningDate` returns `"Date unknown"` |
| API fetch fails in component | Show error state with retry button; do not crash |
| Empty results array | Show empty state message with child's name |
| `initialChildId` not in parent's children | Silently default to first child |
| `initialScreeningId` not found in results | No scroll; no error shown |
| Report URL is present but not a valid URL | `extractReportUrl` returns `null`; "View Report" button not rendered |

---

## Testing Strategy

### Unit Tests (Vitest)

Focus on the pure utility functions in `src/lib/phr/screening-utils.ts`:

- `deriveStatus`: null input, all-clear fourDJson, single mild flag, single moderate flag, mixed flags, malformed JSON
- `deriveScreeningType`: each known alias, unknown type, null input, malformed JSON
- `extractReportUrl`: `reportUrl` key, `report_url` key, missing key, invalid URL string, null input
- `getNextStepsMessage`: all 15 type × status combinations return non-empty strings
- `getInterventionLink`: known types return `/interventions/…`, unknown returns null
- `formatScreeningDate`: valid ISO date, null, invalid string
- Grouping/sorting function: mixed types, multiple records per type, null screeningDate

### Property-Based Tests (fast-check, minimum 100 iterations each)

The project uses TypeScript/Vitest; **fast-check** is the chosen PBT library (`npm install --save-dev fast-check`).

Each test is tagged with a comment in the format:
`// Feature: screening-results, Property N: <property text>`

**Property 4 — Status derivation from fourDJson**

```typescript
// Feature: screening-results, Property 4: Status derivation from fourDJson
fc.assert(fc.property(
  fc.record({
    defects:    fc.option(fc.record({ flagged: fc.boolean(), severity: fc.option(fc.constantFrom('mild','moderate','severe')) })),
    delay:      fc.option(fc.record({ flagged: fc.boolean(), severity: fc.option(fc.constantFrom('mild','moderate','severe')) })),
    disability: fc.option(fc.record({ flagged: fc.boolean(), severity: fc.option(fc.constantFrom('mild','moderate','severe')) })),
    deficiency: fc.option(fc.record({ flagged: fc.boolean(), severity: fc.option(fc.constantFrom('mild','moderate','severe')) })),
  }),
  (fourD) => {
    const status = deriveStatus(JSON.stringify(fourD))
    const dims = [fourD.defects, fourD.delay, fourD.disability, fourD.deficiency]
    const hasSevere = dims.some(d => d?.flagged && (d.severity === 'moderate' || d.severity === 'severe'))
    const hasMild   = dims.some(d => d?.flagged && d.severity === 'mild')
    if (hasSevere) return status === 'needs-attention'
    if (hasMild)   return status === 'borderline'
    return status === 'normal'
  }
), { numRuns: 100 })
```

**Property 5 — Grouping and ordering**

```typescript
// Feature: screening-results, Property 5: Grouping and ordering by Screening_Type
fc.assert(fc.property(
  fc.array(fc.record({
    id: fc.uuid(),
    dataJson: fc.constantFrom(
      '{"type":"vision"}', '{"type":"chatter"}',
      '{"type":"nutrition"}', '{"type":"hearing"}', null
    ),
    screeningDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
      .map(d => d.toISOString().split('T')[0])),
    // other required fields
  })),
  (records) => {
    const groups = groupAndSortRecords(records)
    const groupKeys = groups.map(g => g.type)
    // Order must be a subsequence of the canonical order
    const canonical = ['vision','chatter','nutrition','hearing','unknown']
    let ci = 0
    for (const key of groupKeys) {
      while (ci < canonical.length && canonical[ci] !== key) ci++
      if (ci >= canonical.length) return false
    }
    // Within each group, dates must be descending
    for (const group of groups) {
      for (let i = 0; i < group.records.length - 1; i++) {
        const a = group.records[i].screeningDate ?? ''
        const b = group.records[i+1].screeningDate ?? ''
        if (a < b) return false
      }
    }
    return true
  }
), { numRuns: 100 })
```

**Property 6 — Next-steps lookup completeness**

```typescript
// Feature: screening-results, Property 6: Next-steps lookup table completeness
fc.assert(fc.property(
  fc.constantFrom('vision','chatter','nutrition','hearing','unknown'),
  fc.constantFrom('normal','borderline','needs-attention'),
  (type, status) => {
    const msg = getNextStepsMessage(type as ScreeningType, status as ResultStatus)
    return typeof msg === 'string' && msg.length > 0
  }
), { numRuns: 100 })
```

**Property 7 — Report URL extraction**

```typescript
// Feature: screening-results, Property 7: Report URL button visibility
fc.assert(fc.property(
  fc.oneof(
    fc.record({ reportUrl: fc.webUrl() }).map(o => JSON.stringify(o)),
    fc.record({ report_url: fc.webUrl() }).map(o => JSON.stringify(o)),
    fc.record({ reportUrl: fc.string() }).map(o => JSON.stringify(o)), // may be invalid URL
    fc.constant(null),
    fc.constant('not-json'),
  ),
  (dataJson) => {
    const result = extractReportUrl(dataJson)
    if (result !== null) {
      // Must be a valid URL
      try { new URL(result); return true } catch { return false }
    }
    return true // null is always acceptable
  }
), { numRuns: 100 })
```

**Property 8 — Deep-link pre-selection**

```typescript
// Feature: screening-results, Property 8: Deep-link child pre-selection
fc.assert(fc.property(
  fc.array(fc.record({ id: fc.uuid(), name: fc.string({ minLength: 1 }) }), { minLength: 1 }),
  fc.option(fc.uuid()),
  (children, initialChildId) => {
    const selected = resolveInitialChild(children, initialChildId)
    const isOwned = children.some(c => c.id === initialChildId)
    if (initialChildId && isOwned) return selected.id === initialChildId
    return selected.id === children[0].id
  }
), { numRuns: 100 })
```

**Property 10 — Date formatting**

```typescript
// Feature: screening-results, Property 10: Date formatting produces human-readable output
fc.assert(fc.property(
  fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  (isoDate) => {
    const result = formatScreeningDate(isoDate)
    return typeof result === 'string' && result.length > 0 && result !== 'Date unknown'
  }
), { numRuns: 100 })
```
