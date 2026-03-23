/**
 * GET /api/admin/audit-log — read-only audit log with filters
 * ADMIN_KEY bearer auth. Never exposed via any public endpoint.
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

  const actorId = url.searchParams.get('actorId')
  const actionType = url.searchParams.get('actionType')
  const targetType = url.searchParams.get('targetType')
  const targetId = url.searchParams.get('targetId')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500)

  try {
    let query = 'SELECT * FROM audit_log WHERE 1=1'
    const bindings: any[] = []

    if (actorId) { query += ' AND actor_id = ?'; bindings.push(actorId) }
    if (actionType) { query += ' AND action_type = ?'; bindings.push(actionType) }
    if (targetType) { query += ' AND target_type = ?'; bindings.push(targetType) }
    if (targetId) { query += ' AND target_id = ?'; bindings.push(targetId) }
    if (from) { query += ' AND created_at >= ?'; bindings.push(from) }
    if (to) { query += ' AND created_at <= ?'; bindings.push(to) }

    query += ` ORDER BY created_at DESC LIMIT ${limit}`

    const stmt = env.DB.prepare(query)
    const { results } = await stmt.bind(...bindings).all()

    return new Response(JSON.stringify({ entries: results || [], count: results?.length || 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Admin] audit-log GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch audit log' }), { status: 500 })
  }
}
