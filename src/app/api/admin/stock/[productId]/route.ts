import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId } = await params

  const transactions = await prisma.stockTransaction.findMany({
    where: { productId },
    include: {
      createdByUser: { select: { id: true, name: true } },
      order: { select: { id: true, orderNumber: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { productId } = await params
  const { type, quantity, note } = await req.json()

  if (!type || !quantity || quantity === 0) {
    return NextResponse.json({ error: 'type and quantity required' }, { status: 400 })
  }

  const delta = ['SALE'].includes(type) ? -Math.abs(quantity) : Math.abs(quantity)

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId }, select: { stock: true, name: true } })
    if (!product) throw new Error('Product not found')

    const newStock = product.stock + delta
    if (newStock < 0) throw new Error(`Insufficient stock. Current: ${product.stock}`)

    await tx.product.update({
      where: { id: productId },
      data: { stock: newStock },
    })

    return tx.stockTransaction.create({
      data: {
        productId,
        type,
        quantity: delta,
        balanceAfter: newStock,
        note: note || null,
        createdBy: session.user.id,
      },
    })
  })

  return NextResponse.json(result, { status: 201 })
}
