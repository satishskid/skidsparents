import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { computeDiscountedPrice, parseDiscountPct, serializeDiscountPct } from './discount'

describe('computeDiscountedPrice — unit tests', () => {
  it('applies 20% discount', () => expect(computeDiscountedPrice(10000, 20)).toBe(8000))
  it('zero discount returns original', () => expect(computeDiscountedPrice(10000, 0)).toBe(10000))
  it('100% discount returns 0', () => expect(computeDiscountedPrice(10000, 100)).toBe(0))
  it('floors fractional result', () => expect(computeDiscountedPrice(999, 33)).toBe(669))
})

describe('parseDiscountPct — unit tests', () => {
  it('parses valid entry', () => expect(parseDiscountPct(['teleconsult_discount_pct:20'])).toBe(20))
  it('returns 0 for empty array', () => expect(parseDiscountPct([])).toBe(0))
  it('returns 0 for non-numeric value', () => expect(parseDiscountPct(['teleconsult_discount_pct:abc'])).toBe(0))
  it('returns 0 for out-of-range value', () => expect(parseDiscountPct(['teleconsult_discount_pct:150'])).toBe(0))
  it('ignores unrelated features', () => expect(parseDiscountPct(['pdf_export', 'health_score_basic'])).toBe(0))
})

describe('serializeDiscountPct — unit tests', () => {
  it('serialises 20', () => expect(serializeDiscountPct(20)).toBe('teleconsult_discount_pct:20'))
  it('rounds fractional input', () => expect(serializeDiscountPct(20.6)).toBe('teleconsult_discount_pct:21'))
})

// Feature: subscription-features-ui, Property 4: Discount config round-trip
describe('Property 4: Discount config round-trip', () => {
  it('parseDiscountPct(serializeDiscountPct(N)) === N for all N in [0,100]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (n) => {
        return parseDiscountPct([serializeDiscountPct(n)]) === n
      }),
    )
  })
})

// Feature: subscription-features-ui, Property 5: Discount computation bounds and identity
describe('Property 5: Discount computation bounds and identity', () => {
  it('result is always in [0, priceCents]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        fc.integer({ min: 0, max: 100 }),
        (priceCents, discountPct) => {
          const result = computeDiscountedPrice(priceCents, discountPct)
          return result >= 0 && result <= priceCents
        },
      ),
      { numRuns: 500 },
    )
  })

  it('zero discount is identity', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0 }), (p) => {
        return computeDiscountedPrice(p, 0) === p
      }),
    )
  })

  it('100% discount annihilates price', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0 }), (p) => {
        return computeDiscountedPrice(p, 100) === 0
      }),
    )
  })
})
