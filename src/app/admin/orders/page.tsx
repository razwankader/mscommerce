'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Search, AlertTriangle, Plus, Trash2, Pencil, Check, X, FileText, ChevronDown } from 'lucide-react'
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
  const [paymentFilter, setPaymentFilter] = useState('')
  const [viewOrder, setViewOrder] = useState<any>(null)
  type NewPayment = { method: string; amount: string; referenceId: string; bankName: string; paidAt: string }
  const EMPTY_PAYMENT: NewPayment = { method: 'COD', amount: '', referenceId: '', bankName: '', paidAt: '' }
  const [newPayment, setNewPayment] = useState<NewPayment>(EMPTY_PAYMENT)
  const [paymentError, setPaymentError] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [editingPayment, setEditingPayment] = useState<NewPayment>(EMPTY_PAYMENT)
  const [savingEdit, setSavingEdit] = useState(false)
  const [paymentsOpen, setPaymentsOpen] = useState(false)

  function openOrder(row: any) {
    setViewOrder(row)
    setNewPayment(EMPTY_PAYMENT)
    setPaymentError('')
    setEditingPaymentId(null)
  }

  function startEdit(p: any) {
    setEditingPaymentId(p.id)
    setEditingPayment({
      method: p.method,
      amount: p.amount != null ? String(Number(p.amount)) : '',
      referenceId: p.referenceId || '',
      bankName: p.bankName || '',
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString().slice(0, 16) : '',
    })
  }

  async function saveEdit(paymentId: string) {
    if (!viewOrder) return
    setSavingEdit(true)
    const res = await fetch(`/api/orders/${viewOrder.id}/payments/${paymentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: editingPayment.method,
        amount: editingPayment.amount ? Number(editingPayment.amount) : null,
        referenceId: editingPayment.referenceId || null,
        bankName: editingPayment.method === 'BANK' ? (editingPayment.bankName || null) : null,
        paidAt: editingPayment.paidAt || null,
      }),
    })
    setSavingEdit(false)
    if (!res.ok) {
      const err = await res.json()
      setPaymentError(err.error || 'Failed to update payment')
      return
    }
    const updated = await res.json()
    setViewOrder((o: any) => ({
      ...o,
      payments: (o.payments || []).map((p: any) => p.id === paymentId ? updated : p),
    }))
    setEditingPaymentId(null)
    qc.invalidateQueries({ queryKey: ['orders'] })
  }

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter, paymentFilter],
    queryFn: () => {
      const qs = new URLSearchParams({ page: String(page), limit: '10', search, status: statusFilter, paymentStatus: paymentFilter })
      return fetch(`/api/orders?${qs}`).then((r) => r.json())
    },
  })

  async function updateStatus(id: string, status: string) {
    setPaymentError('')
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const err = await res.json()
      setPaymentError(err.error || 'Failed to update status')
      return
    }
    qc.invalidateQueries({ queryKey: ['orders'] })
    if (viewOrder?.id === id) setViewOrder((o: any) => ({ ...o, status }))
  }

  async function addPaymentToOrder() {
    if (!viewOrder) return
    setSavingPayment(true)
    setPaymentError('')
    const res = await fetch(`/api/orders/${viewOrder.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: newPayment.method,
        amount: newPayment.amount ? Number(newPayment.amount) : null,
        referenceId: newPayment.referenceId || null,
        bankName: newPayment.method === 'BANK' ? (newPayment.bankName || null) : null,
        paidAt: newPayment.paidAt || null,
      }),
    })
    setSavingPayment(false)
    if (!res.ok) {
      const err = await res.json()
      setPaymentError(err.error || 'Failed to add payment')
      return
    }
    const added = await res.json()
    setViewOrder((o: any) => ({ ...o, payments: [...(o.payments || []), added] }))
    setNewPayment(EMPTY_PAYMENT)
    qc.invalidateQueries({ queryKey: ['orders'] })
  }

  async function deletePayment(paymentId: string) {
    if (!viewOrder) return
    await fetch(`/api/orders/${viewOrder.id}/payments/${paymentId}`, { method: 'DELETE' })
    setViewOrder((o: any) => ({ ...o, payments: (o.payments || []).filter((p: any) => p.id !== paymentId) }))
    qc.invalidateQueries({ queryKey: ['orders'] })
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
    {
      key: 'isPaid',
      label: 'Payment',
      render: (_v: any, row: any) => {
        const paid = (row.payments || []).reduce((sum: number, p: any) => sum + (p.amount ? Number(p.amount) : 0), 0)
        const total = Number(row.total)
        const isPaid = paid >= total
        const due = total - paid
        return (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {isPaid ? 'Paid' : `Due ${formatPrice(due)}`}
          </span>
        )
      },
    },
    { key: 'total', label: 'Total', render: (v: number) => <span className="font-semibold">{formatPrice(Number(v))}</span> },
    { key: 'createdAt', label: 'Date', render: (v: string) => <span className="text-xs text-gray-500">{formatDate(v)}</span> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: any) => (
        <button onClick={() => openOrder(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand">
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
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none bg-white"
        >
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="due">Due</option>
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
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Order {viewOrder.orderNumber}</h2>
                  {(() => {
                    const paid = (viewOrder.payments || []).reduce((sum: number, p: any) => sum + (p.amount ? Number(p.amount) : 0), 0)
                    const total = Number(viewOrder.total)
                    const isPaid = paid >= total
                    const due = total - paid
                    return (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {isPaid ? 'Paid' : `Due ${formatPrice(due)}`}
                      </span>
                    )
                  })()}
                </div>
                <p className="text-xs text-gray-500">{formatDate(viewOrder.createdAt)}</p>
              </div>
              <button onClick={() => { setViewOrder(null); setPaymentError('') }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
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
                <Link
                  href={`/invoice/${viewOrder.orderNumber}`}
                  target="_blank"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-brand border border-brand px-2.5 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors"
                >
                  <FileText size={13} />
                  Invoice
                </Link>
              </div>

              {/* Payment Info */}
              <div className="border border-gray-100 rounded-xl bg-gray-50">
                <button
                  type="button"
                  onClick={() => setPaymentsOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide"
                >
                  Payments
                  <ChevronDown size={14} className={`transition-transform ${paymentsOpen ? 'rotate-180' : ''}`} />
                </button>

                {paymentsOpen && <div className="px-4 pb-4 space-y-3">
                {/* Existing payments */}
                {(viewOrder.payments || []).length > 0 && (
                  <div className="space-y-2">
                    {(viewOrder.payments || []).map((p: any) => (
                      <div key={p.id} className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-xs">
                        {editingPaymentId === p.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-1.5">
                              {(['COD', 'BKASH', 'NAGAD', 'ROCKET', 'BANK'] as const).map((m) => (
                                <button key={m} type="button"
                                  onClick={() => setEditingPayment(e => ({ ...e, method: m, referenceId: '', bankName: '' }))}
                                  className={`py-1 rounded-md text-[11px] font-semibold border transition-colors ${editingPayment.method === m ? 'bg-brand text-white border-brand' : 'text-gray-600 border-gray-200 hover:border-brand'}`}
                                >
                                  {m === 'COD' ? 'Cash' : m === 'BANK' ? 'Bank' : m.charAt(0) + m.slice(1).toLowerCase()}
                                </button>
                              ))}
                            </div>
                            <input type="number" value={editingPayment.amount}
                              onChange={(e) => setEditingPayment(p => ({ ...p, amount: e.target.value }))}
                              placeholder="Amount ৳ (optional)"
                              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                            />
                            {editingPayment.method === 'BANK' && (
                              <input type="text" value={editingPayment.bankName}
                                onChange={(e) => setEditingPayment(p => ({ ...p, bankName: e.target.value }))}
                                placeholder="Bank name"
                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                              />
                            )}
                            {editingPayment.method !== 'COD' && (
                              <>
                                <input type="text" value={editingPayment.referenceId}
                                  onChange={(e) => setEditingPayment(p => ({ ...p, referenceId: e.target.value }))}
                                  placeholder="Reference / TrxID"
                                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                                />
                                <input type="datetime-local" value={editingPayment.paidAt}
                                  onChange={(e) => setEditingPayment(p => ({ ...p, paidAt: e.target.value }))}
                                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                                />
                              </>
                            )}
                            <div className="flex gap-2">
                              <button type="button" onClick={() => saveEdit(p.id)} disabled={savingEdit}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-brand text-white text-[11px] font-semibold hover:bg-orange-600 disabled:opacity-60"
                              >
                                <Check size={11} /> {savingEdit ? 'Saving…' : 'Save'}
                              </button>
                              <button type="button" onClick={() => setEditingPaymentId(null)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-[11px] hover:bg-gray-50"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-semibold text-gray-800">
                                {p.method === 'COD' ? 'Cash' : p.method === 'BANK' ? `Bank${p.bankName ? ` — ${p.bankName}` : ''}` : p.method.charAt(0) + p.method.slice(1).toLowerCase()}
                              </span>
                              {p.amount != null && <span className="ml-2 text-brand font-semibold">৳{Number(p.amount).toLocaleString('en-BD')}</span>}
                              {p.referenceId && <div className="text-gray-500 mt-0.5">Ref: {p.referenceId}</div>}
                              <div className="text-gray-400 mt-0.5">{new Date(p.paidAt).toLocaleString('en-BD')}</div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2 mt-0.5">
                              <button type="button" onClick={() => startEdit(p)} className="text-gray-400 hover:text-brand transition-colors">
                                <Pencil size={12} />
                              </button>
                              <button type="button" onClick={() => deletePayment(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new payment */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Plus size={12} /> Add Payment</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['COD', 'BKASH', 'NAGAD', 'ROCKET', 'BANK'] as const).map((m) => (
                      <button key={m} type="button"
                        onClick={() => setNewPayment(p => ({ ...p, method: m, referenceId: '', bankName: '' }))}
                        className={`py-1 rounded-md text-[11px] font-semibold border transition-colors ${newPayment.method === m ? 'bg-brand text-white border-brand' : 'text-gray-600 border-gray-200 hover:border-brand'}`}
                      >
                        {m === 'COD' ? 'Cash' : m === 'BANK' ? 'Bank' : m.charAt(0) + m.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  <input type="number" value={newPayment.amount}
                    onChange={(e) => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                    placeholder="Amount ৳ (optional)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                  />
                  {newPayment.method === 'BANK' && (
                    <input type="text" value={newPayment.bankName}
                      onChange={(e) => setNewPayment(p => ({ ...p, bankName: e.target.value }))}
                      placeholder="Bank name"
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                    />
                  )}
                  {newPayment.method !== 'COD' && (
                    <>
                      <input type="text" value={newPayment.referenceId}
                        onChange={(e) => setNewPayment(p => ({ ...p, referenceId: e.target.value }))}
                        placeholder="Reference / TrxID"
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                      />
                      <input type="datetime-local" value={newPayment.paidAt}
                        onChange={(e) => setNewPayment(p => ({ ...p, paidAt: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                      />
                      <p className="text-[10px] text-gray-400">Leave date/time blank to use current timestamp</p>
                    </>
                  )}
                  <button type="button" onClick={addPaymentToOrder} disabled={savingPayment}
                    className="w-full py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
                  >
                    {savingPayment ? 'Saving…' : 'Add Payment'}
                  </button>
                </div>
                </div>}
              </div>

              {paymentError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  {paymentError}
                </div>
              )}

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
