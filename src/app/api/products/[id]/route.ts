import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, brand: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, shortDesc, sku, price, salePrice, stock, images, categoryId, brandId, featured, status, metaTitle, metaDesc } = body

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name,
      description,
      shortDesc,
      sku,
      price,
      salePrice: salePrice || null,
      stock: stock || 0,
      images: images || [],
      categoryId: categoryId || null,
      brandId: brandId || null,
      featured: featured || false,
      status,
      metaTitle,
      metaDesc,
    },
  })

  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
