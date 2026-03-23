/**
 * POST /api/payments/create-order
 * Creates a Razorpay order and inserts a pending service_order row.
 */

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

  let body: { serviceId?: string; childId?: string; providerId?: string; slotId?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { serviceId, childId, providerId, slotId } = body
  if (!serviceId || !childId || !providerId || !slotId) {
    return new Response(
      JSON.stringify({ error: 'serviceId, childId, providerId, slotId are required' }),
      { status: 400 }
    )
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    // Fetch service price
    interface ServiceRow { id: string; name: string; price_cents: number }
    const service = await db
      .prepare('SELECT id, name, price_cents FROM services WHERE id = ?')
      .bind(serviceId)
      .first<ServiceRow>()
    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404 })
    }
    const priceCents = service.price_cents

    // Fetch provider commission
    interface ProviderRow { id: string; commission_pct: number }
    const provider = await db
      .prepare('SELECT id, commission_pct FROM providers WHERE id = ?')
      .bind(providerId)
      .first<ProviderRow>()
    if (!provider) {
      return new Response(JSON.stringify({ error: 'Provider not found' }), { status: 404 })
    }
    const commissionPct = provider.commission_pct

    // Call Razorpay Orders API
    const receipt = 'skids_' + crypto.randomUUID()
    const razorpayAuth = btoa(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    )
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${razorpayAuth}`,
      },
      body: JSON.stringify({ amount: priceCents, currency: 'INR', receipt }),
    })

    if (!rzpRes.ok) {
      const err = await rzpRes.text()
      console.error('[create-order] Razorpay error:', err)
      return new Response(JSON.stringify({ error: 'Failed to create Razorpay order' }), { status: 502 })
    }

    const rzpOrder = await rzpRes.json() as { id: string; amount: number; currency: string }

    // Insert service_orders row
    const serviceOrderId = crypto.randomUUID()
    await db
      .prepare(
        `INSERT INTO service_orders
          (id, parent_id, child_id, service_id, provider_id, slot_id,
           status, razorpay_order_id, commission_pct_snapshot, brand, amount_cents, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, 'skids', ?, datetime('now'))`
      )
      .bind(
        serviceOrderId,
        parentId,
        childId,
        serviceId,
        providerId,
        slotId,
        rzpOrder.id,
        commissionPct,
        priceCents
      )
      .run()

    return new Response(
      JSON.stringify({
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: 'INR',
        serviceOrderId,
        keyId: env.RAZORPAY_KEY_ID,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[create-order] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
