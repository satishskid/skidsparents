/**
 * GET /api/doctor/interventions/escalations?status=open
 * View escalations across all patients.
 *
 * PUT /api/doctor/interventions/escalations
 * Acknowledge/resolve/dismiss an escalation.
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
  const status = url.searchParams.get('status') || 'open'
  const childId = url.searchParams.get('childId')

  let query = `SELECT ie.*, c.name as child_name, c.dob as child_dob,
                      ip.name as protocol_name, ip.category
               FROM intervention_escalations ie
               JOIN children c ON c.id = ie.child_id
               JOIN intervention_assignments ia ON ia.id = ie.assignment_id
               JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
               WHERE ie.doctor_id = ?`
  const binds: any[] = [doctorId]

  if (status !== 'all') {
    query += ` AND ie.status = ?`
    binds.push(status)
  }

  if (childId) {
    query += ` AND ie.child_id = ?`
    binds.push(childId)
  }

  query += ` ORDER BY
    CASE ie.severity WHEN 'urgent' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
    ie.created_at DESC`

  const escalations = await db.prepare(query).bind(...binds).all()

  return new Response(
    JSON.stringify({ escalations: escalations?.results || [] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

export const PUT: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return jsonError('Database not available', 500)

  const doctorId = await getDoctorId(request, env)
  if (!doctorId) return jsonError('Unauthorized', 401)

  const body: any = await request.json()
  const { escalationId, action, response: doctorResponse } = body

  if (!escalationId || !action) {
    return jsonError('escalationId and action required', 400)
  }

  const validActions = ['acknowledge', 'resolve', 'dismiss']
  if (!validActions.includes(action)) {
    return jsonError(`action must be: ${validActions.join(', ')}`, 400)
  }

  // Verify escalation belongs to doctor
  const escalation = await db.prepare(
    `SELECT id FROM intervention_escalations WHERE id = ? AND doctor_id = ?`
  ).bind(escalationId, doctorId).first()
  if (!escalation) return jsonError('Escalation not found', 404)

  const newStatus = action === 'acknowledge' ? 'acknowledged' :
                    action === 'resolve' ? 'resolved' : 'dismissed'

  await db.prepare(
    `UPDATE intervention_escalations SET
       status = ?, doctor_response = ?,
       resolved_at = CASE WHEN ? IN ('resolved', 'dismissed') THEN datetime('now') ELSE resolved_at END
     WHERE id = ?`
  ).bind(newStatus, doctorResponse || null, newStatus, escalationId).run()

  return new Response(
    JSON.stringify({ success: true, escalationId, status: newStatus }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
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
