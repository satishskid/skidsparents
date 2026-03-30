// G4 (Google Analytics 4) and Meta Pixel tracking helper utilities

import { getUTMParams } from './utm'

/**
 * Google Analytics gtag function type definition
 * Meta Pixel fbq function type definition
 */
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
    fbq?: (
      command: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: Record<string, any>
    ) => void
  }
}

/**
 * Event parameters for type-safe tracking
 */
export interface TrackEventParams {
  [key: string]: string | number | boolean | undefined
}

/**
 * Track a custom event with Google Analytics 4
 * 
 * Automatically includes UTM parameters from sessionStorage in all events.
 * 
 * @param eventName - The name of the event to track (e.g., 'sign_in_prompt_view', 'page_view')
 * @param params - Optional parameters to include with the event
 * 
 * @example
 * ```typescript
 * trackEvent('sign_in_prompt_view', {
 *   prompt_type: 'chat',
 *   page: '/timeline',
 *   feature: 'dr_skids_chat'
 * })
 * ```
 */
export function trackEvent(eventName: string, params: TrackEventParams = {}): void {
  if (typeof window === 'undefined' || !window.gtag) {
    // Silently fail if gtag is not available (SSR or blocked)
    return
  }

  try {
    // Get UTM parameters and merge with event params
    const utmParams = getUTMParams()
    const enrichedParams = { ...params, ...utmParams }
    
    window.gtag('event', eventName, enrichedParams)
  } catch (error) {
    console.warn('G4 tracking error:', error)
  }
}

/**
 * Track a custom event with Meta Pixel
 * 
 * Automatically includes UTM parameters from sessionStorage in all events.
 * 
 * @param eventName - The name of the event to track (e.g., 'PageView', 'SignInPromptView', 'CompleteRegistration')
 * @param params - Optional parameters to include with the event
 * 
 * @example
 * ```typescript
 * trackMetaEvent('SignInPromptView', {
 *   prompt_type: 'chat',
 *   page: '/timeline',
 *   feature: 'dr_skids_chat'
 * })
 * ```
 */
export function trackMetaEvent(eventName: string, params: TrackEventParams = {}): void {
  if (typeof window === 'undefined' || !window.fbq) {
    // Silently fail if fbq is not available (SSR or blocked)
    return
  }

  try {
    // Get UTM parameters and merge with event params
    const utmParams = getUTMParams()
    const enrichedParams = { ...params, ...utmParams }
    
    window.fbq('track', eventName, enrichedParams)
  } catch (error) {
    console.warn('Meta Pixel tracking error:', error)
  }
}
