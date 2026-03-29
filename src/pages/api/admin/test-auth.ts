/**
 * POST /api/admin/test-auth
 * Debug endpoint to test ADMIN_KEY authentication
 */
export const prerender = false

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const auth = request.headers.get('Authorization') ?? ''
  const adminKey = env.ADMIN_KEY
  
  return new Response(JSON.stringify({
    hasAdminKey: !!adminKey,
    adminKeyLength: adminKey?.length ?? 0,
    authHeader: auth,
    authHeaderLength: auth.length,
    matches: auth === `Bearer ${adminKey}`,
    expected: `Bearer ${adminKey}`,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
