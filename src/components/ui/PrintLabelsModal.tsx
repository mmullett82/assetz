'use client'

import { useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, X, QrCode, SlidersHorizontal } from 'lucide-react'

export interface LabelItem {
  id: string
  name: string
  line1: string        // primary code (facility_asset_id / part_number)
  line2?: string       // secondary code (asset_number / barcode)
  qr_value: string     // what gets encoded in the QR
}

type LabelSize = 'sm' | 'md' | 'lg'

interface SizeConfig {
  label: string
  desc: string
  pxW: number
  pxH: number
  qrSize: number
  cols: number
}

const SIZES: Record<LabelSize, SizeConfig> = {
  sm: { label: 'Small',  desc: '2" × 1"',    pxW: 192, pxH: 96,  qrSize: 64,  cols: 2 },
  md: { label: 'Medium', desc: '2.5" × 1.5"', pxW: 240, pxH: 144, qrSize: 96,  cols: 2 },
  lg: { label: 'Large',  desc: '4" × 2"',     pxW: 384, pxH: 192, qrSize: 128, cols: 1 },
}

interface PrintLabelsModalProps {
  open: boolean
  items: LabelItem[]
  title?: string
  onClose: () => void
}

export default function PrintLabelsModal({ open, items, title = 'Print Labels', onClose }: PrintLabelsModalProps) {
  const [size, setSize] = useState<LabelSize>('md')
  const [showSettings, setShowSettings] = useState(false)
  const [includeUrl, setIncludeUrl] = useState(false)
  const [copies, setCopies] = useState(1)

  const cfg = SIZES[size]

  // Repeat items by copy count
  const labelItems = Array.from({ length: copies }, () => items).flat()

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  if (!open) return null

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-labels-root { display: block !important; position: static !important; }
          .print-labels-root .no-print { display: none !important; }
          .print-labels-grid {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
            padding: 0 !important;
          }
          .print-label-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto print-labels-root">
        <div className="relative m-4 w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <QrCode className="h-5 w-5 text-slate-600" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <p className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''} × {copies} cop{copies !== 1 ? 'ies' : 'y'} = {labelItems.length} labels</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettings((v) => !v)}
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  showSettings ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Options
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="no-print border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex flex-wrap items-end gap-6">
                {/* Size */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Label Size</label>
                  <div className="flex gap-1.5">
                    {(Object.entries(SIZES) as [LabelSize, SizeConfig][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSize(key)}
                        className={[
                          'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                          size === key ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        {cfg.label}
                        <span className="block text-xs font-normal text-slate-400">{cfg.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Copies */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Copies per Item</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCopies((n) => Math.max(1, n - 1))}
                      className="h-9 w-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center text-lg font-medium"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-800">{copies}</span>
                    <button
                      type="button"
                      onClick={() => setCopies((n) => Math.min(10, n + 1))}
                      className="h-9 w-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* QR content */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">QR Code Contains</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIncludeUrl(false)}
                      className={[
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        !includeUrl ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      ID / Barcode
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncludeUrl(true)}
                      className={[
                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        includeUrl ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      App URL (scan → opens in assetZ)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Label preview */}
          <div className="p-6 bg-slate-100 min-h-48 overflow-y-auto max-h-[60vh]">
            <div
              className="print-labels-grid flex flex-wrap gap-2"
              style={{ justifyContent: cfg.cols === 1 ? 'flex-start' : undefined }}
            >
              {labelItems.map((item, i) => (
                <LabelCard
                  key={`${item.id}-${i}`}
                  item={item}
                  cfg={cfg}
                  useUrl={includeUrl}
                />
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <div className="no-print px-6 py-3 border-t border-slate-200 bg-white rounded-b-2xl">
            <p className="text-xs text-slate-400">
              Tip: Use label stock matching your chosen size. In the print dialog, set margins to None and scale to 100%. For best results, print to a label printer (e.g. Dymo, Zebra, Brother).
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function LabelCard({ item, cfg, useUrl }: { item: LabelItem; cfg: SizeConfig; useUrl: boolean }) {
  const qrValue = useUrl
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/assets/${item.id}`
    : item.qr_value

  const isLarge = cfg.qrSize >= 128

  return (
    <div
      className="print-label-item bg-white border border-slate-300 rounded flex overflow-hidden shrink-0"
      style={{ width: cfg.pxW, height: cfg.pxH }}
    >
      {/* QR code */}
      <div className="flex items-center justify-center bg-white shrink-0 p-1.5"
        style={{ width: cfg.qrSize + 12, height: cfg.pxH }}
      >
        <QRCodeSVG
          value={qrValue}
          size={cfg.qrSize}
          level="M"
          includeMargin={false}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-center px-2 py-1.5 border-l border-slate-200 overflow-hidden">
        <p
          className="font-bold text-slate-900 truncate leading-tight"
          style={{ fontSize: isLarge ? 11 : 9 }}
        >
          {item.name}
        </p>
        <p
          className="font-mono text-slate-700 truncate leading-tight mt-0.5"
          style={{ fontSize: isLarge ? 9 : 7 }}
        >
          {item.line1}
        </p>
        {item.line2 && (
          <p
            className="font-mono text-slate-400 truncate leading-tight"
            style={{ fontSize: isLarge ? 8 : 6 }}
          >
            {item.line2}
          </p>
        )}
        {/* Small barcode-style stripes decoration */}
        <div className="flex gap-px mt-1.5 h-2.5 items-end overflow-hidden opacity-30">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-700"
              style={{
                width: i % 3 === 0 ? 2 : 1,
                height: `${60 + ((i * 13) % 40)}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
