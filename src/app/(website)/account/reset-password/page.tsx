'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const router = useRouter()

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Reset failed'); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/account/login'), 3000)
  }

  if (!token) return (
    <div className="text-center text-red-500 text-sm">Invalid reset link. <Link href="/account/forgot-password" className="underline">Request a new one.</Link></div>
  )

  return done ? (
    <div className="text-center space-y-4">
      <CheckCircle size={48} className="text-green-500 mx-auto" />
      <p className="font-semibold text-gray-900">Password updated!</p>
      <p className="text-sm text-gray-500">Redirecting to sign in…</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required minLength={6} placeholder="Min. 6 characters"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
        <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          required placeholder="Re-enter password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-brand text-white font-semibold py-2.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Updating…' : 'Set New Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/"><Logo size="md" className="mb-4" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <Suspense><ResetForm /></Suspense>
        </div>
      </div>
    </div>
  )
}
