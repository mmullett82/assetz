'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, LayoutList, Table2, Cpu, ChevronDown, ChevronRight } from 'lucide-react'
import { useAssets } from '@/hooks/useAssets'
import AssetTable from '@/components/assets/AssetTable'
import AssetCard from '@/components/assets/AssetCard'
import EmptyState from '@/components/ui/EmptyState'
import type { AssetStatus } from '@/types'
import { MOCK_DEPARTMENTS, MOCK_ASSETS } from '@/lib/mock-data'

type ViewMode = 'table' | 'cards'
type TreeMode = 'location' | 'category'

const STATUS_FILTERS: { value: AssetStatus | ''; label: string }[] = [
  { value: '',               label: 'All'           },
  { value: 'operational',    label: 'Operational'   },
  { value: 'maintenance',    label: 'Maintenance'   },
  { value: 'down',           label: 'Down'          },
  { value: 'decommissioned', label: 'Decommissioned'},
]

// Location tree nodes (static — Langley Plant, B1 building, departments)
const BUILDING_NODES = [
  {
    id: 'B1',
    label: 'Main Building (B1)',
    departments: MOCK_DEPARTMENTS,
  },
]

// Category nodes derived from unique system_type values
const CATEGORY_NODES = (() => {
  const counts: Record<string, number> = {}
  const labels: Record<string, string> = {
    EDGE:  'Edge Banding',
    CNC:   'CNC Machinery',
    JOIN:  'Joinery',
    AIR:   'Air / Utilities',
    SPRAY: 'Finishing / Spray',
  }
  MOCK_ASSETS.forEach((a) => {
    counts[a.system_type] = (counts[a.system_type] ?? 0) + 1
  })
  return Object.entries(counts).map(([key, count]) => ({
    key,
    label: labels[key] ?? key,
    count,
  }))
})()

export default function AssetsPage() {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatus]     = useState<AssetStatus | ''>('')
  const [deptFilter, setDept]         = useState('')
  const [viewMode, setViewMode]       = useState<ViewMode>('table')
  const [treeMode, setTreeMode]       = useState<TreeMode>('location')
  const [treeNode, setTreeNode]       = useState<string | null>(null)
  const [buildingExpanded, setBuildingExpanded] = useState(true)

  // Derive effective department filter from tree selection
  const effectiveDeptFilter =
    treeMode === 'location' && treeNode ? treeNode : deptFilter

  const { assets, total, isLoading } = useAssets({
    search:        search || undefined,
    status:        statusFilter || undefined,
    department_id: effectiveDeptFilter || undefined,
  })

  // For category tree filtering (client-side since hooks return mock data)
  const filteredAssets = treeMode === 'category' && treeNode
    ? assets.filter((a) => a.system_type === treeNode)
    : assets

  // Count assets per department for tree
  function deptCount(deptId: string) {
    return MOCK_ASSETS.filter((a) => a.department_id === deptId).length
  }

  function handleTreeNode(mode: TreeMode, key: string | null) {
    setTreeMode(mode)
    setTreeNode(key === treeNode && mode === treeMode ? null : key)
    setDept('')  // clear dropdown filter when tree is active
  }

  return (
    <div className="flex gap-4">

      {/* Location/Category tree sidebar — desktop only */}
      <aside className="hidden lg:block w-52 shrink-0 space-y-2">
        {/* Tree mode toggle */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
          {(['location', 'category'] as TreeMode[]).map((mode, i, arr) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setTreeMode(mode); setTreeNode(null) }}
              className={[
                'flex-1 py-1.5 text-xs font-semibold capitalize transition-colors',
                i < arr.length - 1 ? 'border-r border-slate-200' : '',
                treeMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50',
              ].join(' ')}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Location tree */}
        {treeMode === 'location' && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* Facility root */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Langley Plant</span>
            </div>

            {BUILDING_NODES.map((building) => (
              <div key={building.id}>
                {/* Building node */}
                <button
                  type="button"
                  onClick={() => setBuildingExpanded((v) => !v)}
                  className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {buildingExpanded
                    ? <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
                    : <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                  }
                  {building.label}
                </button>

                {/* Department nodes */}
                {buildingExpanded && (
                  <ul className="pl-4 pb-1">
                    {building.departments.map((dept) => {
                      const count = deptCount(dept.id)
                      const isSelected = treeMode === 'location' && treeNode === dept.id
                      return (
                        <li key={dept.id}>
                          <button
                            type="button"
                            onClick={() => handleTreeNode('location', dept.id)}
                            className={[
                              'w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors',
                              isSelected
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-100',
                            ].join(' ')}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                              {dept.name}
                            </span>
                            <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-500">
                              {count}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ))}

            {/* All assets link */}
            <div className="border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setTreeNode(null); setTreeMode('location') }}
                className={[
                  'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors rounded-none',
                  !treeNode && treeMode === 'location'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-500 hover:bg-slate-50',
                ].join(' ')}
              >
                <span>All Assets</span>
                <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-500">
                  {MOCK_ASSETS.length}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Category tree */}
        {treeMode === 'category' && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* All */}
            <button
              type="button"
              onClick={() => setTreeNode(null)}
              className={[
                'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                !treeNode ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-500 hover:bg-slate-50',
              ].join(' ')}
            >
              <span>All Categories</span>
              <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-500">
                {MOCK_ASSETS.length}
              </span>
            </button>

            <div className="border-t border-slate-100">
              {CATEGORY_NODES.map((cat) => {
                const isSelected = treeMode === 'category' && treeNode === cat.key
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleTreeNode('category', cat.key)}
                    className={[
                      'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    <span>{cat.label}</span>
                    <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-500">
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Page header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
            <p className="text-sm text-slate-500">
              {isLoading ? 'Loading…' : `${filteredAssets.length} asset${filteredAssets.length !== 1 ? 's' : ''}`}
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

          {/* Department filter — hidden on desktop when tree is visible */}
          <select
            value={deptFilter}
            onChange={(e) => { setDept(e.target.value); setTreeNode(null) }}
            aria-label="Filter by department"
            className="lg:hidden rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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

        {/* Active tree filter chip */}
        {treeNode && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filtering by:</span>
            <button
              type="button"
              onClick={() => setTreeNode(null)}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
            >
              {treeMode === 'location'
                ? MOCK_DEPARTMENTS.find((d) => d.id === treeNode)?.name
                : CATEGORY_NODES.find((c) => c.key === treeNode)?.label
              }
              <span className="text-blue-500">×</span>
            </button>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            icon={<Cpu className="h-12 w-12" />}
            title="No assets found"
            description={
              search || statusFilter || deptFilter || treeNode
                ? 'Try adjusting your filters.'
                : 'Add your first asset to get started.'
            }
            action={
              !search && !statusFilter && !deptFilter && !treeNode ? (
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
              <AssetTable assets={filteredAssets} />
            </div>

            {/* Mobile cards (always shown on small screens; shown on desktop when cards mode active) */}
            <div className={viewMode === 'cards' ? 'block' : 'block sm:hidden'}>
              <div className="space-y-3">
                {filteredAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
