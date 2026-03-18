// Forum posts API — list and create
export const prerender = false

import type { APIContext } from 'astro'
import { getParentId } from '@/pages/api/children'
import { drizzle } from 'drizzle-orm/d1'
import { forumPosts, forumGroups, parents } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function GET({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const db = drizzle(env.DB)
  const url = new URL(request.url)
  const groupId = url.searchParams.get('groupId')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  try {
    const query = db
      .select()
      .from(forumPosts)
      .where(and(
        groupId ? eq(forumPosts.groupId, groupId) : undefined,
        eq(forumPosts.isHidden, false)
      ))
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit)
      .offset(offset)

    const posts = await query.all()

    // Mask author info for anonymous posts
    const sanitized = posts.map(p => ({
      ...p,
      authorName: p.isAnonymous ? 'Anonymous' : p.authorName,
      parentId: p.isAnonymous ? null : p.parentId,
    }))

    return new Response(JSON.stringify({ posts: sanitized }))
  } catch (error) {
    console.error('Forum posts GET error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), { status: 500 })
  }
}

export async function POST({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const { groupId, title, content, isAnonymous = false } = await request.json()

  if (!groupId || !title?.trim() || !content?.trim()) {
    return new Response(JSON.stringify({ error: 'groupId, title, and content are required' }), { status: 400 })
  }
  if (title.length > 200) {
    return new Response(JSON.stringify({ error: 'Title must be 200 characters or less' }), { status: 400 })
  }
  if (content.length > 5000) {
    return new Response(JSON.stringify({ error: 'Content must be 5000 characters or less' }), { status: 400 })
  }

  const db = drizzle(env.DB)

  // Verify group exists
  const group = await db.select().from(forumGroups).where(eq(forumGroups.id, groupId)).get()
  if (!group) {
    return new Response(JSON.stringify({ error: 'Forum group not found' }), { status: 404 })
  }

  // Get parent name
  const parent = await db.select().from(parents).where(eq(parents.id, parentId)).get()
  const authorName = isAnonymous ? 'Anonymous' : (parent?.name || 'Parent')

  try {
    const post = await db.insert(forumPosts).values({
      groupId,
      parentId,
      authorName,
      isAnonymous,
      title: title.trim(),
      content: content.trim(),
    }).returning().get()

    // Increment group post count
    await db
      .update(forumGroups)
      .set({ postCount: (group.postCount || 0) + 1 })
      .where(eq(forumGroups.id, groupId))

    // Track analytics
    return new Response(JSON.stringify({
      post: {
        ...post,
        authorName: isAnonymous ? 'Anonymous' : post.authorName,
        parentId: isAnonymous ? null : post.parentId,
      }
    }), { status: 201 })
  } catch (error) {
    console.error('Forum post create error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create post. Please try again.' }), { status: 500 })
  }
}
