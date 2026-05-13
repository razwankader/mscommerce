'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadResult {
  total: number
  created: number
  updated: number
  failed: number
  errors: string[]
}

const CSV_TEMPLATE = [
  'name,sku,price,salePrice,stock,status,featured,categorySlug,brandSlug,shortDesc,description,images,metaTitle,metaDesc,relatedSkus,accessorySkus,fittingSkus',
  '"Premium Basin Mixer",TMP-001,4500,3999,50,ACTIVE,false,bathroom-fittings,toto,"High-quality chrome basin mixer","Single-lever basin mixer with ceramic cartridge. Chrome finish. Suitable for standard basin installations. Easy to clean and durable.",https://example.com/img1.jpg|https://example.com/img2.jpg,"Premium Basin Mixer | Brand","Best basin mixer for your bathroom",,TMP-002,',
  '"Bottle Trap",TMP-002,650,,100,ACTIVE,false,bathroom-accessories,,,"Bottle trap for basin waste connection","P-type bottle trap with adjustable height. Compatible with most basin waste outlets. Chrome plated finish.",,,,,'
].join('\n')

export function BulkUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (!f.name.endsWith('.csv')) { alert('Only CSV files accepted'); return }
    setFile(f)
    setResult(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-upload-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/bulk-upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Upload failed'); return }
      setResult(data)
      if (data.created > 0 || data.updated > 0) onSuccess()
    } catch {
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Bulk Product Upload</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Template download */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-brand border border-brand/30 rounded-xl py-2.5 hover:bg-brand/5 transition-colors"
          >
            <Download size={15} />
            Download CSV Template
          </button>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              dragOver ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/50'
            }`}
          >
            {file ? (
              <>
                <FileText size={32} className="text-brand" />
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB — click to change</p>
              </>
            ) : (
              <>
                <Upload size={32} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-600">Drop CSV here or click to browse</p>
                <p className="text-xs text-gray-400">Only .csv files accepted</p>
              </>
            )}
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-50 rounded-lg py-3">
                  <p className="text-xl font-bold text-green-600">{result.created}</p>
                  <p className="text-xs text-green-700 font-medium">Created</p>
                </div>
                <div className="bg-blue-50 rounded-lg py-3">
                  <p className="text-xl font-bold text-blue-600">{result.updated}</p>
                  <p className="text-xs text-blue-700 font-medium">Updated</p>
                </div>
                <div className="bg-red-50 rounded-lg py-3">
                  <p className="text-xl font-bold text-red-500">{result.failed}</p>
                  <p className="text-xs text-red-600 font-medium">Failed</p>
                </div>
              </div>
              {result.failed === 0 ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  All {result.total} rows processed successfully
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                    <AlertCircle size={16} />
                    {result.failed} row(s) failed
                  </div>
                  <ul className="text-xs text-red-600 space-y-0.5 max-h-32 overflow-y-auto pl-1">
                    {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={handleUpload} loading={loading} disabled={!file}>
              Upload & Process
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
