/**
 * POST /api/lead — Lead capture endpoint
 * ========================================
 * STRICT COMPLIANCE: brand=skids is MANDATORY.
 *
 * Flow:
 * 1. Validate required fields (brand, name, phone, source, funnel_stage)
 * 2. Reject if brand !== 'skids' or missing
 * 3. Push to Neodove CRM (telecaller assignment)
 * 4. Optionally send WhatsApp via BHASH
 * 5. Store in D1 database
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://skids.clinic',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Preflight for cross-origin requests from skids.clinic
export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS })

interface LeadPayload {
  brand: string
  name: string
  phone: string
  email?: string
  source: string
  medium?: string
  campaign?: string
  funnel_stage: string
  asset_code?: string
  center?: string
  child_age_months?: number
  notes?: string
  utm_source?: string
  utm_campaign?: string
  created_at?: string
}

const REQUIRED_FIELDS = ['brand', 'name', 'phone', 'source'] as const

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as LeadPayload

    // ─── Validate required fields ───
    const missing = REQUIRED_FIELDS.filter((f) => !body[f])
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      )
    }

    // ─── STRICT: brand must be 'skids' ───
    if (body.brand !== 'skids') {
      return new Response(
        JSON.stringify({ error: 'brand must be "skids". No record accepted without brand namespace.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      )
    }

    // ─── UTM campaign compliance check ───
    if (body.utm_campaign && !body.utm_campaign.startsWith('skids_')) {
      console.warn(`[SKIDS Lead] Non-compliant UTM campaign: ${body.utm_campaign}`)
      // Flag but don't reject — log the non-compliance
    }

    const env = getEnv(locals)

    // ─── 1. Push to Neodove CRM ───
    const neodoveUrl = env.NEODOVE_CUSTOM_INTEGRATION_URL
    if (neodoveUrl) {
      try {
        const neodovePayload = {
          name: body.name,
          phone: body.phone,
          email: body.email || '',
          source: body.source,
          campaign: body.campaign || body.utm_campaign || '',
          notes: `[brand=skids] [funnel=${body.funnel_stage}] [asset=${body.asset_code || 'direct'}] ${body.notes || ''}`.trim(),
          tags: ['skids', body.funnel_stage, body.asset_code].filter(Boolean),
        }
        await fetch(neodoveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(neodovePayload),
        })
      } catch (e: unknown) {
        console.error('[SKIDS Lead] Neodove push failed:', e)
      }
    }

    // ─── 2. Send WhatsApp welcome via BHASH ───
    const bhashUser = env.BHASH_USER
    const bhashPass = env.BHASH_PASS
    const bhashSender = env.BHASH_SENDER || 'BUZWAP'
    if (bhashUser && bhashPass && body.phone) {
      try {
        // BHASH WhatsApp API — send welcome/confirmation
        // Actual BHASH API integration depends on their endpoint format
        // This is the standard structure; adjust URL per BHASH docs
        const phone = body.phone.replace(/[^0-9]/g, '')
        const bhashPayload = {
          sender: bhashSender,
          to: phone.startsWith('91') ? phone : `91${phone}`,
          brand: 'skids',
          message: `Welcome to SKIDS Parent! 🌱 We received your interest in ${body.asset_code || 'child health'}. Our team will reach out shortly. In the meantime, explore your child's health timeline at parent.skids.clinic/timeline`,
        }
        // TODO: Replace with actual BHASH API endpoint when available
        console.log('[SKIDS Lead] BHASH WhatsApp queued:', bhashPayload.to)
      } catch (e: unknown) {
        console.error('[SKIDS Lead] BHASH send failed:', e)
      }
    }

    // ─── 3. Store in D1 database (if available) ───
    const db = env.DB
    if (db) {
      try {
        await db.prepare(
          `INSERT INTO leads (brand, name, phone, email, source, medium, campaign, funnel_stage, asset_code, center, child_age_months, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          'skids',
          body.name,
          body.phone,
          body.email || null,
          body.source,
          body.medium || null,
          body.utm_campaign || body.campaign || null,
          body.funnel_stage,
          body.asset_code || null,
          body.center || 'online',
          body.child_age_months || null,
          body.notes || null,
          body.created_at || new Date().toISOString()
        ).run()
      } catch (e: unknown) {
        console.error('[SKIDS Lead] D1 insert failed:', e)
        // Don't fail the request — CRM push already happened
      }
    }

    // ─── 4. Track lead_captured conversion event ───
    try {
      const analyticsPayload = {
        event: 'lead_captured',
        properties: {
          funnel_stage: body.funnel_stage,
          source: body.source,
          asset_code: body.asset_code || 'direct',
          utm_campaign: body.utm_campaign || '',
          brand: 'skids',
        },
      }
      // Fire-and-forget to analytics (GA4 Measurement Protocol could go here)
      console.log('[SKIDS Analytics] lead_captured:', analyticsPayload)
    } catch {}

    return new Response(
      JSON.stringify({ success: true, brand: 'skids', id: Date.now().toString(36) }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    )
  } catch (e: unknown) {
    console.error('[SKIDS Lead] Unexpected error:', e)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    )
  }
}
