/**
 * GET /api/timeline?childId=xxx&page=1&limit=20 — Unified life record timeline
 *
 * Combines observations, milestones, daily insights, and doctor refinements
 * into a single reverse-chronological feed. The Instagram-like "Story" of the child.
 *
 * Each item is normalized to a TimelineEntry with consistent structure
 * regardless of source table.
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'

export const prerender = false

interface TimelineEntry {
  id: string
  type: 'observation' | 'milestone' | 'insight' | 'doctor_note'
  timestamp: string
  data: Record<string, any>
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
  const domain = url.searchParams.get('domain')
  const filter = url.searchParams.get('filter') // 'flagged', 'photos', 'all'

  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  const db = env.DB
  const owns = await verifyChildOwnership(parentId, childId, db)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const offset = (page - 1) * limit

  try {
    const entries: TimelineEntry[] = []

    // 1. Observations (with projections)
    let obsQuery = `
      SELECT o.*,
        (SELECT GROUP_CONCAT(op.condition_name || '::' || op.adjusted_probability || '::' || op.urgency || '::' || op.must_not_miss || '::' || op.parent_explanation, '|||')
         FROM observation_projections op WHERE op.observation_id = o.id) as projections_summary,
        (SELECT pr.clarifying_questions_json FROM projection_results pr WHERE pr.observation_id = o.id LIMIT 1) as clarifying_questions
      FROM parent_observations o
      WHERE o.child_id = ?`

    const obsParams: any[] = [childId]

    if (domain) {
      obsQuery += ` AND o.category = ?`
      obsParams.push(domain)
    }
    if (filter === 'photos') {
      obsQuery += ` AND o.media_url IS NOT NULL`
    }
    if (filter === 'flagged') {
      obsQuery += ` AND o.concern_level IN ('moderate', 'serious')`
    }

    obsQuery += ` ORDER BY o.date DESC, o.created_at DESC LIMIT ? OFFSET ?`
    obsParams.push(limit, offset)

    try {
      const { results: observations } = await db.prepare(obsQuery).bind(...obsParams).all()

      for (const obs of (observations || []) as any[]) {
        // Parse projections summary into structured data
        let projections: any[] = []
        if (obs.projections_summary) {
          projections = obs.projections_summary.split('|||').map((p: string) => {
            const [conditionName, probability, urgency, mustNotMiss, explanation] = p.split('::')
            return {
              conditionName,
              probability: parseFloat(probability),
              urgency,
              mustNotMiss: mustNotMiss === '1',
              explanation,
            }
          }).filter((p: any) => p.conditionName)
        }

        let clarifyingQuestions: string[] = []
        if (obs.clarifying_questions) {
          try { clarifyingQuestions = JSON.parse(obs.clarifying_questions) } catch {}
        }

        entries.push({
          id: obs.id,
          type: 'observation',
          timestamp: obs.created_at || obs.date,
          data: {
            text: obs.observation_text,
            category: obs.category,
            concernLevel: obs.concern_level,
            mediaUrl: obs.media_url,
            mediaType: obs.media_type,
            source: obs.source || 'active',
            projections,
            clarifyingQuestions,
          },
        })
      }
    } catch (err: any) {
      if (!err.message?.includes('no such table') && !err.message?.includes('no such column')) {
        throw err
      }
    }

    // 2. Milestones (achieved only, for celebrations)
    if (!domain || domain === 'milestone') {
      try {
        const { results: milestones } = await db.prepare(
          `SELECT * FROM milestones
           WHERE child_id = ? AND status = 'achieved'
           ORDER BY updated_at DESC LIMIT ? OFFSET ?`
        ).bind(childId, Math.floor(limit / 3), offset > 0 ? Math.floor(offset / 3) : 0).all()

        for (const ms of (milestones || []) as any[]) {
          entries.push({
            id: `ms_${ms.id}`,
            type: 'milestone',
            timestamp: ms.updated_at || ms.observed_at,
            data: {
              key: ms.milestone_key,
              title: ms.title,
              category: ms.category,
              notes: ms.parent_notes,
            },
          })
        }
      } catch {}
    }

    // 3. Daily insights (compact form)
    if (!domain && !filter) {
      try {
        const { results: insights } = await db.prepare(
          `SELECT * FROM daily_insights
           WHERE child_id = ?
           ORDER BY date DESC LIMIT 5 OFFSET ?`
        ).bind(childId, offset > 0 ? Math.floor(offset / 4) : 0).all()

        for (const insight of (insights || []) as any[]) {
          try {
            const parsed = JSON.parse(insight.insights_json)
            if (Array.isArray(parsed) && parsed.length > 0) {
              entries.push({
                id: `ins_${insight.id}`,
                type: 'insight',
                timestamp: insight.generated_at || insight.date,
                data: {
                  date: insight.date,
                  insights: parsed,
                },
              })
            }
          } catch {}
        }
      } catch {}
    }

    // 4. Doctor refinements
    if (!domain || !filter) {
      try {
        const { results: refinements } = await db.prepare(
          `SELECT dr.*, op.condition_name, op.parent_explanation
           FROM doctor_refinements dr
           JOIN observation_projections op ON dr.projection_id = op.id
           WHERE dr.child_id = ?
           ORDER BY dr.refined_at DESC LIMIT 5`
        ).bind(childId).all()

        for (const ref of (refinements || []) as any[]) {
          entries.push({
            id: `dr_${ref.id}`,
            type: 'doctor_note',
            timestamp: ref.refined_at,
            data: {
              conditionName: ref.condition_name,
              action: ref.action,
              clinicalFindings: ref.clinical_findings,
              notes: ref.notes,
              explanation: ref.parent_explanation,
            },
          })
        }
      } catch {}
    }

    // Sort all entries by timestamp (reverse chronological)
    entries.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime()
      const dateB = new Date(b.timestamp || 0).getTime()
      return dateB - dateA
    })

    // Trim to requested limit
    const trimmed = entries.slice(0, limit)

    return new Response(JSON.stringify({
      entries: trimmed,
      page,
      limit,
      hasMore: entries.length >= limit,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Timeline] Error:', err)
    return new Response(JSON.stringify({
      error: 'Failed to fetch timeline',
      detail: err?.message || String(err),
    }), { status: 500 })
  }
}
