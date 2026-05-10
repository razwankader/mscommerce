import { NextResponse } from 'next/server'
import { getShippingConfig } from '@/lib/shipping'

export async function GET() {
  const config = await getShippingConfig()
  return NextResponse.json(config)
}
