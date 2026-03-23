/**
 * GET  /api/habits?childId=xxx&days=7 — List habit logs for a child
 * POST /api/habits — Log a habit for today
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
    const days = parseInt(url.searchParams.get('days') || '7', 10)
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().split('T')[0]

    const { results } = await env.DB.prepare(
      'SELECT * FROM habits_log WHERE child_id = ? AND date >= ? ORDER BY date DESC, habit_type ASC'
    ).bind(childId, sinceStr).all()

    return new Response(JSON.stringify({ habits: results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ habits: [] }), { status: 200 })
    }
    console.error('[Habits] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch habits' }), { status: 500 })
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
    habitType: string
    date?: string
    valueJson?: any
  }

  if (!body.childId || !body.habitType) {
    return new Response(JSON.stringify({ error: 'childId and habitType required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const date = body.date || new Date().toISOString().split('T')[0]

  try {
    // Check if already logged today for this habit
    interface HabitIdRow { id: string }
    const existing = await env.DB.prepare(
      'SELECT id FROM habits_log WHERE child_id = ? AND date = ? AND habit_type = ?'
    ).bind(body.childId, date, body.habitType).first<HabitIdRow>()

    if (existing) {
      // Toggle off — delete the log
      await env.DB.prepare('DELETE FROM habits_log WHERE id = ?').bind(existing.id).run()
      return new Response(JSON.stringify({ removed: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Calculate streak
    let streak = 1
    const yesterday = new Date(date)
    yesterday.setDate(yesterday.getDate() - 1)
    interface HabitStreakRow { streak_days: number }
    const prevLog = await env.DB.prepare(
      'SELECT streak_days FROM habits_log WHERE child_id = ? AND date = ? AND habit_type = ?'
    ).bind(body.childId, yesterday.toISOString().split('T')[0], body.habitType).first<HabitStreakRow>()

    if (prevLog) {
      streak = (prevLog.streak_days || 0) + 1
    }

    const id = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO habits_log (id, child_id, date, habit_type, value_json, streak_days, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id,
      body.childId,
      date,
      body.habitType,
      body.valueJson ? JSON.stringify(body.valueJson) : null,
      streak
    ).run()

    return new Response(JSON.stringify({ id, streak, created: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ error: 'Tables not created. Visit /admin and click Init DB.' }), { status: 500 })
    }
    console.error('[Habits] POST error:', e)
    return new Response(JSON.stringify({ error: 'Failed to log habit' }), { status: 500 })
  }
}
