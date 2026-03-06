import { useState } from 'react'

const CATEGORIES = [
  { key: 'fever', emoji: '🌡️', label: 'Fever' },
  { key: 'cough', emoji: '😷', label: 'Cough / Cold' },
  { key: 'stomach', emoji: '🤢', label: 'Stomach Issues' },
  { key: 'skin', emoji: '🔴', label: 'Skin / Rash' },
  { key: 'behavior', emoji: '😟', label: 'Behavior' },
  { key: 'sleep', emoji: '😴', label: 'Sleep Issues' },
  { key: 'growth', emoji: '📏', label: 'Growth Concern' },
  { key: 'other', emoji: '❓', label: 'Other' },
]

const DURATION_OPTIONS = [
  { value: 'today', label: 'Started today' },
  { value: '2-3days', label: '2-3 days' },
  { value: 'week', label: 'About a week' },
  { value: 'ongoing', label: 'Ongoing (weeks/months)' },
]

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', emoji: '🟢', desc: 'Noticeable but not affecting daily activities' },
  { value: 'moderate', label: 'Moderate', emoji: '🟡', desc: 'Affecting some daily activities or causing discomfort' },
  { value: 'severe', label: 'Severe', emoji: '🔴', desc: 'Significantly affecting daily life or causing distress' },
]

const DOCTORS = [
  { id: 'd1', name: 'Dr. Priya Sharma', specialization: 'General Pediatrics', experience: '12 years', languages: 'English, Hindi', nextSlot: 'Today, 6:30 PM', emoji: '👩‍⚕️' },
  { id: 'd2', name: 'Dr. Ankit Verma', specialization: 'Developmental Pediatrics', experience: '8 years', languages: 'English, Hindi, Kannada', nextSlot: 'Tomorrow, 10:00 AM', emoji: '👨‍⚕️' },
  { id: 'd3', name: 'Dr. Meera Nair', specialization: 'Pediatric Nutrition', experience: '15 years', languages: 'English, Malayalam, Tamil', nextSlot: 'Tomorrow, 2:00 PM', emoji: '👩‍⚕️' },
]

interface TriageResult {
  level: 'green' | 'amber' | 'red'
  title: string
  message: string
  action: string
}

function getTriageResult(category: string, duration: string, severity: string): TriageResult {
  // Red flags
  if (severity === 'severe') {
    return {
      level: 'red', title: 'Consult Recommended',
      message: 'Based on the severity you described, we recommend a pediatric consultation soon. A doctor can assess the situation properly.',
      action: 'Book a consultation below — we\'ll share your child\'s full SKIDS health record with the doctor.',
    }
  }

  if (duration === 'ongoing' && severity === 'moderate') {
    return {
      level: 'amber', title: 'Professional Review Advised',
      message: 'Ongoing moderate symptoms should be professionally evaluated. Early assessment often leads to simpler solutions.',
      action: 'Consider booking a teleconsult — the doctor will review your child\'s complete health history.',
    }
  }

  if (duration === 'week' || (duration === '2-3days' && severity === 'moderate')) {
    return {
      level: 'amber', title: 'Monitor & Consider Consult',
      message: 'If symptoms persist beyond a few more days or worsen, a consultation would be helpful. In the meantime, keep monitoring.',
      action: 'You can book a teleconsult now or continue monitoring. Our doctors are available if needed.',
    }
  }

  return {
    level: 'green', title: 'Monitor at Home',
    message: 'Based on what you\'ve described, home monitoring is appropriate for now. Watch for any changes in severity.',
    action: 'If symptoms worsen or new symptoms appear, you can always book a quick teleconsult.',
  }
}

export default function SymptomChecker() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [category, setCategory] = useState('')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState('')

  function resetAll() {
    setStep(1)
    setCategory('')
    setDuration('')
    setSeverity('')
  }

  // ─── Step 1: Category ───
  if (step === 1) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">🩺</div>
          <h3 className="text-base font-bold text-gray-900">What's concerning you?</h3>
          <p className="text-xs text-gray-500 mt-1">This is a triage tool, not a diagnosis. It helps you decide next steps.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setCategory(cat.key); setStep(2) }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors text-left"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Step 2: Duration ───
  if (step === 2) {
    const cat = CATEGORIES.find((c) => c.key === category)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-5">
          <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600 mb-3">← Back</button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{cat?.emoji}</span>
            <span className="text-sm font-medium text-gray-500">{cat?.label}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900">How long has this been going on?</h3>
        </div>
        <div className="space-y-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setDuration(opt.value); setStep(3) }}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors text-left text-sm font-medium text-gray-700"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Step 3: Severity ───
  if (step === 3) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-5">
          <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-gray-600 mb-3">← Back</button>
          <h3 className="text-base font-bold text-gray-900">How severe would you say it is?</h3>
        </div>
        <div className="space-y-2">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSeverity(opt.value); setStep(4) }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors text-left"
            >
              <span className="text-xl">{opt.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Step 4: Result + Doctor Profiles ───
  const result = getTriageResult(category, duration, severity)
  const levelColors = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', emoji: '🟢' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', emoji: '🟡' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', emoji: '🔴' },
  }
  const lc = levelColors[result.level]

  return (
    <div className="space-y-4">
      {/* Triage Result */}
      <div className={`${lc.bg} rounded-2xl p-6 border ${lc.border}`}>
        <div className="text-center">
          <div className="text-3xl mb-2">{lc.emoji}</div>
          <h3 className={`text-lg font-bold ${lc.text}`}>{result.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{result.message}</p>
          <p className="text-sm text-gray-500 mt-2 italic">{result.action}</p>
        </div>
      </div>

      {/* Doctor Profiles */}
      {result.level !== 'green' && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-900 px-1">Available Pediatricians</h4>
          {DOCTORS.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-2xl">
                  {doc.emoji}
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-gray-900">{doc.name}</h5>
                  <p className="text-xs text-gray-500">{doc.specialization} • {doc.experience}</p>
                  <p className="text-xs text-gray-400">{doc.languages}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-green-600">Next: {doc.nextSlot}</span>
                    <span className="text-xs font-bold text-gray-900">₹499</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 text-center">Doctor will receive your child's full SKIDS health record before the consultation.</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          <strong>Disclaimer:</strong> This symptom checker is an informational triage tool, not a medical diagnosis. Always consult a qualified pediatrician for medical advice.
        </p>
      </div>

      <button onClick={resetAll} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
        Start Over
      </button>
    </div>
  )
}
