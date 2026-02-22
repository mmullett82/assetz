'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, CalendarClock, LayoutList, Table2 } from 'lucide-react'
import { usePMSchedules } from '@/hooks/usePMSchedules'
import PMTable from '@/components/pm/PMTable'
import PMCard from '@/components/pm/PMCard'
import CompleteModal from '@/components/pm/CompleteModal'
import EmptyState from '@/components/ui/EmptyState'
import type { PMSchedule, DueStatus } from '@/types'
import { calculateNextDue } from '@/lib/pm-utils'

type ViewMode = 'table' | 'cards'
type StatusFilter = DueStatus | ''

const STATUS_FILTERS: { value: StatusFilter; label: string; color: string }[] = [
  { value: '',       label: 'All',        color: '' },
  { value: 'red',    label: 'Overdue',    color: 'text-red-600' },
  { value: 'yellow', label: 'Due Soon',   color: 'text-yellow-600' },
  { value: 'green',  label: 'On Schedule',color: 'text-green-600' },
]

export default function PMPage() {
  const [statusFilter, setStatus]   = useState<StatusFilter>('')
  const [viewMode,     setViewMode] = useState<ViewMode>('table')
  const [completing,   setCompleting] = useState<PMSchedule | null>(null)

  const { pmSchedules, total, isLoading, mutate } = usePMSchedules()

  // Apply status filter client-side (mock data is already sorted by due status)
  const filtered = statusFilter
    ? pmSchedules.filter((pm) => pm.due_status === statusFilter)
    : pmSchedules

  // Counts for filter badges
  const countByStatus = (s: StatusFilter) =>
    s ? pmSchedules.filter((pm) => pm.due_status === s).length : pmSchedules.length

  async function handleComplete(data: { completedAt: string; notes: string; actualHours: string }) {
    if (!completing) return

    const nextDue = calculateNextDue(data.completedAt, completing.frequency, completing.interval_value)

    // Optimistic update
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

    // TODO: await apiClient.pmSchedules.complete(completing.id, data.completedAt)

    setCompleting(null)
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PM Schedules</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${total} schedule${total !== 1 ? 's' : ''}`}
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
                <span className={statusFilter !== f.value ? f.color : ''}>{f.label}</span>
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
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-12 w-12" />}
          title="No PM schedules found"
          description={statusFilter ? 'No schedules in this category.' : 'Add your first PM schedule to get started.'}
          action={
            !statusFilter ? (
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
      ) : (
        <>
          {/* Desktop table */}
          <div className={viewMode === 'table' ? 'hidden sm:block' : 'hidden'}>
            <PMTable pmSchedules={filtered} onComplete={setCompleting} />
          </div>
          {/* Mobile / card view */}
          <div className={viewMode === 'cards' ? 'block' : 'block sm:hidden'}>
            <div className="space-y-3">
              {filtered.map((pm) => (
                <PMCard key={pm.id} pm={pm} onComplete={setCompleting} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Completion modal */}
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
