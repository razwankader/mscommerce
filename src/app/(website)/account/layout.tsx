'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { User, Package, Lock, Heart, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/account', label: 'My Profile', icon: User, exact: true },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/password', label: 'Change Password', icon: Lock },
]

const AUTH_PATHS = ['/account/login', '/account/signup', '/account/forgot-password', '/account/reset-password']

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))

  useEffect(() => {
    if (!isAuthPage && status === 'unauthenticated') {
      router.replace(`/account/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [status, router, isAuthPage, pathname])

  // Auth pages render without sidebar
  if (isAuthPage) return <>{children}</>

  if (status === 'loading') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!session) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-lg">
                    {session.user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                </div>
              </div>
            </div>
            <nav className="py-2">
              {NAV.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href)
                return (
                  <Link key={href} href={href}
                    className={cn(
                      'flex items-center justify-between px-5 py-3 text-sm transition-colors',
                      active ? 'bg-brand/5 text-brand font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span className="flex items-center gap-2.5"><Icon size={15} />{label}</span>
                    <ChevronRight size={14} className="opacity-40" />
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
