'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { SerializedProduct } from '@/types'
import { useCart } from '@/context/cart-context'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProductCardProps {
  product: SerializedProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const hasDiscount = product.salePrice != null && product.salePrice < product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images?.[0] ?? null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)

    const res = await fetch(`/api/products/${product.id}/relations`)
    const data = await res.json()
    const hasRelations = (data.data || []).length > 0

    toast.success(`${product.name} added to cart!`, {
      description: hasRelations
        ? 'View the product page for compatible accessories, fittings & related items to complete your installation.'
        : undefined,
      duration: 8000,
      action: hasRelations
        ? { label: 'View Product', onClick: () => { window.location.href = `/products/${product.slug}` } }
        : undefined,
    })
  }

  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {product.images && product.images[0] && !imgError ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            unoptimized={product.images[0].includes('sanitary.pk')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🚿</span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
        {product.featured && !hasDiscount && (
          <span className="absolute top-2 left-2 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </Link>
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1 font-medium">{product.brand.name}</p>
        )}
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-brand transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div>
                <span className="text-base font-bold text-brand">
                  {formatPrice(product.salePrice!)}
                </span>
                <span className="ml-2 text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-base font-bold text-brand">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`p-2 rounded-lg transition-colors ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
            }`}
            title="Add to Cart"
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
