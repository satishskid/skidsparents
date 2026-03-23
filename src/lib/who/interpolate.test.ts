// src/lib/who/interpolate.test.ts
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  calcAgeMonths,
  interpolateWho,
  interpolatePercentile,
  calcBmi,
  getInterpretationMessage,
  calcXDomain,
  toChartPoints,
  type WhoSeries,
  type GrowthRecord,
  type Metric,
} from './interpolate'

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

describe('calcAgeMonths', () => {
  it('returns 0 for same-day measurement', () => {
    expect(calcAgeMonths('2023-01-01', '2023-01-01')).toBe(0)
  })

  it('returns correct months for a known date pair', () => {
    // 365 days / 30.4375 ≈ 11.99 → floor = 11
    expect(calcAgeMonths('2024-01-01', '2023-01-01')).toBe(11)
  })

  it('handles leap year correctly', () => {
    // 2020 is a leap year; 366 days / 30.4375 ≈ 12.02 → floor = 12
    expect(calcAgeMonths('2021-01-01', '2020-01-01')).toBe(12)
  })

  it('returns 0 for measurement one day after dob', () => {
    expect(calcAgeMonths('2023-01-02', '2023-01-01')).toBe(0)
  })

  it('returns 1 for measurement ~31 days after dob', () => {
    // 31 days / 30.4375 ≈ 1.018 → floor = 1
    expect(calcAgeMonths('2023-02-01', '2023-01-01')).toBe(1)
  })

  it('returns 24 months for 2 years', () => {
    // 730 days / 30.4375 ≈ 23.98 → floor = 23 (not 24 due to 30.4375 rounding)
    // 731 days / 30.4375 ≈ 24.01 → floor = 24
    expect(calcAgeMonths('2025-01-02', '2023-01-01')).toBe(24)
  })
})

describe('interpolateWho', () => {
  const series: WhoSeries = [
    { month: 0, p3: 10, p15: 12, p50: 15, p85: 18, p97: 20 },
    { month: 6, p3: 16, p15: 18, p50: 21, p85: 24, p97: 26 },
    { month: 12, p3: 20, p15: 22, p50: 25, p85: 28, p97: 30 },
  ]

  it('returns exact value at tabulated month', () => {
    expect(interpolateWho(0, 'p50', series)).toBe(15)
    expect(interpolateWho(6, 'p50', series)).toBe(21)
    expect(interpolateWho(12, 'p50', series)).toBe(25)
  })

  it('interpolates midpoint correctly', () => {
    // midpoint between month 0 (p50=15) and month 6 (p50=21) → 18
    expect(interpolateWho(3, 'p50', series)).toBeCloseTo(18, 9)
  })

  it('returns null for empty series', () => {
    expect(interpolateWho(5, 'p50', [])).toBeNull()
  })

  it('returns null for age below range', () => {
    expect(interpolateWho(-1, 'p50', series)).toBeNull()
  })

  it('returns null for age above range', () => {
    expect(interpolateWho(13, 'p50', series)).toBeNull()
  })

  it('works for all percentile columns', () => {
    expect(interpolateWho(0, 'p3', series)).toBe(10)
    expect(interpolateWho(0, 'p15', series)).toBe(12)
    expect(interpolateWho(0, 'p85', series)).toBe(18)
    expect(interpolateWho(0, 'p97', series)).toBe(20)
  })
})

describe('interpolatePercentile', () => {
  const series: WhoSeries = [
    { month: 0, p3: 10, p15: 12, p50: 15, p85: 18, p97: 20 },
    { month: 12, p3: 20, p15: 22, p50: 25, p85: 28, p97: 30 },
  ]

  it('returns 3 for value at p3', () => {
    expect(interpolatePercentile(0, 10, series)).toBe(3)
  })

  it('returns 97 for value at p97', () => {
    expect(interpolatePercentile(0, 20, series)).toBe(97)
  })

  it('returns 50 for value at p50', () => {
    expect(interpolatePercentile(0, 15, series)).toBe(50)
  })

  it('returns 3 for value below p3', () => {
    expect(interpolatePercentile(0, 5, series)).toBe(3)
  })

  it('returns 97 for value above p97', () => {
    expect(interpolatePercentile(0, 25, series)).toBe(97)
  })

  it('interpolates between p3 and p15', () => {
    // midpoint between p3=10 and p15=12 → percentile = 3 + (15-3)*0.5 = 9
    expect(interpolatePercentile(0, 11, series)).toBeCloseTo(9, 9)
  })

  it('returns null for out-of-range age', () => {
    expect(interpolatePercentile(100, 15, series)).toBeNull()
  })
})

