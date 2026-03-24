import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { ctaAuthCheck, type StorageLike } from './habit-cta'

function mockStorage(keys: string[]): StorageLike {
  return {
    length: keys.length,
    key: (i: number) => keys[i] ?? null,
  }
}

// ─── Property Tests ────────────────────────────────────

describe('habit-cta — property tests', () => {
  // Feature: growth-monetisation, Property 13: CTA auth-check routing
  it('P13: navigates to /me when a firebase:authUser key is present', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.string()),
        (projectId, otherKeys) => {
          const firebaseKey = `firebase:authUser:${projectId}:[DEFAULT]`
          const storage = mockStorage([...otherKeys, firebaseKey])
          expect(ctaAuthCheck(storage)).toBe('/me')
        },
      ),
    )
  })

  it('P13: navigates to /login?redirect=/me when no firebase:authUser key is present', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string().filter((s) => !s.startsWith('firebase:authUser:'))),
        (keys) => {
          const storage = mockStorage(keys)
          expect(ctaAuthCheck(storage)).toBe('/login?redirect=/me')
        },
      ),
    )
  })
})

// ─── Unit Tests ────────────────────────────────────────

describe('habit-cta — unit tests', () => {
  it('empty storage → /login?redirect=/me', () => {
    expect(ctaAuthCheck(mockStorage([]))).toBe('/login?redirect=/me')
  })

  it('firebase:authUser key present → /me', () => {
    expect(ctaAuthCheck(mockStorage(['firebase:authUser:abc123:[DEFAULT]']))).toBe('/me')
  })

  it('unrelated keys only → /login?redirect=/me', () => {
    expect(ctaAuthCheck(mockStorage(['some-key', 'another-key']))).toBe('/login?redirect=/me')
  })

  it('storage error → /login?redirect=/me', () => {
    const badStorage: StorageLike = {
      length: 1,
      key: () => { throw new Error('SecurityError') },
    }
    expect(ctaAuthCheck(badStorage)).toBe('/login?redirect=/me')
  })
})
