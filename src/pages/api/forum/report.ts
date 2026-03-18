// POST /api/forum/report — report a post or comment
export const prerender = false

import type { APIRoute } from 'astro'
import { getParentId } from '@/pages/api/children'
import { drizzle } from 'drizzle-orm/d1'
import { forumReports } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { targetType, targetId, reason } = body
  if (!targetType || !targetId || !['post', 'comment'].includes(targetType)) {
    return new Response(JSON.stringify({ error: 'targetType (post|comment) and targetId are required' }), { status: 400 })
  }

  const db = drizzle(env.DB)

  // Prevent duplicate reports from same parent
  const existing = await db
    .select()
    .from(forumReports)
    .where(and(
      eq(forumReports.parentId, parentId),
      eq(forumReports.targetId, targetId),
      eq(forumReports.targetType, targetType)
    ))
    .get()

  if (existing) {
    return new Response(JSON.stringify({ ok: true, alreadyReported: true }), { status: 200 })
  }

  await db.insert(forumReports).values({
    parentId,
    targetType,
    targetId,
    reason: reason?.trim() || null,
    status: 'pending',
  })

  return new Response(JSON.stringify({ ok: true }), { status: 201 })
}
