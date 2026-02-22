'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Pencil, Clock, User, Wrench,
  AlertTriangle, Camera, Package,
} from 'lucide-react'
import { useWorkOrder } from '@/hooks/useWorkOrder'
import StatusWorkflow from '@/components/work-orders/StatusWorkflow'
import CommentThread from '@/components/work-orders/CommentThread'
import WorkOrderPriorityBadge from '@/components/work-orders/WorkOrderPriorityBadge'
import WorkOrderStatusBadge from '@/components/work-orders/WorkOrderStatusBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { computeDueStatus, dueDateLabel, formatDate } from '@/lib/due-status'
import { MOCK_ASSETS } from '@/lib/mock-data'
import type { WorkOrderStatus, WorkOrderComment } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

const TYPE_LABELS: Record<string, string> = {
  corrective:  'Corrective',
  preventive:  'Preventive',
  inspection:  'Inspection',
  project:     'Project',
  safety:      'Safety',
}

export default function WorkOrderDetailPage({ params }: Props) {
  const { id } = use(params)
  const { workOrder: wo, isLoading, error, mutate } = useWorkOrder(id)
  const [isUpdating, setUpdating] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !wo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-10 w-10 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-600">Work order not found</p>
        <Link href="/work-orders" className="mt-3 text-sm text-blue-600 hover:underline">
          ← Back to Work Orders
        </Link>
      </div>
    )
  }

  const asset     = MOCK_ASSETS.find((a) => a.id === wo.asset_id)
  const isActive  = wo.status !== 'completed' && wo.status !== 'cancelled'
  const dueStatus = wo.due_date
    ? computeDueStatus(wo.due_date, wo.completed_at)
    : undefined

  async function handleTransition(next: WorkOrderStatus) {
    setUpdating(true)
    try {
      // TODO: await apiClient.workOrders.updateStatus(wo.id, next)
      await new Promise((r) => setTimeout(r, 500))
      // Optimistic update — mutate with new status
      await mutate(
        (prev) => prev ? { ...prev, status: next } : prev,
        { revalidate: false }
      )
    } finally {
      setUpdating(false)
    }
  }

  async function handleAddComment(body: string) {
    // TODO: await apiClient.workOrders.addComment(wo.id, body)
    await new Promise((r) => setTimeout(r, 400))
    const newComment: WorkOrderComment = {
      id: `cmt-${Date.now()}`,
      work_order_id: wo!.id,
      user_id: 'usr-mgr1',
      user: {
        id: 'usr-mgr1', organization_id: 'org-solid',
        email: 'matt@solid.com', full_name: 'Matt M.',
        role: 'manager', is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      body,
      created_at: new Date().toISOString(),
    }
    await mutate(
      (prev) => prev ? { ...prev, comments: [...(prev.comments ?? []), newComment] } : prev,
      { revalidate: false }
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + edit */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/work-orders"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Work Orders
        </Link>
        <Link
          href={`/work-orders/${wo.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-slate-400">{wo.work_order_number}</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 leading-snug">{wo.title}</h1>
            {wo.description && (
              <p className="mt-2 text-sm text-slate-600">{wo.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <WorkOrderStatusBadge status={wo.status} />
            <WorkOrderPriorityBadge priority={wo.priority} />
          </div>
        </div>

        {/* Metadata grid */}
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 border-t border-slate-100 pt-4">
          {asset && (
            <div>
              <dt className="text-xs text-slate-400">Asset</dt>
              <dd>
                <Link
                  href={`/assets/${asset.id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {asset.name}
                </Link>
              </dd>
            </div>
          )}

          <div>
            <dt className="text-xs text-slate-400">Type</dt>
            <dd className="text-sm font-medium text-slate-700">{TYPE_LABELS[wo.type] ?? wo.type}</dd>
          </div>

          {wo.due_date && (
            <div>
              <dt className="text-xs text-slate-400">Due date</dt>
              <dd className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-700">{formatDate(wo.due_date)}</span>
                {dueStatus && isActive && <DueStatusBadge status={dueStatus} />}
                {wo.due_date && (
                  <span className="text-xs text-slate-400">{dueDateLabel(wo.due_date, wo.completed_at)}</span>
                )}
              </dd>
            </div>
          )}

          {(wo.estimated_hours !== undefined || wo.actual_hours !== undefined) && (
            <div>
              <dt className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Hours
              </dt>
              <dd className="text-sm font-medium text-slate-700">
                {wo.actual_hours ?? '—'} / {wo.estimated_hours ?? '—'} est.
              </dd>
            </div>
          )}

          {wo.assigned_to_id && (
            <div>
              <dt className="text-xs text-slate-400 flex items-center gap-1">
                <User className="h-3 w-3" /> Assigned to
              </dt>
              <dd className="text-sm font-medium text-slate-700">Technician</dd>
            </div>
          )}

          {wo.failure_code && (
            <div>
              <dt className="text-xs text-slate-400">Failure code</dt>
              <dd className="text-sm font-mono text-slate-700">{wo.failure_code}</dd>
            </div>
          )}
        </dl>

        {/* Remedy — show when completed */}
        {wo.remedy && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
              <Wrench className="h-3 w-3" /> Resolution
            </p>
            <p className="text-sm text-green-900">{wo.remedy}</p>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: workflow + comments */}
        <div className="space-y-5">
          <StatusWorkflow
            status={wo.status}
            onTransition={handleTransition}
            isUpdating={isUpdating}
          />

          <CommentThread
            comments={wo.comments ?? []}
            onAddComment={handleAddComment}
            isReadOnly={!isActive}
          />
        </div>

        {/* Right: photos + parts */}
        <div className="space-y-5">
          {/* Photos */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Camera className="h-4 w-4 text-slate-400" />
              Photos
            </h2>
            {(wo.photos ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-8 text-center">
                <Camera className="h-8 w-8 text-slate-300 mb-2" aria-hidden="true" />
                <p className="text-xs text-slate-400">No photos attached</p>
                {isActive && (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                  >
                    <Camera className="h-3.5 w-3.5" /> Attach photo
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {wo.photos!.map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt={p.caption ?? 'WO photo'}
                    className="rounded-lg object-cover aspect-square w-full"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Parts used */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-400" />
              Parts Used
            </h2>
            {(wo.parts_used ?? []).length === 0 ? (
              <p className="text-sm text-slate-400 italic">No parts recorded.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {wo.parts_used!.map((p) => (
                  <li key={p.id} className="flex justify-between py-2 text-sm">
                    <span className="text-slate-700 font-mono">
                      {p.part?.part_number ?? p.part_id}
                    </span>
                    <span className="text-slate-500">
                      × {p.quantity_used}
                      {p.unit_cost !== undefined && (
                        <span className="ml-2 text-xs text-slate-400">
                          ${(p.quantity_used * p.unit_cost).toFixed(2)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {isActive && (
              <button
                type="button"
                className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors min-h-[44px]"
              >
                + Add part
              </button>
            )}
          </div>

          {/* Timestamps */}
          <div className="space-y-1 px-1 text-xs text-slate-400">
            <p>Created: {formatDate(wo.created_at)}</p>
            {wo.started_at   && <p>Started: {formatDate(wo.started_at)}</p>}
            {wo.completed_at && <p>Completed: {formatDate(wo.completed_at)}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
