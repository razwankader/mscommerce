'use client'

import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ProductRelations } from './product-relations'
import { StockTab } from './stock-tab'

interface ProductModalProps {
  product?: any
  onClose: () => void
  onSuccess: () => void
}

export function ProductModal({ product, onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'relations' | 'stock'>('details')
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [form, setForm] = useState({
    name: product?.name || '',
    shortDesc: product?.shortDesc || '',
    description: product?.description || '',
    sku: product?.sku || '',
    price: product?.price || '',
    salePrice: product?.salePrice || '',
    stock: product?.stock || 0,
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    barcode: product?.barcode || '',
    featured: product?.featured || false,
    bundle: product?.bundle || false,
    status: product?.status || 'ACTIVE',
    images: product?.images || [],
    metaTitle: product?.metaTitle || '',
    metaDesc: product?.metaDesc || '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/brands').then((r) => r.json()),
    ]).then(([cats, brnds]) => {
      setCategories(cats.data || [])
      setBrands(brnds.data || [])
    })
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setForm((f) => ({ ...f, images: [...f.images, data.url] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price), salePrice: form.salePrice ? Number(form.salePrice) : null, stock: Number(form.stock), barcode: form.barcode || null }),
      })
      if (!res.ok) throw new Error(await res.text())
      onSuccess()
    } catch (err) {
      alert('Error saving product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Tabs — only for edit mode */}
        {product && (
          <div className="flex border-b border-gray-100 px-6">
            {(['details', 'stock', 'relations'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'relations' ? 'Related Products' : tab === 'stock' ? 'Stock' : 'Details'}
              </button>
            ))}
          </div>
        )}

        {product && activeTab === 'relations' ? (
          <div className="p-6">
            <ProductRelations productId={product.id} />
          </div>
        ) : product && activeTab === 'stock' ? (
          <div className="p-6">
            <StockTab productId={product.id} currentStock={product.stock ?? 0} />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Product Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Premium Basin Mixer"
              />
            </div>
            <Input
              label="Price (৳) *"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              placeholder="0"
            />
            <Input
              label="Sale Price (৳)"
              type="number"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              placeholder="Leave empty if no discount"
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. TMP-001"
            />
            <Input
              label="Barcode (EAN / UPC)"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              placeholder="e.g. 8901234567890"
            />
            <Input
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
            />
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">— Select Category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select
              label="Brand"
              value={form.brandId}
              onChange={(e) => setForm({ ...form, brandId: e.target.value })}
            >
              <option value="">— Select Brand —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </Select>
          </div>

          <Textarea
            label="Short Description"
            value={form.shortDesc}
            onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
            rows={2}
            placeholder="Brief product summary"
          />

          <Textarea
            label="Full Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Detailed product description"
          />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Featured product
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bundle"
                checked={form.bundle}
                onChange={(e) => setForm({ ...form, bundle: e.target.checked })}
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
              <label htmlFor="bundle" className="text-sm font-medium text-gray-700">
                Bundle offer
              </label>
            </div>
          </div>

          {/* Images */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Images</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.images.map((img: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_: string, j: number) => j !== i) }))}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand transition-colors">
                <Upload size={16} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">SEO</p>
            <div className="space-y-3">
              <Input
                label="Meta Title"
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                placeholder="SEO title"
              />
              <Textarea
                label="Meta Description"
                value={form.metaDesc}
                onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
                rows={2}
                placeholder="SEO description"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
