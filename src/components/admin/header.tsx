'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Bell, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export function AdminHeader() {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-medium text-gray-500">
          Welcome back, <span className="text-gray-900 font-semibold">{session?.user?.name}</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-500" />
        </button>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{session?.user?.role?.toLowerCase()}</p>
            </div>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
              <button
                onClick={() => signOut({ callbackUrl: '/account/login' })}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
