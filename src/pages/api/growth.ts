/**
 * GET  /api/growth?childId=xxx — List growth records
 * POST /api/growth — Add a growth measurement
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
      'SELECT * FROM growth_records WHERE child_id = ? ORDER BY date DESC LIMIT 20'
    ).bind(childId).all()

    return new Response(JSON.stringify({ records: results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message?.includes('no such table')) {
      return new Response(JSON.stringify({ records: [] }), { status: 200 })
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch growth records' }), { status: 500 })
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
    heightCm?: number
    weightKg?: number
    headCircCm?: number
  }

  if (!body.childId) {
    return new Response(JSON.stringify({ error: 'childId required' }), { status: 400 })
  }

  if (!body.heightCm && !body.weightKg && !body.headCircCm) {
    return new Response(JSON.stringify({ error: 'At least one measurement required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const date = body.date || new Date().toISOString().split('T')[0]

  // Calculate BMI if both height and weight provided
  let bmi: number | null = null
  if (body.heightCm && body.weightKg) {
    const heightM = body.heightCm / 100
    bmi = Math.round((body.weightKg / (heightM * heightM)) * 10) / 10
  }

  try {
    const id = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO growth_records (id, child_id, date, height_cm, weight_kg, head_circ_cm, bmi, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id,
      body.childId,
      date,
      body.heightCm || null,
      body.weightKg || null,
      body.headCircCm || null,
      bmi
    ).run()

    return new Response(JSON.stringify({ id, bmi, created: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message?.includes('no such table')) {
      return new Response(JSON.stringify({ error: 'Tables not created. Visit /admin and click Init DB.' }), { status: 500 })
    }
    console.error('[Growth] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to save growth record' }), { status: 500 })
  }
}
