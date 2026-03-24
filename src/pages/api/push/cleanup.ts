/**
 * GET /api/push/cleanup — Deactivate tokens older than 60 days (admin only)
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const adminKey = env.ADMIN_KEY
  const provided =
    request.headers.get('x-admin-key') ??
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!adminKey || provided !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = await env.DB.prepare(
      `UPDATE push_subscriptions SET is_active = 0
       WHERE registered_at < datetime('now', '-60 days') AND is_active = 1`
    ).run()

    return new Response(JSON.stringify({ deactivated: result.meta?.changes ?? 0 }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[push/cleanup] error:', e)
    return new Response(JSON.stringify({ error: 'Cleanup failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
