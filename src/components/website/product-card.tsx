'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Check, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { SerializedProduct } from '@/types'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: SerializedProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [dealerRevealed, setDealerRevealed] = useState(false)
  const [buyingRevealed, setBuyingRevealed] = useState(false)

  const isStaff = (session?.user?.permissions?.length ?? 0) > 0

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (status !== 'authenticated') { router.push('/account/login'); return }
    await toggle(product.id)
  }

  const hasDiscount = product.salePrice != null && product.salePrice < product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.salePrice! / product.price) * 100)
    : 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (status !== 'authenticated') { router.push('/account/login'); return }
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      dealerPrice: product.dealerPrice ?? null,
      buyingPrice: product.buyingPrice ?? null,
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
            {isStaff && product.dealerPrice != null && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setDealerRevealed(v => !v) }}
                className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                <span>Dealer Price</span>
                {dealerRevealed ? (
                  <>
                    <span className="font-bold">{formatPrice(product.dealerPrice)}</span>
                    {product.buyingPrice != null && (
                      <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-50 px-1 py-0.5 rounded">
                        {Math.round((product.dealerPrice - product.buyingPrice) / product.buyingPrice * 100)}% markup
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">— tap to reveal</span>
                )}
              </button>
            )}
            {isStaff && product.buyingPrice != null && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setBuyingRevealed(v => !v) }}
                className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <span>Buying Price</span>
                {buyingRevealed ? (
                  <>
                    <span className="font-bold">{formatPrice(product.buyingPrice)}</span>
                    <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded">
                      {Math.round(100 - (product.buyingPrice / product.price) * 100)}% discount
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">— tap to reveal</span>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleWishlist}
              title={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`p-2 rounded-lg transition-colors ${
                isWishlisted(product.id)
                  ? 'bg-red-50 text-red-500'
                  : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={16} className={isWishlisted(product.id) ? 'fill-current' : ''} />
            </button>
            {product.stock > 0 ? (
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
            ) : (
              <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
