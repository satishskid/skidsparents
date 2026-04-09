/**
 * Blog Vectorize utilities
 *
 * Chunks blog HTML content into paragraphs, generates embeddings
 * via Workers AI (@cf/baai/bge-base-en-v1.5), and upserts to
 * Cloudflare Vectorize for RAG search.
 */

const BLOG_API = 'https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com'
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5'
const MAX_CHUNK_CHARS = 800 // ~200 tokens per chunk
const OVERLAP_CHARS = 100

// ── Types ────────────────────────────────────────────────

export interface BlogMeta {
  blogId: string
  title: string
  category: string
  author: string
  createdAt: string
  thumbnail?: string
}

export interface BlogChunk {
  id: string          // blogId__chunk_N
  blogId: string
  title: string
  category: string
  author: string
  chunkIndex: number
  text: string        // plain text chunk
}

export interface SearchResult {
  blogId: string
  title: string
  category: string
  author: string
  snippet: string
  score: number
  thumbnail?: string
}

// ── HTML → plain text ────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Chunking ─────────────────────────────────────────────

export function chunkBlogContent(blog: BlogMeta, htmlContent: string): BlogChunk[] {
  const text = stripHtml(htmlContent)
  if (!text) return []

  // Split by paragraph boundaries first
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20)
  const chunks: BlogChunk[] = []
  let buffer = ''
  let chunkIndex = 0

  for (const para of paragraphs) {
    if (buffer.length + para.length > MAX_CHUNK_CHARS && buffer.length > 0) {
      chunks.push({
        id: `${blog.blogId}__chunk_${chunkIndex}`,
        blogId: blog.blogId,
        title: blog.title,
        category: blog.category || '',
        author: blog.author || 'SKIDS',
        chunkIndex,
        text: buffer.trim(),
      })
      chunkIndex++
      // Keep overlap from end of previous chunk
      buffer = buffer.slice(-OVERLAP_CHARS) + '\n\n'
    }
    buffer += (buffer ? '\n\n' : '') + para
  }

  // Final chunk
  if (buffer.trim().length > 20) {
    chunks.push({
      id: `${blog.blogId}__chunk_${chunkIndex}`,
      blogId: blog.blogId,
      title: blog.title,
      category: blog.category || '',
      author: blog.author || 'SKIDS',
      chunkIndex,
      text: buffer.trim(),
    })
  }

  return chunks
}

// ── Fetch all blogs with content ─────────────────────────

export async function fetchAllBlogsWithContent(): Promise<Array<BlogMeta & { content: string }>> {
  // Get blog list
  const listRes = await fetch(`${BLOG_API}/published-blogs`)
  if (!listRes.ok) throw new Error(`Blog list API error: ${listRes.status}`)
  const blogs = (await listRes.json()) as any[]

  // Fetch content for each blog (parallel, batched)
  const BATCH_SIZE = 10
  const results: Array<BlogMeta & { content: string }> = []

  for (let i = 0; i < blogs.length; i += BATCH_SIZE) {
    const batch = blogs.slice(i, i + BATCH_SIZE)
    const fetched = await Promise.allSettled(
      batch.map(async (b: any) => {
        const res = await fetch(`${BLOG_API}/blog/${b.blogId}`)
        if (!res.ok) return null
        const data = (await res.json()) as { status: number; data: any }
        const blogData = data.data
        if (!blogData || typeof blogData.description !== 'string') return null
        return {
          blogId: b.blogId,
          title: blogData.title || b.title || '',
          category: blogData.category || b.category || '',
          author: blogData.author || b.author || 'SKIDS',
          createdAt: blogData.createdAt || b.createdAt || '',
          thumbnail: b.thumbnail || '',
          content: blogData.description,
        }
      })
    )
    for (const r of fetched) {
      if (r.status === 'fulfilled' && r.value) {
        results.push(r.value)
      }
    }
  }

  return results
}

// ── Generate embeddings ──────────────────────────────────

