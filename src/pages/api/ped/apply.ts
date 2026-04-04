/**
 * POST /api/ped/apply — Pediatrician self-registration
 * Public endpoint.
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json()
    const { name, phone, email, clinic_name, clinic_address, city, specialty, license_number, experience_years, motivation } = body

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'Name and phone are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const env = getEnv(locals)
    const db = env.DB
    if (!db) return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

    const existing = await db.prepare('SELECT id, status FROM ped_applications WHERE phone LIKE ?')
      .bind(`%${phone.replace(/\D/g, '').slice(-10)}`).first()

    if (existing) {
      return new Response(JSON.stringify({ error: 'An application with this phone already exists', status: (existing as any).status }), { status: 409, headers: { 'Content-Type': 'application/json' } })
    }

    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    await db.prepare(`
      INSERT INTO ped_applications (id, name, email, phone, clinic_name, clinic_address, city, specialty, license_number, experience_years, motivation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, name, email || null, phone, clinic_name || null, clinic_address || null, city || 'Bangalore', specialty || 'pediatrician', license_number || null, experience_years || null, motivation || null).run()

    return new Response(JSON.stringify({ success: true, application_id: id, message: 'Application received. We will review and contact you shortly.' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    console.error('[Ped] Apply error:', err)
    return new Response(JSON.stringify({ error: 'Failed to submit application' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
