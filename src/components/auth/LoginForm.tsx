import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { sendPhoneOTP } from '@/lib/firebase/client'
import type { ConfirmationResult } from 'firebase/auth'

export default function LoginForm() {
  const { user, loading, token } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'idle' | 'sending' | 'otp' | 'verifying' | 'syncing'>('idle')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // If already logged in, sync session and redirect
  if (user && token && step !== 'syncing') {
    syncAndRedirect(token)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  async function syncAndRedirect(idToken: string) {
    setStep('syncing')
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      })
      const data = await res.json()
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect') || '/me'
      window.location.href = data.isNew ? '/me' : redirect
    } catch {
      window.location.href = '/me'
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const { signInWithGoogle } = await import('@/lib/firebase/client')
      const u = await signInWithGoogle()
      const t = await u.getIdToken()
      await syncAndRedirect(t)
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.')
      }
      setGoogleLoading(false)
    }
  }

  async function handleSendOTP() {
    setError('')
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }
    setStep('sending')
    try {
      const result = await sendPhoneOTP(cleaned, 'recaptcha-container')
      setConfirmation(result)
      setStep('otp')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.')
      setStep('idle')
    }
  }

  async function handleVerifyOTP() {
    if (!confirmation || otp.length < 6) return
    setError('')
    setStep('verifying')
    try {
      const result = await confirmation.confirm(otp)
      const t = await result.user.getIdToken()
      await syncAndRedirect(t)
    } catch {
      setError('Invalid OTP. Please try again.')
      setStep('otp')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg shadow-green-500/20">
          S
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 font-display">Welcome to SKIDS Parent</h1>
        <p className="mt-2 text-gray-500 text-sm">Sign in to track your child's health journey</p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {googleLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or use phone</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Phone */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex items-center px-3 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-500">
            +91
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            maxLength={10}
            disabled={step === 'otp' || step === 'sending'}
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
          />
        </div>

        {step !== 'otp' && step !== 'verifying' && (
          <button
            onClick={handleSendOTP}
            disabled={step === 'sending' || phone.replace(/\D/g, '').length < 10}
            className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {step === 'sending' ? 'Sending OTP...' : 'Send OTP'}
          </button>
        )}

        {(step === 'otp' || step === 'verifying') && (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={handleVerifyOTP}
              disabled={step === 'verifying' || otp.length < 6}
              className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {step === 'verifying' ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Recaptcha container (invisible) */}
      <div id="recaptcha-container" />

      {/* Trust signals */}
      <div className="mt-8 flex flex-col items-center gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Your data stays private
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            No spam, ever
          </span>
        </div>
      </div>
    </div>
  )
}
