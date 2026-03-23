/**
 * POST /api/payments/refund
 * Admin-only: issues a full refund via Razorpay and writes an audit_log entry.
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  // Admin auth
  const auth = request.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${env.ADMIN_KEY}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let body: { serviceOrderId?: string; reason?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { serviceOrderId, reason } = body
  if (!serviceOrderId) {
    return new Response(JSON.stringify({ error: 'serviceOrderId is required' }), { status: 400 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    interface OrderRow { id: string; payment_id: string | null; amount_cents: number | null; status: string }
    const order = await db
      .prepare('SELECT id, payment_id, amount_cents, status FROM service_orders WHERE id = ?')
      .bind(serviceOrderId)
      .first<OrderRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    }

    const paymentId = order.payment_id
    const amountCents = order.amount_cents

    if (!paymentId || !amountCents) {
      return new Response(
        JSON.stringify({ error: 'Order has no payment to refund' }),
        { status: 400 }
      )
    }

    // Call Razorpay Refunds API
    const razorpayAuth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)
    const rzpRes = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${razorpayAuth}`,
        },
        body: JSON.stringify({ amount: amountCents }),
      }
    )

    if (!rzpRes.ok) {
      const err = await rzpRes.text()
      console.error('[refund] Razorpay error:', err)
      return new Response(JSON.stringify({ error: 'Razorpay refund failed' }), { status: 502 })
    }

    const refund = await rzpRes.json() as { id: string }

    // Update order status to cancelled
    await db
      .prepare(`UPDATE service_orders SET status = 'cancelled' WHERE id = ?`)
      .bind(serviceOrderId)
      .run()

    // Write audit_log entry
    await db
      .prepare(
        `INSERT INTO audit_log
          (id, actor_id, action_type, target_type, target_id, new_value_json, reason, created_at)
         VALUES (?, 'admin', 'refund_issued', 'order', ?, ?, ?, datetime('now'))`
      )
      .bind(
        crypto.randomUUID(),
        serviceOrderId,
        JSON.stringify({ refundId: refund.id, amount: amountCents }),
        reason || null
      )
      .run()

    return new Response(
      JSON.stringify({ success: true, refundId: refund.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[refund] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
