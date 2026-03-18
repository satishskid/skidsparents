// Forum post comments API
export const prerender = false

import type { APIContext } from 'astro'
import { getParentId } from '@/pages/api/children'
import { drizzle } from 'drizzle-orm/d1'
import { forumComments, forumPosts, parents } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export async function GET({ request, locals, params }: APIContext) {
  const env = (locals as any).runtime?.env
  const db = drizzle(env.DB)
  const { postId } = params

  const comments = await db
    .select()
    .from(forumComments)
    .where(and(eq(forumComments.postId, postId!), eq(forumComments.isHidden, false)))
    .orderBy(asc(forumComments.createdAt))
    .all()

  const sanitized = comments.map(c => ({
    ...c,
    authorName: c.isAnonymous ? 'Anonymous' : c.authorName,
    parentId: c.isAnonymous ? null : c.parentId,
  }))

  return new Response(JSON.stringify({ comments: sanitized }))
}

export async function POST({ request, locals, params }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { postId } = params
  const { content, isAnonymous = false } = await request.json()

  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400 })
  }
  if (content.length > 2000) {
    return new Response(JSON.stringify({ error: 'Comment must be 2000 characters or less' }), { status: 400 })
  }

  const db = drizzle(env.DB)

  const post = await db.select().from(forumPosts).where(eq(forumPosts.id, postId!)).get()
  if (!post) return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 })

  const parent = await db.select().from(parents).where(eq(parents.id, parentId)).get()
  const authorName = isAnonymous ? 'Anonymous' : (parent?.name || 'Parent')

  const comment = await db.insert(forumComments).values({
    postId: postId!,
    parentId,
    authorName,
    isAnonymous,
    content: content.trim(),
  }).returning().get()

  // Increment comment count on post
  await db
    .update(forumPosts)
    .set({ commentCount: (post.commentCount || 0) + 1 })
    .where(eq(forumPosts.id, postId!))

  return new Response(JSON.stringify({
    comment: {
      ...comment,
      authorName: isAnonymous ? 'Anonymous' : comment.authorName,
      parentId: isAnonymous ? null : comment.parentId,
    }
  }), { status: 201 })
}
