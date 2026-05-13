'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/account/profile')
      .then(r => r.json())
      .then(d => { setForm({ name: d.name || '', phone: d.phone || '' }); setFetching(false) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Update failed'); setLoading(false); return }
    await update({ name: data.name })
    setSuccess(true)
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (fetching) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-brand" />
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your personal information</p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <input
            value={session?.user?.email || ''}
            disabled
            className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="01700-000000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-lg">
            <CheckCircle size={16} /> Profile updated successfully
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
