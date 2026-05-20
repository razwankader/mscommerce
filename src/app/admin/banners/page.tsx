'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import Image from 'next/image'

export default function BannersPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', order: '0', status: 'ACTIVE' })
  const [loading, setLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => fetch('/api/banners').then((r) => r.json()),
  })

  function openModal(b?: any) {
    setEditing(b || null)
    setForm({ title: b?.title || '', subtitle: b?.subtitle || '', image: b?.image || '', link: b?.link || '', order: String(b?.order || 0), status: b?.status || 'ACTIVE' })
    setModalOpen(true)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const d = await res.json()
    if (d.url) setForm((f) => ({ ...f, image: d.url }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing ? `/api/banners/${editing.id}` : '/api/banners'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, order: Number(form.order) }) })
      if (!res.ok) throw new Error()
      qc.invalidateQueries({ queryKey: ['banners'] })
      setModalOpen(false)
    } catch {
      alert('Error saving banner')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this banner?')) return
    await fetch(`/api/banners/${id}`, { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['banners'] })
  }

  const columns = [
    {
      key: 'image',
      label: '',
      render: (img: string) => img ? (
        <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-100">
          <Image src={img} alt="" fill className="object-cover" />
        </div>
      ) : <div className="w-20 h-12 rounded-lg bg-gray-100" />,
    },
    {
      key: 'title',
      label: 'Title',
      render: (v: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{v}</p>
          {row.subtitle && <p className="text-xs text-gray-400">{row.subtitle}</p>}
        </div>
      ),
    },
    { key: 'link', label: 'Link', render: (v: string) => v || <span className="text-gray-400">—</span> },
    { key: 'order', label: 'Order', render: (v: number) => <span className="font-mono">{v}</span> },
    { key: 'status', label: 'Status', render: (v: string) => <Badge variant={v === 'ACTIVE' ? 'success' : 'warning'}>{v}</Badge> },
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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage homepage banners and sliders</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Banner</Button>
      </div>

      <DataTable data={data?.data || []} columns={columns as any} loading={isLoading} emptyMessage="No banners yet" />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Image *</p>
                {form.image && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <Image src={form.image} alt="" fill className="object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer w-full border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 hover:border-brand transition-colors">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Upload image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
                <Input
                  className="mt-2"
                  placeholder="Or paste image URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>

              <Input label="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/products" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Display Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </div>
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
