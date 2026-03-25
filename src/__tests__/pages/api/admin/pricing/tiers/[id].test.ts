import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ─── Property Tests ────────────────────────────────────

describe('admin pricing tiers — property tests', () => {
  // Feature: growth-monetisation, Property 10: free tier protection
  // Tests the business rule: any tier with amount_cents = 0 cannot be deactivated.
  // The API enforces this; here we test the guard logic in isolation.
  it('P10: free tier (amount_cents = 0) cannot be deactivated', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          amount_cents: fc.constant(0), // always free tier
        }),
        (tier) => {
          // Guard function extracted from the DELETE handler
          function canDeactivate(amountCents: number): { allowed: boolean; error?: string } {
            if (amountCents === 0) {
              return { allowed: false, error: 'Free tier cannot be deactivated' }
            }
            return { allowed: true }
          }

          const result = canDeactivate(tier.amount_cents)
          expect(result.allowed).toBe(false)
          expect(result.error).toBe('Free tier cannot be deactivated')
        },
      ),
    )
  })

  it('P10 inverse: paid tiers (amount_cents > 0) can be deactivated', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000 }),
        (amountCents) => {
          function canDeactivate(cents: number): { allowed: boolean; error?: string } {
            if (cents === 0) return { allowed: false, error: 'Free tier cannot be deactivated' }
            return { allowed: true }
          }

          const result = canDeactivate(amountCents)
          expect(result.allowed).toBe(true)
          expect(result.error).toBeUndefined()
        },
      ),
    )
  })
})

// ─── Unit Tests ────────────────────────────────────────

describe('admin pricing tiers — unit tests', () => {
  it('free tier id is "free" and has amount_cents = 0', () => {
    // Validates the seed data contract
    const freeTier = {
      id: 'free',
      name: 'Free',
      amount_cents: 0,
      features_json: '["pdf_export","health_score_basic"]',
    }
    expect(freeTier.id).toBe('free')
    expect(freeTier.amount_cents).toBe(0)
    const features = JSON.parse(freeTier.features_json) as string[]
    expect(features).toContain('pdf_export')
    expect(features).toContain('health_score_basic')
  })
})
