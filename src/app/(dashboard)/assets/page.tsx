'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, Cpu, ArrowLeft } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import AssetTable from '@/components/assets/AssetTable'
import AssetPanelDetail from '@/components/assets/AssetPanelDetail'
import AssetStatusBadge from '@/components/ui/AssetStatusBadge'
import DependencyBadge from '@/components/assets/DependencyBadge'
import EmptyState from '@/components/ui/EmptyState'
import ViewToggle from '@/components/ui/ViewToggle'
import FilterBar from '@/components/ui/FilterBar'
import SortDropdown from '@/components/ui/SortDropdown'
import DotsMenu from '@/components/ui/DotsMenu'
import { ASSET_FILTER_ATTRIBUTES, ASSET_SAVED_FILTERS } from '@/lib/filter-config'
import type { ListViewMode, SortState, ActiveFilter, Asset } from '@/types'

const DEFAULT_SORT: SortState = { field: 'name', direction: 'asc' }

const SORT_OPTIONS = [
  { field: 'name',       label: 'Name'         },
  { field: 'status',     label: 'Status'        },
  { field: 'department_code', label: 'Department' },
  { field: 'updated_at', label: 'Last Updated'  },
]

function matchesSearch(asset: Asset, search: string): boolean {
  if (!search) return true
  const q = search.toLowerCase()
  return (
    asset.name.toLowerCase().includes(q) ||
    asset.facility_asset_id.toLowerCase().includes(q) ||
    asset.asset_number.toLowerCase().includes(q) ||
    (asset.manufacturer?.toLowerCase().includes(q) ?? false) ||
    (asset.model?.toLowerCase().includes(q) ?? false)
  )
}

function applyFilters(assets: Asset[], filters: ActiveFilter[]): Asset[] {
  if (filters.length === 0) return assets
  return assets.filter((asset) =>
    filters.every((f) => {
      const val = (asset as unknown as Record<string, unknown>)[f.key]
      return String(val) === f.value
    })
  )
}

function applySort(assets: Asset[], sort: SortState): Asset[] {
  return [...assets].sort((a, b) => {
    const av = String((a as unknown as Record<string, unknown>)[sort.field] ?? '')
    const bv = String((b as unknown as Record<string, unknown>)[sort.field] ?? '')
    const cmp = av.localeCompare(bv)
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

export default function AssetsPage() {
  const router = useRouter()
  const [viewMode, setViewMode]       = useLocalStorage<ListViewMode>('assets-view', 'panel')
  const [sortState, setSortState]     = useLocalStorage<SortState>('assets-sort', DEFAULT_SORT)
  const [search, setSearch]           = useState('')
  const [activeFilters, setFilters]   = useState<ActiveFilter[]>([])
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { assets, isLoading } = useAssets()

  const searched = useMemo(() => assets.filter((a) => matchesSearch(a, search)), [assets, search])
  const filtered = useMemo(() => applyFilters(searched, activeFilters), [searched, activeFilters])
  const sorted   = useMemo(() => applySort(filtered, sortState), [filtered, sortState])

  function addFilter(f: ActiveFilter) {
    setFilters((prev) => [...prev.filter((x) => x.key !== f.key), f])
  }
  function removeFilter(key: string) {
    setFilters((prev) => prev.filter((f) => f.key !== key))
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${sorted.length} asset${sorted.length !== 1 ? 's' : ''}`}
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

      {/* Search + controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <div className="flex items-center gap-2">
          <SortDropdown options={SORT_OPTIONS} value={sortState} onChange={setSortState} />
          <ViewToggle mode={viewMode} onChange={setViewMode} showCalendar={false} />
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        attributes={ASSET_FILTER_ATTRIBUTES}
        activeFilters={activeFilters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onClearAll={() => setFilters([])}
        savedFilters={ASSET_SAVED_FILTERS}
        onApplySaved={setFilters}
      />

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Cpu className="h-12 w-12" />}
          title="No assets found"
          description={search || activeFilters.length > 0 ? 'Try adjusting your filters.' : 'Add your first asset to get started.'}
          action={
            !search && activeFilters.length === 0 ? (
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
      ) : viewMode === 'panel' ? (
        /* ── Panel view ── */
        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white h-[calc(100vh-18rem)] min-h-[400px]">
          {/* Left pane */}
          <div className={[
            'shrink-0 border-r border-slate-200 overflow-y-auto',
            selectedId ? 'hidden sm:flex flex-col w-80' : 'w-full sm:w-80 flex flex-col',
          ].join(' ')}>
            {sorted.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedId(asset.id)}
                className={[
                  'w-full text-left px-4 py-3 border-b border-slate-100 border-l-2 hover:bg-slate-50 transition-colors',
                  selectedId === asset.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-900">{asset.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">{asset.facility_asset_id}</p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      <AssetStatusBadge status={asset.status} />
                      <DependencyBadge code={asset.dependency_code} />
                    </div>
                  </div>
                  <DotsMenu
                    size="sm"
                    align="left"
                    items={[
                      { label: 'Edit',             onClick: () => router.push(`/assets/${asset.id}/edit`) },
                      { label: 'View Detail',      onClick: () => router.push(`/assets/${asset.id}`) },
                      { separator: true, label: 'Create Work Order', onClick: () => console.log('TODO') },
                      { label: 'Delete',           onClick: () => console.log('TODO'), destructive: true },
                    ]}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Right pane */}
          <div className={[
            'flex-1 overflow-y-auto',
            selectedId ? 'block' : 'hidden sm:flex items-center justify-center',
          ].join(' ')}>
            {selectedId ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="sm:hidden flex items-center gap-1.5 m-4 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <AssetPanelDetail
                  assetId={selectedId}
                  onEdit={() => router.push(`/assets/${selectedId}/edit`)}
                  onCreateWO={() => console.log('TODO: create WO for', selectedId)}
                  onClose={() => setSelectedId(null)}
                />
              </>
            ) : (
              <div className="text-center px-6">
                <Cpu className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Select an asset</p>
                <p className="text-xs text-slate-300 mt-1">Choose from the list on the left.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Table view ── */
        <AssetTable
          assets={sorted}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </div>
  )
}
