'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface WishlistContextValue {
  ids: Set<string>
  toggle: (productId: string) => Promise<void>
  isWishlisted: (productId: string) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextValue>({
  ids: new Set(),
  toggle: async () => {},
  isWishlisted: () => false,
  loading: false,
})

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') { setIds(new Set()); return }
    setLoading(true)
    fetch('/api/account/wishlist')
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setIds(new Set((d.data || []).map((i: any) => i.productId))))
      .finally(() => setLoading(false))
  }, [status])

  const toggle = useCallback(async (productId: string) => {
    if (status !== 'authenticated') return
    const wishlisted = ids.has(productId)

    // Optimistic update
    setIds(prev => {
      const next = new Set(prev)
      wishlisted ? next.delete(productId) : next.add(productId)
      return next
    })

    try {
      if (wishlisted) {
        await fetch(`/api/account/wishlist/${productId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/account/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
      }
    } catch {
      // Revert on error
      setIds(prev => {
        const next = new Set(prev)
        wishlisted ? next.add(productId) : next.delete(productId)
        return next
      })
    }
  }, [ids, status])

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids])

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWishlisted, loading }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
