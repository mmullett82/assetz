'use client'

import Link from 'next/link'
import { ChevronRight, Clock, User } from 'lucide-react'
import type { WorkOrder } from '@/types'
import WorkOrderStatusBadge from './WorkOrderStatusBadge'
import WorkOrderPriorityBadge from './WorkOrderPriorityBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { computeDueStatus, dueDateLabel, formatDate } from '@/lib/due-status'
import { MOCK_ASSETS } from '@/lib/mock-data'

const PRIORITY_BORDER: Record<WorkOrder['priority'], string> = {
  low:      'border-l-slate-300',
  medium:   'border-l-blue-400',
  high:     'border-l-orange-400',
  critical: 'border-l-red-600',
}

export default function WorkOrderCard({ wo }: { wo: WorkOrder }) {
  const asset      = MOCK_ASSETS.find((a) => a.id === wo.asset_id)
  const dueStatus  = wo.due_date
    ? computeDueStatus(wo.due_date, wo.completed_at)
    : undefined
  const isActive = wo.status !== 'completed' && wo.status !== 'cancelled'

  return (
    <Link
      href={`/work-orders/${wo.id}`}
      className={[
        'flex items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm',
        'border border-slate-200 hover:border-blue-200 hover:shadow transition-all',
        'active:scale-[0.99]',
        PRIORITY_BORDER[wo.priority],
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm leading-snug">
            {wo.title}
          </span>
        </div>

        {/* WO number + asset */}
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-slate-400">{wo.work_order_number}</span>
          {asset && (
            <span className="text-xs text-slate-500">· {asset.name}</span>
          )}
        </div>

        {/* Badges row */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <WorkOrderStatusBadge status={wo.status} />
          <WorkOrderPriorityBadge priority={wo.priority} />
          {wo.due_date && dueStatus && isActive && (
            <DueStatusBadge status={dueStatus} />
          )}
        </div>

        {/* Due date + assignee */}
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
          {wo.due_date && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {isActive ? dueDateLabel(wo.due_date) : formatDate(wo.due_date)}
            </span>
          )}
          {wo.assigned_to_id && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" aria-hidden="true" />
              Assigned
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 mt-1" aria-hidden="true" />
    </Link>
  )
}
