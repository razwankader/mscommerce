'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, Plus, Loader2 } from 'lucide-react'

interface RelatedProduct {
  id: string
  name: string
  slug: string
  images: string[]
  price: string | number
  status: string
}

interface Relation {
  id: string
  relatedId: string
  type: 'RELATED' | 'ACCESSORY' | 'FITTING'
  related: RelatedProduct
}

const TYPE_LABELS: Record<string, string> = {
  RELATED: 'Related',
  ACCESSORY: 'Accessory',
  FITTING: 'Fitting',
}

const TYPE_COLORS: Record<string, string> = {
  RELATED: 'bg-blue-100 text-blue-700',
  ACCESSORY: 'bg-purple-100 text-purple-700',
  FITTING: 'bg-green-100 text-green-700',
}

export function ProductRelations({ productId }: { productId: string }) {
  const [relations, setRelations] = useState<Relation[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<RelatedProduct[]>([])
  const [selectedType, setSelectedType] = useState<'RELATED' | 'ACCESSORY' | 'FITTING'>('RELATED')
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const loadRelations = useCallback(async () => {
    const res = await fetch(`/api/products/${productId}/relations`)
    const data = await res.json()
    setRelations(data.data || [])
  }, [productId])

  useEffect(() => { loadRelations() }, [loadRelations])

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&limit=8`)
        const data = await res.json()
        const existingIds = new Set([productId, ...relations.map(r => r.relatedId)])
        setSearchResults((data.data || []).filter((p: RelatedProduct) => !existingIds.has(p.id)))
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, relations, productId])

  async function addRelation(relatedId: string) {
    setAdding(relatedId)
    try {
      await fetch(`/api/products/${productId}/relations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatedId, type: selectedType }),
      })
      setSearch('')
      setSearchResults([])
      await loadRelations()
    } finally {
      setAdding(null)
    }
  }

  async function removeRelation(relatedId: string) {
    setRemoving(relatedId)
    try {
      await fetch(`/api/products/${productId}/relations/${relatedId}`, { method: 'DELETE' })
      await loadRelations()
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + type selector */}
      <div className="flex gap-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="RELATED">Related</option>
          <option value="ACCESSORY">Accessory</option>
          <option value="FITTING">Fitting</option>
        </select>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products to add…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
        </div>
      </div>

      {/* Search results dropdown */}
      {searchResults.length > 0 && (
        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-52 overflow-y-auto">
          {searchResults.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-lg">🚿</div>
              )}
              <span className="text-sm text-gray-700 flex-1 line-clamp-1">{p.name}</span>
              <button
                onClick={() => addRelation(p.id)}
                disabled={adding === p.id}
                className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark disabled:opacity-50"
              >
                {adding === p.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Existing relations */}
      {relations.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No related products yet. Search above to add.</p>
      ) : (
        <div className="space-y-2">
          {relations.map((rel) => (
            <div key={rel.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50">
              {rel.related.images?.[0] ? (
                <img src={rel.related.images[0]} alt={rel.related.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 text-lg">🚿</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{rel.related.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${TYPE_COLORS[rel.type]}`}>
                  {TYPE_LABELS[rel.type]}
                </span>
              </div>
              <button
                onClick={() => removeRelation(rel.relatedId)}
                disabled={removing === rel.relatedId}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {removing === rel.relatedId ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
