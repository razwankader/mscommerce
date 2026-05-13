'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Loader2, MapPin, Phone, Mail } from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  subtotal: string | number
  shipping: string | number
  tax: string | number
  total: string | number
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string | null
  zipCode: string | null
  notes: string | null
  createdAt: string
  orderItems: {
    id: string
    quantity: number
    price: string | number
    product: { id: string; name: string; slug: string; images: string[] }
  }[]
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED:  'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED:  'bg-green-50 text-green-700 border-green-200',
  CANCELLED:  'bg-red-50 text-red-600 border-red-200',
  REFUNDED:   'bg-gray-100 text-gray-600 border-gray-200',
}

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/account/orders/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null } return r.json() })
      .then(d => { if (d) setOrder(d); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-brand" />
    </div>
  )

  if (notFound || !order) return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
      <p className="text-gray-500">Order not found.</p>
      <Link href="/account/orders" className="text-brand text-sm hover:underline mt-2 inline-block">Back to orders</Link>
    </div>
  )

  const stepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelledOrRefunded = ['CANCELLED', 'REFUNDED'].includes(order.status)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="text-gray-400 hover:text-brand transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status] || ''}`}>
          {order.status}
        </span>
      </div>

      {/* Status tracker */}
      {!isCancelledOrRefunded && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-brand z-0 transition-all duration-500"
              style={{ width: stepIndex >= 0 ? `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
            />
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= stepIndex ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${i <= stepIndex ? 'text-brand' : 'text-gray-400'}`}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Items Ordered</h2>
        <div className="divide-y divide-gray-50">
          {order.orderItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              {item.product.images?.[0] ? (
                <img src={item.product.images[0]} alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">🚿</div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`}
                  className="text-sm font-medium text-gray-900 hover:text-brand line-clamp-2">
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {formatPrice(Number(item.price))}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Shipping</span>
            <span>{Number(order.shipping) === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(Number(order.shipping))}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span><span className="text-brand">{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Delivery Details</h2>
        <div className="space-y-2.5 text-sm text-gray-600">
          <div className="flex items-start gap-2.5">
            <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{order.firstName} {order.lastName}</p>
              <p>{order.address}, {order.city}{order.state ? `, ${order.state}` : ''}{order.zipCode ? ` ${order.zipCode}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={15} className="text-gray-400 shrink-0" />
            <span>{order.phone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail size={15} className="text-gray-400 shrink-0" />
            <span>{order.email}</span>
          </div>
          {order.notes && (
            <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">Note: {order.notes}</p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Payment method: <span className="font-medium text-gray-700">Cash on Delivery</span></p>
        </div>
      </div>
    </div>
  )
}
