import { useState, useEffect } from 'react'
import { INTERVENTIONS } from '@/lib/content/interventions'

interface Child {
  id: string
  name: string
  dob: string
  gender?: string
}

interface Recommendation {
  slug: string
  brand: string
  emoji: string
  gradient: string
  message: string
  priority: number
}

function getAgeMonths(dob: string): number {
  const b = new Date(dob)
  const n = new Date()
  return (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth())
}

function getRecommendations(child: Child): Recommendation[] {
  const age = getAgeMonths(child.dob)
  const recs: Recommendation[] = []
  const name = child.name.split(' ')[0]

  // Vision — all children annually
  recs.push({
    slug: 'vision',
    brand: 'SKIDS Vision',
    emoji: '👁️',
    gradient: 'from-amber-500 to-orange-600',
    message: `80% of learning is visual — ${name} should have annual vision screening`,
    priority: age >= 36 ? 10 : 5,
  })

  // Nutrition — especially first 1000 days (0-24mo)
  if (age <= 24) {
    recs.push({
      slug: 'nutrition',
      brand: 'SKIDS Nutrition',
      emoji: '🥗',
      gradient: 'from-green-500 to-emerald-600',
      message: `The first 1,000 days shape ${name}'s lifelong nutrition & brain development`,
      priority: 9,
    })
  } else {
    recs.push({
      slug: 'nutrition',
      brand: 'SKIDS Nutrition',
      emoji: '🥗',
      gradient: 'from-green-500 to-emerald-600',
      message: `Is ${name} getting enough iron, calcium & protein? Take the 3-min nutrition quiz`,
      priority: 4,
    })
  }

  // Symphony — 6mo-5yrs (language development window)
  if (age >= 6 && age <= 60) {
    recs.push({
      slug: 'symphony',
      brand: 'SKIDS Symphony',
      emoji: '🎵',
      gradient: 'from-indigo-500 to-blue-600',
      message: `Language develops through hearing — screen ${name}'s hearing with a fun game`,
      priority: age <= 36 ? 8 : 5,
    })
  }

  // Chatter — developmental therapy ages 6mo-8yrs
  if (age >= 6 && age <= 96) {
    recs.push({
      slug: 'chatter',
      brand: 'SKIDS Chatter',
      emoji: '🗣️',
      gradient: 'from-violet-500 to-purple-600',
      message: `Early support makes the biggest difference — check ${name}'s developmental milestones`,
      priority: age <= 36 ? 7 : 3,
    })
  }

  // Teleconsult — always available
  recs.push({
    slug: 'teleconsult',
    brand: 'SKIDS Teleconsult',
    emoji: '👨‍⚕️',
    gradient: 'from-teal-500 to-cyan-600',
    message: `A quick consult can bring peace of mind — doctor sees ${name}'s full health record`,
    priority: 2,
  })

  // Sort by priority descending, return top 2
  return recs.sort((a, b) => b.priority - a.priority).slice(0, 2)
}

export default function SmartRecommendations({ child }: { child: Child }) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [recs, setRecs] = useState<Recommendation[]>([])

  useEffect(() => {
    // Load dismissed state from localStorage
    const key = `skids-recs-dismissed-${child.id}`
    const stored = localStorage.getItem(key)
    const dismissedList: string[] = stored ? JSON.parse(stored) : []
    setDismissed(dismissedList)

    const all = getRecommendations(child)
    setRecs(all.filter((r) => !dismissedList.includes(r.slug)))
  }, [child.id, child.dob])

  function dismiss(slug: string) {
    const key = `skids-recs-dismissed-${child.id}`
    const updated = [...dismissed, slug]
    setDismissed(updated)
    localStorage.setItem(key, JSON.stringify(updated))
    setRecs((prev) => prev.filter((r) => r.slug !== slug))
  }

  if (recs.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
        Recommended for {child.name.split(' ')[0]}
      </h3>
      {recs.map((rec) => (
        <a
          key={rec.slug}
          href={`/interventions/${rec.slug}`}
          className="group block relative rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all"
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${rec.gradient}`} />
          <div className="pl-5 pr-10 py-3.5 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">{rec.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-900">{rec.brand}</div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.message}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-green-600 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              dismiss(rec.slug)
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            title="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </a>
      ))}
    </div>
  )
}
