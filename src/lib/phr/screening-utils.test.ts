import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  deriveScreeningType,
  deriveStatus,
  extractReportUrl,
  getNextStepsMessage,
  getInterventionLink,
  formatScreeningDate,
  groupAndSortRecords,
  resolveInitialChild,
  SCREENING_TYPE_ORDER,
  type ScreeningType,
  type ResultStatus,
  type ScreeningImportRecord,
} from './screening-utils'

// ─── deriveScreeningType ──────────────────────────────

describe('deriveScreeningType', () => {
  it('returns unknown for null', () => expect(deriveScreeningType(null)).toBe('unknown'))
  it('returns unknown for malformed JSON', () => expect(deriveScreeningType('not-json')).toBe('unknown'))
  it('maps vision aliases', () => {
    expect(deriveScreeningType('{"type":"vision"}')).toBe('vision')
    expect(deriveScreeningType('{"type":"WelchAllyn"}')).toBe('vision')
    expect(deriveScreeningType('{"type":"eye"}')).toBe('vision')
  })
  it('maps chatter aliases', () => {
    expect(deriveScreeningType('{"type":"chatter"}')).toBe('chatter')
    expect(deriveScreeningType('{"type":"developmental"}')).toBe('chatter')
    expect(deriveScreeningType('{"type":"speech"}')).toBe('chatter')
  })
  it('maps nutrition aliases', () => {
    expect(deriveScreeningType('{"type":"nutrition"}')).toBe('nutrition')
    expect(deriveScreeningType('{"type":"nutree"}')).toBe('nutrition')
  })
  it('maps hearing aliases', () => {
    expect(deriveScreeningType('{"type":"hearing"}')).toBe('hearing')
    expect(deriveScreeningType('{"type":"symphony"}')).toBe('hearing')
    expect(deriveScreeningType('{"type":"audio"}')).toBe('hearing')
  })
  it('uses screeningType key as fallback', () => {
    expect(deriveScreeningType('{"screeningType":"vision"}')).toBe('vision')
  })
  it('returns unknown for unrecognised type', () => {
    expect(deriveScreeningType('{"type":"dental"}')).toBe('unknown')
  })
})

// ─── deriveStatus ─────────────────────────────────────

describe('deriveStatus', () => {
  it('returns normal for null', () => expect(deriveStatus(null)).toBe('normal'))
  it('returns normal for malformed JSON', () => expect(deriveStatus('bad')).toBe('normal'))
  it('returns normal when all dims absent', () => expect(deriveStatus('{}')).toBe('normal'))
  it('returns normal when all dims flagged=false', () => {
    expect(deriveStatus('{"defects":{"flagged":false},"delay":{"flagged":false}}')).toBe('normal')
  })
  it('returns borderline for single mild flag', () => {
    expect(deriveStatus('{"defects":{"flagged":true,"severity":"mild"}}')).toBe('borderline')
  })
  it('returns needs-attention for moderate flag', () => {
    expect(deriveStatus('{"delay":{"flagged":true,"severity":"moderate"}}')).toBe('needs-attention')
  })
  it('returns needs-attention for severe flag', () => {
    expect(deriveStatus('{"disability":{"flagged":true,"severity":"severe"}}')).toBe('needs-attention')
  })
  it('needs-attention wins over mild', () => {
    const json = JSON.stringify({
      defects: { flagged: true, severity: 'mild' },
      delay: { flagged: true, severity: 'moderate' },
    })
    expect(deriveStatus(json)).toBe('needs-attention')
  })
  it('defaults missing severity to mild → borderline', () => {
    expect(deriveStatus('{"defects":{"flagged":true}}')).toBe('borderline')
  })
})

// ─── extractReportUrl ─────────────────────────────────

describe('extractReportUrl', () => {
  it('returns null for null input', () => expect(extractReportUrl(null)).toBeNull())
  it('returns null for malformed JSON', () => expect(extractReportUrl('bad')).toBeNull())
  it('returns null when no reportUrl key', () => expect(extractReportUrl('{"foo":"bar"}')).toBeNull())
  it('extracts reportUrl key', () => {
    expect(extractReportUrl('{"reportUrl":"https://example.com/report.pdf"}')).toBe('https://example.com/report.pdf')
  })
  it('extracts report_url key as fallback', () => {
    expect(extractReportUrl('{"report_url":"https://example.com/r.pdf"}')).toBe('https://example.com/r.pdf')
  })
  it('returns null for invalid URL string', () => {
    expect(extractReportUrl('{"reportUrl":"not-a-url"}')).toBeNull()
  })
  it('returns null for non-string value', () => {
    expect(extractReportUrl('{"reportUrl":123}')).toBeNull()
  })
})

// ─── getNextStepsMessage ──────────────────────────────

