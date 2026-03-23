import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface Provider {
  id: string
  name: string
  type: string
  city: string | null
  specializations_json: string | null
  contact_email: string | null
  contact_phone: string | null
  commission_pct: number
  status: string
  medical_reg_number: string | null
}

interface Credential {
  id: string
  file_url: string
  file_type: string
  doc_type: string
  uploaded_at: string
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending_review: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-600',
}

const DOC_TYPES = [
  'medical_degree',
  'registration_certificate',
  'identity_proof',
  'address_proof',
  'specialization_certificate',
  'other',
]

export default function ProviderProfile() {
  const { token, loading: authLoading } = useAuth()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [docType, setDocType] = useState(DOC_TYPES[0])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const authH = () => ({ Authorization: `Bearer ${token}` })

  useEffect(() => {
    if (authLoading || !token) return
    fetch('/api/provider/me', { headers: authH() })
      .then(r => r.json() as Promise<{ provider: Provider & { credentials?: Credential[] } }>)
      .then(d => {
        setProvider(d.provider || null)
        setCredentials(d.provider?.credentials || [])
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [token, authLoading])

  const uploadCredential = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || uploading) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('docType', docType)
      const res = await fetch('/api/provider/credentials', {
        method: 'POST',
        headers: authH(),
        body: fd,
      })
      const d = await res.json() as { credentialId?: string; fileUrl?: string; error?: string }
      if (!res.ok) throw new Error(d.error || 'Upload failed')
      const newCred: Credential = {
        id: d.credentialId!,
        file_url: d.fileUrl!,
        file_type: file.type === 'application/pdf' ? 'pdf' : 'image',
        doc_type: docType,
        uploaded_at: new Date().toISOString(),
      }
      setCredentials(prev => [newCred, ...prev])
      if (fileRef.current) fileRef.current.value = ''
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-500 text-sm">{error || 'Profile not found'}</p>
      </div>
    )
  }

  const specializations: string[] = provider.specializations_json
    ? JSON.parse(provider.specializations_json)
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-base font-bold text-gray-900">Profile</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{provider.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{provider.type.replace('_', ' ')}</p>
            </div>
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[provider.status] || 'bg-gray-100 text-gray-600'}`}>
              {provider.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            {[
              { label: 'City', value: provider.city },
              { label: 'Email', value: provider.contact_email },
              { label: 'Phone', value: provider.contact_phone },
              { label: 'Reg. Number', value: provider.medical_reg_number },
              { label: 'Commission', value: `${provider.commission_pct}%` },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex gap-3">
                <span className="text-gray-400 w-28 shrink-0">{label}</span>
                <span className="text-gray-700 font-medium">{value}</span>
              </div>
            ) : null)}

            {specializations.length > 0 && (
              <div className="flex gap-3">
                <span className="text-gray-400 w-28 shrink-0">Specializations</span>
                <div className="flex flex-wrap gap-1.5">
                  {specializations.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credential upload */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Upload Credentials</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {DOC_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">File (PDF or image, max 10MB)</label>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,image/*"
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            <button
              onClick={uploadCredential}
              disabled={uploading}
              className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Existing credentials */}
          {credentials.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-gray-500">Uploaded Documents</p>
              {credentials.map(cred => (
                <div key={cred.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-lg">{cred.file_type === 'pdf' ? '📄' : '🖼️'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 capitalize">{cred.doc_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(cred.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
