'use client'

import Link from 'next/link'
import {
  CalendarClock,
  Wrench,
  AlertTriangle,
  Clock,
  Inbox,
  AlertOctagon,
} from 'lucide-react'
import type { DashboardKPIs } from '@/types'

interface WorkOverviewProps {
  kpis: DashboardKPIs | undefined
  loading?: boolean
}

const CARDS = [
  {
    label: 'Planned (PM)',
    key: 'planned_wos' as const,
    icon: CalendarClock,
    href: '/work-orders?origin=pm',
    color: 'text-blue-500',
  },
  {
    label: 'Reactive',
    key: 'reactive_wos' as const,
    icon: Wrench,
    href: '/work-orders?origin=manual',
    color: 'text-orange-500',
  },
  {
    label: 'Overdue',
    key: 'overdue_work_orders' as const,
    icon: AlertTriangle,
    href: '/work-orders?overdue=true',
    color: 'text-red-500',
  },
  {
    label: 'Pending Approval',
    key: 'pending_approval' as const,
    icon: Clock,
    href: '/requests?status=submitted',
    color: 'text-yellow-500',
  },
  {
    label: 'New Requests Today',
    key: 'new_requests_today' as const,
    icon: Inbox,
    href: '/requests?period=today',
    color: 'text-purple-500',
  },
  {
    label: 'Critical Priority',
    key: 'critical_priority' as const,
    icon: AlertOctagon,
    href: '/work-orders?priority=critical',
    color: 'text-red-600',
  },
]

export default function WorkOverviewSection({ kpis, loading }: WorkOverviewProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Work Overview</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {CARDS.map((card) => {
          const val = kpis?.[card.key] ?? 0
          if (loading) {
            return (
              <div key={card.key} className="rounded-lg border border-slate-200 bg-white p-4 animate-pulse">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="mt-2 h-8 w-10 rounded bg-slate-100" />
              </div>
            )
          }
          return (
            <Link
              key={card.key}
              href={card.href}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md hover:ring-1 hover:ring-blue-300 transition-shadow"
            >
              <div className="flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{val}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
