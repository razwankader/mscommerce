import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendOrderStatusEmail } from '@/lib/email'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: { orderItems: { include: { product: true } }, user: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { status } = body

  // Guardrail: DELIVERED requires full payment
  if (status === 'DELIVERED') {
    const [orderData, payments] = await Promise.all([
      prisma.order.findUnique({ where: { id }, select: { total: true } }),
      prisma.orderPayment.findMany({ where: { orderId: id } }),
    ])
    if (!orderData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Non-COD payments must have a referenceId
    const missingRef = payments.find(p => p.method !== 'COD' && !p.referenceId)
    if (missingRef) {
      return NextResponse.json(
        { error: `Payment reference ID missing for ${missingRef.method} entry` },
        { status: 422 }
      )
    }

    // Amount check: all recorded payment amounts must sum to >= order total
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount ? Number(p.amount) : 0), 0)
    const orderTotal = Number(orderData.total)
    if (totalPaid < orderTotal) {
      return NextResponse.json(
        { error: `Insufficient payment. Paid: ৳${totalPaid.toLocaleString('en-BD')} — Order total: ৳${orderTotal.toLocaleString('en-BD')}` },
        { status: 422 }
      )
    }
  }

  const order = await prisma.order.update({ where: { id }, data: { status } })

  if (status && ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(status) && order.email) {
    sendOrderStatusEmail(order.email, order.firstName, order.orderNumber, status)
      .catch(err => console.error('[order-status-email]', err))
  }

  return NextResponse.json(order)
}
