/**
 * FCM foreground client — registers an onMessage listener and dispatches
 * 'skids:push-received' CustomEvents for the NotificationBell to consume.
 *
 * Safe to call multiple times — a module-level guard prevents duplicate listeners.
 */

// VAPID key — set to your FCM web push certificate public key
const VAPID_KEY = import.meta.env.PUBLIC_VAPID_KEY ?? ''

let _listenerRegistered = false

/**
 * Initialises the foreground FCM listener once per session.
 * Dispatches 'skids:push-received' CustomEvent with the FCM payload on each message.
 */
export function initFcmForegroundListener(): void {
  if (_listenerRegistered) return
  _listenerRegistered = true

  // Dynamic import to avoid SSR issues
  import('firebase/messaging').then(({ getMessaging, onMessage }) => {
    import('firebase/app').then(({ getApp }) => {
      try {
        const messaging = getMessaging(getApp())
        onMessage(messaging, (payload) => {
          window.dispatchEvent(new CustomEvent('skids:push-received', { detail: payload }))
        })
      } catch (err) {
        console.warn('[fcm-client] foreground listener init failed:', err)
        _listenerRegistered = false
      }
    })
  }).catch((err) => {
    console.warn('[fcm-client] firebase/messaging import failed:', err)
    _listenerRegistered = false
  })
}

/**
 * Requests an FCM registration token using the VAPID key.
 * Returns null if permission is not granted or FCM is unavailable.
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const { getMessaging, getToken } = await import('firebase/messaging')
    const { getApp } = await import('firebase/app')
    const messaging = getMessaging(getApp())
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    return token || null
  } catch (err) {
    console.warn('[fcm-client] getFcmToken failed:', err)
    return null
  }
}
