'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ProductCard } from '@/components/website/product-card'
import { Loader2 } from 'lucide-react'
import type { SerializedProduct } from '@/types'

interface Props {
  initialProducts: SerializedProduct[]
  initialTotal: number
  initialPage: number
  totalPages: number
  params: Record<string, string | undefined>
}

function buildPageUrl(params: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...params, ...overrides }
  const qs = Object.entries(merged)
    .filter(([, v]) => v && v !== '1')
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&')
  return `/products${qs ? '?' + qs : ''}`
}

function buildApiUrl(params: Record<string, string | undefined>, page: number) {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('limit', '12')
  if (params.category) qs.set('category', params.category)
  if (params.brand) qs.set('brand', params.brand)
  if (params.sale) qs.set('sale', params.sale)
  if (params.bundle) qs.set('bundle', params.bundle)
  if (params.search) qs.set('search', params.search)
  if (params.featured) qs.set('featured', params.featured)
  return `/api/website/products?${qs}`
}

export function ProductGrid({ initialProducts, initialTotal, initialPage, totalPages, params }: Props) {
  const [products, setProducts] = useState<SerializedProduct[]>(initialProducts)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialPage < totalPages)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isMobile = useRef(false)

  // Sync when server params change (navigation)
  useEffect(() => {
    setProducts(initialProducts)
    setPage(initialPage)
    setHasMore(initialPage < totalPages)
  }, [initialProducts, initialPage, totalPages])

  useEffect(() => {
    isMobile.current = window.innerWidth < 768
    const onResize = () => { isMobile.current = window.innerWidth < 768 }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(buildApiUrl(params, page + 1))
      const json = await res.json()
      setProducts((prev) => [...prev, ...json.data])
      setPage(page + 1)
      setHasMore(json.hasMore)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, params])

  // IntersectionObserver — mobile only
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && isMobile.current) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  if (products.length === 0) {
    return <div className="text-center py-16 text-gray-500">No products found.</div>
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile: sentinel + spinner */}
      <div ref={sentinelRef} className="md:hidden mt-6 flex justify-center min-h-[1px]">
        {loading && <Loader2 size={24} className="animate-spin text-brand" />}
        {!hasMore && products.length < initialTotal && (
          <p className="text-sm text-gray-400">All products loaded</p>
        )}
      </div>

      {/* Desktop: traditional pagination */}
      {totalPages > 1 && (
        <div className="hidden md:flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={buildPageUrl(params, { page: p === 1 ? undefined : String(p) })}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors ${
                p === initialPage
                  ? 'bg-brand text-white border-brand'
                  : 'border-gray-200 text-gray-700 hover:border-brand'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
