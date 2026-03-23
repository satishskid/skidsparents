// GET /api/admin/popular-content — weighted engagement score ranking
// Score = views + likes*2 + shares*3 + comments*4
export const prerender = false

import type { APIRoute } from 'astro'
import { drizzle } from 'drizzle-orm/d1'
import { contentEngagement, forumPosts, socialShares, forumComments } from '@/lib/db/schema'
import { eq, gte, and, sql, desc } from 'drizzle-orm'
import { getEnv } from '@/lib/runtime/env'

export const GET: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals)
  const adminKey = request.headers.get('x-admin-key') || new URL(request.url).searchParams.get('key')
  if (adminKey !== env?.ADMIN_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const contentType = url.searchParams.get('contentType') || 'blog'
  const timeframe = (url.searchParams.get('timeframe') || 'week') as 'day' | 'week' | 'month'
  const days = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const db = drizzle(env.DB)

  try {
    // Views from content_engagement
    const views = await db
      .select({
        contentId: contentEngagement.contentId,
        views: sql<number>`count(*)`,
      })
      .from(contentEngagement)
      .where(and(
        eq(contentEngagement.contentType, contentType),
        eq(contentEngagement.action, 'view'),
        gte(contentEngagement.createdAt, since)
      ))
      .groupBy(contentEngagement.contentId)
      .all()

    // Shares from social_shares
    const shares = await db
      .select({
        contentId: socialShares.contentId,
        shares: sql<number>`count(*)`,
      })
      .from(socialShares)
      .where(and(
        eq(socialShares.contentType, contentType as any),
        gte(socialShares.createdAt, since)
      ))
      .groupBy(socialShares.contentId)
      .all()

    // Merge and compute weighted score
    const scoreMap = new Map<string, { views: number; shares: number; score: number }>()

    for (const v of views) {
      const entry = scoreMap.get(v.contentId) ?? { views: 0, shares: 0, score: 0 }
      entry.views = v.views
      scoreMap.set(v.contentId, entry)
    }

    for (const s of shares) {
      const entry = scoreMap.get(s.contentId) ?? { views: 0, shares: 0, score: 0 }
      entry.shares = s.shares
      scoreMap.set(s.contentId, entry)
    }

    const ranked = Array.from(scoreMap.entries())
      .map(([contentId, data]) => ({
        contentId,
        contentType,
        views: data.views,
        shares: data.shares,
        // Score: views + shares*3
        score: data.views + data.shares * 3,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)

    return new Response(JSON.stringify({ ranked, timeframe, contentType }))
  } catch (e: unknown) {
    console.error('popular-content error:', e)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}
