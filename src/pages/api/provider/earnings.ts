/**
 * GET /api/provider/earnings — Aggregate earnings summary for authenticated provider
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
    interface EarningsRow { total_sessions: number; gross_earnings: number | null; total_commission: number | null; net_payout: number | null }
    const row = await env.DB.prepare(
      `SELECT COUNT(*) as total_sessions,
              SUM(amount_cents) as gross_earnings,
              SUM(CAST(amount_cents * commission_pct_snapshot / 100 AS INTEGER)) as total_commission,
              SUM(amount_cents - CAST(amount_cents * commission_pct_snapshot / 100 AS INTEGER)) as net_payout
       FROM service_orders
       WHERE provider_id = ? AND status = 'completed'`
    ).bind(providerId).first<EarningsRow>()

    return new Response(
      JSON.stringify({
        totalSessions: row?.total_sessions || 0,
        grossEarnings: row?.gross_earnings || 0,
        totalCommission: row?.total_commission || 0,
        netPayout: row?.net_payout || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[provider/earnings] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch earnings' }), { status: 500 })
  }
}
