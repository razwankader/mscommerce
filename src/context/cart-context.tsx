'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  salePrice: number | null
  dealerPrice: number | null   // wholesale price — visible to staff only
  customPrice: number | null   // staff price override (must be ≤ original effective price)
  image: string | null
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  discount: number
  total: number
  addItem: (item: Omit<CartItem, 'quantity' | 'customPrice'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  setCustomPrice: (id: string, price: number | null) => void
  setDiscount: (amount: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'matin_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [discount, setDiscountState] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'quantity' | 'customPrice'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1, customPrice: null, dealerPrice: item.dealerPrice ?? null }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) return
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i))
  }, [])

  const setCustomPrice = useCallback((id: string, price: number | null) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, customPrice: price } : i))
  }, [])

  const clearCart = useCallback(() => { setItems([]); setDiscountState(0) }, [])
  const setDiscount = useCallback((amount: number) => {
    setDiscountState(Math.max(0, amount))
  }, [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + (i.customPrice ?? i.salePrice ?? i.price) * i.quantity, 0)
  const total = Math.max(0, subtotal - discount)

  return (
    <CartContext.Provider value={{ items, count, subtotal, discount, total, addItem, removeItem, updateQty, setCustomPrice, setDiscount, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
