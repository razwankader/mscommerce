import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true })

  // Delete any existing reset tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({ data: { email, token, expires } })

  const baseUrl = process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const resetUrl = `${baseUrl}/account/reset-password?token=${token}`

  try {
    await sendPasswordResetEmail(email, resetUrl)
  } catch (err) {
    console.error('[forgot-password] email send failed:', err)
  }

  return NextResponse.json({ success: true })
}
