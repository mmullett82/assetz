'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { TechnicianScore } from '@/lib/mock-scoreboard'
import WorkOrderStatusBadge from '@/components/work-orders/WorkOrderStatusBadge'
import WorkOrderPriorityBadge from '@/components/work-orders/WorkOrderPriorityBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TechnicianTableProps {
  scores: TechnicianScore[]
}

type SortCol =
  | 'name'
  | 'assigned_wos'
  | 'completed_wos'
  | 'pm_completion_pct'
  | 'on_time_pct'
  | 'overdue_wos'
  | 'avg_response_hours'

// ─── Color maps ────────────────────────────────────────────────────────────────

const ROW_BG: Record<'green' | 'yellow' | 'red', string> = {
  green:  'bg-green-50 hover:bg-green-100',
  yellow: 'bg-yellow-50 hover:bg-yellow-100',
  red:    'bg-red-50 hover:bg-red-100',
}

const ROW_BORDER: Record<'green' | 'yellow' | 'red', string> = {
  green:  'border-l-green-500',
  yellow: 'border-l-yellow-400',
  red:    'border-l-red-500',
}

const ROW_EXPAND_BG: Record<'green' | 'yellow' | 'red', string> = {
  green:  'bg-green-50/60',
  yellow: 'bg-yellow-50/60',
  red:    'bg-red-50/60',
}

// ─── Metric color helpers ──────────────────────────────────────────────────────

function pctColor(pct: number): string {
  if (pct >= 90) return 'text-green-700 font-semibold'
  if (pct >= 75) return 'text-yellow-600 font-semibold'
  return 'text-red-600 font-semibold'
}

// ─── Column header ─────────────────────────────────────────────────────────────

function SortableHeader({
  label,
  col,
  active,
  dir,
  onSort,
  align = 'left',
}: {
  label: string
  col: SortCol
  active: boolean
  dir: 'asc' | 'desc'
  onSort: (col: SortCol) => void
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 hover:text-slate-800 transition-colors ${active ? 'text-slate-900' : ''}`}
      >
        {label}
        {active ? (
          dir === 'desc' ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )
        ) : null}
      </button>
    </th>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TechnicianTable({ scores }: TechnicianTableProps) {
  const [sort, setSort] = useState<{ col: SortCol; dir: 'asc' | 'desc' }>({
    col: 'on_time_pct',
    dir: 'desc',
  })
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function handleSort(col: SortCol) {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { col, dir: col === 'name' ? 'asc' : 'desc' }
    )
  }

  function toggleRow(userId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const sorted = [...scores].sort((a, b) => {
    const { col, dir } = sort
    let cmp: number
    if (col === 'name') {
      cmp = a.name.localeCompare(b.name)
    } else {
      cmp = (a[col] as number) - (b[col] as number)
    }
    return dir === 'asc' ? cmp : -cmp
  })

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <SortableHeader label="Technician" col="name" active={sort.col === 'name'} dir={sort.dir} onSort={handleSort} />
            <SortableHeader label="Assigned" col="assigned_wos" active={sort.col === 'assigned_wos'} dir={sort.dir} onSort={handleSort} align="right" />
            <SortableHeader label="Completed" col="completed_wos" active={sort.col === 'completed_wos'} dir={sort.dir} onSort={handleSort} align="right" />
            <SortableHeader label="PM %" col="pm_completion_pct" active={sort.col === 'pm_completion_pct'} dir={sort.dir} onSort={handleSort} align="right" />
            <SortableHeader label="On-Time %" col="on_time_pct" active={sort.col === 'on_time_pct'} dir={sort.dir} onSort={handleSort} align="right" />
            <SortableHeader label="Overdue" col="overdue_wos" active={sort.col === 'overdue_wos'} dir={sort.dir} onSort={handleSort} align="right" />
            <SortableHeader label="Avg Response" col="avg_response_hours" active={sort.col === 'avg_response_hours'} dir={sort.dir} onSort={handleSort} align="right" />
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((tech) => {
            const isExpanded = expanded.has(tech.user_id)
            return (
              <>
                <tr
                  key={tech.user_id}
                  onClick={() => toggleRow(tech.user_id)}
                  className={[
                    ROW_BG[tech.row_status],
                    'border-l-4',
                    ROW_BORDER[tech.row_status],
                    'cursor-pointer transition-colors print:break-inside-avoid',
                  ].join(' ')}
                >
                  {/* Technician name */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{tech.name}</div>
                    <div className="text-xs text-slate-400">{tech.email}</div>
                  </td>

                  {/* Assigned */}
                  <td className="px-4 py-3 text-right text-sm text-slate-700 tabular-nums">
                    {tech.assigned_wos}
                  </td>

                  {/* Completed */}
                  <td className="px-4 py-3 text-right text-sm text-slate-700 tabular-nums">
                    {tech.completed_wos}
                  </td>

                  {/* PM % */}
                  <td className={`px-4 py-3 text-right text-sm tabular-nums ${pctColor(tech.pm_completion_pct)}`}>
                    {tech.pm_completion_pct}%
                  </td>

                  {/* On-Time % */}
                  <td className={`px-4 py-3 text-right text-sm tabular-nums ${pctColor(tech.on_time_pct)}`}>
                    {tech.on_time_pct.toFixed(1)}%
                  </td>

                  {/* Overdue */}
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {tech.overdue_wos > 0 ? (
                      <span className="font-bold text-red-600">{tech.overdue_wos}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Avg response */}
                  <td className="px-4 py-3 text-right text-sm text-slate-700 tabular-nums">
                    {tech.avg_response_hours.toFixed(1)}h
                  </td>

                  {/* Expand toggle */}
                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={(e) => { e.stopPropagation(); toggleRow(tech.user_id) }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded row */}
                {isExpanded && (
                  <tr key={`${tech.user_id}-expanded`} className={ROW_EXPAND_BG[tech.row_status]}>
                    <td colSpan={8} className="px-6 pb-4 pt-2">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Recent Work Orders
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">WO #</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Title</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Asset</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Priority</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Due Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {tech.recent_wos.map((wo) => (
                              <tr key={wo.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 font-mono text-xs text-slate-600">
                                  {wo.work_order_number}
                                </td>
                                <td className="px-3 py-2 text-slate-800">{wo.title}</td>
                                <td className="px-3 py-2 text-slate-500">{wo.asset_name}</td>
                                <td className="px-3 py-2">
                                  <WorkOrderStatusBadge status={wo.status} />
                                </td>
                                <td className="px-3 py-2">
                                  <WorkOrderPriorityBadge priority={wo.priority} />
                                </td>
                                <td className="px-3 py-2">
                                  {wo.due_status ? (
                                    <DueStatusBadge status={wo.due_status} />
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
