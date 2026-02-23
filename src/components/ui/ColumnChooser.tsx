'use client'

import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'

export interface ColumnDef<T extends string> {
  key: T
  label: string
  required?: boolean
}

interface ColumnChooserProps<T extends string> {
  columns: ColumnDef<T>[]
  visibility: Record<T, boolean>
  onChange: (col: T, visible: boolean) => void
  onReset: () => void
}

export default function ColumnChooser<T extends string>({
  columns,
  visibility,
  onChange,
  onReset,
}: ColumnChooserProps<T>) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
        aria-label="Choose columns"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Columns
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Show / Hide Columns"
          className="absolute right-0 top-full mt-1 z-20 min-w-[220px] rounded-xl bg-white border border-slate-200 shadow-xl py-3"
        >
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Show / Hide Columns
          </p>

          <ul className="max-h-72 overflow-y-auto">
            {columns.map((col) => (
              <li key={col.key}>
                <label className="flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={visibility[col.key]}
                    disabled={col.required}
                    onChange={(e) => onChange(col.key, e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span className={[
                    'text-sm',
                    col.required ? 'text-slate-400' : 'text-slate-700',
                  ].join(' ')}>
                    {col.label}
                    {col.required && <span className="ml-1 text-xs text-slate-400">(always)</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="px-4 pt-2 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={() => { onReset(); setOpen(false) }}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
