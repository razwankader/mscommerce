import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  const secure = req.nextUrl.protocol === 'https:'
  const cookieName = secure ? '__Secure-authjs.session-token' : 'authjs.session-token'
  const token = await getToken({ req, secret, cookieName })

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/login'

  if (isAdminRoute) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    if (token.role === 'CUSTOMER') return NextResponse.redirect(new URL('/', req.url))
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
