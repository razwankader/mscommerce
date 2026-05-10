import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const data = await prisma.banner.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, subtitle, image, link, order, status } = await req.json()
  if (!title || !image) return NextResponse.json({ error: 'Title and image required' }, { status: 400 })

  const banner = await prisma.banner.create({
    data: { title, subtitle, image, link, order: order || 0, status: status || 'ACTIVE' },
  })
  return NextResponse.json(banner, { status: 201 })
}
