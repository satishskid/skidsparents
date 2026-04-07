/**
 * Care Episodes API
 *
 * POST /api/care/episodes — Create a care episode (observation → projection → routing)
 * GET  /api/care/episodes?childId=xxx — List episodes for a child
 *
 * This is the main entry point for the Care Continuity Engine.
 * When a parent submits an observation, the system:
 *   1. Builds life record context
 *   2. Runs projection engine
 *   3. Routes to care pathway
 *   4. Creates the care episode (twin record)
 *   5. Returns parent-safe guidance + pathway recommendation
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from '../../children'
import { getEnv } from '@/lib/runtime/env'
import { buildLifeRecordContext } from '@/lib/ai/life-record/context-builder'
import { projectObservation } from '@/lib/ai/life-record/probability-engine'
import { routeCarePathway } from '@/lib/ai/life-record/care-router'
import type { CareRouterOutput } from '@/lib/ai/life-record/care-router'

export const prerender = false

// ─── GET: List care episodes for a child ───

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
      `SELECT id, child_id, observation_text, pathway, status,
              parent_summary_shown, ped_alert_level, follow_up_at,
              resolved_at, created_at, updated_at
       FROM care_episodes
       WHERE child_id = ?
       ORDER BY created_at DESC
       LIMIT 50`
    ).bind(childId).all()

    return new Response(JSON.stringify({ episodes: results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ episodes: [] }), { status: 200 })
    }
    console.error('[Care Episodes] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch episodes' }), { status: 500 })
  }
}

// ─── POST: Create a care episode ───

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body = await request.json() as {
    childId: string
    observationText: string
    category?: string
    source?: 'active' | 'passive' | 'chat'
  }

  if (!body.childId || !body.observationText?.trim()) {
    return new Response(JSON.stringify({ error: 'childId and observationText required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  try {
    // 1. Build life record context
    const lifeRecord = await buildLifeRecordContext(body.childId, env.DB)

    // 2. Run projection engine
    const observationId = crypto.randomUUID()
    const projectionResult = projectObservation(body.observationText.trim(), lifeRecord, observationId)

    // 3. Count recent episodes for escalation logic
    let recentEpisodeCount = 0
    try {
      const countResult = await env.DB.prepare(
        `SELECT COUNT(*) as cnt FROM care_episodes
         WHERE child_id = ? AND created_at > datetime('now', '-30 days')`
      ).bind(body.childId).first<{ cnt: number }>()
      recentEpisodeCount = countResult?.cnt || 0
    } catch { /* table may not exist yet */ }

    // 4. Detect if child has an assigned pediatrician
    let hasPediatrician = false
    try {
      const docResult = await env.DB.prepare(
        `SELECT id FROM doctor_patients WHERE child_id = ? AND status = 'active' LIMIT 1`
      ).bind(body.childId).first()
      hasPediatrician = !!docResult
    } catch {
      // Try service_orders as fallback
      try {
        const orderResult = await env.DB.prepare(
          `SELECT provider_id FROM service_orders
           WHERE child_id = ? AND status IN ('confirmed', 'completed', 'in_progress')
           LIMIT 1`
        ).bind(body.childId).first()
        hasPediatrician = !!orderResult
      } catch { /* no booking tables */ }
    }

    // 5. Route to care pathway
    const routing: CareRouterOutput = routeCarePathway({
      projectionResult,
      childAgeMonths: lifeRecord.child.ageMonths,
      hasPediatrician,
      recentEpisodeCount,
    })

    // 6. Find assigned doctor ID (if any)
    let doctorId: string | null = null
    try {
      const doc = await env.DB.prepare(
        `SELECT doctor_id FROM doctor_patients WHERE child_id = ? AND status = 'active' LIMIT 1`
      ).bind(body.childId).first<{ doctor_id: string }>()
      doctorId = doc?.doctor_id || null
    } catch { /* no doctor_patients table */ }

    // 7. Create care episode
    const episodeId = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO care_episodes (
        id, child_id, parent_id, doctor_id,
        observation_text, observation_structured,
        pathway, status,
        parent_summary_shown, parent_guidance_shown,
        ped_alert_level,
        projection_snapshot,
        follow_up_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      episodeId,
      body.childId,
      parentId,
      doctorId,
      body.observationText.trim(),
      JSON.stringify({
        domains: projectionResult.domainsDetected,
        clarifyingQuestions: projectionResult.clarifyingQuestions,
        confidence: projectionResult.confidence,
        projectionsCount: projectionResult.projections.length,
      }),
      routing.pathway,
      routing.initialStatus,
      routing.parentSummary,
      routing.parentGuidance,
      routing.pedAlertLevel,
      JSON.stringify(projectionResult),
      routing.followUpDays
        ? new Date(Date.now() + routing.followUpDays * 86400000).toISOString().split('T')[0]
        : null,
    ).run()

    // 8. Return parent-safe response
    return new Response(JSON.stringify({
      episodeId,
      pathway: routing.pathway,
      pedAlertLevel: routing.pedAlertLevel,
      parentSummary: routing.parentSummary,
      parentGuidance: JSON.parse(routing.parentGuidance),
      followUpDays: routing.followUpDays,
      // Include projections for the companion UI to render
      projections: projectionResult.projections.map(p => ({
        conditionName: p.conditionName,
        domain: p.domain,
        category: p.category,
        baseProbability: p.baseProbability,
        adjustedProbability: p.adjustedProbability,
        urgency: p.urgency,
        mustNotMiss: p.mustNotMiss,
        parentExplanation: p.parentExplanation,
        parentNextSteps: p.parentNextSteps,
        matchSource: p.matchSource || 'pattern',
        // Doctor-only fields omitted from parent response
      })),
      domainsDetected: projectionResult.domainsDetected,
      clarifyingQuestions: projectionResult.clarifyingQuestions,
      confidence: projectionResult.confidence,
      computedAt: projectionResult.computedAt,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({
        error: 'Care episode tables not created. Run migration 0012.',
      }), { status: 500 })
    }
    console.error('[Care Episodes] POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to create care episode' }), { status: 500 })
  }
}
