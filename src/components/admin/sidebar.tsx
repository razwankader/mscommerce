'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import {
  LayoutDashboard,
  Package,
  Tag,
  Award,
  Image,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  ChevronDown,
  Store,
  ScanBarcode,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  {
    label: 'Catalog',
    icon: Package,
    children: [
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/categories', label: 'Categories' },
      { href: '/admin/brands', label: 'Brands' },
    ],
  },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/stock', label: 'Stock Scanner', icon: ScanBarcode },
  { href: '/admin/users', label: 'Users', icon: Users },
  {
    label: 'Content',
    icon: FileText,
    children: [
      { href: '/admin/banners', label: 'Banners' },
      { href: '/admin/pages', label: 'Pages' },
    ],
  },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function NavItem({ item, depth = 0 }: { item: (typeof navItems)[0]; depth?: number }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(() => {
    if ('children' in item && item.children) {
      return item.children.some((c) => pathname.startsWith(c.href))
    }
    return false
  })

  if ('children' in item && item.children) {
    const isActive = item.children.some((c) => pathname.startsWith(c.href))
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
            isActive ? 'bg-brand/10 text-brand font-medium' : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <span className="flex items-center gap-3">
            {item.icon && <item.icon size={18} />}
            {item.label}
          </span>
          <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-3">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'block rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname.startsWith(child.href)
                    ? 'bg-brand text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  if ('href' in item) {
    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive ? 'bg-brand text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        {item.icon && <item.icon size={18} />}
        {item.label}
      </Link>
    )
  }

  return null
}

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <Logo size="sm" />
        <p className="text-xs text-gray-400 mt-1.5 pl-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item, i) => (
          <NavItem key={i} item={item} />
        ))}
      </nav>
      <div className="border-t border-gray-100 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Store size={14} />
          View Website
        </Link>
      </div>
    </aside>
  )
}
