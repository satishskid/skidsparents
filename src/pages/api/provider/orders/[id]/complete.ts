/**
 * POST /api/provider/orders/:id/complete — Mark an in-progress order as completed
 * Requires at least one session note to exist.
 */

import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, params, locals }) => {
  const env = getEnv(locals)
  const orderId = params.id as string

  let providerId: string
  try {
    const id = await getProviderId(request, env)
    if (!id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    providerId = id
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && e.code === 'PROVIDER_PENDING') return new Response(JSON.stringify({ error: 'Account pending review' }), { status: 403 })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    // Verify order belongs to provider and is in_progress
    interface OrderIdRow { id: string }
    const order = await env.DB.prepare(
      `SELECT id FROM service_orders WHERE id = ? AND provider_id = ? AND status = 'in_progress'`
    ).bind(orderId, providerId).first<OrderIdRow>()

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or not in progress' }),
        { status: 404 }
      )
    }

    // Check at least one session note exists
    interface NoteCountRow { c: number }
    const noteCheck = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM session_notes WHERE order_id = ?`
    ).bind(orderId).first<NoteCountRow>()

    if (!noteCheck || noteCheck.c === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one session note is required before completing' }),
        { status: 400 }
      )
    }

    await env.DB.prepare(
      `UPDATE service_orders SET status = 'completed', completed_at = datetime('now') WHERE id = ?`
    ).bind(orderId).run()

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[provider/orders/complete] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to complete order' }), { status: 500 })
  }
}