describe('getNextStepsMessage', () => {
  const types: ScreeningType[] = ['vision', 'chatter', 'nutrition', 'hearing', 'unknown']
  const statuses: ResultStatus[] = ['normal', 'borderline', 'needs-attention']

  for (const type of types) {
    for (const status of statuses) {
      it(`returns non-empty string for ${type}:${status}`, () => {
        const msg = getNextStepsMessage(type, status)
        expect(typeof msg).toBe('string')
        expect(msg.length).toBeGreaterThan(0)
      })
    }
  }
})

// ─── getInterventionLink ──────────────────────────────

describe('getInterventionLink', () => {
  it('returns /interventions/vision for vision', () => expect(getInterventionLink('vision')).toBe('/interventions/vision'))
  it('returns /interventions/chatter for chatter', () => expect(getInterventionLink('chatter')).toBe('/interventions/chatter'))
  it('returns /interventions/nutrition for nutrition', () => expect(getInterventionLink('nutrition')).toBe('/interventions/nutrition'))
  it('returns /interventions/hearing for hearing', () => expect(getInterventionLink('hearing')).toBe('/interventions/hearing'))
  it('returns null for unknown', () => expect(getInterventionLink('unknown')).toBeNull())
})

// ─── formatScreeningDate ──────────────────────────────

describe('formatScreeningDate', () => {
  it('returns Date unknown for null', () => expect(formatScreeningDate(null)).toBe('Date unknown'))
  it('returns Date unknown for empty string', () => expect(formatScreeningDate('')).toBe('Date unknown'))
  it('formats a valid ISO date', () => {
    const result = formatScreeningDate('2024-06-15')
    expect(result).not.toBe('Date unknown')
    expect(result).toContain('2024')
  })
})

// ─── groupAndSortRecords ──────────────────────────────

function makeRecord(overrides: Partial<ScreeningImportRecord> = {}): ScreeningImportRecord {
  return {
    id: crypto.randomUUID(),
    childId: 'child-1',
    screeningDate: '2024-01-01',
    importedAt: new Date().toISOString(),
    summaryText: null,
    fourDJson: null,
    dataJson: null,
    campaignCode: null,
    ...overrides,
  }
}

describe('groupAndSortRecords', () => {
  it('returns empty array for empty input', () => {
    expect(groupAndSortRecords([])).toEqual([])
  })

  it('groups records by screening type', () => {
    const records = [
      makeRecord({ dataJson: '{"type":"vision"}' }),
      makeRecord({ dataJson: '{"type":"hearing"}' }),
      makeRecord({ dataJson: '{"type":"vision"}' }),
    ]
    const groups = groupAndSortRecords(records)
    const types = groups.map((g) => g.type)
    expect(types).toContain('vision')
    expect(types).toContain('hearing')
    expect(groups.find((g) => g.type === 'vision')!.records).toHaveLength(2)
  })

  it('returns groups in canonical order', () => {
    const records = [
      makeRecord({ dataJson: '{"type":"hearing"}' }),
      makeRecord({ dataJson: '{"type":"vision"}' }),
      makeRecord({ dataJson: '{"type":"chatter"}' }),
    ]
    const groups = groupAndSortRecords(records)
    const types = groups.map((g) => g.type)
    const canonicalPositions = types.map((t) => SCREENING_TYPE_ORDER.indexOf(t))
    for (let i = 0; i < canonicalPositions.length - 1; i++) {
      expect(canonicalPositions[i]).toBeLessThan(canonicalPositions[i + 1])
    }
  })

  it('sorts records within group by screeningDate descending', () => {
    const records = [
      makeRecord({ dataJson: '{"type":"vision"}', screeningDate: '2024-01-01' }),
      makeRecord({ dataJson: '{"type":"vision"}', screeningDate: '2024-06-01' }),
      makeRecord({ dataJson: '{"type":"vision"}', screeningDate: '2023-12-01' }),
    ]
    const group = groupAndSortRecords(records).find((g) => g.type === 'vision')!
    expect(group.records[0].screeningDate).toBe('2024-06-01')
    expect(group.records[1].screeningDate).toBe('2024-01-01')
    expect(group.records[2].screeningDate).toBe('2023-12-01')
  })

  it('puts null screeningDate last', () => {
    const records = [
      makeRecord({ dataJson: '{"type":"vision"}', screeningDate: null }),
      makeRecord({ dataJson: '{"type":"vision"}', screeningDate: '2024-01-01' }),
    ]
    const group = groupAndSortRecords(records).find((g) => g.type === 'vision')!
    expect(group.records[0].screeningDate).toBe('2024-01-01')
    expect(group.records[1].screeningDate).toBeNull()
  })
})

// ─── resolveInitialChild ──────────────────────────────

describe('resolveInitialChild', () => {
  const children = [
    { id: 'c1', name: 'Alice' },
    { id: 'c2', name: 'Bob' },
  ]

  it('returns matching child when initialChildId is valid', () => {
    expect(resolveInitialChild(children, 'c2').id).toBe('c2')
  })

  it('returns first child when initialChildId is null', () => {
    expect(resolveInitialChild(children, null).id).toBe('c1')
  })

  it('returns first child when initialChildId does not match', () => {
    expect(resolveInitialChild(children, 'c999').id).toBe('c1')
  })
})

