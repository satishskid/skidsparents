import { useState } from 'react'

interface Question {
  id: string
  domain: 'speech' | 'motor' | 'behavior' | 'cognitive'
  text: string
  ageMin: number  // months
  ageMax: number  // months
}

const QUESTIONS: Question[] = [
  // Speech & Language
  { id: 's1', domain: 'speech', text: 'Does your child respond to their name when called?', ageMin: 6, ageMax: 96 },
  { id: 's2', domain: 'speech', text: 'Can your child use 2-3 word phrases to express needs?', ageMin: 18, ageMax: 96 },
  { id: 's3', domain: 'speech', text: 'Can unfamiliar people understand most of what your child says?', ageMin: 30, ageMax: 96 },
  // Motor
  { id: 'm1', domain: 'motor', text: 'Can your child pick up small objects using thumb and finger (pincer grasp)?', ageMin: 9, ageMax: 96 },
  { id: 'm2', domain: 'motor', text: 'Can your child hold a crayon/pencil and draw simple shapes (circle, cross)?', ageMin: 24, ageMax: 96 },
  { id: 'm3', domain: 'motor', text: 'Can your child button/unbutton clothes or use a zipper?', ageMin: 36, ageMax: 96 },
  // Behavior & Social
  { id: 'b1', domain: 'behavior', text: 'Does your child make eye contact during conversations?', ageMin: 6, ageMax: 96 },
  { id: 'b2', domain: 'behavior', text: 'Does your child play pretend or imaginative games (feeding a doll, cooking)?', ageMin: 18, ageMax: 96 },
  { id: 'b3', domain: 'behavior', text: 'Can your child take turns during games and wait for their turn?', ageMin: 30, ageMax: 96 },
  // Cognitive
  { id: 'c1', domain: 'cognitive', text: 'Does your child follow 2-step instructions (pick up the toy AND put it in the box)?', ageMin: 18, ageMax: 96 },
  { id: 'c2', domain: 'cognitive', text: 'Can your child sort objects by color, shape, or size?', ageMin: 24, ageMax: 96 },
  { id: 'c3', domain: 'cognitive', text: 'Does your child ask "why" questions about things they observe?', ageMin: 30, ageMax: 96 },
]

const DOMAINS = {
  speech: { label: 'Speech & Language', emoji: '🗣️', color: 'text-purple-600', bg: 'bg-purple-50' },
  motor: { label: 'Motor Skills', emoji: '✋', color: 'text-blue-600', bg: 'bg-blue-50' },
  behavior: { label: 'Behavior & Social', emoji: '❤️', color: 'text-pink-600', bg: 'bg-pink-50' },
  cognitive: { label: 'Cognitive', emoji: '🧠', color: 'text-amber-600', bg: 'bg-amber-50' },
}

type Answer = 'yes' | 'sometimes' | 'not_yet'

