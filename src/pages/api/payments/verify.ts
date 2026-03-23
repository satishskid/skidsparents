/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature, confirms the order, and sends WhatsApp notification.
 */

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { verifyRazorpaySignature } from '@/lib/payments'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

async function sendWhatsApp(
  env: Env,
  phone: string,
  message: string
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      user: env.BHASH_USER ?? '',       // optional; empty string is a no-op for BHASH
      pass: env.BHASH_PASS ?? '',       // optional secret
      sender: env.BHASH_SENDER ?? '',   // optional; BHASH uses account default if blank
      phone,
      text: message,
      priority: 'ndnd',
      stype: 'normal',
    })
    const res = await fetch(`https://api.bsms.in/api/instant.php?${params.toString()}`)
    return res.ok
  } catch {
    return false
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let body: {
    razorpayPaymentId?: string
    razorpayOrderId?: string
    razorpaySignature?: string
    serviceOrderId?: string
  }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { razorpayPaymentId, razorpayOrderId, razorpaySignature, serviceOrderId } = body
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !serviceOrderId) {
    return new Response(
      JSON.stringify({ error: 'razorpayPaymentId, razorpayOrderId, razorpaySignature, serviceOrderId are required' }),
      { status: 400 }
    )
  }

  // Verify HMAC signature — RAZORPAY_KEY_SECRET is optional in Env; guard ensures it's set
  const isValid = await verifyRazorpaySignature(
    env.RAZORPAY_KEY_SECRET ?? '',
    `${razorpayPaymentId}|${razorpayOrderId}`,
    razorpaySignature
  )
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid payment signature' }), { status: 400 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    // Fetch order and verify ownership + status
    interface OrderRow { id: string; status: string; service_name: string }
    const order = await db
      .prepare(
        `SELECT so.*, s.name as service_name
         FROM service_orders so
         JOIN services s ON s.id = so.service_id
         WHERE so.id = ? AND so.parent_id = ?`
      )
      .bind(serviceOrderId, parentId)
      .first<OrderRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    }
    if (order.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Order is not in pending state' }), { status: 409 })
    }

    // Confirm the order
    await db
      .prepare(
        `UPDATE service_orders
         SET status = 'confirmed', payment_id = ?, amount_cents = COALESCE(amount_cents, ?)
         WHERE id = ?`
      )
      .bind(razorpayPaymentId, 0, serviceOrderId)
      .run()

    // Send WhatsApp to parent
    interface ParentPhoneRow { phone: string }
    const parent = await db
      .prepare('SELECT phone FROM parents WHERE id = ?')
      .bind(parentId)
      .first<ParentPhoneRow>()

    let whatsappStatus = 'failed'
    if (parent && parent.phone) {
      const message =
        `SKIDS: Payment confirmed for ${order.service_name}. ` +
        `Order ID: ${serviceOrderId}. ` +
        `We'll confirm your appointment shortly. -Team SKIDS`
      const sent = await sendWhatsApp(env, parent.phone, message)
      whatsappStatus = sent ? 'sent' : 'failed'
    }

    await db
      .prepare(`UPDATE service_orders SET whatsapp_status = ? WHERE id = ?`)
      .bind(whatsappStatus, serviceOrderId)
      .run()

    return new Response(
      JSON.stringify({ success: true, serviceOrderId, status: 'confirmed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[verify] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
