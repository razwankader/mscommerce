'use client'

import { useState, useEffect } from 'react'
import { Package, TrendingUp, TrendingDown, RotateCcw, Wrench, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const TYPE_META: Record<string, { label: string; color: string; icon: any; sign: string }> = {
  PURCHASE:   { label: 'Purchase',   color: 'text-green-600 bg-green-50',  icon: TrendingUp,   sign: '+' },
  SALE:       { label: 'Sale',       color: 'text-red-600 bg-red-50',      icon: TrendingDown, sign: '' },
  ADJUSTMENT: { label: 'Adjustment', color: 'text-blue-600 bg-blue-50',    icon: Wrench,       sign: '' },
  RETURN:     { label: 'Return',     color: 'text-orange-600 bg-orange-50',icon: RotateCcw,    sign: '+' },
}

export function StockTab({ productId, currentStock }: { productId: string; currentStock: number }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ type: 'PURCHASE', quantity: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [stock, setStock] = useState(currentStock)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/stock/${productId}`)
    const data = await res.json()
    setTransactions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.quantity || Number(form.quantity) <= 0) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/stock/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: form.type, quantity: Number(form.quantity), note: form.note }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed')
        return
      }
      const tx = await res.json()
      setStock(tx.balanceAfter)
      setForm({ type: 'PURCHASE', quantity: '', note: '' })
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current stock */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
          <Package size={18} className="text-brand" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Current Stock</p>
          <p className="text-2xl font-extrabold text-gray-900">{stock} <span className="text-sm font-normal text-gray-500">units</span></p>
        </div>
      </div>

      {/* Add transaction */}
      <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-900">Add Stock Transaction</p>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="PURCHASE">Purchase (restock)</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="RETURN">Return</option>
            <option value="SALE">Manual Sale</option>
          </Select>
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="0"
            required
          />
        </div>
        <Input
          label="Note (optional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="e.g. Received from supplier"
        />
        <Button type="submit" loading={saving} className="w-full">Record Transaction</Button>
      </form>

      {/* Transaction history */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Transaction History</p>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {transactions.map((tx) => {
              const meta = TYPE_META[tx.type] ?? TYPE_META.ADJUSTMENT
              const Icon = meta.icon
              const isNeg = tx.quantity < 0
              return (
                <div key={tx.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-700">{meta.label}</span>
                      <span className={`text-sm font-bold ${isNeg ? 'text-red-600' : 'text-green-600'}`}>
                        {isNeg ? '' : '+'}{tx.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 truncate">
                        {tx.note || (tx.order ? `Order ${tx.order.orderNumber}` : '—')}
                        {tx.createdByUser ? ` · ${tx.createdByUser.name}` : ''}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        Balance: <strong className="text-gray-600">{tx.balanceAfter}</strong>
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
