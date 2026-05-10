'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, UserX, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { formatDate } from '@/lib/utils'

const roleVariant: Record<string, any> = {
  ADMIN: 'danger',
  MANAGER: 'info',
  CUSTOMER: 'default',
}

export default function UsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '', isActive: true })
  const [loading, setLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), limit: '10', search, role: roleFilter })
      return fetch(`/api/users?${qs}`).then((r) => r.json())
    },
  })

  function openModal(user?: any) {
    setEditing(user || null)
    setForm({ name: user?.name || '', email: user?.email || '', password: '', role: user?.role || 'CUSTOMER', phone: user?.phone || '', isActive: user?.isActive ?? true })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editing ? `/api/users/${editing.id}` : '/api/users'
      const method = editing ? 'PUT' : 'POST'
      const body = { ...form }
      if (editing && !body.password) delete (body as any).password
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      qc.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
    } catch (err: any) {
      alert(err.message || 'Error saving user')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this user?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    qc.invalidateQueries({ queryKey: ['users'] })
  }

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (name: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (v: string) => v || <span className="text-gray-400">—</span> },
    { key: 'role', label: 'Role', render: (v: string) => <Badge variant={roleVariant[v]}>{v}</Badge> },
    { key: '_count', label: 'Orders', render: (v: any) => v?.orders || 0 },
    { key: 'isActive', label: 'Status', render: (v: boolean) => <Badge variant={v ? 'success' : 'danger'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'createdAt', label: 'Joined', render: (v: string) => <span className="text-xs text-gray-500">{formatDate(v)}</span> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: any) => (
        <div className="flex gap-1">
          <button onClick={() => openModal(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand"><Pencil size={14} /></button>
          <button onClick={() => handleDeactivate(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><UserX size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer and admin accounts</p>
        </div>
        <Button onClick={() => openModal()}><Plus size={16} /> Add User</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none bg-white"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="CUSTOMER">Customer</option>
        </select>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns as any}
        total={data?.total || 0}
        page={page}
        limit={10}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="No users found"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{editing ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label={editing ? 'New Password (leave blank to keep)' : 'Password *'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="CUSTOMER">Customer</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-300 text-brand" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active account</label>
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
