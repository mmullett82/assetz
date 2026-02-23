'use client'

import { useState } from 'react'
import { X, CheckCircle, Clock, Package, AlertTriangle } from 'lucide-react'
import type { WorkOrder } from '@/types'

interface CompletionSummaryModalProps {
  workOrder: WorkOrder
  onConfirm: () => Promise<void>
  onCancel: () => void
}

const ROOT_CAUSE_LABELS: Record<string, string> = {
  operator_error:  'Operator Error',
  lack_of_pm:      'Lack of PM',
  end_of_life:     'End of Life',
  material_defect: 'Material Defect',
  unknown:         'Unknown',
  other:           'Other',
}

export default function CompletionSummaryModal({ workOrder: wo, onConfirm, onCancel }: CompletionSummaryModalProps) {
  const [isSubmitting, setSubmitting] = useState(false)

  const laborEntries = wo.labor_entries ?? []
  const totalHours   = laborEntries.reduce((sum, e) => sum + e.hours, 0)
  const partsCount   = (wo.parts_used ?? []).length
  const actionExcerpt = wo.action_taken
    ? wo.action_taken.slice(0, 200) + (wo.action_taken.length > 200 ? '…' : '')
    : ''

  async function handleConfirm() {
    setSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-base font-semibold text-slate-900">Mark as Complete?</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* WO identifier */}
          <div>
            <p className="font-mono text-xs text-slate-400">{wo.work_order_number}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800 leading-snug">{wo.title}</p>
          </div>

          {/* Resolution summary */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resolution Summary</p>
            <p className="text-sm text-slate-700">{actionExcerpt}</p>
            {wo.root_cause && (
              <p className="text-xs text-slate-500">
                Root cause: <strong className="text-slate-700">{ROOT_CAUSE_LABELS[wo.root_cause] ?? wo.root_cause}</strong>
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>
                <strong>{laborEntries.length}</strong> labor {laborEntries.length === 1 ? 'entry' : 'entries'},&nbsp;
                <strong>{totalHours.toFixed(1)} hrs</strong>
              </span>
            </div>
            {partsCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Package className="h-4 w-4 text-slate-400" />
                <span><strong>{partsCount}</strong> part{partsCount !== 1 ? 's' : ''} used</span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>This action cannot be undone. The work order will be locked and no further edits can be made.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-70 min-h-[40px]"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Completing…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm &amp; Complete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
