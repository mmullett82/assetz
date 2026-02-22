'use client'

/**
 * Visual status workflow stepper + action buttons.
 *
 * Flow:
 *   Open → In Progress → Completed
 *               ↕
 *           On Hold
 *
 * Any non-terminal state can be cancelled.
 */

import type { WorkOrderStatus } from '@/types'
import { CheckCircle, Circle, PlayCircle, PauseCircle } from 'lucide-react'

const FLOW_STEPS: WorkOrderStatus[] = ['open', 'in_progress', 'completed']

const STEP_LABELS: Record<WorkOrderStatus, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  on_hold:     'On Hold',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

interface Action {
  label: string
  nextStatus: WorkOrderStatus
  variant: 'primary' | 'secondary' | 'danger' | 'warning'
}

function getActions(status: WorkOrderStatus): Action[] {
  switch (status) {
    case 'open':
      return [
        { label: 'Start Work', nextStatus: 'in_progress', variant: 'primary' },
      ]
    case 'in_progress':
      return [
        { label: 'Mark Complete', nextStatus: 'completed',  variant: 'primary'   },
        { label: 'Put On Hold',   nextStatus: 'on_hold',    variant: 'secondary' },
        { label: 'Cancel',        nextStatus: 'cancelled',  variant: 'danger'    },
      ]
    case 'on_hold':
      return [
        { label: 'Resume',  nextStatus: 'in_progress', variant: 'primary' },
        { label: 'Cancel',  nextStatus: 'cancelled',   variant: 'danger'  },
      ]
    default:
      return []
  }
}

const VARIANT_CLASSES: Record<Action['variant'], string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  warning:   'bg-yellow-500 text-white hover:bg-yellow-600',
}

interface StatusWorkflowProps {
  status: WorkOrderStatus
  onTransition: (next: WorkOrderStatus) => Promise<void>
  isUpdating: boolean
}

export default function StatusWorkflow({ status, onTransition, isUpdating }: StatusWorkflowProps) {
  const actions = getActions(status)
  const isTerminal = status === 'completed' || status === 'cancelled'

  // Which step index is "active" in the linear flow
  const activeIdx = FLOW_STEPS.indexOf(
    status === 'on_hold' ? 'in_progress' : status
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
      <h2 className="text-sm font-semibold text-slate-700">Status</h2>

      {/* Linear stepper: Open → In Progress → Completed */}
      <div className="flex items-center gap-0">
        {FLOW_STEPS.map((step, i) => {
          const isDone    = activeIdx > i || status === 'completed'
          const isCurrent = activeIdx === i && status !== 'completed'
          const isOnHold  = status === 'on_hold' && step === 'in_progress'

          return (
            <div key={step} className="flex items-center flex-1 min-w-0">
              {/* Step circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={[
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  isDone    ? 'bg-green-500 text-white'    : '',
                  isCurrent ? (isOnHold ? 'bg-yellow-400 text-white' : 'bg-blue-600 text-white') : '',
                  !isDone && !isCurrent ? 'bg-slate-200 text-slate-400' : '',
                ].join(' ')}
                  aria-label={isOnHold ? 'On Hold' : step}
                >
                  {isDone ? (
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  ) : isCurrent && isOnHold ? (
                    <PauseCircle className="h-4 w-4" aria-hidden="true" />
                  ) : isCurrent ? (
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Circle className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>
                <span className="mt-1 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                  {isOnHold ? 'On Hold' : STEP_LABELS[step]}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < FLOW_STEPS.length - 1 && (
                <div className={[
                  'h-0.5 flex-1 mx-1',
                  i < activeIdx ? 'bg-green-400' : 'bg-slate-200',
                ].join(' ')} />
              )}
            </div>
          )
        })}
      </div>

      {/* Cancelled state */}
      {status === 'cancelled' && (
        <p className="text-sm text-slate-500 italic">This work order has been cancelled.</p>
      )}

      {/* Action buttons */}
      {!isTerminal && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {actions.map((action) => (
            <button
              key={action.nextStatus}
              type="button"
              disabled={isUpdating}
              onClick={() => onTransition(action.nextStatus)}
              className={[
                'rounded-lg px-4 py-2 text-sm font-semibold transition-colors min-h-[44px]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                VARIANT_CLASSES[action.variant],
              ].join(' ')}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
