import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  interface SubBody { tier_id?: string; payment_id?: string; billing_cycle?: string }
  let body: SubBody
  try {
    body = await request.json() as SubBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  if (!body.tier_id || !body.payment_id) {
    return new Response(JSON.stringify({ error: 'tier_id and payment_id are required' }), { status: 400 })
  }

  // Check for existing active/expired/cancelled subscription for this parent+tier
  interface ExistingRow { status: string }
  const existing = await env.DB
    .prepare(
      `SELECT status FROM parent_subscriptions
       WHERE parent_id = ? AND tier_id = ? AND status IN ('expired', 'cancelled')
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(parentId, body.tier_id)
    .first<ExistingRow>()

  if (existing) {
    return new Response(
      JSON.stringify({ error: 'Reactivation requires a new payment' }),
      { status: 400 },
    )
  }

  // Snapshot features from tier
  interface TierRow { features_json: string }
  const tier = await env.DB
    .prepare('SELECT features_json FROM pricing_tiers WHERE id = ? AND is_active = 1')
    .bind(body.tier_id)
    .first<TierRow>()

  if (!tier) {
    return new Response(JSON.stringify({ error: 'Tier not found or inactive' }), { status: 404 })
  }

  const id = crypto.randomUUID()
  const billingCycle = body.billing_cycle === 'yearly' ? 'yearly' : 'monthly'

  await env.DB.prepare(
    `INSERT INTO parent_subscriptions
     (id, parent_id, tier_id, status, payment_id, billing_cycle, features_snapshot_json)
     VALUES (?, ?, ?, 'active', ?, ?, ?)`,
  ).bind(id, parentId, body.tier_id, body.payment_id, billingCycle, tier.features_json).run()

  interface CreatedRow { id: string; parent_id: string; tier_id: string; status: string; started_at: string; billing_cycle: string; features_snapshot_json: string }
  const created = await env.DB
    .prepare('SELECT * FROM parent_subscriptions WHERE id = ?')
    .bind(id)
    .first<CreatedRow>()

  return new Response(JSON.stringify({ subscription: created }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
