import { useState, useEffect } from 'react'
import { auth, signInWithGoogle, signOut, onAuthStateChanged } from '@/lib/firebase/client'
import type { User } from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(async (u) => {
      setUser(u)
      if (u) {
        const t = await u.getIdToken()
        setToken(t)
      } else {
        setToken(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return { user, loading, token, signInWithGoogle, signOut }
}
