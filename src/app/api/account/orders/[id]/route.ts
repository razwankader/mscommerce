import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      orderItems: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
      },
      payments: { select: { amount: true } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const paid = order.payments.reduce((sum, p) => sum + (p.amount ? Number(p.amount) : 0), 0)
  const total = Number(order.total)
  const isPaid = paid >= total
  return NextResponse.json({ ...order, isPaid, dueAmount: isPaid ? 0 : total - paid })
}
