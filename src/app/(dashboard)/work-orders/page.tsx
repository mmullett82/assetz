'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, ClipboardList, LayoutList, Table2 } from 'lucide-react'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import WorkOrderTable from '@/components/work-orders/WorkOrderTable'
import WorkOrderCard from '@/components/work-orders/WorkOrderCard'
import EmptyState from '@/components/ui/EmptyState'
import type { WorkOrderStatus, WorkOrderPriority, WorkOrderType } from '@/types'

type ViewMode = 'table' | 'cards'

const STATUS_TABS: { value: WorkOrderStatus | ''; label: string }[] = [
  { value: '',            label: 'All'         },
  { value: 'open',        label: 'Open'        },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold',     label: 'On Hold'     },
  { value: 'completed',   label: 'Completed'   },
  { value: 'cancelled',   label: 'Cancelled'   },
]

const PRIORITY_OPTIONS: { value: WorkOrderPriority | ''; label: string }[] = [
  { value: '',         label: 'All Priorities' },
  { value: 'critical', label: '! Critical'     },
  { value: 'high',     label: 'High'           },
  { value: 'medium',   label: 'Medium'         },
  { value: 'low',      label: 'Low'            },
]

const TYPE_OPTIONS: { value: WorkOrderType | ''; label: string }[] = [
  { value: '',            label: 'All Types'   },
  { value: 'corrective',  label: 'Corrective'  },
  { value: 'preventive',  label: 'Preventive'  },
  { value: 'inspection',  label: 'Inspection'  },
  { value: 'project',     label: 'Project'     },
  { value: 'safety',      label: 'Safety'      },
]

export default function WorkOrdersPage() {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<WorkOrderStatus | ''>('')
  const [priority, setPriority] = useState<WorkOrderPriority | ''>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const { workOrders, total, isLoading } = useWorkOrders({
    search:   search   || undefined,
    status:   status   || undefined,
    priority: priority || undefined,
  })

  // Counts per status for tab badges
  const { workOrders: all } = useWorkOrders()
  const countByStatus = (s: WorkOrderStatus | '') =>
    s ? all.filter((wo) => wo.status === s).length : all.length

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${total} work order${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/work-orders/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New WO
        </Link>
      </div>

      {/* Search + filters row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by title, WO number, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as WorkOrderPriority | '')}
          aria-label="Filter by priority"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* View toggle — desktop */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-label="Table view"
            className={['flex items-center justify-center rounded-md p-2 transition-colors', viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'].join(' ')}
          >
            <Table2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            aria-label="Card view"
            className={['flex items-center justify-center rounded-md p-2 transition-colors', viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'].join(' ')}
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count = countByStatus(tab.value)
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value as WorkOrderStatus | '')}
              className={[
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[40px]',
                status === tab.value
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              {tab.label}
              {count > 0 && (
                <span className={['rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none', status === tab.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'].join(' ')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : workOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="No work orders found"
          description={search || status || priority ? 'Try adjusting your filters.' : 'Create your first work order.'}
          action={
            !search && !status && !priority ? (
              <Link
                href="/work-orders/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New WO
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className={viewMode === 'table' ? 'hidden sm:block' : 'hidden'}>
            <WorkOrderTable workOrders={workOrders} />
          </div>
          {/* Mobile / card view */}
          <div className={viewMode === 'cards' ? 'block' : 'block sm:hidden'}>
            <div className="space-y-3">
              {workOrders.map((wo) => <WorkOrderCard key={wo.id} wo={wo} />)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
