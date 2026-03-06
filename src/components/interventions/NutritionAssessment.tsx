import { useState } from 'react'

interface NutritionQuestion {
  id: string
  text: string
  options: { label: string; score: number }[]
  dimension: 'protein' | 'iron' | 'calcium' | 'fiber' | 'hydration'
}

const QUESTIONS: NutritionQuestion[] = [
  { id: 'n1', text: 'How many servings of dal/legumes/pulses does your child eat daily?', dimension: 'protein',
    options: [{ label: '2+ servings', score: 3 }, { label: '1 serving', score: 2 }, { label: 'A few times a week', score: 1 }, { label: 'Rarely', score: 0 }] },
  { id: 'n2', text: 'Does your child eat eggs, paneer, chicken, or fish regularly?', dimension: 'protein',
    options: [{ label: 'Daily', score: 3 }, { label: '3-4 times/week', score: 2 }, { label: 'Occasionally', score: 1 }, { label: 'Never / vegetarian', score: 0 }] },
  { id: 'n3', text: 'How many servings of green leafy vegetables (palak, methi, amaranth) per week?', dimension: 'iron',
    options: [{ label: '5+ servings', score: 3 }, { label: '3-4 servings', score: 2 }, { label: '1-2 servings', score: 1 }, { label: 'Almost none', score: 0 }] },
  { id: 'n4', text: 'Does your child eat iron-rich foods like dates, jaggery, ragi, or bajra?', dimension: 'iron',
    options: [{ label: 'Regularly', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Never', score: 0 }] },
  { id: 'n5', text: 'How much milk/curd/cheese does your child consume daily?', dimension: 'calcium',
    options: [{ label: '2+ cups/servings', score: 3 }, { label: '1 cup/serving', score: 2 }, { label: 'A little', score: 1 }, { label: 'Avoids dairy', score: 0 }] },
  { id: 'n6', text: 'Does your child eat calcium-rich non-dairy foods (ragi, sesame, nachni)?', dimension: 'calcium',
    options: [{ label: 'Regularly', score: 3 }, { label: 'Sometimes', score: 2 }, { label: 'Rarely', score: 1 }, { label: 'Never', score: 0 }] },
  { id: 'n7', text: 'How many servings of fresh fruits does your child eat daily?', dimension: 'fiber',
    options: [{ label: '2+ fruits', score: 3 }, { label: '1 fruit', score: 2 }, { label: 'A few times/week', score: 1 }, { label: 'Rarely', score: 0 }] },
  { id: 'n8', text: 'How often does your child eat processed/packaged foods (chips, biscuits, noodles)?', dimension: 'fiber',
    options: [{ label: 'Rarely/never', score: 3 }, { label: 'Once a week', score: 2 }, { label: '2-3 times/week', score: 1 }, { label: 'Almost daily', score: 0 }] },
  { id: 'n9', text: 'How much water does your child drink daily?', dimension: 'hydration',
    options: [{ label: '6+ glasses', score: 3 }, { label: '4-5 glasses', score: 2 }, { label: '2-3 glasses', score: 1 }, { label: 'Less than 2', score: 0 }] },
  { id: 'n10', text: 'Does your child eat breakfast every day?', dimension: 'hydration',
    options: [{ label: 'Always, full breakfast', score: 3 }, { label: 'Usually', score: 2 }, { label: 'Sometimes skips', score: 1 }, { label: 'Often skips', score: 0 }] },
]

const DIMENSIONS = {
  protein: { label: 'Protein', emoji: '🥚', color: 'text-orange-600' },
  iron: { label: 'Iron & Minerals', emoji: '🥬', color: 'text-green-600' },
  calcium: { label: 'Calcium', emoji: '🥛', color: 'text-blue-600' },
  fiber: { label: 'Fiber & Vitamins', emoji: '🍎', color: 'text-red-600' },
  hydration: { label: 'Hydration & Routine', emoji: '💧', color: 'text-cyan-600' },
}

const MEAL_SUGGESTIONS: Record<string, string[]> = {
  protein: ['Add a spoonful of peanut butter to roti', 'Try sprouted moong chaat as a snack', 'Include curd/raita with every meal'],
  iron: ['Ragi porridge for breakfast 3x/week', 'Add jaggery to milk instead of sugar', 'Spinach paratha for iron + folate boost'],
  calcium: ['Ragi dosa is a calcium powerhouse', 'Sesame chutney (til ki chutney) with meals', 'Nachni (finger millet) ladoo as a snack'],
  fiber: ['Banana + peanut butter smoothie', 'Replace white bread with multigrain roti', 'Add grated veggies to dal and rice'],
  hydration: ['Nimbu pani (lemon water) between meals', 'Buttermilk/chaas after lunch', 'Set a fun water reminder with your child'],
}

function getGrade(pct: number): string {
  if (pct >= 85) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 30) return 'D'
  return 'F'
}

function getGradeColor(grade: string): string {
  if (grade === 'A') return 'text-green-600'
  if (grade === 'B') return 'text-green-500'
  if (grade === 'C') return 'text-amber-500'
  if (grade === 'D') return 'text-orange-500'
  return 'text-red-500'
}

export default function NutritionAssessment() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  function handleAnswer(score: number) {
    const q = QUESTIONS[currentQ]
    setAnswers((prev) => ({ ...prev, [q.id]: score }))
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setStep('result')
    }
  }

  function getScores() {
    const dimScores: Record<string, { total: number; max: number }> = {}
    Object.keys(DIMENSIONS).forEach((d) => { dimScores[d] = { total: 0, max: 0 } })

    QUESTIONS.forEach((q) => {
      dimScores[q.dimension].max += 3
      dimScores[q.dimension].total += answers[q.id] ?? 0
    })

    return Object.entries(dimScores).map(([dim, v]) => ({
      dimension: dim as keyof typeof DIMENSIONS,
      percentage: Math.round((v.total / v.max) * 100),
      grade: getGrade(Math.round((v.total / v.max) * 100)),
    }))
  }

  // ─── Intro ───
  if (step === 'intro') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🥗</div>
          <h3 className="text-lg font-bold text-gray-900">Nutrition Assessment</h3>
          <p className="text-sm text-gray-500 mt-1">10 quick questions about your child's diet. Get an AI-powered nutrition score.</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {Object.entries(DIMENSIONS).map(([, d]) => (
            <div key={d.label} className="text-center">
              <span className="text-xl">{d.emoji}</span>
              <div className="text-[10px] font-medium text-gray-500 mt-1 leading-tight">{d.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep('quiz')}
          className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          Start Nutrition Quiz
        </button>
      </div>
    )
  }

  // ─── Quiz ───
  if (step === 'quiz') {
    const q = QUESTIONS[currentQ]
    const dim = DIMENSIONS[q.dimension]
    const progress = ((currentQ + 1) / QUESTIONS.length) * 100

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
            <span className={`font-semibold ${dim.color}`}>{dim.emoji} {dim.label}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h4 className="text-base font-bold text-gray-900 mb-5 leading-relaxed">{q.text}</h4>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt.score)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-colors text-left text-sm font-medium text-gray-700"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
            ← Previous
          </button>
        )}
      </div>
    )
  }

  // ─── Results ───
  const scores = getScores()
  const overallPct = Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length)
  const overallGrade = getGrade(overallPct)
  const weakest = scores.reduce((min, s) => (s.percentage < min.percentage ? s : min), scores[0])

  return (
    <div className="space-y-4">
      {/* Overall Grade */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 text-center">
        <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Nutrition Score</div>
        <div className={`text-6xl font-bold ${getGradeColor(overallGrade)}`}>{overallGrade}</div>
        <div className="text-sm text-gray-600 mt-2">
          {overallGrade === 'A' ? 'Excellent nutrition!' : overallGrade === 'B' ? 'Good nutrition with room to improve' : overallGrade === 'C' ? 'Average — some gaps to address' : 'Needs improvement in key areas'}
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Breakdown by Dimension</h4>
        <div className="space-y-3">
          {scores.map((s) => {
            const d = DIMENSIONS[s.dimension]
            return (
              <div key={s.dimension}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{d.emoji} {d.label}</span>
                  <span className={`font-bold ${getGradeColor(s.grade)}`}>{s.grade} ({s.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all" style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Meal Suggestion */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Quick Wins for {DIMENSIONS[weakest.dimension].label}</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">Your lowest scoring area. Try these Indian food swaps:</p>
            <ul className="space-y-2">
              {MEAL_SUGGESTIONS[weakest.dimension]?.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={() => { setStep('intro'); setCurrentQ(0); setAnswers({}) }}
        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        Take Assessment Again
      </button>
    </div>
  )
}
