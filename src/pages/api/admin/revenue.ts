/**
 * GET /api/admin/revenue — GMV, commission, provider payouts breakdown
 * GET /api/admin/supply  — provider supply per service type, flag < 2
 *
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

export const GET: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const period = url.searchParams.get('period') || '30d'
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const since = new Date(Date.now() - days * 86400000).toISOString()

  try {
    interface TotalRow { gmv: number | null; commission: number | null; provider_payouts: number | null; order_count: number }
    const [totals, byCategory] = await Promise.all([
      env.DB.prepare(
        `SELECT
           SUM(amount_cents) as gmv,
           SUM(ROUND(amount_cents * commission_pct_snapshot / 100)) as commission,
           SUM(ROUND(amount_cents * (1 - commission_pct_snapshot / 100))) as provider_payouts,
           COUNT(*) as order_count
         FROM service_orders
         WHERE status = 'completed' AND created_at >= ?`
      ).bind(since).first<TotalRow>(),

      env.DB.prepare(
        `SELECT s.category,
           SUM(so.amount_cents) as gmv,
           COUNT(so.id) as order_count
         FROM service_orders so
         JOIN services s ON s.id = so.service_id
         WHERE so.status = 'completed' AND so.created_at >= ?
         GROUP BY s.category
         ORDER BY gmv DESC`
      ).bind(since).all(),
    ])

    return new Response(
      JSON.stringify({
        period,
        gmv: totals?.gmv || 0,
        commission: totals?.commission || 0,
        providerPayouts: totals?.provider_payouts || 0,
        orderCount: totals?.order_count || 0,
        byCategory: byCategory.results || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[Admin] revenue GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch revenue' }), { status: 500 })
  }
}
