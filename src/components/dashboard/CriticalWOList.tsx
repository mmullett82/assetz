import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import type { WorkOrder } from '@/types'
import WorkOrderPriorityBadge from '@/components/work-orders/WorkOrderPriorityBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { computeDueStatus, dueDateLabel } from '@/lib/due-status'
import { MOCK_ASSETS } from '@/lib/mock-data'

interface CriticalWOListProps {
  workOrders: WorkOrder[]
}

export default function CriticalWOList({ workOrders }: CriticalWOListProps) {
  // Open + in_progress, sorted by priority then due date, top 5
  const active = workOrders
    .filter((wo) => wo.status === 'open' || wo.status === 'in_progress' || wo.status === 'on_hold')
    .slice(0, 5)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-slate-400" />
          Open Work Orders
        </h2>
        <Link
          href="/work-orders"
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View all →
        </Link>
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-slate-400 italic text-center py-4">
          No open work orders.
        </p>
      ) : (
        <ul className="space-y-2">
          {active.map((wo) => {
            const asset     = MOCK_ASSETS.find((a) => a.id === wo.asset_id)
            const dueStatus = wo.due_date
              ? computeDueStatus(wo.due_date, wo.completed_at)
              : undefined

            return (
              <li key={wo.id}>
                <Link
                  href={`/work-orders/${wo.id}`}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2.5 hover:border-blue-200 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {wo.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <WorkOrderPriorityBadge priority={wo.priority} />
                      {dueStatus && <DueStatusBadge status={dueStatus} />}
                      {wo.due_date && (
                        <span className="text-xs text-slate-400">
                          {dueDateLabel(wo.due_date)}
                        </span>
                      )}
                    </div>
                    {asset && (
                      <p className="mt-0.5 text-xs text-slate-400">{asset.name}</p>
                    )}
                  </div>
                  <span className="text-slate-300 shrink-0 mt-1" aria-hidden="true">→</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
