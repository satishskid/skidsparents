/**
 * GET /api/interventions/progress?childId=xxx&assignmentId=yyy
 * Compliance and streak data for parent view.
 */

import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return jsonError('Database not available', 500)

  const parentId = await getParentId(request, env)
  if (!parentId) return jsonError('Unauthorized', 401)

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  const assignmentId = url.searchParams.get('assignmentId')

  if (!childId) return jsonError('childId required', 400)

  // Verify ownership
  const child = await db.prepare(
    `SELECT id FROM children WHERE id = ? AND parent_id = ?`
  ).bind(childId, parentId).first()
  if (!child) return jsonError('Child not found', 404)

  let streakQuery = `SELECT is2.*, ia.start_date, ia.end_date, ia.status as assignment_status,
                            ip.name as protocol_name, ip.default_duration_days
                     FROM intervention_streaks is2
                     JOIN intervention_assignments ia ON ia.id = is2.assignment_id
                     JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
                     WHERE ia.child_id = ?`
  const binds: any[] = [childId]

  if (assignmentId) {
    streakQuery += ` AND ia.id = ?`
    binds.push(assignmentId)
  }

  const streaks = await db.prepare(streakQuery).bind(...binds).all()

  // Get weekly task summary (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const weeklyTasks = await db.prepare(
    `SELECT task_date, status, COUNT(*) as count
     FROM intervention_tasks
     WHERE child_id = ? AND task_date >= ?
     GROUP BY task_date, status
     ORDER BY task_date`
  ).bind(childId, sevenDaysAgo.toISOString().split('T')[0]).all()

  return new Response(
    JSON.stringify({
      streaks: streaks?.results || [],
      weeklyTasks: weeklyTasks?.results || [],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

async function getParentId(request: Request, env: any): Promise<string | null> {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.substring(7)
  try {
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    })
    if (!res.ok) return null
    const data: any = await res.json()
    const uid = data?.users?.[0]?.localId
    if (!uid) return null
    const parent = await env.DB.prepare(
      'SELECT id FROM parents WHERE firebase_uid = ?'
    ).bind(uid).first()
    return parent?.id || null
  } catch { return null }
}
