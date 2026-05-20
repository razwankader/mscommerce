'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', parentId: '', order: '0' })
  const [loading, setLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  })

  const allCats: any[] = data?.data || []
  const rootCats = allCats.filter((c) => !c.parentId)

  function openModal(cat?: any) {
    setEditing(cat || null)
    setForm({ name: cat?.name || '', description: cat?.description || '', parentId: cat?.parentId || '', order: String(cat?.order || 0) })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing ? `/api/categories/${editing.id}` : '/api/categories'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, order: Number(form.order) }),
      })
      if (!res.ok) throw new Error()
      qc.invalidateQueries({ queryKey: ['categories'] })
      setModalOpen(false)
    } catch {
      alert('Error saving category')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this category?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['categories'] })
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (name: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          {row.parentId && <p className="text-xs text-gray-400">Sub-category</p>}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (v: string) => <span className="text-gray-500 text-xs">{v || '—'}</span>,
    },
    {
      key: '_count',
      label: 'Products',
      render: (v: any) => <span>{v?.products || 0}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v: boolean) => <Badge variant={v ? 'success' : 'danger'}>{v ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: any) => (
        <div className="flex gap-1">
          <button onClick={() => openModal(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize products into categories</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <DataTable
        data={allCats}
        columns={columns as any}
        loading={isLoading}
        emptyMessage="No categories yet"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              <Select label="Parent Category" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                <option value="">— Top Level —</option>
                {rootCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              <Input label="Display Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
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
