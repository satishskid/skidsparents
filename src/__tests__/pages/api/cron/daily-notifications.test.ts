/**
 * Unit tests for POST /api/cron/daily-notifications
 * Feature: smart-notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../../../pages/api/cron/daily-notifications'

// ─── Mocks ─────────────────────────────────────────────────────────────────

vi.mock('@/lib/runtime/env', () => ({
  getEnv: (locals: any) => locals.runtime?.env ?? {},
}))

vi.mock('@/lib/notifications/service', () => ({
  runGenerationRun: vi.fn(),
}))

import { runGenerationRun } from '@/lib/notifications/service'

const mockRunGenerationRun = vi.mocked(runGenerationRun)

const CRON_SECRET = 'test-cron-secret'

function makeRequest(opts: { secret?: string | null } = {}): Request {
  const { secret = CRON_SECRET } = opts
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (secret !== null) {
    headers['Authorization'] = `Bearer ${secret}`
  }
  return new Request('http://localhost/api/cron/daily-notifications', {
    method: 'POST',
    headers,
  })
}

function makeLocals(db: Record<string, unknown> = {}) {
  return {
    runtime: {
      env: {
        DB: db,
        CRON_SECRET,
        FIREBASE_PROJECT_ID: 'test',
        KV: {},
      },
    },
  } as unknown as App.Locals
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/cron/daily-notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when Authorization header is missing', async () => {
    const res = await POST({ request: makeRequest({ secret: null }), locals: makeLocals() } as any)
    expect(res.status).toBe(401)
    const json = await res.json() as any
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 401 when CRON_SECRET is wrong', async () => {
    const res = await POST({ request: makeRequest({ secret: 'wrong-secret' }), locals: makeLocals() } as any)
    expect(res.status).toBe(401)
    const json = await res.json() as any
    expect(json.error).toBe('Unauthorized')
  })

  it('returns processed=0 and generated=0 when no parents exist', async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    }
    const res = await POST({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.processed).toBe(0)
    expect(json.generated).toBe(0)
  })

  it('processes each parent and accumulates counts', async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({
          results: [{ parent_id: 'p1' }, { parent_id: 'p2' }],
        }),
      }),
    }
    mockRunGenerationRun.mockResolvedValueOnce(3).mockResolvedValueOnce(2)
    const res = await POST({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.processed).toBe(2)
    expect(json.generated).toBe(5)
  })

  it('continues processing other parents when one fails', async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({
          results: [{ parent_id: 'p1' }, { parent_id: 'p2' }, { parent_id: 'p3' }],
        }),
      }),
    }
    mockRunGenerationRun
      .mockResolvedValueOnce(1)
      .mockRejectedValueOnce(new Error('DB error'))
      .mockResolvedValueOnce(4)
    const res = await POST({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    // p1 and p3 succeed, p2 fails but is skipped
    expect(json.processed).toBe(2)
    expect(json.generated).toBe(5)
  })

  it('returns 500 when DB query itself fails', async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockRejectedValue(new Error('DB connection failed')),
      }),
    }
    const res = await POST({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(res.status).toBe(500)
    const json = await res.json() as any
    expect(json.error).toBe('Internal server error')
  })

  it('calls runGenerationRun with correct parentId for each parent', async () => {
    const db = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({
          results: [{ parent_id: 'parent-abc' }, { parent_id: 'parent-xyz' }],
        }),
      }),
    }
    mockRunGenerationRun.mockResolvedValue(0)
    await POST({ request: makeRequest(), locals: makeLocals(db) } as any)
    expect(mockRunGenerationRun).toHaveBeenCalledWith(db, 'parent-abc')
    expect(mockRunGenerationRun).toHaveBeenCalledWith(db, 'parent-xyz')
  })
})
