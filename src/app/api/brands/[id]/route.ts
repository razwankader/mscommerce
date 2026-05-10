import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, logo, website, isActive } = await req.json()
  const brand = await prisma.brand.update({
    where: { id: params.id },
    data: { name, logo, website, isActive },
  })
  return NextResponse.json(brand)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.brand.update({ where: { id: params.id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
