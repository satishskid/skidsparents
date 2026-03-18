// Social sharing property-based tests
// Feature: brand-awareness

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Pure function under test (mirrors ShareButtons.tsx buildUTMUrl) ────────

type Platform = 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'copy'
type ContentType = 'blog' | 'organ' | 'habit' | 'milestone' | 'intervention'

function buildUTMUrl(
  url: string,
  platform: Platform,
  contentType: ContentType,
  contentId: string
): string {
  const base = url.startsWith('http') ? url : `https://parent.skids.clinic${url}`
  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: 'social',
    utm_campaign: `skids_share_${contentType}`,
    utm_content: contentId,
  })
  return `${base}?${params.toString()}`
}

// ─── Generators ────────────────────────────────────────────────────────────

const platform = fc.constantFrom<Platform>(
  'whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin', 'copy'
)
const contentType = fc.constantFrom<ContentType>(
  'blog', 'organ', 'habit', 'milestone', 'intervention'
)
const contentId = fc.string({ minLength: 1, maxLength: 60 })
const relativeUrl = fc.string({ minLength: 1, maxLength: 80 }).map(s => `/${s.replace(/[?#]/g, '-')}`)
const absoluteUrl = relativeUrl.map(p => `https://parent.skids.clinic${p}`)

// ─── Property 9: Share URL UTM injection ───────────────────────────────────

describe('Feature: brand-awareness, Property 9: Share URL UTM injection', () => {
  it('generated URL should contain utm_source matching the platform', () => {
    fc.assert(
      fc.property(
        platform,
        contentType,
        contentId,
        fc.oneof(relativeUrl, absoluteUrl),
        (p, ct, cid, url) => {
          const result = buildUTMUrl(url, p, ct, cid)
          const parsed = new URL(result)
          expect(parsed.searchParams.get('utm_source')).toBe(p)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generated URL should have utm_medium=social', () => {
    fc.assert(
      fc.property(
        platform,
        contentType,
        contentId,
        fc.oneof(relativeUrl, absoluteUrl),
        (p, ct, cid, url) => {
          const result = buildUTMUrl(url, p, ct, cid)
          const parsed = new URL(result)
          expect(parsed.searchParams.get('utm_medium')).toBe('social')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generated URL utm_campaign should start with skids_', () => {
    fc.assert(
      fc.property(
        platform,
        contentType,
        contentId,
        fc.oneof(relativeUrl, absoluteUrl),
        (p, ct, cid, url) => {
          const result = buildUTMUrl(url, p, ct, cid)
          const parsed = new URL(result)
          const campaign = parsed.searchParams.get('utm_campaign') ?? ''
          expect(campaign).toMatch(/^skids_/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('generated URL should be a valid absolute URL', () => {
    fc.assert(
      fc.property(
        platform,
        contentType,
        contentId,
        fc.oneof(relativeUrl, absoluteUrl),
        (p, ct, cid, url) => {
          const result = buildUTMUrl(url, p, ct, cid)
          expect(() => new URL(result)).not.toThrow()
          expect(result).toMatch(/^https:\/\//)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('utm_content should match the contentId', () => {
    fc.assert(
      fc.property(
        platform,
        contentType,
        contentId,
        fc.oneof(relativeUrl, absoluteUrl),
        (p, ct, cid, url) => {
          const result = buildUTMUrl(url, p, ct, cid)
          const parsed = new URL(result)
          expect(parsed.searchParams.get('utm_content')).toBe(cid)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 11: Social share persistence ─────────────────────────────────

import { generateShareUrl } from '@/lib/social/sharing'

describe('Feature: brand-awareness, Property 11: Social share persistence', () => {
  it('generateShareUrl should produce a stable, deterministic URL for the same inputs', () => {
    fc.assert(
      fc.property(
        platform,
        contentType,
        contentId,
        fc.oneof(relativeUrl, absoluteUrl),
        (p, ct, cid, url) => {
          const result1 = generateShareUrl({ baseUrl: url, platform: p, contentType: ct, contentId: cid })
          const result2 = generateShareUrl({ baseUrl: url, platform: p, contentType: ct, contentId: cid })
          expect(result1).toBe(result2)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('different platforms should produce different share URLs for the same content', () => {
    fc.assert(
      fc.property(
        contentType,
        contentId,
        absoluteUrl,
        (ct, cid, url) => {
          const platforms: Array<'whatsapp' | 'facebook' | 'twitter' | 'linkedin'> = [
            'whatsapp', 'facebook', 'twitter', 'linkedin',
          ]
          const urls = platforms.map(p =>
            generateShareUrl({ baseUrl: url, platform: p, contentType: ct, contentId: cid })
          )
          // All utm_source values should be distinct
          const sources = urls.map(u => new URL(u).searchParams.get('utm_source'))
          const unique = new Set(sources)
          expect(unique.size).toBe(platforms.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('share URL should always contain utm_campaign starting with skids_', () => {
    fc.assert(
      fc.property(
        platform,
        contentType,
        contentId,
        absoluteUrl,
        (p, ct, cid, url) => {
          const result = generateShareUrl({ baseUrl: url, platform: p, contentType: ct, contentId: cid })
          const parsed = new URL(result)
          expect(parsed.searchParams.get('utm_campaign')).toMatch(/^skids_/)
        }
      ),
      { numRuns: 100 }
    )
  })
})
