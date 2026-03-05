import { useAuth } from '@/lib/hooks/useAuth'

export default function NavbarUser() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
      >
        Sign In
      </a>
    )
  }

  return (
    <a href="/me" className="flex items-center gap-2 group">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt=""
          className="w-7 h-7 rounded-full border-2 border-green-200 group-hover:border-green-400 transition-colors"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
          {user.displayName?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
      <span className="hidden lg:inline text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
        {user.displayName?.split(' ')[0] || 'Profile'}
      </span>
    </a>
  )
}
