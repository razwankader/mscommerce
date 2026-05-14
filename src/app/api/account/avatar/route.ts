import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG or WebP allowed' }, { status: 400 })
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max file size is 2MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const baseName = `${session.user.id}-${Date.now()}.${ext}`
  const blobPath = `avatars/${baseName}`

  let url: string
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(blobPath, file, { access: 'public' })
    url = blob.url
  } else {
    const bytes = await file.arrayBuffer()
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, baseName), Buffer.from(bytes))
    url = `/uploads/avatars/${baseName}`
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: url },
  })

  return NextResponse.json({ url })
}
