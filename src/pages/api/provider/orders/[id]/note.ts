/**
 * POST /api/provider/orders/:id/note — Add a session note to an order
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

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { noteText } = body
  if (!noteText?.trim()) {
    return new Response(JSON.stringify({ error: 'noteText is required' }), { status: 400 })
  }

  try {
    // Verify order belongs to provider and is in a valid state
    interface OrderIdRow { id: string }
    const order = await env.DB.prepare(
      `SELECT id FROM service_orders WHERE id = ? AND provider_id = ? AND status IN ('in_progress', 'completed')`
    ).bind(orderId, providerId).first<OrderIdRow>()

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or not in a state that allows notes' }),
        { status: 404 }
      )
    }

    const noteId = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO session_notes (id, order_id, provider_id, note_text, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(noteId, orderId, providerId, noteText.trim()).run()

    return new Response(JSON.stringify({ success: true, noteId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[provider/orders/note] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to add note' }), { status: 500 })
  }
}
