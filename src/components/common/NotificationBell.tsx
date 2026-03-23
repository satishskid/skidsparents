import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  data_json: string
  read: boolean | number
  created_at: string
  actionUrl?: string
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  milestone_reminder:  { label: 'Milestone',  emoji: '🎯', color: 'bg-blue-500'   },
  habit_streak:        { label: 'Habit',       emoji: '🔥', color: 'bg-purple-500' },
  screening_alert:     { label: 'Screening',   emoji: '📋', color: 'bg-orange-500' },
  blog_recommendation: { label: 'Article',     emoji: '📖', color: 'bg-teal-500'   },
  general:             { label: 'Reminder',    emoji: '💡', color: 'bg-green-500'  },
  service_update:      { label: 'Service',     emoji: '🏥', color: 'bg-pink-500'   },
}
const DEFAULT_CONFIG = { label: 'Update', emoji: '🔔', color: 'bg-gray-500' }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getActionUrl(notif: Notification): string {
  try {
    const data = JSON.parse(notif.data_json || '{}')
    return data.actionUrl || notif.actionUrl || '#'
  } catch {
    return '#'
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Fetch notifications on mount
  useEffect(() => {
    const token = localStorage.getItem('firebaseToken') || sessionStorage.getItem('firebaseToken')
    if (!token) return
    setIsLoading(true)
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<{ notifications?: Notification[]; unreadCount?: number }>)
      .then((data) => {
        const d = data as { notifications?: Notification[]; unreadCount?: number }
        setNotifications(d.notifications || [])
        setUnreadCount(d.unreadCount || 0)
      })
      .catch(() => setError('Could not load notifications'))
      .finally(() => setIsLoading(false))
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const markAllRead = async () => {
    const token = localStorage.getItem('firebaseToken') || sessionStorage.getItem('firebaseToken')
    if (token) {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      }).catch(() => {})
    }
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[460px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-green-600 hover:text-green-700"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[380px]">
            {isLoading && (
              <div className="px-4 py-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && error && (
              <p className="text-xs text-gray-400 text-center py-6">{error}</p>
            )}

            {!isLoading && !error && notifications.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No notifications yet</p>
            )}

            {!isLoading && !error && notifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG
              const isUnread = !notif.read || notif.read === 0
              return (
                <a
                  key={notif.id}
                  href={getActionUrl(notif)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                    isUnread ? 'bg-green-50/40' : ''
                  }`}
                >
                  {/* Colored dot + emoji */}
                  <div className="relative shrink-0 mt-0.5">
                    <span className="text-xl">{cfg.emoji}</span>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{timeAgo(notif.created_at)}</span>
                    </div>
                    <p className={`text-sm mt-0.5 leading-snug ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.body}</p>
                  </div>
                </a>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <a
              href="/dashboard/notifications"
              className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center justify-center gap-1"
            >
              View all notifications
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
