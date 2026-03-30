/**
 * UTM Parameter Utilities
 * 
 * Captures and preserves UTM parameters and referral codes for attribution tracking
 * throughout the user journey.
 * 
 * Validates: Requirements 10.6
 */

export interface UTMParams {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  referral_code?: string | null
}

const UTM_STORAGE_KEY = 'utm_params'

/**
 * Captures UTM parameters from the current URL and stores them in sessionStorage
 * for persistence across navigation.
 * 
 * @returns The captured UTM parameters
 */
export function captureUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return {}
  }

  const params = new URLSearchParams(window.location.search)
  
  const utmParams: UTMParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    referral_code: params.get('ref')
  }
  
  // Store in sessionStorage for persistence
  try {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams))
  } catch (error) {
    console.error('Failed to store UTM parameters:', error)
  }
  
  return utmParams
}

/**
 * Retrieves previously captured UTM parameters from sessionStorage.
 * 
 * @returns The stored UTM parameters, or an empty object if none exist
 */
export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const stored = window.sessionStorage.getItem(UTM_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to retrieve UTM parameters:', error)
    return {}
  }
}
