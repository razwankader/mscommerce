import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function isAuthorized(session: any) {
  return session?.user?.permissions?.includes('orders.hold')
}

export async function GET() {
  const session = await auth()
  if (!isAuthorized(session) || !session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const carts = await prisma.savedCart.findMany({
    where: { staffId: session.user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: carts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!isAuthorized(session) || !session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { label, snapshot } = body

  if (!snapshot) return NextResponse.json({ error: 'snapshot required' }, { status: 400 })

  const cart = await prisma.savedCart.create({
    data: { staffId: session.user.id, label: label || null, snapshot },
  })

  return NextResponse.json(cart, { status: 201 })
}
