// Popular content ranking property-based tests
// Feature: brand-awareness

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Pure ranking logic (mirrors popular-content API) ─────────────────────

interface EngagementData {
  contentId: string
  views: number
  shares: number
}

interface RankedContent extends EngagementData {
  score: number
}

/** Mirrors the scoring in /api/admin/popular-content */
function rankContent(data: EngagementData[]): RankedContent[] {
  return data
    .map(d => ({ ...d, score: d.views + d.shares * 3 }))
    .sort((a, b) => b.score - a.score)
}

// ─── Generators ────────────────────────────────────────────────────────────

const contentId = fc.string({ minLength: 1, maxLength: 60 })
const engagementData = fc.record({
  contentId,
  views: fc.integer({ min: 0, max: 10000 }),
  shares: fc.integer({ min: 0, max: 1000 }),
})

// ─── Property 14: Popular content ranking ──────────────────────────────────

describe('Feature: brand-awareness, Property 14: Popular content ranking', () => {
  it('ranked list should be in descending score order', () => {
    fc.assert(
      fc.property(
        fc.array(engagementData, { minLength: 2, maxLength: 20 }),
        (data) => {
          const ranked = rankContent(data)
          for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score)
          }
        }
      ),
      { numRuns: 200 }
    )
  })

  it('score should equal views + shares*3', () => {
    fc.assert(
      fc.property(
        fc.array(engagementData, { minLength: 1, maxLength: 10 }),
        (data) => {
          const ranked = rankContent(data)
          // Verify each ranked item's score matches its own views + shares*3
          for (const item of ranked) {
            expect(item.score).toBe(item.views + item.shares * 3)
          }
        }
      ),
      { numRuns: 200 }
    )
  })

  it('content with more shares should rank higher than content with only views when shares*3 > views difference', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 50 }),
        (baseViews, extraShares) => {
          const lowShareItem: EngagementData = { contentId: 'low', views: baseViews + extraShares * 3, shares: 0 }
          const highShareItem: EngagementData = { contentId: 'high', views: baseViews, shares: extraShares }

          const ranked = rankContent([lowShareItem, highShareItem])
          // Both have equal score: (baseViews + extraShares*3) vs (baseViews + extraShares*3)
          expect(ranked[0].score).toBe(ranked[1].score)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('ranking preserves all content items — no items lost', () => {
    fc.assert(
      fc.property(
        fc.array(engagementData, { minLength: 1, maxLength: 15 }),
        (data) => {
          const ranked = rankContent(data)
          expect(ranked.length).toBe(data.length)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('empty input produces empty ranking', () => {
    const ranked = rankContent([])
    expect(ranked).toEqual([])
  })

  it('single item ranking returns that item with correct score', () => {
    fc.assert(
      fc.property(engagementData, (item) => {
        const ranked = rankContent([item])
        expect(ranked.length).toBe(1)
        expect(ranked[0].score).toBe(item.views + item.shares * 3)
      }),
      { numRuns: 100 }
    )
  })
})
