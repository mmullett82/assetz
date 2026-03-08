'use client'

import Link from 'next/link'
import {
  CalendarClock,
  Wrench,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Timer,
} from 'lucide-react'
import type { DashboardKPIs } from '@/types'

interface WorkBreakdownProps {
  kpis: DashboardKPIs | undefined
  loading?: boolean
}

type KPIKey = keyof DashboardKPIs

interface CardDef {
  label: string
  key: KPIKey
  icon: React.ElementType
  href: string
  formatValue: (v: number) => string
  border: (v: number) => string
  textColor: (v: number) => string
}

const CARDS: CardDef[] = [
  {
    label: 'Planned (PM)',
    key: 'planned_wos',
    icon: CalendarClock,
    href: '/work-orders?origin_type=pm_generated',
    formatValue: (v) => String(v),
    border: () => 'border-l-blue-400',
    textColor: () => 'text-slate-900',
  },
  {
    label: 'Reactive',
    key: 'reactive_wos',
    icon: Wrench,
    href: '/work-orders?origin_type=manual',
    formatValue: (v) => String(v),
    border: (v) => v > 0 ? 'border-l-orange-400' : 'border-l-slate-200',
    textColor: (v) => v > 0 ? 'text-orange-600' : 'text-slate-900',
  },
  {
    label: 'Due Today',
    key: 'work_orders_due_today',
    icon: Clock,
    href: '/work-orders?due_today=true',
    formatValue: (v) => String(v),
    border: (v) => v > 0 ? 'border-l-yellow-400' : 'border-l-slate-200',
    textColor: (v) => v > 0 ? 'text-yellow-600' : 'text-slate-900',
  },
  {
    label: 'Critical Priority',
    key: 'critical_priority',
    icon: AlertOctagon,
    href: '/work-orders?priority=critical',
    formatValue: (v) => String(v),
    border: (v) => v > 0 ? 'border-l-red-600' : 'border-l-slate-200',
    textColor: (v) => v > 0 ? 'text-red-600' : 'text-slate-900',
  },
  {
    label: 'Completed This Week',
    key: 'work_orders_completed_this_week',
    icon: CheckCircle2,
    href: '/work-orders?status=completed&period=week',
    formatValue: (v) => String(v),
    border: (v) => v > 0 ? 'border-l-green-500' : 'border-l-slate-200',
    textColor: () => 'text-slate-900',
  },
  {
    label: 'MTTR',
    key: 'mean_time_to_repair',
    icon: Timer,
    href: '/reports/scoreboard',
    formatValue: (v) => v ? `${v}h` : '—',
    border: (v) => v > 8 ? 'border-l-red-500' : v > 4 ? 'border-l-yellow-400' : 'border-l-green-500',
    textColor: (v) => v > 8 ? 'text-red-600' : v > 4 ? 'text-yellow-600' : 'text-slate-900',
  },
]

export default function WorkOverviewSection({ kpis, loading }: WorkBreakdownProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Work Breakdown</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CARDS.map((card) => {
          const raw = ((kpis?.[card.key] as number | undefined) ?? 0)
          const display = card.formatValue(raw)
          const borderClass = card.border(raw)
          const textClass = card.textColor(raw)

          if (loading) {
            return (
              <div key={card.key} className="rounded-lg border border-slate-200 border-l-4 border-l-slate-100 bg-white p-3 animate-pulse">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="mt-2 h-7 w-12 rounded bg-slate-100" />
              </div>
            )
          }

          return (
            <Link
              key={card.key}
              href={card.href}
              className={[
                'rounded-lg border border-slate-200 border-l-4 bg-white p-3',
                'hover:shadow-md hover:ring-1 hover:ring-blue-300 transition-shadow',
                borderClass,
              ].join(' ')}
            >
              <div className="flex items-center gap-1.5">
                <card.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight">
                  {card.label}
                </span>
              </div>
              <p className={`mt-1.5 text-2xl font-bold tabular-nums ${textClass}`}>{display}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
