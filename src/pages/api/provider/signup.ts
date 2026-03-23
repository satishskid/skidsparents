/**
 * POST /api/provider/signup — Public provider onboarding (no auth required)
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

async function notifyAdmin(env: Env, name: string, city: string, medicalRegNumber: string) {
  try {
    if (!env.ADMIN_PHONE || !env.BHASH_USER || !env.BHASH_PASS) return
    const msg = `SKIDS: New provider signup — ${name}, ${city}. Reg: ${medicalRegNumber}. Review at parent.skids.clinic/admin/providers`
    const url = new URL('https://api.bsms.in/api/instant.php')
    url.searchParams.set('username', env.BHASH_USER)
    url.searchParams.set('password', env.BHASH_PASS)
    url.searchParams.set('sender', env.BHASH_SENDER || 'SKIDS')
    url.searchParams.set('to', env.ADMIN_PHONE)
    url.searchParams.set('message', msg)
    url.searchParams.set('type', 'text')
    await fetch(url.toString())
  } catch {
    // Non-blocking — never throw
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { name, medicalRegNumber, specializations, city, contactEmail, contactPhone, feeStructureJson } = body

  if (!name || !medicalRegNumber || !contactEmail || !contactPhone) {
    return new Response(
      JSON.stringify({ error: 'name, medicalRegNumber, contactEmail, and contactPhone are required' }),
      { status: 400 }
    )
  }

  try {
    const providerId = crypto.randomUUID()
    const specializationsStr = Array.isArray(specializations) ? JSON.stringify(specializations) : null
    const feeStr = feeStructureJson && typeof feeStructureJson === 'object' ? JSON.stringify(feeStructureJson) : null

    await env.DB.prepare(
      `INSERT INTO providers (id, name, type, specializations_json, city, contact_email, contact_phone, fee_structure_json, medical_reg_number, is_verified, status, commission_pct, created_at)
       VALUES (?, ?, 'individual', ?, ?, ?, ?, ?, ?, 0, 'pending_review', 15, datetime('now'))`
    ).bind(
      providerId,
      name,
      specializationsStr,
      city || null,
      contactEmail,
      contactPhone,
      feeStr,
      medicalRegNumber
    ).run()

    // Notify admin via WhatsApp (non-blocking)
    notifyAdmin(env, name, city || '', medicalRegNumber)

    return new Response(
      JSON.stringify({
        success: true,
        providerId,
        message: 'Application submitted. Our team will review and contact you within 24 hours.',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[provider/signup] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to submit application' }), { status: 500 })
  }
}
