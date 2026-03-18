// Google Analytics 4 Provider

import type { AnalyticsProvider, AnalyticsEvent } from './types'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export class GA4Provider implements AnalyticsProvider {
  private measurementId: string

  constructor(measurementId: string) {
    this.measurementId = measurementId
  }

  initialize(): void {
    if (typeof window === 'undefined' || !this.measurementId) return

    // Load gtag.js script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
    document.head.appendChild(script)

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer?.push(arguments)
    }
    
    window.gtag('js', new Date())
    window.gtag('config', this.measurementId, {
      send_page_view: false // We'll handle page views manually
    })
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined' || !window.gtag) return

    try {
      window.gtag('event', event.eventName, {
        ...event.properties,
        timestamp: event.timestamp,
        user_id: event.userId,
        session_id: event.sessionId
      })
    } catch (error) {
      console.warn('GA4 tracking error:', error)
    }
  }

  trackPageView(path: string, title: string): void {
    if (typeof window === 'undefined' || !window.gtag) return

    try {
      window.gtag('config', this.measurementId, {
        page_path: path,
        page_title: title
      })
    } catch (error) {
      console.warn('GA4 page view error:', error)
    }
  }

  identifyUser(userId: string, traits: Record<string, any>): void {
    if (typeof window === 'undefined' || !window.gtag) return

    try {
      window.gtag('config', this.measurementId, {
        user_id: userId,
        user_properties: traits
      })
    } catch (error) {
      console.warn('GA4 identify error:', error)
    }
  }
}
