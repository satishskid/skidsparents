/**
 * GET /api/bookings/orders
 * Returns all service orders for the authenticated parent with service and provider details.
 */

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT so.*, s.name as service_name, s.slug as service_slug, s.category,
                s.delivery_type, s.price_cents, p.name as provider_name, p.city as provider_city
         FROM service_orders so
         JOIN services s ON s.id = so.service_id
         LEFT JOIN providers p ON p.id = so.provider_id
         WHERE so.parent_id = ?
         ORDER BY so.created_at DESC`
      )
      .bind(parentId)
      .all()

    return new Response(JSON.stringify({ orders: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[bookings/orders] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
