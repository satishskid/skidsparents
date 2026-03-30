/**
 * Test: Verify G4 Analytics and Meta Pixel Script Configuration in BaseLayout
 * 
 * This test verifies that:
 * - G4 tracking script is configured to use environment variable
 * - Meta Pixel tracking script is configured to use environment variable
 * - Scripts load asynchronously without blocking content
 * - BaseLayout component file exists and is properly structured
 * 
 * Requirements: 10.1
 */

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

describe('BaseLayout Analytics Configuration', () => {
  const baseLayoutPath = resolve(process.cwd(), 'src/layouts/BaseLayout.astro')

  it('should have BaseLayout component file', () => {
    expect(existsSync(baseLayoutPath)).toBe(true)
  })

  describe('G4 Script Configuration', () => {
    let baseLayoutContent: string

    it('should read BaseLayout content', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toBeTruthy()
    })

    it('should use PUBLIC_GA4_MEASUREMENT_ID environment variable', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toContain('import.meta.env.PUBLIC_GA4_MEASUREMENT_ID')
    })

    it('should load G4 script asynchronously', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check for async attribute in the gtag script tag
      expect(baseLayoutContent).toMatch(/<script\s+async\s+src=.*googletagmanager\.com\/gtag\/js/)
    })

    it('should configure G4 with brand and center parameters', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toContain("brand: 'skids'")
      expect(baseLayoutContent).toContain("center: 'online'")
    })

    it('should enable automatic page view tracking', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toContain('send_page_view: true')
    })

    it('should conditionally render G4 script only when measurement ID is provided', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check that the script is wrapped in a conditional check
      expect(baseLayoutContent).toMatch(/\{import\.meta\.env\.PUBLIC_GA4_MEASUREMENT_ID\s+&&/)
    })
  })

  describe('Environment Variable Documentation', () => {
    it('should have .env.example file documenting PUBLIC_GA4_MEASUREMENT_ID', () => {
      const envExamplePath = resolve(process.cwd(), '.env.example')
      expect(existsSync(envExamplePath)).toBe(true)
      
      const envExampleContent = readFileSync(envExamplePath, 'utf-8')
      expect(envExampleContent).toContain('PUBLIC_GA4_MEASUREMENT_ID')
    })

    it('should have .env.example file documenting PUBLIC_META_PIXEL_ID', () => {
      const envExamplePath = resolve(process.cwd(), '.env.example')
      const envExampleContent = readFileSync(envExamplePath, 'utf-8')
      expect(envExampleContent).toContain('PUBLIC_META_PIXEL_ID')
    })
  })

  describe('Meta Pixel Script Configuration', () => {
    let baseLayoutContent: string

    it('should read BaseLayout content', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toBeTruthy()
    })

    it('should use PUBLIC_META_PIXEL_ID environment variable', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toContain('import.meta.env.PUBLIC_META_PIXEL_ID')
    })

    it('should load Meta Pixel script asynchronously', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check for async attribute in the fbevents script
      expect(baseLayoutContent).toContain('t.async=!0')
    })

    it('should configure Meta Pixel with brand parameter in page_view tracking', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Brand parameter is now included in the page_view event via skidsTrack
      expect(baseLayoutContent).toContain("brand: BRAND")
      expect(baseLayoutContent).toContain("window.skidsTrack('page_view'")
    })

    it('should track PageView event on initialization', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      expect(baseLayoutContent).toContain("fbq('track', 'PageView'")
    })

    it('should conditionally render Meta Pixel script only when pixel ID is provided', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check that the script is wrapped in a conditional check
      expect(baseLayoutContent).toMatch(/\{import\.meta\.env\.PUBLIC_META_PIXEL_ID\s+&&/)
    })

    it('should include noscript fallback for Meta Pixel', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check for noscript tag with Meta Pixel tracking image
      expect(baseLayoutContent).toContain('<noscript>')
      expect(baseLayoutContent).toContain('facebook.com/tr')
    })

    it('should use environment variable in noscript fallback', () => {
      baseLayoutContent = readFileSync(baseLayoutPath, 'utf-8')
      // Check that noscript also uses the environment variable
      expect(baseLayoutContent).toMatch(/import\.meta\.env\.PUBLIC_META_PIXEL_ID.*&ev=PageView/)
    })
  })
})
