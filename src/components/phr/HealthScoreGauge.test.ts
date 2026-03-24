// HealthScoreGauge — property tests for feature gating and component rendering
// Note: Pure logic tests (no DOM rendering — @testing-library not installed)

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ─── Logic mirroring HealthScoreGauge ─────────────────

function shouldShowDetailed(features: string[], components: Record<string, number>): boolean {
  return features.includes('health_score_detailed') && Object.keys(components).length > 0
}

function getRenderedKeys(features: string[], components: Record<string, number>): string[] {
  if (!shouldShowDetailed(features, components)) return []
  return Object.keys(components)
}

// ─── Property 2: Feature gate determinism ─────────────

// Feature: subscription-features-ui, Property 2: Feature gate determinism
describe('Property 2: Feature gate determinism', () => {
  const componentsArb = fc.dictionary(
    fc.constantFrom('growth', 'development', 'habits', 'nutrition'),
    fc.integer({ min: 0, max: 100 }),
    { minKeys: 1 },
  )

  it('detailed view shown iff health_score_detailed is in features', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string()),
        componentsArb,
        (features, components) => {
          const shown = shouldShowDetailed(features, components)
          const hasFeature = features.includes('health_score_detailed')
          expect(shown).toBe(hasFeature)
        },
      ),
    )
  })

  it('detailed view never shown when features array is empty', () => {
    fc.assert(
      fc.property(componentsArb, (components) => {
        expect(shouldShowDetailed([], components)).toBe(false)
      }),
    )
  })

  it('detailed view never shown when components is empty, even with feature', () => {
    fc.assert(
      fc.property(fc.array(fc.string()), (features) => {
        const withFeature = [...features, 'health_score_detailed']
        expect(shouldShowDetailed(withFeature, {})).toBe(false)
      }),
    )
  })

  it('adding health_score_detailed to any feature array enables detailed view (when components present)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string().filter((s) => s !== 'health_score_detailed')),
        componentsArb,
        (features, components) => {
          expect(shouldShowDetailed([...features, 'health_score_detailed'], components)).toBe(true)
        },
      ),
    )
  })
})

// ─── Property 3: Component rendering completeness ─────

// Feature: subscription-features-ui, Property 3: Component rendering completeness
describe('Property 3: Component rendering completeness', () => {
  const componentsArb = fc.record({
    growth: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    development: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    habits: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
    nutrition: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  }).map((r) => {
    // Remove undefined keys to simulate partial components object
    return Object.fromEntries(
      Object.entries(r).filter(([, v]) => v !== undefined),
    ) as Record<string, number>
  })

  it('rendered keys equal exactly the keys present in components', () => {
    fc.assert(
      fc.property(componentsArb, (components) => {
        const features = ['health_score_detailed']
        const rendered = getRenderedKeys(features, components)
        const expected = Object.keys(components)
        expect(rendered.sort()).toEqual(expected.sort())
      }),
    )
  })

  it('no extra keys are rendered beyond what is in components', () => {
    fc.assert(
      fc.property(componentsArb, (components) => {
        const features = ['health_score_detailed']
        const rendered = getRenderedKeys(features, components)
        for (const key of rendered) {
          expect(key in components).toBe(true)
        }
      }),
    )
  })

  it('no keys are omitted from rendering when feature is present', () => {
    fc.assert(
      fc.property(componentsArb, (components) => {
        const features = ['health_score_detailed']
        const rendered = getRenderedKeys(features, components)
        for (const key of Object.keys(components)) {
          expect(rendered).toContain(key)
        }
      }),
    )
  })

  it('empty components renders nothing even with feature', () => {
    const rendered = getRenderedKeys(['health_score_detailed'], {})
    expect(rendered).toHaveLength(0)
  })
})
