'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Bell, LogOut, User, Menu, Home } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="h-14 md:h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-medium text-gray-500 hidden sm:block">
          Welcome back, <span className="text-gray-900 font-semibold">{session?.user?.name}</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-500" />
        </button>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-2 md:px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center shrink-0">
              <User size={14} className="text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-gray-900">{session?.user?.name}</p>
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                session?.user?.role === 'ADMIN'
                  ? 'bg-brand/10 text-brand'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {session?.user?.role}
              </span>
            </div>
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-20">
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Home size={14} />
                  Home Page
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => signOut({ callbackUrl: '/account/login' })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
