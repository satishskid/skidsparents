/**
 * GET/POST /api/admin/pilot/groups — Manage pilot groups
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

  const groups = await db.prepare('SELECT * FROM pilot_groups ORDER BY created_at DESC').all()
  return new Response(JSON.stringify({ groups: groups.results }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!checkAuth(request, env)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  const db = env.DB
  if (!db) return new Response(JSON.stringify({ error: 'DB unavailable' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  const { name, description, max_capacity, default_doctor_id } = await request.json()
  if (!name) return new Response(JSON.stringify({ error: 'Group name required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  await db.prepare('INSERT INTO pilot_groups (id, name, description, max_capacity, default_doctor_id) VALUES (?, ?, ?, ?, ?)')
    .bind(id, name, description || null, max_capacity || 50, default_doctor_id || null).run()

  return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
