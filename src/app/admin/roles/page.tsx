'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Lock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { PERMISSION_DEFINITIONS } from '@/lib/permissions'

interface RoleData {
  id: string
  name: string
  label: string
  description?: string | null
  isSystem: boolean
  permissions: string[]
  userCount: number
  createdAt: string
}

interface PermissionRecord {
  id: string
  key: string
  label: string
  group: string
}

// ─── Role Modal ──────────────────────────────────────────────────────────────

function RoleModal({
  role,
  allPermissions,
  onClose,
  onSuccess,
}: {
  role?: RoleData
  allPermissions: PermissionRecord[]
  onClose: () => void
  onSuccess: () => void
}) {
  const isEdit = Boolean(role)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: role?.name ?? '',
    label: role?.label ?? '',
    description: role?.description ?? '',
    permissions: new Set<string>(role?.permissions ?? []),
  })

  // Group permissions by their group
  const grouped = useMemo(() => {
    const map: Record<string, PermissionRecord[]> = {}
    for (const p of allPermissions) {
      if (!map[p.group]) map[p.group] = []
      map[p.group].push(p)
    }
    return map
  }, [allPermissions])

  function togglePermission(key: string) {
    setForm(f => {
      const next = new Set(f.permissions)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { ...f, permissions: next }
    })
  }

  function toggleGroup(group: string, keys: string[]) {
    const allSelected = keys.every(k => form.permissions.has(k))
    setForm(f => {
      const next = new Set(f.permissions)
      if (allSelected) keys.forEach(k => next.delete(k))
      else keys.forEach(k => next.add(k))
      return { ...f, permissions: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/roles/${role!.id}` : '/api/admin/roles'
      const method = isEdit ? 'PUT' : 'POST'
      const body: any = {
        label: form.label,
        description: form.description || null,
        permissions: Array.from(form.permissions),
      }
      if (!isEdit) {
        body.name = form.name
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error saving role')
      }
      onSuccess()
    } catch (err: any) {
      alert(err.message || 'Error saving role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Role' : 'New Role'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
                placeholder="e.g. STOCK_MANAGER"
                disabled={isEdit}
                required
              />
              {!isEdit && (
                <p className="mt-1 text-xs text-gray-400">
                  Uppercase letters, numbers, and underscores only. Cannot be changed after creation.
                </p>
              )}
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Label <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Stock Manager"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
              <div className="space-y-4">
                {Object.entries(grouped).map(([group, perms]) => {
                  const keys = perms.map(p => p.key)
                  const allSelected = keys.every(k => form.permissions.has(k))
                  const someSelected = keys.some(k => form.permissions.has(k))

                  return (
                    <div key={group} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Group header */}
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={el => {
                            if (el) el.indeterminate = someSelected && !allSelected
                          }}
                          onChange={() => toggleGroup(group, keys)}
                          className="rounded border-gray-300 text-brand focus:ring-brand"
                        />
                        <span className="text-sm font-semibold text-gray-700">{group}</span>
                      </div>
                      {/* Permission rows */}
                      <div className="divide-y divide-gray-100">
                        {perms.map(perm => (
                          <label
                            key={perm.key}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={form.permissions.has(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="rounded border-gray-300 text-brand focus:ring-brand"
                            />
                            <div>
                              <p className="text-sm text-gray-700">{perm.label}</p>
                              <p className="text-xs text-gray-400 font-mono">{perm.key}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stale session note */}
            {isEdit && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                Note: Permission changes take effect on next login for affected users.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RoleData | undefined>(undefined)

  const { data: roles = [], isLoading: rolesLoading } = useQuery<RoleData[]>({
    queryKey: ['admin-roles'],
    queryFn: () => fetch('/api/admin/roles').then(r => r.json()),
  })

  const { data: allPermissions = [] } = useQuery<PermissionRecord[]>({
    queryKey: ['admin-permissions'],
    queryFn: () => fetch('/api/admin/permissions').then(r => r.json()),
  })

  function openCreate() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(role: RoleData) {
    setEditing(role)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(undefined)
  }

  function handleSuccess() {
    qc.invalidateQueries({ queryKey: ['admin-roles'] })
    closeModal()
  }

  async function handleDelete(role: RoleData) {
    if (role.isSystem) return
    if (role.userCount > 0) {
      alert(`Cannot delete: ${role.userCount} user(s) are assigned to this role.`)
      return
    }
    if (!confirm(`Delete role "${role.label}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error')
      }
      qc.invalidateQueries({ queryKey: ['admin-roles'] })
    } catch (err: any) {
      alert(err.message || 'Error deleting role')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Role',
      render: (_: string, row: RoleData) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 font-mono text-sm">{row.name}</span>
            {row.isSystem && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                <Lock size={10} />
                System
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{row.label}</p>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (val: string | null) => (
        <span className="text-sm text-gray-600">{val || '—'}</span>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (perms: string[]) => (
        <Badge variant="info">{perms.length} permissions</Badge>
      ),
    },
    {
      key: 'userCount',
      label: 'Users',
      render: (count: number) => (
        <span className="text-sm text-gray-700">{count}</span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: RoleData) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEdit(row)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={row.isSystem || row.userCount > 0}
            onClick={() => handleDelete(row)}
            className="text-red-500 hover:text-red-600 hover:border-red-300 disabled:opacity-40"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles &amp; Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage custom roles and their permissions. System roles cannot be deleted.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          New Role
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={roles}
        columns={columns}
        loading={rolesLoading}
        emptyMessage="No roles found."
      />

      {/* Modal */}
      {modalOpen && (
        <RoleModal
          role={editing}
          allPermissions={allPermissions}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
