import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; relatedId: string }> }
) {
  const { id, relatedId } = await params
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.productRelation.deleteMany({
    where: { productId: id, relatedId },
  })

  revalidateTag('products')
  return NextResponse.json({ success: true })
}
