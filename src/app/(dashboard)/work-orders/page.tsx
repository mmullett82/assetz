'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Plus, ClipboardList, ArrowLeft } from 'lucide-react'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import WorkOrderTable from '@/components/work-orders/WorkOrderTable'
import WorkOrderPanelDetail from '@/components/work-orders/WorkOrderPanelDetail'
import WorkOrderStatusBadge from '@/components/work-orders/WorkOrderStatusBadge'
import WorkOrderPriorityBadge from '@/components/work-orders/WorkOrderPriorityBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import CalendarView, { type CalendarItem } from '@/components/ui/CalendarView'
import EmptyState from '@/components/ui/EmptyState'
import ViewToggle from '@/components/ui/ViewToggle'
import FilterBar from '@/components/ui/FilterBar'
import SortDropdown from '@/components/ui/SortDropdown'
import DotsMenu from '@/components/ui/DotsMenu'
import { WO_FILTER_ATTRIBUTES, WO_SAVED_FILTERS } from '@/lib/filter-config'
import { computeDueStatus } from '@/lib/due-status'
import { MOCK_ASSETS } from '@/lib/mock-data'
import type { ListViewMode, SortState, ActiveFilter, WorkOrder } from '@/types'

const DEFAULT_SORT: SortState = { field: 'due_date', direction: 'asc' }

const SORT_OPTIONS = [
  { field: 'due_date',  label: 'Due Date'   },
  { field: 'title',     label: 'Title'      },
  { field: 'priority',  label: 'Priority'   },
  { field: 'status',    label: 'Status'     },
  { field: 'updated_at',label: 'Updated'    },
]

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

function matchesSearch(wo: WorkOrder, search: string): boolean {
  if (!search) return true
  const q = search.toLowerCase()
  return (
    wo.title.toLowerCase().includes(q) ||
    wo.work_order_number.toLowerCase().includes(q) ||
    (wo.description?.toLowerCase().includes(q) ?? false)
  )
}

function applyFilters(wos: WorkOrder[], filters: ActiveFilter[]): WorkOrder[] {
  if (filters.length === 0) return wos
  return wos.filter((wo) =>
    filters.every((f) => {
      if (f.key === 'overdue') {
        const isOverdue = wo.due_date
          ? computeDueStatus(wo.due_date, wo.completed_at) === 'red'
          : false
        return f.value === 'true' ? isOverdue : !isOverdue
      }
      if (f.key === 'due_date') {
        if (!wo.due_date) return false
        const [from, to] = f.value.split('|')
        const woDate = wo.due_date.slice(0, 10)
        if (from && woDate < from) return false
        if (to   && woDate > to)   return false
        return true
      }
      const val = (wo as unknown as Record<string, unknown>)[f.key]
      return String(val) === f.value
    })
  )
}

