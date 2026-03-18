// BHASH WhatsApp API unit tests — retry logic, rate limiting, error handling
// Feature: brand-awareness

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BHASHService, formatDailyTip } from '@/lib/distribution/whatsapp'

// ─── Mock fetch ────────────────────────────────────────────────────────────

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const ENV = { BHASH_USER: 'test_user', BHASH_PASS: 'test_pass', BHASH_SENDER: 'BUZWAP' }

beforeEach(() => {
  mockFetch.mockReset()
  vi.useFakeTimers()
})

// ─── sendMessage ───────────────────────────────────────────────────────────

describe('BHASHService.sendMessage', () => {
  it('sends correct query params to BHASH API', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => 'sent' })

    const svc = new BHASHService(ENV)
    await svc.sendMessage({ to: '9876543210', message: 'Hello' })

    expect(mockFetch).toHaveBeenCalledOnce()
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('user=test_user')
    expect(url).toContain('pass=test_pass')
    expect(url).toContain('sender=BUZWAP')
    expect(url).toContain('phone=9876543210')
    expect(url).toContain('priority=wa')
    expect(url).toContain('stype=normal')
  })

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'error' })

    const svc = new BHASHService(ENV)
    await expect(svc.sendMessage({ to: '9876543210', message: 'Hello' })).rejects.toThrow('BHASH API HTTP error 500')
  })

  it('normalizes +91 prefix before sending', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => 'sent' })

    const svc = new BHASHService(ENV)
    await svc.sendMessage({ to: '+919876543210', message: 'Hello' })

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('phone=9876543210')
    expect(url).not.toContain('phone=91')
  })
})

// ─── sendWithRetry ─────────────────────────────────────────────────────────

describe('BHASHService.sendWithRetry', () => {
  it('succeeds on first attempt without retrying', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: async () => 'sent' })

    const svc = new BHASHService(ENV)
    await svc.sendWithRetry({ to: '9876543210', message: 'Hello' }, 3)

    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('retries on failure and succeeds on second attempt', async () => {
    // Use real timers — override the delay with a fast mock
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'unavailable' })
      .mockResolvedValueOnce({ ok: true, text: async () => 'sent' })

    // Patch setTimeout to resolve immediately for this test
    vi.useRealTimers()
    const origSetTimeout = globalThis.setTimeout
    vi.stubGlobal('setTimeout', (fn: () => void) => origSetTimeout(fn, 0))

    const svc = new BHASHService(ENV)
    await svc.sendWithRetry({ to: '9876543210', message: 'Hello' }, 3)

    expect(mockFetch).toHaveBeenCalledTimes(2)
    vi.unstubAllGlobals()
    vi.stubGlobal('fetch', mockFetch)
  })

  it('throws after exhausting all retries', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503, text: async () => 'unavailable' })

    vi.useRealTimers()
    const origSetTimeout = globalThis.setTimeout
    vi.stubGlobal('setTimeout', (fn: () => void) => origSetTimeout(fn, 0))

    const svc = new BHASHService(ENV)
    await expect(svc.sendWithRetry({ to: '9876543210', message: 'Hello' }, 3)).rejects.toThrow()
    expect(mockFetch).toHaveBeenCalledTimes(3)

    vi.unstubAllGlobals()
    vi.stubGlobal('fetch', mockFetch)
  })
})

// ─── formatDailyTip ────────────────────────────────────────────────────────

describe('formatDailyTip', () => {
  it('includes SKIDS branding', () => {
    const msg = formatDailyTip({ title: 'Test Tip', body: 'Some advice' })
    expect(msg).toContain('SKIDS')
    expect(msg).toContain('Test Tip')
    expect(msg).toContain('Some advice')
  })

  it('includes URL when provided', () => {
    const msg = formatDailyTip({ title: 'Tip', body: 'Body', url: 'https://parent.skids.clinic/habits' })
    expect(msg).toContain('https://parent.skids.clinic/habits')
  })

  it('does not include URL line when url is omitted', () => {
    const msg = formatDailyTip({ title: 'Tip', body: 'Body' })
    expect(msg).not.toContain('Read more')
  })

  it('uses WhatsApp bold formatting for title', () => {
    const msg = formatDailyTip({ title: 'My Title', body: 'Body' })
    expect(msg).toContain('*My Title*')
  })
})

// ─── normalizePhone edge cases ─────────────────────────────────────────────

describe('BHASHService.normalizePhone edge cases', () => {
  const svc = new BHASHService(ENV)

  it('throws for 9-digit number', () => {
    expect(() => svc.normalizePhone('987654321')).toThrow()
  })

  it('throws for 11-digit number without 91 prefix', () => {
    expect(() => svc.normalizePhone('98765432101')).toThrow()
  })

  it('handles number with dashes', () => {
    expect(svc.normalizePhone('98765-43210')).toBe('9876543210')
  })

  it('handles number with spaces', () => {
    expect(svc.normalizePhone('98765 43210')).toBe('9876543210')
  })
})
