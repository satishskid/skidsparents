/**
 * GET /api/services
 * Returns all active services from the DB.
 * No auth required — public listing.
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ locals }) => {
  const env = getEnv(locals)
  const db = env.DB

  if (!db) {
    return new Response(JSON.stringify({ services: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT id, slug, name, description, short_description, category, delivery_type,
                provider_type, price_cents, currency, price_model, duration, image_url, badge
         FROM services
         WHERE is_active = 1
         ORDER BY created_at ASC`
      )
      .all()

    return new Response(JSON.stringify({ services: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ services: [] }), { status: 200 })
    }
    console.error('[services] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
