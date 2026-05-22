'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  ChevronDown,
  Store,
  ScanBarcode,
  Shield,
  X,
} from 'lucide-react'
import { useState } from 'react'

type NavChild = { href: string; label: string; permission?: string }
type NavLeaf  = { href: string; label: string; icon: any; exact?: boolean; permission?: string }
type NavGroup = { label: string; icon: any; children: NavChild[] }
type NavItem  = NavLeaf | NavGroup

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, permission: 'dashboard.view' },
  {
    label: 'Catalog', icon: Package,
    children: [
      { href: '/admin/products',   label: 'Products',   permission: 'products.manage'   },
      { href: '/admin/categories', label: 'Categories', permission: 'categories.manage' },
      { href: '/admin/brands',     label: 'Brands',     permission: 'brands.manage'     },
    ],
  },
  { href: '/admin/orders', label: 'Orders',        icon: ShoppingCart, permission: 'orders.manage' },
  { href: '/admin/stock',  label: 'Stock Scanner', icon: ScanBarcode,  permission: 'stock.manage'  },
  { href: '/admin/users',  label: 'Users',         icon: Users,        permission: 'users.manage'  },
  {
    label: 'Content', icon: FileText,
    children: [
      { href: '/admin/banners', label: 'Banners', permission: 'banners.manage' },
      { href: '/admin/pages',   label: 'Pages',   permission: 'pages.manage'   },
    ],
  },
  {
    label: 'Administration', icon: Shield,
    children: [
      { href: '/admin/roles',    label: 'Roles & Permissions', permission: 'roles.manage'    },
      { href: '/admin/settings', label: 'Settings',            permission: 'settings.manage' },
    ],
  },
]

function NavItemComponent({
  item,
  permissions,
  onNavClick,
}: {
  item: NavItem
  permissions: string[]
  onNavClick?: () => void
}) {
  const pathname = usePathname()

  function isChildVisible(child: NavChild) {
    return !child.permission || permissions.includes(child.permission)
  }

  if ('children' in item) {
    const visibleChildren = item.children.filter(isChildVisible)
    if (visibleChildren.length === 0) return null

    const isActive = visibleChildren.some(c => pathname.startsWith(c.href))
    const [open, setOpen] = useState(() => visibleChildren.some(c => pathname.startsWith(c.href)))

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
            {visibleChildren.map(child => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavClick}
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
    if (item.permission && !permissions.includes(item.permission)) return null
    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
    return (
      <Link
        href={item.href}
        onClick={onNavClick}
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

interface AdminSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { data: session } = useSession()
  const permissions = (session?.user?.permissions ?? []) as string[]

  const SidebarContent = () => (
    <aside className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="block group">
          <Logo size="sm" />
          <p className="text-xs text-gray-400 mt-1.5 pl-0.5 group-hover:text-brand transition-colors">Admin Panel</p>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item, i) => (
          <NavItemComponent key={i} item={item} permissions={permissions} onNavClick={onClose} />
        ))}
      </nav>
      <div className="border-t border-gray-100 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Store size={14} />
          View Website
        </Link>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white flex-col">
        <SidebarContent />
      </div>

      {/* Mobile: drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl md:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  )
}
