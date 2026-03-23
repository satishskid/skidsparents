/**
 * GET /api/session/[orderId]/token
 * Generates a LiveKit JWT for the parent to join a session room.
 * Order must belong to the parent and be in 'in_progress' status.
 */

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { AccessToken } from 'livekit-server-sdk'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ params, request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { orderId } = params
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    interface OrderRow { id: string; status: string }
    const order = await db
      .prepare('SELECT id, status FROM service_orders WHERE id = ? AND parent_id = ?')
      .bind(orderId, parentId)
      .first<OrderRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    }

    if (order.status !== 'in_progress') {
      return new Response(
        JSON.stringify({ error: 'Session is not in progress', status: order.status }),
        { status: 409 }
      )
    }

    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: `parent-${parentId}`,
      ttl: '2h',
    })
    at.addGrant({
      roomJoin: true,
      room: `skids-${orderId}`,
      canPublish: true,
      canSubscribe: true,
    })
    const token = await at.toJwt()

    return new Response(
      JSON.stringify({ token, roomName: `skids-${orderId}`, livekitUrl: env.LIVEKIT_URL }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[session/token] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
