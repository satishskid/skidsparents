/**
 * POST /api/payments/webhook
 * Razorpay webhook handler — no parent auth, verified via HMAC.
 * Idempotent: re-processing an already-confirmed order is a no-op.
 */

import type { APIRoute } from 'astro'
import { verifyRazorpaySignature } from '@/lib/payments'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  // Read raw body first — required for HMAC verification
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400 })
  }

  // RAZORPAY_KEY_SECRET is optional in Env; ?? '' produces a verifiable-but-failing HMAC if unset
  const isValid = await verifyRazorpaySignature(env.RAZORPAY_KEY_SECRET ?? '', rawBody, signature)
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  // Only handle payment.captured events
  if (payload.event !== 'payment.captured') {
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }

  const entity = payload?.payload?.payment?.entity
  if (!entity) {
    return new Response(JSON.stringify({ error: 'Malformed payload' }), { status: 400 })
  }

  const razorpayOrderId = entity.order_id as string
  const paymentId = entity.id as string

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    interface OrderRow { id: string; status: string }
    const order = await db
      .prepare('SELECT id, status FROM service_orders WHERE razorpay_order_id = ?')
      .bind(razorpayOrderId)
      .first<OrderRow>()

    if (!order) {
      // Unknown order — acknowledge to prevent Razorpay retries
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }

    // Idempotent: already confirmed
    if (order.status === 'confirmed') {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }

    await db
      .prepare(
        `UPDATE service_orders SET status = 'confirmed', payment_id = ? WHERE id = ?`
      )
      .bind(paymentId, order.id)
      .run()

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[webhook] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
