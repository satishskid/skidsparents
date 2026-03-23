/**
 * Pure payment utility functions for SKIDS platform.
 * Uses Web Crypto API (available in Cloudflare Workers).
 */

/**
 * Verify a Razorpay HMAC-SHA256 signature.
 * @param secret  RAZORPAY_KEY_SECRET
 * @param body    "paymentId|orderId"
 * @param sig     hex signature from Razorpay
 */
export async function verifyRazorpaySignature(
  secret: string,
  body: string,
  sig: string
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const hex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return hex === sig
}

/**
 * Calculate provider payout after commission deduction.
 * Returns integer (floor).
 */
export function calculateProviderPayout(amountCents: number, commissionPct: number): number {
  return Math.floor(amountCents * (1 - commissionPct / 100))
}

/**
 * Calculate commission amount.
 * Returns integer (floor).
 */
export function calculateCommission(amountCents: number, commissionPct: number): number {
  return Math.floor(amountCents * (commissionPct / 100))
}

/**
 * Validate an order status transition.
 * Valid forward path: pending → confirmed → scheduled → in_progress → completed
 * cancelled is reachable from: pending, confirmed, scheduled (NOT in_progress or completed)
 */
export function isValidOrderTransition(from: string, to: string): boolean {
  const forward: Record<string, string> = {
    pending: 'confirmed',
    confirmed: 'scheduled',
    scheduled: 'in_progress',
    in_progress: 'completed',
  }
  const cancellable = new Set(['pending', 'confirmed', 'scheduled'])

  if (to === 'cancelled') return cancellable.has(from)
  return forward[from] === to
}
