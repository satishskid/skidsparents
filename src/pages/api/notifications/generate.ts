export const prerender = false

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { runGenerationRun } from '@/lib/notifications/service'
import { getEnv } from '@/lib/runtime/env'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const generated = await runGenerationRun(env.DB, parentId)
    return new Response(JSON.stringify({ generated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: unknown) {
    console.error('[notifications/generate] error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
