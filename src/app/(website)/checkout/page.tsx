'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Banknote, ShoppingBag, Loader2, Plus, Trash2, Search, UserCheck, UserPlus } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useSession } from 'next-auth/react'

interface ShippingConfig {
  threshold: number | null
  cost: number
}

function formatPrice(n: number) {
  return '৳' + n.toLocaleString('en-BD')
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  notes: string
}

const INITIAL: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  notes: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, count, subtotal, discount, total, clearCart } = useCart()
  const { data: session, status } = useSession()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig | null>(null)
  const [prefilled, setPrefilled] = useState(false)

  // Staff: offline customer lookup
  const [customerPhone, setCustomerPhone] = useState('')
  const [lookingUp, setLookingUp] = useState(false)
  const [offlineCustomerId, setOfflineCustomerId] = useState<string | null>(null)
  const [customerStatus, setCustomerStatus] = useState<'idle' | 'found' | 'new'>('idle')

  // Staff: sales rep & commission
  const [salesReps, setSalesReps] = useState<{ id: string; name: string; phone: string | null; defaultCommissionRate: number | null }[]>([])
  const [salesRepId, setSalesRepId] = useState('')
  const [commMode, setCommMode] = useState<'pct' | 'flat'>('pct')
  const [commInput, setCommInput] = useState('')

  type PaymentEntry = { id: number; method: string; amount: string; referenceId: string; bankName: string; paidAt: string }
  const [payments, setPayments] = useState<PaymentEntry[]>([{ id: Date.now(), method: 'COD', amount: '', referenceId: '', bankName: '', paidAt: '' }])

  function addPayment() {
    setPayments(p => [...p, { id: Date.now(), method: 'COD', amount: '', referenceId: '', bankName: '', paidAt: '' }])
  }
  function removePayment(id: number) {
    setPayments(p => p.filter(e => e.id !== id))
  }
  function updatePayment(id: number, field: keyof PaymentEntry, value: string) {
    setPayments(p => p.map(e => e.id === id ? { ...e, [field]: value, ...(field === 'method' ? { referenceId: '', bankName: '' } : {}) } : e))
  }

  async function lookupCustomer() {
    if (!customerPhone.trim()) return
    setLookingUp(true)
    setOfflineCustomerId(null)
    setCustomerStatus('idle')
    // Clear form first
    setForm(INITIAL)
    const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(customerPhone.trim())}`)
    const data = await res.json()
    setLookingUp(false)
    if (data && data.id) {
      // Existing offline customer — prefill from profile
      const parts = (data.name || '').trim().split(' ')
      setForm({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        phone: data.phone || customerPhone.trim(),
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: '',
        notes: '',
      })
      setOfflineCustomerId(data.id)
      setCustomerStatus('found')
    } else {
      // New customer — only prefill the searched phone
      setForm({ ...INITIAL, phone: customerPhone.trim() })
      setOfflineCustomerId(null)
      setCustomerStatus('new')
    }
  }

  useEffect(() => {
    fetch('/api/shipping-config')
      .then((r) => r.json())
      .then(setShippingConfig)
      .catch(() => setShippingConfig({ threshold: null, cost: 150 }))
  }, [])

  const isStaff = (session?.user?.permissions?.length ?? 0) > 0

  useEffect(() => {
    if (status !== 'authenticated' || !isStaff) return
    fetch('/api/sales-reps').then(r => r.json()).then(d => setSalesReps(d.data || []))
  }, [status, isStaff])


  useEffect(() => {
    if (status !== 'authenticated' || prefilled || isStaff) return
    fetch('/api/account/profile')
      .then(r => r.ok ? r.json() : null)
      .then(profile => {
        if (!profile) return
        const parts = (profile.name || '').trim().split(' ')
        const firstName = parts[0] || ''
        const lastName = parts.slice(1).join(' ') || ''
        setForm(f => ({
          ...f,
          firstName: firstName || f.firstName,
          lastName: lastName || f.lastName,
          email: profile.email || f.email,
          phone: profile.phone || f.phone,
        }))
        setPrefilled(true)
      })
  }, [status, prefilled])

  const shipping = shippingConfig
    ? (shippingConfig.threshold !== null && subtotal >= shippingConfig.threshold ? 0 : shippingConfig.cost)
    : 0
  const grandTotal = total + shipping

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e: Partial<FormData> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          notes: form.notes,
          discount,
          // Staff: sales rep & commission
          ...(isStaff && salesRepId && { salesRepId }),
          ...(isStaff && commInput && parseFloat(commInput) > 0 && (() => {
            const val = parseFloat(commInput)
            const grandTotal = total + (shippingConfig ? (shippingConfig.threshold !== null && subtotal >= shippingConfig.threshold ? 0 : shippingConfig.cost) : 0)
            return commMode === 'pct'
              ? { commissionRate: val, commissionAmount: Math.round(grandTotal * val / 100 * 100) / 100 }
              : { commissionAmount: val, commissionRate: Math.round(val / grandTotal * 10000) / 100 }
          })()),
          // Staff: offline customer resolution
          ...(isStaff && offlineCustomerId && { offlineCustomerId }),
          ...(isStaff && !offlineCustomerId && customerStatus === 'new' && {
            createOfflineCustomer: {
              name: `${form.firstName} ${form.lastName}`.trim(),
              phone: form.phone,
              email: form.email || null,
              address: form.address || null,
              city: form.city || null,
            },
          }),
          payments: isStaff ? payments.map(p => ({
            method: p.method,
            amount: p.amount ? Number(p.amount) : null,
            referenceId: p.referenceId || null,
            bankName: p.method === 'BANK' ? (p.bankName || null) : null,
            paidAt: p.paidAt || null,
          })) : undefined,
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            customPrice: i.customPrice ?? undefined,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const order = await res.json()
      clearCart()
      router.push(`/order-success?order=${order.orderNumber}`)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <Link href="/products" className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-dark transition-colors mt-4">
          <ArrowLeft size={16} /> Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to Cart
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — delivery info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">Delivery Information</h2>
                {prefilled && !isStaff && (
                  <Link href="/account" className="text-xs text-brand hover:underline">
                    Edit profile
                  </Link>
                )}
              </div>

              {/* Staff: customer phone lookup */}
              {isStaff && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Customer Phone Lookup</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => { setCustomerPhone(e.target.value); setCustomerStatus('idle'); setOfflineCustomerId(null) }}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), lookupCustomer())}
                      placeholder="017XXXXXXXX"
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={lookupCustomer}
                      disabled={lookingUp || !customerPhone.trim()}
                      className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {lookingUp ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      Search
                    </button>
                  </div>
                  {customerStatus === 'found' && (
                    <p className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1.5">
                      <UserCheck size={13} /> Existing customer found — form prefilled from profile
                    </p>
                  )}
                  {customerStatus === 'new' && (
                    <p className="mt-2 text-xs text-orange-600 font-medium flex items-center gap-1.5">
                      <UserPlus size={13} /> New customer — profile will be created on submit
                    </p>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name *" error={errors.firstName}>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    placeholder="Rahim"
                    className={inputCls(errors.firstName)}
                  />
                </Field>
                <Field label="Last Name *" error={errors.lastName}>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    placeholder="Uddin"
                    className={inputCls(errors.lastName)}
                  />
                </Field>
                <Field label="Phone *" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="017XXXXXXXX"
                    className={inputCls(errors.phone)}
                  />
                </Field>
                <Field label="Email (optional)">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls()}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Full Address *" error={errors.address}>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="House/Flat, Road, Area"
                      className={inputCls(errors.address) + ' resize-none'}
                    />
                  </Field>
                </div>
                <Field label="City *" error={errors.city}>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="Dhaka"
                    className={inputCls(errors.city)}
                  />
                </Field>
                <Field label="District (optional)">
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                    placeholder="Dhaka"
                    className={inputCls()}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Order Notes (optional)">
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => set('notes', e.target.value)}
                      placeholder="Any special instructions..."
                      className={inputCls() + ' resize-none'}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Payment Method</h2>
              {isStaff ? (
                <div className="space-y-3">
                  {payments.map((entry, idx) => (
                    <div key={entry.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Payment {idx + 1}</span>
                        {payments.length > 1 && (
                          <button type="button" onClick={() => removePayment(entry.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['COD', 'BKASH', 'NAGAD', 'ROCKET', 'BANK'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => updatePayment(entry.id, 'method', m)}
                            className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              entry.method === m ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand'
                            }`}
                          >
                            {m === 'COD' ? 'Cash' : m === 'BANK' ? 'Bank' : m.charAt(0) + m.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={entry.amount}
                        onChange={(e) => updatePayment(entry.id, 'amount', e.target.value)}
                        placeholder="Amount ৳ (optional)"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                      {entry.method !== 'COD' && (
                        <>
                          {entry.method === 'BANK' && (
                            <input
                              type="text"
                              value={entry.bankName}
                              onChange={(e) => updatePayment(entry.id, 'bankName', e.target.value)}
                              placeholder="Bank name (e.g. Dutch-Bangla)"
                              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                            />
                          )}
                          <input
                            type="text"
                            value={entry.referenceId}
                            onChange={(e) => updatePayment(entry.id, 'referenceId', e.target.value)}
                            placeholder="Reference / Transaction ID"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                          />
                          <input
                            type="datetime-local"
                            value={entry.paidAt}
                            onChange={(e) => updatePayment(entry.id, 'paidAt', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                          />
                          <p className="text-[10px] text-gray-400">Leave date/time blank to use current timestamp</p>
                        </>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPayment}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand hover:text-brand transition-colors"
                  >
                    <Plus size={15} /> Add Another Payment
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand bg-brand/5">
                  <Banknote size={22} className="text-brand shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-brand bg-brand flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Staff: Sales Rep & Commission */}
            {isStaff && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Sales Rep & Commission</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sales Representative</label>
                    <select
                      value={salesRepId}
                      onChange={e => {
                        const rep = salesReps.find(r => r.id === e.target.value)
                        setSalesRepId(e.target.value)
                        if (rep?.defaultCommissionRate != null && !commInput) {
                          setCommMode('pct')
                          setCommInput(String(Number(rep.defaultCommissionRate)))
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    >
                      <option value="">— No Sales Rep —</option>
                      {salesReps.map(r => (
                        <option key={r.id} value={r.id}>{r.name}{r.phone ? ` (${r.phone})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Commission (optional)</label>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs shrink-0">
                        <button type="button" onClick={() => setCommMode('pct')}
                          className={`px-2.5 py-2 font-medium transition-colors ${commMode === 'pct' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}>%</button>
                        <button type="button" onClick={() => setCommMode('flat')}
                          className={`px-2.5 py-2 font-medium transition-colors ${commMode === 'flat' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}>৳</button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={commInput}
                        onChange={e => setCommInput(e.target.value)}
                        placeholder={commMode === 'pct' ? 'e.g. 5' : 'Amount'}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    {commInput && parseFloat(commInput) > 0 && (() => {
                      const val = parseFloat(commInput)
                      const shipping2 = shippingConfig ? (shippingConfig.threshold !== null && subtotal >= shippingConfig.threshold ? 0 : shippingConfig.cost) : 0
                      const grandTotal2 = total + shipping2
                      const amount = commMode === 'pct' ? Math.round(grandTotal2 * val / 100 * 100) / 100 : val
                      const rate = commMode === 'flat' ? Math.round(val / grandTotal2 * 10000) / 100 : val
                      return <p className="text-xs text-brand font-medium mt-1.5">Commission: ৳{amount.toLocaleString('en-BD')} ({rate}%)</p>
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => {
                  const unitPrice = item.customPrice ?? item.salePrice ?? item.price
                  return (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🚿</div>
                        )}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.name}</p>
                        <p className="text-xs text-brand font-semibold mt-0.5">{formatPrice(unitPrice * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingConfig === null
                      ? '—'
                      : shipping === 0
                      ? 'Free'
                      : formatPrice(shipping)}
                  </span>
                </div>
                {shippingConfig && shippingConfig.threshold !== null && total < shippingConfig.threshold && (
                  <p className="text-xs text-gray-400">
                    Add {formatPrice(shippingConfig.threshold - total)} more for free delivery
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

    </div>
  )
}

function inputCls(error?: string) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors ${
    error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
      : 'border-gray-200 focus:border-brand focus:ring-brand'
  }`
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
