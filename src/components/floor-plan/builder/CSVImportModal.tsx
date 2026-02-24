'use client'

import { useState, useRef } from 'react'
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { parseCSVPins, csvRowsToPins, type CSVPinRow } from '@/lib/builder-state'
import type { AssetPin, BuilderFloor } from '@/lib/builder-state'
import type { Asset } from '@/types'

interface CSVImportModalProps {
  floor:         BuilderFloor
  assets:        Asset[]
  onFloorChange: (next: BuilderFloor) => void
  onClose:       () => void
}

export default function CSVImportModal({
  floor,
  assets,
  onFloorChange,
  onClose,
}: CSVImportModalProps) {
  const [csvText, setCsvText] = useState('')
  const [rows,    setRows]    = useState<CSVPinRow[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleParse() {
    setRows(parseCSVPins(csvText))
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') {
        setCsvText(text)
        setRows(parseCSVPins(text))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleImport() {
    if (!rows) return
    const newPins: AssetPin[] = csvRowsToPins(rows)
    // Merge: keep existing pins not in import, add/replace from import
    const importIds = new Set(newPins.map((p) => p.assetId))
    const existing  = floor.pins.filter((p) => !importIds.has(p.assetId))
    onFloorChange({ ...floor, pins: [...existing, ...newPins] })
    onClose()
  }

  const validCount   = rows?.filter((r) => r.valid).length ?? 0
  const invalidCount = rows?.filter((r) => !r.valid).length ?? 0

  function assetName(id: string) {
    return assets.find((a) => a.id === id)?.name ?? null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-base font-bold text-slate-900">Bulk CSV Pin Import</h2>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Format hint */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-600 font-mono leading-relaxed">
            <p className="font-semibold text-slate-700 mb-1 font-sans">Expected format:</p>
            asset_id,x,y<br />
            ast-001,285,145<br />
            ast-002,450,145
          </div>

          {/* File upload */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload CSV file
            </button>
            <span className="text-xs text-slate-400">or paste below</span>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv,text/plain"
              className="sr-only" onChange={handleFileUpload} />
          </div>

          {/* Textarea */}
          <textarea
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); setRows(null) }}
            placeholder={"asset_id,x,y\nast-001,285,145\nast-002,450,145"}
            rows={6}
            className="w-full font-mono text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />

          {/* Parse button */}
          {!rows && (
            <button
              type="button"
              onClick={handleParse}
              disabled={!csvText.trim()}
              className="self-start px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Parse &amp; Preview
            </button>
          )}

          {/* Preview table */}
          {rows && rows.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1 text-xs text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {invalidCount} error{invalidCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-left">
                      <th className="px-3 py-2 font-medium">Asset ID</th>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium text-right">X</th>
                      <th className="px-3 py-2 font-medium text-right">Y</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={[
                        'border-t border-slate-100',
                        row.valid ? '' : 'bg-red-50',
                      ].join(' ')}>
                        <td className="px-3 py-1.5 font-mono text-slate-700">{row.assetId || '—'}</td>
                        <td className="px-3 py-1.5 text-slate-500">
                          {assetName(row.assetId) ?? <span className="text-slate-300 italic">unknown</span>}
                        </td>
                        <td className="px-3 py-1.5 text-right text-slate-600">{row.valid ? row.x : '—'}</td>
                        <td className="px-3 py-1.5 text-right text-slate-600">{row.valid ? row.y : '—'}</td>
                        <td className="px-3 py-1.5">
                          {row.valid
                            ? <span className="text-green-600 font-medium">✓</span>
                            : <span className="text-red-600">{row.error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {rows && rows.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">No rows found in CSV.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!rows || validCount === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Import {validCount > 0 ? `${validCount} pin${validCount !== 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
