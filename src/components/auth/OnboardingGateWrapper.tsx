import { useAuth } from '@/lib/hooks/useAuth'
import OnboardingGate from '@/components/auth/OnboardingGate'

/**
 * Thin wrapper that resolves the Firebase ID token client-side
 * and mounts OnboardingGate once the token is available.
 * Reads `isNew` from sessionStorage (set by LoginForm after session sync).
 */
export default function OnboardingGateWrapper() {
  const { token, loading } = useAuth()

  if (loading || !token) return null

  const isNew =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('skids_is_new') === 'true'

  return (
    <OnboardingGate token={token} isNew={isNew}>
      <></>
    </OnboardingGate>
  )
}
