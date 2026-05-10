'use client'

import { useCart } from '@/context/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

function formatPrice(n: number) {
  return '৳' + n.toLocaleString('en-BD')
}

interface ShippingConfig {
  threshold: number | null
  cost: number
}

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart } = useCart()
  const [shipping, setShipping] = useState<ShippingConfig | null>(null)

  useEffect(() => {
    fetch('/api/shipping-config')
      .then((r) => r.json())
      .then(setShipping)
      .catch(() => setShipping({ threshold: null, cost: 150 }))
  }, [])

  const deliveryFee = shipping
    ? (shipping.threshold !== null && total >= shipping.threshold ? 0 : shipping.cost)
    : null

  const grandTotal = deliveryFee !== null ? total + deliveryFee : null

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some products to get started.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-dark transition-colors"
        >
          <ArrowLeft size={16} />
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({count} items)</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const unitPrice = item.salePrice ?? item.price
            return (
              <div key={item.id} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4">
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🚿</div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <p className="text-sm font-semibold text-gray-900 hover:text-brand transition-colors line-clamp-2">
                      {item.name}
                    </p>
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-brand">{formatPrice(unitPrice)}</span>
                    {item.salePrice && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition-colors disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === null
                    ? '—'
                    : deliveryFee === 0
                    ? 'Free'
                    : formatPrice(deliveryFee)}
                </span>
              </div>
              {shipping && shipping.threshold !== null && total < shipping.threshold && (
                <p className="text-xs text-gray-400">
                  Add {formatPrice(shipping.threshold - total)} more for free delivery
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{grandTotal !== null ? formatPrice(grandTotal) : '—'}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:border-brand hover:text-brand transition-colors"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
