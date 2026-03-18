// PostHog Provider

import type { AnalyticsProvider, AnalyticsEvent } from './types'
import posthog from 'posthog-js'

export class PostHogProvider implements AnalyticsProvider {
  private apiKey: string
  private initialized = false

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  initialize(): void {
    if (typeof window === 'undefined' || !this.apiKey || this.initialized) return

    try {
      posthog.init(this.apiKey, {
        api_host: 'https://app.posthog.com',
        autocapture: true,
        capture_pageview: false, // We'll handle page views manually
        capture_pageleave: true,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '[data-sensitive]'
        }
      })
      this.initialized = true
    } catch (error) {
      console.warn('PostHog initialization error:', error)
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined' || !this.initialized) return

    try {
      posthog.capture(event.eventName, {
        ...event.properties,
        timestamp: event.timestamp,
        session_id: event.sessionId
      })
    } catch (error) {
      console.warn('PostHog tracking error:', error)
    }
  }

  trackPageView(path: string, title: string): void {
    if (typeof window === 'undefined' || !this.initialized) return

    try {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_path: path,
        page_title: title
      })
    } catch (error) {
      console.warn('PostHog page view error:', error)
    }
  }

  identifyUser(userId: string, traits: Record<string, any>): void {
    if (typeof window === 'undefined' || !this.initialized) return

    try {
      posthog.identify(userId, traits)
    } catch (error) {
      console.warn('PostHog identify error:', error)
    }
  }
}
