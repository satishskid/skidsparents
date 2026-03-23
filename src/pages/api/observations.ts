/**
 * GET  /api/observations?childId=xxx — List parent observations
 * POST /api/observations — Add a new observation
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

    return new Response(JSON.stringify({ id, created: true }), {
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
