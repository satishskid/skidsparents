/**
 * POST /api/admin/community/posts/:id/reject
 */
export const prerender = false

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'

function isAdmin(request: Request, adminKey: string | undefined): boolean {
  if (!adminKey) return true
  return request.headers.get('Authorization') === `Bearer ${adminKey}`
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = getEnv(locals)
  if (!isAdmin(request, env.ADMIN_KEY)) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const postId = params.id
  const post = await env.DB.prepare('SELECT * FROM forum_posts WHERE id = ?').bind(postId).first<any>()
  if (!post) return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 })

  await env.DB.prepare(`UPDATE forum_posts SET status = 'rejected', updated_at = datetime('now') WHERE id = ?`).bind(postId).run()

  // Decrement post_count if it was approved (floor 0)
  if (post.status === 'approved') {
    await env.DB.prepare(
      'UPDATE forum_groups SET post_count = MAX(0, post_count - 1) WHERE id = ?'
    ).bind(post.group_id).run()
  }

  return new Response(JSON.stringify({ ok: true, post: { ...post, status: 'rejected' } }), { headers: { 'Content-Type': 'application/json' } })
}
