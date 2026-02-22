'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import type { PMSchedule } from '@/types'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import PMFrequencyBadge from './PMFrequencyBadge'
import { daysUntilDue, formatDueDate } from '@/lib/pm-utils'
import { MOCK_ASSETS } from '@/lib/mock-data'

interface PMTableProps {
  pmSchedules: PMSchedule[]
  onComplete: (pm: PMSchedule) => void
}

export default function PMTable({ pmSchedules, onComplete }: PMTableProps) {
  if (pmSchedules.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="bg-slate-50">
            {['Schedule', 'Asset', 'Frequency', 'Next Due', 'Last Done', 'Status', ''].map((h) => (
              <th
                key={h}
                scope="col"
                className={[
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  h === 'Asset'    ? 'hidden md:table-cell' : '',
                  h === 'Last Done'? 'hidden lg:table-cell' : '',
                ].join(' ')}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pmSchedules.map((pm) => {
            const asset = MOCK_ASSETS.find((a) => a.id === pm.asset_id)
            const days  = daysUntilDue(pm.next_due_at)

            return (
              <tr key={pm.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <Link
                    href={`/pm/${pm.id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {pm.title}
                  </Link>
                  {pm.estimated_hours && (
                    <p className="text-xs text-slate-400 mt-0.5">~{pm.estimated_hours}h</p>
                  )}
                </td>

                <td className="hidden md:table-cell px-4 py-3 text-slate-600 whitespace-nowrap">
                  {asset?.name ?? '—'}
                </td>

                <td className="px-4 py-3">
                  <PMFrequencyBadge frequency={pm.frequency} intervalValue={pm.interval_value} />
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {pm.next_due_at ? (
                    <div>
                      <p className="text-xs text-slate-700 font-medium">
                        {formatDueDate(pm.next_due_at)}
                      </p>
                      {days !== null && (
                        <p className={[
                          'text-xs',
                          days < 0 ? 'text-red-600 font-semibold'
                          : days < 3 ? 'text-yellow-600 font-medium'
                          : 'text-slate-400',
                        ].join(' ')}>
                          {days < 0
                            ? `${Math.abs(days)}d overdue`
                            : days === 0 ? 'Due today'
                            : `${days}d`}
                        </p>
                      )}
                    </div>
                  ) : '—'}
                </td>

                <td className="hidden lg:table-cell px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {pm.last_completed_at ? formatDueDate(pm.last_completed_at) : 'Never'}
                </td>

                <td className="px-4 py-3">
                  {pm.due_status && <DueStatusBadge status={pm.due_status} />}
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onComplete(pm)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors whitespace-nowrap min-h-[36px]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Complete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
