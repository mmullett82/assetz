'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Edit, Eye, Cpu, Copy, Trash2, Zap } from 'lucide-react'
import type { PMSchedule } from '@/types'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import PMFrequencyBadge from './PMFrequencyBadge'
import { daysUntilDue, formatDueDate } from '@/lib/pm-utils'
import { MOCK_ASSETS } from '@/lib/mock-data'
import DotsMenu from '@/components/ui/DotsMenu'
import ColumnChooser, { type ColumnDef } from '@/components/ui/ColumnChooser'
import { useColumnVisibility } from '@/hooks/useColumnVisibility'

type PMCol = 'title' | 'asset' | 'frequency' | 'next_due' | 'last_done' | 'status'

const COLUMN_DEFS: ColumnDef<PMCol>[] = [
  { key: 'title',     label: 'Schedule',   required: true },
  { key: 'asset',     label: 'Asset',      required: true },
  { key: 'frequency', label: 'Frequency',  required: true },
  { key: 'next_due',  label: 'Next Due',   required: true },
  { key: 'status',    label: 'Status',     required: true },
  { key: 'last_done', label: 'Last Done'                  },
]

const COLUMN_DEFAULTS: Record<PMCol, boolean> = {
  title:     true,
  asset:     true,
  frequency: true,
  next_due:  true,
  status:    true,
  last_done: true,
}

interface PMTableProps {
  pmSchedules: PMSchedule[]
  onComplete: (pm: PMSchedule) => void
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
}

export default function PMTable({ pmSchedules, onComplete, selectedIds = new Set(), onSelectionChange }: PMTableProps) {
  const router = useRouter()
  const [visibility, setColumn] = useColumnVisibility('pm-columns', COLUMN_DEFAULTS)
  const headerCheckRef = useRef<HTMLInputElement>(null)

  function resetColumns() {
    COLUMN_DEFS.forEach((col) => setColumn(col.key, COLUMN_DEFAULTS[col.key]))
  }

  const allSelected  = pmSchedules.length > 0 && pmSchedules.every((p) => selectedIds.has(p.id))
  const someSelected = pmSchedules.some((p) => selectedIds.has(p.id)) && !allSelected

  if (headerCheckRef.current) {
    headerCheckRef.current.indeterminate = someSelected
  }

  function toggleAll() {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? new Set() : new Set(pmSchedules.map((p) => p.id)))
  }

  function toggleOne(id: string) {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectionChange(next)
  }

  if (pmSchedules.length === 0) return null

  return (
    <>
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
              <th scope="col" className="w-10 px-3 py-3">
                <input
                  ref={headerCheckRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                  aria-label="Select all"
                />
              </th>
              {visibility.title && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</th>
              )}
              {visibility.asset && (
                <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset</th>
              )}
              {visibility.frequency && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Frequency</th>
              )}
              {visibility.next_due && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Next Due</th>
              )}
              {visibility.last_done && (
                <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Last Done</th>
              )}
              {visibility.status && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              )}
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pmSchedules.map((pm) => {
              const asset = MOCK_ASSETS.find((a) => a.id === pm.asset_id)
              const days  = daysUntilDue(pm.next_due_at)

              return (
                <tr key={pm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(pm.id)}
                      onChange={() => toggleOne(pm.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                      aria-label={`Select ${pm.title}`}
                    />
                  </td>

                  {visibility.title && (
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
                  )}

                  {visibility.asset && (
                    <td className="hidden md:table-cell px-4 py-3 text-slate-600 whitespace-nowrap">
                      {asset?.name ?? '—'}
                    </td>
                  )}

                  {visibility.frequency && (
                    <td className="px-4 py-3">
                      <PMFrequencyBadge frequency={pm.frequency} intervalValue={pm.interval_value} />
                    </td>
                  )}

                  {visibility.next_due && (
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
                  )}

                  {visibility.last_done && (
                    <td className="hidden lg:table-cell px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {pm.last_completed_at ? formatDueDate(pm.last_completed_at) : 'Never'}
                    </td>
                  )}

                  {visibility.status && (
                    <td className="px-4 py-3">
                      {pm.due_status && <DueStatusBadge status={pm.due_status} />}
                    </td>
                  )}

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onComplete(pm)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors whitespace-nowrap min-h-[36px]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Complete
                      </button>
                      <DotsMenu
                        size="sm"
                        align="right"
                        items={[
                          {
                            label: 'Edit',
                            icon: <Edit className="h-4 w-4" />,
                            onClick: () => router.push(`/pm/${pm.id}/edit`),
                          },
                          {
                            label: 'View Detail',
                            icon: <Eye className="h-4 w-4" />,
                            onClick: () => router.push(`/pm/${pm.id}`),
                          },
                          {
                            separator: true,
                            label: 'Generate WO Now',
                            icon: <Zap className="h-4 w-4" />,
                            onClick: () => console.log('TODO: generate WO for PM', pm.id),
                          },
                          {
                            label: 'Show Asset',
                            icon: <Cpu className="h-4 w-4" />,
                            onClick: () => router.push(`/assets/${pm.asset_id}`),
                          },
                          {
                            label: 'Duplicate',
                            icon: <Copy className="h-4 w-4" />,
                            onClick: () => console.log('TODO: duplicate PM', pm.id),
                          },
                          {
                            separator: true,
                            label: 'Delete',
                            icon: <Trash2 className="h-4 w-4" />,
                            onClick: () => console.log('TODO: delete PM', pm.id),
                            destructive: true,
                          },
                        ]}
                      />
                    </div>
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
