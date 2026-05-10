'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Phone, Mail, Truck, Menu, X, ChevronDown, ShoppingCart } from 'lucide-react'
import { SearchBar } from '@/components/website/search-bar'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { useCart } from '@/context/cart-context'

interface NavCategory {
  id: string
  name: string
  slug: string
  children?: { id: string; name: string; slug: string }[]
}

export function WebsiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null | undefined>(undefined)
  const { count } = useCart()

  useEffect(() => {
    fetch('/api/shipping-config')
      .then((r) => r.json())
      .then((d) => setFreeShippingThreshold(d.threshold))
      .catch(() => setFreeShippingThreshold(null))
  }, [])

  useEffect(() => {
    fetch('/api/categories?parent=true')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={cn('sticky top-0 z-50 transition-shadow', scrolled ? 'shadow-md' : '')}>
      {/* Top bar */}
      <div className="bg-gray-950 border-b border-gray-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center divide-x divide-gray-200">
            <div className="flex items-center gap-1.5 pr-4">
              <Phone size={11} className="text-orange-400" />
              <span className="text-gray-300 font-medium">01719-188784</span>
            </div>
            <div className="flex items-center gap-1.5 pl-4">
              <Mail size={11} className="text-orange-400" />
              <span className="text-gray-400">info@matinsanitary.com</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Truck size={11} className="text-orange-400" />
            {freeShippingThreshold === undefined ? null : freeShippingThreshold !== null ? (
              <span>Free delivery above <span className="font-semibold text-gray-300">৳{freeShippingThreshold.toLocaleString('en-BD')}</span></span>
            ) : (
              <span>Fast delivery to your doorstep</span>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Logo size="md" />
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:border-brand transition-colors"
            >
              <ShoppingCart size={18} className="text-gray-600" />
              <span className="hidden sm:block text-gray-700">Cart</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 rounded-xl border border-gray-200"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-gray-900 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          {/* static links */}
          <Link href="/" className="relative px-5 py-3.5 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
            Home
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand group-hover:w-4/5 transition-all duration-300 rounded-full" />
          </Link>

          {/* dynamic categories */}
          {categories.map((cat) => (
            <div key={cat.id} className="relative group">
              <Link
                href={`/categories/${cat.slug}`}
                className="relative flex items-center gap-1 px-5 py-3.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {cat.name}
                {cat.children && cat.children.length > 0 && (
                  <ChevronDown size={13} className="opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                )}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand group-hover:w-4/5 transition-all duration-300 rounded-full" />
              </Link>
              {cat.children && cat.children.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 mt-0.5">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />
                  {cat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${sub.slug}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-brand transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand/40 shrink-0" />
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link href="/products" className="relative px-5 py-3.5 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
            All Products
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand group-hover:w-4/5 transition-all duration-300 rounded-full" />
          </Link>
          <Link href="/about" className="relative px-5 py-3.5 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
            About
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand group-hover:w-4/5 transition-all duration-300 rounded-full" />
          </Link>

          {/* Contact — accent pill */}
          <div className="ml-3">
            <Link
              href="/contact"
              className="inline-block px-4 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-2">
          {[
            { href: '/', label: 'Home' },
            { href: '/products', label: 'All Products' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 text-sm text-gray-700 hover:text-brand transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
