'use client'

import { useCart } from '@/context/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2, ScanBarcode, Camera, Keyboard, AlertCircle, ChevronDown, Tag, X } from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useZxing } from 'react-zxing'

type ScanMode = 'camera' | 'manual'

function ScannerPanel({ onAdd }: { onAdd: (name: string) => void }) {
  const { addItem } = useCart()
  const [open, setOpen] = useState(true)
  const [scanMode, setScanMode] = useState<ScanMode>('manual')
  const [manualCode, setManualCode] = useState('')
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState('')
  const [scanPaused, setScanPaused] = useState(false)
  const lastScanned = useRef('')

  const lookup = useCallback(async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed || trimmed === lastScanned.current) return
    lastScanned.current = trimmed
    setLooking(true)
    setError('')
    try {
      const res = await fetch(`/api/products/lookup?code=${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Product not found')
        setScanPaused(false)
        return
      }
      const p = await res.json()
      addItem({ id: p.id, slug: p.slug, name: p.name, price: p.price, salePrice: p.salePrice, dealerPrice: p.dealerPrice ?? null, buyingPrice: p.buyingPrice ?? null, image: p.images?.[0] ?? null })
      onAdd(p.name)
      lastScanned.current = ''
      setScanPaused(false)
    } finally {
      setLooking(false)
    }
  }, [addItem, onAdd])

  const { ref: videoRef } = useZxing({
    paused: !open || scanMode !== 'camera' || scanPaused,
    onResult(result) {
      const text = result.getText()
      if (text) { setScanPaused(true); lookup(text) }
    },
  })

  // USB/Bluetooth scanner
  useEffect(() => {
    if (!open || scanMode !== 'manual') return
    let buffer = ''
    let timer: ReturnType<typeof setTimeout>
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          e.preventDefault()   // prevent focused button (e.g. +/-) from firing
          e.stopPropagation()
          lookup(buffer)
        }
        buffer = ''
        clearTimeout(timer)
        return
      }
      if (e.key.length === 1) {
        // Once buffer has chars we know it's scanner input — block side effects
        if (buffer.length > 0) e.preventDefault()
        buffer += e.key
        clearTimeout(timer)
        timer = setTimeout(() => { buffer = '' }, 100)
      }
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(timer) }
  }, [open, scanMode, lookup])

  return (
    <div className="mb-6 border border-brand/30 rounded-xl overflow-hidden bg-orange-50/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-brand hover:bg-orange-50 transition-colors"
      >
        <span className="flex items-center gap-2"><ScanBarcode size={16} /> Scan Barcode to Add Product</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-brand/10">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              onClick={() => { setScanMode('manual'); lastScanned.current = '' }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-colors ${scanMode === 'manual' ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-brand'}`}
            >
              <Keyboard size={14} /> Manual / USB
            </button>
            <button
              onClick={() => { setScanMode('camera'); lastScanned.current = '' }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-colors ${scanMode === 'camera' ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-brand'}`}
            >
              <Camera size={14} /> Camera
            </button>
          </div>

          {/* Camera view */}
          {scanMode === 'camera' && (
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[16/7]">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-24 border-2 border-brand rounded-lg relative">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-brand/60 animate-pulse" />
                </div>
              </div>
              {looking && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
            </div>
          )}

          {/* Manual input */}
          {scanMode === 'manual' && (
            <form
              onSubmit={(e) => { e.preventDefault(); lookup(manualCode); setManualCode('') }}
              className="flex gap-2"
            >
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Barcode or SKU"
                autoFocus
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="submit"
                disabled={looking}
                className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1.5"
              >
                {looking ? <Loader2 size={14} className="animate-spin" /> : null}
                Add
              </button>
            </form>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-700 flex-1">{error}</p>
              <button onClick={() => { setError(''); lastScanned.current = '' }} className="text-xs text-red-400 hover:text-red-600 underline">Retry</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DiscountInput({
  subtotal, discount, onSet,
}: {
  subtotal: number
  discount: number
  onSet: (amount: number) => void
}) {
  const [mode, setMode] = useState<'amount' | 'percent'>('amount')
  const [input, setInput] = useState(discount > 0 ? String(discount) : '')
  const [err, setErr] = useState('')

  function apply() {
    const val = parseFloat(input)
    if (isNaN(val) || val < 0) { setErr('Enter a valid number'); return }
    const amount = mode === 'percent' ? (subtotal * val) / 100 : val
    if (amount > subtotal) { setErr('Discount exceeds subtotal'); return }
    onSet(Math.round(amount * 100) / 100)
    setErr('')
  }

  function clear() { onSet(0); setInput('') }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs shrink-0">
          <button
            onClick={() => setMode('amount')}
            className={`px-2 py-1 font-medium transition-colors ${mode === 'amount' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >৳</button>
          <button
            onClick={() => setMode('percent')}
            className={`px-2 py-1 font-medium transition-colors ${mode === 'percent' ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >%</button>
        </div>
        <input
          type="number"
          min={0}
          max={mode === 'percent' ? 100 : subtotal}
          value={input}
          onChange={(e) => { setInput(e.target.value); setErr('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') apply() }}
          placeholder={mode === 'percent' ? 'e.g. 10' : 'Discount amount'}
          className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-brand"
        />
        <button onClick={apply} className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium shrink-0">Apply</button>
        {discount > 0 && (
          <button onClick={clear} className="p-1 text-gray-400 hover:text-red-500 shrink-0"><X size={13} /></button>
        )}
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600 font-medium text-xs">
          <span>Discount applied</span>
          <span>−{formatPrice(discount)}</span>
        </div>
      )}
      {err && <p className="text-xs text-red-500">{err}</p>}
    </div>
  )
}

function PriceOverride({
  itemId, originalPrice, customPrice, onSet,
}: {
  itemId: string
  originalPrice: number
  customPrice: number | null
  onSet: (id: string, price: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [mode, setMode] = useState<'flat' | 'pct'>('flat')
  const [input, setInput] = useState('')
  const [err, setErr] = useState('')

  function open() {
    setInput(customPrice !== null ? String(customPrice) : '')
    setMode('flat')
    setErr('')
    setEditing(true)
  }

  function apply() {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0) { setErr('Enter a valid number'); return }
    let finalPrice: number
    if (mode === 'flat') {
      if (val > originalPrice) { setErr(`Must be ≤ ${formatPrice(originalPrice)}`); return }
      finalPrice = val
    } else {
      if (val >= 100) { setErr('Enter % between 1–99'); return }
      finalPrice = Math.round(originalPrice * (1 - val / 100))
    }
    onSet(itemId, finalPrice)
    setEditing(false)
    setErr('')
  }

  function clear() { onSet(itemId, null); setInput(''); setEditing(false) }

  // live preview for % mode
  const pctVal = parseFloat(input)
  const previewPrice = mode === 'pct' && !isNaN(pctVal) && pctVal > 0 && pctVal < 100
    ? Math.round(originalPrice * (1 - pctVal / 100))
    : null

  if (editing) {
    return (
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs shrink-0">
            <button
              onClick={() => { setMode('flat'); setInput(''); setErr('') }}
              className={`px-2 py-1 font-medium transition-colors ${mode === 'flat' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >৳</button>
            <button
              onClick={() => { setMode('pct'); setInput(''); setErr('') }}
              className={`px-2 py-1 font-medium transition-colors ${mode === 'pct' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >%</button>
          </div>
          <input
            autoFocus
            type="number"
            min={0}
            max={mode === 'pct' ? 99 : originalPrice}
            value={input}
            onChange={(e) => { setInput(e.target.value); setErr('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') setEditing(false) }}
            placeholder={mode === 'pct' ? 'e.g. 10' : String(originalPrice)}
            className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
          />
          <button onClick={apply} className="px-2 py-1 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 font-medium shrink-0">Apply</button>
          <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:text-gray-600 shrink-0"><X size={13} /></button>
          {customPrice !== null && (
            <button onClick={clear} className="p-1 text-gray-400 hover:text-red-500 shrink-0"><X size={13} /></button>
          )}
        </div>
        {previewPrice !== null && (
          <div className="flex justify-between text-amber-600 font-medium text-xs">
            <span>Price override</span>
            <span>{formatPrice(previewPrice)}</span>
          </div>
        )}
        {customPrice !== null && !previewPrice && (
          <div className="flex justify-between text-amber-600 font-medium text-xs">
            <span>Current override</span>
            <span>{formatPrice(customPrice)}</span>
          </div>
        )}
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={open}
      className={`mt-1.5 flex items-center gap-1 text-xs transition-colors ${
        customPrice !== null
          ? 'text-amber-600 hover:text-amber-700'
          : 'text-gray-400 hover:text-amber-600'
      }`}
    >
      <Tag size={11} />
      {customPrice !== null ? 'Edit price override' : 'Override price'}
    </button>
  )
}

function formatPrice(n: number) {
  return '৳' + n.toLocaleString('en-BD')
}

interface ShippingConfig {
  threshold: number | null
  cost: number
}

export default function CartPage() {
  const { items, count, subtotal, discount, total, removeItem, updateQty, setCustomPrice, setDiscount, clearCart } = useCart()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [shipping, setShipping] = useState<ShippingConfig | null>(null)
  const [addedToast, setAddedToast] = useState<string | null>(null)
  const [revealedDealerPrices, setRevealedDealerPrices] = useState<Set<string>>(new Set())
  const [revealedBuyingPrices, setRevealedBuyingPrices] = useState<Set<string>>(new Set())
  const isStaff = (session?.user?.permissions?.length ?? 0) > 0

  function toggleDealerPrice(id: string) {
    setRevealedDealerPrices(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleBuyingPrice(id: string) {
    setRevealedBuyingPrices(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleScannedAdd = useCallback((name: string) => {
    setAddedToast(name)
    setTimeout(() => setAddedToast(null), 2500)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/account/login?callbackUrl=/cart')
    }
  }, [status, router])

  useEffect(() => {
    fetch('/api/shipping-config')
      .then((r) => r.json())
      .then(setShipping)
      .catch(() => setShipping({ threshold: null, cost: 150 }))
  }, [])

  if (status === 'loading') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-brand" />
    </div>
  )

  if (status === 'unauthenticated') return null

  const deliveryFee = shipping
    ? (shipping.threshold !== null && subtotal >= shipping.threshold ? 0 : shipping.cost)
    : null

  const grandTotal = deliveryFee !== null ? total + deliveryFee : null  // total already has discount applied

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        {isStaff && <ScannerPanel onAdd={handleScannedAdd} />}
        {addedToast && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            <ScanBarcode size={16} className="text-green-500 shrink-0" />
            Added to cart: {addedToast}
          </div>
        )}
        <div className="text-center py-16">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some products to get started.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-dark transition-colors"
          >
            <ArrowLeft size={16} />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({count} items)</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Staff-only barcode scanner */}
      {isStaff && <ScannerPanel onAdd={handleScannedAdd} />}

      {/* Added toast */}
      {addedToast && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          <ScanBarcode size={16} className="text-green-500 shrink-0" />
          Added to cart: {addedToast}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const originalPrice = item.salePrice ?? item.price
            const unitPrice = item.customPrice ?? originalPrice
            return (
              <div key={item.id} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4">
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🚿</div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`}>
                    <p className="text-sm font-semibold text-gray-900 hover:text-brand transition-colors line-clamp-2">
                      {item.name}
                    </p>
                  </Link>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-brand">{formatPrice(unitPrice)}</span>
                    {item.customPrice !== null && (
                      <>
                        <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-1.5 py-0.5 rounded-full">Custom</span>
                      </>
                    )}
                    {item.customPrice === null && item.salePrice && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                    )}
                  </div>
                  {/* Dealer price — staff only, click to reveal */}
                  {isStaff && item.dealerPrice != null && (
                    <button
                      type="button"
                      onClick={() => toggleDealerPrice(item.id)}
                      className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <span>Dealer Price:</span>
                      {revealedDealerPrices.has(item.id) ? (
                        <>
                          <span className="font-bold">{formatPrice(item.dealerPrice)}</span>
                          {item.buyingPrice != null && (
                            <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-50 px-1 py-0.5 rounded">
                              {Math.round((item.dealerPrice - item.buyingPrice) / item.buyingPrice * 100)}% markup
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">tap to reveal</span>
                      )}
                    </button>
                  )}
                  {isStaff && item.buyingPrice != null && (
                    <button
                      type="button"
                      onClick={() => toggleBuyingPrice(item.id)}
                      className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      <span>Buying Price:</span>
                      {revealedBuyingPrices.has(item.id) ? (
                        <>
                          <span className="font-bold">{formatPrice(item.buyingPrice)}</span>
                          <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded">
                            {Math.round(100 - (item.buyingPrice / item.price) * 100)}% discount
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">tap to reveal</span>
                      )}
                    </button>
                  )}
                  {/* Staff price override */}
                  {isStaff && (
                    <PriceOverride
                      itemId={item.id}
                      originalPrice={originalPrice}
                      customPrice={item.customPrice}
                      onSet={setCustomPrice}
                    />
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition-colors disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand hover:text-brand transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* Staff discount */}
              {isStaff && (
                <DiscountInput
                  subtotal={subtotal}
                  discount={discount}
                  onSet={setDiscount}
                />
              )}
              {!isStaff && discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === null
                    ? '—'
                    : deliveryFee === 0
                    ? 'Free'
                    : formatPrice(deliveryFee)}
                </span>
              </div>
              {shipping && shipping.threshold !== null && subtotal < shipping.threshold && (
                <p className="text-xs text-gray-400">
                  Add {formatPrice(shipping.threshold - subtotal)} more for free delivery
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{grandTotal !== null ? formatPrice(grandTotal) : '—'}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:border-brand hover:text-brand transition-colors"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
