import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET() {
  const data = await prisma.page.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, status, metaTitle, metaDesc } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 })

  const slug = slugify(title) + '-' + Date.now().toString(36)
  const page = await prisma.page.create({
    data: { title, slug, content, status: status || 'DRAFT', metaTitle, metaDesc },
  })
  return NextResponse.json(page, { status: 201 })
}
