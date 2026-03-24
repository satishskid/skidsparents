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

  try {
    interface SubRow { id: string }
    const row = await env.DB
      .prepare(
        `SELECT id FROM parent_subscriptions
         WHERE parent_id = ? AND status = 'active'
         ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(parentId)
      .first<SubRow>()

    if (!row) {
      return new Response(JSON.stringify({ error: 'no_active_subscription' }), { status: 400 })
    }

    await env.DB
      .prepare(
        `UPDATE parent_subscriptions SET status = 'cancelled'
         WHERE id = ? AND parent_id = ? AND status = 'active'`,
      )
      .bind(row.id, parentId)
      .run()

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
