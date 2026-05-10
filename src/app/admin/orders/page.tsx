'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { formatPrice, formatDate } from '@/lib/utils'

const statusVariant: Record<string, any> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'danger',
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export default function OrdersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewOrder, setViewOrder] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), limit: '10', search, status: statusFilter })
      return fetch(`/api/orders?${qs}`).then((r) => r.json())
    },
  })

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    qc.invalidateQueries({ queryKey: ['orders'] })
    if (viewOrder?.id === id) setViewOrder((o: any) => ({ ...o, status }))
  }

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v: string) => <span className="font-mono font-medium text-gray-900 text-xs">{v}</span> },
    {
      key: 'firstName',
      label: 'Customer',
      render: (v: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{v} {row.lastName}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (v: string) => <Badge variant={statusVariant[v]}>{v}</Badge> },
    { key: 'total', label: 'Total', render: (v: number) => <span className="font-semibold">{formatPrice(Number(v))}</span> },
    { key: 'createdAt', label: 'Date', render: (v: string) => <span className="text-xs text-gray-500">{formatDate(v)}</span> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: any) => (
        <button onClick={() => setViewOrder(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand">
          <Eye size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage customer orders</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none bg-white"
        >
          <option value="">All Status</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
        emptyMessage="No orders yet"
      />

      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold">Order {viewOrder.orderNumber}</h2>
                <p className="text-xs text-gray-500">{formatDate(viewOrder.createdAt)}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <select
                  value={viewOrder.status}
                  onChange={(e) => updateStatus(viewOrder.id, e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none bg-white"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Customer</p>
                  <p className="text-gray-900">{viewOrder.firstName} {viewOrder.lastName}</p>
                  <p className="text-gray-600">{viewOrder.email}</p>
                  <p className="text-gray-600">{viewOrder.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Shipping</p>
                  <p className="text-gray-900">{viewOrder.address}</p>
                  <p className="text-gray-600">{viewOrder.city}{viewOrder.state ? `, ${viewOrder.state}` : ''}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Items</p>
                <div className="space-y-2">
                  {viewOrder.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(viewOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{Number(viewOrder.shipping) === 0 ? 'Free' : formatPrice(Number(viewOrder.shipping))}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(Number(viewOrder.total))}</span>
                </div>
              </div>

              {viewOrder.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                  <p className="text-sm text-gray-600">{viewOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
