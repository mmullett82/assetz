'use client'

import Link from 'next/link'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import type { PMSchedule } from '@/types'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import PMFrequencyBadge from './PMFrequencyBadge'
import { daysUntilDue, formatDueDate } from '@/lib/pm-utils'
import { MOCK_ASSETS } from '@/lib/mock-data'

const STATUS_BORDER: Record<string, string> = {
  red:    'border-l-red-500',
  yellow: 'border-l-yellow-400',
  green:  'border-l-green-400',
}

interface PMCardProps {
  pm: PMSchedule
  onComplete: (pm: PMSchedule) => void
}

export default function PMCard({ pm, onComplete }: PMCardProps) {
  const asset  = MOCK_ASSETS.find((a) => a.id === pm.asset_id)
  const days   = daysUntilDue(pm.next_due_at)
  const status = pm.due_status ?? 'green'

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm',
        'border border-slate-200',
        STATUS_BORDER[status] ?? 'border-l-slate-300',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <Link
          href={`/pm/${pm.id}`}
          className="font-semibold text-slate-900 text-sm hover:text-blue-700 transition-colors leading-snug line-clamp-2"
        >
          {pm.title}
        </Link>

        {asset && (
          <p className="mt-0.5 text-xs text-slate-500">{asset.name}</p>
        )}

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <PMFrequencyBadge frequency={pm.frequency} intervalValue={pm.interval_value} />
          {pm.due_status && <DueStatusBadge status={pm.due_status} />}
        </div>

        <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
          {pm.next_due_at && (
            <span>
              Due: {formatDueDate(pm.next_due_at)}
              {days !== null && (
                <span className={[
                  'ml-1 font-medium',
                  days < 0 ? 'text-red-600' : days < 3 ? 'text-yellow-600' : 'text-slate-500',
                ].join(' ')}>
                  ({days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'today' : `${days}d`})
                </span>
              )}
            </span>
          )}
          {pm.last_completed_at && (
            <span>Last: {formatDueDate(pm.last_completed_at)}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onComplete(pm)}
          aria-label={`Complete: ${pm.title}`}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors min-h-[44px]"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Complete
        </button>
        <Link
          href={`/pm/${pm.id}`}
          className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 transition-colors min-h-[36px]"
          aria-label="View details"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
