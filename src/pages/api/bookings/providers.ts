/**
 * GET /api/bookings/providers?serviceId=
 * Returns verified, active providers with available slots for the given service.
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
  if (!serviceId) {
    return new Response(JSON.stringify({ error: 'serviceId is required' }), { status: 400 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT DISTINCT p.id, p.name, p.type, p.specializations_json, p.city,
                p.rating, p.commission_pct, p.contact_email
         FROM providers p
         JOIN provider_slots ps ON ps.provider_id = p.id
         WHERE p.is_verified = 1 AND p.status = 'active'
           AND ps.is_booked = 0 AND ps.slot_type != 'blocked'
           AND (ps.service_id = ? OR ps.service_id IS NULL)`
      )
      .bind(serviceId)
      .all()

    const providers = (results || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      specializationsJson: r.specializations_json,
      city: r.city,
      rating: r.rating,
      commissionPct: r.commission_pct,
      contactEmail: r.contact_email,
    }))

    return new Response(JSON.stringify({ providers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[bookings/providers] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