export default function ChatterAssessment() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [childAge, setChildAge] = useState('')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})

  const ageMonths = childAge ? parseInt(childAge) : 0
  const filteredQuestions = QUESTIONS.filter(
    (q) => ageMonths >= q.ageMin && ageMonths <= q.ageMax
  )

  function handleAnswer(answer: Answer) {
    const q = filteredQuestions[currentQ]
    setAnswers((prev) => ({ ...prev, [q.id]: answer }))

    if (currentQ < filteredQuestions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setStep('result')
    }
  }

  function getScores() {
    const domainScores: Record<string, { total: number; score: number }> = {
      speech: { total: 0, score: 0 },
      motor: { total: 0, score: 0 },
      behavior: { total: 0, score: 0 },
      cognitive: { total: 0, score: 0 },
    }

    filteredQuestions.forEach((q) => {
      const answer = answers[q.id]
      domainScores[q.domain].total++
      if (answer === 'yes') domainScores[q.domain].score += 2
      else if (answer === 'sometimes') domainScores[q.domain].score += 1
    })

    return Object.entries(domainScores)
      .filter(([, v]) => v.total > 0)
      .map(([domain, v]) => ({
        domain: domain as keyof typeof DOMAINS,
        percentage: Math.round((v.score / (v.total * 2)) * 100),
        level: v.score / (v.total * 2) >= 0.7 ? 'green' as const : v.score / (v.total * 2) >= 0.4 ? 'amber' as const : 'red' as const,
      }))
  }

  function getOverallLevel(scores: ReturnType<typeof getScores>) {
    const hasRed = scores.some((s) => s.level === 'red')
    const hasAmber = scores.some((s) => s.level === 'amber')
    if (hasRed) return 'red'
    if (hasAmber) return 'amber'
    return 'green'
  }

  // ─── Intro ───
  if (step === 'intro') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧠</div>
          <h3 className="text-lg font-bold text-gray-900">Free Developmental Assessment</h3>
          <p className="text-sm text-gray-500 mt-1">12 age-appropriate questions across 4 domains. Takes ~3 minutes.</p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">Your child's age (in months)</label>
          <select
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
          >
            <option value="">Select age</option>
            {[6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 60, 72, 84, 96].map((m) => (
              <option key={m} value={m}>
                {m < 24 ? `${m} months` : `${Math.floor(m / 12)} year${m >= 24 ? 's' : ''} ${m % 12 ? `${m % 12} months` : ''}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {Object.entries(DOMAINS).map(([key, d]) => (
            <div key={key} className={`${d.bg} rounded-xl p-3 text-center`}>
              <span className="text-lg">{d.emoji}</span>
              <div className={`text-xs font-semibold ${d.color} mt-1`}>{d.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => childAge && setStep('quiz')}
          disabled={!childAge}
          className="w-full py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Start Assessment
        </button>
      </div>
    )
  }

  // ─── Quiz ───
  if (step === 'quiz') {
    const q = filteredQuestions[currentQ]
    if (!q) {
      setStep('result')
      return null
    }
    const domain = DOMAINS[q.domain]
    const progress = ((currentQ + 1) / filteredQuestions.length) * 100

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Question {currentQ + 1} of {filteredQuestions.length}</span>
            <span className={`font-semibold ${domain.color}`}>{domain.emoji} {domain.label}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h4 className="text-base font-bold text-gray-900 mb-6 leading-relaxed">{q.text}</h4>

        {/* Answer buttons */}
        <div className="space-y-2">
          {([
            { value: 'yes' as Answer, label: 'Yes', emoji: '✅', desc: 'Consistently does this' },
            { value: 'sometimes' as Answer, label: 'Sometimes', emoji: '🔄', desc: 'Does it occasionally' },
            { value: 'not_yet' as Answer, label: 'Not yet', emoji: '⏳', desc: 'Has not started yet' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors text-left"
            >
              <span className="text-lg">{opt.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ(currentQ - 1)}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600"
          >
            ← Previous question
          </button>
        )}
      </div>
    )
  }

  // ─── Results ───
  const scores = getScores()
  const overall = getOverallLevel(scores)

  const levelConfig = {
    green: { label: 'On Track', emoji: '🟢', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', message: 'Your child is developing well across assessed domains. Continue enriching activities and track milestones regularly.' },
    amber: { label: 'Watch & Support', emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', message: 'Some areas may benefit from extra support. Early intervention is most effective — consider a professional consultation.' },
    red: { label: 'Consult Recommended', emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', message: 'We recommend speaking with a developmental specialist. Early intervention before age 5 is 4x more effective.' },
  }

  const config = levelConfig[overall]

  return (
    <div className="space-y-4">
      {/* Overall Result */}
      <div className={`${config.bg} rounded-2xl p-6 border ${config.border}`}>
        <div className="text-center">
          <div className="text-3xl mb-2">{config.emoji}</div>
          <h3 className={`text-lg font-bold ${config.color}`}>{config.label}</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">{config.message}</p>
        </div>
      </div>

      {/* Domain Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Domain Breakdown</h4>
        <div className="space-y-3">
          {scores.map((s) => {
            const d = DOMAINS[s.domain]
            const barColor = s.level === 'green' ? 'bg-green-400' : s.level === 'amber' ? 'bg-amber-400' : 'bg-red-400'
            return (
              <div key={s.domain}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{d.emoji} {d.label}</span>
                  <span className={`font-bold ${s.level === 'green' ? 'text-green-600' : s.level === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
                    {s.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      {overall !== 'green' && (
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
          <h4 className="font-bold text-gray-900 text-sm mb-2">Recommended Next Steps</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            {scores.filter((s) => s.level !== 'green').map((s) => (
              <li key={s.domain} className="flex items-start gap-2">
                <span className="text-xs mt-1">{s.level === 'red' ? '🔴' : '🟡'}</span>
                <span>
                  <span className="font-medium">{DOMAINS[s.domain].label}</span>: {s.level === 'red' ? 'Professional evaluation recommended' : 'Consider additional activities and monitoring'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => { setStep('intro'); setCurrentQ(0); setAnswers({}); setChildAge('') }}
        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        Take Assessment Again
      </button>
    </div>
  )
}
