import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function isAdminAuthorized(request: Request, adminKey: string): boolean {
  const auth = request.headers.get('Authorization') ?? ''
  return auth === `Bearer ${adminKey}`
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!isAdminAuthorized(request, env.ADMIN_KEY ?? '')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  interface TierRow {
    id: string; name: string; description: string | null; currency: string
    amount_cents: number; amount_yearly_cents: number; features_json: string
    is_active: number; created_at: string
  }

  const result = await env.DB
    .prepare('SELECT * FROM pricing_tiers ORDER BY created_at ASC')
    .all<TierRow>()

  const tiers = (result.results ?? []).map((t) => ({
    ...t,
    features: JSON.parse(t.features_json || '[]') as string[],
    is_active: Boolean(t.is_active),
  }))

  return new Response(JSON.stringify({ tiers }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!isAdminAuthorized(request, env.ADMIN_KEY ?? '')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  interface TierBody {
    name?: string; description?: string; currency?: string
    amount_cents?: number; amount_yearly_cents?: number
    features_json?: string[]; is_active?: boolean
  }

  let body: TierBody
  try {
    body = await request.json() as TierBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  if (!body.name || body.amount_cents === undefined) {
    return new Response(JSON.stringify({ error: 'name and amount_cents are required' }), { status: 400 })
  }

  const id = crypto.randomUUID()
  const featuresJson = JSON.stringify(Array.isArray(body.features_json) ? body.features_json : [])

  await env.DB.prepare(
    `INSERT INTO pricing_tiers (id, name, description, currency, amount_cents, amount_yearly_cents, features_json, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    body.name,
    body.description ?? null,
    body.currency ?? 'INR',
    body.amount_cents,
    body.amount_yearly_cents ?? 0,
    featuresJson,
    body.is_active !== false ? 1 : 0,
  ).run()

  interface CreatedRow { id: string; name: string; description: string | null; currency: string; amount_cents: number; amount_yearly_cents: number; features_json: string; is_active: number; created_at: string }
  const created = await env.DB.prepare('SELECT * FROM pricing_tiers WHERE id = ?').bind(id).first<CreatedRow>()

  return new Response(JSON.stringify({ tier: created }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
