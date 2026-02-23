'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookmarkPlus, Edit, Eye, Cpu, BookMarked, Trash2 } from 'lucide-react'
import type { Part } from '@/types'
import PartStockBadge, { availableQty } from './PartStockBadge'
import ContextMenu, { type ContextMenuItem } from '@/components/ui/ContextMenu'
import ColumnChooser, { type ColumnDef } from '@/components/ui/ColumnChooser'
import { useColumnVisibility } from '@/hooks/useColumnVisibility'

type PartCol = 'part_number' | 'name' | 'manufacturer' | 'on_hand' | 'reserved' | 'available' | 'reorder_pt' | 'location' | 'vendor' | 'status'

const COLUMN_DEFS: ColumnDef<PartCol>[] = [
  { key: 'part_number',  label: 'Part Number',  required: true },
  { key: 'name',         label: 'Name',         required: true },
  { key: 'on_hand',      label: 'On Hand',      required: true },
  { key: 'status',       label: 'Status',       required: true },
  { key: 'manufacturer', label: 'Manufacturer'                 },
  { key: 'reserved',     label: 'Reserved'                     },
  { key: 'available',    label: 'Available'                    },
  { key: 'reorder_pt',   label: 'Reorder Point'                },
  { key: 'location',     label: 'Location'                     },
  { key: 'vendor',       label: 'Vendor'                       },
]

const COLUMN_DEFAULTS: Record<PartCol, boolean> = {
  part_number:  true,
  name:         true,
  on_hand:      true,
  status:       true,
  manufacturer: true,
  reserved:     true,
  available:    true,
  reorder_pt:   true,
  location:     true,
  vendor:       true,
}

interface PartTableProps {
  parts: Part[]
  onReserve: (part: Part) => void
}

type CtxState = { items: ContextMenuItem[]; x: number; y: number } | null

export default function PartTable({ parts, onReserve }: PartTableProps) {
  const router = useRouter()
  const [ctx, setCtx] = useState<CtxState>(null)
  const [visibility, setColumn] = useColumnVisibility('parts-columns', COLUMN_DEFAULTS)

  function resetColumns() {
    COLUMN_DEFS.forEach((col) => setColumn(col.key, COLUMN_DEFAULTS[col.key]))
  }

  const openCtx = useCallback((e: React.MouseEvent, part: Part) => {
    e.preventDefault()
    const avail = availableQty(part)
    setCtx({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          onClick: () => router.push(`/parts/${part.id}/edit`),
        },
        {
          label: 'View Detail',
          icon: <Eye className="h-4 w-4" />,
          onClick: () => router.push(`/parts/${part.id}`),
        },
        {
          separator: true,
          label: 'Show Compatible Assets',
          icon: <Cpu className="h-4 w-4" />,
          onClick: () => console.log('TODO: show compatible assets for', part.id),
        },
        {
          label: 'Reserve',
          icon: <BookMarked className="h-4 w-4" />,
          onClick: () => avail > 0 ? onReserve(part) : console.log('No stock available'),
        },
        {
          separator: true,
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => console.log('TODO: delete part', part.id),
          destructive: true,
        },
      ],
    })
  }, [router, onReserve])

  if (parts.length === 0) return null

  return (
    <>
      {ctx && <ContextMenu items={ctx.items} position={{ x: ctx.x, y: ctx.y }} onClose={() => setCtx(null)} />}

      {/* Column chooser toolbar */}
      <div className="flex justify-end mb-2">
        <ColumnChooser
          columns={COLUMN_DEFS}
          visibility={visibility}
          onChange={setColumn}
          onReset={resetColumns}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="bg-slate-50">
              {visibility.part_number && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Part Number</th>
              )}
              {visibility.name && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
              )}
              {visibility.manufacturer && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Manufacturer</th>
              )}
              {visibility.on_hand && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">On Hand</th>
              )}
              {visibility.reserved && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reserved</th>
              )}
              {visibility.available && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Available</th>
              )}
              {visibility.reorder_pt && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reorder Pt</th>
              )}
              {visibility.location && (
                <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>
              )}
              {visibility.vendor && (
                <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</th>
              )}
              {visibility.status && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              )}
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
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
                <tr
                  key={part.id}
                  className="hover:bg-slate-50 transition-colors"
                  onContextMenu={(e) => openCtx(e, part)}
                >
                  {visibility.part_number && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/parts/${part.id}`}
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {part.part_number}
                      </Link>
                    </td>
                  )}

                  {visibility.name && (
                    <td className="px-4 py-3 max-w-[200px]">
                      <Link
                        href={`/parts/${part.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {part.name}
                      </Link>
                    </td>
                  )}

                  {visibility.manufacturer && (
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {part.manufacturer ?? '—'}
                    </td>
                  )}

                  {visibility.on_hand && (
                    <td className="px-4 py-3 text-center text-slate-700 font-medium">
                      {part.quantity_on_hand}
                    </td>
                  )}

                  {visibility.reserved && (
                    <td className="px-4 py-3 text-center text-slate-500">
                      {part.quantity_reserved}
                    </td>
                  )}

                  {visibility.available && (
                    <td className={`px-4 py-3 text-center ${availColor}`}>
                      {avail}
                    </td>
                  )}

                  {visibility.reorder_pt && (
                    <td className="px-4 py-3 text-center text-slate-500">
                      {part.reorder_point ?? '—'}
                    </td>
                  )}

                  {visibility.location && (
                    <td className="hidden md:table-cell px-4 py-3 text-slate-500 whitespace-nowrap">
                      {part.location ?? '—'}
                    </td>
                  )}

                  {visibility.vendor && (
                    <td className="hidden lg:table-cell px-4 py-3 text-slate-500 whitespace-nowrap">
                      {part.vendor ?? '—'}
                    </td>
                  )}

                  {visibility.status && (
                    <td className="px-4 py-3">
                      <PartStockBadge status={part.status} />
                    </td>
                  )}

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
    </>
  )
}
