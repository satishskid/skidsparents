import { useState, useRef } from 'react'

interface UploadDialogProps {
  childId: string
  token: string
  onClose: () => void
  onUploaded: () => void
}

type Step = 'capture' | 'processing' | 'review' | 'done'

interface ExtractedData {
  recordType: string
  title: string
  providerName: string | null
  recordDate: string | null
  summary: string
  confidence: number
  findings: { name: string; value?: string; unit?: string; status?: string }[]
}

const RECORD_TYPES = [
  { key: 'doctor_visit', label: 'Doctor Visit', emoji: '🩺' },
  { key: 'lab_test', label: 'Lab Test', emoji: '🧪' },
  { key: 'vaccination', label: 'Vaccination', emoji: '💉' },
  { key: 'prescription', label: 'Prescription', emoji: '💊' },
  { key: 'dental', label: 'Dental', emoji: '🦷' },
  { key: 'eye_checkup', label: 'Eye Checkup', emoji: '👁️' },
  { key: 'screening', label: 'Screening', emoji: '📋' },
  { key: 'general', label: 'General', emoji: '📄' },
]

export default function UploadDialog({ childId, token, onClose, onUploaded }: UploadDialogProps) {
  const [step, setStep] = useState<Step>('capture')
  const [hint, setHint] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editType, setEditType] = useState('general')
  const [editProvider, setEditProvider] = useState('')
  const [editDate, setEditDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (f: File) => {
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setStep('processing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('childId', childId)
      if (hint.trim()) formData.append('hint', hint.trim())

      const res = await fetch('/api/records/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error || `Upload failed (${res.status})`)
      }

      const data = await res.json() as { extracted?: ExtractedData | null }
      const ext = data.extracted ?? null

      if (ext) {
        setExtracted(ext)
        setEditTitle(ext.title)
        setEditType(ext.recordType)
        setEditProvider(ext.providerName || '')
        setEditDate(ext.recordDate || new Date().toISOString().split('T')[0])
        setStep('review')
      } else {
        // No AI extraction (e.g., PDF) — go straight to done
        setStep('done')
        setTimeout(() => {
          onUploaded()
          onClose()
        }, 1500)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? (e.message || 'Upload failed') : 'Upload failed')
      setStep('capture')
    }
  }

  const handleConfirm = () => {
    setStep('done')
    setTimeout(() => {
      onUploaded()
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {step === 'capture' && 'Add Record'}
            {step === 'processing' && 'Analyzing...'}
            {step === 'review' && 'Review Extraction'}
            {step === 'done' && 'Done!'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* ─── Step 1: Capture ─── */}
          {step === 'capture' && (
            <>
              {/* File preview */}
              {preview && (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-xl bg-gray-50" />
                  <button
                    onClick={() => { setFile(null); setPreview(null) }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {!file && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const input = fileRef.current
                      if (input) { input.accept = 'image/*'; input.capture = 'environment'; input.click() }
                    }}
                    className="flex-1 py-8 rounded-xl border-2 border-dashed border-green-200 bg-green-50 text-center hover:border-green-400 transition-colors"
                  >
                    <span className="block text-3xl mb-1">📷</span>
                    <span className="text-sm font-medium text-green-700">Take Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      const input = fileRef.current
                      if (input) { input.accept = 'image/*,application/pdf'; input.removeAttribute('capture'); input.click() }
                    }}
                    className="flex-1 py-8 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 text-center hover:border-blue-400 transition-colors"
                  >
                    <span className="block text-3xl mb-1">📁</span>
                    <span className="text-sm font-medium text-blue-700">Upload File</span>
                  </button>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileSelect(f)
                }}
              />

              {/* Hint input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  What is this? (optional — helps AI read it better)
                </label>
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="e.g., blood test from Apollo Hospital"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              {file && (
                <button
                  onClick={handleUpload}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  Upload & Analyze
                </button>
              )}

              {file && (
                <p className="text-xs text-gray-400 text-center">
                  {file.name} ({(file.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </>
          )}

          {/* ─── Step 2: Processing ─── */}
          {step === 'processing' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-green-200 border-t-green-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm font-medium text-gray-700">Dr. SKIDS is reading your document...</p>
              <p className="text-xs text-gray-400 mt-1">This usually takes a few seconds</p>
            </div>
          )}

          {/* ─── Step 3: Review ─── */}
          {step === 'review' && extracted && (
            <>
              {extracted.confidence > 0 && (
                <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                  extracted.confidence > 0.7 ? 'bg-green-50 text-green-700' :
                  extracted.confidence > 0.4 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  AI Confidence: {Math.round(extracted.confidence * 100)}%
                  {extracted.confidence < 0.5 && ' — please verify the extracted details'}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Record Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                  >
                    {RECORD_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                  <input
                    type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Provider</label>
                    <input
                      type="text" value={editProvider} onChange={(e) => setEditProvider(e.target.value)}
                      placeholder="Hospital / Doctor"
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input
                      type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                    />
                  </div>
                </div>

                {extracted.findings.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Findings</label>
                    <div className="space-y-1">
                      {extracted.findings.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                          <span className="font-medium text-gray-700">{f.name}</span>
                          {f.value && <span className="text-gray-500">: {f.value}{f.unit ? ` ${f.unit}` : ''}</span>}
                          {f.status && (
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                              f.status === 'normal' ? 'bg-green-100 text-green-700' :
                              f.status === 'abnormal' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {f.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {extracted.summary && (
                  <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                    {extracted.summary}
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                Confirm & Add to Record
              </button>
            </>
          )}

          {/* ─── Step 4: Done ─── */}
          {step === 'done' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center text-3xl">
                ✓
              </div>
              <p className="text-sm font-medium text-gray-700">Added to your child's health record!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
