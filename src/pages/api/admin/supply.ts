/**
 * GET /api/admin/supply — provider supply per service type, flags < 2
 * ADMIN_KEY bearer auth
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function checkAuth(request: Request, env: Env): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    // Count verified providers with non-booked slots in next 7 days per service category
    const next7 = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    const { results } = await env.DB.prepare(
      `SELECT s.category,
         COUNT(DISTINCT p.id) as provider_count
       FROM providers p
       JOIN provider_slots ps ON ps.provider_id = p.id
       JOIN services s ON s.id = ps.service_id
       WHERE p.is_verified = 1
         AND p.status = 'active'
         AND ps.is_booked = 0
         AND ps.slot_type != 'blocked'
         AND (
           (ps.slot_type = 'one_off' AND ps.date >= ? AND ps.date <= ?)
           OR ps.slot_type = 'recurring'
         )
       GROUP BY s.category`
    ).bind(today, next7).all()

    const supply = (results || []).map((row: any) => ({
      category: row.category,
      providerCount: row.provider_count,
      alert: row.provider_count < 2,
    }))

    return new Response(
      JSON.stringify({ supply, alerts: supply.filter((s: any) => s.alert) }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[Admin] supply GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch supply' }), { status: 500 })
  }
}
