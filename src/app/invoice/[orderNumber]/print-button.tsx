'use client'

import { Printer, ArrowLeft } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
    >
      <Printer size={16} />
      Print Invoice
    </button>
  )
}

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      <ArrowLeft size={15} />
      Back
    </button>
  )
}
