'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Loader2, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { toast } from 'sonner'

interface WishlistProduct {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  salePrice: number | null
  stock: number
  brand: { name: string } | null
}

interface WishlistEntry {
  id: string
  productId: string
  product: WishlistProduct
}

export default function WishlistPage() {
  const { addItem } = useCart()
  const { toggle } = useWishlist()
  // Wishlist page is behind auth layout — user is always authenticated here
  const [items, setItems] = useState<WishlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/account/wishlist')
      .then(r => r.json())
      .then(d => { setItems(d.data || []); setLoading(false) })
  }, [])

  async function handleRemove(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId))
    await toggle(productId)
  }

  async function handleAddToCart(item: WishlistEntry) {
    const p = item.product
    addItem({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      salePrice: p.salePrice,
      dealerPrice: (p as any).dealerPrice ?? null,
      buyingPrice: (p as any).buyingPrice ?? null,
      image: p.images?.[0] ?? null,
    })

    const res = await fetch(`/api/products/${p.id}/relations`)
    const data = await res.json()
    const hasRelations = (data.data || []).length > 0

    toast.success(`${p.name} added to cart!`, {
      description: hasRelations
        ? 'View the product page for compatible accessories, fittings & related items to complete your installation.'
        : undefined,
      duration: 8000,
      action: hasRelations
        ? { label: 'View Product', onClick: () => { window.location.href = `/products/${p.slug}` } }
        : undefined,
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin text-brand" />
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">My Wishlist</h1>
      <p className="text-sm text-gray-500 mb-6">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>

      {items.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Heart size={48} className="text-gray-200 mx-auto" />
          <p className="text-gray-500 font-medium">No saved items yet</p>
          <Link href="/products" className="inline-block text-sm text-brand hover:underline font-medium">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const p = item.product
            const hasDiscount = p.salePrice != null && p.salePrice < p.price
            const discountPct = hasDiscount ? Math.round((1 - p.salePrice! / p.price) * 100) : 0

            return (
              <div key={item.id} className="flex gap-3 border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
                <Link href={`/products/${p.slug}`} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover" unoptimized={p.images[0].includes('sanitary.pk')} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🚿</div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      -{discountPct}%
                    </span>
                  )}
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {p.brand && <p className="text-[11px] text-gray-400 font-medium">{p.brand.name}</p>}
                    <Link href={`/products/${p.slug}`}
                      className="text-sm font-semibold text-gray-900 hover:text-brand line-clamp-2 transition-colors">
                      {p.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm font-bold text-brand">{formatPrice(p.salePrice!)}</span>
                          <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-brand">{formatPrice(p.price)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {p.stock > 0 ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-brand/10 text-brand hover:bg-brand hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ShoppingCart size={13} /> Add to Cart
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg">Out of Stock</span>
                    )}
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
