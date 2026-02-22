'use client'

import Link from 'next/link'
import { ChevronRight, BookmarkPlus } from 'lucide-react'
import type { Part, PartStatus } from '@/types'
import PartStockBadge, { availableQty } from './PartStockBadge'

const STATUS_BORDER: Record<PartStatus, string> = {
  in_stock:     'border-l-green-400',
  low_stock:    'border-l-yellow-400',
  out_of_stock: 'border-l-red-500',
  on_order:     'border-l-blue-400',
}

interface PartCardProps {
  part: Part
  onReserve: (part: Part) => void
}

export default function PartCard({ part, onReserve }: PartCardProps) {
  const avail = availableQty(part)

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm',
        'border border-slate-200',
        STATUS_BORDER[part.status],
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <Link
          href={`/parts/${part.id}`}
          className="font-semibold text-slate-900 text-sm hover:text-blue-700 transition-colors leading-snug"
        >
          {part.name}
        </Link>

        <p className="mt-0.5 font-mono text-xs text-slate-500">{part.part_number}</p>

        {part.manufacturer && (
          <p className="mt-0.5 text-xs text-slate-400">{part.manufacturer}</p>
        )}

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <PartStockBadge status={part.status} />
        </div>

        <div className="mt-1.5 flex items-center gap-4 text-xs flex-wrap">
          <span className="text-slate-500">
            On hand: <span className="font-medium text-slate-700">{part.quantity_on_hand}</span>
          </span>
          <span className="text-slate-500">
            Reserved: <span className="font-medium text-slate-700">{part.quantity_reserved}</span>
          </span>
          <span className="text-slate-500">
            Available:{' '}
            <span className={[
              'font-semibold',
              avail === 0 ? 'text-red-600' : 'text-green-700',
            ].join(' ')}>
              {avail}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onReserve(part)}
          disabled={avail === 0}
          aria-label={`Reserve: ${part.name}`}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Reserve
        </button>
        <Link
          href={`/parts/${part.id}`}
          className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 transition-colors min-h-[36px]"
          aria-label="View details"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
