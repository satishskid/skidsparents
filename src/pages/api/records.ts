/**
 * GET  /api/records — Unified health timeline for a child
 * POST /api/records — Manual record entry
 */

import type { APIRoute } from 'astro'
import { getParentId, verifyChildOwnership } from '@/pages/api/children'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const childId = url.searchParams.get('childId')
  const type = url.searchParams.get('type')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  if (!childId) {
    return new Response(JSON.stringify({ error: 'childId is required' }), { status: 400 })
  }

  const owns = await verifyChildOwnership(parentId, childId, env.DB)
  if (!owns) {
    return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
  }

  try {
    let sql = 'SELECT * FROM health_records WHERE child_id = ?'
    const binds: any[] = [childId]

    if (type && type !== 'all') {
      sql += ' AND record_type = ?'
      binds.push(type)
    }

    sql += ' ORDER BY record_date DESC, created_at DESC LIMIT ? OFFSET ?'
    binds.push(limit, offset)

    const { results } = await env.DB.prepare(sql).bind(...binds).all()

    return new Response(
      JSON.stringify({ records: results || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    if (err.message?.includes('no such table')) {
      return new Response(JSON.stringify({ records: [] }), { status: 200 })
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch records' }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env || {}
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await request.json() as {
      childId: string
      recordType: string
      title: string
      recordDate: string
      providerName?: string
      summary?: string
      dataJson?: any
      concernLevel?: string
    }

    if (!body.childId || !body.recordType || !body.title || !body.recordDate) {
      return new Response(JSON.stringify({ error: 'childId, recordType, title, and recordDate are required' }), { status: 400 })
    }

    const owns = await verifyChildOwnership(parentId, body.childId, env.DB)
    if (!owns) {
      return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
    }

    const id = crypto.randomUUID()
    await env.DB.prepare(
      `INSERT INTO health_records (id, child_id, record_type, title, record_date, provider_name, summary, data_json, source, concern_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'parent_manual', ?)`
    ).bind(
      id,
      body.childId,
      body.recordType,
      body.title,
      body.recordDate,
      body.providerName || null,
      body.summary || null,
      body.dataJson ? JSON.stringify(body.dataJson) : null,
      body.concernLevel || 'none'
    ).run()

    return new Response(
      JSON.stringify({ id, message: 'Record added' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('[Records] Create error:', err)
    return new Response(JSON.stringify({ error: 'Failed to create record' }), { status: 500 })
  }
}
