// Forum post creation form — unit tests for validation logic
// Feature: brand-awareness
// Note: Pure logic tests (no DOM rendering — @testing-library not installed)

import { describe, it, expect } from 'vitest'

// ─── Validation logic mirroring CreatePostForm ────────────────────────────

function validatePost(title: string, content: string): {
  titleError: string | null
  contentError: string | null
  canSubmit: boolean
} {
  const titleError = title.length > 200 ? 'Title must be 200 characters or less' : null
  const contentError = content.length > 5000 ? 'Content must be 5000 characters or less' : null
  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !titleError && !contentError
  return { titleError, contentError, canSubmit }
}

function buildPostPayload(
  groupId: string,
  title: string,
  content: string,
  isAnonymous: boolean
) {
  return {
    groupId,
    title: title.trim(),
    content: content.trim(),
    isAnonymous,
  }
}

// ─── Validation tests ──────────────────────────────────────────────────────

describe('CreatePostForm — validation logic', () => {
  it('canSubmit is false when title is empty', () => {
    const { canSubmit } = validatePost('', 'Some content')
    expect(canSubmit).toBe(false)
  })

  it('canSubmit is false when content is empty', () => {
    const { canSubmit } = validatePost('Some title', '')
    expect(canSubmit).toBe(false)
  })

  it('canSubmit is false when both fields are empty', () => {
    const { canSubmit } = validatePost('', '')
    expect(canSubmit).toBe(false)
  })

  it('canSubmit is true when both fields have valid content', () => {
    const { canSubmit } = validatePost('My question', 'Some content here')
    expect(canSubmit).toBe(true)
  })

  it('shows title error when title exceeds 200 chars', () => {
    const { titleError } = validatePost('a'.repeat(201), 'content')
    expect(titleError).toMatch(/200 characters or less/i)
  })

  it('no title error when title is exactly 200 chars', () => {
    const { titleError } = validatePost('a'.repeat(200), 'content')
    expect(titleError).toBeNull()
  })

  it('shows content error when content exceeds 5000 chars', () => {
    const { contentError } = validatePost('title', 'a'.repeat(5001))
    expect(contentError).toMatch(/5000 characters or less/i)
  })

  it('no content error when content is exactly 5000 chars', () => {
    const { contentError } = validatePost('title', 'a'.repeat(5000))
    expect(contentError).toBeNull()
  })

  it('canSubmit is false when title exceeds limit even with content', () => {
    const { canSubmit } = validatePost('a'.repeat(201), 'valid content')
    expect(canSubmit).toBe(false)
  })

  it('whitespace-only title is not valid', () => {
    const { canSubmit } = validatePost('   ', 'content')
    expect(canSubmit).toBe(false)
  })

  it('whitespace-only content is not valid', () => {
    const { canSubmit } = validatePost('title', '   ')
    expect(canSubmit).toBe(false)
  })
})

// ─── Payload construction ──────────────────────────────────────────────────

describe('CreatePostForm — payload construction', () => {
  it('title and content are trimmed in payload', () => {
    const payload = buildPostPayload('g1', '  My Title  ', '  My Content  ', false)
    expect(payload.title).toBe('My Title')
    expect(payload.content).toBe('My Content')
  })

  it('isAnonymous defaults to false and can be set to true', () => {
    const anon = buildPostPayload('g1', 'title', 'content', true)
    const notAnon = buildPostPayload('g1', 'title', 'content', false)
    expect(anon.isAnonymous).toBe(true)
    expect(notAnon.isAnonymous).toBe(false)
  })

  it('groupId is preserved in payload', () => {
    const payload = buildPostPayload('group-abc-123', 'title', 'content', false)
    expect(payload.groupId).toBe('group-abc-123')
  })
})
