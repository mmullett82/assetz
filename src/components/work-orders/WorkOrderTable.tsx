'use client'

import Link from 'next/link'
import type { WorkOrder } from '@/types'
import WorkOrderStatusBadge from './WorkOrderStatusBadge'
import WorkOrderPriorityBadge from './WorkOrderPriorityBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { computeDueStatus, dueDateLabel, formatDate } from '@/lib/due-status'
import { MOCK_ASSETS } from '@/lib/mock-data'

export default function WorkOrderTable({ workOrders }: { workOrders: WorkOrder[] }) {
  if (workOrders.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="bg-slate-50">
            {['WO #', 'Title', 'Asset', 'Priority', 'Status', 'Due', ''].map((h) => (
              <th
                key={h}
                scope="col"
                className={[
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  h === 'Asset' ? 'hidden md:table-cell' : '',
                  h === 'Due'  ? 'hidden sm:table-cell' : '',
                ].join(' ')}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {workOrders.map((wo) => {
            const asset     = MOCK_ASSETS.find((a) => a.id === wo.asset_id)
            const isActive  = wo.status !== 'completed' && wo.status !== 'cancelled'
            const dueStatus = wo.due_date
              ? computeDueStatus(wo.due_date, wo.completed_at)
              : undefined

            return (
              <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                  {wo.work_order_number}
                </td>

                <td className="px-4 py-3 max-w-xs">
                  <Link
                    href={`/work-orders/${wo.id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {wo.title}
                  </Link>
                </td>

                <td className="hidden md:table-cell px-4 py-3 text-slate-600 whitespace-nowrap">
                  {asset?.name ?? '—'}
                </td>

                <td className="px-4 py-3">
                  <WorkOrderPriorityBadge priority={wo.priority} />
                </td>

                <td className="px-4 py-3">
                  <WorkOrderStatusBadge status={wo.status} />
                </td>

                <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap">
                  {wo.due_date ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-500">{formatDate(wo.due_date)}</span>
                      {dueStatus && isActive && (
                        <DueStatusBadge status={dueStatus} />
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/work-orders/${wo.id}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
