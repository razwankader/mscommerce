'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

interface Category { id: string; name: string; slug: string }
interface Brand { id: string; name: string; slug: string }

interface Props {
  params: {
    page?: string
    category?: string
    brand?: string
    featured?: string
    sale?: string
    bundle?: string
    search?: string
  }
  categories: Category[]
  brands: Brand[]
  isSale: boolean
  isBundle: boolean
  total: number
}

function buildUrl(base: Props['params'], overrides: Partial<Props['params']>) {
  const merged = { ...base, ...overrides }
  const qs = Object.entries(merged)
    .filter(([, v]) => v && v !== '1')
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&')
  return `/products${qs ? '?' + qs : ''}`
}

function FilterContent({ params, categories, brands, isSale, isBundle, onClose }: Props & { onClose?: () => void }) {
  return (
    <div className="space-y-6">
      {/* Offers */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Offers</h3>
        <ul className="space-y-1.5">
          <li>
            <a
              href={buildUrl(params, { sale: undefined, bundle: undefined, page: undefined })}
              onClick={onClose}
              className={`block text-sm px-2 py-1 rounded-lg transition-colors ${!isSale && !isBundle ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All Products
            </a>
          </li>
          <li>
            <a
              href={buildUrl(params, { sale: 'true', bundle: undefined, page: undefined })}
              onClick={onClose}
              className={`block text-sm px-2 py-1 rounded-lg transition-colors ${isSale ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              🏷️ On Sale
            </a>
          </li>
          <li>
            <a
              href={buildUrl(params, { bundle: 'true', sale: undefined, page: undefined })}
              onClick={onClose}
              className={`block text-sm px-2 py-1 rounded-lg transition-colors ${isBundle ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              📦 Bundle Offers
            </a>
          </li>
        </ul>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
        <ul className="space-y-1.5">
          <li>
            <a
              href={buildUrl(params, { category: undefined, page: undefined })}
              onClick={onClose}
              className={`block text-sm px-2 py-1 rounded-lg transition-colors ${!params.category ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All Categories
            </a>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <a
                href={buildUrl(params, { category: cat.slug, page: undefined })}
                onClick={onClose}
                className={`block text-sm px-2 py-1 rounded-lg transition-colors ${params.category === cat.slug ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Brands</h3>
          <ul className="space-y-1.5">
            {brands.map((brand) => (
              <li key={brand.id}>
                <a
                  href={buildUrl(params, { brand: brand.slug, page: undefined })}
                  onClick={onClose}
                  className={`block text-sm px-2 py-1 rounded-lg transition-colors ${params.brand === brand.slug ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {brand.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function ProductFilters(props: Props) {
  const [open, setOpen] = useState(false)
  const activeCount = [props.params.category, props.params.brand, props.isSale || props.isBundle ? 'offer' : undefined].filter(Boolean).length

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{props.total} products found</p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-brand transition-colors"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col md:hidden">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterContent {...props} onClose={() => setOpen(false)} />
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <FilterContent {...props} />
        </div>
      </aside>
    </>
  )
}
