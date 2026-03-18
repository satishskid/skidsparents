// Blog bookmark property-based tests
// Feature: brand-awareness

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Pure functions mirroring bookmark API logic ───────────────────────────

interface Bookmark {
  id: string
  parentId: string
  blogSlug: string
  createdAt: string
}

/** Mirrors the idempotent POST /api/blog/bookmark logic */
function addBookmark(
  bookmarks: Bookmark[],
  parentId: string,
  blogSlug: string
): { bookmarks: Bookmark[]; created: boolean } {
  const slug = blogSlug.trim()
  const existing = bookmarks.find(b => b.parentId === parentId && b.blogSlug === slug)
  if (existing) return { bookmarks, created: false }

  const newBookmark: Bookmark = {
    id: crypto.randomUUID(),
    parentId,
    blogSlug: slug,
    createdAt: new Date().toISOString(),
  }
  return { bookmarks: [...bookmarks, newBookmark], created: true }
}

/** Mirrors DELETE /api/blog/bookmark */
function removeBookmark(bookmarks: Bookmark[], parentId: string, blogSlug: string): Bookmark[] {
  return bookmarks.filter(b => !(b.parentId === parentId && b.blogSlug === blogSlug.trim()))
}

/** Count bookmarks for a given parent+slug pair */
function countBookmarks(bookmarks: Bookmark[], parentId: string, blogSlug: string): number {
  return bookmarks.filter(b => b.parentId === parentId && b.blogSlug === blogSlug.trim()).length
}

// ─── Generators ────────────────────────────────────────────────────────────

const uuid = fc.uuid()
const blogSlug = fc.string({ minLength: 1, maxLength: 100 }).map(s => s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 100) || 'slug')

// ─── Property 12: Blog bookmark uniqueness ─────────────────────────────────

describe('Feature: brand-awareness, Property 12: Blog bookmark uniqueness', () => {
  it('bookmarking the same blog twice should not create duplicate entries', () => {
    fc.assert(
      fc.property(uuid, blogSlug, (parentId, slug) => {
        const { bookmarks: after1 } = addBookmark([], parentId, slug)
        const { bookmarks: after2, created } = addBookmark(after1, parentId, slug)

        expect(created).toBe(false)
        expect(countBookmarks(after2, parentId, slug)).toBe(1)
      }),
      { numRuns: 100 }
    )
  })

  it('bookmarking N different blogs creates exactly N bookmarks', () => {
    fc.assert(
      fc.property(
        uuid,
        fc.array(blogSlug, { minLength: 1, maxLength: 10 }).filter(slugs => new Set(slugs).size === slugs.length),
        (parentId, slugs) => {
          let bookmarks: Bookmark[] = []
          for (const slug of slugs) {
            const result = addBookmark(bookmarks, parentId, slug)
            bookmarks = result.bookmarks
          }
          expect(bookmarks.filter(b => b.parentId === parentId).length).toBe(slugs.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('removing a bookmark leaves no entry for that parent+slug', () => {
    fc.assert(
      fc.property(uuid, blogSlug, (parentId, slug) => {
        const { bookmarks: withBookmark } = addBookmark([], parentId, slug)
        const after = removeBookmark(withBookmark, parentId, slug)
        expect(countBookmarks(after, parentId, slug)).toBe(0)
      }),
      { numRuns: 100 }
    )
  })

  it('different parents can bookmark the same blog independently', () => {
    fc.assert(
      fc.property(
        fc.array(uuid, { minLength: 2, maxLength: 5 }).filter(ids => new Set(ids).size === ids.length),
        blogSlug,
        (parentIds, slug) => {
          let bookmarks: Bookmark[] = []
          for (const pid of parentIds) {
            const result = addBookmark(bookmarks, pid, slug)
            bookmarks = result.bookmarks
          }
          expect(bookmarks.filter(b => b.blogSlug === slug.trim()).length).toBe(parentIds.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})
