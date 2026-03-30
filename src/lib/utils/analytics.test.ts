import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trackEvent, trackMetaEvent } from './analytics'
import * as utmModule from './utm'

describe('G4 tracking helper utilities', () => {
  let mockGtag: ReturnType<typeof vi.fn>
  let mockFbq: ReturnType<typeof vi.fn>
  let originalWindow: any

  beforeEach(() => {
    // Save original window
    originalWindow = global.window
    
    // Create mock functions
    mockGtag = vi.fn()
    mockFbq = vi.fn()
    
    // Set up global window object with gtag and fbq
    global.window = {
      gtag: mockGtag,
      fbq: mockFbq,
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn()
      }
    } as any
    
    // Mock getUTMParams to return empty object by default
    vi.spyOn(utmModule, 'getUTMParams').mockReturnValue({})
  })

  afterEach(() => {
    // Restore original window
    global.window = originalWindow
    
    // Clean up
    vi.restoreAllMocks()
  })

  describe('trackEvent', () => {
    it('should call window.gtag with correct event name and empty params', () => {
      trackEvent('test_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {})
    })

    it('should call window.gtag with event name and parameters', () => {
      const params = {
        prompt_type: 'chat',
        page: '/timeline',
        feature: 'dr_skids_chat'
      }

      trackEvent('sign_in_prompt_view', params)

      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_in_prompt_view', params)
    })

    it('should include UTM parameters in all events', () => {
      // Mock UTM parameters
      vi.spyOn(utmModule, 'getUTMParams').mockReturnValue({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer_2024',
        utm_term: 'child_health',
        utm_content: 'ad_variant_a',
        referral_code: 'REF123'
      })

      const params = {
        prompt_type: 'chat',
        page: '/timeline'
      }

      trackEvent('sign_in_prompt_view', params)

      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_in_prompt_view', {
        prompt_type: 'chat',
        page: '/timeline',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer_2024',
        utm_term: 'child_health',
        utm_content: 'ad_variant_a',
        referral_code: 'REF123'
      })
    })

    it('should include partial UTM parameters when available', () => {
      // Mock partial UTM parameters
      vi.spyOn(utmModule, 'getUTMParams').mockReturnValue({
        utm_source: 'facebook',
        utm_campaign: 'awareness'
      })

      trackEvent('page_view', { page_type: 'blog' })

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_type: 'blog',
        utm_source: 'facebook',
        utm_campaign: 'awareness'
      })
    })

    it('should handle various parameter types', () => {
      const params = {
        string_param: 'value',
        number_param: 42,
        boolean_param: true,
        undefined_param: undefined
      }

      trackEvent('mixed_params_event', params)

      expect(mockGtag).toHaveBeenCalledWith('event', 'mixed_params_event', params)
    })

    it('should not throw error when gtag is unavailable', () => {
      // Remove gtag from window
      global.window = {} as any

      expect(() => {
        trackEvent('test_event', { param: 'value' })
      }).not.toThrow()
    })

    it('should handle gtag throwing an error gracefully', () => {
      // Make gtag throw an error
      mockGtag.mockImplementation(() => {
        throw new Error('Tracking error')
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => {
        trackEvent('test_event', { param: 'value' })
      }).not.toThrow()

      expect(consoleWarnSpy).toHaveBeenCalledWith('G4 tracking error:', expect.any(Error))

      consoleWarnSpy.mockRestore()
    })

    it('should track page_view events', () => {
      trackEvent('page_view', {
        page_type: 'blog',
        page_path: '/blog/article-1',
        page_title: 'Article 1'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_type: 'blog',
        page_path: '/blog/article-1',
        page_title: 'Article 1'
      })
    })

    it('should track sign_in_prompt_view events', () => {
      trackEvent('sign_in_prompt_view', {
        prompt_type: 'community',
        page: '/community/123',
        feature: 'post_creation'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_in_prompt_view', {
        prompt_type: 'community',
        page: '/community/123',
        feature: 'post_creation'
      })
    })

    it('should track upgrade_prompt_view events', () => {
      trackEvent('upgrade_prompt_view', {
        prompt_type: 'usage_limit',
        current_tier: 'free',
        questions_remaining: 0
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'upgrade_prompt_view', {
        prompt_type: 'usage_limit',
        current_tier: 'free',
        questions_remaining: 0
      })
    })

    it('should track authentication events', () => {
      trackEvent('sign_up', {
        method: 'google',
        is_new_user: true
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
        method: 'google',
        is_new_user: true
      })
    })
  })

  describe('trackMetaEvent', () => {
    it('should call window.fbq with correct event name and empty params', () => {
      trackMetaEvent('PageView')

      expect(mockFbq).toHaveBeenCalledWith('track', 'PageView', {})
    })

    it('should call window.fbq with event name and parameters', () => {
      const params = {
        prompt_type: 'chat',
        page: '/timeline',
        feature: 'dr_skids_chat'
      }

      trackMetaEvent('SignInPromptView', params)

      expect(mockFbq).toHaveBeenCalledWith('track', 'SignInPromptView', params)
    })

    it('should include UTM parameters in all events', () => {
      // Mock UTM parameters
      vi.spyOn(utmModule, 'getUTMParams').mockReturnValue({
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'launch_2024',
        referral_code: 'INSTA456'
      })

      const params = {
        content_type: 'blog',
        content_id: 'article-123'
      }

      trackMetaEvent('ViewContent', params)

      expect(mockFbq).toHaveBeenCalledWith('track', 'ViewContent', {
        content_type: 'blog',
        content_id: 'article-123',
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'launch_2024',
        referral_code: 'INSTA456'
      })
    })

    it('should not throw error when fbq is unavailable', () => {
      // Remove fbq from window
      global.window = { gtag: mockGtag } as any

      expect(() => {
        trackMetaEvent('PageView', { param: 'value' })
      }).not.toThrow()
    })

    it('should handle fbq throwing an error gracefully', () => {
      // Make fbq throw an error
      mockFbq.mockImplementation(() => {
        throw new Error('Meta tracking error')
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(() => {
        trackMetaEvent('PageView', { param: 'value' })
      }).not.toThrow()

      expect(consoleWarnSpy).toHaveBeenCalledWith('Meta Pixel tracking error:', expect.any(Error))

      consoleWarnSpy.mockRestore()
    })

    it('should track CompleteRegistration events', () => {
      trackMetaEvent('CompleteRegistration', {
        method: 'google',
        is_new_user: true
      })

      expect(mockFbq).toHaveBeenCalledWith('track', 'CompleteRegistration', {
        method: 'google',
        is_new_user: true
      })
    })

    it('should track Purchase events', () => {
      trackMetaEvent('Purchase', {
        value: 29.99,
        currency: 'USD',
        tier: 'premium'
      })

      expect(mockFbq).toHaveBeenCalledWith('track', 'Purchase', {
        value: 29.99,
        currency: 'USD',
        tier: 'premium'
      })
    })
  })
})
