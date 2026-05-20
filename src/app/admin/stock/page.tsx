'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useZxing } from 'react-zxing'
import { Camera, CameraOff, Keyboard, CheckCircle, AlertCircle, Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

type Mode = 'camera' | 'manual'

interface Product {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  stock: number
  images: string[]
}

const TYPE_OPTIONS = [
  { value: 'PURCHASE', label: 'Stock In — Purchase / Restock' },
  { value: 'RETURN',   label: 'Stock In — Return' },
  { value: 'SALE',     label: 'Stock Out — Sale' },
  { value: 'ADJUSTMENT', label: 'Stock Out — Adjustment / Damage' },
]

export default function StockScanPage() {
  const [mode, setMode] = useState<Mode>('camera')
  const [manualCode, setManualCode] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [looking, setLooking] = useState(false)
  const [txType, setTxType] = useState('PURCHASE')
  const [txQty, setTxQty] = useState('1')
  const [txNote, setTxNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [scanPaused, setScanPaused] = useState(false)
  const lastScanned = useRef('')

  const lookup = useCallback(async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed || trimmed === lastScanned.current) return
    lastScanned.current = trimmed
    setLooking(true)
    setLookupError('')
    setProduct(null)
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/stock/lookup?code=${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        const err = await res.json()
        setLookupError(err.error || 'Not found')
        return
      }
      setProduct(await res.json())
    } finally {
      setLooking(false)
    }
  }, [])

  // Camera scanner via react-zxing
  const { ref: videoRef } = useZxing({
    paused: mode !== 'camera' || scanPaused,
    onResult(result) {
      const text = result.getText()
      if (text && text !== lastScanned.current) {
        setScanPaused(true)
        lookup(text)
      }
    },
  })

  // Hardware scanner — listens for rapid keyboard input ending in Enter
  useEffect(() => {
    if (mode !== 'manual') return
    let buffer = ''
    let timer: ReturnType<typeof setTimeout>
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'Enter') {
        if (buffer.length > 2) lookup(buffer)
        buffer = ''
        clearTimeout(timer)
        return
      }
      if (e.key.length === 1) {
        buffer += e.key
        clearTimeout(timer)
        timer = setTimeout(() => { buffer = '' }, 100)
      }
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(timer) }
  }, [mode, lookup])

  async function handleTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/stock/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: txType, quantity: Number(txQty), note: txNote || undefined }),
      })
      if (!res.ok) {
        const err = await res.json()
        setLookupError(err.error || 'Failed')
        return
      }
      const tx = await res.json()
      setSuccess(`Done! New stock: ${tx.balanceAfter} units`)
      setProduct((p) => p ? { ...p, stock: tx.balanceAfter } : null)
      setTxQty('1')
      setTxNote('')
      lastScanned.current = ''
      setScanPaused(false)
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setProduct(null)
    setLookupError('')
    setSuccess('')
    setManualCode('')
    lastScanned.current = ''
    setScanPaused(false)
  }

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Scanner</h1>
        <p className="text-sm text-gray-500 mt-1">Scan barcode or SKU to log stock in / out</p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => { setMode('camera'); reset() }}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-colors ${mode === 'camera' ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-brand'}`}
        >
          <Camera size={16} className="shrink-0" />
          <span>Camera Scan</span>
        </button>
        <button
          onClick={() => { setMode('manual'); reset() }}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-colors ${mode === 'manual' ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600 hover:border-brand'}`}
        >
          <Keyboard size={16} className="shrink-0" />
          <span className="leading-tight text-center">Manual /<br className="sm:hidden" /> USB Scanner</span>
        </button>
      </div>

      {/* Camera view */}
      {mode === 'camera' && !product && (
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[4/3] mb-6">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {/* scan line overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-40 border-2 border-brand rounded-xl relative">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-brand/60 animate-pulse" />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                Point camera at barcode
              </span>
            </div>
          </div>
          {looking && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-white" />
            </div>
          )}
        </div>
      )}

      {/* Manual input */}
      {mode === 'manual' && !product && (
        <div className="mb-6 space-y-3">
          <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            USB/Bluetooth barcode scanners work automatically — just scan. Or type the code below.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); lookup(manualCode) }} className="flex flex-col sm:flex-row gap-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Barcode or SKU"
              autoFocus
              className="flex-1"
            />
            <Button type="submit" loading={looking} className="sm:w-auto w-full">Look up</Button>
          </form>
        </div>
      )}

      {/* Lookup error */}
      {lookupError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{lookupError}</p>
          <button onClick={reset} className="ml-auto text-xs text-red-400 hover:text-red-600 underline">Try again</button>
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-medium">{success}</p>
        </div>
      )}

      {/* Product card + transaction form */}
      {product && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
            {product.images[0] ? (
              <img src={product.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                <Package size={24} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 leading-snug">{product.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {product.barcode && <span>Barcode: {product.barcode} · </span>}
                {product.sku && <span>SKU: {product.sku}</span>}
              </p>
              <p className="text-sm font-bold text-brand mt-1">Stock: {product.stock} units</p>
            </div>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">✕ Clear</button>
          </div>

          <form onSubmit={handleTransaction} className="space-y-3 border border-gray-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-900">Record Transaction</p>
            <Select
              label="Type"
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={txQty}
              onChange={(e) => setTxQty(e.target.value)}
              required
            />
            <Input
              label="Note (optional)"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              placeholder="e.g. Received from supplier"
            />
            <Button type="submit" loading={saving} className="w-full">Confirm</Button>
          </form>
        </div>
      )}
    </div>
  )
}
