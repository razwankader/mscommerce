import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  // Any authenticated staff user (has at least one permission)
  if (!session || (session.user.permissions ?? []).length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })

  const product = await prisma.product.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [{ barcode: code }, { sku: code }],
    },
    select: {
      id: true, name: true, slug: true, sku: true,
      barcode: true, price: true, salePrice: true, images: true, stock: true,
    },
  })

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(product)
}
