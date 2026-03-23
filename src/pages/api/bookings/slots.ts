/**
 * GET /api/bookings/slots?serviceId=&providerId=&date=
 * Returns available (non-booked, non-blocked) slots for a provider+service on a given date.
 */

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const serviceId = url.searchParams.get('serviceId')
  const providerId = url.searchParams.get('providerId')
  const date = url.searchParams.get('date')

  if (!serviceId || !providerId || !date) {
    return new Response(
      JSON.stringify({ error: 'serviceId, providerId, and date are required' }),
      { status: 400 }
    )
  }

  // Validate date format
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    return new Response(JSON.stringify({ error: 'Invalid date format. Use ISO date e.g. 2026-03-21' }), { status: 400 })
  }

  const dayOfWeek = parsedDate.getUTCDay() // 0=Sun, 6=Sat

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    // Recurring slots for this day of week
    const { results: recurring } = await db
      .prepare(
        `SELECT id, start_time, end_time, slot_type, date, day_of_week
         FROM provider_slots
         WHERE provider_id = ?
           AND (service_id = ? OR service_id IS NULL)
           AND slot_type = 'recurring'
           AND day_of_week = ?
           AND is_booked = 0`
      )
      .bind(providerId, serviceId, dayOfWeek)
      .all()

    // One-off slots for this specific date
    const { results: oneOff } = await db
      .prepare(
        `SELECT id, start_time, end_time, slot_type, date, day_of_week
         FROM provider_slots
         WHERE provider_id = ?
           AND (service_id = ? OR service_id IS NULL)
           AND slot_type = 'one_off'
           AND date = ?
           AND is_booked = 0`
      )
      .bind(providerId, serviceId, date)
      .all()

    const slots = [...(recurring || []), ...(oneOff || [])].map((r: any) => ({
      id: r.id,
      startTime: r.start_time,
      endTime: r.end_time,
      slotType: r.slot_type,
      date: r.date,
      dayOfWeek: r.day_of_week,
    }))

    // Sort by start time
    slots.sort((a, b) => a.startTime.localeCompare(b.startTime))

    return new Response(JSON.stringify({ slots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[bookings/slots] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
