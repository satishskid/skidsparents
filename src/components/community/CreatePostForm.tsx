// Forum post creation form component
import { useState } from 'react'

interface Props {
  groupId: string
  onSuccess?: (post: any) => void
}

export default function CreatePostForm({ groupId, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const titleError = title.length > 200 ? 'Title must be 200 characters or less' : null
  const contentError = content.length > 5000 ? 'Content must be 5000 characters or less' : null
  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !titleError && !contentError

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, title: title.trim(), content: content.trim(), isAnonymous }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error || 'Failed to create post')
      }

      const data = await res.json() as { post: any }
      setTitle('')
      setContent('')
      setIsAnonymous(false)
      setSubmitted(true)
      onSuccess?.(data.post)
    } catch (e: unknown) {
      setError(e instanceof Error ? (e.message || 'Something went wrong') : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Start a Discussion</h3>

      {submitted && (
        <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          Your post has been submitted and is awaiting review.
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
      )}

      <div>
        <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-gray-400 font-normal">({title.length}/200)</span>
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={200}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
      </div>

      <div>
        <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
          Content <span className="text-gray-400 font-normal">({content.length}/5000)</span>
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your experience, question, or tip..."
          rows={4}
          maxLength={5000}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          required
        />
        {contentError && <p className="text-xs text-red-500 mt-1">{contentError}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="post-anonymous"
          type="checkbox"
          checked={isAnonymous}
          onChange={e => setIsAnonymous(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="post-anonymous" className="text-sm text-gray-600">
          Post anonymously
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="w-full py-2.5 px-4 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Posting...' : 'Post to Community'}
      </button>
    </form>
  )
}
