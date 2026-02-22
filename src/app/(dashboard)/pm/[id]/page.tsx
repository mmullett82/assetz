'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Pencil, AlertTriangle, CheckCircle2,
  ClipboardList, Clock, CalendarClock, History,
} from 'lucide-react'
import { usePMSchedule } from '@/hooks/usePMSchedule'
import CompleteModal from '@/components/pm/CompleteModal'
import PMFrequencyBadge from '@/components/pm/PMFrequencyBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { MOCK_ASSETS } from '@/lib/mock-data'
import { MOCK_PM_HISTORY } from '@/lib/mock-pm-schedules'
import { daysUntilDue, formatDueDate, parseInstructions, calculateNextDue } from '@/lib/pm-utils'

interface Props {
  params: Promise<{ id: string }>
}

export default function PMDetailPage({ params }: Props) {
  const { id }                     = use(params)
  const { pmSchedule, isLoading, error, mutate } = usePMSchedule(id)
  const [completing, setCompleting] = useState(false)
  const [checkedSteps, setChecked]  = useState<Set<number>>(new Set())

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !pmSchedule) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-10 w-10 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-600">PM schedule not found</p>
        <Link href="/pm" className="mt-3 text-sm text-blue-600 hover:underline">← Back to PM Schedules</Link>
      </div>
    )
  }

  const asset    = MOCK_ASSETS.find((a) => a.id === pmSchedule.asset_id)
  const steps    = parseInstructions(pmSchedule.instructions)
  const history  = MOCK_PM_HISTORY[id] ?? []
  const days     = daysUntilDue(pmSchedule.next_due_at)
  const isActive = pmSchedule.is_active

  function toggleStep(i: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  async function handleComplete(data: { completedAt: string; notes: string; actualHours: string }) {
    const nextDue = calculateNextDue(data.completedAt, pmSchedule!.frequency, pmSchedule!.interval_value)
    await mutate(
      (prev) => prev ? {
        ...prev,
        last_completed_at: data.completedAt,
        next_due_at: nextDue.toISOString(),
        due_status: 'green' as const,
      } : prev,
      { revalidate: false }
    )
    // TODO: await apiClient.pmSchedules.complete(pmSchedule.id, data.completedAt)
    setCompleting(false)
    setChecked(new Set())
  }

  const allChecked = steps.length > 0 && checkedSteps.size === steps.length

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/pm"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          PM Schedules
        </Link>
        <div className="flex items-center gap-2">
          {isActive && (
            <button
              type="button"
              onClick={() => setCompleting(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors min-h-[44px]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete PM
            </button>
          )}
          <Link
            href={`/pm/${pmSchedule.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{pmSchedule.title}</h1>
            {pmSchedule.description && (
              <p className="mt-1.5 text-sm text-slate-600">{pmSchedule.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <PMFrequencyBadge frequency={pmSchedule.frequency} intervalValue={pmSchedule.interval_value} />
            {pmSchedule.due_status && <DueStatusBadge status={pmSchedule.due_status} />}
          </div>
        </div>

        {/* Metadata */}
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 border-t border-slate-100 pt-4">
          {asset && (
            <div>
              <dt className="text-xs text-slate-400">Asset</dt>
              <dd>
                <Link href={`/assets/${asset.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                  {asset.name}
                </Link>
              </dd>
            </div>
          )}

          <div>
            <dt className="text-xs text-slate-400 flex items-center gap-1">
              <CalendarClock className="h-3 w-3" /> Next due
            </dt>
            <dd className="text-sm font-medium text-slate-700">
              {pmSchedule.next_due_at ? (
                <>
                  {formatDueDate(pmSchedule.next_due_at)}
                  {days !== null && (
                    <span className={[
                      'ml-1.5 text-xs font-semibold',
                      days < 0 ? 'text-red-600' : days < 3 ? 'text-yellow-600' : 'text-slate-400',
                    ].join(' ')}>
                      {days < 0 ? `(${Math.abs(days)}d overdue)` : days === 0 ? '(today)' : `(${days}d)`}
                    </span>
                  )}
                </>
              ) : '—'}
            </dd>
          </div>

          {pmSchedule.last_completed_at && (
            <div>
              <dt className="text-xs text-slate-400">Last completed</dt>
              <dd className="text-sm font-medium text-slate-700">
                {formatDueDate(pmSchedule.last_completed_at)}
              </dd>
            </div>
          )}

          {pmSchedule.estimated_hours && (
            <div>
              <dt className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Est. time
              </dt>
              <dd className="text-sm font-medium text-slate-700">{pmSchedule.estimated_hours}h</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Two-column */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Instructions checklist */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              Instructions
              {steps.length > 0 && (
                <span className="text-xs font-normal text-slate-400">
                  ({checkedSteps.size}/{steps.length} done)
                </span>
              )}
            </h2>
            {steps.length > 0 && checkedSteps.size > 0 && (
              <button
                type="button"
                onClick={() => setChecked(new Set())}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {steps.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No instructions recorded.</p>
          ) : (
            <ol className="space-y-2">
              {steps.map((step, i) => {
                const checked = checkedSteps.has(i)
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => isActive && toggleStep(i)}
                      disabled={!isActive}
                      className={[
                        'flex items-start gap-3 w-full text-left rounded-lg px-3 py-2.5 transition-colors',
                        isActive ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default',
                        checked ? 'bg-green-50' : '',
                      ].join(' ')}
                    >
                      {/* Step number / check indicator */}
                      <span className={[
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold mt-0.5',
                        checked
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-500',
                      ].join(' ')}>
                        {checked ? '✓' : i + 1}
                      </span>
                      <span className={[
                        'text-sm',
                        checked ? 'line-through text-slate-400' : 'text-slate-700',
                      ].join(' ')}>
                        {step}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          )}

          {/* Complete prompt when all steps checked */}
          {allChecked && isActive && (
            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-green-700">All steps done!</p>
              <button
                type="button"
                onClick={() => setCompleting(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete PM
              </button>
            </div>
          )}
        </div>

        {/* Compliance history */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-slate-400" />
            Completion History
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No history recorded.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((entry, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-700">
                        {formatDueDate(entry.completed_at)}
                      </span>
                      <span className="text-xs text-slate-400">{entry.tech}</span>
                      <span className="text-xs text-slate-400">· {entry.actual_hours}h</span>
                    </div>
                    {entry.notes && (
                      <p className="mt-0.5 text-xs text-slate-500">{entry.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Quick link to WOs for this PM */}
          {pmSchedule.id && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href={`/work-orders?pm_schedule_id=${pmSchedule.id}`}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View linked work orders →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Complete modal */}
      {completing && (
        <CompleteModal
          pm={pmSchedule}
          onConfirm={handleComplete}
          onCancel={() => setCompleting(false)}
        />
      )}
    </div>
  )
}
