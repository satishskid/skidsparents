/**
 * POST /api/admin/index-blogs?offset=0&batch=5
 *
 * Indexes a batch of blogs into Vectorize. Workers has a 50 subrequest
 * limit, so we process 5 blogs per invocation.
 *
 * Query params:
 *   offset — starting index in the blog list (default 0)
 *   batch  — number of blogs to process (default 5, max 8)
 *
 * Call repeatedly with increasing offset to index all blogs:
 *   POST /api/admin/index-blogs?offset=0&batch=5
 *   POST /api/admin/index-blogs?offset=5&batch=5
 *   ...
 *
 * Or POST /api/admin/index-blogs?all=true to auto-paginate (uses KV for state).
 */

import type { APIRoute } from 'astro'
import { chunkBlogContent, generateEmbeddings } from '@/lib/blog/vectorize'

export const prerender = false

const BLOG_API = 'https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com'

export const POST: APIRoute = async ({ url, locals }) => {
  const env = locals.runtime.env
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const batch = Math.min(parseInt(url.searchParams.get('batch') || '5'), 8)

  try {
    // 1. Fetch blog list (1 subrequest)
    const listRes = await fetch(`${BLOG_API}/published-blogs`)
    if (!listRes.ok) throw new Error(`Blog list API error: ${listRes.status}`)
    const allBlogs = (await listRes.json()) as any[]
    allBlogs.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const total = allBlogs.length
    const slice = allBlogs.slice(offset, offset + batch)

    if (slice.length === 0) {
      return json({ ok: true, message: 'Nothing to index', offset, total, indexed: 0, chunks: 0 })
    }

    // 2. Fetch content for each blog in batch (N subrequests)
    const blogsWithContent: Array<{ blogId: string; title: string; category: string; author: string; content: string }> = []
    const errors: string[] = []

    for (const b of slice) {
      try {
        const res = await fetch(`${BLOG_API}/blog/${b.blogId}`)
        if (!res.ok) {
          errors.push(`${b.blogId}: HTTP ${res.status}`)
          continue
        }
        const data = (await res.json()) as { status: number; data: any }
        const bd = data.data
        if (!bd || typeof bd.description !== 'string') {
          errors.push(`${b.blogId}: no content`)
          continue
        }
        blogsWithContent.push({
          blogId: b.blogId,
          title: bd.title || b.title || '',
          category: bd.category || b.category || '',
          author: bd.author || b.author || 'SKIDS',
          content: bd.description,
        })
      } catch (e: any) {
        errors.push(`${b.blogId}: ${e.message}`)
      }
    }

    // 3. Chunk all fetched blogs
    const allChunks = blogsWithContent.flatMap(blog =>
      chunkBlogContent(blog, blog.content)
    )

    if (allChunks.length === 0) {
      return json({ ok: true, offset, total, indexed: 0, chunks: 0, errors, nextOffset: offset + batch < total ? offset + batch : null })
    }

    // 4. Generate embeddings (1 subrequest to Workers AI per batch of 100)
    const textsToEmbed = allChunks.map(c =>
      c.chunkIndex === 0 ? `${c.title}\n\n${c.text}` : c.text
    )
    const embeddings = await generateEmbeddings(env.AI, textsToEmbed)

    // 5. Upsert to Vectorize
    const vectors = allChunks.map((chunk, j) => ({
      id: chunk.id,
      values: embeddings[j],
      metadata: {
        blogId: chunk.blogId,
        title: chunk.title,
        category: chunk.category,
        author: chunk.author,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text.slice(0, 500),
      },
    }))

    // Vectorize upsert in batches of 100
    for (let i = 0; i < vectors.length; i += 100) {
      await env.VECTORIZE.upsert(vectors.slice(i, i + 100))
    }

    const nextOffset = offset + batch < total ? offset + batch : null

    return json({
      ok: true,
      offset,
      batch: slice.length,
      total,
      indexed: blogsWithContent.length,
      chunks: vectors.length,
      nextOffset,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500)
  }
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