describe('calcBmi', () => {
  it('calculates BMI correctly for standard values', () => {
    // 70 kg / (1.75 m)^2 = 22.857...
    expect(calcBmi(70, 175)).toBeCloseTo(22.857, 2)
  })

  it('calculates BMI for small values', () => {
    // 5 kg / (0.5 m)^2 = 20
    expect(calcBmi(5, 50)).toBeCloseTo(20, 9)
  })

  it('calculates BMI for large values', () => {
    // 150 kg / (2.0 m)^2 = 37.5
    expect(calcBmi(150, 200)).toBeCloseTo(37.5, 9)
  })
})

describe('getInterpretationMessage', () => {
  it('returns below-3rd message for rank < 3', () => {
    const msg = getInterpretationMessage('Alice', 'weight', 1)
    expect(msg).toContain('Alice')
    expect(msg).toContain('weight')
    expect(msg).toContain('below the typical range')
  })

  it('returns 3rd-15th message for rank in [3, 15)', () => {
    const msg = getInterpretationMessage('Bob', 'height', 10)
    expect(msg).toContain('Bob')
    expect(msg).toContain('smaller side')
  })

  it('returns 15th-85th message for rank in [15, 85]', () => {
    const msg = getInterpretationMessage('Charlie', 'bmi', 50)
    expect(msg).toContain('Charlie')
    expect(msg).toContain('typical range')
  })

  it('returns 85th-97th message for rank in (85, 97]', () => {
    const msg = getInterpretationMessage('Diana', 'head', 90)
    expect(msg).toContain('Diana')
    expect(msg).toContain('larger side')
  })

  it('returns above-97th message for rank > 97', () => {
    const msg = getInterpretationMessage('Eve', 'weight', 99)
    expect(msg).toContain('Eve')
    expect(msg).toContain('above the typical range')
  })

  it('uses correct metric label for head circumference', () => {
    const msg = getInterpretationMessage('Frank', 'head', 1)
    expect(msg).toContain('head circumference')
  })

  it('uses correct metric label for BMI', () => {
    const msg = getInterpretationMessage('Grace', 'bmi', 1)
    expect(msg).toContain('BMI')
  })
})

describe('calcXDomain', () => {
  it('returns [0, 6] for age 0', () => {
    expect(calcXDomain(0)).toEqual([0, 6])
  })

  it('returns [0, 66] for age 60', () => {
    expect(calcXDomain(60)).toEqual([0, 66])
  })

  it('returns [0, 234] for age 228', () => {
    expect(calcXDomain(228)).toEqual([0, 234])
  })
})

