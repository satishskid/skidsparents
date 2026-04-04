/**
 * GET/POST /api/admin/pilot/invitations — Manage pilot invitations
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

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < 8; i++) code += chars[bytes[i] % chars.length]
  return code
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const group = url.searchParams.get('group')
  const limit = parseInt(url.searchParams.get('limit') || '100')

  let sql = 'SELECT pi.*, d.name as doctor_name, d.clinic_name FROM pilot_invitations pi LEFT JOIN doctors d ON pi.assigned_doctor_id = d.id WHERE 1=1'
  const params: any[] = []
  if (status) { sql += ' AND pi.status = ?'; params.push(status) }
  if (group) { sql += ' AND pi.pilot_group = ?'; params.push(group) }
  sql += ' ORDER BY pi.created_at DESC LIMIT ?'
  params.push(limit)

  const results = await db.prepare(sql).bind(...params).all()
  return new Response(JSON.stringify({ invitations: results.results }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  const body = await request.json()
  const invites = Array.isArray(body) ? body : [body]
  const created: any[] = []

  for (const inv of invites) {
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    const code = generateInviteCode()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await db.prepare(`
      INSERT INTO pilot_invitations (id, invite_code, parent_phone, parent_email, parent_name, child_qr_code, assigned_doctor_id, assigned_manager_id, pilot_group, source, notes, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, code, inv.parent_phone || null, inv.parent_email || null, inv.parent_name || null,
      inv.child_qr_code || null, inv.assigned_doctor_id || null, inv.assigned_manager_id || null,
      inv.pilot_group || 'wave_1', inv.source || 'screening', inv.notes || null, expiresAt).run()

    created.push({ id, invite_code: code, parent_name: inv.parent_name, parent_phone: inv.parent_phone })
  }

  return new Response(JSON.stringify({ success: true, created, count: created.length }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
