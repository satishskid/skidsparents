/**
 * POST /api/push/register — Upsert FCM token for authenticated parent
 */
import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json() as { fcmToken?: string }
    const { fcmToken } = body
    if (!fcmToken || typeof fcmToken !== 'string') {
      return new Response(JSON.stringify({ error: 'fcmToken is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    const userAgent = request.headers.get('user-agent') ?? null

    // Check if record exists
    interface SubRow { id: string }
    const existing = await env.DB.prepare(
      'SELECT id FROM push_subscriptions WHERE parent_id = ? AND fcm_token = ?'
    ).bind(parentId, fcmToken).first<SubRow>()

    if (existing) {
      await env.DB.prepare(
        `UPDATE push_subscriptions SET is_active = 1, registered_at = datetime('now') WHERE id = ?`
      ).bind(existing.id).run()
    } else {
      const id = crypto.randomUUID()
      await env.DB.prepare(
        `INSERT INTO push_subscriptions (id, parent_id, fcm_token, user_agent, registered_at, is_active)
         VALUES (?, ?, ?, ?, datetime('now'), 1)`
      ).bind(id, parentId, fcmToken, userAgent).run()
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[push/register] error:', e)
    return new Response(JSON.stringify({ error: 'Failed to register token' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
