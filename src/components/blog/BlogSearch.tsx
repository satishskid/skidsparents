/**
 * BlogSearch — semantic search over blog articles via Vectorize RAG
 *
 * Replaces/augments the basic keyword search on /blog with AI-powered
 * semantic search. Shows results in a dropdown as user types.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

interface SearchResult {
  blogId: string
  title: string
  category: string
  author: string
  snippet: string
  score: number
  thumbnail?: string
}

const categoryColors: Record<string, string> = {
  'Mental Health': 'bg-purple-100 text-purple-700',
  'Parental Guidance': 'bg-pink-100 text-pink-700',
  'Physical Health': 'bg-green-100 text-green-700',
  'Nutrition & Diet': 'bg-orange-100 text-orange-700',
  'Kids Vision': 'bg-amber-100 text-amber-700',
  'Wellness': 'bg-teal-100 text-teal-700',
  'Child Development': 'bg-blue-100 text-blue-700',
}

export default function BlogSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/blog/search?q=${encodeURIComponent(q)}&limit=5`)
      if (res.ok) {
        const data = await res.json() as { results: SearchResult[] }
        setResults(data.results || [])
        setOpen(data.results.length > 0)
      }
    } catch {
      // Silent fail — user can still use keyword search
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 400)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Truncate snippet to ~120 chars
  function truncSnippet(text: string): string {
    if (text.length <= 120) return text
    return text.slice(0, 117) + '...'
  }

  return (
    <div ref={containerRef} className="relative max-w-xl">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search — iron deficiency, bedwetting, ADHD signs..."
          className="w-full pl-11 pr-10 py-3 rounded-full border border-gray-200 bg-gray-50/60 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>

        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-2 border-b border-gray-50">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              AI-matched articles
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {results.map((r) => (
              <a
                key={r.blogId}
                href={`/blog/${r.blogId}`}
                className="flex gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                {r.thumbnail && (
                  <img
                    src={r.thumbnail}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {r.category && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${categoryColors[r.category] || 'bg-gray-100 text-gray-500'} uppercase tracking-wider`}>
                        {r.category}
                      </span>
                    )}
                    <span className="text-[9px] text-gray-300">
                      {Math.round(r.score * 100)}% match
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {r.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {truncSnippet(r.snippet)}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Footer — fallback to keyword search */}
          <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
            <a
              href={`/blog?q=${encodeURIComponent(query)}`}
              className="text-xs text-green-600 font-medium hover:text-green-700"
            >
              See all results for "{query}" →
            </a>
          </div>
        </div>
      )}

      {/* No results state */}
      {open && query.length >= 3 && !loading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 z-50">
          <p className="text-sm text-gray-500 text-center">
            No matching articles found. Try different keywords.
          </p>
          <a
            href={`/blog?q=${encodeURIComponent(query)}`}
            className="block text-center text-xs text-green-600 font-medium mt-2 hover:text-green-700"
          >
            Try keyword search →
          </a>
        </div>
      )}
    </div>
  )
}
