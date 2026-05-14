import { prisma } from '@/lib/prisma'
import { ProductFilters } from '@/components/website/product-filters'
import { ProductGrid } from '@/components/website/product-grid'
import { serializeProduct } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'All Products' }

interface SearchParams {
  [key: string]: string | undefined
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
  if (params.sale === 'true') where.salePrice = { not: null, gt: 0 }
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
  const title = isBundle ? 'Bundle Offers' : isSale ? 'Sale — Up to 25% Off' : 'All Products'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProductFilters
        params={params}
        categories={categories}
        brands={brands}
        isSale={isSale}
        isBundle={isBundle}
        total={total}
        title={title}
      >
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
        <ProductGrid
          initialProducts={products}
          initialTotal={total}
          initialPage={page}
          totalPages={totalPages}
          params={params}
        />
      </ProductFilters>
    </div>
  )
}
