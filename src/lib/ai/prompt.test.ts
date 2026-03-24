/**
 * Property tests for buildSystemPrompt.
 * Feature: child-health-journey
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { buildSystemPrompt, type ChatContext } from './prompt'

// ─── Property 7: buildSystemPrompt includes all provided context fields ────────
// Feature: child-health-journey, Property 7: buildSystemPrompt includes all provided context fields
describe('buildSystemPrompt — enriched context', () => {
  it('Property 7a: includes every vaccination entry string', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 80 }), { minLength: 1, maxLength: 5 }),
        (vaccinations) => {
          const ctx: ChatContext = { vaccinationHistory: vaccinations }
          const prompt = buildSystemPrompt(ctx)
          for (const v of vaccinations) {
            expect(prompt).toContain(v)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7b: includes height value when latestGrowth.height is set', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 30, max: 200, noNaN: true }),
        (height) => {
          const ctx: ChatContext = { latestGrowth: { height } }
          const prompt = buildSystemPrompt(ctx)
          expect(prompt).toContain(String(height))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7c: includes weight value when latestGrowth.weight is set', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 2, max: 100, noNaN: true }),
        (weight) => {
          const ctx: ChatContext = { latestGrowth: { weight } }
          const prompt = buildSystemPrompt(ctx)
          expect(prompt).toContain(String(weight))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7d: no error when vaccination and growth are absent', () => {
    fc.assert(
      fc.property(
        fc.record({
          childProfile: fc.option(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 30 }),
              ageMonths: fc.integer({ min: 0, max: 192 }),
            }),
            { nil: undefined }
          ),
        }),
        (ctx) => {
          expect(() => buildSystemPrompt(ctx)).not.toThrow()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 3: Onboarding mode uses intake system prompt ───────────────────
// Feature: child-health-journey, Property 3: Onboarding mode uses intake system prompt
describe('buildSystemPrompt — onboarding mode', () => {
  it('Property 3a: onboarding mode contains intake topic keywords', () => {
    fc.assert(
      fc.property(
        fc.record({
          childProfile: fc.option(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 30 }),
              ageMonths: fc.integer({ min: 0, max: 192 }),
            }),
            { nil: undefined }
          ),
        }),
        (base) => {
          const ctx: ChatContext = { ...base, mode: 'onboarding' }
          const prompt = buildSystemPrompt(ctx)
          // Onboarding prompt covers these 4 topic areas
          expect(prompt.toLowerCase()).toContain('birth')
          expect(prompt.toLowerCase()).toContain('allerg')
          expect(prompt.toLowerCase()).toContain('illness')
          expect(prompt.toLowerCase()).toContain('develop')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3b: onboarding mode does NOT contain BASE_PERSONA opener', () => {
    fc.assert(
      fc.property(
        fc.record({
          childProfile: fc.option(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 30 }),
              ageMonths: fc.integer({ min: 0, max: 192 }),
            }),
            { nil: undefined }
          ),
        }),
        (base) => {
          const ctx: ChatContext = { ...base, mode: 'onboarding' }
          const prompt = buildSystemPrompt(ctx)
          // BASE_PERSONA starts with "You are Dr. SKIDS, a warm"
          expect(prompt).not.toContain('You are Dr. SKIDS, a warm')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3c: standard mode contains BASE_PERSONA opener', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: fc.constantFrom('standard' as const, undefined),
        }),
        (base) => {
          const ctx: ChatContext = { ...base }
          const prompt = buildSystemPrompt(ctx)
          expect(prompt).toContain('You are Dr. SKIDS, a warm')
        }
      ),
      { numRuns: 50 }
    )
  })
})
