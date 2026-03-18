// Content moderation unit tests
// Feature: brand-awareness

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Pure moderation logic (mirrors API behavior) ─────────────────────────

interface Report {
  id: string
  parentId: string
  targetType: 'post' | 'comment'
  targetId: string
  reason: string | null
  status: 'pending' | 'reviewed' | 'dismissed'
}

interface ForumContent {
  id: string
  content: string
  isHidden: boolean
}

/** Mirrors POST /api/forum/report — idempotent, no duplicate reports */
function submitReport(
  reports: Report[],
  parentId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  reason: string | null
): { reports: Report[]; created: boolean } {
  const existing = reports.find(
    r => r.parentId === parentId && r.targetId === targetId && r.targetType === targetType
  )
  if (existing) return { reports, created: false }

  const newReport: Report = {
    id: crypto.randomUUID(),
    parentId,
    targetType,
    targetId,
    reason,
    status: 'pending',
  }
  return { reports: [...reports, newReport], created: true }
}

/** Mirrors admin "Hide" action */
function hideContent(content: ForumContent, reportId: string, reports: Report[]): {
  content: ForumContent
  reports: Report[]
} {
  return {
    content: { ...content, isHidden: true },
    reports: reports.map(r => r.id === reportId ? { ...r, status: 'reviewed' } : r),
  }
}

/** Mirrors admin "Dismiss" action */
function dismissReport(reports: Report[], reportId: string): Report[] {
  return reports.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r)
}

/** Mirrors GET query — hidden content should not be returned */
function getVisibleContent(items: ForumContent[]): ForumContent[] {
  return items.filter(i => !i.isHidden)
}

// ─── Generators ────────────────────────────────────────────────────────────

const uuid = fc.uuid()
const targetType = fc.constantFrom<'post' | 'comment'>('post', 'comment')
const reason = fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: null })

// ─── Report submission ─────────────────────────────────────────────────────

describe('Content moderation — report submission', () => {
  it('submitting a report creates a pending report', () => {
    fc.assert(
      fc.property(uuid, targetType, uuid, reason, (parentId, type, targetId, r) => {
        const { reports, created } = submitReport([], parentId, type, targetId, r)
        expect(created).toBe(true)
        expect(reports.length).toBe(1)
        expect(reports[0].status).toBe('pending')
        expect(reports[0].parentId).toBe(parentId)
        expect(reports[0].targetId).toBe(targetId)
      }),
      { numRuns: 100 }
    )
  })

  it('same parent cannot report the same content twice', () => {
    fc.assert(
      fc.property(uuid, targetType, uuid, (parentId, type, targetId) => {
        const { reports: after1 } = submitReport([], parentId, type, targetId, null)
        const { reports: after2, created } = submitReport(after1, parentId, type, targetId, null)

        expect(created).toBe(false)
        expect(after2.length).toBe(1)
      }),
      { numRuns: 100 }
    )
  })

  it('different parents can each report the same content', () => {
    fc.assert(
      fc.property(
        fc.array(uuid, { minLength: 2, maxLength: 5 }).filter(ids => new Set(ids).size === ids.length),
        uuid,
        (parentIds, targetId) => {
          let reports: Report[] = []
          for (const pid of parentIds) {
            const result = submitReport(reports, pid, 'post', targetId, null)
            reports = result.reports
          }
          expect(reports.length).toBe(parentIds.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Hide action ───────────────────────────────────────────────────────────

describe('Content moderation — hide action', () => {
  it('hiding content sets isHidden=true', () => {
    fc.assert(
      fc.property(uuid, fc.string({ minLength: 1, maxLength: 200 }), (id, content) => {
        const item: ForumContent = { id, content, isHidden: false }
        const report: Report = { id: crypto.randomUUID(), parentId: 'p1', targetType: 'post', targetId: id, reason: null, status: 'pending' }

        const { content: hidden } = hideContent(item, report.id, [report])
        expect(hidden.isHidden).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('hiding content marks the report as reviewed', () => {
    fc.assert(
      fc.property(uuid, (id) => {
        const item: ForumContent = { id, content: 'test', isHidden: false }
        const report: Report = { id: crypto.randomUUID(), parentId: 'p1', targetType: 'post', targetId: id, reason: null, status: 'pending' }

        const { reports } = hideContent(item, report.id, [report])
        expect(reports[0].status).toBe('reviewed')
      }),
      { numRuns: 100 }
    )
  })

  it('hidden content is not returned in visible content list', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ id: uuid, content: fc.string({ minLength: 1 }), isHidden: fc.boolean() }),
          { minLength: 1, maxLength: 20 }
        ),
        (items) => {
          const visible = getVisibleContent(items)
          expect(visible.every(i => !i.isHidden)).toBe(true)
          expect(visible.length).toBe(items.filter(i => !i.isHidden).length)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Dismiss action ────────────────────────────────────────────────────────

describe('Content moderation — dismiss action', () => {
  it('dismissing a report sets status to dismissed', () => {
    fc.assert(
      fc.property(uuid, (targetId) => {
        const report: Report = { id: crypto.randomUUID(), parentId: 'p1', targetType: 'post', targetId, reason: null, status: 'pending' }
        const updated = dismissReport([report], report.id)
        expect(updated[0].status).toBe('dismissed')
      }),
      { numRuns: 100 }
    )
  })

  it('dismissing one report does not affect others', () => {
    fc.assert(
      fc.property(
        fc.array(uuid, { minLength: 2, maxLength: 5 }),
        (targetIds) => {
          const reports: Report[] = targetIds.map(tid => ({
            id: crypto.randomUUID(),
            parentId: 'p1',
            targetType: 'post' as const,
            targetId: tid,
            reason: null,
            status: 'pending' as const,
          }))

          const toDismiss = reports[0]
          const updated = dismissReport(reports, toDismiss.id)

          expect(updated[0].status).toBe('dismissed')
          for (let i = 1; i < updated.length; i++) {
            expect(updated[i].status).toBe('pending')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
