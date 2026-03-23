/**
 * GET /api/provider/phr/:childId — PHR access gate for providers
 * Requires an active (non-cancelled, non-completed) order linking provider to child.
 */

import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, params, locals }) => {
  const env = getEnv(locals)
  const childId = params.childId as string

  let providerId: string
  try {
    const id = await getProviderId(request, env)
    if (!id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    providerId = id
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && e.code === 'PROVIDER_PENDING') return new Response(JSON.stringify({ error: 'Account pending review' }), { status: 403 })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    // Check for active order linking provider to child
    interface OrderIdRow { id: string }
    const activeOrder = await env.DB.prepare(
      `SELECT id FROM service_orders
       WHERE provider_id = ? AND child_id = ? AND status NOT IN ('cancelled', 'completed')
       LIMIT 1`
    ).bind(providerId, childId).first<OrderIdRow>()

    if (!activeOrder) {
      // Write audit log entry for denied access
      try {
        await env.DB.prepare(
          `INSERT INTO audit_log (id, actor_id, action_type, target_type, target_id, reason, created_at)
           VALUES (?, ?, 'phr_access_denied', 'phr', ?, ?, datetime('now'))`
        ).bind(crypto.randomUUID(), providerId, childId, 'No active order').run()
      } catch {
        // Audit log failure must not block the response
      }

      return new Response(
        JSON.stringify({ error: 'No active order for this patient' }),
        { status: 403 }
      )
    }

    // Fetch PHR data in parallel
    interface ChildRow { name: string; dob: string; gender: string | null; blood_group: string | null; allergies_json: string | null }
    interface GrowthRow { id: string; child_id: string; date: string; height_cm: number | null; weight_kg: number | null; head_circ_cm: number | null; bmi: number | null }
    const [child, latestGrowth, milestones, vaccinations, flaggedObservations] = await Promise.all([
      env.DB.prepare(
        `SELECT name, dob, gender, blood_group, allergies_json FROM children WHERE id = ?`
      ).bind(childId).first<ChildRow>(),

      env.DB.prepare(
        `SELECT * FROM growth_records WHERE child_id = ? ORDER BY date DESC LIMIT 1`
      ).bind(childId).first<GrowthRow>(),

      env.DB.prepare(
        `SELECT * FROM milestones WHERE child_id = ? AND status IN ('delayed','in_progress') ORDER BY updated_at DESC LIMIT 10`
      ).bind(childId).all().then((r: any) => r.results || []),

      env.DB.prepare(
        `SELECT * FROM vaccination_records WHERE child_id = ? ORDER BY next_due ASC LIMIT 10`
      ).bind(childId).all().then((r: any) => r.results || []),

      env.DB.prepare(
        `SELECT * FROM parent_observations WHERE child_id = ? AND concern_level IN ('moderate','serious') ORDER BY date DESC LIMIT 5`
      ).bind(childId).all().then((r: any) => r.results || []),
    ])

    return new Response(
      JSON.stringify({ child, latestGrowth, milestones, vaccinations, flaggedObservations }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[provider/phr] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch PHR' }), { status: 500 })
  }
}
