import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'

interface Props {
  orderId: string
}

interface SessionData {
  token: string
  roomName: string
  livekitUrl: string
}

export default function ParentSessionRoom({ orderId }: Props) {
  const { token: authToken, loading: authLoading } = useAuth()
  const [session, setSession] = useState<SessionData | null>(null)
  const [status, setStatus] = useState<'loading' | 'waiting' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading || !authToken) return

    fetch(`/api/session/${orderId}/token`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async r => {
        if (r.status === 409) {
          // Order not in_progress yet
          setStatus('waiting')
          return null
        }
        if (!r.ok) {
          const data = await r.json() as { error?: string }
          throw new Error(data.error || 'Failed to get session token')
        }
        return r.json() as Promise<SessionData>
      })
      .then(data => {
        if (data) {
          setSession(data)
          setStatus('ready')
        }
      })
      .catch(err => {
        setError(err.message || 'Something went wrong')
        setStatus('error')
      })
  }, [authToken, authLoading, orderId])

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75" />
        </div>
        <h2 className="text-white text-xl font-semibold">Waiting for your doctor to start the session...</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Your doctor will join shortly. Please keep this page open.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <a
          href="/orders"
          className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          Back to Orders
        </a>
      </div>
    )
  }

  if (status === 'ready' && session) {
    return (
      <div className="min-h-screen bg-gray-900">
        <LiveKitRoom
          token={session.token}
          serverUrl={session.livekitUrl}
          connect={true}
          style={{ height: '100dvh' }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    )
  }

  return null
}
