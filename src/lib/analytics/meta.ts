// Meta Pixel Provider

import type { AnalyticsProvider, AnalyticsEvent } from './types'

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

export class MetaPixelProvider implements AnalyticsProvider {
  private pixelId: string

  constructor(pixelId: string) {
    this.pixelId = pixelId
  }

  initialize(): void {
    if (typeof window === 'undefined' || !this.pixelId) return

    // Load Meta Pixel script
    const script = document.createElement('script')
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${this.pixelId}');
    `
    document.head.appendChild(script)
  }

  trackEvent(event: AnalyticsEvent): void {
    if (typeof window === 'undefined' || !window.fbq) return

    try {
      // Map custom events to Meta standard events
      const standardEvent = this.mapToStandardEvent(event.eventName)
      window.fbq('track', standardEvent, event.properties)
    } catch (error) {
      console.warn('Meta Pixel tracking error:', error)
    }
  }

  trackPageView(path: string, title: string): void {
    if (typeof window === 'undefined' || !window.fbq) return

    try {
      window.fbq('track', 'PageView', {
        page_path: path,
        page_title: title
      })
    } catch (error) {
      console.warn('Meta Pixel page view error:', error)
    }
  }

  identifyUser(userId: string, traits: Record<string, any>): void {
    // Meta Pixel doesn't have a direct identify method
    // User data is tracked through events
  }

  private mapToStandardEvent(eventName: string): string {
    const eventMap: Record<string, string> = {
      'user_signup': 'CompleteRegistration',
      'service_inquiry': 'Lead',
      'service_view': 'ViewContent',
      'lead_captured': 'Lead',
      'content_view': 'ViewContent',
      'content_share': 'Share',
      'service_purchased': 'Purchase'
    }

    return eventMap[eventName] || eventName
  }
}
