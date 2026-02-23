'use client'

import { useState } from 'react'
import { X, Pencil, CheckCircle2, AlertTriangle, CalendarClock, Clock } from 'lucide-react'
import Link from 'next/link'
import { usePMSchedule } from '@/hooks/usePMSchedule'
import CompleteModal from './CompleteModal'
import PMFrequencyBadge from './PMFrequencyBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { MOCK_ASSETS } from '@/lib/mock-data'
import { MOCK_PM_HISTORY } from '@/lib/mock-pm-schedules'
import { daysUntilDue, formatDueDate, parseInstructions, calculateNextDue } from '@/lib/pm-utils'

interface PMPanelDetailProps {
  pmId: string
  onEdit: () => void
  onClose: () => void
}

export default function PMPanelDetail({ pmId, onEdit, onClose }: PMPanelDetailProps) {
  const { pmSchedule, isLoading, error, mutate } = usePMSchedule(pmId)
  const [completing, setCompleting]  = useState(false)
  const [checkedSteps, setChecked]   = useState<Set<number>>(new Set())

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !pmSchedule) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-500">PM schedule not found</p>
      </div>
    )
  }

  const asset    = MOCK_ASSETS.find((a) => a.id === pmSchedule.asset_id)
  const steps    = parseInstructions(pmSchedule.instructions)
  const history  = MOCK_PM_HISTORY[pmId] ?? []
  const days     = daysUntilDue(pmSchedule.next_due_at)

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
    setCompleting(false)
    setChecked(new Set())
  }

  const allChecked = steps.length > 0 && checkedSteps.size === steps.length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          {pmSchedule.is_active && (
            <button
              type="button"
              onClick={() => setCompleting(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Complete PM
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <PMFrequencyBadge frequency={pmSchedule.frequency} intervalValue={pmSchedule.interval_value} />
            {pmSchedule.due_status && <DueStatusBadge status={pmSchedule.due_status} />}
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">{pmSchedule.title}</h2>
          {pmSchedule.description && (
            <p className="mt-1.5 text-sm text-slate-600">{pmSchedule.description}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {asset && (
              <div className="col-span-2">
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
                <dd className="text-sm font-medium text-slate-700">{formatDueDate(pmSchedule.last_completed_at)}</dd>
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

        {/* Instructions checklist */}
        {steps.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Checklist</h3>
              <span className="text-xs text-slate-400">
                {checkedSteps.size}/{steps.length}
              </span>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedSteps.has(i)}
                    onChange={() => toggleStep(i)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-green-600 cursor-pointer shrink-0"
                  />
                  <span className={['text-sm', checkedSteps.has(i) ? 'line-through text-slate-400' : 'text-slate-700'].join(' ')}>
                    {step}
                  </span>
                </label>
              ))}
            </div>
            {allChecked && (
              <button
                type="button"
                onClick={() => setCompleting(true)}
                className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                All steps done — Complete PM
              </button>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Recent History</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{formatDueDate(h.completed_at)}</span>
                  <span className="text-xs text-slate-400">{h.tech}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/pm/${pmSchedule.id}`}
          className="block text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Full Detail Page →
        </Link>
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
