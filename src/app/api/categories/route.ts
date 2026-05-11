import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const parent = searchParams.get('parent')

  if (parent === 'true') {
    const data = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: { where: { isActive: true } } },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ data }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    })
  }

  const data = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } }, children: true },
    orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
  })
  return NextResponse.json({ data }, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description, image, parentId, order } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const slug = slugify(name) + '-' + Date.now().toString(36)

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      image,
      parentId: parentId || null,
      order: order || 0,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
