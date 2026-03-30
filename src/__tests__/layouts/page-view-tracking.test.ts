/**
 * Test: Verify page_view tracking with page_type parameter
 * 
 * This test verifies that:
 * - page_view events include page_type parameter
 * - page_type is correctly determined for different page paths
 * - Both G4 and Meta Pixel PageView events are fired
 * - UTM parameters are included in page view events
 * 
 * Task: 7.1 - Add page view tracking to BaseLayout
 * Requirements: 10.1
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Page View Tracking with page_type', () => {
  const baseLayoutPath = resolve(process.cwd(), 'src/layouts/BaseLayout.astro')
  let baseLayoutContent: string

  it('should read BaseLayout content', () => {
    baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
    expect(baseLayoutContent).toBeTruthy()
  })

  describe('page_type parameter', () => {
    it('should include page_type in page_view tracking', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toContain("page_type:")
    })

    it('should map homepage path to "homepage" page_type', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toMatch(/if\s*\(\s*path\s*===\s*['"]\/['"]\s*\)\s*return\s*['"]homepage['"]/)
    })

    it('should map blog paths to "blog" page_type', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toMatch(/if\s*\(\s*path\.indexOf\s*\(\s*['"]\/blog['"]\s*\)\s*===\s*0\s*\)\s*return\s*['"]blog['"]/)
    })

    it('should map discover paths to "discover" page_type', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toMatch(/if\s*\(\s*path\.indexOf\s*\(\s*['"]\/discover['"]\s*\)\s*===\s*0\s*\)\s*return\s*['"]discover['"]/)
    })

    it('should map community paths to "community" page_type', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toMatch(/if\s*\(\s*path\.indexOf\s*\(\s*['"]\/community['"]\s*\)\s*===\s*0\s*\)\s*return\s*['"]community['"]/)
    })
  })

  describe('G4 and Meta Pixel PageView events', () => {
    it('should fire G4 event through skidsTrack', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toContain("window.skidsTrack('page_view'")
    })

    it('should fire Meta Pixel PageView event for page_view events', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check that skidsTrack fires standard PageView for page_view events
      expect(baseLayoutContent).toMatch(/if\s*\(\s*eventName\s*===\s*['"]page_view['"]\s*\)\s*\{[\s\S]*?fbq\s*\(\s*['"]track['"]\s*,\s*['"]PageView['"]/)
    })

    it('should fire both standard PageView and custom page_view events to Meta Pixel', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check that both fbq('track', 'PageView') and fbq('trackCustom', 'page_view') are called
      expect(baseLayoutContent).toContain("fbq('track', 'PageView'")
      expect(baseLayoutContent).toContain("fbq('trackCustom', eventName")
    })
  })

  describe('UTM parameters in page view events', () => {
    it('should merge UTM parameters into tracking events', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check that skidsTrack merges UTM params
      expect(baseLayoutContent).toContain('savedUTM')
      expect(baseLayoutContent).toContain('utm_source')
      expect(baseLayoutContent).toContain('utm_medium')
      expect(baseLayoutContent).toContain('utm_campaign')
    })

    it('should capture UTM parameters before page_view tracking', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Verify UTM capture happens before page_view tracking
      const utmCaptureIndex = baseLayoutContent.indexOf('Capture UTM parameters')
      const pageViewIndex = baseLayoutContent.indexOf("window.skidsTrack('page_view'")
      expect(utmCaptureIndex).toBeGreaterThan(0)
      expect(pageViewIndex).toBeGreaterThan(0)
      expect(utmCaptureIndex).toBeLessThan(pageViewIndex)
    })
  })

  describe('Event parameters', () => {
    it('should include funnel_stage in page_view events', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toMatch(/window\.skidsTrack\s*\(\s*['"]page_view['"]\s*,\s*\{[\s\S]*?funnel_stage:/)
    })

    it('should include asset_code in page_view events', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toMatch(/window\.skidsTrack\s*\(\s*['"]page_view['"]\s*,\s*\{[\s\S]*?asset_code:/)
    })

    it('should include page_path in page_view events', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toMatch(/window\.skidsTrack\s*\(\s*['"]page_view['"]\s*,\s*\{[\s\S]*?page_path:/)
    })
  })
})
