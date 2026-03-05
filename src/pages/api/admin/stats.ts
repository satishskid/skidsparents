/**
 * GET /api/admin/stats — Analytics summary for CEO dashboard
 * brand=skids STRICT COMPLIANCE.
 */

import type { APIRoute } from 'astro'

export const prerender = false

function checkAuth(request: Request, env: any): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}

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
      db.prepare('SELECT COUNT(*) as c FROM leads WHERE brand = ?').bind('skids').first(),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE brand = ? AND created_at >= ?").bind('skids', today).first(),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE brand = ? AND created_at >= ?").bind('skids', weekAgo).first(),
      db.prepare("SELECT COUNT(*) as c FROM leads WHERE brand = ? AND created_at >= ?").bind('skids', monthAgo).first(),
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
        totalLeads: (totalResult as any)?.c || 0,
        todayLeads: (todayResult as any)?.c || 0,
        weekLeads: (weekResult as any)?.c || 0,
        monthLeads: (monthResult as any)?.c || 0,
        byStatus,
        bySource,
        byFunnel,
        recentLeads: recentResult.results || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    if (err.message?.includes('no such table')) {
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
    console.error('[Admin] Stats error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500 })
  }
}
