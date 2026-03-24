/**
 * GET /api/screening-results          — all records for authenticated parent's children
 * GET /api/screening-results?childId= — records for a specific child (ownership enforced)
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

interface ScreeningRow {
  id: string
  child_id: string
  screening_date: string | null
  imported_at: string
  summary_text: string | null
  four_d_json: string | null
  data_json: string | null
  campaign_code: string | null
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')

  try {
    let rows: ScreeningRow[]

    if (childId) {
      // Verify ownership before filtering
      const owns = await verifyChildOwnership(parentId, childId, env.DB)
      if (!owns) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
      }
      const { results } = await env.DB.prepare(
        `SELECT id, child_id, screening_date, imported_at, summary_text, four_d_json, data_json, campaign_code
         FROM screening_imports
         WHERE child_id = ?
         ORDER BY imported_at DESC`
      ).bind(childId).all<ScreeningRow>()
      rows = results ?? []
    } else {
      // All children belonging to this parent
      const { results } = await env.DB.prepare(
        `SELECT si.id, si.child_id, si.screening_date, si.imported_at, si.summary_text, si.four_d_json, si.data_json, si.campaign_code
         FROM screening_imports si
         INNER JOIN children c ON c.id = si.child_id
         WHERE c.parent_id = ?
         ORDER BY si.imported_at DESC`
      ).bind(parentId).all<ScreeningRow>()
      rows = results ?? []
    }

    const records = rows.map((r) => ({
      id: r.id,
      childId: r.child_id,
      screeningDate: r.screening_date,
      importedAt: r.imported_at,
      summaryText: r.summary_text,
      fourDJson: r.four_d_json,
      dataJson: r.data_json,
      campaignCode: r.campaign_code,
    }))

    return new Response(JSON.stringify({ records }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[ScreeningResults] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch results' }), { status: 500 })
  }
}
