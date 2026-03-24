// SubscriptionCard — unit tests for display logic
// Feature: subscription-features-ui
// Note: Pure logic tests (no DOM rendering — @testing-library not installed)

import { describe, it, expect } from 'vitest'

// ─── Logic mirroring SubscriptionCard ─────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function parseFeatures(json: string): string[] {
  try { return JSON.parse(json) as string[] } catch { return [] }
}

function shouldShowCancelButton(subscription: { status: string } | null): boolean {
  return subscription !== null && subscription?.status === 'active'
}

function getTierName(tierId: string | null): string {
  if (!tierId) return 'Free Plan'
  return tierId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── formatDate ────────────────────────────────────────────────────────────

describe('SubscriptionCard — formatDate', () => {
  it('returns "—" for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('formats ISO date as DD MMM YYYY', () => {
    const result = formatDate('2025-06-15T00:00:00.000Z')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/2025/)
  })

  it('formats another date correctly', () => {
    const result = formatDate('2024-01-01T00:00:00.000Z')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/2024/)
  })
})

// ─── parseFeatures ─────────────────────────────────────────────────────────

describe('SubscriptionCard — parseFeatures', () => {
  it('parses valid JSON array', () => {
    expect(parseFeatures('["health_score_detailed","growth_insights"]')).toEqual([
      'health_score_detailed',
      'growth_insights',
    ])
  })

  it('returns empty array for invalid JSON', () => {
    expect(parseFeatures('not-json')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseFeatures('')).toEqual([])
  })
})

// ─── shouldShowCancelButton ────────────────────────────────────────────────

describe('SubscriptionCard — shouldShowCancelButton', () => {
  it('returns true when subscription is active', () => {
    expect(shouldShowCancelButton({ status: 'active' })).toBe(true)
  })

  it('returns false when subscription is cancelled', () => {
    expect(shouldShowCancelButton({ status: 'cancelled' })).toBe(false)
  })

  it('returns false when subscription is expired', () => {
    expect(shouldShowCancelButton({ status: 'expired' })).toBe(false)
  })

  it('returns false when subscription is null (free plan)', () => {
    expect(shouldShowCancelButton(null)).toBe(false)
  })
})

// ─── getTierName ───────────────────────────────────────────────────────────

describe('SubscriptionCard — getTierName', () => {
  it('returns "Free Plan" when tierId is null', () => {
    expect(getTierName(null)).toBe('Free Plan')
  })

  it('converts snake_case tier id to title case', () => {
    expect(getTierName('premium_monthly')).toBe('Premium Monthly')
  })

  it('handles single-word tier id', () => {
    expect(getTierName('basic')).toBe('Basic')
  })
})
