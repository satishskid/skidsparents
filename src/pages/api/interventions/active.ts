/**
 * GET /api/interventions/active?childId=xxx
 * List all active intervention assignments for a child.
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
  if (!childId) return jsonError('childId required', 400)

  // Verify ownership
  const child = await db.prepare(
    `SELECT id FROM children WHERE id = ? AND parent_id = ?`
  ).bind(childId, parentId).first()
  if (!child) return jsonError('Child not found', 404)

  // Get assignments with protocol details and streaks
  const assignments = await db.prepare(
    `SELECT ia.*, ip.name as protocol_name, ip.category, ip.subspecialty,
            ip.description as protocol_description, ip.default_duration_days,
            ip.customizable_params_json,
            is2.current_streak, is2.longest_streak, is2.compliance_pct,
            is2.total_done, is2.total_skipped, is2.total_partial,
            d.name as doctor_name
     FROM intervention_assignments ia
     JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
     LEFT JOIN intervention_streaks is2 ON is2.assignment_id = ia.id
     LEFT JOIN doctors d ON d.id = ia.doctor_id
     WHERE ia.child_id = ? AND ia.status IN ('active', 'paused')
     ORDER BY ia.start_date DESC`
  ).bind(childId).all()

  const results = (assignments?.results || []).map((a: any) => {
    const startDate = new Date(a.start_date)
    const now = new Date()
    const dayNumber = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      id: a.id,
      protocolName: a.protocol_name,
      protocolDescription: a.protocol_description,
      category: a.category,
      subspecialty: a.subspecialty,
      status: a.status,
      startDate: a.start_date,
      endDate: a.end_date,
      durationDays: a.default_duration_days,
      dayNumber,
      customParams: safeParseJSON(a.custom_params_json),
      doctorName: a.doctor_name,
      doctorNotes: a.doctor_notes,
      streak: {
        currentStreak: a.current_streak || 0,
        longestStreak: a.longest_streak || 0,
        compliancePct: a.compliance_pct || 0,
        totalDone: a.total_done || 0,
        totalSkipped: a.total_skipped || 0,
        totalPartial: a.total_partial || 0,
      },
    }
  })

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
