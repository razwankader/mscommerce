import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const data = await prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] })
  const grouped = data.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = {}
    acc[s.group][s.key] = s.value
    return acc
  }, {} as Record<string, Record<string, string>>)
  return NextResponse.json({ data, grouped })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { settings } = await req.json()
  if (!Array.isArray(settings)) {
    return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 })
  }

  const updates = await Promise.all(
    settings.map(({ key, value, group }: { key: string; value: string; group?: string }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, group: group || 'general' },
      })
    )
  )

  return NextResponse.json({ data: updates })
}
