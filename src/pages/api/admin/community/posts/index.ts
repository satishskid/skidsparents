/**
 * GET  /api/admin/community/posts — list pending posts
 * POST /api/admin/community/posts — create admin post (auto-approved)
 */
export const prerender = false

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

function isAdmin(request: Request, adminKey: string | undefined): boolean {
  if (!adminKey) return true
  const auth = request.headers.get('Authorization') ?? ''
  return auth === `Bearer ${adminKey}`
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!isAdmin(request, env.ADMIN_KEY)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { results } = await env.DB.prepare(
    `SELECT fp.*, fg.name as group_name FROM forum_posts fp
     LEFT JOIN forum_groups fg ON fp.group_id = fg.id
     WHERE fp.status = 'pending' ORDER BY fp.created_at ASC`
  ).all()

  return new Response(JSON.stringify({ posts: results ?? [] }), { headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!isAdmin(request, env.ADMIN_KEY)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let body: { groupId: string; title: string; content: string }
  try { body = await request.json() as any } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }) }

  const { groupId, title, content } = body
  if (!groupId || !title?.trim() || !content?.trim()) return new Response(JSON.stringify({ error: 'groupId, title, and content are required' }), { status: 400 })

  const group = await env.DB.prepare('SELECT id FROM forum_groups WHERE id = ?').bind(groupId).first()
  if (!group) return new Response(JSON.stringify({ error: 'Group not found' }), { status: 404 })

  const id = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO forum_posts (id, group_id, parent_id, author_name, title, content, status, pinned, created_at, updated_at)
     VALUES (?, ?, NULL, 'SKIDS Team', ?, ?, 'approved', 0, datetime('now'), datetime('now'))`
  ).bind(id, groupId, title.trim(), content.trim()).run()

  await env.DB.prepare('UPDATE forum_groups SET post_count = post_count + 1 WHERE id = ?').bind(groupId).run()

  return new Response(JSON.stringify({ post: { id, groupId, title: title.trim(), content: content.trim(), status: 'approved' } }), { status: 201 })
}
