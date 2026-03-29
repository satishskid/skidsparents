import { useState, useEffect } from 'react'

interface PendingPost {
  id: string
  title: string
  content: string
  author_name: string
  group_name: string
  created_at: string
  group_id: string
}

interface Group { id: string; name: string }

export default function CommunityModerationPanel() {
  const [posts, setPosts] = useState<PendingPost[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [newPost, setNewPost] = useState({ groupId: '', title: '', content: '' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` }

  async function load() {
    setLoading(true)
    const [postsRes, groupsRes] = await Promise.all([
      fetch('/api/admin/community/posts', { headers }),
      fetch('/api/forum/groups'),
    ])
    if (postsRes.status === 401) { setAuthed(false); setLoading(false); return }
    const pd = await postsRes.json() as { posts: PendingPost[] }
    const gd = await groupsRes.json() as { groups: Group[] }
    setPosts(pd.posts ?? [])
    setGroups(gd.groups ?? [])
    setAuthed(true)
    setLoading(false)
  }

  async function approve(id: string) {
    await fetch(`/api/admin/community/posts/${id}/approve`, { method: 'POST', headers })
    setPosts(p => p.filter(x => x.id !== id))
  }

  async function reject(id: string) {
    await fetch(`/api/admin/community/posts/${id}/reject`, { method: 'POST', headers })
    setPosts(p => p.filter(x => x.id !== id))
  }

  async function createPost() {
    if (!newPost.groupId || !newPost.title || !newPost.content) return
    setCreating(true)
    const res = await fetch('/api/admin/community/posts', {
      method: 'POST', headers,
      body: JSON.stringify(newPost),
    })
    if (res.ok) {
      setMsg('Post created successfully')
      setNewPost({ groupId: '', title: '', content: '' })
    } else {
      setMsg('Failed to create post')
    }
    setCreating(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (!authed) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-4">Community Moderation</h2>
        <input
          type="password"
          placeholder="Admin key"
          value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
        />
        <button onClick={load} className="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-semibold">
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Community Moderation</h2>
        <button onClick={load} className="text-sm text-green-600 underline">Refresh</button>
      </div>

      {/* Pending posts */}
      <section>
        <h3 className="text-base font-semibold mb-3">Pending Posts ({posts.length})</h3>
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No pending posts — all clear!</p>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{post.author_name} · {post.group_name} · {new Date(post.created_at).toLocaleDateString('en-IN')}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approve(post.id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">
                      Approve
                    </button>
                    <button onClick={() => reject(post.id)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create admin post */}
      <section className="bg-gray-50 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-semibold">Create Post (auto-approved)</h3>
        <select value={newPost.groupId} onChange={e => setNewPost(p => ({ ...p, groupId: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
          <option value="">Select group…</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="w-full border rounded-lg px-3 py-2 text-sm" />
        <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} placeholder="Content" rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
        <button onClick={createPost} disabled={creating} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {creating ? 'Creating…' : 'Create Post'}
        </button>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
      </section>
    </div>
  )
}
