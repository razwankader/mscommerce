import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/website/product-card'
import { ProductFilters } from '@/components/website/product-filters'
import { serializeProduct } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'All Products' }

interface SearchParams {
  page?: string
  category?: string
  brand?: string
  featured?: string
  sale?: string
  bundle?: string
  search?: string
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: any = { status: 'ACTIVE' }
  if (params.category) where.category = { slug: params.category }
  if (params.brand) where.brand = { slug: params.brand }
  if (params.featured === 'true') where.featured = true
  if (params.sale === 'true') {
    where.salePrice = { not: null, gt: 0 }
  }
  if (params.bundle === 'true') where.bundle = true
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      skip,
      take: limit,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }).then(r => r.map(serializeProduct)),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)
  const isSale = params.sale === 'true'
  const isBundle = params.bundle === 'true'

  function buildUrl(overrides: Partial<SearchParams>) {
    const merged = { ...params, ...overrides }
    const qs = Object.entries(merged)
      .filter(([, v]) => v && v !== '1')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/products${qs ? '?' + qs : ''}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isBundle ? 'Bundle Offers' : isSale ? 'Sale — Up to 25% Off' : 'All Products'}
        </h1>
        <p className="text-sm text-gray-500 mt-1 hidden md:block">{total} products found</p>
      </div>
      <div className="flex gap-8">
        <ProductFilters
          params={params}
          categories={categories}
          brands={brands}
          isSale={isSale}
          isBundle={isBundle}
          total={total}
        />

        {/* Products grid */}
        <div className="flex-1">
          {isSale && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <span className="text-red-500 font-bold text-sm">🏷️ Sale</span>
              <span className="text-sm text-red-700">Showing discounted products only</span>
              <a href="/products" className="ml-auto text-xs text-red-400 hover:text-red-600 underline">Clear</a>
            </div>
          )}
          {isBundle && (
            <div className="mb-4 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
              <span className="text-orange-500 font-bold text-sm">📦 Bundle Offers</span>
              <span className="text-sm text-orange-700">Showing bundle products only</span>
              <a href="/products" className="ml-auto text-xs text-orange-400 hover:text-orange-600 underline">Clear</a>
            </div>
          )}
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={buildUrl({ page: p === 1 ? undefined : String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors ${
                    p === page
                      ? 'bg-brand text-white border-brand'
                      : 'border-gray-200 text-gray-700 hover:border-brand'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
