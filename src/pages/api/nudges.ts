/**
 * GET  /api/nudges?childId=xxx — Smart nudges for a child
 * POST /api/nudges — Dismiss a nudge
 *
 * Nudges are computed on-demand from the life record.
 * Dismissed nudges are filtered out via the nudge_dismissals table.
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'
import { buildLifeRecordContext } from '../../lib/ai/life-record/context-builder'
import { generateNudges, filterDismissedNudges } from '../../lib/ai/nudges'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  const db = env.DB
  const owns = await verifyChildOwnership(parentId, childId, db)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  try {
    const lifeRecord = await buildLifeRecordContext(childId, db)
    const allNudges = await generateNudges(lifeRecord, db)
    const nudges = await filterDismissedNudges(allNudges, parentId, db)

    return new Response(JSON.stringify({ nudges }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Nudges] Error:', err)
    return new Response(JSON.stringify({ error: 'Failed to generate nudges' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const body = await request.json() as { action: string; nudgeKey: string }

  if (body.action === 'dismiss' && body.nudgeKey) {
    try {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO nudge_dismissals (id, parent_id, nudge_key, dismissed_at)
         VALUES (?, ?, ?, datetime('now'))`
      ).bind(crypto.randomUUID(), parentId, body.nudgeKey).run()

      return new Response(JSON.stringify({ dismissed: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: 'Failed to dismiss nudge' }), { status: 500 })
    }
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
}
