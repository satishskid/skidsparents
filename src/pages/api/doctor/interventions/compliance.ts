/**
 * GET /api/doctor/interventions/compliance?childId=xxx
 * Compliance dashboard for all active interventions for a child.
 */

import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return jsonError('Database not available', 500)

  const doctorId = await getDoctorId(request, env)
  if (!doctorId) return jsonError('Unauthorized', 401)

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  if (!childId) return jsonError('childId required', 400)

  // Get assignments with compliance
  const assignments = await db.prepare(
    `SELECT ia.*, ip.name as protocol_name, ip.category, ip.subspecialty,
            ip.default_duration_days,
            is2.current_streak, is2.longest_streak, is2.compliance_pct,
            is2.total_done, is2.total_skipped, is2.total_partial, is2.last_completed_date
     FROM intervention_assignments ia
     JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
     LEFT JOIN intervention_streaks is2 ON is2.assignment_id = ia.id
     WHERE ia.child_id = ? AND ia.doctor_id = ?
     ORDER BY ia.status ASC, ia.start_date DESC`
  ).bind(childId, doctorId).all()

  // Get recent tasks for each assignment (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff = sevenDaysAgo.toISOString().split('T')[0]

  const recentTasks = await db.prepare(
    `SELECT it.assignment_id, it.task_date, it.status, it.parent_note, it.difficulty_rating
     FROM intervention_tasks it
     JOIN intervention_assignments ia ON ia.id = it.assignment_id
     WHERE ia.child_id = ? AND ia.doctor_id = ? AND it.task_date >= ?
     ORDER BY it.task_date DESC`
  ).bind(childId, doctorId, cutoff).all()

  // Group tasks by assignment
  const tasksByAssignment = new Map<string, any[]>()
  for (const t of (recentTasks?.results || []) as any[]) {
    const list = tasksByAssignment.get(t.assignment_id) || []
    list.push(t)
    tasksByAssignment.set(t.assignment_id, list)
  }

  const results = (assignments?.results || []).map((a: any) => ({
    ...a,
    custom_params_json: safeParseJSON(a.custom_params_json),
    recentTasks: tasksByAssignment.get(a.id) || [],
  }))

  return new Response(
    JSON.stringify({ assignments: results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

function safeParseJSON(str: any): any {
  if (!str) return null
  try { return JSON.parse(str) } catch { return str }
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

async function getDoctorId(request: Request, env: any): Promise<string | null> {
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
    const doctor = await env.DB.prepare(
      'SELECT id FROM doctors WHERE firebase_uid = ?'
    ).bind(uid).first()
    return doctor?.id || null
  } catch { return null }
}
