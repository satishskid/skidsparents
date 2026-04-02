/**
 * GET  /api/observations?childId=xxx — List parent observations (with projections)
 * POST /api/observations — Add a new observation → triggers probabilistic projection
 *
 * The POST endpoint is where the SKIDS Life Record intelligence fires.
 * Every observation triggers the probability engine, which projects
 * probable conditions using the child's complete life record.
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'
import { getEnv } from '@/lib/runtime/env'
import { buildLifeRecordContext } from '../../lib/ai/life-record/context-builder'
import { projectObservation, getParentSummary } from '../../lib/ai/life-record/probability-engine'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM parent_observations WHERE child_id = ? ORDER BY date DESC LIMIT 50'
    ).bind(childId).all()

    return new Response(JSON.stringify({ observations: results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ observations: [] }), { status: 200 })
    }
    console.error('[Observations] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch observations' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body = await request.json() as {
    childId: string
    date?: string
    category?: string
    observationText: string
    concernLevel?: string
  }

  if (!body.childId || !body.observationText) {
    return new Response(JSON.stringify({ error: 'childId and observationText required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const date = body.date || new Date().toISOString().split('T')[0]

  try {
    const id = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO parent_observations (id, child_id, date, category, observation_text, concern_level, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id,
      body.childId,
      date,
      body.category || null,
      body.observationText,
      body.concernLevel || 'none'
    ).run()

    // ═══════════════════════════════════════════════════════
    // SKIDS LIFE RECORD — Probabilistic Projection
    // The moment an observation is saved, the probability
    // engine fires to project probable conditions.
    // ═══════════════════════════════════════════════════════
    let projectionSummary = null
    try {
      // 1. Build the child's complete life record context from DB
      const lifeRecord = await buildLifeRecordContext(body.childId, env.DB)

      // 2. Run the probability engine
      const projectionResult = projectObservation(body.observationText, lifeRecord, id)

      // 3. Store the projection result
      const projResultId = crypto.randomUUID()
      await env.DB.prepare(
        `INSERT INTO projection_results (id, observation_id, child_id, observation_text, child_age_months, projections_count, domains_detected_json, clarifying_questions_json, confidence, computed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        projResultId,
        id,
        body.childId,
        body.observationText,
        lifeRecord.child.ageMonths,
        projectionResult.projections.length,
        JSON.stringify(projectionResult.domainsDetected),
        JSON.stringify(projectionResult.clarifyingQuestions),
        projectionResult.confidence,
        projectionResult.computedAt
      ).run()

      // 4. Store each individual projection
      for (const proj of projectionResult.projections) {
        await env.DB.prepare(
          `INSERT INTO observation_projections (id, observation_id, child_id, observation_text, condition_name, icd10, domain, category, base_probability, adjusted_probability, urgency, must_not_miss, parent_explanation, modifiers_json, evidence_for_json, evidence_against_json, parent_next_steps_json, doctor_exam_points_json, rule_out_before_json, citation, doctor_status, confidence)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          crypto.randomUUID(),
          id,
          body.childId,
          body.observationText,
          proj.conditionName,
          proj.icd10 || null,
          proj.domain,
          proj.category,
          proj.baseProbability,
          proj.adjustedProbability,
          proj.urgency,
          proj.mustNotMiss ? 1 : 0,
          proj.parentExplanation,
          JSON.stringify(proj.modifiersApplied),
          JSON.stringify(proj.evidenceFor),
          JSON.stringify(proj.evidenceAgainst),
          JSON.stringify(proj.parentNextSteps),
          JSON.stringify(proj.doctorExamPoints),
          JSON.stringify(proj.ruleOutBefore),
          proj.citation || null,
          'projected',
          projectionResult.confidence
        ).run()
      }

      // 5. Generate parent-friendly summary
      projectionSummary = getParentSummary(projectionResult)
    } catch (projErr: any) {
      // Projection failure should NOT block the observation from being saved
      console.error('[Observations] Projection error (non-blocking):', projErr)
    }

    return new Response(JSON.stringify({
      id,
      created: true,
      projection: projectionSummary,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ error: 'Tables not created. Visit /admin and click Init DB.' }), { status: 500 })
    }
    console.error('[Observations] POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to save observation' }), { status: 500 })
  }
}
