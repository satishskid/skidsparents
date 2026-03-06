import { useState } from 'react'

interface HearingMilestone {
  id: string
  title: string
  description: string
  ageRange: string
  ageMin: number
  ageMax: number
}

const HEARING_MILESTONES: HearingMilestone[] = [
  { id: 'h1', title: 'Startles at loud sounds', description: 'Jumps or widens eyes when they hear a sudden loud noise.', ageRange: '0–3 months', ageMin: 0, ageMax: 3 },
  { id: 'h2', title: 'Turns toward sounds', description: 'Moves head or eyes toward a voice or interesting sound.', ageRange: '3–6 months', ageMin: 3, ageMax: 6 },
  { id: 'h3', title: 'Responds to own name', description: 'Looks up or turns when their name is called.', ageRange: '6–9 months', ageMin: 6, ageMax: 9 },
  { id: 'h4', title: 'Understands "no" and simple words', description: 'Responds to common words like "no", "bye-bye", or "mama".', ageRange: '9–12 months', ageMin: 9, ageMax: 12 },
  { id: 'h5', title: 'Points to familiar objects when named', description: 'Can identify common objects (dog, ball, cup) when asked.', ageRange: '12–18 months', ageMin: 12, ageMax: 18 },
  { id: 'h6', title: 'Follows simple instructions', description: 'Understands and acts on "give me the ball" or "close the door".', ageRange: '18–24 months', ageMin: 18, ageMax: 24 },
  { id: 'h7', title: 'Hears you from another room', description: 'Responds when called from a different room or distance.', ageRange: '2–3 years', ageMin: 24, ageMax: 36 },
  { id: 'h8', title: 'Follows multi-step instructions', description: 'Can follow "pick up the toy and put it in the box".', ageRange: '3–4 years', ageMin: 36, ageMax: 48 },
  { id: 'h9', title: 'Hears speech in noisy environments', description: 'Can understand speech when there is background noise (TV, conversation).', ageRange: '4–5 years', ageMin: 48, ageMax: 60 },
  { id: 'h10', title: 'Distinguishes similar-sounding words', description: 'Can tell the difference between "pat/bat", "three/free", "ship/chip".', ageRange: '5+ years', ageMin: 60, ageMax: 144 },
]

export default function HearingTracker() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [activeView, setActiveView] = useState<'milestones' | 'test' | 'tips'>('milestones')
  const [testResult, setTestResult] = useState<'pass' | 'refer' | ''>('')

  function toggleMilestone(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const achieved = checked.size
  const total = HEARING_MILESTONES.length
  const progress = Math.round((achieved / total) * 100)

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { key: 'milestones' as const, label: '🎵 Milestones' },
          { key: 'test' as const, label: '🎧 Take Test' },
          { key: 'tips' as const, label: '💡 Hearing Tips' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeView === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === 'milestones' && (
        <div className="space-y-3">
          {/* Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Hearing Milestones</span>
              <span className="font-bold text-indigo-600">{achieved}/{total}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Milestone cards */}
          {HEARING_MILESTONES.map((m) => {
            const isChecked = checked.has(m.id)
            return (
              <button
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
                  isChecked
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                }`}>
                  {isChecked && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    {m.ageRange}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {activeView === 'test' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎮</div>
              <h4 className="text-base font-bold text-gray-900">SKIDS Symphony Hearing Test</h4>
              <p className="text-sm text-gray-500 mt-1">Powered by Sound Scouts — clinically validated game-based hearing screening</p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 mb-4">
              <h5 className="text-sm font-bold text-indigo-800 mb-2">Before You Start</h5>
              <ul className="text-sm text-indigo-700 space-y-1.5">
                <li className="flex items-start gap-2"><span>🔇</span> Find a quiet room with no background noise</li>
                <li className="flex items-start gap-2"><span>🎧</span> Use quality over-ear headphones (not earbuds)</li>
                <li className="flex items-start gap-2"><span>⏱️</span> The test takes about 5-8 minutes</li>
                <li className="flex items-start gap-2"><span>👶</span> Your child should be 4+ years old</li>
              </ul>
            </div>

            <a
              href="https://www.soundscouts.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors text-center"
            >
              Open Sound Scouts Test →
            </a>
          </div>

          {/* Log Results */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Log Test Results</h4>
            <p className="text-xs text-gray-500 mb-4">After completing the Sound Scouts test, record the result here.</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {([
                { value: 'pass' as const, label: 'Pass', emoji: '🟢', desc: 'Hearing within normal range' },
                { value: 'refer' as const, label: 'Refer', emoji: '🟡', desc: 'Follow-up recommended' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTestResult(opt.value)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    testResult === opt.value
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl block">{opt.emoji}</span>
                  <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                  <span className="text-[10px] text-gray-500 block">{opt.desc}</span>
                </button>
              ))}
            </div>

            {testResult && (
              <div className={`rounded-xl p-4 ${testResult === 'pass' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <p className="text-sm text-gray-700">
                  {testResult === 'pass'
                    ? 'Great news! Your child\'s hearing is within normal range. We recommend annual re-screening to catch any changes early.'
                    : 'The test suggests a follow-up is recommended. This doesn\'t necessarily mean hearing loss — it could be temporary (ear infection, wax). We recommend an audiologist consultation through SKIDS Teleconsult.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'tips' && (
        <div className="space-y-3">
          {([
            { emoji: '📢', title: 'Noise Exposure', tips: ['Keep TV/music at conversation level', 'Limit headphone use to 60 min/day at 60% volume', 'Use noise-cancelling headphones in loud environments'] },
            { emoji: '🗣️', title: 'Language Stimulation', tips: ['Talk to your child about what you\'re doing throughout the day', 'Read aloud daily — emphasize different sounds and rhythms', 'Sing songs and nursery rhymes — rhythm trains auditory processing'] },
            { emoji: '⚠️', title: 'Warning Signs', tips: ['Not responding to name by 12 months', 'Not using single words by 16 months', 'Turning TV volume very high', 'Frequently asking "what?" or "huh?"', 'Speech unclear to strangers by age 3'] },
          ]).map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <span className="text-lg">{section.emoji}</span> {section.title}
              </h4>
              <ul className="space-y-2">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-indigo-400 mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
