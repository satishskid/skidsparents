/**
 * POST /api/pilot/engagement — Log pilot engagement events
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

const VALID_EVENTS = ['viewed_projection', 'viewed_growth_track', 'viewed_intervention', 'completed_task', 'chatted_ai', 'booked_consult', 'pilot_accepted', 'screening_bridge', 'registered']

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { parent_id, child_id, event_type, event_data } = await request.json()
    if (!parent_id || !event_type) {
      return new Response(JSON.stringify({ error: 'parent_id and event_type required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    if (!VALID_EVENTS.includes(event_type)) {
      return new Response(JSON.stringify({ error: 'Invalid event_type' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const env = getEnv(locals)
    const db = env.DB
    if (!db) return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    await db.prepare(`
      INSERT INTO pilot_engagement_log (id, parent_id, child_id, event_type, event_data_json) VALUES (?, ?, ?, ?, ?)
    `).bind(id, parent_id, child_id || null, event_type, event_data ? JSON.stringify(event_data) : null).run()

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to log event' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
