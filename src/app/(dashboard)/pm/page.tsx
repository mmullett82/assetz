'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, CalendarClock, ArrowLeft } from 'lucide-react'
import { usePMSchedules } from '@/hooks/usePMSchedules'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import PMTable from '@/components/pm/PMTable'
import PMPanelDetail from '@/components/pm/PMPanelDetail'
import CompleteModal from '@/components/pm/CompleteModal'
import PMFrequencyBadge from '@/components/pm/PMFrequencyBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import CalendarView, { type CalendarItem } from '@/components/ui/CalendarView'
import EmptyState from '@/components/ui/EmptyState'
import ViewToggle from '@/components/ui/ViewToggle'
import FilterBar from '@/components/ui/FilterBar'
import SortDropdown from '@/components/ui/SortDropdown'
import DotsMenu from '@/components/ui/DotsMenu'
import { PM_FILTER_ATTRIBUTES } from '@/lib/filter-config'
import { calculateNextDue, daysUntilDue } from '@/lib/pm-utils'
import { MOCK_ASSETS } from '@/lib/mock-data'
import StatusTabBar, { type TabDef } from '@/components/ui/StatusTabBar'
import type { ListViewMode, SortState, ActiveFilter, PMSchedule } from '@/types'

const DEFAULT_SORT: SortState = { field: 'next_due_at', direction: 'asc' }

const PM_DUE_STATUS_TABS: TabDef[] = [
  { value: null,     label: 'All'          },
  { value: 'red',    label: 'Overdue',     labelClass: 'text-red-600'    },
  { value: 'yellow', label: 'Due Soon',    labelClass: 'text-amber-600'  },
  { value: 'green',  label: 'On Schedule', labelClass: 'text-green-600'  },
]

const SORT_OPTIONS = [
  { field: 'next_due_at',       label: 'Next Due'   },
  { field: 'title',             label: 'Title'      },
  { field: 'frequency',         label: 'Frequency'  },
  { field: 'last_completed_at', label: 'Last Done'  },
]

function applyFilters(pms: PMSchedule[], filters: ActiveFilter[]): PMSchedule[] {
  if (filters.length === 0) return pms
  return pms.filter((pm) =>
    filters.every((f) => {
      if (f.key === 'is_active') {
        return f.value === 'true' ? pm.is_active : !pm.is_active
      }
      const val = (pm as unknown as Record<string, unknown>)[f.key]
      return String(val) === f.value
    })
  )
}

