import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { Shield, Award, Users, Clock, CheckCircle, Phone } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'About Us — Matin Sanitary' }

const WHY_US = [
  { icon: Shield,       title: 'Genuine Products Only',         desc: 'Every product carries the original manufacturer warranty. Zero compromises on authenticity.' },
  { icon: Award,        title: 'Premium Global Brands',         desc: 'Authorized dealer of Grohe, Kohler, American Standard, TOTO, Roca and 50+ more international brands.' },
  { icon: Users,        title: 'Expert Guidance',               desc: 'Our seasoned team helps you select the right product for your space, budget and lifestyle.' },
  { icon: Clock,        title: '45+ Years of Trust',            desc: 'Since 1978, thousands of homes, hotels and commercial projects across Bangladesh trust Matin Sanitary.' },
  { icon: CheckCircle,  title: 'Competitive Wholesale Pricing', desc: 'Direct importer advantages passed on to you — best market prices whether you buy one or a thousand.' },
  { icon: Phone,        title: 'After-Sales Support',           desc: 'Our relationship doesn\'t end at the sale. We stand behind every product we sell.' },
]

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'about-us', status: 'PUBLISHED' } })

  if (page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About Us</h1>
        <div className="w-16 h-1 bg-brand rounded-full mb-8" />
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="mb-12">
        <p className="text-sm font-semibold text-brand uppercase tracking-widest mb-2">Est. 1978 · Dhaka, Bangladesh</p>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
          Bangladesh's Trusted Name<br className="hidden sm:block" /> in Sanitary Ware
        </h1>
        <div className="w-16 h-1 bg-brand rounded-full mb-6" />
        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
          For over four decades, <strong className="text-gray-900">Matin Sanitary</strong> has been the go-to destination
          for architects, contractors, interior designers, and homeowners seeking world-class bathroom and sanitary solutions
          right here in Bangladesh. What started as a modest retail shop in Dhaka has grown into one of the country's most
          respected wholesale and retail sanitary ware establishments.
        </p>
      </div>

      {/* Our Story */}
      <div className="bg-orange-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            Founded in <strong className="text-gray-900">1978</strong>, Matin Sanitary began with a simple belief —
            every Bangladeshi home deserves access to durable, beautiful, and affordable sanitary products.
            Starting from a single storefront, we built our reputation one satisfied customer at a time.
          </p>
          <p>
            Over the years, we expanded our portfolio to include the world's finest brands and deepened our
            expertise across residential, commercial, and hospitality projects. Today, our catalogue spans
            thousands of SKUs — from everyday bathroom fittings to luxury showroom pieces — all under one roof.
          </p>
          <p>
            As an authorized importer and dealer, we source directly from manufacturers, cutting out unnecessary
            intermediaries. This means <strong className="text-gray-900">better prices, guaranteed authenticity,
            and faster availability</strong> for our customers.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed text-lg border-l-4 border-brand pl-6 italic">
          "To bring the world's best sanitary innovations to Bangladesh — making premium quality accessible,
          affordable, and dependable for every project, big or small."
        </p>
      </div>

      {/* Why Choose Us */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Matin Sanitary?</h2>
        <p className="text-gray-500 mb-8">Six reasons thousands of customers keep coming back.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_US.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center mb-3">
                <Icon size={18} className="text-brand" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { value: '45+', label: 'Years in Business' },
          { value: '50+', label: 'Premium Brands' },
          { value: '5000+', label: 'Products Available' },
          { value: '10,000+', label: 'Happy Customers' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-gray-900 text-white rounded-2xl p-5 text-center">
            <p className="text-3xl font-extrabold text-brand">{value}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-brand rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Transform Your Space?</h2>
        <p className="text-orange-100 mb-6 text-sm">
          Visit our showroom or browse our collection online. Our experts are ready to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products"
            className="inline-flex items-center justify-center gap-2 bg-white text-brand font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
            Browse Products
          </Link>
          <Link href="/contact"
            className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>

    </div>
  )
}
