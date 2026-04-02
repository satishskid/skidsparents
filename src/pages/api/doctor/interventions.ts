/**
 * Doctor Intervention Management API
 *
 * GET  — List intervention protocol library (filtered by region/authority)
 * POST — Prescribe intervention to a child
 * PUT  — Adjust/pause/resume/cancel intervention
 */

import type { APIRoute } from 'astro'
import { generateTasks } from '@/lib/ai/interventions/task-generator'

export const prerender = false

// ── GET: Protocol Library ──
export const GET: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return jsonError('Database not available', 500)

  const doctorId = await getDoctorId(request, env)
  if (!doctorId) return jsonError('Unauthorized', 401)

  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const region = url.searchParams.get('region')
  const authority = url.searchParams.get('authority')
  const childId = url.searchParams.get('childId') // For age filtering

  // Get doctor's default authority
  const doctor = await db.prepare(
    `SELECT default_protocol_authority FROM doctors WHERE id = ?`
  ).bind(doctorId).first()

  let query = `SELECT id, slug, name, category, subspecialty, condition_name, icd10,
                      region, protocol_authority, description, evidence_base,
                      age_range_min, age_range_max, default_duration_days,
                      default_frequency, customizable_params_json, version
               FROM intervention_protocols WHERE is_active = 1`
  const binds: any[] = []

  if (category) {
    query += ` AND category = ?`
    binds.push(category)
  }

  if (region) {
    query += ` AND (region = ? OR region = 'global')`
    binds.push(region)
  }

  if (authority) {
    query += ` AND protocol_authority = ?`
    binds.push(authority)
  }

  // If childId provided, filter by age
  if (childId) {
    const child = await db.prepare(`SELECT dob FROM children WHERE id = ?`).bind(childId).first()
    if (child) {
      const dob = new Date(child.dob as string)
      const now = new Date()
      const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())
      query += ` AND (age_range_min IS NULL OR age_range_min <= ?) AND (age_range_max IS NULL OR age_range_max >= ?)`
      binds.push(ageMonths, ageMonths)
    }
  }

  query += ` ORDER BY category, name`

  const protocols = await db.prepare(query).bind(...binds).all()

  return new Response(
    JSON.stringify({
      protocols: (protocols?.results || []).map((p: any) => ({
        ...p,
        customizable_params_json: safeParseJSON(p.customizable_params_json),
      })),
      doctorDefaultAuthority: doctor?.default_protocol_authority || 'IAP',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

// ── POST: Prescribe Intervention ──
export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return jsonError('Database not available', 500)

  const doctorId = await getDoctorId(request, env)
  if (!doctorId) return jsonError('Unauthorized', 401)

  const body: any = await request.json()
  const {
    protocolSlug, childId, customParams, notes,
    startDate, childRegion, childEthnicOrigin,
  } = body

  if (!protocolSlug || !childId) {
    return jsonError('protocolSlug and childId required', 400)
  }

  // Verify doctor-child access
  const access = await db.prepare(
    `SELECT id FROM doctor_patients WHERE doctor_id = ? AND child_id = ? AND status = 'active'`
  ).bind(doctorId, childId).first()
  if (!access) return jsonError('No access to this patient', 403)

  // Get protocol
  const protocol = await db.prepare(
    `SELECT * FROM intervention_protocols WHERE slug = ? AND is_active = 1`
  ).bind(protocolSlug).first()
  if (!protocol) return jsonError('Protocol not found', 404)

  // Check for existing active assignment of same protocol
  const existing = await db.prepare(
    `SELECT id FROM intervention_assignments
     WHERE intervention_protocol_id = ? AND child_id = ? AND status = 'active'`
  ).bind(protocol.id, childId).first()
  if (existing) return jsonError('Child already has an active assignment for this protocol', 409)

  // Create assignment
  const assignmentId = generateId()
  const start = startDate || todayISO()
  const end = addDays(start, protocol.default_duration_days as number)

  await db.prepare(
    `INSERT INTO intervention_assignments
     (id, intervention_protocol_id, child_id, doctor_id, status,
      start_date, end_date, custom_params_json, child_region,
      child_ethnic_origin, doctor_notes)
     VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`
  ).bind(
    assignmentId, protocol.id, childId, doctorId,
    start, end, JSON.stringify(customParams || {}),
    childRegion || null, childEthnicOrigin || null, notes || null
  ).run()

  // Generate initial batch of tasks
  const protocolData = {
    tasks: safeParseJSON(protocol.tasks_json) || [],
    defaultDurationDays: protocol.default_duration_days,
  }

  await generateTasks(
    {
      id: assignmentId,
      childId,
      startDate: start,
      endDate: end,
      customParams: customParams || {},
    } as any,
    protocolData as any,
    start,
    14, // Generate first 2 weeks
    db
  )

  // Initialize streak
  await db.prepare(
    `INSERT INTO intervention_streaks (id, assignment_id) VALUES (?, ?)`
  ).bind(`streak_${assignmentId}`, assignmentId).run()

  return new Response(
    JSON.stringify({
      success: true,
      assignmentId,
      protocolName: protocol.name,
      startDate: start,
      endDate: end,
    }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  )
}

// ── PUT: Adjust/Pause/Resume/Cancel ──
export const PUT: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return jsonError('Database not available', 500)

  const doctorId = await getDoctorId(request, env)
  if (!doctorId) return jsonError('Unauthorized', 401)

  const body: any = await request.json()
  const { assignmentId, action, customParams, notes } = body

  if (!assignmentId || !action) {
    return jsonError('assignmentId and action required', 400)
  }

  const validActions = ['adjust_params', 'pause', 'resume', 'cancel']
  if (!validActions.includes(action)) {
    return jsonError(`action must be one of: ${validActions.join(', ')}`, 400)
  }

  // Verify assignment belongs to doctor
  const assignment = await db.prepare(
    `SELECT ia.*, ip.tasks_json, ip.default_duration_days
     FROM intervention_assignments ia
     JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
     WHERE ia.id = ? AND ia.doctor_id = ?`
  ).bind(assignmentId, doctorId).first()

  if (!assignment) return jsonError('Assignment not found', 404)

  switch (action) {
    case 'adjust_params': {
      await db.prepare(
        `UPDATE intervention_assignments SET
           custom_params_json = ?, doctor_notes = COALESCE(?, doctor_notes),
           updated_at = datetime('now')
         WHERE id = ?`
      ).bind(JSON.stringify(customParams || {}), notes, assignmentId).run()

      // Regenerate future tasks with new params
      const { regenerateFutureTasks } = await import('@/lib/ai/interventions/task-generator')
      await regenerateFutureTasks(
        { ...assignment, customParams: customParams || {} } as any,
        { tasks: safeParseJSON(assignment.tasks_json) || [] } as any,
        db
      )
      break
    }

    case 'pause':
      await db.prepare(
        `UPDATE intervention_assignments SET status = 'paused', updated_at = datetime('now') WHERE id = ?`
      ).bind(assignmentId).run()
      break

    case 'resume':
      await db.prepare(
        `UPDATE intervention_assignments SET status = 'active', updated_at = datetime('now') WHERE id = ?`
      ).bind(assignmentId).run()
      break

    case 'cancel':
      await db.prepare(
        `UPDATE intervention_assignments SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`
      ).bind(assignmentId).run()
      // Delete pending future tasks
      await db.prepare(
        `DELETE FROM intervention_tasks WHERE assignment_id = ? AND status = 'pending'`
      ).bind(assignmentId).run()
      break
  }

  return new Response(
    JSON.stringify({ success: true, assignmentId, action }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

// ── Helpers ──

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function generateId(): string {
  const hex = () => Math.random().toString(16).substring(2, 10)
  return `${hex()}${hex()}`
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
