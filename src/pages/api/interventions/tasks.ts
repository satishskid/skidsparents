/**
 * GET /api/interventions/tasks?childId=xxx&date=2026-04-02
 * Returns today's intervention tasks for a child (with lazy generation).
 *
 * PUT /api/interventions/tasks
 * Log task completion: { taskId, status, note?, mediaUrl?, difficultyRating? }
 */

import type { APIRoute } from 'astro'
import { shouldGenerateTasks, generateTasks } from '@/lib/ai/interventions/task-generator'
import { updateStreak, evaluateEscalations } from '@/lib/ai/interventions/escalation-engine'

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
  const date = url.searchParams.get('date') || todayISO()

  if (!childId) return jsonError('childId required', 400)

  // Verify ownership
  const child = await db.prepare(
    `SELECT id FROM children WHERE id = ? AND parent_id = ?`
  ).bind(childId, parentId).first()
  if (!child) return jsonError('Child not found', 404)

  // Get active assignments
  const assignments = await db.prepare(
    `SELECT ia.*, ip.name as protocol_name, ip.category, ip.subspecialty,
            ip.default_duration_days, ip.tasks_json, ip.default_frequency
     FROM intervention_assignments ia
     JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
     WHERE ia.child_id = ? AND ia.status = 'active'`
  ).bind(childId).all()

  const assignmentResults = assignments?.results || []

  // Lazy task generation for each assignment
  for (const assignment of assignmentResults as any[]) {
    const needsGen = await shouldGenerateTasks(assignment.id, date, db)
    if (needsGen) {
      const protocol = {
        tasks: safeParseJSON(assignment.tasks_json) || [],
        defaultDurationDays: assignment.default_duration_days,
      }
      await generateTasks(
        {
          id: assignment.id,
          childId: assignment.child_id,
          startDate: assignment.start_date,
          endDate: assignment.end_date,
          customParams: safeParseJSON(assignment.custom_params_json) || {},
        } as any,
        protocol as any,
        date,
        7,
        db
      )
    }
  }

  // Fetch tasks for the date
  const tasks = await db.prepare(
    `SELECT it.*, ia.intervention_protocol_id,
            ip.name as protocol_name, ip.category, ip.subspecialty
     FROM intervention_tasks it
     JOIN intervention_assignments ia ON ia.id = it.assignment_id
     JOIN intervention_protocols ip ON ip.id = ia.intervention_protocol_id
     WHERE it.child_id = ? AND it.task_date = ?
     ORDER BY ip.name, it.sequence_in_day`
  ).bind(childId, date).all()

  // Fetch streaks
  const streaks = await db.prepare(
    `SELECT * FROM intervention_streaks
     WHERE assignment_id IN (SELECT id FROM intervention_assignments WHERE child_id = ? AND status = 'active')`
  ).bind(childId).all()

  return new Response(
    JSON.stringify({
      tasks: tasks?.results || [],
      streaks: streaks?.results || [],
      assignments: assignmentResults.map((a: any) => ({
        id: a.id,
        protocolName: a.protocol_name,
        category: a.category,
        subspecialty: a.subspecialty,
        startDate: a.start_date,
        endDate: a.end_date,
        durationDays: a.default_duration_days,
        customParams: safeParseJSON(a.custom_params_json),
      })),
      date,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

export const PUT: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime
  const env = runtime?.env || {}
  const db = env.DB

  if (!db) return jsonError('Database not available', 500)

  const parentId = await getParentId(request, env)
  if (!parentId) return jsonError('Unauthorized', 401)

  const body: any = await request.json()
  const { taskId, status, note, mediaUrl, mediaType, difficultyRating } = body

  if (!taskId || !status) return jsonError('taskId and status required', 400)
  if (!['done', 'skipped', 'partial'].includes(status)) {
    return jsonError('status must be done, skipped, or partial', 400)
  }

  // Verify task belongs to parent's child
  const task = await db.prepare(
    `SELECT it.*, ia.child_id, ia.doctor_id, ia.intervention_protocol_id
     FROM intervention_tasks it
     JOIN intervention_assignments ia ON ia.id = it.assignment_id
     WHERE it.id = ?`
  ).bind(taskId).first()

  if (!task) return jsonError('Task not found', 404)

  const childOwnership = await db.prepare(
    `SELECT id FROM children WHERE id = ? AND parent_id = ?`
  ).bind(task.child_id, parentId).first()
  if (!childOwnership) return jsonError('Unauthorized', 403)

  // Update task
  await db.prepare(
    `UPDATE intervention_tasks SET
       status = ?, completed_at = datetime('now'), parent_note = ?,
       media_url = ?, media_type = ?, difficulty_rating = ?,
       updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    status, note || null, mediaUrl || null, mediaType || null,
    difficultyRating || null, taskId
  ).run()

  // Update streak
  const streak = await updateStreak(task.assignment_id as string, db)

  // Evaluate escalations (non-blocking)
  try {
    const protocol = await db.prepare(
      `SELECT escalation_rules_json FROM intervention_protocols WHERE id = ?`
    ).bind(task.intervention_protocol_id).first()

    const escalationRules = safeParseJSON(protocol?.escalation_rules_json) || []
    const chatSession = await db.prepare(
      `SELECT boundary_hits FROM intervention_chat_sessions
       WHERE assignment_id = ? ORDER BY updated_at DESC LIMIT 1`
    ).bind(task.assignment_id).first()

    // Determine concern level from note content
    let concernLevel = 0
    if (note) {
      const noteLower = note.toLowerCase()
      if (noteLower.includes('worried') || noteLower.includes('concerned') || noteLower.includes('worse')) {
        concernLevel = 3
      }
      if (noteLower.includes('pain') || noteLower.includes('swelling') || noteLower.includes('bleeding')) {
        concernLevel = 4
      }
    }

    await evaluateEscalations(
      { id: task.assignment_id, childId: task.child_id, doctorId: task.doctor_id } as any,
      { escalationRules } as any,
      streak,
      { ...task, status, parentNote: note, difficultyRating } as any,
      (chatSession?.boundary_hits as number) || 0,
      concernLevel,
      db
    )
  } catch (err) {
    console.error('[TaskLog] Escalation evaluation error:', err)
  }

  return new Response(
    JSON.stringify({
      success: true,
      taskId,
      status,
      streak: streak ? {
        currentStreak: streak.currentStreak,
        compliancePct: streak.compliancePct,
        totalDone: streak.totalDone,
      } : null,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
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
