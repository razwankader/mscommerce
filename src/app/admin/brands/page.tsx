'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'

export default function BrandsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', logo: '', website: '' })
  const [loading, setLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => fetch('/api/brands').then((r) => r.json()),
  })

  function openModal(brand?: any) {
    setEditing(brand || null)
    setForm({ name: brand?.name || '', logo: brand?.logo || '', website: brand?.website || '' })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing ? `/api/brands/${editing.id}` : '/api/brands'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      qc.invalidateQueries({ queryKey: ['brands'] })
      setModalOpen(false)
    } catch {
      alert('Error saving brand')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this brand?')) return
    await fetch(`/api/brands/${id}`, { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['brands'] })
  }

  const columns = [
    { key: 'name', label: 'Brand Name', render: (v: string) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'website', label: 'Website', render: (v: string) => v ? <a href={v} target="_blank" rel="noopener" className="text-brand text-xs hover:underline">{v}</a> : <span className="text-gray-400">—</span> },
    { key: '_count', label: 'Products', render: (v: any) => v?.products || 0 },
    { key: 'isActive', label: 'Status', render: (v: boolean) => <Badge variant={v ? 'success' : 'danger'}>{v ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: any) => (
        <div className="flex gap-1">
          <button onClick={() => openModal(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand"><Pencil size={14} /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product brands</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Brand</Button>
      </div>

      <DataTable data={data?.data || []} columns={columns as any} loading={isLoading} emptyMessage="No brands yet" />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Brand' : 'Add Brand'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input label="Brand Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Logo URL" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." />
              <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={loading}>{editing ? 'Save' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
