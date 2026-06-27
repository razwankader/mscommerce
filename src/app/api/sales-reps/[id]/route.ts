import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name, phone, defaultCommissionRate, isActive } = await req.json()
  const rep = await prisma.salesRep.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(defaultCommissionRate !== undefined && {
        defaultCommissionRate: defaultCommissionRate ? Number(defaultCommissionRate) : null,
      }),
      ...(isActive !== undefined && { isActive }),
    },
  })
  return NextResponse.json(rep)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await prisma.salesRep.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
