/**
 * Displays the asset barcode number in a scannable-friendly format.
 * On mobile this is what technicians scan — keep it high contrast and large.
 *
 * Full QR code generation can be added later via a library like `qrcode.react`.
 * For now we display the text code with a copy-to-clipboard affordance.
 */
'use client'

import { useState } from 'react'
import { Copy, Check, Barcode } from 'lucide-react'

interface BarcodeDisplayProps {
  assetNumber: string
  facilityAssetId: string
}

export default function BarcodeDisplay({ assetNumber, facilityAssetId }: BarcodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(assetNumber).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Barcode className="h-4 w-4" aria-hidden="true" />
        Barcode / Asset Number
      </div>

      {/* Barcode number — large, monospace, high contrast for scanning */}
      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3">
        <span className="font-mono text-xl font-bold tracking-widest text-white select-all">
          {assetNumber}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy barcode number"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" /> Copied</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copy</>
          )}
        </button>
      </div>

      {/* Facility Asset ID */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Facility Asset ID</p>
        <p className="font-mono text-xs text-blue-700 break-all">{facilityAssetId}</p>
      </div>

      {/* QR placeholder */}
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-6 text-xs text-slate-400">
        QR code — coming soon (qrcode.react)
      </div>
    </div>
  )
}
