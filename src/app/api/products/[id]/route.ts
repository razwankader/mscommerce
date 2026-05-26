import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id: id },
    include: { category: true, brand: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, shortDesc, sku, barcode, price, salePrice, buyingPrice, dealerPrice, stock, images, categoryId, brandId, featured, bundle, status, metaTitle, metaDesc } = body

  const product = await prisma.product.update({
    where: { id: id },
    data: {
      name,
      description,
      shortDesc,
      sku,
      barcode: barcode ?? undefined,
      price,
      salePrice: salePrice || null,
      buyingPrice: buyingPrice || null,
      dealerPrice: dealerPrice || null,
      stock: stock || 0,
      images: images || [],
      categoryId: categoryId || null,
      brandId: brandId || null,
      featured: featured || false,
      bundle: bundle || false,
      status,
      metaTitle,
      metaDesc,
    },
  })

  revalidateTag('products')
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.product.delete({ where: { id: id } })
  revalidateTag('products')
  return NextResponse.json({ success: true })
}
