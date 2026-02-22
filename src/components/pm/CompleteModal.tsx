'use client'

import { useState } from 'react'
import { X, CheckCircle2, CalendarClock } from 'lucide-react'
import type { PMSchedule } from '@/types'
import Button from '@/components/ui/Button'
import { calculateNextDue, formatDueDate } from '@/lib/pm-utils'
import { MOCK_ASSETS } from '@/lib/mock-data'

interface CompleteModalProps {
  pm: PMSchedule
  onConfirm: (data: { completedAt: string; notes: string; actualHours: string }) => Promise<void>
  onCancel: () => void
}

export default function CompleteModal({ pm, onConfirm, onCancel }: CompleteModalProps) {
  const asset = MOCK_ASSETS.find((a) => a.id === pm.asset_id)

  // Default completed-at to now (local datetime for the input)
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  const [completedAt, setCompletedAt] = useState(nowLocal)
  const [notes,       setNotes]       = useState('')
  const [actualHours, setActualHours] = useState(pm.estimated_hours?.toString() ?? '')
  const [isSaving,    setSaving]      = useState(false)

  // Compute next due date preview
  const nextDue = completedAt
    ? calculateNextDue(
        new Date(completedAt).toISOString(),
        pm.frequency,
        pm.interval_value
      )
    : null

  async function handleConfirm() {
    setSaving(true)
    try {
      await onConfirm({
        completedAt: new Date(completedAt).toISOString(),
        notes,
        actualHours,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" aria-hidden="true" />
              <h2 className="text-base font-bold text-slate-900">Complete PM</h2>
            </div>
            <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">{pm.title}</p>
            {asset && (
              <p className="text-xs text-slate-400">{asset.name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Completed at */}
          <div>
            <label htmlFor="completed-at" className="block text-sm font-medium text-slate-700 mb-1.5">
              Completed at
            </label>
            <input
              id="completed-at"
              type="datetime-local"
              value={completedAt}
              onChange={(e) => setCompletedAt(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
            />
          </div>

          {/* Actual hours */}
          <div>
            <label htmlFor="actual-hours" className="block text-sm font-medium text-slate-700 mb-1.5">
              Actual hours
              {pm.estimated_hours && (
                <span className="ml-1 font-normal text-slate-400">(estimated: {pm.estimated_hours}h)</span>
              )}
            </label>
            <input
              id="actual-hours"
              type="number"
              min="0"
              step="0.25"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              placeholder="0.0"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="pm-notes" className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="pm-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any observations, parts replaced, anomalies found…"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Next due preview */}
          {nextDue && pm.frequency !== 'meter_based' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm">
              <CalendarClock className="h-4 w-4 text-green-600 shrink-0" aria-hidden="true" />
              <span className="text-green-700">
                Next due: <strong>{formatDueDate(nextDue.toISOString())}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-slate-100">
          <Button
            onClick={handleConfirm}
            loading={isSaving}
            disabled={!completedAt}
            className="flex-1 bg-green-600 hover:bg-green-700 focus-visible:ring-green-500"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Mark Complete
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
