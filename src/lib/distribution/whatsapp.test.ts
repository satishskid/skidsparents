// WhatsApp / BHASH property-based tests
// Feature: brand-awareness

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { BHASHService } from './whatsapp'

// ─── Shared service instance (credentials don't matter for normalizePhone) ──

const svc = new BHASHService({
  BHASH_USER: 'test',
  BHASH_PASS: 'test',
  BHASH_SENDER: 'BUZWAP',
})

// ─── Generators for phone number formats ───────────────────────────────────

/** 10-digit Indian mobile number starting with 6-9 */
const tenDigit = fc
  .integer({ min: 6000000000, max: 9999999999 })
  .map(n => String(n))

/** Same number with +91 prefix */
const withPlusPrefix = tenDigit.map(n => `+91${n}`)

/** Same number with 91 prefix (no +) */
const with91Prefix = tenDigit.map(n => `91${n}`)

/** Number with spaces interspersed */
const withSpaces = tenDigit.map(n => `${n.slice(0, 5)} ${n.slice(5)}`)

/** Number with +91 and spaces */
const withPlusAndSpaces = tenDigit.map(n => `+91 ${n.slice(0, 5)} ${n.slice(5)}`)

// ─── Property 10: WhatsApp message formatting ──────────────────────────────

describe('Feature: brand-awareness, Property 10: WhatsApp message formatting', () => {
  it('plain 10-digit number should be returned as-is', () => {
    fc.assert(
      fc.property(tenDigit, (phone) => {
        const result = svc.normalizePhone(phone)
        expect(result).toMatch(/^\d{10}$/)
        expect(result).toBe(phone)
      }),
      { numRuns: 100 }
    )
  })

  it('+91XXXXXXXXXX format should normalize to 10 digits', () => {
    fc.assert(
      fc.property(withPlusPrefix, (phone) => {
        const result = svc.normalizePhone(phone)
        expect(result).toMatch(/^\d{10}$/)
        expect(result.length).toBe(10)
      }),
      { numRuns: 100 }
    )
  })

  it('91XXXXXXXXXX format (no +) should normalize to 10 digits', () => {
    fc.assert(
      fc.property(with91Prefix, (phone) => {
        const result = svc.normalizePhone(phone)
        expect(result).toMatch(/^\d{10}$/)
        expect(result.length).toBe(10)
      }),
      { numRuns: 100 }
    )
  })

  it('number with spaces should normalize to 10 digits with no non-digit characters', () => {
    fc.assert(
      fc.property(withSpaces, (phone) => {
        const result = svc.normalizePhone(phone)
        expect(result).toMatch(/^\d{10}$/)
        expect(result).not.toContain(' ')
      }),
      { numRuns: 100 }
    )
  })

  it('+91 with spaces should normalize to 10 digits', () => {
    fc.assert(
      fc.property(withPlusAndSpaces, (phone) => {
        const result = svc.normalizePhone(phone)
        expect(result).toMatch(/^\d{10}$/)
        expect(result.length).toBe(10)
      }),
      { numRuns: 100 }
    )
  })

  it('all valid formats should produce the same 10-digit number', () => {
    fc.assert(
      fc.property(tenDigit, (base) => {
        const formats = [
          base,
          `+91${base}`,
          `91${base}`,
          `${base.slice(0, 5)} ${base.slice(5)}`,
        ]
        const results = formats.map(f => svc.normalizePhone(f))
        // All formats should normalize to the same 10-digit number
        expect(new Set(results).size).toBe(1)
        expect(results[0]).toBe(base)
      }),
      { numRuns: 100 }
    )
  })

  it('invalid phone numbers should throw', () => {
    const invalidPhones = ['123', '12345', 'abcdefghij', '+1234567890123']
    for (const phone of invalidPhones) {
      expect(() => svc.normalizePhone(phone)).toThrow()
    }
  })
})
