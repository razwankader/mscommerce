import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session || (session.user.permissions ?? []).length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await prisma.salesRep.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name, phone, defaultCommissionRate } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const rep = await prisma.salesRep.create({
    data: {
      name: name.trim(),
      phone: phone || null,
      defaultCommissionRate: defaultCommissionRate ? Number(defaultCommissionRate) : null,
    },
  })
  return NextResponse.json(rep, { status: 201 })
}
