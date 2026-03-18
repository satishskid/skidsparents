// Analytics types and interfaces

export interface AnalyticsEvent {
  eventName: string
  properties: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
}

export interface AnalyticsProvider {
  initialize(): void
  trackEvent(event: AnalyticsEvent): void
  identifyUser(userId: string, traits: Record<string, any>): void
  trackPageView(path: string, title: string): void
}

export interface AnalyticsConfig {
  ga4MeasurementId?: string
  metaPixelId?: string
  postHogApiKey?: string
  enabled: boolean
}
