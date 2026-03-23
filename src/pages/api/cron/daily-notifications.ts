export const prerender = false

import type { APIRoute } from 'astro'
import { runGenerationRun } from '@/lib/notifications/service'
import { getEnv } from '@/lib/runtime/env'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)

  if (request.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let processed = 0
  let generated = 0

  try {
    const result = await env.DB.prepare('SELECT DISTINCT parent_id FROM children').all<{ parent_id: string }>()
    // Use generic type parameter so D1 types the rows correctly
    const rows = result.results ?? []

    for (const row of rows) {
      const parentId = row.parent_id
      try {
        const count = await runGenerationRun(env.DB, parentId)
        processed++
        generated += count
      } catch (e: unknown) {
        console.error(`[cron/daily-notifications] failed for parent ${parentId}:`, e)
      }
    }
  } catch (e: unknown) {
    console.error('[cron/daily-notifications] DB query failed:', e)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ processed, generated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
