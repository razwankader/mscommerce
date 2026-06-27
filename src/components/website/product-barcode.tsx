'use client'

import Barcode from 'react-barcode'

interface Props {
  barcode: string
}

export function ProductBarcode({ barcode }: Props) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Barcode</p>
      <div className="inline-flex flex-col items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
        <Barcode
          value={barcode}
          format="EAN13"
          width={2}
          height={60}
          fontSize={13}
          margin={0}
          background="#ffffff"
          lineColor="#111111"
          displayValue={true}
        />
      </div>
    </div>
  )
}
