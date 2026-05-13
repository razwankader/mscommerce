'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: string | number
  subtotal: string | number
  shipping: string | number
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/account/orders')
      .then(r => r.json())
      .then(d => { setOrders(d.data || []); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-brand" />
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">My Orders</h1>
      <p className="text-sm text-gray-500 mb-6">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <ShoppingBag size={48} className="text-gray-200 mx-auto" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <Link href="/products" className="inline-block text-sm text-brand hover:underline font-medium">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/account/orders/${order.id}`}
              className="block border border-gray-100 rounded-xl hover:border-brand/30 hover:shadow-sm transition-all p-4 group">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">#{order.orderNumber}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {' · '}{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                  </p>
                  {/* Product thumbnails */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {order.orderItems.slice(0, 4).map(item => (
                      item.product.images?.[0] ? (
                        <img key={item.id} src={item.product.images[0]} alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                      ) : (
                        <div key={item.id} className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-base">🚿</div>
                      )
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <p className="text-base font-bold text-brand">{formatPrice(Number(order.total))}</p>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-brand transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
