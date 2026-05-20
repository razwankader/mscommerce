import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { canAccessRoute } from '@/lib/permissions'

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  const secure = req.nextUrl.protocol === 'https:'
  const cookieName = secure ? '__Secure-authjs.session-token' : 'authjs.session-token'
  const token = await getToken({ req, secret, cookieName })

  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/login'

  if (isAdminRoute) {
    // Not logged in → login page
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    // Regular customer → home
    if (token.role === 'CUSTOMER') return NextResponse.redirect(new URL('/', req.url))
    // Check permission-based access
    const permissions = (token.permissions as string[]) ?? []
    if (!canAccessRoute(permissions, pathname)) {
      return NextResponse.redirect(new URL('/admin?denied=1', req.url))
    }
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
