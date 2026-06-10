import Link from 'next/link'
import { Shield, Truck, Award, Phone, Tag, Package, Building2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/website/product-card'
import { formatPrice, serializeProduct } from '@/lib/utils'
import { getShippingConfig } from '@/lib/shipping'
import type { ProductWithRelations } from '@/types'
import { BannerCarousel } from '@/components/website/banner-carousel'

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, status: 'ACTIVE' },
    include: { category: true, brand: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  }) as Promise<ProductWithRelations[]>
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, products: { some: { status: 'ACTIVE' } } },
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: 'desc' } },
  })
}

async function getBanners() {
  return prisma.banner.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { order: 'asc' },
  })
}

async function getNewArrivals() {
  return prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { category: true, brand: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  }) as Promise<ProductWithRelations[]>
}

async function getBrands() {
  return prisma.brand.findMany({
    where: { products: { some: { status: 'ACTIVE' } } },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
}

export default async function HomePage() {
  const [rawProducts, categories, banners, brands, rawNewArrivals, shippingConfig, phoneSetting] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getBanners(),
    getBrands(),
    getNewArrivals(),
    getShippingConfig(),
    prisma.setting.findUnique({ where: { key: 'site_phone' } }),
  ])
  const products = rawProducts.map(serializeProduct)
  const newArrivals = rawNewArrivals.map(serializeProduct)
  const phone = phoneSetting?.value || '01719-188784'

  return (
    <div>
      {/* Hero Carousel */}
      <BannerCarousel banners={banners} />

      {/* Features */}
      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Truck,
              label: shippingConfig.threshold !== null ? 'Free Delivery' : 'Fast Delivery',
              sub: shippingConfig.threshold !== null
                ? `On orders above ${formatPrice(shippingConfig.threshold)}`
                : 'Delivered to your doorstep',
              href: '/products',
            },
            { icon: Shield, label: 'Genuine Products', sub: 'Manufacturer warranty', href: '/products' },
            { icon: Award, label: 'Premium Brands', sub: 'Grohe, Kohler & more', href: '#brands' },
            { icon: Phone, label: 'Expert Support', sub: 'Mon-Sat 9am-7pm', href: `tel:${phone}` },
          ].map((f, i) => (
            f.href ? (
              <a key={i} href={f.href} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="bg-white/20 rounded-xl p-2.5">
                  <f.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-orange-100">{f.sub}</p>
                </div>
              </a>
            ) : (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2.5">
                  <f.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-orange-100">{f.sub}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-orange-50/50">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-brand animate-pulse" />
                  <span className="text-xs font-semibold text-brand uppercase tracking-widest">Just In</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
                <p className="text-sm text-gray-500 mt-1">Latest additions to our collection</p>
              </div>
              <Link href="/products?sort=newest" className="text-sm font-medium text-brand hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-sm text-gray-500 mt-1">Handpicked selection for you</p>
              </div>
              <Link href="/products?featured=true" className="text-sm font-medium text-brand hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banners */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Banner 1 — Sale */}
          <Link
            href="/products?sale=true"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-red-700 text-white p-8 flex items-center justify-between min-h-[180px] hover:shadow-xl transition-shadow"
          >
            <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -right-2 bottom-0 w-24 h-24 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-orange-200" />
                <span className="text-xs font-semibold text-orange-200 uppercase tracking-widest">Limited Time</span>
              </div>
              <h3 className="text-3xl font-extrabold leading-tight">Up to 25% Off</h3>
              <p className="mt-1 text-sm text-orange-100 max-w-xs">
                On selected basin mixers, shower sets & sanitary ware
              </p>
              <span className="mt-4 inline-block text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-full group-hover:bg-orange-50 transition-colors">
                Shop Sale →
              </span>
            </div>
            <div className="relative z-10 hidden sm:flex flex-col items-center justify-center bg-white/20 rounded-2xl w-24 h-24 backdrop-blur-sm shrink-0">
              <span className="text-4xl font-black text-white leading-none">25</span>
              <span className="text-lg font-bold text-orange-200">%OFF</span>
            </div>
          </Link>

          {/* Banner 2 — Free Delivery */}
          <Link
            href="/products"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 flex items-center justify-between min-h-[180px] hover:shadow-xl transition-shadow"
          >
            <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-brand/20 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -right-2 bottom-0 w-24 h-24 rounded-full bg-brand/10 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={16} className="text-brand-light" />
                <span className="text-xs font-semibold text-orange-300 uppercase tracking-widest">All Orders</span>
              </div>
              <h3 className="text-3xl font-extrabold leading-tight">
                {shippingConfig.threshold !== null ? 'Free Delivery' : 'Fast Delivery'}
              </h3>
              <p className="mt-1 text-sm text-gray-300 max-w-xs">
                {shippingConfig.threshold !== null
                  ? `On orders above ${formatPrice(shippingConfig.threshold)} — delivered to your doorstep`
                  : 'Delivered to your doorstep'}
              </p>
              <span className="mt-4 inline-block text-xs font-bold bg-brand text-white px-3 py-1.5 rounded-full group-hover:bg-brand-dark transition-colors">
                Order Now →
              </span>
            </div>
            <div className="relative z-10 hidden sm:flex items-center justify-center shrink-0">
              <Truck size={72} className="text-brand/40 group-hover:text-brand/60 transition-colors" strokeWidth={1} />
            </div>
          </Link>

          {/* Banner 3 — Bundle Offer */}
          <Link
            href="/products?bundle=true"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-8 flex items-center justify-between min-h-[180px] hover:shadow-xl transition-shadow"
          >
            <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-emerald-200" />
                <span className="text-xs font-semibold text-emerald-200 uppercase tracking-widest">Best Value</span>
              </div>
              <h3 className="text-3xl font-extrabold leading-tight">Bundle Offers</h3>
              <p className="mt-1 text-sm text-emerald-100 max-w-xs">
                Complete bathroom sets — mixer, shower, basin & commode
              </p>
              <span className="mt-4 inline-block text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-full group-hover:bg-emerald-50 transition-colors">
                View Bundles →
              </span>
            </div>
            <div className="relative z-10 hidden sm:flex items-center justify-center shrink-0">
              <Package size={72} className="text-white/30 group-hover:text-white/50 transition-colors" strokeWidth={1} />
            </div>
          </Link>

          {/* Banner 4 — Commercial / Hotel Projects */}
          <Link
            href="/contact"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 to-indigo-900 text-white p-8 flex items-center justify-between min-h-[180px] hover:shadow-xl transition-shadow"
          >
            <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-blue-300" />
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-widest">Bulk Pricing</span>
              </div>
              <h3 className="text-3xl font-extrabold leading-tight">Hotel & Project<br />Deals</h3>
              <p className="mt-1 text-sm text-blue-100 max-w-xs">
                Special rates for commercial & residential projects
              </p>
              <span className="mt-4 inline-block text-xs font-bold bg-white text-blue-800 px-3 py-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                Get a Quote →
              </span>
            </div>
            <div className="relative z-10 hidden sm:flex items-center justify-center shrink-0">
              <Building2 size={72} className="text-white/30 group-hover:text-white/50 transition-colors" strokeWidth={1} />
            </div>
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-sm text-gray-500 mt-1">Find exactly what you need</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-brand hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const emojiMap: Record<string, string> = {
                'sanitary-ware': '🪠',
                'bathroom-fittings': '🚿',
                'bathroom': '🛁',
                'kitchen-sinks': '🍳',
              }
              const emoji = emojiMap[cat.slug] ?? '🔧'
              return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 bg-white hover:border-brand hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-brand/10 transition-colors">
                  <span className="text-2xl">{emoji}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{(cat as any)._count?.products || 0} items</p>
              </Link>
            )})}
          </div>
        </section>
      )}

      {/* Shop by Brand */}
      {brands.filter((b: any) => b.logo).length > 0 && (
        <section id="brands" className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shop by Brand</h2>
              <p className="text-sm text-gray-500 mt-1">Trusted names in sanitary ware</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-brand hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.filter((b: any) => b.logo).map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                className="group relative flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:border-brand/40 hover:shadow-lg transition-all duration-200 overflow-hidden aspect-[3/2]"
              >
                {/* subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/0 group-hover:from-orange-50/60 group-hover:to-orange-100/40 transition-all duration-300" />

                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="relative z-10 w-[75%] h-[65%] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 px-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand/10 to-orange-100 flex items-center justify-center group-hover:from-brand/20 group-hover:to-orange-200 transition-colors">
                      <span className="text-2xl font-black text-brand leading-none">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-brand transition-colors text-center leading-tight">
                      {brand.name}
                    </span>
                  </div>
                )}

                {/* brand name tooltip strip on hover — logo brands only */}
                {brand.logo && (
                  <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm py-1.5 px-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20">
                    <span className="text-xs font-semibold text-gray-800 truncate block">{brand.name}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-brand to-brand-dark p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Need Expert Advice?</h2>
            <p className="mt-2 text-orange-100">
              Our team of experts is ready to help you choose the perfect products.
            </p>
          </div>
          <a
            href={`tel:${phone}`}
            className="whitespace-nowrap inline-flex items-center gap-2 bg-white text-brand font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors"
          >
            <Phone size={18} />
            Call Us
          </a>
        </div>
      </section>
    </div>
  )
}
