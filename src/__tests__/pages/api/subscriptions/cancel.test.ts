import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ─── Inline cancel logic for unit testing ─────────────
// Mirrors the logic in cancel.ts without Astro/Worker dependencies.

interface SubRow {
  id: string
  parent_id: string
  status: string
  tier_id: string
  billing_cycle: string
  features_snapshot_json: string
  expires_at: string | null
  started_at: string
  payment_id: string | null
}

async function cancelSubscription(
  parentId: string | null,
  db: { rows: SubRow[] },
): Promise<{ status: number; body: unknown }> {
  if (!parentId) return { status: 401, body: { error: 'Unauthorized' } }

  const row = db.rows
    .filter((r) => r.parent_id === parentId && r.status === 'active')
    .sort((a, b) => b.started_at.localeCompare(a.started_at))[0]

  if (!row) return { status: 400, body: { error: 'no_active_subscription' } }

  row.status = 'cancelled'
  return { status: 200, body: { ok: true } }
}

// ─── Unit Tests ────────────────────────────────────────

describe('cancel endpoint — unit tests', () => {
  it('unauthenticated → 401', async () => {
    const result = await cancelSubscription(null, { rows: [] })
    expect(result.status).toBe(401)
  })

  it('no active subscription → 400', async () => {
    const result = await cancelSubscription('parent-1', { rows: [] })
    expect(result.status).toBe(400)
    expect(result.body).toEqual({ error: 'no_active_subscription' })
  })

  it('active subscription → 200 and status updated', async () => {
    const rows: SubRow[] = [{
      id: 'sub-1', parent_id: 'parent-1', status: 'active',
      tier_id: 'pro', billing_cycle: 'monthly',
      features_snapshot_json: '[]', expires_at: null,
      started_at: '2025-01-01', payment_id: null,
    }]
    const result = await cancelSubscription('parent-1', { rows })
    expect(result.status).toBe(200)
    expect(result.body).toEqual({ ok: true })
    expect(rows[0].status).toBe('cancelled')
  })

  it('expired subscription → 400, row unchanged', async () => {
    const rows: SubRow[] = [{
      id: 'sub-1', parent_id: 'parent-1', status: 'expired',
      tier_id: 'pro', billing_cycle: 'monthly',
      features_snapshot_json: '[]', expires_at: null,
      started_at: '2025-01-01', payment_id: null,
    }]
    const result = await cancelSubscription('parent-1', { rows })
    expect(result.status).toBe(400)
    expect(rows[0].status).toBe('expired')
  })
})

// Feature: subscription-features-ui, Property 1: Cancel column isolation
describe('Property 1: Cancel column isolation', () => {
  const subArb = fc.record<SubRow>({
    id: fc.uuid(),
    parent_id: fc.string({ minLength: 1 }),
    status: fc.constant('active'),
    tier_id: fc.string({ minLength: 1 }),
    billing_cycle: fc.constantFrom('monthly', 'yearly'),
    features_snapshot_json: fc.array(fc.string()).map((a) => JSON.stringify(a)),
    expires_at: fc.option(fc.string(), { nil: null }),
    started_at: fc.string({ minLength: 1 }),
    payment_id: fc.option(fc.string(), { nil: null }),
  })

  it('only status changes after cancel; all other columns are identical', async () => {
    await fc.assert(
      fc.asyncProperty(subArb, async (sub) => {
        const rows: SubRow[] = [{ ...sub }]
        const before = { ...rows[0] }
        const result = await cancelSubscription(sub.parent_id, { rows })
        expect(result.status).toBe(200)
        // Only status should differ
        const after = rows[0]
        expect(after.status).toBe('cancelled')
        const { status: _s, ...restBefore } = before
        const { status: _s2, ...restAfter } = after
        expect(restAfter).toEqual(restBefore)
      }),
    )
  })

  it('non-active rows are not modified and return 400', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('expired', 'cancelled'),
        subArb,
        async (initialStatus, sub) => {
          const rows: SubRow[] = [{ ...sub, status: initialStatus }]
          const before = { ...rows[0] }
          const result = await cancelSubscription(sub.parent_id, { rows })
          expect(result.status).toBe(400)
          expect(rows[0]).toEqual(before)
        },
      ),
    )
  })
})
