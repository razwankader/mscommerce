import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const roleName = searchParams.get('role') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (roleName) where.roleRef = { name: roleName }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        roleRef: { select: { name: true, label: true } },
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, password, roleId, phone } = await req.json()
  if (!name || !email || !password || !roleId) {
    return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 })
  }

  const roleRecord = await prisma.role.findUnique({ where: { id: roleId } })
  if (!roleRecord) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, roleId, phone },
    select: {
      id: true, name: true, email: true,
      roleId: true, roleRef: { select: { name: true, label: true } },
      createdAt: true,
    },
  })

  return NextResponse.json(user, { status: 201 })
}
