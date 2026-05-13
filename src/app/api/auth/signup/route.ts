import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json()

  if (!name || !email || !password)
    return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 })

  if (password.length < 6)
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, password: hashed, phone: phone || null, role: 'CUSTOMER' },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
