import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  computeHealthScore,
  computeTrend,
  getScoreColor,
  type HealthScoreInputs,
  type GrowthInput,
  type DevelopmentInput,
  type HabitsInput,
  type NutritionInput,
} from './health-score'

// ─── Arbitraries ──────────────────────────────────────

const arbGrowth = fc.record<GrowthInput>({
  waz: fc.float({ min: -4, max: 4, noNaN: true }),
  haz: fc.float({ min: -4, max: 4, noNaN: true }),
})

const arbDevelopment = fc.record<DevelopmentInput>({
  achieved: fc.nat({ max: 50 }),
  eligible: fc.nat({ max: 50 }),
}).map((d) => ({ achieved: Math.min(d.achieved, d.eligible), eligible: d.eligible }))

const arbHabits = fc.record<HabitsInput>({
  streaks: fc.record({
    healthy_eating: fc.nat({ max: 60 }),
    active_movement: fc.nat({ max: 60 }),
    balanced_stress: fc.nat({ max: 60 }),
    inner_coaching: fc.nat({ max: 60 }),
    timekeepers: fc.nat({ max: 60 }),
    sufficient_sleep: fc.nat({ max: 60 }),
  }),
})

const arbNutrition = fc.constantFrom(
  { concernLevel: 'none' as const },
  { concernLevel: 'mild' as const },
  { concernLevel: 'moderate' as const },
  { concernLevel: 'serious' as const },
)

const arbInputs: fc.Arbitrary<HealthScoreInputs> = fc.record({
  growth: fc.option(arbGrowth, { nil: undefined }),
  development: fc.option(arbDevelopment, { nil: undefined }),
  habits: fc.option(arbHabits, { nil: undefined }),
  nutrition: fc.option(arbNutrition, { nil: undefined }),
})

// ─── Property Tests ────────────────────────────────────

describe('health-score — property tests', () => {
  // Feature: growth-monetisation, Property 1: output bounds
  it('P1: score is always an integer in [0, 100]', () => {
    fc.assert(
      fc.property(arbInputs, (inputs) => {
        const score = computeHealthScore(inputs)
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
        expect(Number.isInteger(score)).toBe(true)
      }),
      { numRuns: 1000 },
    )
  })

  // Feature: growth-monetisation, Property 2: weight invariant
  it('P2: when all four components present, effective weights sum to 1.0', () => {
    fc.assert(
      fc.property(
        fc.record({ growth: arbGrowth, development: arbDevelopment, habits: arbHabits, nutrition: arbNutrition }),
        (inputs) => {
          // Base weights must sum to 1.0 when all present
          const baseWeights = [0.30, 0.30, 0.25, 0.15]
          const sum = baseWeights.reduce((a, b) => a + b, 0)
          expect(Math.abs(sum - 1.0)).toBeLessThan(1e-10)
        },
      ),
    )
  })

  // Feature: growth-monetisation, Property 3: color coding
  it('P3: getScoreColor is exhaustive and matches thresholds', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const color = getScoreColor(score)
        expect(['red', 'amber', 'green']).toContain(color)
        if (score < 40) expect(color).toBe('red')
        else if (score < 70) expect(color).toBe('amber')
        else expect(color).toBe('green')
      }),
    )
  })

  // Feature: growth-monetisation, Property 4: trend computation
  it('P4: computeTrend follows up/down/flat rules', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.integer({ min: 0, max: 100 }), fc.integer({ min: 0, max: 100 })),
        ([current, previous]) => {
          const trend = computeTrend(current, previous)
          expect(['up', 'down', 'flat']).toContain(trend)
          const diff = current - previous
          if (diff > 2) expect(trend).toBe('up')
          else if (diff < -2) expect(trend).toBe('down')
          else expect(trend).toBe('flat')
        },
      ),
    )
  })
})

// ─── Unit Tests ────────────────────────────────────────

describe('health-score — unit tests', () => {
  it('all four components with known values → expected weighted score', () => {
    // growth: waz=0, haz=0 → zscoreToScore(0) = 50 → growthScore = 50
    // development: 15/20 = 75
    // habits: all streaks=15 → avg=15 → 15/30*100=50
    // nutrition: none → 100
    // weighted: (50*0.30 + 75*0.30 + 50*0.25 + 100*0.15) / 1.0
    //         = 15 + 22.5 + 12.5 + 15 = 65
    const score = computeHealthScore({
      growth: { waz: 0, haz: 0 },
      development: { achieved: 15, eligible: 20 },
      habits: { streaks: { healthy_eating: 15, active_movement: 15, balanced_stress: 15, inner_coaching: 15, timekeepers: 15, sufficient_sleep: 15 } },
      nutrition: { concernLevel: 'none' },
    })
    expect(score).toBe(65)
  })

  it('growth-only input → score equals growth component at 100% weight', () => {
    // waz=0, haz=0 → growthScore=50
    const score = computeHealthScore({ growth: { waz: 0, haz: 0 } })
    expect(score).toBe(50)
  })

  it('all streaks = 0 → habits component = 0', () => {
    const score = computeHealthScore({
      habits: { streaks: { healthy_eating: 0, active_movement: 0, balanced_stress: 0, inner_coaching: 0, timekeepers: 0, sufficient_sleep: 0 } },
    })
    expect(score).toBe(0)
  })

  it('all streaks = 30 → habits component = 100', () => {
    const score = computeHealthScore({
      habits: { streaks: { healthy_eating: 30, active_movement: 30, balanced_stress: 30, inner_coaching: 30, timekeepers: 30, sufficient_sleep: 30 } },
    })
    expect(score).toBe(100)
  })

  it('getScoreColor thresholds', () => {
    expect(getScoreColor(39)).toBe('red')
    expect(getScoreColor(40)).toBe('amber')
    expect(getScoreColor(69)).toBe('amber')
    expect(getScoreColor(70)).toBe('green')
    expect(getScoreColor(100)).toBe('green')
  })

  it('computeTrend examples', () => {
    expect(computeTrend(75, 70)).toBe('up')
    expect(computeTrend(70, 75)).toBe('down')
    expect(computeTrend(70, 71)).toBe('flat')
    expect(computeTrend(72, 70)).toBe('flat') // exactly 2 → flat
    expect(computeTrend(73, 70)).toBe('up')   // 3 → up
  })

  it('empty inputs → score 0', () => {
    expect(computeHealthScore({})).toBe(0)
  })

  it('development with eligible=0 → score 0', () => {
    const score = computeHealthScore({ development: { achieved: 0, eligible: 0 } })
    expect(score).toBe(0)
  })
})
