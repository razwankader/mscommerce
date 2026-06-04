import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { canAccessRoute, ROUTE_PERMISSION_MAP } from '@/lib/permissions'

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
    // Customers (online or offline) → home
    if (token.role === 'ONLINE_CUSTOMER' || token.role === 'OFFLINE_CUSTOMER') return NextResponse.redirect(new URL('/', req.url))
    // ADMIN bypasses permission check — prevents redirect loop when
    // token.permissions is empty (stale JWT or unseeded prod DB)
    if (token.role === 'ADMIN') return NextResponse.next()
    // Permission check for MANAGER and custom roles
    const permissions = (token.permissions as string[]) ?? []
    if (!canAccessRoute(permissions, pathname)) {
      // Find first route the user can access, fall back to home
      const firstAllowed = ROUTE_PERMISSION_MAP.find(r => permissions.includes(r.permission))
      const fallback = firstAllowed ? firstAllowed.prefix : '/'
      return NextResponse.redirect(new URL(fallback, req.url))
    }
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
