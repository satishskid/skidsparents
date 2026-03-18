// Analytics Manager - Central hub for all analytics providers

import type { AnalyticsProvider, AnalyticsEvent, AnalyticsConfig } from './types'
import { GA4Provider } from './ga4'
import { MetaPixelProvider } from './meta'
import { PostHogProvider } from './posthog'

class AnalyticsManager {
  private providers: AnalyticsProvider[] = []
  private sessionId: string
  private userId?: string
  private utmParams: Record<string, string> = {}

  constructor() {
    this.sessionId = this.generateSessionId()
    this.extractUTMParams()
  }

  initialize(config: AnalyticsConfig): void {
    if (!config.enabled) return

    // Initialize GA4
    if (config.ga4MeasurementId) {
      const ga4 = new GA4Provider(config.ga4MeasurementId)
      ga4.initialize()
      this.providers.push(ga4)
    }

    // Initialize Meta Pixel
    if (config.metaPixelId) {
      const meta = new MetaPixelProvider(config.metaPixelId)
      meta.initialize()
      this.providers.push(meta)
    }

    // Initialize PostHog
    if (config.postHogApiKey) {
      const posthog = new PostHogProvider(config.postHogApiKey)
      posthog.initialize()
      this.providers.push(posthog)
    }
  }

  trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        ...this.utmParams // Include UTM parameters in all events
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    }

    this.providers.forEach(provider => {
      try {
        provider.trackEvent(event)
      } catch (error) {
        console.warn(`Provider tracking error:`, error)
      }
    })
  }

  trackPageView(path: string, title: string): void {
    this.providers.forEach(provider => {
      try {
        provider.trackPageView(path, title)
      } catch (error) {
        console.warn(`Provider page view error:`, error)
      }
    })

    // Also track as a regular event for consistency
    this.trackEvent('page_view', {
      page_path: path,
      page_title: title,
      referrer: document.referrer
    })
  }

  identifyUser(userId: string, traits: Record<string, any> = {}): void {
    this.userId = userId

    this.providers.forEach(provider => {
      try {
        provider.identifyUser(userId, traits)
      } catch (error) {
        console.warn(`Provider identify error:`, error)
      }
    })
  }

  private generateSessionId(): string {
    // Check if session ID exists in sessionStorage
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem('analytics_session_id')
      if (existing) return existing

      // Generate new session ID
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
      return sessionId
    }

    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private extractUTMParams(): void {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

    utmKeys.forEach(key => {
      const value = params.get(key)
      if (value) {
        this.utmParams[key] = value
      }
    })

    // Store UTM params in sessionStorage for persistence across pages
    if (Object.keys(this.utmParams).length > 0) {
      sessionStorage.setItem('utm_params', JSON.stringify(this.utmParams))
    } else {
      // Try to retrieve from sessionStorage
      const stored = sessionStorage.getItem('utm_params')
      if (stored) {
        this.utmParams = JSON.parse(stored)
      }
    }
  }

  getUTMParams(): Record<string, string> {
    return { ...this.utmParams }
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager()
