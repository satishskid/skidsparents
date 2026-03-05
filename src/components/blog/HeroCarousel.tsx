import { useState, useEffect, useCallback } from 'react'

interface FeaturedBlog {
  title: string
  thumbnail: string
  category: string
  author: string
  link: string
}

export default function HeroCarousel({ blogs }: { blogs: FeaturedBlog[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % blogs.length)
  }, [blogs.length])

  useEffect(() => {
    if (paused || blogs.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [paused, next, blogs.length])

  if (!blogs.length) return null

  const blog = blogs[active]

  return (
    <section
      className="relative w-full h-[75vh] sm:h-[65vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images (all preloaded, opacity-toggled) */}
      {blogs.map((b, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <img
            src={b.thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16 max-w-4xl">
        {/* Category pill */}
        <span className="inline-flex self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider mb-3">
          {blog.category}
        </span>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
          {blog.title}
        </h1>

        {/* Author */}
        <p className="text-white/70 text-sm mb-6">
          by {blog.author}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a
            href={blog.link}
            target={blog.link.startsWith('http') ? '_blank' : undefined}
            rel={blog.link.startsWith('http') ? 'noopener' : undefined}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
          >
            Read Now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2">
        {blogs.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === active ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
