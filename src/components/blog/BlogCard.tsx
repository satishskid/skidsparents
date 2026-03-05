interface Props {
  title: string
  thumbnail?: string
  category?: string
  author?: string
  date?: string
  link: string
}

export default function BlogCard({ title, thumbnail, category, author, date, link }: Props) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : undefined

  return (
    <a
      href={link}
      target={link.startsWith('http') ? '_blank' : undefined}
      rel={link.startsWith('http') ? 'noopener' : undefined}
      className="flex-shrink-0 snap-start w-[72vw] sm:w-[280px] lg:w-[300px] group"
    >
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-2.5">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
        )}

        {/* Category pill */}
        {category && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider">
            {category}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 leading-snug">
        {title}
      </h3>

      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
        {author && <span>{author}</span>}
        {author && formattedDate && <span>·</span>}
        {formattedDate && <span>{formattedDate}</span>}
      </div>
    </a>
  )
}
