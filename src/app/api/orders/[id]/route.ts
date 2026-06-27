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
  const { status, salesRepId, commissionRate, commissionAmount } = body

  // Build commission update data
  const commissionData: any = {}
  if ('salesRepId' in body) commissionData.salesRepId = salesRepId || null
  if ('commissionRate' in body) commissionData.commissionRate = commissionRate != null ? Number(commissionRate) : null
  if ('commissionAmount' in body) commissionData.commissionAmount = commissionAmount != null ? Number(commissionAmount) : null

  const order = await prisma.order.update({
    where: { id },
    data: { ...(status && { status }), ...commissionData },
    include: { salesRep: true },
  })

  if (status && ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(status) && order.email) {
    sendOrderStatusEmail(order.email, order.firstName, order.orderNumber, status)
      .catch(err => console.error('[order-status-email]', err))
  }

  return NextResponse.json(order)
}
