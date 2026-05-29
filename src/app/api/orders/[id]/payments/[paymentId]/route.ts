import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const { paymentId } = await params
  const session = await auth()
  if (!session || (session.user.permissions ?? []).length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { method, amount, referenceId, bankName, paidAt } = await req.json()

  const payment = await prisma.orderPayment.update({
    where: { id: paymentId },
    data: {
      ...(method !== undefined && { method }),
      amount: amount !== undefined ? (amount ? Number(amount) : null) : undefined,
      referenceId: referenceId !== undefined ? (referenceId || null) : undefined,
      bankName: method !== undefined
        ? (method === 'BANK' ? (bankName || null) : null)
        : (bankName !== undefined ? (bankName || null) : undefined),
      paidAt: paidAt !== undefined ? (paidAt ? new Date(paidAt) : new Date()) : undefined,
    },
  })

  return NextResponse.json(payment)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const { paymentId } = await params
  const session = await auth()
  if (!session || (session.user.permissions ?? []).length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.orderPayment.delete({ where: { id: paymentId } })
  return NextResponse.json({ success: true })
}
