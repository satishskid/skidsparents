/**
 * POST /api/doctor/refinements — Doctor confirms, rules out, or adjusts a projection
 * GET  /api/doctor/refinements?childId=xxx — Get all refinements for a child
 *
 * Layer 3 of the SKIDS Life Record: Human-in-the-Loop (HITL).
 * AI projects probable conditions. The doctor examines and confirms or rules out.
 * Nothing is missed because both parent and doctor see the full differential.
 */

import type { APIRoute } from 'astro'

export const prerender = false

async function getDoctorId(request: Request, env: any): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  try {
    const row = await env.DB.prepare(
      'SELECT id FROM doctors WHERE firebase_uid = ?'
    ).bind(token).first()
    return row?.id || null
  } catch {
    return null
  }
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const doctorId = await getDoctorId(request, env)
  if (!doctorId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  const observationId = url.searchParams.get('observationId')

  try {
    let query = 'SELECT * FROM observation_projections WHERE 1=1'
    const binds: any[] = []

    if (childId) {
      query += ' AND child_id = ?'
      binds.push(childId)
    }
    if (observationId) {
      query += ' AND observation_id = ?'
      binds.push(observationId)
    }

    query += ' ORDER BY must_not_miss DESC, adjusted_probability DESC'

    const stmt = env.DB.prepare(query)
    const { results } = binds.length > 0
      ? await stmt.bind(...binds).all()
      : await stmt.all()

    // Parse JSON fields for the response
    const projections = (results || []).map((r: any) => ({
      ...r,
      modifiers: safeJsonParse(r.modifiers_json),
      evidenceFor: safeJsonParse(r.evidence_for_json),
      evidenceAgainst: safeJsonParse(r.evidence_against_json),
      parentNextSteps: safeJsonParse(r.parent_next_steps_json),
      doctorExamPoints: safeJsonParse(r.doctor_exam_points_json),
      ruleOutBefore: safeJsonParse(r.rule_out_before_json),
      mustNotMiss: !!r.must_not_miss,
    }))

    return new Response(JSON.stringify({ projections }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    if (err.message?.includes('no such table')) {
      return new Response(JSON.stringify({ projections: [] }), { status: 200 })
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch projections' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const doctorId = await getDoctorId(request, env)
  if (!doctorId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body = await request.json() as {
    projectionId: string
    action: 'confirm' | 'rule_out' | 'investigate' | 'adjust_probability'
    clinicalFindings?: string
    adjustedProbability?: number
    notes?: string
  }

  if (!body.projectionId || !body.action) {
    return new Response(JSON.stringify({ error: 'projectionId and action required' }), { status: 400 })
  }

  const validActions = ['confirm', 'rule_out', 'investigate', 'adjust_probability']
  if (!validActions.includes(body.action)) {
    return new Response(JSON.stringify({ error: `action must be one of: ${validActions.join(', ')}` }), { status: 400 })
  }

  try {
    // Fetch the projection to update
    const projection = await env.DB.prepare(
      'SELECT * FROM observation_projections WHERE id = ?'
    ).bind(body.projectionId).first()

    if (!projection) {
      return new Response(JSON.stringify({ error: 'Projection not found' }), { status: 404 })
    }

    // Determine new status and probability
    let newStatus: string
    let newProbability: number

    switch (body.action) {
      case 'confirm':
        newStatus = 'confirmed'
        newProbability = body.adjustedProbability ?? Math.max(projection.adjusted_probability as number, 0.9)
        break
      case 'rule_out':
        newStatus = 'ruled_out'
        newProbability = 0.001
        break
      case 'investigate':
        newStatus = 'investigating'
        newProbability = body.adjustedProbability ?? (projection.adjusted_probability as number)
        break
      case 'adjust_probability':
        newStatus = 'investigating'
        newProbability = body.adjustedProbability ?? (projection.adjusted_probability as number)
        break
      default:
        newStatus = 'projected'
        newProbability = projection.adjusted_probability as number
    }

    // Update the projection
    await env.DB.prepare(
      `UPDATE observation_projections
       SET doctor_status = ?, adjusted_probability = ?, doctor_notes = ?, doctor_id = ?, refined_at = datetime('now')
       WHERE id = ?`
    ).bind(
      newStatus,
      newProbability,
      body.clinicalFindings || body.notes || null,
      doctorId,
      body.projectionId
    ).run()

    // Record the refinement in the audit trail
    const refinementId = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO doctor_refinements (id, projection_id, doctor_id, child_id, condition_name, action, clinical_findings, adjusted_probability, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      refinementId,
      body.projectionId,
      doctorId,
      projection.child_id,
      projection.condition_name,
      body.action,
      body.clinicalFindings || null,
      newProbability,
      body.notes || null
    ).run()

    return new Response(JSON.stringify({
      refinementId,
      projectionId: body.projectionId,
      action: body.action,
      newStatus,
      newProbability,
      conditionName: projection.condition_name,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Doctor Refinements] Error:', err)
    return new Response(JSON.stringify({ error: 'Failed to apply refinement' }), { status: 500 })
  }
}

function safeJsonParse(json: string | null | undefined): any {
  if (!json) return []
  try { return JSON.parse(json) } catch { return [] }
}
