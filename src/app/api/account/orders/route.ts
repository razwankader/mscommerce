import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      orderItems: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
      },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const data = orders.map(o => {
    const paid = o.payments.reduce((sum, p) => sum + (p.amount ? Number(p.amount) : 0), 0)
    const total = Number(o.total)
    const isPaid = paid >= total
    return { ...o, isPaid, dueAmount: isPaid ? 0 : total - paid }
  })

  return NextResponse.json({ data })
}
