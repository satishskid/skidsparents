// Like/unlike a forum post
export const prerender = false

import type { APIContext } from 'astro'
import { getParentId } from '@/pages/api/children'
import { drizzle } from 'drizzle-orm/d1'
import { forumPosts, forumLikes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getEnv } from '@/lib/runtime/env'

export async function POST({ request, locals, params }: APIContext) {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { postId } = params
  const db = drizzle(env.DB)

  const post = await db.select().from(forumPosts).where(eq(forumPosts.id, postId!)).get()
  if (!post) return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 })

  // Only allow reactions on approved posts
  if (post.status !== 'approved') {
    return new Response(JSON.stringify({ error: 'Reactions are only allowed on approved posts' }), { status: 403 })
  }

  // Check for duplicate like
  const existing = await db
    .select()
    .from(forumLikes)
    .where(and(
      eq(forumLikes.parentId, parentId),
      eq(forumLikes.targetType, 'post'),
      eq(forumLikes.targetId, postId!)
    ))
    .get()

  if (existing) {
    return new Response(JSON.stringify({ error: 'Already liked', likes: post.likes }), { status: 409 })
  }

  await db.insert(forumLikes).values({ parentId, targetType: 'post', targetId: postId! })
  await db.update(forumPosts).set({ likes: (post.likes || 0) + 1 }).where(eq(forumPosts.id, postId!))

  return new Response(JSON.stringify({ success: true, likes: (post.likes || 0) + 1 }))
}
