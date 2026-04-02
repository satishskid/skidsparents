/**
 * GET /api/daily-insights?childId=xxx — Personalized daily insights
 *
 * Returns 1-3 insights generated from the child's life record.
 * Cached per child+date so we don't regenerate same-day.
 *
 * This is the parent's "morning briefing" — not generic blogs.
 * Every word comes from the child's actual data + knowledge graph.
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from './children'
import { buildLifeRecordContext } from '../../lib/ai/life-record/context-builder'
import { generateDailyInsights } from '../../lib/ai/daily-insights'

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
  const ai = env.AI

  const owns = await verifyChildOwnership(parentId, childId, db)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const today = new Date().toISOString().split('T')[0]

  try {
    // Check cache first
    if (db) {
      try {
        const cached = await db.prepare(
          'SELECT insights_json FROM daily_insights WHERE child_id = ? AND date = ?'
        ).bind(childId, today).first() as any

        if (cached?.insights_json) {
          return new Response(JSON.stringify({
            insights: JSON.parse(cached.insights_json),
            cached: true,
            date: today,
          }), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
      } catch {
        // Table might not exist yet — continue to generate
      }
    }

    // Generate fresh insights
    const lifeRecord = await buildLifeRecordContext(childId, db)
    const insights = await generateDailyInsights(lifeRecord, db, ai)

    // Cache for today
    if (db && insights.length > 0) {
      try {
        await db.prepare(
          `INSERT OR REPLACE INTO daily_insights (id, child_id, date, insights_json, generated_at)
           VALUES (?, ?, ?, ?, datetime('now'))`
        ).bind(
          `${childId}_${today}`,
          childId,
          today,
          JSON.stringify(insights)
        ).run()
      } catch {
        // Caching failure is non-blocking
      }
    }

    return new Response(JSON.stringify({
      insights,
      cached: false,
      date: today,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[DailyInsights] Error:', err)
    return new Response(JSON.stringify({
      error: 'Failed to generate insights',
      detail: err?.message || String(err),
    }), { status: 500 })
  }
}
