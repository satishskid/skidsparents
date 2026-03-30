import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { captureUTMParams, getUTMParams } from './utm'

describe('UTM Parameter Utilities', () => {
  let mockSessionStorage: { [key: string]: string }
  let originalWindow: any

  beforeEach(() => {
    // Save original window
    originalWindow = global.window
    
    // Create mock sessionStorage
    mockSessionStorage = {}
    
    // Set up global window object with sessionStorage and location
    global.window = {
      location: { search: '' },
      sessionStorage: {
        getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockSessionStorage[key] = value
        }),
        clear: vi.fn(() => {
          mockSessionStorage = {}
        })
      }
    } as any
  })

  afterEach(() => {
    // Restore original window
    global.window = originalWindow
    
    // Clean up
    vi.restoreAllMocks()
  })

  describe('captureUTMParams', () => {
    it('should capture all UTM parameters from URL', () => {
      global.window.location = {
        search: '?utm_source=google&utm_medium=cpc&utm_campaign=summer&utm_term=health&utm_content=ad1&ref=ABC123'
      } as any

      const params = captureUTMParams()

      expect(params).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer',
        utm_term: 'health',
        utm_content: 'ad1',
        referral_code: 'ABC123'
      })
    })

    it('should handle missing UTM parameters', () => {
      global.window.location = { search: '?utm_source=facebook' } as any

      const params = captureUTMParams()

      expect(params).toEqual({
        utm_source: 'facebook',
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        referral_code: null
      })
    })

    it('should handle empty URL parameters', () => {
      global.window.location = { search: '' } as any

      const params = captureUTMParams()

      expect(params).toEqual({
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: null,
        referral_code: null
      })
    })

    it('should store parameters in sessionStorage', () => {
      global.window.location = {
        search: '?utm_source=twitter&utm_campaign=launch'
      } as any

      captureUTMParams()

      expect(global.window.sessionStorage.setItem).toHaveBeenCalledWith(
        'utm_params',
        expect.stringContaining('twitter')
      )
      
      const stored = mockSessionStorage['utm_params']
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored)
      expect(parsed.utm_source).toBe('twitter')
      expect(parsed.utm_campaign).toBe('launch')
    })

    it('should handle sessionStorage errors gracefully', () => {
      global.window.location = { search: '?utm_source=test' } as any
      
      // Mock sessionStorage.setItem to throw an error
      const setItemMock = vi.fn(() => {
        throw new Error('Storage quota exceeded')
      })
      global.window.sessionStorage.setItem = setItemMock

      // Should not throw, but log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const params = captureUTMParams()
      
      expect(params.utm_source).toBe('test')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to store UTM parameters:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getUTMParams', () => {
    it('should retrieve stored UTM parameters', () => {
      const testParams = {
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'awareness',
        utm_term: null,
        utm_content: null,
        referral_code: 'XYZ789'
      }

      mockSessionStorage['utm_params'] = JSON.stringify(testParams)

      const params = getUTMParams()

      expect(params).toEqual(testParams)
    })

    it('should return empty object when no parameters stored', () => {
      const params = getUTMParams()

      expect(params).toEqual({})
    })

    it('should handle corrupted sessionStorage data', () => {
      mockSessionStorage['utm_params'] = 'invalid json{'

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const params = getUTMParams()

      expect(params).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to retrieve UTM parameters:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle sessionStorage access errors', () => {
      const getItemMock = vi.fn(() => {
        throw new Error('Storage access denied')
      })
      global.window.sessionStorage.getItem = getItemMock

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const params = getUTMParams()

      expect(params).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to retrieve UTM parameters:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('persistence across navigation', () => {
    it('should persist parameters after capture', () => {
      global.window.location = {
        search: '?utm_source=email&utm_campaign=newsletter&ref=NEWS123'
      } as any

      // Capture on first page
      captureUTMParams()

      // Simulate navigation by changing URL
      global.window.location = { search: '' } as any

      // Retrieve on second page
      const params = getUTMParams()

      expect(params).toEqual({
        utm_source: 'email',
        utm_medium: null,
        utm_campaign: 'newsletter',
        utm_term: null,
        utm_content: null,
        referral_code: 'NEWS123'
      })
    })
  })
})