function applySort(pms: PMSchedule[], sort: SortState): PMSchedule[] {
  return [...pms].sort((a, b) => {
    const av = String((a as unknown as Record<string, unknown>)[sort.field] ?? '')
    const bv = String((b as unknown as Record<string, unknown>)[sort.field] ?? '')
    const cmp = av.localeCompare(bv)
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

export default function PMPage() {
  const router = useRouter()
  const [viewMode, setViewMode]       = useLocalStorage<ListViewMode>('pm-view', 'panel')
  const [sortState, setSortState]     = useLocalStorage<SortState>('pm-sort', DEFAULT_SORT)
  const [activeFilters, setFilters]   = useState<ActiveFilter[]>([])
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [completing, setCompleting]   = useState<PMSchedule | null>(null)

  const { pmSchedules, isLoading, mutate } = usePMSchedules()

  const filtered = useMemo(() => applyFilters(pmSchedules, activeFilters), [pmSchedules, activeFilters])
  const sorted   = useMemo(() => applySort(filtered, sortState), [filtered, sortState])

  const calendarItems: CalendarItem[] = sorted
    .filter((pm) => pm.next_due_at)
    .map((pm) => ({
      id:        pm.id,
      title:     pm.title,
      dueDate:   pm.next_due_at!,
      isOverdue: (daysUntilDue(pm.next_due_at) ?? 0) < 0,
      href:      `/pm/${pm.id}`,
    }))

  const activeStatusTab = activeFilters.find((f) => f.key === 'due_status')?.value ?? null

  function addFilter(f: ActiveFilter) {
    setFilters((prev) => [...prev.filter((x) => x.key !== f.key), f])
  }
  function removeFilter(key: string) {
    setFilters((prev) => prev.filter((f) => f.key !== key))
  }
  function handleStatusTab(value: string | null) {
    if (value === null) {
      removeFilter('due_status')
    } else {
      const tab = PM_DUE_STATUS_TABS.find((t) => t.value === value)
      addFilter({ key: 'due_status', label: 'Due Status', value, displayValue: tab?.label ?? value })
    }
  }

  async function handleComplete(data: { completedAt: string; notes: string; actualHours: string }) {
    if (!completing) return
    const nextDue = calculateNextDue(data.completedAt, completing.frequency, completing.interval_value)
    await mutate(
      (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          data: prev.data.map((pm) =>
            pm.id !== completing.id
              ? pm
              : {
                  ...pm,
                  last_completed_at: data.completedAt,
                  next_due_at: nextDue.toISOString(),
                  due_status: 'green' as const,
                }
          ),
        }
      },
      { revalidate: false }
    )
    setCompleting(null)
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PM Schedules</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${sorted.length} schedule${sorted.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/pm/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </Link>
      </div>

      {/* Sort + view controls */}
      <div className="flex justify-end gap-2">
        <SortDropdown options={SORT_OPTIONS} value={sortState} onChange={setSortState} />
        <ViewToggle mode={viewMode} onChange={setViewMode} showCalendar={true} />
      </div>

      {/* Status tabs */}
      <StatusTabBar
        tabs={PM_DUE_STATUS_TABS}
        activeValue={activeStatusTab}
        onChange={handleStatusTab}
      />

      {/* Filter bar */}
      <FilterBar
        attributes={PM_FILTER_ATTRIBUTES}
        activeFilters={activeFilters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onClearAll={() => setFilters([])}
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
          icon={<CalendarClock className="h-12 w-12" />}
          title="No PM schedules found"
          description={activeFilters.length > 0 ? 'Try adjusting your filters.' : 'Add your first PM schedule to get started.'}
          action={
            activeFilters.length === 0 ? (
              <Link
                href="/pm/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Schedule
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
            {sorted.map((pm) => {
              const asset = MOCK_ASSETS.find((a) => a.id === pm.asset_id)
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setSelectedId(pm.id)}
                  className={[
                    'w-full text-left px-4 py-3 border-b border-slate-100 border-l-2 hover:bg-slate-50 transition-colors',
                    selectedId === pm.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-900">{pm.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{asset?.name ?? pm.asset_id}</p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        <PMFrequencyBadge frequency={pm.frequency} intervalValue={pm.interval_value} />
                        {pm.due_status && <DueStatusBadge status={pm.due_status} />}
                      </div>
                    </div>
                    <DotsMenu
                      size="sm"
                      align="left"
                      items={[
                        { label: 'Edit',        onClick: () => router.push(`/pm/${pm.id}/edit`) },
                        { label: 'View Detail', onClick: () => router.push(`/pm/${pm.id}`) },
                        { separator: true, label: 'Complete', onClick: () => setCompleting(pm) },
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
                <PMPanelDetail
                  pmId={selectedId}
                  onEdit={() => router.push(`/pm/${selectedId}/edit`)}
                  onClose={() => setSelectedId(null)}
                />
              </>
            ) : (
              <div className="text-center px-6">
                <CalendarClock className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Select a PM schedule</p>
                <p className="text-xs text-slate-300 mt-1">Choose from the list on the left.</p>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ── Table view ── */
        <PMTable
          pmSchedules={sorted}
          onComplete={setCompleting}
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

      {/* Completion modal (table view) */}
      {completing && (
        <CompleteModal
          pm={completing}
          onConfirm={handleComplete}
          onCancel={() => setCompleting(null)}
        />
      )}
    </div>
  )
}
