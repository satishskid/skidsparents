/**
 * GET/PATCH /api/admin/pilot/ped-applications — Manage ped applications
 */
import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function checkAuth(request: Request, env: Env): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  let sql = 'SELECT * FROM ped_applications'
  const params: any[] = []
  if (status) { sql += ' WHERE status = ?'; params.push(status) }
  sql += ' ORDER BY created_at DESC'

  const results = params.length ? await db.prepare(sql).bind(...params).all() : await db.prepare(sql).all()
  return new Response(JSON.stringify({ applications: results.results }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  const { application_id, action } = await request.json()
  if (!application_id || !action) return new Response(JSON.stringify({ error: 'application_id and action required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  if (action === 'approve') {
    const app = await db.prepare('SELECT * FROM ped_applications WHERE id = ?').bind(application_id).first() as any
    if (!app) return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

    const doctorId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    const tempUid = `ped_${app.phone.replace(/\D/g, '').slice(-10)}`
    try {
      await db.prepare('INSERT INTO doctors (id, firebase_uid, name, email, phone, specialty, clinic_name, city, license_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(doctorId, tempUid, app.name, app.email, app.phone, app.specialty || 'pediatrician', app.clinic_name, app.city, app.license_number).run()
    } catch { /* doctor may already exist */ }

    await db.prepare('UPDATE ped_applications SET status = ?, approved_doctor_id = ? WHERE id = ?').bind('approved', doctorId, application_id).run()
    return new Response(JSON.stringify({ success: true, doctor_id: doctorId }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  if (action === 'reject') {
    await db.prepare('UPDATE ped_applications SET status = ? WHERE id = ?').bind('rejected', application_id).run()
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
}
