import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Image from 'next/image'
import { PrintButton, BackButton } from './print-button'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return '৳' + n.toLocaleString('en-BD')
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function InvoicePage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      user: { select: { name: true, email: true } },
      orderItems: { include: { product: true } },
      payments: { select: { amount: true } },
    },
  })

  if (!order) notFound()

  const isStaff = (session?.user?.permissions?.length ?? 0) > 0

  const totalPaid = order.payments.reduce((sum, p) => sum + (p.amount ? Number(p.amount) : 0), 0)
  const orderTotal = Number(order.total)
  const isPaid = totalPaid >= orderTotal
  const dueAmount = isPaid ? 0 : orderTotal - totalPaid

  // Access control:
  // - Staff: always allowed
  // - Logged-in customer: only their own orders
  // - Guest: allowed (orderNumber is secret enough)
  if (!isStaff && session?.user?.id && order.userId && order.userId !== session.user.id) {
    notFound()
  }

  // Billing info
  // staff-placed order → delivery recipient IS the billing party (no separate account)
  // customer-placed order → billing = user account; delivery = order fields (may differ)
  const deliveryName = `${order.firstName} ${order.lastName}`
  const billingName = order.placedByStaff
    ? deliveryName
    : (order.user?.name || deliveryName)
  const billingEmail = order.placedByStaff
    ? order.email
    : (order.user?.email || order.email)

  const showSeparateBilling = !order.placedByStaff && (billingName !== deliveryName || billingEmail !== order.email)

  // Company info from settings
  const settings = await prisma.setting.findMany({ where: { key: { in: ['site_name', 'site_address', 'site_phone', 'site_email'] } } })
  const s = Object.fromEntries(settings.map(x => [x.key, x.value]))
  const companyName = s['site_name'] || 'Matin Sanitary'
  const companyAddress = s['site_address'] || 'Dhaka, Bangladesh'
  const companyPhone = s['site_phone'] || ''
  const companyEmail = s['site_email'] || ''

  const subtotal = Number(order.subtotal)
  const discount = Number(order.discount)
  const shipping = Number(order.shipping)
  const total = Number(order.total)

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <BackButton />
        <PrintButton />
      </div>

      {/* Invoice */}
      <div className="max-w-3xl mx-auto px-6 py-10 print:py-0 print:px-0">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 print:border-none print:shadow-none print:rounded-none">

          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <Image src="/images/logo.png" alt={companyName} width={160} height={56} className="object-contain" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-gray-200 tracking-tight">INVOICE</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">#{order.orderNumber}</p>
              <p className="text-xs text-gray-400 mt-1">Date: {fmtDate(order.createdAt)}</p>
              <span className={`inline-block mt-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {isPaid ? 'Paid' : `Due ${fmt(dueAmount)}`}
              </span>
            </div>
          </div>

          {/* Billing & Shipping */}
          <div className={`grid ${showSeparateBilling ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'} gap-8 mb-10`}>
            {showSeparateBilling && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                <p className="text-sm font-semibold text-gray-900">{billingName}</p>
                {billingEmail && <p className="text-xs text-gray-500 mt-0.5">{billingEmail}</p>}
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {showSeparateBilling ? 'Ship To' : 'Bill To / Ship To'}
              </p>
              <p className="text-sm font-semibold text-gray-900">{deliveryName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.address}, {order.city}{order.state ? `, ${order.state}` : ''}</p>
              <p className="text-xs text-gray-500">{order.phone}</p>
              {order.email && <p className="text-xs text-gray-500">{order.email}</p>}
            </div>
          </div>

          {/* Items table */}
          <table className="w-full mb-8" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3">Item</th>
                <th className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 w-16">Qty</th>
                <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 w-28">Unit Price</th>
                <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => {
                const unitPrice = Number(item.price)
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="py-3 text-sm text-gray-800">{item.product.name}</td>
                    <td className="py-3 text-sm text-gray-500 text-center">{item.quantity}</td>
                    <td className="py-3 text-sm text-gray-700 text-right">{fmt(unitPrice)}</td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">{fmt(unitPrice * item.quantity)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>−{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : fmt(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-orange-500">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            {!order.placedByStaff && (
              <div className="text-xs text-gray-400">
                Payment method: <span className="font-medium text-gray-600">Cash on Delivery</span>
              </div>
            )}
            {order.notes && (
              <div className="text-xs text-gray-400 max-w-xs text-right">
                Note: {order.notes}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-5 border-t border-gray-100 text-center text-xs text-gray-400">
            {[companyAddress, companyPhone, companyEmail].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>
    </div>
  )
}
