/**
 * Pure pricing utility functions for teleconsult discount handling.
 */

/**
 * Computes the discounted price in cents.
 * discountPct must be in [0, 100].
 * Returns floor(priceCents * (1 - discountPct / 100)).
 * Result is always in [0, priceCents].
 */
export function computeDiscountedPrice(priceCents: number, discountPct: number): number {
  return Math.floor(priceCents * (1 - discountPct / 100))
}

/**
 * Parses the discount percentage from a features array.
 * Looks for an entry matching "teleconsult_discount_pct:N".
 * Returns N as an integer in [0,100], or 0 if not found or malformed.
 */
export function parseDiscountPct(features: string[]): number {
  for (const f of features) {
    const m = f.match(/^teleconsult_discount_pct:(\d+)$/)
    if (m) {
      const n = parseInt(m[1], 10)
      return n >= 0 && n <= 100 ? n : 0
    }
  }
  return 0
}

/**
 * Serialises a discount percentage to the feature key string format.
 * n should be an integer in [0, 100].
 */
export function serializeDiscountPct(n: number): string {
  return `teleconsult_discount_pct:${Math.round(n)}`
}
