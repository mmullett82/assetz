'use client'

import Link from 'next/link'
import { BookmarkPlus } from 'lucide-react'
import type { Part } from '@/types'
import PartStockBadge, { availableQty } from './PartStockBadge'

interface PartTableProps {
  parts: Part[]
  onReserve: (part: Part) => void
}

export default function PartTable({ parts, onReserve }: PartTableProps) {
  if (parts.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="bg-slate-50">
            {[
              'Part Number', 'Name', 'Manufacturer',
              'On Hand', 'Reserved', 'Available',
              'Reorder Pt', 'Location', 'Vendor', 'Status', '',
            ].map((h) => (
              <th
                key={h}
                scope="col"
                className={[
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  h === 'Location' ? 'hidden md:table-cell' : '',
                  h === 'Vendor'   ? 'hidden lg:table-cell' : '',
                ].join(' ')}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {parts.map((part) => {
            const avail = availableQty(part)
            const availColor =
              avail === 0
                ? 'text-red-600 font-semibold'
                : part.reorder_point !== undefined && avail <= part.reorder_point
                ? 'text-yellow-600 font-semibold'
                : 'text-green-700 font-semibold'

            return (
              <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/parts/${part.id}`}
                    className="font-mono text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {part.part_number}
                  </Link>
                </td>

                <td className="px-4 py-3 max-w-[200px]">
                  <Link
                    href={`/parts/${part.id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {part.name}
                  </Link>
                </td>

                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {part.manufacturer ?? '—'}
                </td>

                <td className="px-4 py-3 text-center text-slate-700 font-medium">
                  {part.quantity_on_hand}
                </td>

                <td className="px-4 py-3 text-center text-slate-500">
                  {part.quantity_reserved}
                </td>

                <td className={`px-4 py-3 text-center ${availColor}`}>
                  {avail}
                </td>

                <td className="px-4 py-3 text-center text-slate-500">
                  {part.reorder_point ?? '—'}
                </td>

                <td className="hidden md:table-cell px-4 py-3 text-slate-500 whitespace-nowrap">
                  {part.location ?? '—'}
                </td>

                <td className="hidden lg:table-cell px-4 py-3 text-slate-500 whitespace-nowrap">
                  {part.vendor ?? '—'}
                </td>

                <td className="px-4 py-3">
                  <PartStockBadge status={part.status} />
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onReserve(part)}
                    disabled={avail === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors whitespace-nowrap min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    Reserve
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
