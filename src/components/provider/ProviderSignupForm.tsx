import { useState } from 'react'

interface FormState {
  name: string
  medicalRegNumber: string
  specializations: string
  city: string
  contactEmail: string
  contactPhone: string
}

export default function ProviderSignupForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    medicalRegNumber: '',
    specializations: '',
    city: '',
    contactEmail: '',
    contactPhone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const specializations = form.specializations
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const res = await fetch('/api/provider/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          medicalRegNumber: form.medicalRegNumber.trim(),
          specializations,
          city: form.city.trim(),
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim(),
        }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) throw new Error(d.error || 'Submission failed')
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? (e.message || 'Something went wrong. Please try again.') : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto">✓</div>
          <h2 className="text-lg font-bold text-gray-900">Application Submitted!</h2>
          <p className="text-sm text-gray-500">
            We'll review your application and contact you within 24 hours.
          </p>
          <a
            href="/provider/login"
            className="block w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Go to Provider Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-sm w-full space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Join skids as a Provider</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your details and we'll get back to you within 24 hours.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', field: 'name' as const, type: 'text', placeholder: 'Dr. Priya Sharma', required: true },
            { label: 'Medical Reg. Number', field: 'medicalRegNumber' as const, type: 'text', placeholder: 'MCI-12345', required: true },
            { label: 'Specializations', field: 'specializations' as const, type: 'text', placeholder: 'Pediatrics, Nutrition (comma-separated)', required: false },
            { label: 'City', field: 'city' as const, type: 'text', placeholder: 'Mumbai', required: false },
            { label: 'Contact Email', field: 'contactEmail' as const, type: 'email', placeholder: 'doctor@example.com', required: true },
            { label: 'Contact Phone', field: 'contactPhone' as const, type: 'tel', placeholder: '+91 98765 43210', required: true },
          ].map(({ label, field, type, placeholder, required }) => (
            <div key={field}>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-300"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors mt-2"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400">
          Already have an account?{' '}
          <a href="/provider/login" className="text-green-600 font-semibold hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
