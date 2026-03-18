// Blog bookmark API — add, list, remove bookmarks
// POST   /api/blog/bookmark        { blogSlug }  → add (idempotent)
// GET    /api/blog/bookmark        ?limit=N      → list bookmarks
// DELETE /api/blog/bookmark        { blogSlug }  → remove
export const prerender = false

import type { APIContext } from 'astro'
import { getParentId } from '@/pages/api/children'
import { drizzle } from 'drizzle-orm/d1'
import { blogBookmarks } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function POST({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { blogSlug } = body
  if (!blogSlug?.trim()) {
    return new Response(JSON.stringify({ error: 'blogSlug is required' }), { status: 400 })
  }

  const db = drizzle(env.DB)

  // Idempotent — return existing if already bookmarked
  const existing = await db
    .select()
    .from(blogBookmarks)
    .where(and(eq(blogBookmarks.parentId, parentId), eq(blogBookmarks.blogSlug, blogSlug.trim())))
    .get()

  if (existing) {
    return new Response(JSON.stringify({ bookmark: existing, created: false }), { status: 200 })
  }

  try {
    const bookmark = await db
      .insert(blogBookmarks)
      .values({ parentId, blogSlug: blogSlug.trim() })
      .returning()
      .get()

    return new Response(JSON.stringify({ bookmark, created: true }), { status: 201 })
  } catch (error) {
    console.error('Bookmark create error:', error)
    return new Response(JSON.stringify({ error: 'Failed to save bookmark' }), { status: 500 })
  }
}

export async function GET({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

  const db = drizzle(env.DB)

  try {
    const bookmarks = await db
      .select()
      .from(blogBookmarks)
      .where(eq(blogBookmarks.parentId, parentId))
      .orderBy(desc(blogBookmarks.createdAt))
      .limit(limit)
      .all()

    return new Response(JSON.stringify({ bookmarks }))
  } catch (error) {
    console.error('Bookmark list error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch bookmarks' }), { status: 500 })
  }
}

export async function DELETE({ request, locals }: APIContext) {
  const env = (locals as any).runtime?.env
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { blogSlug } = body
  if (!blogSlug?.trim()) {
    return new Response(JSON.stringify({ error: 'blogSlug is required' }), { status: 400 })
  }

  const db = drizzle(env.DB)

  try {
    await db
      .delete(blogBookmarks)
      .where(and(eq(blogBookmarks.parentId, parentId), eq(blogBookmarks.blogSlug, blogSlug.trim())))

    return new Response(JSON.stringify({ success: true }))
  } catch (error) {
    console.error('Bookmark delete error:', error)
    return new Response(JSON.stringify({ error: 'Failed to remove bookmark' }), { status: 500 })
  }
}
