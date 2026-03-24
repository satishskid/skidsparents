/**
 * POST /api/push/unregister — Deactivate FCM token for authenticated parent
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

    await env.DB.prepare(
      'UPDATE push_subscriptions SET is_active = 0 WHERE parent_id = ? AND fcm_token = ?'
    ).bind(parentId, fcmToken).run()

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[push/unregister] error:', e)
    return new Response(JSON.stringify({ error: 'Failed to unregister token' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
