import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import ChildRegistration from './ChildRegistration'
import ReferralBanner from './ReferralBanner'
import ChatWidget from '@/components/chat/ChatWidget'
import SubscriptionCard from '@/components/subscription/SubscriptionCard'

interface Child {
  id: string
  name: string
  dob: string
  gender?: string
  blood_group?: string
  allergies_json?: string
}

export default function UserProfile() {
  const { user, loading, token, signOut } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [loadingChildren, setLoadingChildren] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [onboardingChildId, setOnboardingChildId] = useState<string | null>(null)
  const [stats, setStats] = useState({ milestones: 0, habits: 0 })

  const fetchChildren = useCallback(async () => {
    if (!token) return
    setLoadingChildren(true)
    try {
      const res = await fetch('/api/children', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        // API returns full Child rows; cast to Child[] to satisfy the state type
        const data = await res.json() as { children?: Child[] }
        const list = data.children || []
        setChildren(list)
        fetchStats(list)
      }
    } catch {} finally {
      setLoadingChildren(false)
    }
  }, [token])

  const fetchStats = useCallback(async (childrenList: Child[]) => {
    if (!token || childrenList.length === 0) return
    let mTotal = 0
    let hTotal = 0
    for (const child of childrenList) {
      try {
        const [mRes, hRes] = await Promise.all([
          fetch(`/api/milestones?childId=${child.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/habits?childId=${child.id}&days=30`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (mRes.ok) {
          const mData = await mRes.json() as { milestones?: { status: string }[] }
          mTotal += (mData.milestones || []).filter((m) => m.status === 'achieved').length
        }
        if (hRes.ok) {
          const hData = await hRes.json() as { habits?: unknown[] }
          hTotal += (hData.habits || []).length
        }
      } catch {}
    }
    setStats({ milestones: mTotal, habits: hTotal })
  }, [token])

  useEffect(() => {
    if (token) fetchChildren()
  }, [token, fetchChildren])

  function getAge(dob: string): string {
    const birth = new Date(dob)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (months < 1) return 'Newborn'
    if (months < 12) return `${months} mo`
    const years = Math.floor(months / 12)
    const rem = months % 12
    return rem > 0 ? `${years}y ${rem}mo` : `${years}y`
  }

  function handleLogout() {
    signOut()
    window.location.href = '/'
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-2xl p-6 animate-pulse h-28" />
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          <div className="bg-gray-100 rounded-xl h-20 animate-pulse" />
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg shadow-green-500/20">
            S
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Track Your Child's Health</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to save milestones, track habits, and get personalized guidance.</p>
          <a
            href="/login?redirect=/me"
            className="mt-4 inline-block w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors text-center"
          >
            Sign In to Get Started
          </a>
        </div>

        <MenuItems />
      </div>
    )
  }

  // Logged in
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-16 h-16 rounded-2xl shadow-lg shadow-green-500/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-500/20">
              {user.displayName?.[0]?.toUpperCase() || 'P'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{user.displayName || 'Parent'}</h1>
            <p className="text-sm text-gray-500 truncate">{user.email || user.phoneNumber || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full py-2 px-4 rounded-xl bg-white text-red-600 text-sm font-medium border border-red-100 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Subscription */}
      {token && <SubscriptionCard token={token} />}

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">My Children</h2>
          <button
            onClick={() => setShowAddChild(true)}
            className="text-xs font-semibold text-green-600 hover:text-green-700"
          >
            + Add Child
          </button>
        </div>

        {loadingChildren ? (
          <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-20" />
        ) : children.length > 0 ? (
          <div className="space-y-2">
            {children.map((child) => (
              <a key={child.id} href={`/child/${child.id}`} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-lg">
                  {child.gender === 'male' ? '👦' : child.gender === 'female' ? '👧' : '🧒'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{child.name}</div>
                  <div className="text-xs text-gray-500">{getAge(child.dob)}</div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </a>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setShowAddChild(true)}
            className="w-full py-6 rounded-xl border-2 border-dashed border-gray-200 text-center hover:border-green-300 hover:bg-green-50/50 transition-colors"
          >
            <div className="text-2xl mb-1">👶</div>
            <div className="text-sm font-medium text-gray-700">Add Your First Child</div>
            <div className="text-xs text-gray-400 mt-0.5">Start tracking their health journey</div>
          </button>
        )}
      </div>

      {/* Referral Banner */}
      <ReferralBanner />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">{children.length}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wide">Children</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.milestones}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wide">Milestones</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.habits}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wide">Habits Tracked</div>
        </div>
      </div>

      <MenuItems />

      {/* App Info */}
      <div className="text-center text-xs text-gray-400 pt-2">
        <p>SKIDS Parent v2.0</p>
        <p className="mt-1">Evidence-based child health for modern parents</p>
      </div>

      {/* Add Child Modal */}
      {showAddChild && token && (
        <ChildRegistration
          token={token}
          onComplete={async (childId: string) => {
            setShowAddChild(false)
            fetchChildren()
            // Check if child has any observations — if not, trigger onboarding
            try {
              const res = await fetch(`/api/observations?childId=${childId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              const data = res.ok ? await res.json() as { observations?: unknown[] } : { observations: [] }
              if (!data.observations?.length) {
                setOnboardingChildId(childId)
              }
            } catch {
              setOnboardingChildId(childId)
            }
          }}
          onClose={() => setShowAddChild(false)}
        />
      )}

      {onboardingChildId && token && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md h-[75vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">S</div>
                <div>
                  <div className="text-sm font-bold">Dr. SKIDS</div>
                  <div className="text-[10px] text-white/70">Building your child's health record</div>
                </div>
              </div>
              <button
                onClick={() => setOnboardingChildId(null)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatWidget
                fullScreen={true}
                token={token}
                childId={onboardingChildId}
                mode="onboarding"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItems() {
  const items = [
    { href: '/timeline', icon: 'chat', color: 'green', label: 'Health Timeline', desc: 'Chat with Dr. SKIDS & view records' },
    { href: '/discover', icon: 'book', color: 'blue', label: 'Discover', desc: 'Explore organs, habits & guides' },
    { href: '/interventions', icon: 'store', color: 'purple', label: 'Interventions', desc: 'Vision, nutrition, therapy & more' },
    { href: '/about', icon: 'info', color: 'amber', label: 'About SKIDS', desc: 'Our mission & approach' },
  ]

  const icons: Record<string, string> = {
    chat: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
    book: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    store: 'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.999 2.999 0 00.74-1.716L4.636 3.13A1.126 1.126 0 015.756 2.25h12.489a1.126 1.126 0 011.12.879l.895 4.503a2.999 2.999 0 00.74 1.717',
    info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  }

  const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'group-hover:bg-green-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'group-hover:bg-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'group-hover:bg-purple-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', hover: 'group-hover:bg-amber-100' },
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-3">Quick Links</h2>
      {items.map((item) => {
        const c = colorMap[item.color]
        return (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center ${c.text} ${c.hover} transition-colors`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icons[item.icon]} />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        )
      })}
    </div>
  )
}
