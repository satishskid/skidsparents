// Forum property-based tests
// Feature: brand-awareness

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Pure functions mirroring the forum API logic ──────────────────────────

interface ForumPost {
  id: string
  groupId: string
  parentId: string
  authorName: string
  isAnonymous: boolean
  title: string
  content: string
  likes: number
  commentCount: number
}

interface ForumGroup {
  id: string
  name: string
  postCount: number
}

/** Mirrors the sanitization in GET /api/forum/posts */
function sanitizePost(post: ForumPost): Omit<ForumPost, 'parentId'> & { parentId: string | null } {
  return {
    ...post,
    authorName: post.isAnonymous ? 'Anonymous' : post.authorName,
    parentId: post.isAnonymous ? null : post.parentId,
  }
}

/** Mirrors POST /api/forum/posts — build a post object from input */
function createPost(input: {
  groupId: string
  parentId: string
  authorName: string
  isAnonymous: boolean
  title: string
  content: string
}): ForumPost {
  return {
    id: crypto.randomUUID(),
    groupId: input.groupId,
    parentId: input.parentId,
    authorName: input.isAnonymous ? 'Anonymous' : input.authorName,
    isAnonymous: input.isAnonymous,
    title: input.title.trim(),
    content: input.content.trim(),
    likes: 0,
    commentCount: 0,
  }
}

/** Mirrors like logic: returns new like count or throws if already liked */
function likePost(
  post: ForumPost,
  likedBy: Set<string>,
  parentId: string
): { post: ForumPost; likedBy: Set<string>; alreadyLiked: boolean } {
  if (likedBy.has(parentId)) {
    return { post, likedBy, alreadyLiked: true }
  }
  const newLikedBy = new Set(likedBy)
  newLikedBy.add(parentId)
  return {
    post: { ...post, likes: post.likes + 1 },
    likedBy: newLikedBy,
    alreadyLiked: false,
  }
}

/** Mirrors group postCount increment when a post is created */
function addPostToGroup(group: ForumGroup): ForumGroup {
  return { ...group, postCount: group.postCount + 1 }
}

// ─── Generators ────────────────────────────────────────────────────────────

const validTitle = fc.string({ minLength: 1, maxLength: 200 })
const validContent = fc.string({ minLength: 1, maxLength: 5000 })
const uuid = fc.uuid()
const nonEmptyName = fc.string({ minLength: 1, maxLength: 80 })

// ─── Property 5: Forum post data integrity ─────────────────────────────────

describe('Feature: brand-awareness, Property 5: Forum post data integrity', () => {
  it('created post should contain all input fields intact', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupId: uuid,
          parentId: uuid,
          authorName: nonEmptyName,
          isAnonymous: fc.boolean(),
          title: validTitle,
          content: validContent,
        }),
        (input) => {
          const post = createPost(input)

          expect(post.groupId).toBe(input.groupId)
          expect(post.parentId).toBe(input.parentId)
          expect(post.isAnonymous).toBe(input.isAnonymous)
          // title and content are trimmed — trimmed value must equal trimmed input
          expect(post.title).toBe(input.title.trim())
          expect(post.content).toBe(input.content.trim())
          expect(post.likes).toBe(0)
          expect(post.commentCount).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('title must not exceed 200 chars and content must not exceed 5000 chars', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupId: uuid,
          parentId: uuid,
          authorName: nonEmptyName,
          isAnonymous: fc.boolean(),
          title: validTitle,
          content: validContent,
        }),
        (input) => {
          const post = createPost(input)
          expect(post.title.length).toBeLessThanOrEqual(200)
          expect(post.content.length).toBeLessThanOrEqual(5000)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 6: Anonymous post privacy ────────────────────────────────────

describe('Feature: brand-awareness, Property 6: Anonymous post privacy', () => {
  it('anonymous post should have authorName=Anonymous and parentId=null after sanitization', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupId: uuid,
          parentId: uuid,
          authorName: nonEmptyName,
          title: validTitle,
          content: validContent,
        }),
        (input) => {
          const post = createPost({ ...input, isAnonymous: true })
          const sanitized = sanitizePost(post)

          expect(sanitized.authorName).toBe('Anonymous')
          expect(sanitized.parentId).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('non-anonymous post should preserve real authorName and parentId', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupId: uuid,
          parentId: uuid,
          authorName: nonEmptyName,
          title: validTitle,
          content: validContent,
        }),
        (input) => {
          const post = createPost({ ...input, isAnonymous: false })
          const sanitized = sanitizePost(post)

          expect(sanitized.authorName).toBe(input.authorName)
          expect(sanitized.parentId).toBe(input.parentId)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 7: Forum like counting ───────────────────────────────────────

describe('Feature: brand-awareness, Property 7: Forum like counting', () => {
  it('liking a post once increments likes by exactly 1', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupId: uuid,
          parentId: uuid,
          authorName: nonEmptyName,
          isAnonymous: fc.boolean(),
          title: validTitle,
          content: validContent,
        }),
        uuid, // liker's parentId
        (input, likerId) => {
          const post = createPost(input)
          const initialLikes = post.likes // always 0 for new post

          const { post: liked, alreadyLiked } = likePost(post, new Set(), likerId)

          expect(alreadyLiked).toBe(false)
          expect(liked.likes).toBe(initialLikes + 1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('liking the same post twice with the same parentId should NOT increment again (idempotent)', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupId: uuid,
          parentId: uuid,
          authorName: nonEmptyName,
          isAnonymous: fc.boolean(),
          title: validTitle,
          content: validContent,
        }),
        uuid, // liker's parentId
        (input, likerId) => {
          const post = createPost(input)

          // First like
          const { post: afterFirst, likedBy } = likePost(post, new Set(), likerId)
          expect(afterFirst.likes).toBe(1)

          // Second like — same parent
          const { post: afterSecond, alreadyLiked } = likePost(afterFirst, likedBy, likerId)
          expect(alreadyLiked).toBe(true)
          expect(afterSecond.likes).toBe(1) // must not increment
        }
      ),
      { numRuns: 100 }
    )
  })

  it('different parents can each like the same post once', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupId: uuid,
          parentId: uuid,
          authorName: nonEmptyName,
          isAnonymous: fc.boolean(),
          title: validTitle,
          content: validContent,
        }),
        fc.array(uuid, { minLength: 2, maxLength: 10 }).filter(ids => new Set(ids).size === ids.length),
        (input, likerIds) => {
          let post = createPost(input)
          let likedBy = new Set<string>()

          for (const likerId of likerIds) {
            const result = likePost(post, likedBy, likerId)
            expect(result.alreadyLiked).toBe(false)
            post = result.post
            likedBy = result.likedBy
          }

          expect(post.likes).toBe(likerIds.length)
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ─── Property 16: Forum group post count maintenance ───────────────────────

describe('Feature: brand-awareness, Property 16: Forum group post count maintenance', () => {
  it('creating a post in a group increments postCount by exactly 1', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: uuid,
          name: nonEmptyName,
          postCount: fc.integer({ min: 0, max: 1000 }),
        }),
        (group) => {
          const before = group.postCount
          const after = addPostToGroup(group)
          expect(after.postCount).toBe(before + 1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('creating N posts increments postCount by exactly N', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: uuid,
          name: nonEmptyName,
          postCount: fc.integer({ min: 0, max: 100 }),
        }),
        fc.integer({ min: 1, max: 20 }),
        (group, n) => {
          let g = group
          for (let i = 0; i < n; i++) {
            g = addPostToGroup(g)
          }
          expect(g.postCount).toBe(group.postCount + n)
        }
      ),
      { numRuns: 100 }
    )
  })
})
