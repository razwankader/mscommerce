'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Banknote, ShoppingBag, Loader2 } from 'lucide-react'
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

  useEffect(() => {
    fetch('/api/shipping-config')
      .then((r) => r.json())
      .then(setShippingConfig)
      .catch(() => setShippingConfig({ threshold: null, cost: 150 }))
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || prefilled) return
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
                {prefilled && (
                  <Link href="/account" className="text-xs text-brand hover:underline">
                    Edit profile
                  </Link>
                )}
              </div>
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
            </div>
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
