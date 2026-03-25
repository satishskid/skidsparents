/**
 * Unit tests for POST /api/notifications/generate
 * Feature: smart-notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../../../pages/api/notifications/generate'

// ─── Mocks ─────────────────────────────────────────────────────────────────

vi.mock('@/pages/api/children', () => ({
  getParentId: vi.fn(),
}))

vi.mock('@/lib/runtime/env', () => ({
  getEnv: (locals: any) => locals.runtime?.env ?? {},
}))

vi.mock('@/lib/notifications/service', () => ({
  runGenerationRun: vi.fn(),
}))

import { getParentId } from '@/pages/api/children'
import { runGenerationRun } from '@/lib/notifications/service'

const mockGetParentId = vi.mocked(getParentId)
const mockRunGenerationRun = vi.mocked(runGenerationRun)

function makeRequest(): Request {
  return new Request('http://localhost/api/notifications/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeLocals(db: Record<string, unknown> = {}) {
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

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/notifications/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetParentId.mockResolvedValue(null)
    const res = await POST({ request: makeRequest(), locals: makeLocals() } as any)
    expect(res.status).toBe(401)
    const json = await res.json() as any
    expect(json.error).toBe('Unauthorized')
  })

  it('returns generated count on success', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    mockRunGenerationRun.mockResolvedValue(5)
    const res = await POST({ request: makeRequest(), locals: makeLocals() } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.generated).toBe(5)
  })

  it('calls runGenerationRun with correct parentId', async () => {
    mockGetParentId.mockResolvedValue('parent-abc')
    mockRunGenerationRun.mockResolvedValue(0)
    await POST({ request: makeRequest(), locals: makeLocals() } as any)
    expect(mockRunGenerationRun).toHaveBeenCalledWith(expect.anything(), 'parent-abc')
  })

  it('returns 500 when runGenerationRun throws', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    mockRunGenerationRun.mockRejectedValue(new Error('DB error'))
    const res = await POST({ request: makeRequest(), locals: makeLocals() } as any)
    expect(res.status).toBe(500)
    const json = await res.json() as any
    expect(json.error).toBe('Internal server error')
  })

  it('returns generated = 0 when no notifications created', async () => {
    mockGetParentId.mockResolvedValue('parent-1')
    mockRunGenerationRun.mockResolvedValue(0)
    const res = await POST({ request: makeRequest(), locals: makeLocals() } as any)
    expect(res.status).toBe(200)
    const json = await res.json() as any
    expect(json.generated).toBe(0)
  })
})
