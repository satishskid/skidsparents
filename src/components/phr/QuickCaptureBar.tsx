/**
 * QuickCaptureBar — 2-tap observation capture
 *
 * The daily use component. Always visible, sticky on the dashboard.
 * Tap 1: Select domain (Movement, Speech, Eyes, Eating, Sleep, Health, Mood)
 * Tap 2: Quick status (Great / Okay / Concerned)
 * Optional: Add text note, photo, or video
 *
 * After submit → POST /api/observations → projection fires → AI response shows
 */

import { useState, useCallback, useRef } from 'react'

interface Props {
  childId: string
  childName: string
  token: string
  onObservationSaved?: (result: any) => void
}

const DOMAIN_ICONS = [
  { key: 'motor', emoji: '🏃', label: 'Movement', category: 'Development' },
  { key: 'language', emoji: '🗣', label: 'Speech', category: 'Development' },
  { key: 'vision', emoji: '👁', label: 'Eyes', category: 'Health' },
  { key: 'gi_nutrition', emoji: '🍽', label: 'Eating', category: 'Eating' },
  { key: 'neurological', emoji: '😴', label: 'Sleep', category: 'Health' },
  { key: 'skin', emoji: '🌡', label: 'Health', category: 'Health' },
  { key: 'behavioral', emoji: '😊', label: 'Mood', category: 'Behavior' },
  { key: 'general', emoji: '✨', label: 'Other', category: 'General' },
]

