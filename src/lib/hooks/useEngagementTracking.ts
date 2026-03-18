// useEngagementTracking — tracks view duration using the Page Visibility API
// Sends a content_view event to /api/engagement/track when the user leaves

import { useEffect, useRef } from 'react'

interface TrackingOptions {
  contentType: string
  contentId: string
  /** Optional: fires immediately on mount (default: true) */
  trackOnMount?: boolean
}

export function useEngagementTracking({ contentType, contentId, trackOnMount = true }: TrackingOptions) {
  const startTime = useRef<number>(Date.now())
  const tracked = useRef(false)

  const sendTrack = (durationSeconds: number) => {
    if (tracked.current) return
    tracked.current = true

    const payload = { contentType, contentId, action: 'view', durationSeconds }

    // Use sendBeacon for reliability on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/engagement/track', JSON.stringify(payload))
    } else {
      fetch('/api/engagement/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }
  }

  useEffect(() => {
    startTime.current = Date.now()
    tracked.current = false

    if (trackOnMount) {
      // Track initial view immediately (duration 0)
      fetch('/api/engagement/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentId, action: 'view', durationSeconds: 0 }),
      }).catch(() => {})
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const duration = Math.round((Date.now() - startTime.current) / 1000)
        sendTrack(duration)
      }
    }

    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      sendTrack(duration)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [contentType, contentId])
}
