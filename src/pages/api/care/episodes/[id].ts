/**
 * GET  /api/care/episodes/:id — Full episode detail (parent view)
 * POST /api/care/episodes/:id — Update episode (parent confirms pathway, etc.)
 *
 * Parent can:
 *   - View their episode detail
 *   - Confirm the recommended pathway
 *   - Self-resolve an episode ("We're doing fine now")
 */

import type { APIRoute } from 'astro'
import { getParentId } from '../../children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ params, request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'Episode ID required' }), { status: 400 })
  }

  try {
    const episode = await env.DB.prepare(
      `SELECT * FROM care_episodes WHERE id = ? AND parent_id = ?`
    ).bind(id, parentId).first()

    if (!episode) {
      return new Response(JSON.stringify({ error: 'Episode not found' }), { status: 404 })
    }

    // Parse JSON fields for parent
    const structured = JSON.parse((episode.observation_structured as string) || '{}')
    const guidance = JSON.parse((episode.parent_guidance_shown as string) || '{}')

    return new Response(JSON.stringify({
      episode: {
        id: episode.id,
        childId: episode.child_id,
        observationText: episode.observation_text,
        pathway: episode.pathway,
        status: episode.status,
        parentSummary: episode.parent_summary_shown,
        parentGuidance: guidance,
        pedAlertLevel: episode.ped_alert_level,
        pedResponseText: episode.ped_response_text,
        pedResponseAt: episode.ped_response_at,
        followUpAt: episode.follow_up_at,
        resolvedAt: episode.resolved_at,
        resolutionNote: episode.resolution_note,
        domainsDetected: structured.domains || [],
        clarifyingQuestions: structured.clarifyingQuestions || [],
        confidence: structured.confidence,
        createdAt: episode.created_at,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Care Episode Detail] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch episode' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { id } = params
  if (!id) {
    return new Response(JSON.stringify({ error: 'Episode ID required' }), { status: 400 })
  }

  const body = await request.json() as {
    action: 'confirm_pathway' | 'resolve' | 'escalate'
    pathway?: string  // for confirm_pathway
    resolutionNote?: string  // for resolve
  }

  try {
    // Verify ownership
    const episode = await env.DB.prepare(
      `SELECT id, status, pathway FROM care_episodes WHERE id = ? AND parent_id = ?`
    ).bind(id, parentId).first()

    if (!episode) {
      return new Response(JSON.stringify({ error: 'Episode not found' }), { status: 404 })
    }

    if (body.action === 'confirm_pathway') {
      // Parent confirms the system's recommended pathway (or picks an alternative)
      const newPathway = body.pathway || episode.pathway
      const newStatus = ['3_econsult', '4_tele', '5_inperson'].includes(newPathway as string)
        ? 'awaiting_ped'
        : 'open'

      await env.DB.prepare(
        `UPDATE care_episodes SET pathway = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(newPathway, newStatus, id).run()

      return new Response(JSON.stringify({ updated: true, pathway: newPathway, status: newStatus }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'resolve') {
      await env.DB.prepare(
        `UPDATE care_episodes
         SET status = 'resolved', resolved_at = datetime('now'),
             resolution_note = ?, resolved_by = 'parent',
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(body.resolutionNote || 'Parent resolved', id).run()

      return new Response(JSON.stringify({ updated: true, status: 'resolved' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'escalate') {
      // Parent wants to escalate (e.g., from observe → econsult)
      const currentPathway = episode.pathway as string
      const escalationMap: Record<string, string> = {
        '1_observe': '3_econsult',
        '2_ped_initiated': '3_econsult',
        '3_econsult': '4_tele',
        '4_tele': '5_inperson',
      }
      const newPathway = escalationMap[currentPathway] || currentPathway

      await env.DB.prepare(
        `UPDATE care_episodes
         SET pathway = ?, status = 'awaiting_ped',
             ped_alert_level = CASE
               WHEN ped_alert_level = 'none' THEN 'review'
               WHEN ped_alert_level = 'info' THEN 'review'
               WHEN ped_alert_level = 'review' THEN 'urgent'
               ELSE ped_alert_level
             END,
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(newPathway, id).run()

      return new Response(JSON.stringify({ updated: true, pathway: newPathway, status: 'awaiting_ped' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  } catch (e: unknown) {
    console.error('[Care Episode Detail] POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to update episode' }), { status: 500 })
  }
}
