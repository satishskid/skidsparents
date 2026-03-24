import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getParentFeatures } from '@/lib/subscriptions'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  interface SubRow {
    id: string; tier_id: string; status: string; started_at: string
    expires_at: string | null; billing_cycle: string; features_snapshot_json: string
  }

  const sub = await env.DB
    .prepare(
      `SELECT id, tier_id, status, started_at, expires_at, billing_cycle, features_snapshot_json
       FROM parent_subscriptions WHERE parent_id = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(parentId)
    .first<SubRow>()

  const features = await getParentFeatures(parentId, env.DB)

  return new Response(JSON.stringify({ subscription: sub ?? null, features }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
