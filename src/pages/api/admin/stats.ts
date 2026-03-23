/**
 * GET /api/admin/stats — Analytics summary for CEO dashboard
 * brand=skids STRICT COMPLIANCE.
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

  const db = env.DB
  if (!db) {
    return new Response(
      JSON.stringify({
        totalLeads: 0,
        todayLeads: 0,
        weekLeads: 0,
        monthLeads: 0,
        byStatus: {},
        bySource: {},
        byFunnel: {},
        recentLeads: [],
        _note: 'Database not available',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString()

    interface CountRow { c: number }
    // Run all queries in parallel
    const [
      totalResult,
      todayResult,
      weekResult,
      monthResult,
      statusResult,
      sourceResult,
      funnelResult,
      recentResult,
    ] = await Promise.all([
      db.prepare('SELECT COUNT(*) as c FROM leads WHERE brand = ?').bind('skids').first<CountRow>(),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE brand = ? AND created_at >= ?").bind('skids', today).first<CountRow>(),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE brand = ? AND created_at >= ?").bind('skids', weekAgo).first<CountRow>(),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE brand = ? AND created_at >= ?").bind('skids', monthAgo).first<CountRow>(),
      db.prepare("SELECT COALESCE(status, 'new') as status, COUNT(*) as c FROM leads WHERE brand = ? GROUP BY status").bind('skids').all(),
      db.prepare("SELECT source, COUNT(*) as c FROM leads WHERE brand = ? GROUP BY source ORDER BY c DESC LIMIT 10").bind('skids').all(),
      db.prepare("SELECT funnel_stage, COUNT(*) as c FROM leads WHERE brand = ? GROUP BY funnel_stage").bind('skids').all(),
      db.prepare("SELECT * FROM leads WHERE brand = ? ORDER BY created_at DESC LIMIT 5").bind('skids').all(),
    ])

    const byStatus: Record<string, number> = {}
    for (const row of (statusResult.results || [])) {
      byStatus[(row as any).status] = (row as any).c
    }

    const bySource: Record<string, number> = {}
    for (const row of (sourceResult.results || [])) {
      bySource[(row as any).source] = (row as any).c
    }

    const byFunnel: Record<string, number> = {}
    for (const row of (funnelResult.results || [])) {
      byFunnel[(row as any).funnel_stage] = (row as any).c
    }

    return new Response(
      JSON.stringify({
        totalLeads: totalResult?.c || 0,
        todayLeads: todayResult?.c || 0,
        weekLeads: weekResult?.c || 0,
        monthLeads: monthResult?.c || 0,
        byStatus,
        bySource,
        byFunnel,
        recentLeads: recentResult.results || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(
        JSON.stringify({
          totalLeads: 0,
          todayLeads: 0,
          weekLeads: 0,
          monthLeads: 0,
          byStatus: {},
          bySource: {},
          byFunnel: {},
          recentLeads: [],
          _note: 'leads table not created yet',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.error('[Admin] Stats error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500 })
  }
}
