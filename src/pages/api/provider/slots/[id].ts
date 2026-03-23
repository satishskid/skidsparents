/**
 * DELETE /api/provider/slots/:id — Delete a slot (only if not booked)
 */

import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const DELETE: APIRoute = async ({ request, params, locals }) => {
  const env = getEnv(locals)
  const slotId = params.id as string

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
    interface SlotRow { id: string; is_booked: number }
    const slot = await env.DB.prepare(
      `SELECT id, is_booked FROM provider_slots WHERE id = ? AND provider_id = ?`
    ).bind(slotId, providerId).first<SlotRow>()

    if (!slot) {
      return new Response(JSON.stringify({ error: 'Slot not found' }), { status: 404 })
    }

    if (slot.is_booked) {
      return new Response(JSON.stringify({ error: 'Cannot delete a booked slot' }), { status: 409 })
    }

    await env.DB.prepare(`DELETE FROM provider_slots WHERE id = ?`).bind(slotId).run()

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[provider/slots DELETE] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to delete slot' }), { status: 500 })
  }
}
