'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail, ShieldCheck, UserPlus } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

type Step = 'email' | 'otp' | 'password'

const STEP_LABELS: Record<Step, { icon: typeof Mail; label: string }> = {
  email:    { icon: Mail,        label: 'Enter Email' },
  otp:      { icon: ShieldCheck, label: 'Verify OTP'  },
  password: { icon: UserPlus,    label: 'Set Password' },
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState('')
  const [socialLoading, setSocialLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  async function sendOtp(emailVal = email) {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return false }
    setResendCooldown(60)
    // Dev mode: auto-fill OTP
    if (data.devOtp) {
      setOtp(data.devOtp.split(''))
    }
    return true
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await sendOtp(email)
    if (ok) { setStep('otp'); setTimeout(() => otpRefs.current[0]?.focus(), 100) }
  }

  function handleOtpKey(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      otpRefs.current[5]?.focus()
      e.preventDefault()
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: code }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setStep('password')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email, phone: form.phone, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Signup failed'); setLoading(false); return }
    await signIn('credentials', { email, password: form.password, redirect: false })
    router.push('/account')
    router.refresh()
  }

  const steps: Step[] = ['email', 'otp', 'password']
  const stepIndex = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/"><Logo size="md" className="mb-4" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join Matin Sanitary today</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < stepIndex ? 'bg-brand text-white' :
                i === stepIndex ? 'bg-brand text-white ring-4 ring-brand/20' :
                'bg-gray-200 text-gray-400'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 transition-colors ${i < stepIndex ? 'bg-brand' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-5">

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <div className="space-y-3">
                <button onClick={() => { setSocialLoading(true); signIn('google', { callbackUrl: '/account' }) }}
                  disabled={socialLoading}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  {socialLoading ? <Loader2 size={16} className="animate-spin" /> : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Sign up with Google
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="you@example.com" autoFocus
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand text-white font-semibold py-2.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="text-center">
                <p className="text-sm text-gray-600">OTP sent to</p>
                <p className="text-sm font-semibold text-gray-900">{email}</p>
                <button type="button" onClick={() => { setStep('email'); setOtp(['','','','','','']); setError('') }}
                  className="text-xs text-brand hover:underline mt-1">Change email</button>
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-digit OTP</label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      className="w-10 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-brand text-white font-semibold py-2.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : 'Verify OTP'}
              </button>
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-gray-400">Resend OTP in {resendCooldown}s</p>
                ) : (
                  <button type="button" onClick={() => sendOtp()}
                    className="text-xs text-brand hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── Step 3: Password ── */}
          {step === 'password' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <ShieldCheck size={15} /> Email verified: <span className="font-semibold">{email}</span>
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  required placeholder="John Doe" autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="01700-000000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required minLength={6} placeholder="Min. 6 characters"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand pr-10" />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                  required placeholder="Re-enter password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-brand text-white font-semibold py-2.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/account/login" className="text-brand font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
