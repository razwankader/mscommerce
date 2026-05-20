'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { formatDate } from '@/lib/utils'

export default function PagesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', content: '', status: 'DRAFT', metaTitle: '', metaDesc: '' })
  const [loading, setLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => fetch('/api/pages').then((r) => r.json()),
  })

  function openModal(p?: any) {
    setEditing(p || null)
    setForm({ title: p?.title || '', content: p?.content || '', status: p?.status || 'DRAFT', metaTitle: p?.metaTitle || '', metaDesc: p?.metaDesc || '' })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing ? `/api/pages/${editing.id}` : '/api/pages'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      qc.invalidateQueries({ queryKey: ['pages'] })
      setModalOpen(false)
    } catch {
      alert('Error saving page')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page?')) return
    await fetch(`/api/pages/${id}`, { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['pages'] })
  }

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (v: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{v}</p>
          <p className="text-xs text-gray-400">/{row.slug}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (v: string) => <Badge variant={v === 'PUBLISHED' ? 'success' : 'warning'}>{v}</Badge> },
    { key: 'updatedAt', label: 'Updated', render: (v: string) => <span className="text-xs text-gray-500">{formatDate(v)}</span> },
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
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage static website pages</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add Page</Button>
      </div>

      <DataTable data={data?.data || []} columns={columns as any} loading={isLoading} emptyMessage="No pages yet" />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Page' : 'Add Page'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Textarea
                label="Content * (HTML supported)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                required
              />
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">SEO</p>
                <div className="space-y-3">
                  <Input label="Meta Title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
                  <Textarea label="Meta Description" value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} rows={2} />
                </div>
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
