import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export function WebsiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4 inline-block bg-white rounded-xl px-3 py-2">
              <Logo size="sm" />
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted source for premium sanitary ware and bathroom fittings since 1978.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-brand transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-brand transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/products', label: 'Products' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white hover:text-brand transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/categories/bathroom', label: 'Bathroom' },
                { href: '/categories/kitchen', label: 'Kitchen' },
                { href: '/categories/sanitary-ware', label: 'Sanitary Ware' },
                { href: '/categories/bathroom-fittings', label: 'Bathroom Fittings' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand" />
                <a href="https://maps.app.goo.gl/WHdv6t3ENjnrcaR87" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  78/5, D.I.T Road, Malibagh, Dhaka-1217
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-brand" />
                <a href="tel:01719-188784" className="hover:text-white transition-colors">01719-188784</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand" />
                <a href="mailto:info@matinsanitary.com" className="hover:text-white transition-colors">info@matinsanitary.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Matin Sanitary. All rights reserved.</span>
          <span>© Matin Sanitary</span>
        </div>
      </div>
    </footer>
  )
}
