import { useEffect, useRef } from 'react'
import { analytics } from '@/lib/analytics/manager'

interface CelebrationProps {
  token: string
  childId: string
  childName: string
  milestoneLogged: boolean
  milestoneTitle?: string | null
  habitLogged: boolean
  habitName?: string | null
  onDone: () => void
}

const CONFETTI_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function CelebrationScreen({
  token,
  childId,
  childName,
  milestoneLogged,
  milestoneTitle,
  habitLogged,
  habitName,
  onDone,
}: CelebrationProps) {
  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const patchAttempted = useRef(false)

  useEffect(() => {
    if (patchAttempted.current) return
    patchAttempted.current = true

    const patch = async () => {
      try {
        const res = await fetch('/api/parents/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ onboarding_completed: true }),
        })
        if (!res.ok) throw new Error('patch failed')
      } catch {
        // retry once after 3s in background
        setTimeout(async () => {
          try {
            await fetch('/api/parents/me', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ onboarding_completed: true }),
            })
          } catch {
            // best-effort, ignore
          }
        }, 3000)
      }
    }

    patch()
    localStorage.setItem('skids_onboarding_complete', 'true')
    analytics.trackEvent('onboarding_wizard_completed', { childId, milestoneLogged, habitLogged })

    const redirectTimer = setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2500)

    return () => clearTimeout(redirectTimer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Generate confetti pieces once (stable across renders)
  const confettiPieces = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${randomBetween(0, 100)}%`,
    rotation: randomBetween(0, 360),
    delay: `${randomBetween(0, 1.5).toFixed(2)}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-10 gap-6 relative overflow-hidden">
      {/* Confetti */}
      {!reducedMotion && (
        <>
          <style>{`
            @keyframes confetti-fall {
              0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
          {confettiPieces.map((p) => (
            <span
              key={p.id}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-10px',
                left: p.left,
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
                animation: `confetti-fall 2s ease-in ${p.delay} forwards`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </>
      )}

      {/* Animated checkmark */}
      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
        <svg
          viewBox="0 0 52 52"
          width="40"
          height="40"
          fill="none"
          aria-hidden="true"
        >
          <polyline
            points="14,27 22,35 38,19"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              reducedMotion
                ? undefined
                : {
                    strokeDasharray: 40,
                    strokeDashoffset: 0,
                    animation: 'checkmark-draw 600ms ease-out forwards',
                  }
            }
          />
          {!reducedMotion && (
            <style>{`
              @keyframes checkmark-draw {
                from { stroke-dashoffset: 40; }
                to   { stroke-dashoffset: 0; }
              }
            `}</style>
          )}
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 text-center">
        You're all set for {childName}! 🎉
      </h1>

      {/* Summary block */}
      <div className="bg-green-50 rounded-2xl p-4 text-sm text-gray-700 w-full max-w-sm flex flex-col gap-2">
        <p>✅ Added {childName}'s profile</p>
        {milestoneLogged && milestoneTitle && (
          <p>🏆 Logged milestone: {milestoneTitle}</p>
        )}
        {habitLogged && habitName && (
          <p>💪 Logged habit: {habitName}</p>
        )}
      </div>
    </div>
  )
}
