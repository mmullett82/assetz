'use client'

import { useEffect, useRef, useState } from 'react'
import { Filter, ChevronDown, X } from 'lucide-react'
import type { FilterAttribute, ActiveFilter, SavedFilter } from '@/types'

interface FilterBarProps {
  attributes: FilterAttribute[]
  activeFilters: ActiveFilter[]
  onAddFilter: (filter: ActiveFilter) => void
  onRemoveFilter: (key: string) => void
  onClearAll: () => void
  savedFilters?: SavedFilter[]
  onApplySaved?: (filters: ActiveFilter[]) => void
  resultCount?: number
}

type Step = 'attribute' | 'value'

export default function FilterBar({
  attributes,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
  savedFilters,
  onApplySaved,
  resultCount,
}: FilterBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [savedOpen, setSavedOpen]       = useState(false)
  const [step, setStep]                 = useState<Step>('attribute')
  const [pendingAttr, setPendingAttr]   = useState<FilterAttribute | null>(null)
  const [pendingValue, setPendingValue] = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')

  const addRef   = useRef<HTMLDivElement>(null)
  const savedRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        resetAdd()
      }
      if (savedRef.current && !savedRef.current.contains(e.target as Node)) {
        setSavedOpen(false)
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') { setDropdownOpen(false); setSavedOpen(false); resetAdd() }
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  function resetAdd() {
    setStep('attribute')
    setPendingAttr(null)
    setPendingValue('')
    setDateFrom('')
    setDateTo('')
  }

  function selectAttr(attr: FilterAttribute) {
    setPendingAttr(attr)
    setPendingValue('')
    setDateFrom('')
    setDateTo('')
    setStep('value')
  }

  function applyFilter() {
    if (!pendingAttr) return
    let value = pendingValue
    let displayValue = pendingValue

    if (pendingAttr.operator === 'date_range') {
      if (!dateFrom && !dateTo) return
      value = `${dateFrom}|${dateTo}`
      displayValue = dateFrom && dateTo
        ? `${dateFrom} → ${dateTo}`
        : dateFrom || dateTo
    } else if (pendingAttr.operator === 'boolean') {
      displayValue = value === 'true' ? 'Yes' : 'No'
    } else {
      // eq — resolve display from options
      const opt = pendingAttr.options?.find((o) => o.value === value)
      if (opt) displayValue = opt.label
    }

    if (!value) return

    onAddFilter({
      key:          pendingAttr.key,
      label:        pendingAttr.label,
      value,
      displayValue,
    })
    setDropdownOpen(false)
    resetAdd()
  }

  // Only allow adding a filter for attributes not already active
  const availableAttrs = attributes.filter(
    (a) => !activeFilters.some((f) => f.key === a.key)
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter pills */}
      {activeFilters.map((f) => (
        <span
          key={f.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
        >
          <span className="text-blue-500">{f.label}:</span>
          {f.displayValue}
          <button
            type="button"
            onClick={() => onRemoveFilter(f.key)}
            className="text-blue-400 hover:text-blue-700 transition-colors"
            aria-label={`Remove ${f.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {/* Add filter */}
      <div ref={addRef} className="relative">
        <button
          type="button"
          onClick={() => { setDropdownOpen((v) => !v); setSavedOpen(false) }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Add Filter
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1 z-30 rounded-xl border border-slate-200 bg-white shadow-xl min-w-[200px]">
            {step === 'attribute' && (
              <div className="py-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Filter by…
                </p>
                {availableAttrs.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-400">All filters active</p>
                ) : (
                  availableAttrs.map((attr) => (
                    <button
                      key={attr.key}
                      type="button"
                      onClick={() => selectAttr(attr)}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {attr.label}
                    </button>
                  ))
                )}
              </div>
            )}

            {step === 'value' && pendingAttr && (
              <div className="p-3 space-y-3">
                <p className="text-xs font-semibold text-slate-500">{pendingAttr.label}</p>

                {pendingAttr.operator === 'eq' && (
                  <select
                    value={pendingValue}
                    onChange={(e) => setPendingValue(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                    autoFocus
                  >
                    <option value="">Select…</option>
                    {pendingAttr.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}

                {pendingAttr.operator === 'date_range' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">From</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">To</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {pendingAttr.operator === 'boolean' && (
                  <div className="flex gap-3">
                    {[{ v: 'true', l: 'Yes' }, { v: 'false', l: 'No' }].map(({ v, l }) => (
                      <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="bool-filter"
                          value={v}
                          checked={pendingValue === v}
                          onChange={() => setPendingValue(v)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-slate-700">{l}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep('attribute'); setPendingAttr(null) }}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={applyFilter}
                    disabled={
                      pendingAttr.operator === 'eq' ? !pendingValue :
                      pendingAttr.operator === 'date_range' ? (!dateFrom && !dateTo) :
                      !pendingValue
                    }
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved filters */}
      {savedFilters && savedFilters.length > 0 && onApplySaved && (
        <div ref={savedRef} className="relative">
          <button
            type="button"
            onClick={() => { setSavedOpen((v) => !v); setDropdownOpen(false) }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Saved Filters
            <ChevronDown className="h-3 w-3" />
          </button>

          {savedOpen && (
            <div className="absolute left-0 top-full mt-1 z-30 rounded-xl border border-slate-200 bg-white shadow-xl min-w-[180px] py-1">
              {savedFilters.map((sf) => (
                <button
                  key={sf.id}
                  type="button"
                  onClick={() => { onApplySaved(sf.filters); setSavedOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {sf.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result count */}
      {resultCount !== undefined && (
        <span className="text-xs text-slate-400">{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
      )}

      {/* Clear all */}
      {activeFilters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
