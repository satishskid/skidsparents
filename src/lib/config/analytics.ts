// Analytics configuration

import type { AnalyticsConfig } from '../analytics/types'

export function getAnalyticsConfig(env: any): AnalyticsConfig {
  return {
    ga4MeasurementId: env.GA4_MEASUREMENT_ID || '',
    metaPixelId: env.META_PIXEL_ID || '',
    postHogApiKey: env.POSTHOG_API_KEY || '',
    enabled: env.MODE !== 'development' // Disable in development
  }
}
