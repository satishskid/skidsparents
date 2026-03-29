// Forum posts API — list and create with moderation support
export const prerender = false

import type { APIContext } from 'astro'
import { getParentId } from '@/pages/api/children'
import { getEnv } from '@/lib/runtime/env'

export async function GET({ request, locals }: APIContext) {
  const env = getEnv(locals)
  const db = env.DB
  const url = new URL(request.url)
  const groupId = url.searchParams.get('groupId')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
  const offset = parseInt(url.searchParams.get('offset') || '0')

  const parentId = await getParentId(request, env).catch(() => null)

  const ORDER = `ORDER BY pinned DESC,
    CASE WHEN pinned = 1 THEN created_at END ASC,
    CASE WHEN pinned = 0 THEN created_at END DESC
    LIMIT ? OFFSET ?`

  try {
    let rows: any[]

    if (parentId) {
      const q = groupId
        ? `SELECT * FROM forum_posts WHERE group_id = ? AND is_hidden = 0 AND (status = 'approved' OR parent_id = ?) ${ORDER}`
        : `SELECT * FROM forum_posts WHERE is_hidden = 0 AND (status = 'approved' OR parent_id = ?) ${ORDER}`
      const result = groupId
        ? await db.prepare(q).bind(groupId, parentId, limit, offset).all()
        : await db.prepare(q).bind(parentId, limit, offset).all()
      rows = result.results ?? []
    } else {
      const q = groupId
        ? `SELECT * FROM forum_posts WHERE group_id = ? AND is_hidden = 0 AND status = 'approved' ${ORDER}`
        : `SELECT * FROM forum_posts WHERE is_hidden = 0 AND status = 'approved' ${ORDER}`
      const result = groupId
        ? await db.prepare(q).bind(groupId, limit, offset).all()
        : await db.prepare(q).bind(limit, offset).all()
      rows = result.results ?? []
    }

    const posts = rows.map((p: any) => ({
      ...p,
      pinned: Boolean(p.pinned),
      isAnonymous: Boolean(p.is_anonymous),
      isHidden: Boolean(p.is_hidden),
      authorName: p.is_anonymous ? 'Anonymous' : p.author_name,
      parentId: p.is_anonymous ? null : p.parent_id,
      ...(parentId && p.parent_id === parentId && p.status === 'pending' ? { isPending: true } : {}),
      ...(parentId && p.parent_id === parentId && p.status === 'rejected' ? { isRejected: true } : {}),
    }))

    return new Response(JSON.stringify({ posts }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Forum posts GET error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), { status: 500 })
  }
}

export async function POST({ request, locals }: APIContext) {
  const env = getEnv(locals)
  const parentId = await getParentId(request, env)
  if (!parentId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let body: { groupId: string; title: string; content: string; isAnonymous?: boolean }
  try {
    body = await request.json() as any
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { groupId, title, content, isAnonymous = false } = body
  if (!groupId || !title?.trim() || !content?.trim()) {
    return new Response(JSON.stringify({ error: 'groupId, title, and content are required' }), { status: 400 })
  }
  if (title.length > 200) return new Response(JSON.stringify({ error: 'Title must be 200 characters or less' }), { status: 400 })
  if (content.length > 5000) return new Response(JSON.stringify({ error: 'Content must be 5000 characters or less' }), { status: 400 })

  const db = env.DB
  const group = await db.prepare('SELECT id FROM forum_groups WHERE id = ?').bind(groupId).first()
  if (!group) return new Response(JSON.stringify({ error: 'Forum group not found' }), { status: 404 })

  const parent = await db.prepare('SELECT name FROM parents WHERE id = ?').bind(parentId).first<{ name: string }>()
  const authorName = isAnonymous ? 'Anonymous' : (parent?.name || 'Parent')

  try {
    const id = crypto.randomUUID()
    await db.prepare(
      `INSERT INTO forum_posts (id, group_id, parent_id, author_name, is_anonymous, title, content, status, pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, datetime('now'), datetime('now'))`
    ).bind(id, groupId, parentId, authorName, isAnonymous ? 1 : 0, title.trim(), content.trim()).run()

    return new Response(JSON.stringify({
      post: {
        id, groupId,
        parentId: isAnonymous ? null : parentId,
        authorName: isAnonymous ? 'Anonymous' : authorName,
        title: title.trim(), content: content.trim(),
        status: 'pending', pinned: false, isPending: true,
        likes: 0, commentCount: 0,
      }
    }), { status: 201 })
  } catch (error) {
    console.error('Forum post create error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create post. Please try again.' }), { status: 500 })
  }
}
