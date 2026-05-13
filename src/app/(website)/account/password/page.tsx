'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({ current: '', newPassword: '', confirm: '' })
  const [show, setShow] = useState({ current: false, new: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // OAuth users have no password to change
  const isSocialOnly = !session?.user?.email

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/account/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: form.current, newPassword: form.newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
    setSuccess(true)
    setForm({ current: '', newPassword: '', confirm: '' })
    setLoading(false)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Change Password</h1>
      <p className="text-sm text-gray-500 mb-6">Update your account password</p>

      {isSocialOnly ? (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-4">
          Your account uses Google or Facebook login. Password change is not available.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          {[
            { key: 'current', label: 'Current Password', showKey: 'current' as const },
            { key: 'newPassword', label: 'New Password', showKey: 'new' as const },
          ].map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  value={(form as any)[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  required minLength={key === 'newPassword' ? 6 : 1}
                  placeholder={key === 'newPassword' ? 'Min. 6 characters' : '••••••••'}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand pr-10"
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              required placeholder="Re-enter new password"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-lg">
              <CheckCircle size={16} /> Password updated successfully
            </div>
          )}

          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-brand text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  )
}
