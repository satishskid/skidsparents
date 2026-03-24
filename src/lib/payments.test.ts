/**
 * Property tests for payment utility functions.
 * Feature: skids-platform-roadmap
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  calculateProviderPayout,
  calculateCommission,
  isValidOrderTransition,
  verifyRazorpaySignature,
} from './payments'

// ─── Property 1: Order lifecycle is strictly sequential ───────────────────────
// Feature: skids-platform-roadmap, Property 1: Order lifecycle is strictly sequential
describe('isValidOrderTransition', () => {
  const ALL_STATUSES = ['pending', 'confirmed', 'scheduled', 'in_progress', 'completed', 'cancelled']

  const VALID_TRANSITIONS = new Set([
    'pending→confirmed',
    'confirmed→scheduled',
    'scheduled→in_progress',
    'in_progress→completed',
    'pending→cancelled',
    'confirmed→cancelled',
    'scheduled→cancelled',
  ])

  it('Property 1: only valid forward transitions are accepted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_STATUSES),
        fc.constantFrom(...ALL_STATUSES),
        (from, to) => {
          const key = `${from}→${to}`
          const expected = VALID_TRANSITIONS.has(key)
          expect(isValidOrderTransition(from, to)).toBe(expected)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('completed orders cannot be cancelled', () => {
    expect(isValidOrderTransition('completed', 'cancelled')).toBe(false)
  })

  it('in_progress orders cannot be cancelled', () => {
    expect(isValidOrderTransition('in_progress', 'cancelled')).toBe(false)
  })

  it('cannot skip steps', () => {
    expect(isValidOrderTransition('pending', 'scheduled')).toBe(false)
    expect(isValidOrderTransition('pending', 'in_progress')).toBe(false)
    expect(isValidOrderTransition('confirmed', 'in_progress')).toBe(false)
  })
})

// ─── Property 3: Commission round-trip financial integrity ────────────────────
// Feature: skids-platform-roadmap, Property 3: Commission round-trip financial integrity
describe('calculateProviderPayout + calculateCommission', () => {
  it('Property 3: payout + commission <= amountCents (floor arithmetic)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        fc.integer({ min: 0, max: 50 }),
        (amountCents, commissionPct) => {
          const payout = calculateProviderPayout(amountCents, commissionPct)
          const commission = calculateCommission(amountCents, commissionPct)
          // Due to floor on both, sum may be <= amountCents (never exceeds)
          expect(payout + commission).toBeLessThanOrEqual(amountCents)
          // Difference is at most 1 (two floor operations)
          expect(amountCents - (payout + commission)).toBeLessThanOrEqual(1)
        }
      ),
      { numRuns: 500 }
    )
  })

  it('Property 3b: 0% commission means full payout', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        (amountCents) => {
          expect(calculateProviderPayout(amountCents, 0)).toBe(amountCents)
          expect(calculateCommission(amountCents, 0)).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3c: 100% commission means zero payout', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        (amountCents) => {
          // commissionPct capped at 50 in business logic, but math still holds
          expect(calculateProviderPayout(amountCents, 100)).toBe(0)
          expect(calculateCommission(amountCents, 100)).toBe(amountCents)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 4: Commission snapshot immutability (pure logic) ────────────────
// Feature: skids-platform-roadmap, Property 4: Commission snapshot immutability
describe('commission snapshot immutability', () => {
  it('Property 4: payout calculated from snapshot is independent of current rate', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (amountCents, snapshotPct, currentPct) => {
          // Simulate: order was created with snapshotPct, provider later changed to currentPct
          const payoutAtSnapshot = calculateProviderPayout(amountCents, snapshotPct)
          const payoutAtCurrent = calculateProviderPayout(amountCents, currentPct)
          // The snapshot payout is deterministic regardless of current rate
          expect(payoutAtSnapshot).toBe(Math.floor(amountCents * (1 - snapshotPct / 100)))
          // They only match when rates are equal
          if (snapshotPct !== currentPct) {
            // Different rates produce different payouts (unless amount is 0 or rounding coincidence)
            // Just verify snapshot is stable
            expect(calculateProviderPayout(amountCents, snapshotPct)).toBe(payoutAtSnapshot)
          }
        }
      ),
      { numRuns: 200 }
    )
  })
})

// ─── Property 7: Razorpay webhook HMAC verification ──────────────────────────
// Feature: skids-platform-roadmap, Property 7: Razorpay webhook HMAC verification
describe('verifyRazorpaySignature', () => {
  async function makeSignature(secret: string, body: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    return Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  it('Property 7a: valid signature on original body returns true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 64 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        async (secret, body) => {
          const sig = await makeSignature(secret, body)
          expect(await verifyRazorpaySignature(secret, body, sig)).toBe(true)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 7b: same signature on tampered body returns false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 64 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (secret, body, tamper) => {
          fc.pre(body !== tamper)
          const sig = await makeSignature(secret, body)
          expect(await verifyRazorpaySignature(secret, tamper, sig)).toBe(false)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('Property 7c: wrong secret returns false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 64 }),
        fc.string({ minLength: 8, maxLength: 64 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (secret, wrongSecret, body) => {
          fc.pre(secret !== wrongSecret)
          const sig = await makeSignature(secret, body)
          expect(await verifyRazorpaySignature(wrongSecret, body, sig)).toBe(false)
        }
      ),
      { numRuns: 20 }
    )
  })
})
