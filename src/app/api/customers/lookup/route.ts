import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user.permissions ?? []).length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const phone = req.nextUrl.searchParams.get('phone')?.trim()
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const customer = await prisma.user.findFirst({
    where: {
      phone,
      roleRef: { name: 'OFFLINE_CUSTOMER' },
    },
    select: { id: true, name: true, phone: true, email: true, address: true, city: true },
  })

  if (!customer) return NextResponse.json(null)
  return NextResponse.json(customer)
}
