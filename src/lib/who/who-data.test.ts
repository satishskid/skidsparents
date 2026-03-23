// src/lib/who/who-data.test.ts
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  WHO_WEIGHT_MALE, WHO_WEIGHT_FEMALE,
  WHO_HEIGHT_MALE, WHO_HEIGHT_FEMALE,
  WHO_HEAD_MALE, WHO_HEAD_FEMALE,
  WHO_BMI_MALE, WHO_BMI_FEMALE,
  getWhoSeries,
} from './who-data'
import type { Metric } from './interpolate'

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

describe('WHO data series structure', () => {
  it('WHO_WEIGHT_MALE starts at month 0 and ends at month 228', () => {
    expect(WHO_WEIGHT_MALE[0].month).toBe(0)
    expect(WHO_WEIGHT_MALE[WHO_WEIGHT_MALE.length - 1].month).toBe(228)
  })

  it('WHO_WEIGHT_FEMALE starts at month 0 and ends at month 228', () => {
    expect(WHO_WEIGHT_FEMALE[0].month).toBe(0)
    expect(WHO_WEIGHT_FEMALE[WHO_WEIGHT_FEMALE.length - 1].month).toBe(228)
  })

  it('WHO_HEIGHT_MALE starts at month 0 and ends at month 228', () => {
    expect(WHO_HEIGHT_MALE[0].month).toBe(0)
    expect(WHO_HEIGHT_MALE[WHO_HEIGHT_MALE.length - 1].month).toBe(228)
  })

  it('WHO_HEIGHT_FEMALE starts at month 0 and ends at month 228', () => {
    expect(WHO_HEIGHT_FEMALE[0].month).toBe(0)
    expect(WHO_HEIGHT_FEMALE[WHO_HEIGHT_FEMALE.length - 1].month).toBe(228)
  })

  it('WHO_HEAD_MALE starts at month 0 and ends at month 36', () => {
    expect(WHO_HEAD_MALE[0].month).toBe(0)
    expect(WHO_HEAD_MALE[WHO_HEAD_MALE.length - 1].month).toBe(36)
  })

  it('WHO_HEAD_FEMALE starts at month 0 and ends at month 36', () => {
    expect(WHO_HEAD_FEMALE[0].month).toBe(0)
    expect(WHO_HEAD_FEMALE[WHO_HEAD_FEMALE.length - 1].month).toBe(36)
  })

  it('WHO_BMI_MALE starts at month 0 and ends at month 228', () => {
    expect(WHO_BMI_MALE[0].month).toBe(0)
    expect(WHO_BMI_MALE[WHO_BMI_MALE.length - 1].month).toBe(228)
  })

  it('WHO_BMI_FEMALE starts at month 0 and ends at month 228', () => {
    expect(WHO_BMI_FEMALE[0].month).toBe(0)
    expect(WHO_BMI_FEMALE[WHO_BMI_FEMALE.length - 1].month).toBe(228)
  })

  it('WHO_WEIGHT_MALE has 229 entries (months 0–228)', () => {
    expect(WHO_WEIGHT_MALE).toHaveLength(229)
  })

  it('WHO_HEAD_MALE has 37 entries (months 0–36)', () => {
    expect(WHO_HEAD_MALE).toHaveLength(37)
  })

  it('all rows have valid p3 < p15 < p50 < p85 < p97 ordering', () => {
    for (const row of WHO_WEIGHT_MALE) {
      expect(row.p3).toBeLessThan(row.p15)
      expect(row.p15).toBeLessThan(row.p50)
      expect(row.p50).toBeLessThan(row.p85)
      expect(row.p85).toBeLessThan(row.p97)
    }
  })
})

describe('getWhoSeries', () => {
  it('returns male weight series for metric=weight, sex=male', () => {
    expect(getWhoSeries('weight', 'male')).toBe(WHO_WEIGHT_MALE)
  })

  it('returns female weight series for metric=weight, sex=female', () => {
    expect(getWhoSeries('weight', 'female')).toBe(WHO_WEIGHT_FEMALE)
  })

  it('defaults to female for sex=other', () => {
    expect(getWhoSeries('weight', 'other')).toBe(WHO_WEIGHT_FEMALE)
  })

  it('defaults to female for sex=null', () => {
    expect(getWhoSeries('weight', null)).toBe(WHO_WEIGHT_FEMALE)
  })

  it('defaults to female for sex=undefined', () => {
    expect(getWhoSeries('weight', undefined)).toBe(WHO_WEIGHT_FEMALE)
  })

  it('returns male height series', () => {
    expect(getWhoSeries('height', 'male')).toBe(WHO_HEIGHT_MALE)
  })

  it('returns female head series', () => {
    expect(getWhoSeries('head', 'female')).toBe(WHO_HEAD_FEMALE)
  })

  it('returns male BMI series', () => {
    expect(getWhoSeries('bmi', 'male')).toBe(WHO_BMI_MALE)
  })
})

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

// Feature: who-growth-chart, Property 1: WHO data covers the full expected age range
describe('Property 1: WHO data covers the full expected age range', () => {
  it('weight/height/bmi series contain every integer month 0–228; head 0–36', () => {
    // Feature: who-growth-chart, Property 1: WHO data covers the full expected age range
    fc.assert(fc.property(
      fc.constantFrom<Metric>('weight', 'height', 'bmi'),
      fc.constantFrom<'male' | 'female'>('male', 'female'),
      (metric, sex) => {
        const series = getWhoSeries(metric, sex)
        const months = new Set(series.map(r => r.month))
        for (let m = 0; m <= 228; m++) {
          if (!months.has(m)) return false
        }
        return true
      }
    ), { numRuns: 100 })
  })

  it('head series contains every integer month 0–36', () => {
    for (const sex of ['male', 'female'] as const) {
      const series = getWhoSeries('head', sex)
      const months = new Set(series.map(r => r.month))
      for (let m = 0; m <= 36; m++) {
        expect(months.has(m)).toBe(true)
      }
    }
  })
})

// Feature: who-growth-chart, Property 4: Dataset selection by age
describe('Property 4: Dataset selection by age', () => {
  it('for ages 0–60 the series first entry is month 0 and last >= 60', () => {
    // Feature: who-growth-chart, Property 4: Dataset selection by age
    fc.assert(fc.property(
      fc.constantFrom<Metric>('weight', 'height', 'bmi'),
      fc.constantFrom<'male' | 'female'>('male', 'female'),
      (metric, sex) => {
        const series = getWhoSeries(metric, sex)
        return series[0].month === 0 && series[series.length - 1].month >= 60
      }
    ), { numRuns: 100 })
  })

  it('for ages 61–228 the series extends to month 228', () => {
    // Feature: who-growth-chart, Property 4: Dataset selection by age (61–228 range)
    fc.assert(fc.property(
      fc.constantFrom<Metric>('weight', 'height', 'bmi'),
      fc.constantFrom<'male' | 'female'>('male', 'female'),
      (metric, sex) => {
        const series = getWhoSeries(metric, sex)
        return series[series.length - 1].month === 228
      }
    ), { numRuns: 100 })
  })
})
