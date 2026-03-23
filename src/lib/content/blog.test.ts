// Blog API error handling unit tests
// Feature: brand-awareness

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Pure blog fetch logic (mirrors what blog pages do) ───────────────────

interface BlogPost {
  blogId: string
  title: string
  category: string
  content?: string
  thumbnailUrl?: string
}

const BLOG_API = 'https://9vhd0onw23.execute-api.ap-south-1.amazonaws.com/published-blogs'

async function fetchBlogs(fetchFn: typeof fetch, timeoutMs = 30000): Promise<BlogPost[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetchFn(BLOG_API, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) {
      throw new Error(`Blog API error: ${res.status}`)
    }

    const data = await res.json()
    if (!Array.isArray(data)) {
      throw new Error('Blog API returned non-array response')
    }

    return data as BlogPost[]
  } catch (e: unknown) {
    clearTimeout(timer)
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Blog API timeout')
    }
    throw e
  }
}

async function fetchBlogById(fetchFn: typeof fetch, blogId: string): Promise<BlogPost | null> {
  const blogs = await fetchBlogs(fetchFn)
  return blogs.find(b => b.blogId === blogId) ?? null
}

// ─── Mock fetch ────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockReset()
})

// ─── Blog API timeout ──────────────────────────────────────────────────────

describe('Blog API error handling', () => {
  it('throws timeout error when fetch is aborted', async () => {
    mockFetch.mockImplementation(() =>
      new Promise((_, reject) => {
        const err = new Error('The operation was aborted')
        err.name = 'AbortError'
        setTimeout(() => reject(err), 10)
      })
    )

    await expect(fetchBlogs(mockFetch as any, 5)).rejects.toThrow('Blog API timeout')
  })

  it('throws on non-200 HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({}),
    })

    await expect(fetchBlogs(mockFetch as any)).rejects.toThrow('Blog API error: 503')
  })

  it('throws when response is not an array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'malformed' }),
    })

    await expect(fetchBlogs(mockFetch as any)).rejects.toThrow('Blog API returned non-array response')
  })

  it('returns empty array when API returns empty array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    const result = await fetchBlogs(mockFetch as any)
    expect(result).toEqual([])
  })

  it('returns null for blog not found (404 equivalent)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ blogId: 'existing-post', title: 'Existing', category: 'health' }],
    })

    const result = await fetchBlogById(mockFetch as any, 'non-existent-slug')
    expect(result).toBeNull()
  })

  it('returns correct blog when found by id', async () => {
    const blogs = [
      { blogId: 'post-1', title: 'First Post', category: 'nutrition' },
      { blogId: 'post-2', title: 'Second Post', category: 'sleep' },
    ]
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => blogs })

    const result = await fetchBlogById(mockFetch as any, 'post-2')
    expect(result?.title).toBe('Second Post')
  })

  it('handles network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchBlogs(mockFetch as any)).rejects.toThrow('Network error')
  })
})
