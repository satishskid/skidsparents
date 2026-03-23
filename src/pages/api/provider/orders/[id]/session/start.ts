import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { AccessToken } from 'livekit-server-sdk'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, params, locals }) => {
  const env = getEnv(locals)
  const orderId = params.id as string

  let providerId: string
  try {
    const id = await getProviderId(request, env)
    if (!id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    providerId = id
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && e.code === 'PROVIDER_PENDING') {
      return new Response(JSON.stringify({ error: 'Account pending review' }), { status: 403 })
    }
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    // Verify order belongs to provider and is scheduled
    interface OrderIdRow { id: string }
    const order = await env.DB.prepare(
      "SELECT id FROM service_orders WHERE id = ? AND provider_id = ? AND status = 'scheduled'"
    ).bind(orderId, providerId).first<OrderIdRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found or not in scheduled state' }), { status: 404 })
    }

    const roomName = `skids-${orderId}`

    let token: string | null = null
    let fallback = false

    try {
      const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
        identity: `provider-${providerId}`,
        ttl: '2h',
      })
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      })
      token = await at.toJwt()
    } catch (e: unknown) {
      console.error('[session/start] LiveKit token generation failed:', e)
      fallback = true
    }

    // Update order: session_url, status → in_progress, session_started_at
    await env.DB.prepare(
      "UPDATE service_orders SET session_url = ?, status = 'in_progress', session_started_at = datetime('now') WHERE id = ?"
    ).bind(roomName, orderId).run()

    if (fallback) {
      return new Response(JSON.stringify({ token: null, fallback: true, roomName, livekitUrl: env.LIVEKIT_URL }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ roomName, token, livekitUrl: env.LIVEKIT_URL }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[session/start] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