function applySort(wos: WorkOrder[], sort: SortState): WorkOrder[] {
  return [...wos].sort((a, b) => {
    if (sort.field === 'priority') {
      const pa = PRIORITY_ORDER[a.priority] ?? 99
      const pb = PRIORITY_ORDER[b.priority] ?? 99
      return sort.direction === 'asc' ? pa - pb : pb - pa
    }
    const av = String((a as unknown as Record<string, unknown>)[sort.field] ?? '')
    const bv = String((b as unknown as Record<string, unknown>)[sort.field] ?? '')
    const cmp = av.localeCompare(bv)
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assetIdFilter = searchParams.get('asset_id')
  const assetName = assetIdFilter ? (MOCK_ASSETS.find((a) => a.id === assetIdFilter)?.name ?? assetIdFilter) : null

  const [viewMode, setViewMode]       = useLocalStorage<ListViewMode>('work-orders-view', 'panel')
  const [sortState, setSortState]     = useLocalStorage<SortState>('work-orders-sort', DEFAULT_SORT)
  const [search, setSearch]           = useState('')
  const [activeFilters, setFilters]   = useState<ActiveFilter[]>([])
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { workOrders, isLoading } = useWorkOrders()

  const assetFiltered = useMemo(() =>
    assetIdFilter
      ? workOrders.filter((wo) => wo.asset_id === assetIdFilter)
      : workOrders,
    [workOrders, assetIdFilter]
  )
  const searched = useMemo(() => assetFiltered.filter((w) => matchesSearch(w, search)), [assetFiltered, search])
  const filtered = useMemo(() => applyFilters(searched, activeFilters), [searched, activeFilters])
  const sorted   = useMemo(() => applySort(filtered, sortState), [filtered, sortState])

  const calendarItems: CalendarItem[] = sorted
    .filter((wo) => wo.due_date)
    .map((wo) => ({
      id:        wo.id,
      title:     wo.title,
      dueDate:   wo.due_date!,
      isOverdue: computeDueStatus(wo.due_date!, wo.completed_at) === 'red',
      href:      `/work-orders/${wo.id}`,
    }))

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
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${sorted.length} work order${sorted.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/work-orders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New WO
        </Link>
      </div>

      {/* Asset filter banner */}
      {assetIdFilter && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <span className="text-blue-700">Filtered by asset: <strong>{assetName}</strong></span>
          <Link href="/work-orders" className="ml-auto text-blue-500 hover:text-blue-700 font-medium">Clear ×</Link>
        </div>
      )}

      {/* Search + controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by title, WO number, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortDropdown options={SORT_OPTIONS} value={sortState} onChange={setSortState} />
          <ViewToggle mode={viewMode} onChange={setViewMode} showCalendar={true} />
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        attributes={WO_FILTER_ATTRIBUTES}
        activeFilters={activeFilters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onClearAll={() => setFilters([])}
        savedFilters={WO_SAVED_FILTERS}
        onApplySaved={setFilters}
      />

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="No work orders found"
          description={search || activeFilters.length > 0 ? 'Try adjusting your filters.' : 'Create your first work order.'}
          action={
            !search && activeFilters.length === 0 ? (
              <Link
                href="/work-orders/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New WO
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
            {sorted.map((wo) => {
              const asset     = MOCK_ASSETS.find((a) => a.id === wo.asset_id)
              const isActive  = wo.status !== 'completed' && wo.status !== 'cancelled'
              const dueStatus = wo.due_date ? computeDueStatus(wo.due_date, wo.completed_at) : undefined
              return (
                <button
                  key={wo.id}
                  type="button"
                  onClick={() => setSelectedId(wo.id)}
                  className={[
                    'w-full text-left px-4 py-3 border-b border-slate-100 border-l-2 hover:bg-slate-50 transition-colors',
                    selectedId === wo.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-900">{wo.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{asset?.name ?? wo.work_order_number}</p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        <WorkOrderPriorityBadge priority={wo.priority} />
                        <WorkOrderStatusBadge status={wo.status} />
                        {dueStatus && isActive && <DueStatusBadge status={dueStatus} />}
                      </div>
                    </div>
                    <DotsMenu
                      size="sm"
                      align="left"
                      items={[
                        { label: 'Edit',        onClick: () => router.push(`/work-orders/${wo.id}/edit`) },
                        { label: 'View Detail', onClick: () => router.push(`/work-orders/${wo.id}`) },
                        { separator: true, label: 'Show Asset', onClick: () => router.push(`/assets/${wo.asset_id}`) },
                        { label: 'Delete',      onClick: () => console.log('TODO'), destructive: true },
                      ]}
                    />
                  </div>
                </button>
              )
            })}
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
                <WorkOrderPanelDetail
                  workOrderId={selectedId}
                  onEdit={() => router.push(`/work-orders/${selectedId}/edit`)}
                  onClose={() => setSelectedId(null)}
                />
              </>
            ) : (
              <div className="text-center px-6">
                <ClipboardList className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Select a work order</p>
                <p className="text-xs text-slate-300 mt-1">Choose from the list on the left.</p>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ── Table view ── */
        <WorkOrderTable
          workOrders={sorted}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      ) : (
        /* ── Calendar view ── */
        <CalendarView
          items={calendarItems}
          onItemClick={setSelectedId}
        />
      )}
    </div>
  )
}
