'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { SortState } from '@/types'

interface SortOption {
  field: string
  label: string
}

interface SortDropdownProps {
  options: SortOption[]
  value: SortState
  onChange: (sort: SortState) => void
}

export default function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  const current = options.find((o) => o.field === value.field) ?? options[0]

  function handleSelect(field: string) {
    if (field === value.field) {
      onChange({ field, direction: value.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onChange({ field, direction: 'asc' })
    }
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors min-h-[40px]"
      >
        Sort: {current?.label}
        {value.direction === 'asc'
          ? <ArrowUp className="h-3.5 w-3.5 text-slate-400" />
          : <ArrowDown className="h-3.5 w-3.5 text-slate-400" />
        }
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 rounded-xl border border-slate-200 bg-white shadow-xl min-w-[160px] py-1">
          {options.map((opt) => (
            <button
              key={opt.field}
              type="button"
              onClick={() => handleSelect(opt.field)}
              className={[
                'flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition-colors',
                opt.field === value.field
                  ? 'bg-slate-50 font-semibold text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              {opt.label}
              {opt.field === value.field && (
                value.direction === 'asc'
                  ? <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
                  : <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
