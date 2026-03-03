'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, AlertTriangle, PlayCircle } from 'lucide-react'
import type { WorkOrder, DueStatus } from '@/types'

interface MyWorkCenterProps {
  workOrders: WorkOrder[]
  userId?: string
  loading?: boolean
}

type TabId = 'all' | 'due_today' | 'overdue' | 'in_progress'

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due_today', label: 'Due Today' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'in_progress', label: 'In Progress' },
]

const STATUS_COLORS: Record<DueStatus, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
}

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
}

export default function MyWorkCenter({ workOrders, userId, loading }: MyWorkCenterProps) {
  const [activeTab, setActiveTab] = useState<TabId>('all')

  const myWOs = workOrders.filter((wo) => wo.assigned_to_id === userId)

  const filtered = myWOs.filter((wo) => {
    if (activeTab === 'all') return wo.status !== 'completed' && wo.status !== 'cancelled'
    if (activeTab === 'in_progress') return wo.status === 'in_progress'
    if (activeTab === 'overdue') return wo.due_status === 'red'
    if (activeTab === 'due_today') {
      if (!wo.due_date) return false
      const due = new Date(wo.due_date)
      const today = new Date()
      return due.toDateString() === today.toDateString()
    }
    return true
  }).sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2
    const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2
    return pa - pb
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">My Work Center</h2>
        {userId && (
          <Link
            href={`/work-orders?assigned_to_id=${userId}`}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* WO list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 animate-pulse">
              <div className="h-4 w-40 rounded bg-slate-100" />
              <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-400">No work orders</p>
          </div>
        ) : (
          filtered.slice(0, 8).map((wo) => (
            <Link
              key={wo.id}
              href={`/work-orders/${wo.id}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:shadow-sm hover:border-blue-200 transition-all"
            >
              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${STATUS_COLORS[wo.due_status ?? 'green']}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{wo.title}</p>
                <p className="text-xs text-slate-500 truncate">
                  {wo.work_order_number} · {wo.asset?.name ?? 'No asset'}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[wo.priority] ?? ''}`}>
                {wo.priority}
              </span>
              {wo.status === 'in_progress' && <PlayCircle className="h-4 w-4 text-blue-500" />}
              {wo.due_status === 'red' && <AlertTriangle className="h-4 w-4 text-red-500" />}
              {wo.due_status === 'yellow' && <Clock className="h-4 w-4 text-yellow-500" />}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
