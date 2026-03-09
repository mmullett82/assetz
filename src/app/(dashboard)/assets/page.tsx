'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, Cpu, ArrowLeft, SlidersHorizontal, Tag, Building2, X, Printer } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets'
import { useDepartments } from '@/hooks/useDepartments'
import { useTags } from '@/hooks/useTags'
import apiClient from '@/lib/api-client'
import ConfirmModal from '@/components/ui/ConfirmModal'
import PrintLabelsModal, { type LabelItem } from '@/components/ui/PrintLabelsModal'
import { showToast } from '@/hooks/useToast'
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
import StatusTabBar, { type TabDef } from '@/components/ui/StatusTabBar'
import type { ListViewMode, SortState, ActiveFilter, Asset } from '@/types'

const DEFAULT_SORT: SortState = { field: 'name', direction: 'asc' }

const ASSET_STATUS_TABS: TabDef[] = [
  { value: null,             label: 'All'           },
  { value: 'operational',    label: 'Operational'   },
  { value: 'maintenance',    label: 'Maintenance'   },
  { value: 'down',           label: 'Down'          },
  { value: 'decommissioned', label: 'Decommissioned'},
]

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
  const [viewMode, setViewMode]       = useLocalStorage<ListViewMode>('assets-view', 'table')
  const [sortState, setSortState]     = useLocalStorage<SortState>('assets-sort', DEFAULT_SORT)
  const [search, setSearch]           = useState('')
  const [activeFilters, setFilters]   = useState<ActiveFilter[]>([])
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filterDeptId, setFilterDeptId] = useState<string | null>(null)
  const [filterTagId, setFilterTagId]   = useState<string | null>(null)

  const { departments } = useDepartments()
  const { tags } = useTags()

  // Only pass query when filters are active (avoids changing SWR cache key when no filters are set)
  const assetQuery = filterDeptId || filterTagId
    ? { department_id: filterDeptId ?? undefined, tag_id: filterTagId ?? undefined }
    : undefined
  const { assets, isLoading, mutate } = useAssets(assetQuery)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)

  const hasActiveFilter = filterDeptId !== null || filterTagId !== null

  const selectedAssets = assets.filter((a) => selectedIds.has(a.id))
  const labelItems: LabelItem[] = selectedAssets.map((a) => ({
    id: a.id,
    name: a.name,
    line1: a.facility_asset_id,
    line2: a.asset_number,
    qr_value: a.asset_number,
  }))

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.assets.delete(deleteTarget.id)
      await mutate()
      showToast('success', `"${deleteTarget.name}" deleted`)
      if (selectedId === deleteTarget.id) setSelectedId(null)
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete asset')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const searched = useMemo(() => assets.filter((a) => matchesSearch(a, search)), [assets, search])
  const filtered = useMemo(() => applyFilters(searched, activeFilters), [searched, activeFilters])
  const sorted   = useMemo(() => applySort(filtered, sortState), [filtered, sortState])

  const activeStatusTab = activeFilters.find((f) => f.key === 'status')?.value ?? null

  function addFilter(f: ActiveFilter) {
    setFilters((prev) => [...prev.filter((x) => x.key !== f.key), f])
  }
  function removeFilter(key: string) {
    setFilters((prev) => prev.filter((f) => f.key !== key))
  }
  function handleStatusTab(value: string | null) {
    if (value === null) {
      removeFilter('status')
    } else {
      const tab = ASSET_STATUS_TABS.find((t) => t.value === value)
      addFilter({ key: 'status', label: 'Status', value, displayValue: tab?.label ?? value })
    }
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]',
              sidebarOpen
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilter && (
              <span className="ml-0.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white leading-none">
                {(filterDeptId ? 1 : 0) + (filterTagId ? 1 : 0)}
              </span>
            )}
          </button>
          <Link
            href="/assets/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Asset
          </Link>
        </div>
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

      {/* Status tabs */}
      <StatusTabBar
        tabs={ASSET_STATUS_TABS}
        activeValue={activeStatusTab}
        onChange={handleStatusTab}
      />

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

      {/* Bulk action bar — shown when items are selected */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="text-sm font-semibold text-blue-800">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-blue-200" />
          <button
            type="button"
            onClick={() => setPrintOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Labels
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Two-column layout: sidebar + results */}
      <div className={sidebarOpen && (departments.length > 0 || tags.length > 0) ? 'flex gap-4 items-start' : ''}>

      {/* Filter sidebar */}
      {sidebarOpen && (departments.length > 0 || tags.length > 0) && (
        <aside className="hidden lg:block w-48 shrink-0 rounded-xl border border-slate-200 bg-white p-3 space-y-4 sticky top-6">
          {departments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</span>
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setFilterDeptId(null)}
                  className={[
                    'w-full text-left rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                    filterDeptId === null ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  All departments
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setFilterDeptId(dept.id === filterDeptId ? null : dept.id)}
                    className={[
                      'w-full text-left rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                      filterDeptId === dept.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Label</span>
                </div>
                {filterTagId && (
                  <button type="button" onClick={() => setFilterTagId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setFilterTagId(tag.id === filterTagId ? null : tag.id)}
                    className={[
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
                      filterTagId === tag.id ? 'text-white border-transparent' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white',
                    ].join(' ')}
                    style={filterTagId === tag.id ? { backgroundColor: tag.color ?? '#64748b' } : {}}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: filterTagId === tag.id ? 'rgba(255,255,255,0.7)' : (tag.color ?? '#64748b') }}
                    />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Results */}
      <div className="flex-1 min-w-0">
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
                      { separator: true, label: 'Create Work Order', onClick: () => router.push(`/work-orders/new?asset_id=${asset.id}`) },
                      { label: 'Create PM',        onClick: () => router.push(`/pm/new?asset_id=${asset.id}`) },
                      { label: 'Show Parts',       onClick: () => router.push(`/parts?asset_id=${asset.id}`) },
                      { separator: true, label: 'Duplicate', onClick: () => router.push(`/assets/new?duplicate=${asset.id}`) },
                      { label: 'Delete',           onClick: () => setDeleteTarget({ id: asset.id, name: asset.name }), destructive: true },
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
                  onCreateWO={() => router.push(`/work-orders/new?asset_id=${selectedId}`)}
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

      </div> {/* end flex-1 results */}
      </div> {/* end two-column layout */}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Asset"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <PrintLabelsModal
        open={printOpen}
        items={labelItems}
        title={`Print Asset Labels (${selectedIds.size})`}
        onClose={() => setPrintOpen(false)}
      />
    </div>
  )
}
