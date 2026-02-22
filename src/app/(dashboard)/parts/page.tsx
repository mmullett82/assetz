'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Package, LayoutList, Table2 } from 'lucide-react'
import { useParts } from '@/hooks/useParts'
import PartTable from '@/components/parts/PartTable'
import PartCard from '@/components/parts/PartCard'
import ReserveModal from '@/components/parts/ReserveModal'
import EmptyState from '@/components/ui/EmptyState'
import type { Part, PartStatus } from '@/types'
import { MOCK_PARTS } from '@/lib/mock-parts'

type ViewMode = 'table' | 'cards'
type StatusFilter = PartStatus | ''

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: '',             label: 'All'          },
  { value: 'in_stock',     label: 'In Stock'     },
  { value: 'low_stock',    label: 'Low Stock'    },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'on_order',     label: 'On Order'     },
]

// Derive manufacturer list from mock data
const MANUFACTURERS = [...new Set(MOCK_PARTS.map((p) => p.manufacturer).filter(Boolean))] as string[]

export default function PartsPage() {
  const [statusFilter, setStatus]       = useState<StatusFilter>('')
  const [manufacturer, setManufacturer] = useState('')
  const [search,       setSearch]       = useState('')
  const [viewMode,     setViewMode]     = useState<ViewMode>('table')
  const [reserving,    setReserving]    = useState<Part | null>(null)

  const { parts, total, isLoading, mutate } = useParts({
    search: search || undefined,
    status: statusFilter || undefined,
    manufacturer: manufacturer || undefined,
  })

  const countByStatus = (s: StatusFilter) =>
    s
      ? MOCK_PARTS.filter((p) => p.status === s).length
      : MOCK_PARTS.length

  async function handleReserve(data: { workOrderId: string; quantity: number }) {
    if (!reserving) return

    // Optimistic update
    await mutate(
      (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          data: prev.data.map((p) =>
            p.id !== reserving.id
              ? p
              : { ...p, quantity_reserved: p.quantity_reserved + data.quantity }
          ),
        }
      },
      { revalidate: false }
    )

    // TODO: await apiClient.parts.reserve(reserving.id, data.workOrderId, data.quantity)

    setReserving(null)
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parts Inventory</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${total} part${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/parts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Add Part
        </Link>
      </div>

      {/* Filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search part number, name, manufacturer…"
          className="w-full sm:max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
        />

        {/* Manufacturer filter */}
        <select
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
        >
          <option value="">All Manufacturers</option>
          {MANUFACTURERS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Status filters + view toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const count = countByStatus(f.value)
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatus(f.value)}
                className={[
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[40px]',
                  statusFilter === f.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')}
              >
                <span>{f.label}</span>
                {count > 0 && (
                  <span className={[
                    'rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none',
                    statusFilter === f.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600',
                  ].join(' ')}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* View toggle — desktop */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-label="Table view"
            className={['flex items-center justify-center rounded-md p-2 transition-colors', viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'].join(' ')}
          >
            <Table2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            aria-label="Card view"
            className={['flex items-center justify-center rounded-md p-2 transition-colors', viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'].join(' ')}
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : parts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No parts found"
          description={search || statusFilter || manufacturer ? 'Try adjusting your filters.' : 'Add your first part to get started.'}
          action={
            !search && !statusFilter && !manufacturer ? (
              <Link
                href="/parts/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Part
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className={viewMode === 'table' ? 'hidden sm:block' : 'hidden'}>
            <PartTable parts={parts} onReserve={setReserving} />
          </div>
          {/* Mobile / card view */}
          <div className={viewMode === 'cards' ? 'block' : 'block sm:hidden'}>
            <div className="space-y-3">
              {parts.map((part) => (
                <PartCard key={part.id} part={part} onReserve={setReserving} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Reserve modal */}
      {reserving && (
        <ReserveModal
          part={reserving}
          onConfirm={handleReserve}
          onCancel={() => setReserving(null)}
        />
      )}
    </div>
  )
}
