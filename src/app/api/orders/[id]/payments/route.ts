import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || (session.user.permissions ?? []).length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { method, amount, referenceId, bankName, paidAt } = await req.json()
  if (!method) return NextResponse.json({ error: 'method required' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payment = await prisma.orderPayment.create({
    data: {
      orderId: id,
      method,
      amount: amount ? Number(amount) : null,
      referenceId: referenceId || null,
      bankName: method === 'BANK' ? (bankName || null) : null,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    },
  })

  return NextResponse.json(payment, { status: 201 })
}
