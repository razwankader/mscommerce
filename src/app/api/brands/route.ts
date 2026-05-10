import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET() {
  const data = await prisma.brand.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, logo, website } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const slug = slugify(name) + '-' + Date.now().toString(36)
  const brand = await prisma.brand.create({ data: { name, slug, logo, website } })
  return NextResponse.json(brand, { status: 201 })
}
