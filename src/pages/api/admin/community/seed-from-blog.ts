/**
 * POST /api/admin/community/seed-from-blog
 * Seeds community groups with pinned posts from blog articles.
 * Idempotent — skips articles already seeded (by blog_slug).
 */
export const prerender = false

import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/runtime/env'
import { mapBlogToGroup } from '@/lib/community/mapBlogToGroup'

const BLOG_API = 'https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs'

interface BlogArticle {
  blogId: string
  title: string
  content?: string
  summary?: string
  category: string
  tags?: string[]
  thumbnail?: string
  author?: string
  createdAt?: string
}

function isAdminAuthorized(request: Request, adminKey: string | undefined): boolean {
  if (!adminKey) return true // dev mode
  const auth = request.headers.get('Authorization') ?? ''
  return auth === `Bearer ${adminKey}`
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  if (!isAdminAuthorized(request, env.ADMIN_KEY)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Fetch blog articles
  let articles: BlogArticle[]
  try {
    const res = await fetch(BLOG_API)
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Blog API unavailable: ${res.status}` }), { status: 502 })
    }
    const data = await res.json() as BlogArticle[] | { blogs?: BlogArticle[]; items?: BlogArticle[] }
    articles = Array.isArray(data) ? data : (data.blogs ?? data.items ?? [])
  } catch (err) {
    console.error('Blog API fetch error:', err)
    return new Response(JSON.stringify({ error: 'Blog API returned invalid response' }), { status: 502 })
  }

  const db = env.DB
  let seeded = 0
  let skipped = 0

  try {
    for (const article of articles) {
      if (!article.blogId || !article.title) { skipped++; continue }

      // Check if already seeded
      const existing = await db
        .prepare('SELECT id FROM forum_posts WHERE blog_slug = ?')
        .bind(article.blogId)
        .first()

      if (existing) { skipped++; continue }

      const groupId = mapBlogToGroup(article.category || '', article.tags || [])
      const content = article.summary || (article.content ? article.content.slice(0, 500) : article.title)

      // Use a system parent_id (create if doesn't exist)
      const systemParentId = 'system-blog-seeder'
      
      await db.prepare(
        `INSERT INTO forum_posts (id, group_id, parent_id, author_name, title, content, status, pinned, source, blog_slug, created_at, updated_at)
         VALUES (?, ?, ?, 'SKIDS Team', ?, ?, 'approved', 1, 'blog', ?, datetime('now'), datetime('now'))`
      ).bind(
        crypto.randomUUID(),
        groupId,
        systemParentId,
        article.title.slice(0, 200),
        content.slice(0, 5000),
        article.blogId
      ).run()

      // Increment group post count
      await db.prepare(
        'UPDATE forum_groups SET post_count = post_count + 1 WHERE id = ?'
      ).bind(groupId).run()

      seeded++
    }

    return new Response(JSON.stringify({ seeded, skipped, total: articles.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Database seeding error:', err)
    return new Response(JSON.stringify({ 
      error: 'Database error during seeding', 
      details: err instanceof Error ? err.message : String(err),
      seeded,
      skipped
    }), { status: 500 })
  }
}
