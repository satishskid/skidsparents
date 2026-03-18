// Engagement tracking property-based tests
// Feature: brand-awareness

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Pure functions mirroring engagement tracking logic ────────────────────

interface EngagementRecord {
  id: string
  parentId: string | null
  contentType: string
  contentId: string
  action: 'view' | 'click' | 'share' | 'bookmark' | 'complete'
  durationSeconds?: number
  createdAt: string
}

const VALID_ACTIONS = ['view', 'click', 'share', 'bookmark', 'complete'] as const
type EngagementAction = typeof VALID_ACTIONS[number]

/** Mirrors EngagementService.trackView — maps action, clamps duration */
function createEngagementRecord(
  parentId: string | null,
  contentType: string,
  contentId: string,
  action: string,
  durationSeconds: number
): EngagementRecord {
  const mapped: EngagementAction = VALID_ACTIONS.includes(action as EngagementAction)
    ? (action as EngagementAction)
    : 'click'

  return {
    id: crypto.randomUUID(),
    parentId,
    contentType,
    contentId,
    action: mapped,
    durationSeconds: Math.max(0, Math.round(durationSeconds)),
    createdAt: new Date().toISOString(),
  }
}

/** Mirrors getPopularContent — counts engagement per contentId */
function computePopularContent(
  records: EngagementRecord[],
  contentType: string
): Array<{ contentId: string; engagementCount: number }> {
  const counts = new Map<string, number>()
  for (const r of records) {
    if (r.contentType === contentType) {
      counts.set(r.contentId, (counts.get(r.contentId) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([contentId, engagementCount]) => ({ contentId, engagementCount }))
    .sort((a, b) => b.engagementCount - a.engagementCount)
}

// ─── Generators ────────────────────────────────────────────────────────────

const uuid = fc.uuid()
const contentType = fc.constantFrom('blog', 'organ', 'habit', 'intervention', 'service')
const contentId = fc.string({ minLength: 1, maxLength: 80 })
const action = fc.constantFrom(...VALID_ACTIONS)
const duration = fc.float({ min: 0, max: 3600, noNaN: true })

// ─── Property 13: View duration accuracy ───────────────────────────────────

describe('Feature: brand-awareness, Property 13: View duration accuracy', () => {
  it('duration should always be non-negative after normalization', () => {
    fc.assert(
      fc.property(
        uuid,
        contentType,
        contentId,
        fc.float({ min: -100, max: 3600, noNaN: true }),
        (parentId, ct, cid, rawDuration) => {
          const record = createEngagementRecord(parentId, ct, cid, 'view', rawDuration)
          expect(record.durationSeconds).toBeGreaterThanOrEqual(0)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('duration should be an integer (rounded seconds)', () => {
    fc.assert(
      fc.property(uuid, contentType, contentId, duration, (parentId, ct, cid, d) => {
        const record = createEngagementRecord(parentId, ct, cid, 'view', d)
        expect(Number.isInteger(record.durationSeconds)).toBe(true)
      }),
      { numRuns: 200 }
    )
  })

  it('content type and id should be preserved exactly', () => {
    fc.assert(
      fc.property(uuid, contentType, contentId, action, duration, (parentId, ct, cid, a, d) => {
        const record = createEngagementRecord(parentId, ct, cid, a, d)
        expect(record.contentType).toBe(ct)
        expect(record.contentId).toBe(cid)
      }),
      { numRuns: 200 }
    )
  })

  it('unknown action should be mapped to click', () => {
    fc.assert(
      fc.property(
        uuid,
        contentType,
        contentId,
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !VALID_ACTIONS.includes(s as EngagementAction)),
        duration,
        (parentId, ct, cid, unknownAction, d) => {
          const record = createEngagementRecord(parentId, ct, cid, unknownAction, d)
          expect(record.action).toBe('click')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 18: Content engagement immutability ──────────────────────────

describe('Feature: brand-awareness, Property 18: Content engagement immutability', () => {
  it('each engagement record should have a unique id', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ parentId: uuid, contentType, contentId, action, duration }),
          { minLength: 2, maxLength: 20 }
        ),
        (inputs) => {
          const records = inputs.map(i =>
            createEngagementRecord(i.parentId, i.contentType, i.contentId, i.action, i.duration)
          )
          const ids = records.map(r => r.id)
          const unique = new Set(ids)
          expect(unique.size).toBe(records.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('engagement records should be append-only — adding a record never changes existing ones', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ parentId: uuid, contentType, contentId, action, duration }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.record({ parentId: uuid, contentType, contentId, action, duration }),
        (existing, newInput) => {
          const records = existing.map(i =>
            createEngagementRecord(i.parentId, i.contentType, i.contentId, i.action, i.duration)
          )
          const snapshot = records.map(r => ({ ...r }))

          // Add new record
          const newRecord = createEngagementRecord(
            newInput.parentId, newInput.contentType, newInput.contentId, newInput.action, newInput.duration
          )
          records.push(newRecord)

          // Existing records must be unchanged
          for (let i = 0; i < snapshot.length; i++) {
            expect(records[i]).toEqual(snapshot[i])
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('popular content count should equal total engagement records for that content', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            parentId: uuid,
            contentType: fc.constantFrom('blog', 'organ'),
            contentId: fc.constantFrom('slug-a', 'slug-b', 'slug-c'),
            action,
            duration,
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (inputs) => {
          const records = inputs.map(i =>
            createEngagementRecord(i.parentId, i.contentType, i.contentId, i.action, i.duration)
          )

          const popular = computePopularContent(records, 'blog')
          const totalBlogRecords = records.filter(r => r.contentType === 'blog').length
          const totalFromPopular = popular.reduce((sum, p) => sum + p.engagementCount, 0)

          expect(totalFromPopular).toBe(totalBlogRecords)
        }
      ),
      { numRuns: 100 }
    )
  })
})
