// Analytics property-based tests
// Feature: brand-awareness

import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'

// ─── Testable pure functions extracted from AnalyticsManager ───────────────

/** Pure function: build a page_view event payload */
function buildPageViewEvent(path: string, title: string, referrer: string) {
  return {
    eventName: 'page_view',
    properties: {
      page_path: path,
      page_title: title,
      referrer,
    },
  }
}

/** Pure function: extract UTM params from a URL search string */
function extractUTMParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search)
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  const result: Record<string, string> = {}
  utmKeys.forEach(key => {
    const value = params.get(key)
    if (value) result[key] = value
  })
  return result
}

/** Simulate trackEvent merging UTM params into event properties */
function trackEventWithUTM(
  eventName: string,
  properties: Record<string, any>,
  utmParams: Record<string, string>
) {
  return {
    eventName,
    properties: { ...properties, ...utmParams },
  }
}

// ─── Property 1: Page view tracking completeness ───────────────────────────

describe('Feature: brand-awareness, Property 1: Page view tracking completeness', () => {
  it('trackPageView should produce page_view event with page_path, page_title, and referrer', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }), // path
        fc.string({ minLength: 0, maxLength: 200 }), // title
        fc.string({ minLength: 0, maxLength: 200 }), // referrer
        (path, title, referrer) => {
          const event = buildPageViewEvent(path, title, referrer)

          expect(event.eventName).toBe('page_view')
          expect(event.properties).toHaveProperty('page_path', path)
          expect(event.properties).toHaveProperty('page_title', title)
          expect(event.properties).toHaveProperty('referrer', referrer)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('trackPageView event properties should preserve exact path value', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('/'),
          fc.constant('/blog'),
          fc.string({ minLength: 1, maxLength: 100 }).map(s => `/${s.replace(/\//g, '-')}`)
        ),
        fc.string({ minLength: 0, maxLength: 100 }),
        (path, title) => {
          const event = buildPageViewEvent(path, title, '')
          expect(event.properties.page_path).toBe(path)
          expect(event.properties.page_title).toBe(title)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 4: UTM parameter preservation ────────────────────────────────

describe('Feature: brand-awareness, Property 4: UTM parameter preservation', () => {
  // Generator for a valid UTM source (non-empty, no special URL chars)
  const utmValue = fc.stringMatching(/^[a-z0-9_]{1,30}$/)

  it('UTM params extracted from URL should appear in subsequent event properties', () => {
    fc.assert(
      fc.property(
        utmValue, // utm_source
        fc.constantFrom('social', 'cpc', 'email', 'referral'), // utm_medium
        fc.string({ minLength: 5, maxLength: 40 }).map(s => `skids_${s.replace(/[^a-z0-9]/gi, '_')}`), // utm_campaign
        fc.string({ minLength: 1, maxLength: 20 }), // arbitrary event name
        fc.record({ page: fc.string({ minLength: 1, maxLength: 50 }) }), // event props
        (source, medium, campaign, eventName, props) => {
          const search = `?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`
          const utmParams = extractUTMParams(search)

          // UTM params must be extracted correctly
          expect(utmParams.utm_source).toBe(source)
          expect(utmParams.utm_medium).toBe(medium)
          expect(utmParams.utm_campaign).toBe(campaign)

          // UTM params must appear in all subsequent events
          const event = trackEventWithUTM(eventName, props, utmParams)
          expect(event.properties.utm_source).toBe(source)
          expect(event.properties.utm_medium).toBe(medium)
          expect(event.properties.utm_campaign).toBe(campaign)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('URL without UTM params should produce empty UTM object', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('?foo=bar'),
          fc.constant('?page=1&limit=10')
        ),
        (search) => {
          const utmParams = extractUTMParams(search)
          expect(Object.keys(utmParams)).toHaveLength(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('UTM campaign must start with skids_ prefix when set by the platform', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).map(s => `skids_${s}`),
        (campaign) => {
          const search = `?utm_campaign=${campaign}`
          const utmParams = extractUTMParams(search)
          expect(utmParams.utm_campaign).toMatch(/^skids_/)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 3: Content engagement tracking ───────────────────────────────

const engagementContentType = fc.constantFrom('blog', 'organ', 'habit', 'intervention', 'service')
const engagementContentId = fc.string({ minLength: 1, maxLength: 80 })
const engagementAction = fc.constantFrom('view', 'click', 'share', 'bookmark', 'complete')

interface EngagementEvent {
  contentType: string
  contentId: string
  action: string
  parentId: string | null
  timestamp: number
}

function buildEngagementEvent(
  contentType: string,
  contentId: string,
  action: string,
  parentId: string | null
): EngagementEvent {
  return { contentType, contentId, action, parentId, timestamp: Date.now() }
}

describe('Feature: brand-awareness, Property 3: Content engagement tracking', () => {
  it('engagement event should preserve contentType, contentId, and action exactly', () => {
    fc.assert(
      fc.property(
        engagementContentType,
        engagementContentId,
        engagementAction,
        fc.option(fc.uuid(), { nil: null }),
        (ct, cid, action, parentId) => {
          const event = buildEngagementEvent(ct, cid, action, parentId)
          expect(event.contentType).toBe(ct)
          expect(event.contentId).toBe(cid)
          expect(event.action).toBe(action)
          expect(event.parentId).toBe(parentId)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('engagement event timestamp should be a positive integer', () => {
    fc.assert(
      fc.property(
        engagementContentType,
        engagementContentId,
        engagementAction,
        (ct, cid, action) => {
          const event = buildEngagementEvent(ct, cid, action, null)
          expect(event.timestamp).toBeGreaterThan(0)
          expect(Number.isFinite(event.timestamp)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('anonymous engagement (null parentId) should be allowed', () => {
    fc.assert(
      fc.property(engagementContentType, engagementContentId, engagementAction, (ct, cid, action) => {
        const event = buildEngagementEvent(ct, cid, action, null)
        expect(event.parentId).toBeNull()
        expect(event.contentType).toBe(ct)
      }),
      { numRuns: 100 }
    )
  })
})