// ─── Property-based tests ─────────────────────────────

describe('Property 4: Status derivation from fourDJson', () => {
  // Feature: screening-results, Property 4: Status derivation from fourDJson
  it('holds for all valid fourD shapes', () => {
    const dimArb = fc.option(
      fc.record({
        flagged: fc.boolean(),
        severity: fc.option(fc.constantFrom('mild' as const, 'moderate' as const, 'severe' as const)),
      }),
      { nil: undefined }
    )
    fc.assert(
      fc.property(
        fc.record({ defects: dimArb, delay: dimArb, disability: dimArb, deficiency: dimArb }),
        (fourD) => {
          const status = deriveStatus(JSON.stringify(fourD))
          const dims = [fourD.defects, fourD.delay, fourD.disability, fourD.deficiency]
          const hasSevere = dims.some((d) => d?.flagged && (d.severity === 'moderate' || d.severity === 'severe'))
          const hasMild = dims.some((d) => d?.flagged && (d.severity === 'mild' || d.severity === undefined || d.severity === null))
          if (hasSevere) return status === 'needs-attention'
          if (hasMild) return status === 'borderline'
          return status === 'normal'
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 5: Grouping and ordering by Screening_Type', () => {
  // Feature: screening-results, Property 5: Grouping and ordering by Screening_Type
  it('groups are always in canonical order', () => {
    const recordArb = fc.record({
      id: fc.uuid(),
      childId: fc.uuid(),
      screeningDate: fc.option(
        fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2025-12-31').getTime() })
          .map((ms) => new Date(ms).toISOString().split('T')[0]),
        { nil: null }
      ),
      importedAt: fc.constant(new Date().toISOString()),
      summaryText: fc.constant(null),
      fourDJson: fc.constant(null),
      dataJson: fc.option(
        fc.constantFrom(
          '{"type":"vision"}', '{"type":"chatter"}',
          '{"type":"nutrition"}', '{"type":"hearing"}', '{}'
        ),
        { nil: null }
      ),
      campaignCode: fc.constant(null),
    })
    fc.assert(
      fc.property(fc.array(recordArb), (records) => {
        const groups = groupAndSortRecords(records)
        const types = groups.map((g) => g.type)
        const canonical = SCREENING_TYPE_ORDER
        let ci = 0
        for (const key of types) {
          while (ci < canonical.length && canonical[ci] !== key) ci++
          if (ci >= canonical.length) return false
        }
        // Within each group, dates must be descending (nulls last)
        for (const group of groups) {
          for (let i = 0; i < group.records.length - 1; i++) {
            const a = group.records[i].screeningDate
            const b = group.records[i + 1].screeningDate
            if (a === null) continue // null is always last, so next can be anything
            if (b !== null && a < b) return false
          }
        }
        return true
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property 6: Next-steps lookup table completeness', () => {
  // Feature: screening-results, Property 6: Next-steps lookup table completeness
  it('always returns non-empty string for any type × status', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('vision', 'chatter', 'nutrition', 'hearing', 'unknown'),
        fc.constantFrom('normal', 'borderline', 'needs-attention'),
        (type, status) => {
          const msg = getNextStepsMessage(type as ScreeningType, status as ResultStatus)
          return typeof msg === 'string' && msg.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 7: Report URL extraction', () => {
  // Feature: screening-results, Property 7: Report URL button visibility
  it('only returns non-null for valid URLs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({ reportUrl: fc.webUrl() }).map((o) => JSON.stringify(o)),
          fc.record({ report_url: fc.webUrl() }).map((o) => JSON.stringify(o)),
          fc.record({ reportUrl: fc.string() }).map((o) => JSON.stringify(o)),
          fc.constant(null as unknown as string),
          fc.constant('not-json'),
        ),
        (dataJson) => {
          const result = extractReportUrl(dataJson)
          if (result !== null) {
            try { new URL(result); return true } catch { return false }
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 8: Deep-link child pre-selection', () => {
  // Feature: screening-results, Property 8: Deep-link child pre-selection
  it('selects matching child or defaults to first', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ id: fc.uuid(), name: fc.string({ minLength: 1 }) }), { minLength: 1 }),
        fc.option(fc.uuid(), { nil: null }),
        (children, initialChildId) => {
          const selected = resolveInitialChild(children, initialChildId)
          const isOwned = children.some((c) => c.id === initialChildId)
          if (initialChildId && isOwned) return selected.id === initialChildId
          return selected.id === children[0].id
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 10: Date formatting produces human-readable output', () => {
  // Feature: screening-results, Property 10: Date formatting produces human-readable output
  it('returns non-empty string for valid ISO dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).map((d) => d.toISOString().split('T')[0]),
        (isoDate) => {
          const result = formatScreeningDate(isoDate)
          return typeof result === 'string' && result.length > 0 && result !== 'Date unknown'
        }
      ),
      { numRuns: 100 }
    )
  })
})
