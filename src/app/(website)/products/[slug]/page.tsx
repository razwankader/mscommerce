import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, serializeProduct } from '@/lib/utils'
import { ArrowLeft, Star, Package } from 'lucide-react'
import type { Metadata } from 'next'
import { ProductCard } from '@/components/website/product-card'
import { AddToCartButton } from '@/components/website/add-to-cart-button'
import type { ProductWithRelations, SerializedProduct } from '@/types'
import { unstable_cache } from 'next/cache'

interface Props {
  params: Promise<{ slug: string }>
}

const getCachedProduct = (slug: string) =>
  unstable_cache(
    () => prisma.product.findUnique({ where: { slug }, include: { category: true, brand: true } }),
    ['product', slug],
    { tags: ['products'], revalidate: 3600 }
  )()

const getCachedRelated = (categoryId: string | null, excludeId: string): Promise<SerializedProduct[]> =>
  unstable_cache(
    () => prisma.product.findMany({
      where: { categoryId, id: { not: excludeId }, status: 'ACTIVE' },
      include: { category: true, brand: true },
      take: 4,
    }).then(r => r.map(serializeProduct)),
    ['product-related', categoryId ?? 'none', excludeId],
    { tags: ['products'], revalidate: 3600 }
  )()

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProduct(slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.metaTitle || product.name,
    description: product.metaDesc || product.shortDesc || undefined,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product || product.status !== 'ACTIVE') notFound()

  const related = await getCachedRelated(product.categoryId, product.id)

  const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            {product.images && product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized={product.images[0].includes('sanitary.pk')} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🚿</div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discountPct}%
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {product.brand && (
            <Link href={`/products?brand=${product.brand.slug}`} className="inline-block text-sm font-semibold text-brand hover:underline">
              {product.brand.name}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-4">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand">{formatPrice(Number(product.salePrice))}</span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(Number(product.price))}</span>
              </div>
            ) : (
              <span className="text-3xl font-extrabold text-brand">{formatPrice(Number(product.price))}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className="text-gray-400" />
            <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500'}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {product.shortDesc && (
            <p className="text-gray-600 leading-relaxed">{product.shortDesc}</p>
          )}

          {product.sku && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">SKU:</span> {product.sku}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <AddToCartButton
              id={product.id}
              slug={product.slug}
              name={product.name}
              price={Number(product.price)}
              salePrice={product.salePrice ? Number(product.salePrice) : null}
              image={product.images?.[0] ?? null}
              stock={product.stock}
            />
            <Link
              href="/contact"
              className="flex-1 flex items-center justify-center gap-2 border-2 border-brand text-brand font-semibold py-3 px-6 rounded-xl hover:bg-brand hover:text-white transition-colors"
            >
              Enquire Now
            </Link>
          </div>

          {product.description && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Description</h3>
              <div
                className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