const STATUS_OPTIONS = [
  { key: 'great', emoji: '😊', label: 'Great', concernLevel: 'none', color: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'okay', emoji: '😐', label: 'Okay', concernLevel: 'mild', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { key: 'concerned', emoji: '😟', label: 'Concerned', concernLevel: 'moderate', color: 'bg-red-50 border-red-200 text-red-700' },
]

type Step = 'domain' | 'status' | 'detail' | 'submitting' | 'done'

export default function QuickCaptureBar({ childId, childName, token, onObservationSaved }: Props) {
  const [step, setStep] = useState<Step>('domain')
  const [selectedDomain, setSelectedDomain] = useState<typeof DOMAIN_ICONS[0] | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<typeof STATUS_OPTIONS[0] | null>(null)
  const [noteText, setNoteText] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setStep('domain')
    setSelectedDomain(null)
    setSelectedStatus(null)
    setNoteText('')
    setMediaFile(null)
    setMediaPreview(null)
    setAiResponse(null)
  }, [])

  function handleDomainTap(domain: typeof DOMAIN_ICONS[0]) {
    setSelectedDomain(domain)
    setStep('status')
  }

  function handleStatusTap(status: typeof STATUS_OPTIONS[0]) {
    setSelectedStatus(status)
    setStep('detail')
  }

  function handleMediaSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaFile(file)
    const url = URL.createObjectURL(file)
    setMediaPreview(url)
  }

  async function handleSubmit() {
    if (!selectedDomain || !selectedStatus) return
    setSubmitting(true)
    setStep('submitting')

    try {
      // Build observation text
      const statusText = `${selectedDomain.label}: ${selectedStatus.label}`
      const fullText = noteText.trim()
        ? `${statusText}. ${noteText.trim()}`
        : statusText

      // TODO: If mediaFile exists, upload to R2 first via /api/media/upload
      // const mediaUrl = mediaFile ? await uploadMedia(mediaFile) : null

      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          observationText: fullText,
          category: selectedDomain.category,
          concernLevel: selectedStatus.concernLevel,
          source: 'active',
          // mediaUrl,
          // mediaType: mediaFile?.type.startsWith('video') ? 'video' : 'photo',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiResponse(data.projection || null)
        setStep('done')
        onObservationSaved?.(data)
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      setAiResponse(null)
      setStep('done')
    } finally {
      setSubmitting(false)
    }
  }

  // Quick submit: domain + status → auto-submit without detail step
  async function handleQuickSubmit(domain: typeof DOMAIN_ICONS[0], status: typeof STATUS_OPTIONS[0]) {
    setSelectedDomain(domain)
    setSelectedStatus(status)
    setSubmitting(true)
    setStep('submitting')

    try {
      const text = `${domain.label}: ${status.label}`
      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          observationText: text,
          category: domain.category,
          concernLevel: status.concernLevel,
          source: 'active',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAiResponse(data.projection || null)
        setStep('done')
        onObservationSaved?.(data)
      }
    } catch {} finally {
      setSubmitting(false)
    }
  }

  // ─── STEP 1: Domain selection ───
  if (step === 'domain') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-600 mb-3 font-medium">
          What did you notice about {childName}?
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DOMAIN_ICONS.map((d) => (
            <button
              key={d.key}
              onClick={() => handleDomainTap(d)}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 transition-all active:scale-95"
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className="text-[10px] font-medium text-gray-600">{d.label}</span>
            </button>
          ))}
        </div>

        {/* Photo/Video quick entry */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*'
                fileInputRef.current.click()
              }
            }}
            className="flex-1 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-sm text-gray-600 font-medium transition-all"
          >
            📷 Photo
          </button>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'video/*'
                fileInputRef.current.click()
              }
            }}
            className="flex-1 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-sm text-gray-600 font-medium transition-all"
          >
            🎬 Video
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleMediaSelect}
          />
        </div>
      </div>
    )
  }

  // ─── STEP 2: Status selection ───
  if (step === 'status' && selectedDomain) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setStep('domain')} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-xl">{selectedDomain.emoji}</span>
          <span className="text-sm font-semibold text-gray-700">{selectedDomain.label} — How is it?</span>
        </div>

        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => handleStatusTap(s)}
              className={`flex-1 py-3 rounded-xl border text-center transition-all active:scale-95 ${s.color}`}
            >
              <span className="block text-2xl mb-1">{s.emoji}</span>
              <span className="text-xs font-semibold">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── STEP 3: Optional detail (note + media) ───
  if (step === 'detail' && selectedDomain && selectedStatus) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setStep('status')} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-xl">{selectedDomain.emoji}</span>
          <span className={`text-xl`}>{selectedStatus.emoji}</span>
          <span className="text-sm text-gray-600">{selectedDomain.label} · {selectedStatus.label}</span>
        </div>

        {/* Optional note */}
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={`Optional: Describe what you noticed...`}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 mb-3"
        />

        {/* Media preview */}
        {mediaPreview && (
          <div className="relative mb-3">
            {mediaFile?.type.startsWith('video') ? (
              <video src={mediaPreview} className="w-full h-32 object-cover rounded-xl" />
            ) : (
              <img src={mediaPreview} className="w-full h-32 object-cover rounded-xl" alt="Observation media" />
            )}
            <button
              onClick={() => { setMediaFile(null); setMediaPreview(null) }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*,video/*'
                fileInputRef.current.click()
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600"
          >
            📷
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save ✓'}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleMediaSelect} />
        </div>
      </div>
    )
  }

  // ─── STEP 4: Submitting ───
  if (step === 'submitting') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-600">Analyzing with life record...</p>
      </div>
    )
  }

  // ─── STEP 5: Done + AI response ───
  if (step === 'done') {
    return (
      <div className="space-y-3">
        {/* Success badge */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-600 text-lg">✓</span>
            <span className="text-sm font-semibold text-green-700">Observation saved</span>
            {selectedDomain && <span className="text-lg">{selectedDomain.emoji}</span>}
          </div>
        </div>

        {/* AI Response bubble */}
        {aiResponse && (
          <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                S
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">{aiResponse}</p>
              </div>
            </div>
          </div>
        )}

        {/* New observation button */}
        <button
          onClick={reset}
          className="w-full py-3 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          + Add another observation
        </button>
      </div>
    )
  }

  return null
}
