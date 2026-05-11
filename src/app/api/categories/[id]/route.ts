import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description, image, parentId, order, isActive } = await req.json()

  const category = await prisma.category.update({
    where: { id: id },
    data: { name, description, image, parentId: parentId || null, order: order || 0, isActive },
  })

  revalidateTag('categories')
  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.category.update({ where: { id: id }, data: { isActive: false } })
  revalidateTag('categories')
  return NextResponse.json({ success: true })
}
