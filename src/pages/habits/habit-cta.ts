/**
 * Pure helper for habit page CTA auth-check routing.
 * Extracted for testability — no DOM dependencies.
 *
 * Feature: growth-monetisation, Property 13: CTA auth-check routing
 */

export type StorageLike = Pick<Storage, 'length' | 'key'>

/**
 * Check localStorage for a Firebase auth token.
 * Returns '/me' if a token is found, '/login?redirect=/me' otherwise.
 */
export function ctaAuthCheck(storage: StorageLike): '/me' | '/login?redirect=/me' {
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key?.startsWith('firebase:authUser:')) return '/me'
    }
    return '/login?redirect=/me'
  } catch {
    return '/login?redirect=/me'
  }
}
