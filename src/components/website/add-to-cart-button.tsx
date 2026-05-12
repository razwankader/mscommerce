'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  id: string
  slug: string
  name: string
  price: number
  salePrice: number | null
  image: string | null
  stock: number
  hasRelations?: boolean
}

export function AddToCartButton({ id, slug, name, price, salePrice, image, stock, hasRelations }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handle() {
    addItem({ id, slug, name, price, salePrice, image })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)

    toast.success(`${name} added to cart!`, {
      description: hasRelations
        ? 'Scroll down to see matching accessories, fittings & related products — complete your setup in one order.'
        : undefined,
      duration: 8000,
    })
  }

  return (
    <button
      onClick={handle}
      disabled={stock === 0}
      className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-brand text-white hover:bg-brand-dark'
      }`}
    >
      {added ? <Check size={18} /> : <ShoppingCart size={18} />}
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  )
}
