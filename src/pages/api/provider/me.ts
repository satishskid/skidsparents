/**
 * GET /api/provider/me — Return authenticated provider's profile
 */

import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

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
    interface ProviderRow { id: string; name: string; email: string; phone: string; specialty: string; status: string; is_verified: number; commission_pct: number; created_at: string }
    const provider = await env.DB.prepare('SELECT * FROM providers WHERE id = ?').bind(providerId).first<ProviderRow>()
    if (!provider) return new Response(JSON.stringify({ error: 'Provider not found' }), { status: 404 })

    return new Response(JSON.stringify({ provider }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[provider/me] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), { status: 500 })
  }
}
