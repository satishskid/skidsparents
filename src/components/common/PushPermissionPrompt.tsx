import { useState, useEffect } from 'react'
import { getFcmToken, initFcmForegroundListener } from '@/lib/firebase/fcm-client'

interface Props {
  onboardingCompleted: boolean
  token: string
}

export default function PushPermissionPrompt({ onboardingCompleted, token }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if onboarding not done, Notification API unavailable, or already dismissed
    if (!onboardingCompleted) return
    if (typeof Notification === 'undefined') return
    if (localStorage.getItem('push_permission_dismissed')) return

    if (Notification.permission === 'denied') return

    if (Notification.permission === 'granted') {
      // Already granted — register token silently
      registerToken()
      return
    }

    // Default — show prompt
    setVisible(true)
  }, [onboardingCompleted])

  async function registerToken() {
    try {
      const fcmToken = await getFcmToken()
      if (!fcmToken) return
      await fetch('/api/push/register', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcmToken }),
      })
      initFcmForegroundListener()
    } catch {
      // silently ignore — graceful degradation
    }
  }

  async function handleAllow() {
    setVisible(false)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        await registerToken()
      }
    } catch {
      // silently ignore
    }
  }

  function handleDismiss() {
    localStorage.setItem('push_permission_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
          🔔
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Stay in the loop</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Get notified about milestones, screenings, and health reminders.
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleAllow}
          className="flex-1 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
        >
          Allow Notifications
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
        >
          Not Now
        </button>
      </div>
    </div>
  )
}
