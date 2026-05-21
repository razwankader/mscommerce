import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const userSelect = {
  id: true, name: true, email: true,
  roleId: true, roleRef: { select: { name: true, label: true } },
  phone: true, isActive: true, createdAt: true,
} as const

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id }, select: userSelect })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, password, roleId, phone, isActive } = await req.json()

  if (roleId) {
    const roleRecord = await prisma.role.findUnique({ where: { id: roleId } })
    if (!roleRecord) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const data: any = { name, email, phone, isActive }
  if (roleId) data.roleId = roleId
  if (password) data.password = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({ where: { id }, data, select: userSelect })
  return NextResponse.json(user)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.user.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
