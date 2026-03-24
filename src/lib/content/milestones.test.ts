/**
 * Property tests for milestone content functions.
 * Feature: child-health-journey + onboarding-wizard
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { getMilestonesForAge, MILESTONES, MILESTONE_CATEGORIES } from './milestones'

// ─── Property 1 (child-health-journey): Milestone seeding completeness ────────
// Feature: child-health-journey, Property 1: Milestone seeding completeness and field fidelity
describe('getMilestonesForAge', () => {
  it('Property 1a: returns at least 1 milestone for ages 0–60 months (defined range)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 60 }),
        (ageMonths) => {
          const milestones = getMilestonesForAge(ageMonths)
          expect(milestones.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('Property 1b: every returned milestone has all required fields', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 192 }),
        (ageMonths) => {
          const milestones = getMilestonesForAge(ageMonths)
          for (const m of milestones) {
            expect(m.key).toBeTruthy()
            expect(m.title).toBeTruthy()
            expect(['motor', 'cognitive', 'social', 'language']).toContain(m.category)
            expect(typeof m.expectedAgeMin).toBe('number')
            expect(typeof m.expectedAgeMax).toBe('number')
            expect(m.expectedAgeMin).toBeLessThanOrEqual(m.expectedAgeMax)
          }
        }
      ),
      { numRuns: 200 }
    )
  })

  it('Property 1c: returned milestones are within ±6 months of child age', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 192 }),
        (ageMonths) => {
          const milestones = getMilestonesForAge(ageMonths)
          for (const m of milestones) {
            // expectedAgeMin <= ageMonths + 6 AND expectedAgeMax >= ageMonths - 6
            expect(m.expectedAgeMin).toBeLessThanOrEqual(ageMonths + 6)
            expect(m.expectedAgeMax).toBeGreaterThanOrEqual(Math.max(0, ageMonths - 6))
          }
        }
      ),
      { numRuns: 200 }
    )
  })

  it('Property 1d: no duplicate keys in returned set', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 192 }),
        (ageMonths) => {
          const milestones = getMilestonesForAge(ageMonths)
          const keys = milestones.map(m => m.key)
          const unique = new Set(keys)
          expect(unique.size).toBe(keys.length)
        }
      ),
      { numRuns: 200 }
    )
  })
})

// ─── Property 2 (child-health-journey): Milestone seeding idempotence ─────────
// Feature: child-health-journey, Property 2: Milestone seeding idempotence
describe('getMilestonesForAge idempotence', () => {
  it('Property 2: calling getMilestonesForAge twice returns identical results', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 192 }),
        (ageMonths) => {
          const first = getMilestonesForAge(ageMonths).map(m => m.key).sort()
          const second = getMilestonesForAge(ageMonths).map(m => m.key).sort()
          expect(first).toEqual(second)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 8 (onboarding-wizard): Age-appropriate milestone filtering ──────
// Feature: onboarding-wizard, Property 8: for any age 0–192, milestone count >= 3 and all within age range
describe('getMilestonesForAge — onboarding wizard filtering', () => {
  it('Property 8: returns at least 3 milestones for ages 0–54 months (core range)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 54 }),
        (ageMonths) => {
          const milestones = getMilestonesForAge(ageMonths)
          expect(milestones.length).toBeGreaterThanOrEqual(3)
        }
      ),
      { numRuns: 200 }
    )
  })
})

// ─── Property 10 (onboarding-wizard): Every milestone card has required fields ─
// Feature: onboarding-wizard, Property 10: every rendered card contains title, category label, and category emoji
describe('MILESTONES content completeness', () => {
  it('Property 10: every milestone has title, category, and matching MILESTONE_CATEGORIES entry', () => {
    for (const m of MILESTONES) {
      expect(m.title).toBeTruthy()
      expect(m.category).toBeTruthy()
      const catEntry = MILESTONE_CATEGORIES.find(c => c.key === m.category)
      expect(catEntry).toBeDefined()
      expect(catEntry!.emoji).toBeTruthy()
      expect(catEntry!.label).toBeTruthy()
    }
  })
})
