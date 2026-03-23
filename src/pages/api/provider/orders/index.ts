/**
 * GET /api/provider/orders — Orders assigned to this provider with service + child details
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
    const { results } = await env.DB.prepare(
      `SELECT so.*, s.name as service_name, s.category, c.name as child_name, c.dob as child_dob
       FROM service_orders so
       JOIN services s ON s.id = so.service_id
       JOIN children c ON c.id = so.child_id
       WHERE so.provider_id = ?
       ORDER BY so.created_at DESC`
    ).bind(providerId).all()

    return new Response(JSON.stringify({ orders: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[provider/orders] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500 })
  }
}
