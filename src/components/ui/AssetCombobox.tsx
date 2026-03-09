'use client'

/**
 * AssetCombobox — searchable asset picker.
 * Hits /api/assets?search=... as the user types.
 * For small asset lists the full list loads on open; for large ones typing narrows it.
 *
 * Props:
 *   value        — selected asset_id (controlled)
 *   onChange     — called with the new asset_id (or '' to clear)
 *   initialLabel — display label for a pre-selected asset (e.g. in edit mode)
 *                  format: "Asset Name — FACILITY-ID"
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets'

interface AssetComboboxProps {
  value: string
  onChange: (id: string) => void
  initialLabel?: string
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
}

export default function AssetCombobox({
  value,
  onChange,
  initialLabel,
  label,
  placeholder = 'Search assets…',
  error,
  required,
}: AssetComboboxProps) {
  const [query, setQuery]               = useState('')
  const [open, setOpen]                 = useState(false)
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? '')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)

  // Only fetch when the dropdown is open
  const { assets, isLoading } = useAssets(open ? { search: query, page_size: 30 } : undefined)

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // When the dropdown opens and there's already a value, ensure it appears at top of list
  // (handled naturally since we show current selection highlighted)

  function handleSelect(id: string, name: string, facilityAssetId: string) {
    onChange(id)
    setSelectedLabel(`${name} — ${facilityAssetId}`)
    setQuery('')
    setOpen(false)
  }

  function handleClear() {
    onChange('')
    setSelectedLabel('')
    setQuery('')
    inputRef.current?.focus()
  }

  function handleOpenForEdit() {
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const inputId = label?.toLowerCase().replace(/\s+/g, '-') ?? 'asset-combobox'

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Closed state: show selected asset or search input */}
        {value && !open ? (
          /* Selected — show label with edit + clear buttons */
          <div className={[
            'flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 min-h-[44px]',
            error ? 'border-red-400' : 'border-slate-300',
          ].join(' ')}>
            <span className="text-sm text-slate-900 truncate flex-1">{selectedLabel || value}</span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={handleOpenForEdit}
                className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Change asset"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Search input */
          <div className={[
            'flex items-center rounded-lg border bg-white px-3 min-h-[44px]',
            open
              ? 'border-blue-500 ring-2 ring-blue-500'
              : error ? 'border-red-400' : 'border-slate-300',
          ].join(' ')}>
            <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" aria-hidden="true" />
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-2.5"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-64 overflow-y-auto">
            {isLoading && (
              <p className="px-3 py-2.5 text-sm text-slate-400">Searching…</p>
            )}
            {!isLoading && assets.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-slate-400">
                {query ? `No assets matching "${query}"` : 'No assets found'}
              </p>
            )}
            {!isLoading && assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSelect(a.id, a.name, a.facility_asset_id)}
                className={[
                  'w-full text-left px-3 py-2.5 transition-colors border-b border-slate-50 last:border-0',
                  a.id === value
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-slate-50',
                ].join(' ')}
              >
                <span className="block text-sm font-medium text-slate-900">{a.name}</span>
                <span className="block text-xs text-slate-500 font-mono mt-0.5">{a.facility_asset_id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
