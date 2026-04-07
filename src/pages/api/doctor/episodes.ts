/**
 * Doctor Care Queue API
 *
 * GET  /api/doctor/episodes — List care episodes requiring doctor attention
 * POST /api/doctor/episodes — Doctor actions on episodes (respond, escalate, resolve, schedule)
 *
 * The doctor sees the FULL twin record: parent's words, what guidance was shown,
 * complete clinical projections, and the routing reasoning.
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

/** Extract doctor ID from session cookie */
async function getDoctorId(request: Request, env: any): Promise<string | null> {
  try {
    const cookie = request.headers.get('Cookie') || ''
    const match = cookie.match(/doctor_session=([^;]+)/)
    if (!match) return null
    const session = await env.DB.prepare(
      'SELECT id FROM doctors WHERE firebase_uid = ? AND is_active = 1'
    ).bind(match[1]).first() as { id: string } | null
    return session?.id || null
  } catch {
    return null
  }
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const doctorId = await getDoctorId(request, env)
  if (!doctorId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const filter = url.searchParams.get('filter') || 'active' // active, all, resolved
  const alertLevel = url.searchParams.get('alertLevel') // emergency, urgent, review, info

  try {
    let query = `
      SELECT ce.*, c.name as child_name, c.date_of_birth as child_dob,
             p.name as parent_name
      FROM care_episodes ce
      JOIN children c ON ce.child_id = c.id
      JOIN parents p ON ce.parent_id = p.id
      WHERE ce.doctor_id = ?`

    const bindings: any[] = [doctorId]

    if (filter === 'active') {
      query += ` AND ce.status != 'resolved'`
    } else if (filter === 'resolved') {
      query += ` AND ce.status = 'resolved'`
    }

    if (alertLevel) {
      query += ` AND ce.ped_alert_level = ?`
      bindings.push(alertLevel)
    }

    query += ` ORDER BY
      CASE ce.ped_alert_level
        WHEN 'emergency' THEN 1
        WHEN 'urgent' THEN 2
        WHEN 'review' THEN 3
        WHEN 'info' THEN 4
        ELSE 5
      END,
      ce.created_at DESC
      LIMIT 100`

    const { results } = await env.DB.prepare(query).bind(...bindings).all()

    // Parse JSON fields for doctor view
    const episodes = (results || []).map((ep: any) => ({
      id: ep.id,
      childId: ep.child_id,
      childName: ep.child_name,
      childDob: ep.child_dob,
      parentName: ep.parent_name,
      observationText: ep.observation_text,
      observationStructured: JSON.parse(ep.observation_structured || '{}'),
      pathway: ep.pathway,
      status: ep.status,
      parentSummaryShown: ep.parent_summary_shown,
      parentGuidanceShown: JSON.parse(ep.parent_guidance_shown || '{}'),
      pedAlertLevel: ep.ped_alert_level,
      pedResponseText: ep.ped_response_text,
      pedResponseAt: ep.ped_response_at,
      projectionSnapshot: JSON.parse(ep.projection_snapshot || '{}'),
      followUpAt: ep.follow_up_at,
      resolvedAt: ep.resolved_at,
      resolutionNote: ep.resolution_note,
      resolvedBy: ep.resolved_by,
      createdAt: ep.created_at,
    }))

    // Summary counts for dashboard
    const counts = {
      emergency: episodes.filter((e: any) => e.pedAlertLevel === 'emergency' && e.status !== 'resolved').length,
      urgent: episodes.filter((e: any) => e.pedAlertLevel === 'urgent' && e.status !== 'resolved').length,
      review: episodes.filter((e: any) => e.pedAlertLevel === 'review' && e.status !== 'resolved').length,
      info: episodes.filter((e: any) => e.pedAlertLevel === 'info' && e.status !== 'resolved').length,
      total: episodes.filter((e: any) => e.status !== 'resolved').length,
    }

    return new Response(JSON.stringify({ episodes, counts }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ episodes: [], counts: { emergency: 0, urgent: 0, review: 0, info: 0, total: 0 } }), { status: 200 })
    }
    console.error('[Doctor Episodes] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch episodes' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const doctorId = await getDoctorId(request, env)
  if (!doctorId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body = await request.json() as {
    episodeId: string
    action: 'respond' | 'resolve' | 'escalate' | 'schedule'
    responseText?: string       // for respond
    resolutionNote?: string     // for resolve
    newPathway?: string         // for escalate
    scheduleType?: 'tele' | 'inperson'  // for schedule
  }

  if (!body.episodeId || !body.action) {
    return new Response(JSON.stringify({ error: 'episodeId and action required' }), { status: 400 })
  }

  try {
    // Verify doctor owns this episode
    const episode = await env.DB.prepare(
      `SELECT id, pathway, status FROM care_episodes WHERE id = ? AND doctor_id = ?`
    ).bind(body.episodeId, doctorId).first()

    if (!episode) {
      return new Response(JSON.stringify({ error: 'Episode not found or not assigned to you' }), { status: 404 })
    }

    if (body.action === 'respond') {
      // Doctor sends text response (e-consult)
      if (!body.responseText?.trim()) {
        return new Response(JSON.stringify({ error: 'responseText required' }), { status: 400 })
      }

      await env.DB.prepare(
        `UPDATE care_episodes
         SET ped_response_text = ?, ped_response_at = datetime('now'),
             status = 'resolved', resolved_at = datetime('now'),
             resolved_by = 'doctor', resolution_note = 'Doctor responded via e-consult',
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(body.responseText.trim(), body.episodeId).run()

      // TODO: Trigger push notification to parent: "Your doctor reviewed [child]'s record"

      return new Response(JSON.stringify({ updated: true, status: 'resolved' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'resolve') {
      await env.DB.prepare(
        `UPDATE care_episodes
         SET status = 'resolved', resolved_at = datetime('now'),
             resolved_by = 'doctor', resolution_note = ?,
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(body.resolutionNote || 'Reviewed, no action needed', body.episodeId).run()

      return new Response(JSON.stringify({ updated: true, status: 'resolved' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'escalate') {
      // Doctor escalates pathway (e.g., econsult → tele, tele → inperson)
      const newPathway = body.newPathway || '4_tele'
      await env.DB.prepare(
        `UPDATE care_episodes
         SET pathway = ?, status = 'awaiting_ped',
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(newPathway, body.episodeId).run()

      // TODO: Notify parent of escalation

      return new Response(JSON.stringify({ updated: true, pathway: newPathway }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'schedule') {
      // Doctor initiates appointment booking
      // For now, update the pathway — actual booking integration comes in Phase 4
      const newPathway = body.scheduleType === 'inperson' ? '5_inperson' : '4_tele'
      await env.DB.prepare(
        `UPDATE care_episodes
         SET pathway = ?, status = 'awaiting_ped',
             updated_at = datetime('now')
         WHERE id = ?`
      ).bind(newPathway, body.episodeId).run()

      // TODO: Create service_order and link via linked_order_id

      return new Response(JSON.stringify({ updated: true, pathway: newPathway, status: 'awaiting_ped' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  } catch (e: unknown) {
    console.error('[Doctor Episodes] POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to update episode' }), { status: 500 })
  }
}
