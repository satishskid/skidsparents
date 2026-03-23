import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
import { routeToModel } from '@/lib/ai/router'
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
    // Verify active order belongs to provider
    interface OrderRow { id: string; child_id: string }
    const order = await env.DB.prepare(
      "SELECT id, child_id FROM service_orders WHERE id = ? AND provider_id = ? AND status IN ('scheduled','in_progress')"
    ).bind(orderId, providerId).first<OrderRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found or not active' }), { status: 404 })
    }

    const body = await request.json() as { query?: string }
    const query = body.query?.trim()
    if (!query) {
      return new Response(JSON.stringify({ error: 'query is required' }), { status: 400 })
    }

    // Fetch child name + dob
    interface ChildRow { name: string; dob: string }
    const child = await env.DB.prepare('SELECT name, dob FROM children WHERE id = ?')
      .bind(order.child_id).first<ChildRow>()

    const childName = child?.name || 'Unknown'
    const childDob = child?.dob || 'Unknown'

    const messages = [
      {
        role: 'system' as const,
        content: `You are a clinical AI assistant helping a pediatric doctor during a teleconsult. Patient: ${childName}, DOB: ${childDob}. Provide concise, evidence-based clinical guidance. Use Indian context (IAP guidelines, common Indian conditions).`,
      },
      { role: 'user' as const, content: query },
    ]

    const aiResponse = await routeToModel(messages, 'free', env)

    return new Response(JSON.stringify({ response: aiResponse.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[ai-assist] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
