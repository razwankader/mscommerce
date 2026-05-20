'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Column<T> {
  key: string
  label: string
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  mobileHide?: boolean   // hide this column in card header on mobile
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  loading,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit)

  const skeletonRows = Array.from({ length: 5 })

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider', col.className)}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              skeletonRows.map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-gray-700', col.className)}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          skeletonRows.map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-500 text-sm">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, i) => {
            // First non-empty-label col = primary, last col = actions, rest = detail rows
            const actionCol = columns[columns.length - 1]
            const primaryCol = columns.find(c => c.label && c.key !== actionCol.key)
            const detailCols = columns.filter(c => c !== primaryCol && c !== actionCol && c.label)
            const imageCols = columns.filter(c => !c.label)

            return (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  {/* Image */}
                  {imageCols.map(col => (
                    <div key={col.key} className="shrink-0">
                      {col.render ? col.render(row[col.key], row) : null}
                    </div>
                  ))}
                  <div className="flex-1 min-w-0">
                    {/* Primary info */}
                    {primaryCol && (
                      <div className="mb-2">
                        {primaryCol.render ? primaryCol.render(row[primaryCol.key], row) : <p className="font-medium text-gray-900">{row[primaryCol.key]}</p>}
                      </div>
                    )}
                    {/* Detail rows */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {detailCols.map(col => (
                        <div key={col.key} className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase">{col.label}:</span>
                          <span className="text-xs text-gray-600">
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="shrink-0">
                    {actionCol.render ? actionCol.render(row[actionCol.key], row) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm text-gray-500">
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft size={14} />
            </Button>
            <span className="text-sm text-gray-700">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
