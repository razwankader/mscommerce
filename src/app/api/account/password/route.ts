import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { current, newPassword } = await req.json()
  if (!current || !newPassword) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  if (newPassword.length < 6) return NextResponse.json({ error: 'Min. 6 characters' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) return NextResponse.json({ error: 'Password change not available for social accounts' }, { status: 400 })

  const match = await bcrypt.compare(current, user.password)
  if (!match) return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 })

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })

  return NextResponse.json({ success: true })
}
