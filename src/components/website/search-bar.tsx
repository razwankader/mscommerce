'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Tag } from 'lucide-react'

interface Suggestion {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  category: { name: string } | null
  brand: { name: string } | null
}

function formatPrice(n: number) {
  return '৳' + n.toLocaleString('en-BD')
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // fetch suggestions on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=6&status=ACTIVE`)
        const data = await res.json()
        setSuggestions(data.data || [])
        setOpen(true)
        setActive(-1)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function submit(q = query) {
    const trimmed = q.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(`/products?search=${encodeURIComponent(trimmed)}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && suggestions[active]) {
        router.push(`/products/${suggestions[active].slug}`)
        setOpen(false)
        setQuery('')
      } else {
        submit()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function clear() {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search products, brands, categories..."
          className="w-full rounded-xl border border-gray-200 pl-4 pr-20 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
        />
        {/* Clear button */}
        {query && (
          <button
            onClick={clear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        )}
        {/* Search button */}
        <button
          onClick={() => submit()}
          className="absolute right-0 top-0 h-full px-4 bg-brand text-white rounded-r-xl hover:bg-brand-dark transition-colors flex items-center"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {suggestions.length === 0 && !loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Suggestions</span>
                <span className="text-xs text-gray-400">{suggestions.length} found</span>
              </div>
              <ul>
                {suggestions.map((s, i) => {
                  const displayPrice = s.salePrice ?? s.price
                  return (
                    <li key={s.id}>
                      <button
                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors ${i === active ? 'bg-orange-50' : ''}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => {
                          router.push(`/products/${s.slug}`)
                          setOpen(false)
                          setQuery('')
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          <Tag size={14} className="text-brand" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {highlight(s.name, query)}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {s.category?.name}{s.brand ? ` · ${s.brand.name}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-brand">{formatPrice(displayPrice)}</p>
                          {s.salePrice && (
                            <p className="text-xs text-gray-400 line-through">{formatPrice(s.price)}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {/* View all link */}
              <button
                onClick={() => submit()}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-gray-100 text-sm font-medium text-brand hover:bg-orange-50 transition-colors"
              >
                <Search size={13} />
                View all results for &ldquo;{query}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Highlight matching substring
function highlight(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-orange-100 text-brand rounded px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
