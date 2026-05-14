import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json()
  if (!email || !otp) return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })

  const record = await prisma.emailOtp.findFirst({
    where: { email, otp },
  })

  if (!record) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
  if (record.expires < new Date()) {
    await prisma.emailOtp.delete({ where: { id: record.id } })
    return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 })
  }

  await prisma.emailOtp.update({ where: { id: record.id }, data: { verified: true } })

  return NextResponse.json({ verified: true })
}
