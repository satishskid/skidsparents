/**
 * Property tests for HABITS content.
 * Feature: onboarding-wizard
 */

import { describe, it, expect } from 'vitest'
import { HABITS } from './habits'

// ─── Property 12 (onboarding-wizard): All 6 HABITS cards render correctly ─────
// Feature: onboarding-wizard, Property 12: Step 3 always renders all 6 HABITS keys, each card has emoji, name, tagline
describe('HABITS content', () => {
  const EXPECTED_KEYS = [
    'healthy_eating',
    'active_movement',
    'balanced_stress',
    'inner_coaching',
    'timekeepers',
    'sufficient_sleep',
  ]

  it('Property 12a: exactly 6 habits defined', () => {
    expect(HABITS).toHaveLength(6)
  })

  it('Property 12b: all expected keys present', () => {
    const keys = HABITS.map(h => h.key)
    for (const k of EXPECTED_KEYS) {
      expect(keys).toContain(k)
    }
  })

  it('Property 12c: every habit has emoji, name, and tagline', () => {
    for (const h of HABITS) {
      expect(h.emoji).toBeTruthy()
      expect(h.name).toBeTruthy()
      expect(h.tagline).toBeTruthy()
      expect(h.tip).toBeTruthy()
      expect(h.letter).toBeTruthy()
    }
  })

  it('Property 12d: HABITS letters spell H.A.B.I.T.S', () => {
    const letters = HABITS.map(h => h.letter).join('')
    expect(letters).toBe('HABITS')
  })
})
