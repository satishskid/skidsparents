import { useState, useEffect, type ReactNode } from 'react'
import { analytics } from '@/lib/analytics/manager'
// OnboardingWizard will be created in Task 4
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

interface OnboardingGateProps {
  token: string
  isNew?: boolean       // from session endpoint, optional
  children: ReactNode
}

type GateState = 'loading' | 'show' | 'suppress'

export default function OnboardingGate({ token, isNew, children }: OnboardingGateProps) {
  // Synchronous localStorage fast path — suppress immediately if flag is set
  const localFlagSet =
    typeof window !== 'undefined' &&
    localStorage.getItem('skids_onboarding_complete') === 'true'

  const [gateState, setGateState] = useState<GateState>(localFlagSet ? 'suppress' : 'loading')
  const [parentId, setParentId] = useState<string | null>(null)
  const [trigger, setTrigger] = useState<'new_user' | 'no_children'>('new_user')

  useEffect(() => {
    // Already suppressed via localStorage — skip all API calls
    if (localFlagSet) return

    let cancelled = false

    // 2-second fallback: suppress wizard if APIs haven't resolved
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setGateState('suppress')
    }, 2000)

    const evaluate = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [parentRes, childrenRes] = await Promise.all([
          fetch('/api/parents/me', { headers }),
          fetch('/api/children', { headers }),
        ])

        if (!parentRes.ok || !childrenRes.ok) {
          if (!cancelled) setGateState('suppress')
          return
        }

        const parentData = await parentRes.json() as {
          id: string
          onboarding_completed: boolean
        }
        const childrenData = await childrenRes.json() as { children: unknown[] }

        if (cancelled) return

        clearTimeout(fallbackTimer)

        // Suppress if already completed
        if (parentData.onboarding_completed) {
          setGateState('suppress')
          return
        }

        const shouldShow =
          isNew === true || childrenData.children.length === 0

        if (shouldShow) {
          const resolvedTrigger = isNew === true ? 'new_user' : 'no_children'
          setParentId(parentData.id)
          setTrigger(resolvedTrigger)
          setGateState('show')
        } else {
          setGateState('suppress')
        }
      } catch {
        // Any error → suppress wizard, render children normally
        if (!cancelled) {
          clearTimeout(fallbackTimer)
          setGateState('suppress')
        }
      }
    }

    evaluate()

    return () => {
      cancelled = true
      clearTimeout(fallbackTimer)
    }
  }, [token, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fire analytics event when wizard is shown
  useEffect(() => {
    if (gateState === 'show' && parentId) {
      analytics.trackEvent('onboarding_wizard_started', { parentId, trigger })
    }
  }, [gateState, parentId, trigger])

  // Body scroll lock while wizard is open
  useEffect(() => {
    if (gateState === 'show') {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [gateState])

  const handleComplete = () => {
    setGateState('suppress')
  }

  if (gateState === 'loading') {
    return (
      <>
        {/* Loading skeleton — max 2 s */}
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
          <div className="w-48 h-4 rounded-full bg-gray-100 animate-pulse" />
          <div className="w-32 h-3 rounded-full bg-gray-100 animate-pulse" />
        </div>
        {/* Children rendered behind skeleton so layout is ready */}
        <div className="invisible">{children}</div>
      </>
    )
  }

  if (gateState === 'show') {
    return (
      <>
        {/* Children always rendered — behind overlay on desktop, hidden on mobile */}
        <div className="md:block hidden">{children}</div>
        <OnboardingWizard
          token={token}
          parentId={parentId ?? ''}
          onComplete={handleComplete}
        />
      </>
    )
  }

  // suppress — render children normally
  return <>{children}</>
}
