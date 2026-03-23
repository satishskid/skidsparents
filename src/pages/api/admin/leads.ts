/**
 * GET /api/admin/leads — Fetch leads for CEO CRM dashboard
 * POST /api/admin/leads — Update lead status/notes
 *
 * Protected by ADMIN_KEY env var (simple bearer token).
 * brand=skids STRICT COMPLIANCE.
 */

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

function checkAuth(request: Request, env: Env): boolean {
  const adminKey = env.ADMIN_KEY
  if (!adminKey) return true // No key set = open (dev mode)
  const auth = request.headers.get('Authorization')
  if (!auth) return false
  return auth === `Bearer ${adminKey}` || auth === adminKey
}

export const GET: APIRoute = async ({ request, locals, url }) => {
  const env = getEnv(locals)

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available', leads: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Query params
    const status = url.searchParams.get('status')
    const source = url.searchParams.get('source')
    const search = url.searchParams.get('search')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = 'SELECT * FROM leads WHERE brand = ?'
    const params: any[] = ['skids']

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    if (source) {
      query += ' AND source = ?'
      params.push(source)
    }
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)'
      const s = `%${search}%`
      params.push(s, s, s)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const { results } = await db.prepare(query).bind(...params).all()

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM leads WHERE brand = ?'
    const countParams: any[] = ['skids']
    if (status) {
      countQuery += ' AND status = ?'
      countParams.push(status)
    }
    if (source) {
      countQuery += ' AND source = ?'
      countParams.push(source)
    }
    if (search) {
      countQuery += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)'
      const s = `%${search}%`
      countParams.push(s, s, s)
    }
    interface CountRow { total: number }
    const countResult = await db.prepare(countQuery).bind(...countParams).first<CountRow>()

    return new Response(
      JSON.stringify({
        leads: results || [],
        total: countResult?.total || 0,
        limit,
        offset,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    // Table might not exist yet
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(
        JSON.stringify({ leads: [], total: 0, limit: 100, offset: 0, _note: 'leads table not created yet' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.error('[Admin] Leads fetch error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch leads' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  if (!checkAuth(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const db = env.DB
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not available' }), { status: 500 })
  }

  try {
    const body = await request.json() as {
      id: string
      status?: string
      notes?: string
      assigned_to?: string
    }

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Lead ID required' }), { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []

    if (body.status) {
      updates.push('status = ?')
      params.push(body.status)
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?')
      params.push(body.notes)
    }
    if (body.assigned_to !== undefined) {
      updates.push('assigned_to = ?')
      params.push(body.assigned_to)
    }

    updates.push('updated_at = ?')
    params.push(new Date().toISOString())
    params.push(body.id)

    await db.prepare(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Admin] Lead update error:', e)
    return new Response(JSON.stringify({ error: 'Failed to update lead' }), { status: 500 })
  }
}
