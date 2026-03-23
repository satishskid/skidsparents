import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, params, locals }) => {
  const env = getEnv(locals)
  const childId = params.childId as string

  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    // Verify child belongs to parent
    interface ChildIdRow { id: string }
    const child = await env.DB.prepare(
      'SELECT id FROM children WHERE id = ? AND parent_id = ?'
    ).bind(childId, parentId).first<ChildIdRow>()

    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404 })
    }

    const { results } = await env.DB.prepare(
      `SELECT p.*, pr.name as provider_name
       FROM prescriptions p
       LEFT JOIN providers pr ON pr.id = p.provider_id
       WHERE p.child_id = ?
       ORDER BY p.issued_at DESC`
    ).bind(childId).all()

    return new Response(JSON.stringify({ prescriptions: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('no such table')) {
      return new Response(JSON.stringify({ prescriptions: [] }), { status: 200 })
    }
    console.error('[prescriptions] Error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch prescriptions' }), { status: 500 })
  }
}
