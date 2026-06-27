'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { formatDate } from '@/lib/utils'

type SalesRep = {
  id: string
  name: string
  phone: string | null
  defaultCommissionRate: number | null
  isActive: boolean
  createdAt: string
}

const EMPTY = { name: '', phone: '', defaultCommissionRate: '' }

export default function SalesRepsPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sales-reps'],
    queryFn: () => fetch('/api/sales-reps').then(r => r.json()),
  })

  const reps: SalesRep[] = data?.data || []

  function startEdit(rep: SalesRep) {
    setEditingId(rep.id)
    setForm({
      name: rep.name,
      phone: rep.phone || '',
      defaultCommissionRate: rep.defaultCommissionRate != null ? String(rep.defaultCommissionRate) : '',
    })
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY)
    setError('')
  }

  async function save() {
    if (!form.name.trim()) { setError('Name required'); return }
    setSaving(true)
    setError('')
    const body = {
      name: form.name.trim(),
      phone: form.phone || null,
      defaultCommissionRate: form.defaultCommissionRate ? Number(form.defaultCommissionRate) : null,
    }
    const res = await fetch(
      editingId ? `/api/sales-reps/${editingId}` : '/api/sales-reps',
      { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )
    setSaving(false)
    if (!res.ok) { const e = await res.json(); setError(e.error || 'Failed'); return }
    qc.invalidateQueries({ queryKey: ['sales-reps'] })
    cancelEdit()
  }

  async function toggleActive(rep: SalesRep) {
    await fetch(`/api/sales-reps/${rep.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rep.isActive }),
    })
    qc.invalidateQueries({ queryKey: ['sales-reps'] })
  }

  async function remove(id: string) {
    if (!confirm('Delete this sales rep?')) return
    await fetch(`/api/sales-reps/${id}`, { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['sales-reps'] })
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v: string) => <span className="font-semibold text-gray-900">{v}</span> },
    { key: 'phone', label: 'Phone', render: (v: string | null) => <span className="text-sm text-gray-500">{v || '—'}</span> },
    {
      key: 'defaultCommissionRate',
      label: 'Default Rate',
      render: (v: number | null) => v != null ? <span className="font-medium">{v}%</span> : <span className="text-gray-400">—</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v: boolean, row: any) => (
        <button onClick={() => toggleActive(row)}>
          <Badge variant={v ? 'success' : 'default'}>{v ? 'Active' : 'Inactive'}</Badge>
        </button>
      ),
    },
    { key: 'createdAt', label: 'Added', render: (v: string) => <span className="text-xs text-gray-400">{formatDate(v)}</span> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => startEdit(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand">
            <Pencil size={14} />
          </button>
          <button onClick={() => remove(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales Representatives</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reps.length} rep{reps.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Add / Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{editingId ? 'Edit Sales Rep' : 'Add New Sales Rep'}</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Karim Ahmed"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="017XXXXXXXX"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Default Commission %</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={form.defaultCommissionRate}
              onChange={e => setForm(f => ({ ...f, defaultCommissionRate: e.target.value }))}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <div className="flex gap-2 mt-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-60"
          >
            <Check size={14} />
            {saving ? 'Saving…' : editingId ? 'Update' : 'Add Rep'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg border border-gray-200">
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      <DataTable
        data={reps}
        columns={columns as any}
        loading={isLoading}
        emptyMessage="No sales reps yet"
      />
    </div>
  )
}