export async function generateEmbeddings(
  ai: Ai,
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return []

  // Workers AI bge-base supports batch up to 100
  const BATCH = 100
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH)
    const result = await ai.run(EMBEDDING_MODEL as any, { text: batch }) as { data: number[][] }
    allEmbeddings.push(...result.data)
  }

  return allEmbeddings
}

// ── Index all blogs ──────────────────────────────────────

export async function indexAllBlogs(
  ai: Ai,
  vectorize: VectorizeIndex
): Promise<{ indexed: number; chunks: number; errors: string[] }> {
  const errors: string[] = []

  // 1. Fetch all blogs with content
  const blogs = await fetchAllBlogsWithContent()

  // 2. Chunk all blogs
  const allChunks: BlogChunk[] = []
  for (const blog of blogs) {
    try {
      const chunks = chunkBlogContent(blog, blog.content)
      allChunks.push(...chunks)
    } catch (e: any) {
      errors.push(`Chunk error for ${blog.blogId}: ${e.message}`)
    }
  }

  if (allChunks.length === 0) {
    return { indexed: 0, chunks: 0, errors: ['No chunks generated'] }
  }

  // 3. Generate embeddings (prepend title for better context)
  const textsToEmbed = allChunks.map(c =>
    c.chunkIndex === 0
      ? `${c.title}\n\n${c.text}` // First chunk includes title
      : c.text
  )
  const embeddings = await generateEmbeddings(ai, textsToEmbed)

  // 4. Upsert to Vectorize in batches of 100
  const UPSERT_BATCH = 100
  let upserted = 0

  for (let i = 0; i < allChunks.length; i += UPSERT_BATCH) {
    const batchChunks = allChunks.slice(i, i + UPSERT_BATCH)
    const batchEmbeddings = embeddings.slice(i, i + UPSERT_BATCH)

    const vectors = batchChunks.map((chunk, j) => ({
      id: chunk.id,
      values: batchEmbeddings[j],
      metadata: {
        blogId: chunk.blogId,
        title: chunk.title,
        category: chunk.category,
        author: chunk.author,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text.slice(0, 500), // Store snippet in metadata for retrieval
      },
    }))

    try {
      await vectorize.upsert(vectors)
      upserted += vectors.length
    } catch (e: any) {
      errors.push(`Upsert batch ${i} error: ${e.message}`)
    }
  }

  return {
    indexed: blogs.length,
    chunks: upserted,
    errors,
  }
}

// ── Search blogs ─────────────────────────────────────────

export async function searchBlogs(
  ai: Ai,
  vectorize: VectorizeIndex,
  query: string,
  opts?: { category?: string; topK?: number }
): Promise<SearchResult[]> {
  const topK = opts?.topK || 8

  // 1. Embed the query
  const [queryEmbedding] = await generateEmbeddings(ai, [query])

  // 2. Query Vectorize
  const filter: Record<string, any> = {}
  if (opts?.category) {
    filter.category = opts.category
  }

  const results = await vectorize.query(queryEmbedding, {
    topK,
    returnMetadata: 'all',
    ...(Object.keys(filter).length > 0 ? { filter } : {}),
  })

  if (!results.matches || results.matches.length === 0) return []

  // 3. Deduplicate by blogId (keep highest scoring chunk per blog)
  const blogMap = new Map<string, SearchResult>()

  for (const match of results.matches) {
    const meta = match.metadata as Record<string, any> | undefined
    if (!meta) continue

    const blogId = meta.blogId as string
    const existing = blogMap.get(blogId)

    if (!existing || (match.score ?? 0) > existing.score) {
      blogMap.set(blogId, {
        blogId,
        title: meta.title as string || '',
        category: meta.category as string || '',
        author: meta.author as string || '',
        snippet: meta.text as string || '',
        score: match.score ?? 0,
      })
    }
  }

  // 4. Sort by score descending
  return Array.from(blogMap.values()).sort((a, b) => b.score - a.score)
}
