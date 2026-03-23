import type { APIRoute } from 'astro'
import { getProviderId } from '@/pages/api/provider/_auth'
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
    // Verify order belongs to provider and is in_progress
    interface OrderRow { id: string; child_id: string; parent_id: string }
    const order = await env.DB.prepare(
      "SELECT id, child_id, parent_id FROM service_orders WHERE id = ? AND provider_id = ? AND status = 'in_progress'"
    ).bind(orderId, providerId).first<OrderRow>()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found or not in progress' }), { status: 404 })
    }

    const body = await request.json() as {
      medications?: any
      education?: any
      nutrition?: any
      behavioural?: any
      followUp?: any
    }

    const { medications, education, nutrition, behavioural, followUp } = body

    // Validate all 5 sections present and non-null
    if (
      medications == null || education == null || nutrition == null ||
      behavioural == null || followUp == null
    ) {
      return new Response(
        JSON.stringify({ error: 'All 5 prescription sections required: medications, education, nutrition, behavioural, followUp' }),
        { status: 400 }
      )
    }

    const prescriptionId = crypto.randomUUID()

    // Insert prescription
    await env.DB.prepare(
      `INSERT INTO prescriptions (id, order_id, child_id, provider_id, medications_json, education_json, nutrition_json, behavioural_json, follow_up_json, issued_at, whatsapp_sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 0)`
    ).bind(
      prescriptionId,
      orderId,
      order.child_id,
      providerId,
      JSON.stringify(medications),
      JSON.stringify(education),
      JSON.stringify(nutrition),
      JSON.stringify(behavioural),
      JSON.stringify(followUp)
    ).run()

    // Complete the order
    await env.DB.prepare(
      "UPDATE service_orders SET status = 'completed', completed_at = datetime('now'), session_ended_at = datetime('now') WHERE id = ?"
    ).bind(orderId).run()

    // Send WhatsApp to parent (non-blocking)
    try {
      interface ParentPhoneRow { phone: string }
      interface ProviderNameRow { name: string }
      const [parent, provider] = await Promise.all([
        env.DB.prepare('SELECT phone FROM parents WHERE id = ?').bind(order.parent_id).first<ParentPhoneRow>(),
        env.DB.prepare('SELECT name FROM providers WHERE id = ?').bind(providerId).first<ProviderNameRow>(),
      ])

      if (parent?.phone) {
        const providerName = provider?.name || 'your doctor'
        let followUpSummary = 'as advised'
        try {
          const fu = typeof followUp === 'string' ? JSON.parse(followUp) : followUp
          followUpSummary = fu?.when || fu?.summary || 'as advised'
        } catch {}

        const message = `SKIDS Prescription from Dr. ${providerName}: Medications noted. Patient education provided. Follow-up: ${followUpSummary}. Full prescription in your SKIDS app. -Team SKIDS`

        const phone = parent.phone.replace(/^\+91/, '').replace(/\D/g, '')
        const url = new URL('https://api.bsms.in/api/instant.php')
        url.searchParams.set('user', env.BHASH_USER || '')
        url.searchParams.set('pass', env.BHASH_PASS || '')
        url.searchParams.set('sender', env.BHASH_SENDER || 'SKIDS')
        url.searchParams.set('phone', phone)
        url.searchParams.set('text', message)
        url.searchParams.set('priority', 'ndnd')
        url.searchParams.set('stype', 'normal')

        const waRes = await fetch(url.toString())
        if (waRes.ok) {
          await env.DB.prepare('UPDATE prescriptions SET whatsapp_sent = 1 WHERE id = ?')
            .bind(prescriptionId).run()
        }
      }
    } catch (waErr: unknown) {
      console.error('[prescription] WhatsApp send failed (non-fatal):', waErr)
    }

    return new Response(JSON.stringify({ success: true, prescriptionId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[prescription] Error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
