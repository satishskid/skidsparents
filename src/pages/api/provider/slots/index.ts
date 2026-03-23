/**
 * GET  /api/provider/slots — List provider's own slots
 * POST /api/provider/slots — Create a new slot
 */

import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

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
    const { results } = await env.DB.prepare(
      `SELECT * FROM provider_slots WHERE provider_id = ? ORDER BY created_at DESC`
    ).bind(providerId).all()

    return new Response(JSON.stringify({ slots: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[provider/slots GET] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch slots' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

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

  const { slotType, dayOfWeek, date, startTime, endTime, serviceId } = body

  if (!slotType || !startTime || !endTime) {
    return new Response(JSON.stringify({ error: 'slotType, startTime, and endTime are required' }), { status: 400 })
  }

  if (startTime >= endTime) {
    return new Response(JSON.stringify({ error: 'startTime must be before endTime' }), { status: 400 })
  }

  try {
    // For recurring slots: check no overlap with existing non-blocked slots on same dayOfWeek+time
    if (slotType === 'recurring' && dayOfWeek !== undefined && dayOfWeek !== null) {
      interface SlotIdRow { id: string }
      const overlap = await env.DB.prepare(
        `SELECT id FROM provider_slots
         WHERE provider_id = ? AND slot_type = 'recurring' AND day_of_week = ?
           AND is_booked = 0 AND slot_type != 'blocked'
           AND NOT (end_time <= ? OR start_time >= ?)`
      ).bind(providerId, dayOfWeek, startTime, endTime).first<SlotIdRow>()

      if (overlap) {
        return new Response(
          JSON.stringify({ error: 'Slot overlaps with an existing recurring slot' }),
          { status: 409 }
        )
      }
    }

    const slotId = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO provider_slots (id, provider_id, slot_type, day_of_week, date, start_time, end_time, service_id, is_booked, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`
    ).bind(
      slotId,
      providerId,
      slotType,
      dayOfWeek ?? null,
      date ?? null,
      startTime,
      endTime,
      serviceId ?? null
    ).run()

    return new Response(JSON.stringify({ success: true, slotId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[provider/slots POST] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to create slot' }), { status: 500 })
  }
}
