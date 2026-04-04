/**
 * IntelligencePreview — The "aha moment" component
 * Shows personalized intelligence projections from screening data.
 */

interface PreviewData {
  child: { name: string; age_months: number; gender: string; age_period: string; school?: string; class?: string }
  screening_summary: Record<string, { status: string; detail: string; urgency: string }>
  vitals: Record<string, { value: string; risk: string }>
  flagged_observations: string[]
  counts: { total_modules: number; normal: number; monitor: number; attention_needed: number }
  growth_tracks: Array<{ domain: string; title: string; active: boolean }>
  intelligence_message: string
}

interface Props {
  data: PreviewData
  doctor: { name: string; clinic?: string; specialty?: string } | null
  onRegister: () => void
}

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  normal: { bg: 'bg-green-50', label: 'Normal' },
  monitor: { bg: 'bg-amber-50', label: 'Monitor' },
  attention_needed: { bg: 'bg-red-50', label: 'Needs Attention' },
}

const ICONS: Record<string, string> = {
  eye: '👁', ent: '👂', dental: '🦷', skin: '🩺', heart: '❤️', lungs: '🫁', spine: '🦴', development: '🧒',
  behavioral: '🧠', motor: '🏃', language: '💬', nutrition: '🍎', height: '📏', weight: '⚖️', bmi: '📊',
  hemoglobin: '🩸', spo2: '💨', bp: '💗', vitals: '📈', general: '🏥', hair: '💇', limbs: '🦵',
  emotional: '💛', sleep_hygiene: '😴', social: '🤝', digital_wellness: '📱', parental_coping: '🧘',
  nutrition_habits: '🥗', physical_activity: '🏃',
}

const NAMES: Record<string, string> = {
  eye: 'Vision', ent: 'ENT', dental: 'Dental', skin: 'Skin', heart: 'Heart', lungs: 'Lungs', spine: 'Spine',
  development: 'Development', behavioral: 'Behavioral', motor: 'Motor', language: 'Language', nutrition: 'Nutrition',
  height: 'Height', weight: 'Weight', bmi: 'BMI', hemoglobin: 'Hemoglobin', spo2: 'SpO2', bp: 'Blood Pressure',
  vitals: 'Vitals', general: 'General', hair: 'Hair', limbs: 'Limbs', learning: 'Learning', social: 'Social',
  emotional: 'Emotional', throat: 'Throat', abdomen: 'Abdomen', nails: 'Nails', lymph: 'Lymph',
}

export default function IntelligencePreview({ data, doctor, onRegister }: Props) {
  const { child, screening_summary, counts, growth_tracks, intelligence_message } = data
  const modules = Object.entries(screening_summary)
  const attentionItems = modules.filter(([, v]) => v.status === 'attention_needed')
  const monitorItems = modules.filter(([, v]) => v.status === 'monitor')
  const normalItems = modules.filter(([, v]) => v.status === 'normal')

  const ageYears = Math.floor(child.age_months / 12)
  const ageMonths = child.age_months % 12
  const ageDisplay = ageYears > 0
    ? `${ageYears}y${ageMonths > 0 ? ` ${ageMonths}m` : ''}`
    : `${child.age_months}m`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Child Profile Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{child.name}'s Intelligence Report</h2>
            <p className="text-green-100 mt-1">
              {ageDisplay} {child.gender && child.gender !== 'unknown' ? `· ${child.gender}` : ''}
              {child.school && ` · ${child.school}`} {child.class && `(${child.class})`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{counts.total_modules}</div>
            <div className="text-green-200 text-sm">Modules</div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 flex-wrap">
          {counts.attention_needed > 0 && (
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-300" /><span className="text-sm font-medium">{counts.attention_needed} Attention</span>
            </div>
          )}
          {counts.monitor > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-300" /><span className="text-sm font-medium">{counts.monitor} Monitor</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-300" /><span className="text-sm font-medium">{counts.normal} Normal</span>
          </div>
        </div>
      </div>

      {/* Intelligence Message */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><span className="text-lg">🧠</span></div>
          <div>
            <h3 className="font-semibold text-blue-900 text-sm mb-1">SKIDS Intelligence</h3>
            <p className="text-blue-800 text-sm leading-relaxed">{intelligence_message}</p>
          </div>
        </div>
      </div>

      {/* Attention Needed */}
      {attentionItems.length > 0 && (
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">!</span>
            Needs Attention ({attentionItems.length})
          </h3>
          <div className="space-y-3">
            {attentionItems.map(([key, val]) => (
              <div key={key} className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{ICONS[key] || '🏥'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{NAMES[key] || key}</h4>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full text-red-700 bg-red-100">Needs Attention</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{val.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">Recommended: Discuss with pediatrician soon</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitor */}
      {monitorItems.length > 0 && (
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">◉</span>
            Worth Monitoring ({monitorItems.length})
          </h3>
          <div className="space-y-3">
            {monitorItems.map(([key, val]) => (
              <div key={key} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{ICONS[key] || '🏥'}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{NAMES[key] || key}</h4>
                    <p className="text-sm text-gray-600 mt-1">{val.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal */}
      {normalItems.length > 0 && (
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
            All Clear ({normalItems.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {normalItems.map(([key]) => (
              <div key={key} className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <span className="text-sm">{ICONS[key] || '✓'}</span>
                <span className="text-sm text-green-800 font-medium">{NAMES[key] || key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Tracks */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Growth & Development Tracks</h3>
        <p className="text-sm text-gray-500 mb-4">Personalized guidance across 8 domains for {child.name}'s age ({child.age_period})</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {growth_tracks.map(t => (
            <div key={t.domain} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-2">{ICONS[t.domain] || '📋'}</div>
              <div className="text-xs font-semibold text-gray-700 capitalize">{t.domain.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What you get */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">What SKIDS Intelligence gives you</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '🔮', title: 'Condition Projections', desc: 'AI analyzes 150+ conditions with Bayesian probability' },
            { icon: '📊', title: 'Growth Tracking', desc: 'WHO-calibrated growth monitoring with Z-scores' },
            { icon: '🩺', title: 'Doctor Connection', desc: `Direct link with ${doctor ? `Dr. ${doctor.name}` : 'your pediatrician'}` },
            { icon: '📋', title: 'Intervention Protocols', desc: 'Evidence-based daily tasks if conditions need attention' },
            { icon: '🧒', title: 'Development Guidance', desc: 'Age-appropriate milestones across 8 domains' },
            { icon: '📑', title: 'Evidence-Backed', desc: 'Every recommendation traces to published research' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div><h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4><p className="text-xs text-gray-500 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to activate {child.name}'s Life Record?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Join the pilot. Get ongoing intelligence, connect with {doctor ? `Dr. ${doctor.name}` : 'your pediatrician'}, and never miss a developmental milestone.
        </p>
        <button onClick={onRegister}
          className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-lg shadow-lg shadow-green-200">
          Create Life Record — Free
        </button>
        <p className="text-xs text-gray-400 mt-3">Free during pilot. Your data is private and secure.</p>
      </div>

      <footer className="text-center py-8 text-xs text-gray-400">SKIDS Clinic Pvt. Ltd. · Bangalore, India</footer>
    </div>
  )
}
