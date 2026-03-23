import { describe, it, expect, vi } from 'vitest'
import { buildDedupeKey, getAgeStage, isDuplicate, createNotification, HABIT_LABELS } from './service'

// ─── getAgeStage ───────────────────────────────────────

describe('getAgeStage', () => {
  it('returns infant for 0 months', () => expect(getAgeStage(0)).toBe('infant'))
  it('returns infant for 11 months', () => expect(getAgeStage(11)).toBe('infant'))
  it('returns toddler for 12 months', () => expect(getAgeStage(12)).toBe('toddler'))
  it('returns toddler for 35 months', () => expect(getAgeStage(35)).toBe('toddler'))
  it('returns preschooler for 36 months', () => expect(getAgeStage(36)).toBe('preschooler'))
  it('returns preschooler for 71 months', () => expect(getAgeStage(71)).toBe('preschooler'))
  it('returns school-age for 72 months', () => expect(getAgeStage(72)).toBe('school-age'))
  it('returns school-age for 143 months', () => expect(getAgeStage(143)).toBe('school-age'))
  it('returns adolescent for 144 months', () => expect(getAgeStage(144)).toBe('adolescent'))
  it('returns adolescent for 200 months', () => expect(getAgeStage(200)).toBe('adolescent'))
})

// ─── buildDedupeKey ────────────────────────────────────

describe('buildDedupeKey', () => {
  it('builds a single-part key', () => {
    expect(buildDedupeKey('welcome')).toBe('welcome')
  })

  it('builds a two-part milestone key', () => {
    expect(buildDedupeKey('milestone', 'first_words')).toBe('milestone:first_words')
  })

  it('builds a three-part habit streak key', () => {
    expect(buildDedupeKey('habit_streak', 'active_movement', '7')).toBe('habit_streak:active_movement:7')
  })

  it('builds a vaccination key', () => {
    expect(buildDedupeKey('vaccination', 'MMR')).toBe('vaccination:MMR')
  })

  it('builds a screening key with UUID', () => {
    const id = 'abc-123'
    expect(buildDedupeKey('screening', id)).toBe(`screening:${id}`)
  })

  it('builds a blog key with age stage', () => {
    expect(buildDedupeKey('blog', 'toddler')).toBe('blog:toddler')
  })

  it('produces stable output for same inputs', () => {
    const a = buildDedupeKey('habit_streak', 'healthy_eating', '14')
    const b = buildDedupeKey('habit_streak', 'healthy_eating', '14')
    expect(a).toBe(b)
  })
})

// ─── HABIT_LABELS ──────────────────────────────────────

describe('HABIT_LABELS', () => {
  it('has all 6 habit types', () => {
    const keys = Object.keys(HABIT_LABELS)
    expect(keys).toHaveLength(6)
    expect(keys).toContain('healthy_eating')
    expect(keys).toContain('active_movement')
    expect(keys).toContain('balanced_stress')
    expect(keys).toContain('inner_coaching')
    expect(keys).toContain('timekeepers')
    expect(keys).toContain('sufficient_sleep')
  })

  it('maps healthy_eating to Healthy Eating', () => {
    expect(HABIT_LABELS['healthy_eating']).toBe('Healthy Eating')
  })
})

// ─── isDuplicate ───────────────────────────────────────

function makeMockDb(rows: { id: string; data_json: string }[]) {
  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: rows }),
      }),
    }),
  }
}

describe('isDuplicate', () => {
  const parentId = 'parent-1'
  const childId = 'child-1'

  it('returns false when no matching rows exist', async () => {
    const db = makeMockDb([]) as any
    const result = await isDuplicate(db, parentId, childId, 'general', 'welcome', 0)
    expect(result).toBe(false)
  })

  it('returns true when a row with matching dedupeKey and childId exists', async () => {
    const db = makeMockDb([
      { id: 'n1', data_json: JSON.stringify({ childId: 'child-1', dedupeKey: 'welcome' }) },
    ]) as any
    const result = await isDuplicate(db, parentId, childId, 'general', 'welcome', 0)
    expect(result).toBe(true)
  })

  it('returns false when dedupeKey does not match', async () => {
    const db = makeMockDb([
      { id: 'n1', data_json: JSON.stringify({ childId: 'child-1', dedupeKey: 'other_key' }) },
    ]) as any
    const result = await isDuplicate(db, parentId, childId, 'general', 'welcome', 0)
    expect(result).toBe(false)
  })

  it('returns false when childId does not match', async () => {
    const db = makeMockDb([
      { id: 'n1', data_json: JSON.stringify({ childId: 'child-99', dedupeKey: 'welcome' }) },
    ]) as any
    const result = await isDuplicate(db, parentId, childId, 'general', 'welcome', 0)
    expect(result).toBe(false)
  })

  it('uses cooldown date filter when cooldownDays > 0', async () => {
    const prepareSpy = vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    })
    const db = { prepare: prepareSpy } as any
    await isDuplicate(db, parentId, childId, 'general', 'growth_reminder', 7)
    const query: string = prepareSpy.mock.calls[0][0]
    expect(query).toContain('created_at >=')
  })

  it('does not use date filter when cooldownDays <= 0', async () => {
    const prepareSpy = vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    })
    const db = { prepare: prepareSpy } as any
    await isDuplicate(db, parentId, childId, 'general', 'welcome', 0)
    const query: string = prepareSpy.mock.calls[0][0]
    expect(query).not.toContain('created_at >=')
  })

  it('skips rows with malformed data_json without throwing', async () => {
    const db = makeMockDb([
      { id: 'n1', data_json: 'not-valid-json' },
    ]) as any
    const result = await isDuplicate(db, parentId, childId, 'general', 'welcome', 0)
    expect(result).toBe(false)
  })
})

// ─── createNotification ────────────────────────────────

describe('createNotification', () => {
  it('calls db.prepare with INSERT and correct bindings', async () => {
    const runMock = vi.fn().mockResolvedValue({})
    const bindMock = vi.fn().mockReturnValue({ run: runMock })
    const prepareMock = vi.fn().mockReturnValue({ bind: bindMock })
    const db = { prepare: prepareMock } as any

    await createNotification(db, {
      parentId: 'p1',
      childId: 'c1',
      type: 'general',
      title: 'Test title',
      body: 'Test body',
      actionUrl: '/dashboard',
      dataJson: { childId: 'c1', childName: 'Arjun', dedupeKey: 'welcome' },
    })

    expect(prepareMock).toHaveBeenCalledOnce()
    const sql: string = prepareMock.mock.calls[0][0]
    expect(sql).toContain('INSERT INTO notifications')
    expect(runMock).toHaveBeenCalledOnce()

    const bindArgs = bindMock.mock.calls[0]
    expect(bindArgs[1]).toBe('p1')   // parent_id
    expect(bindArgs[2]).toBe('general') // type
    expect(bindArgs[3]).toBe('Test title') // title
    expect(bindArgs[4]).toBe('Test body')  // body
    // data_json should be a JSON string containing the dedupeKey
    expect(JSON.parse(bindArgs[5] as string)).toMatchObject({ dedupeKey: 'welcome' })
  })
})
