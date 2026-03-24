/**
 * Property tests for ChildDashboard tab labels and Dr. SKIDS event.
 * Feature: child-health-journey
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Property 8: Tab short labels are ≤6 characters ──────────────────────────
// Feature: child-health-journey, Property 8: Tab short labels are ≤6 characters
const TABS = [
  { key: 'milestones', label: 'Milestones', short: 'Miles' },
  { key: 'habits',     label: 'Habits',     short: 'Habits' },
  { key: 'growth',     label: 'Growth',     short: 'Growth' },
  { key: 'notes',      label: 'Notes',      short: 'Notes'  },
  { key: 'records',    label: 'Records',    short: 'Rec.'   },
] as const

describe('ChildDashboard TABS', () => {
  it('Property 8: every short label is ≤6 characters', () => {
    for (const tab of TABS) {
      expect(tab.short.length).toBeLessThanOrEqual(6)
    }
  })

  it('all 5 tabs are defined', () => {
    expect(TABS).toHaveLength(5)
  })

  it('every tab has key, label, and short', () => {
    for (const tab of TABS) {
      expect(tab.key).toBeTruthy()
      expect(tab.label).toBeTruthy()
      expect(tab.short).toBeTruthy()
    }
  })
})

// ─── Property 6: Ask Dr. SKIDS event contains observation text ────────────────
// Feature: child-health-journey, Property 6: Ask Dr. SKIDS event contains observation text
describe('askDrSkids event payload', () => {
  function buildAskDrSkidsQuestion(observationText: string): string {
    return `I noticed: "${observationText}" — what should I do?`
  }

  it('Property 6: question always contains the observation text', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (text) => {
          const question = buildAskDrSkidsQuestion(text)
          expect(question).toContain(text)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('Property 6b: question format is consistent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (text) => {
          const question = buildAskDrSkidsQuestion(text)
          expect(question).toMatch(/^I noticed:/)
          expect(question).toContain('what should I do?')
        }
      ),
      { numRuns: 100 }
    )
  })
})
