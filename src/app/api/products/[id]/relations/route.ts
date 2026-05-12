import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const relations = await prisma.productRelation.findMany({
    where: { productId: id },
    include: {
      related: {
        select: { id: true, name: true, slug: true, images: true, price: true, salePrice: true, status: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ data: relations })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { relatedId, type } = await req.json()
  if (!relatedId) return NextResponse.json({ error: 'relatedId required' }, { status: 400 })
  if (relatedId === id) return NextResponse.json({ error: 'Cannot relate product to itself' }, { status: 400 })

  const relation = await prisma.productRelation.upsert({
    where: { productId_relatedId: { productId: id, relatedId } },
    update: { type: type || 'RELATED' },
    create: { productId: id, relatedId, type: type || 'RELATED' },
    include: {
      related: {
        select: { id: true, name: true, slug: true, images: true, price: true, salePrice: true, status: true },
      },
    },
  })

  revalidateTag('products')
  return NextResponse.json(relation, { status: 201 })
}
