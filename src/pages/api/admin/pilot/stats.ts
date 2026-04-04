/**
 * GET /api/admin/pilot/stats — Pilot program engagement metrics
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
  if (!checkAuth(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  try {
    const inviteStats = await db.prepare('SELECT status, COUNT(*) as count FROM pilot_invitations GROUP BY status').all()
    const groupStats = await db.prepare('SELECT name, current_count, max_capacity, status FROM pilot_groups ORDER BY created_at DESC').all()
    const engagementByType = await db.prepare("SELECT event_type, COUNT(*) as count FROM pilot_engagement_log WHERE created_at >= datetime('now', '-7 days') GROUP BY event_type ORDER BY count DESC").all()
    const dailyTrend = await db.prepare("SELECT DATE(created_at) as date, COUNT(*) as events, COUNT(DISTINCT parent_id) as unique_parents FROM pilot_engagement_log WHERE created_at >= datetime('now', '-14 days') GROUP BY DATE(created_at) ORDER BY date ASC").all()
    const activeParents = await db.prepare("SELECT COUNT(DISTINCT parent_id) as count FROM pilot_engagement_log WHERE created_at >= datetime('now', '-7 days')").first() as any
    const pedStats = await db.prepare('SELECT status, COUNT(*) as count FROM ped_applications GROUP BY status').all()
    const pilotChildren = await db.prepare('SELECT COUNT(*) as count FROM pilot_invitations WHERE child_id IS NOT NULL').first() as any

    return new Response(JSON.stringify({
      invitations: { by_status: inviteStats.results, total: inviteStats.results.reduce((sum: number, r: any) => sum + r.count, 0) },
      groups: groupStats.results,
      engagement: { by_type: engagementByType.results, daily_trend: dailyTrend.results, active_parents_7d: activeParents?.count || 0 },
      pilot_children: pilotChildren?.count || 0,
      ped_applications: { by_status: pedStats.results, total: pedStats.results.reduce((sum: number, r: any) => sum + r.count, 0) },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('[Admin] Pilot stats error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
