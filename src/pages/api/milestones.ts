/**
 * GET  /api/milestones?childId=xxx — List milestones for a child
 * POST /api/milestones — Create or update a milestone record
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'
import { getEnv } from '@/lib/runtime/env'

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
    const category = url.searchParams.get('category')
    let sql = 'SELECT * FROM milestones WHERE child_id = ?'
    const params: any[] = [childId]
    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }
    sql += ' ORDER BY expected_age_min ASC, category ASC'

    const { results } = await env.DB.prepare(sql).bind(...params).all()
    return new Response(JSON.stringify({ milestones: results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ milestones: [] }), { status: 200 })
    }
    console.error('[Milestones] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch milestones' }), { status: 500 })
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
    milestoneKey: string
    title: string
    category: string
    status: string
    observedAt?: string
    parentNotes?: string
    expectedAgeMin?: number
    expectedAgeMax?: number
  }

  if (!body.childId || !body.milestoneKey || !body.category) {
    return new Response(JSON.stringify({ error: 'childId, milestoneKey, and category required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  try {
    // Upsert: check if milestone exists for this child + key
    interface MilestoneIdRow { id: string }
    const existing = await env.DB.prepare(
      'SELECT id FROM milestones WHERE child_id = ? AND milestone_key = ?'
    ).bind(body.childId, body.milestoneKey).first<MilestoneIdRow>()

    if (existing) {
      await env.DB.prepare(
        `UPDATE milestones SET status = ?, observed_at = ?, parent_notes = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        body.status || 'not_started',
        body.observedAt || null,
        body.parentNotes || null,
        existing.id
      ).run()

      return new Response(JSON.stringify({ id: existing.id, updated: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const id = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO milestones (id, child_id, category, milestone_key, title, status, observed_at, parent_notes, expected_age_min, expected_age_max, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id,
      body.childId,
      body.category,
      body.milestoneKey,
      body.title || body.milestoneKey,
      body.status || 'not_started',
      body.observedAt || null,
      body.parentNotes || null,
      body.expectedAgeMin ?? null,
      body.expectedAgeMax ?? null
    ).run()

    return new Response(JSON.stringify({ id, created: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ error: 'Tables not created. Visit /admin and click Init DB.' }), { status: 500 })
    }
    console.error('[Milestones] POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to save milestone' }), { status: 500 })
  }
}
