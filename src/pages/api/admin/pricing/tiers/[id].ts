import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function isAdminAuthorized(request: Request, adminKey: string): boolean {
  const auth = request.headers.get('Authorization') ?? ''
  return auth === `Bearer ${adminKey}`
}

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const env = getEnv(locals)
  if (!isAdminAuthorized(request, env.ADMIN_KEY ?? '')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const tierId = params.id!

  interface UpdateBody {
    name?: string; description?: string; currency?: string
    amount_cents?: number; amount_yearly_cents?: number
    features_json?: string[]; is_active?: boolean
  }

  let body: UpdateBody
  try {
    body = await request.json() as UpdateBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const sets: string[] = []
  const binds: unknown[] = []

  if (body.name !== undefined) { sets.push('name = ?'); binds.push(body.name) }
  if (body.description !== undefined) { sets.push('description = ?'); binds.push(body.description) }
  if (body.currency !== undefined) { sets.push('currency = ?'); binds.push(body.currency) }
  if (body.amount_cents !== undefined) { sets.push('amount_cents = ?'); binds.push(body.amount_cents) }
  if (body.amount_yearly_cents !== undefined) { sets.push('amount_yearly_cents = ?'); binds.push(body.amount_yearly_cents) }
  if (body.features_json !== undefined) { sets.push('features_json = ?'); binds.push(JSON.stringify(body.features_json)) }
  if (body.is_active !== undefined) { sets.push('is_active = ?'); binds.push(body.is_active ? 1 : 0) }

  if (sets.length === 0) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 })
  }

  binds.push(tierId)
  await env.DB.prepare(`UPDATE pricing_tiers SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...binds).run()

  interface TierRow { id: string; name: string; description: string | null; currency: string; amount_cents: number; amount_yearly_cents: number; features_json: string; is_active: number; created_at: string }
  const updated = await env.DB.prepare('SELECT * FROM pricing_tiers WHERE id = ?').bind(tierId).first<TierRow>()

  return new Response(JSON.stringify({ tier: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const env = getEnv(locals)
  if (!isAdminAuthorized(request, env.ADMIN_KEY ?? '')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const tierId = params.id!

  interface TierRow { amount_cents: number }
  const tier = await env.DB.prepare('SELECT amount_cents FROM pricing_tiers WHERE id = ?').bind(tierId).first<TierRow>()

  if (!tier) {
    return new Response(JSON.stringify({ error: 'Tier not found' }), { status: 404 })
  }

  if (tier.amount_cents === 0) {
    return new Response(JSON.stringify({ error: 'Free tier cannot be deactivated' }), { status: 400 })
  }

  await env.DB.prepare('UPDATE pricing_tiers SET is_active = 0 WHERE id = ?').bind(tierId).run()

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
