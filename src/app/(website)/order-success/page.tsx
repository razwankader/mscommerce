'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, Phone } from 'lucide-react'
import { Suspense } from 'react'

function OrderSuccessContent() {
  const params = useSearchParams()
  const orderNumber = params.get('order')

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      {orderNumber && (
        <p className="text-sm text-gray-500 mb-1">
          Order number: <span className="font-semibold text-gray-800">{orderNumber}</span>
        </p>
      )}
      <p className="text-gray-500 mt-3 mb-10">
        Thank you for your order. Our team will call you to confirm delivery details.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
        <div className="bg-orange-50 rounded-xl p-4 flex gap-3">
          <Package size={20} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Cash on Delivery</p>
            <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives at your door</p>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 flex gap-3">
          <Phone size={20} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">We'll Call You</p>
            <p className="text-xs text-gray-500 mt-0.5">Expect a confirmation call within 24 hours</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-dark transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-brand hover:text-brand transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  )
}
