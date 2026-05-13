'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'
import { ProductModal } from './product-modal'
import { BulkUploadModal } from './bulk-upload-modal'

async function fetchProducts(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`/api/products?${qs}`)
  return res.json()
}

async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete')
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  DRAFT: 'danger',
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => fetchProducts({ page: String(page), limit: '10', search }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const columns = [
    {
      key: 'images',
      label: '',
      render: (images: string[]) =>
        images?.[0] ? (
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
            <Image src={images[0]} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">🚿</div>
        ),
      className: 'w-14',
    },
    {
      key: 'name',
      label: 'Product',
      render: (name: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{row.sku || 'No SKU'}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (cat: any) => cat?.name || <span className="text-gray-400">—</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (price: number, row: any) => (
        <div>
          {row.salePrice ? (
            <>
              <p className="font-semibold text-brand">{formatPrice(Number(row.salePrice))}</p>
              <p className="text-xs text-gray-400 line-through">{formatPrice(Number(price))}</p>
            </>
          ) : (
            <p className="font-semibold">{formatPrice(Number(price))}</p>
          )}
        </div>
      ),
    },
    { key: 'stock', label: 'Stock', render: (v: number) => <span className={v === 0 ? 'text-red-500 font-medium' : ''}>{v}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => <Badge variant={statusVariant[status] || 'default'}>{status}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v: string) => <span className="text-xs text-gray-500">{formatDate(v)}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditingProduct(row); setModalOpen(true) }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this product?')) deleteMutation.mutate(row.id)
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setBulkUploadOpen(true)}>
            <Upload size={16} /> Bulk Upload
          </Button>
          <Button onClick={() => { setEditingProduct(null); setModalOpen(true) }}>
            <Plus size={16} /> Add Product
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns as any}
        total={data?.total || 0}
        page={page}
        limit={10}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage="No products found"
      />

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['products'] })
          }}
        />
      )}

      {bulkUploadOpen && (
        <BulkUploadModal
          onClose={() => setBulkUploadOpen(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
        />
      )}
    </div>
  )
}
