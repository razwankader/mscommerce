import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, subtitle, image, link, order, status } = await req.json()
  const banner = await prisma.banner.update({
    where: { id: params.id },
    data: { title, subtitle, image, link, order, status },
  })
  return NextResponse.json(banner)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.banner.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
