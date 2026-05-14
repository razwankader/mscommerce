import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Contact Us' }

export default async function ContactPage() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['site_phone', 'site_email', 'site_address'] } },
  })
  const s = Object.fromEntries(settings.map((x) => [x.key, x.value]))

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <div className="w-16 h-1 bg-brand rounded-full mb-8" />

      <div className="grid md:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            Have questions about our products or services? We're here to help. Reach out to us via any of the channels below.
          </p>
          <div className="space-y-4">
            {[
              { icon: Phone, label: 'Phone', value: s.site_phone || '01719-188784', href: `tel:${s.site_phone || '01719-188784'}` },
              { icon: Mail, label: 'Email', value: s.site_email || 'info@matinsanitary.com', href: `mailto:${s.site_email || 'info@matinsanitary.com'}` },
              { icon: MapPin, label: 'Address', value: s.site_address || '78/5, D.I.T Road, Malibagh, Dhaka-1217', href: 'https://maps.app.goo.gl/WHdv6t3ENjnrcaR87' },
              { icon: Clock, label: 'Hours', value: 'Mon–Sat: 9am – 7pm' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-brand" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-brand hover:underline mt-0.5 block">{item.value}</a>
                  ) : (
                    <p className="text-sm text-gray-700 mt-0.5">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Send a Message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="+92-300-0000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand resize-none"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
