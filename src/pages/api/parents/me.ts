/**
 * GET  /api/parents/me  — Fetch authenticated parent profile
 * PATCH /api/parents/me — Update parent profile (e.g. mark onboarding complete)
 */

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    interface ParentRow { id: string; name: string; email: string; onboarding_completed: number }
    const row = await env.DB.prepare(
      'SELECT id, name, email, onboarding_completed FROM parents WHERE id = ?'
    ).bind(parentId).first<ParentRow>()

    if (!row) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }

    return new Response(
      JSON.stringify({
        id: row.id,
        name: row.name,
        email: row.email,
        onboarding_completed: Boolean(row.onboarding_completed),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e: unknown) {
    console.error('[Parents/me] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch parent' }), { status: 500 })
  }
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await request.json() as { onboarding_completed?: boolean }

    if (body.onboarding_completed === true) {
      await env.DB.prepare(
        'UPDATE parents SET onboarding_completed = 1 WHERE id = ?'
      ).bind(parentId).run()
    }

    return new Response(JSON.stringify({ updated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[Parents/me] PATCH error:', e)
    return new Response(JSON.stringify({ error: 'Failed to update parent' }), { status: 500 })
  }
}