describe('toChartPoints', () => {
  const dob = '2020-01-01'

  it('filters out null weight values', () => {
    const records: GrowthRecord[] = [
      { date: '2020-07-01', weightKg: 7.5, heightCm: 65, headCm: 42, bmiKgm2: 17.7 },
      { date: '2021-01-01', weightKg: null, heightCm: 75, headCm: 45, bmiKgm2: null },
    ]
    const points = toChartPoints(records, 'weight', dob)
    expect(points).toHaveLength(1)
    expect(points[0].value).toBe(7.5)
  })

  it('returns empty array for all-null records', () => {
    const records: GrowthRecord[] = [
      { date: '2020-07-01', weightKg: null, heightCm: null, headCm: null, bmiKgm2: null },
    ]
    expect(toChartPoints(records, 'weight', dob)).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(toChartPoints([], 'weight', dob)).toHaveLength(0)
  })

  it('maps to correct ChartPoint shape', () => {
    const records: GrowthRecord[] = [
      { date: '2020-07-01', weightKg: 7.5, heightCm: 65, headCm: 42, bmiKgm2: 17.7 },
    ]
    const points = toChartPoints(records, 'weight', dob)
    expect(points[0]).toMatchObject({
      value: 7.5,
      date: '2020-07-01',
    })
    expect(typeof points[0].ageMonths).toBe('number')
  })

  it('handles mixed null/non-null records for height', () => {
    const records: GrowthRecord[] = [
      { date: '2020-07-01', weightKg: 7.5, heightCm: 65, headCm: 42, bmiKgm2: 17.7 },
      { date: '2021-01-01', weightKg: 9.0, heightCm: null, headCm: 45, bmiKgm2: null },
      { date: '2021-07-01', weightKg: 10.5, heightCm: 80, headCm: 47, bmiKgm2: 16.4 },
    ]
    const points = toChartPoints(records, 'height', dob)
    expect(points).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

// Feature: who-growth-chart, Property 2: Linear interpolation correctness
describe('Property 2: Linear interpolation correctness', () => {
  it('interpolateWho equals linear formula within ±1e-9 for any fractional age between adjacent rows', () => {
    const series: WhoSeries = [
      { month: 0,  p3: 10, p15: 12, p50: 15, p85: 18, p97: 20 },
      { month: 6,  p3: 16, p15: 18, p50: 21, p85: 24, p97: 26 },
      { month: 12, p3: 20, p15: 22, p50: 25, p85: 28, p97: 30 },
      { month: 24, p3: 25, p15: 27, p50: 30, p85: 33, p97: 35 },
    ]
    // Feature: who-growth-chart, Property 2: Linear interpolation correctness
    fc.assert(fc.property(
      fc.integer({ min: 0, max: series.length - 2 }),
      fc.float({ min: 0, max: 1, noNaN: true }),
      (i, t) => {
        const x = series[i].month + t * (series[i + 1].month - series[i].month)
        const result = interpolateWho(x, 'p50', series)
        const expected = series[i].p50 + t * (series[i + 1].p50 - series[i].p50)
        return result !== null && Math.abs(result - expected) < 1e-9
      }
    ), { numRuns: 100 })
  })
})

// Feature: who-growth-chart, Property 3: Age calculation determinism
describe('Property 3: Age calculation determinism', () => {
  it('calcAgeMonths returns the same non-negative integer on repeated calls', () => {
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
  })
})

// Feature: who-growth-chart, Property 5: BMI round-trip
describe('Property 5: BMI round-trip', () => {
  it('calcBmi equals weightKg / (heightCm/100)^2 within ±1e-9', () => {
    // Feature: who-growth-chart, Property 5: BMI round-trip
    fc.assert(fc.property(
      fc.float({ min: 1, max: 150, noNaN: true }),
      fc.float({ min: 30, max: 250, noNaN: true }),
      (weightKg, heightCm) => {
        const bmi = calcBmi(weightKg, heightCm)
        const expected = weightKg / Math.pow(heightCm / 100, 2)
        return Math.abs(bmi - expected) < 1e-9
      }
    ), { numRuns: 100 })
  })
})

// Feature: who-growth-chart, Property 6: Interpretation message correctness
describe('Property 6: Interpretation message contains child name', () => {
  it('getInterpretationMessage returns a string containing the child name for any rank in [0,100]', () => {
    // Feature: who-growth-chart, Property 6: Interpretation message contains child name and correct band
    fc.assert(fc.property(
      fc.string({ minLength: 1 }),
      fc.constantFrom<Metric>('weight', 'height', 'head', 'bmi'),
      fc.float({ min: 0, max: 100, noNaN: true }),
      (name, metric, rank) => {
        const msg = getInterpretationMessage(name, metric, rank)
        return msg.includes(name)
      }
    ), { numRuns: 100 })
  })
})

// Feature: who-growth-chart, Property 7: Null metric values filtered without error
describe('Property 7: Null metric values are filtered without error', () => {
  it('toChartPoints returns only non-null entries without throwing', () => {
    // Feature: who-growth-chart, Property 7: Null metric values are filtered without error
    fc.assert(fc.property(
      fc.array(fc.record({
        date: fc.constant('2022-06-01'),
        weightKg: fc.option(fc.float({ min: 1, max: 100, noNaN: true }), { nil: null }),
        heightCm: fc.option(fc.float({ min: 30, max: 200, noNaN: true }), { nil: null }),
        headCm: fc.option(fc.float({ min: 20, max: 60, noNaN: true }), { nil: null }),
        bmiKgm2: fc.option(fc.float({ min: 10, max: 40, noNaN: true }), { nil: null }),
      })),
      (records) => {
        const points = toChartPoints(records as GrowthRecord[], 'weight', '2020-01-01')
        const nonNull = records.filter(r => r.weightKg !== null && r.weightKg !== undefined)
        return points.length === nonNull.length
      }
    ), { numRuns: 100 })
  })
})

// Feature: who-growth-chart, Property 8: X-axis domain
describe('Property 8: X-axis domain includes current age plus 6 months', () => {
  it('calcXDomain returns [0, a + 6] for any age a >= 0', () => {
    // Feature: who-growth-chart, Property 8: X-axis domain includes current age plus 6 months
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 228 }),
      (age) => {
        const [lo, hi] = calcXDomain(age)
        return lo === 0 && hi === age + 6
      }
    ), { numRuns: 100 })
  })
})
