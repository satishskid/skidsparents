/**
 * Property tests for onboarding wizard trigger logic.
 * Feature: onboarding-wizard
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 * Pure function extracted from OnboardingGate trigger logic.
 * Determines whether the onboarding wizard should be shown.
 */
function shouldShowWizard(params: {
  onboardingCompleted: boolean
  isNew: boolean
  childCount: number
}): boolean {
  const { onboardingCompleted, isNew, childCount } = params
  if (onboardingCompleted) return false
  return isNew || childCount === 0
}

// ─── Property 1: onboarding_completed = true always suppresses ────────────────
// Feature: onboarding-wizard, Property 1: onboarding_completed = true always suppresses regardless of isNew or childCount
describe('shouldShowWizard', () => {
  it('Property 1: onboarding_completed=true always suppresses wizard', () => {
    fc.assert(
      fc.property(
        fc.record({
          onboardingCompleted: fc.constant(true),
          isNew: fc.boolean(),
          childCount: fc.nat(),
        }),
        (params) => {
          expect(shouldShowWizard(params)).toBe(false)
        }
      ),
      { numRuns: 200 }
    )
  })

  // ─── Property 2: trigger conditions ─────────────────────────────────────────
  // Feature: onboarding-wizard, Property 2: onboarding_completed=false + childCount=0 always shows; childCount>0 only if isNew=true
  it('Property 2a: onboarding_completed=false + childCount=0 always shows wizard', () => {
    fc.assert(
      fc.property(
        fc.record({
          onboardingCompleted: fc.constant(false),
          isNew: fc.boolean(),
          childCount: fc.constant(0),
        }),
        (params) => {
          expect(shouldShowWizard(params)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 2b: onboarding_completed=false + childCount>0 + isNew=false → suppress', () => {
    fc.assert(
      fc.property(
        fc.record({
          onboardingCompleted: fc.constant(false),
          isNew: fc.constant(false),
          childCount: fc.integer({ min: 1, max: 10 }),
        }),
        (params) => {
          expect(shouldShowWizard(params)).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 2c: onboarding_completed=false + childCount>0 + isNew=true → show', () => {
    fc.assert(
      fc.property(
        fc.record({
          onboardingCompleted: fc.constant(false),
          isNew: fc.constant(true),
          childCount: fc.integer({ min: 1, max: 10 }),
        }),
        (params) => {
          expect(shouldShowWizard(params)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 3: StepIndicator — exactly one active dot ──────────────────────
// Feature: onboarding-wizard, Property 3: for any step in {1,2,3}, exactly one active dot at correct position
describe('StepIndicator logic', () => {
  function getActiveDotIndex(step: number, totalSteps: number): number[] {
    // Returns array of booleans: true = active
    return Array.from({ length: totalSteps }, (_, i) => i + 1 === step ? 1 : 0)
  }

  it('Property 3: exactly one active dot for any step 1–3', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (step) => {
          const dots = getActiveDotIndex(step, 3)
          const activeCount = dots.filter(d => d === 1).length
          expect(activeCount).toBe(1)
          expect(dots[step - 1]).toBe(1)
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ─── Property 4: CTA enabled state ───────────────────────────────────────────
// Feature: onboarding-wizard, Property 4: CTA enabled iff name.trim().length > 0 && dob !== ''
describe('Step1 CTA enabled state', () => {
  function isCTAEnabled(name: string, dob: string): boolean {
    return name.trim().length > 0 && dob !== ''
  }

  it('Property 4a: empty name disables CTA regardless of dob', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (dob) => {
          expect(isCTAEnabled('', dob)).toBe(false)
          expect(isCTAEnabled('   ', dob)).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 4b: empty dob disables CTA regardless of name', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (name) => {
          fc.pre(name.trim().length > 0)
          expect(isCTAEnabled(name, '')).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 4c: non-empty name + non-empty dob enables CTA', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1 }),
        (name, dob) => {
          fc.pre(name.trim().length > 0)
          expect(isCTAEnabled(name, dob)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 5: Name validation ─────────────────────────────────────────────
// Feature: onboarding-wizard, Property 5: empty/whitespace/length>50 names are rejected
describe('Step1 name validation', () => {
  function isValidName(name: string): boolean {
    return name.trim().length > 0 && name.length <= 50
  }

  it('Property 5a: empty string is invalid', () => {
    expect(isValidName('')).toBe(false)
  })

  it('Property 5b: whitespace-only strings are invalid', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim() === ''),
        (name) => {
          expect(isValidName(name)).toBe(false)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Property 5c: strings longer than 50 chars are invalid', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 51, maxLength: 200 }),
        (name) => {
          expect(isValidName(name)).toBe(false)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Property 5d: valid names (1–50 non-whitespace chars) pass', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (name) => {
          fc.pre(name.trim().length > 0)
          expect(isValidName(name)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 15: Celebration screen summary ─────────────────────────────────
// Feature: onboarding-wizard, Property 15: heading contains child name; summary conditional on flags
describe('CelebrationScreen summary logic', () => {
  function buildSummary(childName: string, milestoneLogged: boolean, habitLogged: boolean): string {
    let summary = `You're all set for ${childName}! 🎉`
    if (milestoneLogged) summary += ' Milestone logged.'
    if (habitLogged) summary += ' Habit logged.'
    return summary
  }

  it('Property 15a: heading always contains child name', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.boolean(),
        fc.boolean(),
        (childName, milestoneLogged, habitLogged) => {
          const summary = buildSummary(childName, milestoneLogged, habitLogged)
          expect(summary).toContain(childName)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 15b: milestone text only appears when milestoneLogged=true', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.boolean(),
        (childName, habitLogged) => {
          const withMilestone = buildSummary(childName, true, habitLogged)
          const withoutMilestone = buildSummary(childName, false, habitLogged)
          expect(withMilestone).toContain('Milestone logged')
          expect(withoutMilestone).not.toContain('Milestone logged')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 15c: habit text only appears when habitLogged=true', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.boolean(),
        (childName, milestoneLogged) => {
          const withHabit = buildSummary(childName, milestoneLogged, true)
          const withoutHabit = buildSummary(childName, milestoneLogged, false)
          expect(withHabit).toContain('Habit logged')
          expect(withoutHabit).not.toContain('Habit logged')
        }
      ),
      { numRuns: 100 }
    )
  })
})
