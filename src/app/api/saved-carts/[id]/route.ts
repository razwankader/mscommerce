import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.permissions?.includes('orders.hold')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const cart = await prisma.savedCart.findUnique({ where: { id } })
  if (!cart || cart.staffId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.savedCart.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
