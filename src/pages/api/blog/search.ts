/**
 * GET /api/blog/search?q=iron+deficiency&category=Nutrition
 *
 * Semantic search over indexed blog content using Vectorize RAG.
 * Returns matching blogs ranked by relevance with text snippets.
 *
 * Query params:
 *   q        — search query (required)
 *   category — optional category filter
 *   limit    — max results (default 5, max 10)
 */

import type { APIRoute } from 'astro'
import { searchBlogs } from '@/lib/blog/vectorize'

export const prerender = false

export const GET: APIRoute = async ({ url, locals }) => {
  const env = locals.runtime.env

  const query = url.searchParams.get('q')?.trim()
  if (!query || query.length < 2) {
    return new Response(
      JSON.stringify({ results: [], error: 'Query too short' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const category = url.searchParams.get('category') || undefined
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '5'), 10)

  try {
    const results = await searchBlogs(env.AI, env.VECTORIZE, query, {
      category,
      topK: limit * 2, // fetch more chunks, dedupe down to limit
    })

    // Enrich with thumbnails from the blog list API (cached)
    let thumbnailMap: Record<string, string> = {}
    try {
      const cached = await env.KV.get('blog-thumbnails', 'json') as Record<string, string> | null
      if (cached) {
        thumbnailMap = cached
      } else {
        const listRes = await fetch(
          'https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs'
        )
        if (listRes.ok) {
          const blogs = (await listRes.json()) as any[]
          for (const b of blogs) {
            if (b.thumbnail) thumbnailMap[b.blogId] = b.thumbnail
          }
          // Cache for 30 minutes
          await env.KV.put('blog-thumbnails', JSON.stringify(thumbnailMap), {
            expirationTtl: 1800,
          })
        }
      }
    } catch {
      // Thumbnails are optional — proceed without
    }

    const enriched = results.slice(0, limit).map(r => ({
      ...r,
      thumbnail: thumbnailMap[r.blogId] || undefined,
    }))

    return new Response(
      JSON.stringify({ results: enriched, query }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    )
  } catch (e: any) {
    return new Response(
      JSON.stringify({ results: [], error: e.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
