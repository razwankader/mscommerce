import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.emailOtp.deleteMany({ where: { email } })
  await prisma.emailOtp.create({ data: { email, otp, expires } })

  const isDev = !process.env.RESEND_API_KEY

  if (isDev) {
    console.log(`[DEV] OTP for ${email}: ${otp}`)
    // Return OTP in response so dev can test without email
    return NextResponse.json({ sent: true, devOtp: otp })
  }

  try {
    await sendOtpEmail(email, otp)
  } catch (err: any) {
    console.error('[send-otp] Resend error:', err)
    const msg = err?.message || ''
    if (msg.includes('onboarding@resend.dev')) {
      return NextResponse.json({
        error: 'Email domain not verified. Configure a verified sender in Resend.',
      }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to send OTP email. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}
