/**
 * Unit tests for GET/POST /api/notifications
 * Feature: smart-notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './notifications'

// ─── Mock helpers ──────────────────────────────────────────────────────────

function makeRequest(opts: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Request {
  const { method = 'GET', body, headers = {} } = opts
  return new Request('http://localhost/api/notifications', {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function makeLocals(db: Record<string, unknown>, parentId: string | null = 'parent-1') {
  return {
    runtime: {
      env: {
        DB: db,
        FIREBASE_PROJECT_ID: 'test',
        KV: {},
        CRON_SECRET: 'secret',
      },
    },
  } as unknown as App.Locals
}

// Mock getParentId from children module
vi.mock('@/pages/api/children', () => ({
  getParentId: vi.fn(),
}))

// Mock getEnv to return the env from locals
vi.mock('@/lib/runtime/env', () => ({
  getEnv: (locals: any) => locals.runtime?.env ?? {},
}))

import { getParentId } from '@/pages/api/children'

const mockGetParentId = vi.mocked(getParentId)

// ─── GET /api/notifications ────────────────────────────────────────────────

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no auth token', async () => {
    mockGetParentId.mockResolvedValue(null)
    const db = {}
    const res = await GET({ request: makeRequest(), locals: makeLocals(db, null) } as any)
    expect(res.status).toBe(401)
    const json = await res.json() as any
    expect(json.error).toBe('Unauthorized')
  })

  it('returns notifications and unreadCount for authenticated parent', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const rows = [
      { id: 'n1', type: 'general', title: 'Hello', body: 'World', data_json: '{}', read: 0, created_at: '2024-01-02' },
      { id: 'n2', type: 'general', title: 'Read one', body: 'Body', data_json: '{}', read: 1, created_at: '2024-01-01' },
    ]
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: rows }),
        }),
      }),
    }
    const res = await GET({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.notifications).toHaveLength(2)
    expect(json.unreadCount).toBe(1)
  })

  it('returns empty list when no such table error', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('no such table: notifications')),
        }),
      }),
    }
    const res = await GET({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.notifications).toEqual([])
    expect(json.unreadCount).toBe(0)
  })

  it('returns 500 on unexpected DB error', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockRejectedValue(new Error('connection failed')),
        }),
      }),
    }
    const res = await GET({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(res.status).toBe(500)
  })

  it('unreadCount counts only records with read = 0 or falsy', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const rows = [
      { id: 'n1', read: 0 },
      { id: 'n2', read: 0 },
      { id: 'n3', read: 1 },
      { id: 'n4', read: 1 },
      { id: 'n5', read: 0 },
    ]
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: rows }),
        }),
      }),
    }
    const res = await GET({ request: makeRequest(), locals: makeLocals(db) } as any)
    const json = await res.json() as any
    expect(json.unreadCount).toBe(3)
  })
})

// ─── POST /api/notifications — mark_read ──────────────────────────────────

describe('POST /api/notifications — mark_read', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetParentId.mockResolvedValue(null)
    const res = await POST({
      request: makeRequest({ method: 'POST', body: { action: 'mark_read', id: 'n1' } }),
      locals: makeLocals({}, null),
    } as any)
    expect(res.status).toBe(401)
  })

  it('returns 400 when id is missing for mark_read', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const db = {}
    const res = await POST({
      request: makeRequest({ method: 'POST', body: { action: 'mark_read' } }),
      locals: makeLocals(db),
    } as any)
    expect(res.status).toBe(400)
  })

  it('returns 404 when notification not found', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
    }
    const res = await POST({
      request: makeRequest({ method: 'POST', body: { action: 'mark_read', id: 'missing' } }),
      locals: makeLocals(db),
    } as any)
    expect(res.status).toBe(404)
  })

  it('returns 403 when notification belongs to different parent', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ parent_id: 'parent-2' }),
        }),
      }),
    }
    const res = await POST({
      request: makeRequest({ method: 'POST', body: { action: 'mark_read', id: 'n1' } }),
      locals: makeLocals(db),
    } as any)
    expect(res.status).toBe(403)
    const json = await res.json() as any
    expect(json.error).toBe('Forbidden')
  })

  it('marks notification as read and returns success', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const runMock = vi.fn().mockResolvedValue({})
    const db = {
      prepare: vi.fn()
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({ parent_id: 'parent-1' }),
          }),
        })
        .mockReturnValueOnce({
          bind: vi.fn().mockReturnValue({ run: runMock }),
        }),
    }
    const res = await POST({
      request: makeRequest({ method: 'POST', body: { action: 'mark_read', id: 'n1' } }),
      locals: makeLocals(db),
    } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.success).toBe(true)
    expect(runMock).toHaveBeenCalled()
  })
})

// ─── POST /api/notifications — mark_all_read ──────────────────────────────

describe('POST /api/notifications — mark_all_read', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks all unread notifications as read and returns success', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const runMock = vi.fn().mockResolvedValue({})
    const db = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({ run: runMock }),
      }),
    }
    const res = await POST({
      request: makeRequest({ method: 'POST', body: { action: 'mark_all_read' } }),
      locals: makeLocals(db),
    } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.success).toBe(true)
    expect(runMock).toHaveBeenCalled()
  })

  it('returns 400 for unknown action', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    const db = {}
    const res = await POST({
      request: makeRequest({ method: 'POST', body: { action: 'unknown_action' } }),
      locals: makeLocals(db),
    } as any)
    expect(res.status).toBe(400)
    const json = await res.json() as any
    expect(json.error).toBe('Invalid action')
  })
})
