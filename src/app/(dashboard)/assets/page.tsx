'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, LayoutList, Table2, Cpu } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets'
import AssetTable from '@/components/assets/AssetTable'
import AssetCard from '@/components/assets/AssetCard'
import EmptyState from '@/components/ui/EmptyState'
import type { AssetStatus } from '@/types'
import { MOCK_DEPARTMENTS } from '@/lib/mock-data'

type ViewMode = 'table' | 'cards'

const STATUS_FILTERS: { value: AssetStatus | ''; label: string }[] = [
  { value: '',               label: 'All'           },
  { value: 'operational',    label: 'Operational'   },
  { value: 'maintenance',    label: 'Maintenance'   },
  { value: 'down',           label: 'Down'          },
  { value: 'decommissioned', label: 'Decommissioned'},
]

export default function AssetsPage() {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState<AssetStatus | ''>('')
  const [deptFilter, setDept]         = useState('')
  const [viewMode, setViewMode]       = useState<ViewMode>('table')

  const { assets, total, isLoading } = useAssets({
    search:        search || undefined,
    status:        statusFilter || undefined,
    department_id: deptFilter || undefined,
  })

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${total} asset${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/assets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Asset
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name, ID, or barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
        </div>

        {/* Department filter */}
        <select
          value={deptFilter}
          onChange={(e) => setDept(e.target.value)}
          aria-label="Filter by department"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        >
          <option value="">All Departments</option>
          {MOCK_DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* View mode toggle — desktop only */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-label="Table view"
            className={[
              'flex items-center justify-center rounded-md p-2 transition-colors',
              viewMode === 'table'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:text-slate-700',
            ].join(' ')}
          >
            <Table2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            aria-label="Card view"
            className={[
              'flex items-center justify-center rounded-md p-2 transition-colors',
              viewMode === 'cards'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:text-slate-700',
            ].join(' ')}
          >
            <LayoutList className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value as AssetStatus | '')}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors min-h-[32px]',
              statusFilter === f.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<Cpu className="h-12 w-12" />}
          title="No assets found"
          description={
            search || statusFilter || deptFilter
              ? 'Try adjusting your filters.'
              : 'Add your first asset to get started.'
          }
          action={
            !search && !statusFilter && !deptFilter ? (
              <Link
                href="/assets/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Asset
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className={viewMode === 'table' ? 'hidden sm:block' : 'hidden'}>
            <AssetTable assets={assets} />
          </div>

          {/* Mobile cards (always shown on small screens; shown on desktop when cards mode active) */}
          <div className={viewMode === 'cards' ? 'block' : 'block sm:hidden'}>
            <div className="space-y-3">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
