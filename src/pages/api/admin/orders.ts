/**
 * GET  /api/admin/orders              — list all orders with filters
 * POST /api/admin/orders/:id/reassign — reassign provider
 * POST /api/admin/orders/:id/status   — manual status update
 * POST /api/admin/orders/:id/cancel   — cancel + refund
 *
 * All routes: ADMIN_KEY bearer auth
 */

import type { APIRoute } from 'astro'
import { isValidOrderTransition } from '@/lib/payments'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function checkAuth(request: Request, env: Env): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

async function sendWhatsApp(phone: string, text: string, env: Env): Promise<void> {
  if (!phone || !env.BHASH_USER) return
  const digits = phone.replace(/\D/g, '').replace(/^91/, '')
  if (digits.length !== 10) return
  const params = new URLSearchParams({
    user: env.BHASH_USER,
    pass: env.BHASH_PASS ?? '',       // optional secret; empty string skips auth on BHASH side
    sender: env.BHASH_SENDER ?? '',   // optional; BHASH uses account default if blank
    phone: `91${digits}`,
    text,
    priority: 'ndnd',
    stype: 'normal',
  })
  await fetch(`https://api.bsms.in/api/instant.php?${params}`).catch(() => {})
}

async function writeAuditLog(
  db: D1Database,
  actorId: string,
  actionType: string,
  targetType: string,
  targetId: string,
  previousValueJson: string | null,
  newValueJson: string | null,
  reason: string | null
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_log (id, actor_id, action_type, target_type, target_id, previous_value_json, new_value_json, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      crypto.randomUUID(),
      actorId,
      actionType,
      targetType,
      targetId,
      previousValueJson,
      newValueJson,
      reason
    )
    .run()
}

export const GET: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const status = url.searchParams.get('status')
  const serviceId = url.searchParams.get('serviceId')
  const providerId = url.searchParams.get('providerId')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  try {
    let query = `
      SELECT so.*, s.name as service_name, s.slug as service_slug,
             p.name as provider_name, c.name as child_name,
             par.name as parent_name, par.phone as parent_phone
      FROM service_orders so
      LEFT JOIN services s ON s.id = so.service_id
      LEFT JOIN providers p ON p.id = so.provider_id
      LEFT JOIN children c ON c.id = so.child_id
      LEFT JOIN parents par ON par.id = so.parent_id
      WHERE 1=1
    `
    const bindings: any[] = []

    if (status) { query += ' AND so.status = ?'; bindings.push(status) }
    if (serviceId) { query += ' AND so.service_id = ?'; bindings.push(serviceId) }
    if (providerId) { query += ' AND so.provider_id = ?'; bindings.push(providerId) }
    if (from) { query += ' AND so.created_at >= ?'; bindings.push(from) }
    if (to) { query += ' AND so.created_at <= ?'; bindings.push(to) }

    query += ' ORDER BY so.created_at DESC LIMIT 200'

    const stmt = env.DB.prepare(query)
    const { results } = await stmt.bind(...bindings).all()

    return new Response(JSON.stringify({ orders: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Admin] orders GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const parts = url.pathname.split('/')
  const action = parts[parts.length - 1]   // reassign | status | cancel
  const orderId = parts[parts.length - 2]

  if (!orderId || !['reassign', 'status', 'cancel'].includes(action)) {
    return new Response(JSON.stringify({ error: 'Invalid route' }), { status: 400 })
  }

  try {
    interface OrderRow { id: string; status: string; parent_id: string; provider_id: string; child_id: string; service_id: string; slot_id: string; amount_cents: number; payment_id: string | null; created_at: string; parent_phone: string | null }
    const order = await env.DB.prepare(
      `SELECT so.*, par.phone as parent_phone
       FROM service_orders so
       LEFT JOIN parents par ON par.id = so.parent_id
       WHERE so.id = ?`
    ).bind(orderId).first<OrderRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    }

    if (action === 'reassign') {
      const body = await request.json() as { providerId: string; reason?: string }
      if (!['confirmed', 'scheduled'].includes(order.status)) {
        return new Response(
          JSON.stringify({ error: 'Can only reassign confirmed or scheduled orders' }),
          { status: 409 }
        )
      }
      await env.DB.prepare('UPDATE service_orders SET provider_id = ? WHERE id = ?')
        .bind(body.providerId, orderId).run()

      await writeAuditLog(
        env.DB, 'admin', 'order_reassigned', 'order', orderId,
        JSON.stringify({ provider_id: order.provider_id }),
        JSON.stringify({ provider_id: body.providerId }),
        body.reason || null
      )
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    if (action === 'status') {
      const body = await request.json() as { status: string; reason: string }
      if (!body.reason) {
        return new Response(JSON.stringify({ error: 'reason is required' }), { status: 400 })
      }
      if (!isValidOrderTransition(order.status, body.status)) {
        return new Response(
          JSON.stringify({ error: `Invalid transition: ${order.status} → ${body.status}` }),
          { status: 409 }
        )
      }
      await env.DB.prepare('UPDATE service_orders SET status = ? WHERE id = ?')
        .bind(body.status, orderId).run()

      await writeAuditLog(
        env.DB, 'admin', 'order_status_updated', 'order', orderId,
        JSON.stringify({ status: order.status }),
        JSON.stringify({ status: body.status }),
        body.reason
      )
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    if (action === 'cancel') {
      const body = await request.json() as { reason?: string }
      if (!isValidOrderTransition(order.status, 'cancelled')) {
        return new Response(
          JSON.stringify({ error: `Cannot cancel order in status: ${order.status}` }),
          { status: 409 }
        )
      }

      // Trigger refund if payment exists
      if (order.payment_id && order.amount_cents) {
        const refundRes = await fetch(
          new URL('/api/payments/refund', url.origin).toString(),
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.ADMIN_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId, reason: body.reason || 'Admin cancellation' }),
          }
        )
        if (!refundRes.ok) {
          const err = await refundRes.json() as any
          return new Response(JSON.stringify({ error: `Refund failed: ${err.error}` }), { status: 502 })
        }
      }

      await env.DB.prepare("UPDATE service_orders SET status = 'cancelled' WHERE id = ?")
        .bind(orderId).run()

      await writeAuditLog(
        env.DB, 'admin', 'order_cancelled', 'order', orderId,
        JSON.stringify({ status: order.status }),
        JSON.stringify({ status: 'cancelled' }),
        body.reason || null
      )

      // Notify parent via WhatsApp
      if (order.parent_phone) {
        await sendWhatsApp(
          order.parent_phone,
          `Your SKIDS order (${orderId.slice(0, 8)}) has been cancelled. A refund will be processed within 5–7 business days.`,
          env
        )
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 })
  } catch (e: unknown) {
    console.error('[Admin] orders POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to process order action' }), { status: 500 })
  }
}
