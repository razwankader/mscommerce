import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serializeProduct } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where: any = { status: 'ACTIVE' }
  const category = searchParams.get('category')
  const brand = searchParams.get('brand')
  const sale = searchParams.get('sale')
  const bundle = searchParams.get('bundle')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')

  if (category) where.category = { slug: category }
  if (brand) where.brand = { slug: brand }
  if (featured === 'true') where.featured = true
  if (sale === 'true') where.salePrice = { not: null, gt: 0 }
  if (bundle === 'true') where.bundle = true
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    data: data.map(serializeProduct),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  })
}
