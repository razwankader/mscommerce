import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const featured = searchParams.get('featured') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (category) where.categoryId = category
  if (status) where.status = status
  if (featured === 'true') where.featured = true

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, shortDesc, sku, price, salePrice, stock, images, categoryId, brandId, featured, status, metaTitle, metaDesc } = body

  if (!name || !price) {
    return NextResponse.json({ error: 'Name and price required' }, { status: 400 })
  }

  const slug = slugify(name) + '-' + Date.now()

  const product = await prisma.product.create({
    data: {
      name,
      slug,
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
      status: status || 'ACTIVE',
      metaTitle,
      metaDesc,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
