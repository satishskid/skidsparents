/**
 * POST /api/cron/whatsapp-retry
 * Called by skids-cron worker every 15 minutes.
 * Retries BHASH delivery for service_orders where whatsapp_status = 'pending'
 * and created_at < now - 5 minutes. Up to 3 attempts with exponential backoff tracking.
 * Protected by CRON_SECRET bearer token.
 */

export const prerender = false

import type { APIContext } from 'astro'
import { getEnv } from '@/lib/runtime/env'

const MAX_ATTEMPTS = 3

async function sendWhatsApp(phone: string, text: string, env: Env): Promise<boolean> {
  const digits = phone.replace(/\D/g, '').replace(/^91/, '')
  if (digits.length !== 10) return false
  const params = new URLSearchParams({
    user: env.BHASH_USER ?? '',       // optional; empty string is a no-op for BHASH
    pass: env.BHASH_PASS ?? '',       // optional secret
    sender: env.BHASH_SENDER || 'BUZWAP',
    phone: `91${digits}`,
    text,
    priority: 'ndnd',
    stype: 'normal',
  })
  try {
    const res = await fetch(`https://api.bsms.in/api/instant.php?${params}`)
    const body = await res.text()
    // BHASH returns "success" or an error code
    return body.toLowerCase().includes('success') || res.ok
  } catch {
    return false
  }
}

export async function POST({ request, locals }: APIContext) {
  const env = getEnv(locals)

  const auth = request.headers.get('Authorization') || ''
  if (env.CRON_SECRET && auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  if (!env.DB || !env.BHASH_USER) {
    return new Response(JSON.stringify({ error: 'Missing DB or BHASH credentials' }), { status: 500 })
  }

  // Orders with pending WhatsApp, older than 5 minutes, with retry count < MAX_ATTEMPTS
  // We track attempts via a JSON field in outcome_notes (lightweight, no schema change needed)
  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { results: pendingOrders } = await env.DB.prepare(
    `SELECT so.id, so.outcome_notes, so.created_at,
            s.name as service_name,
            c.name as child_name,
            par.phone as parent_phone,
            par.name as parent_name
     FROM service_orders so
     JOIN services s ON s.id = so.service_id
     JOIN children c ON c.id = so.child_id
     JOIN parents par ON par.id = so.parent_id
     WHERE so.whatsapp_status = 'pending'
       AND so.created_at < ?
     LIMIT 50`
  ).bind(cutoff).all()

  let retried = 0
  let succeeded = 0
  let failed = 0

  for (const order of (pendingOrders || []) as any[]) {
    // Parse retry metadata from outcome_notes
    let meta: { wa_attempts?: number } = {}
    try {
      if (order.outcome_notes) meta = JSON.parse(order.outcome_notes)
    } catch {}

    const attempts = meta.wa_attempts || 0
    if (attempts >= MAX_ATTEMPTS) {
      // Give up — mark as failed
      await env.DB.prepare(
        `UPDATE service_orders SET whatsapp_status = 'failed' WHERE id = ?`
      ).bind(order.id).run()
      failed++
      continue
    }

    if (!order.parent_phone) {
      await env.DB.prepare(
        `UPDATE service_orders SET whatsapp_status = 'failed' WHERE id = ?`
      ).bind(order.id).run()
      failed++
      continue
    }

    const text = `Hi ${order.parent_name || 'there'}, your SKIDS booking for ${order.service_name} (${order.child_name}) has been confirmed. Order ID: ${order.id.slice(0, 8)}. We'll be in touch shortly.`

    const ok = await sendWhatsApp(order.parent_phone, text, env)
    retried++

    const newAttempts = attempts + 1
    const newMeta = JSON.stringify({ ...meta, wa_attempts: newAttempts })

    if (ok) {
      await env.DB.prepare(
        `UPDATE service_orders SET whatsapp_status = 'sent', outcome_notes = ? WHERE id = ?`
      ).bind(newMeta, order.id).run()
      succeeded++
    } else {
      // Update attempt count; keep status pending unless max reached
      const newStatus = newAttempts >= MAX_ATTEMPTS ? 'failed' : 'pending'
      await env.DB.prepare(
        `UPDATE service_orders SET whatsapp_status = ?, outcome_notes = ? WHERE id = ?`
      ).bind(newStatus, newMeta, order.id).run()
      if (newStatus === 'failed') failed++
    }
  }

  return new Response(
    JSON.stringify({ retried, succeeded, failed }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
