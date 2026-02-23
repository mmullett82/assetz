'use client'

import { useState } from 'react'
import { X, Pencil, AlertTriangle, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { useWorkOrder } from '@/hooks/useWorkOrder'
import StatusWorkflow from './StatusWorkflow'
import CommentThread from './CommentThread'
import WorkOrderPriorityBadge from './WorkOrderPriorityBadge'
import WorkOrderStatusBadge from './WorkOrderStatusBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { computeDueStatus, dueDateLabel, formatDate } from '@/lib/due-status'
import { MOCK_ASSETS } from '@/lib/mock-data'
import type { WorkOrderStatus, WorkOrderComment } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  corrective:  'Corrective',
  preventive:  'Preventive',
  inspection:  'Inspection',
  project:     'Project',
  safety:      'Safety',
  breakdown:   'Breakdown',
}

interface WorkOrderPanelDetailProps {
  workOrderId: string
  onEdit: () => void
  onClose: () => void
}

export default function WorkOrderPanelDetail({ workOrderId, onEdit, onClose }: WorkOrderPanelDetailProps) {
  const { workOrder: wo, isLoading, error, mutate } = useWorkOrder(workOrderId)
  const [isUpdating, setUpdating] = useState(false)

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !wo) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-500">Work order not found</p>
      </div>
    )
  }

  const asset     = MOCK_ASSETS.find((a) => a.id === wo.asset_id)
  const isActive  = wo.status !== 'completed' && wo.status !== 'cancelled'
  const dueStatus = wo.due_date ? computeDueStatus(wo.due_date, wo.completed_at) : undefined

  async function handleTransition(next: WorkOrderStatus) {
    setUpdating(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      await mutate(
        (prev) => prev ? { ...prev, status: next } : prev,
        { revalidate: false }
      )
    } finally {
      setUpdating(false)
    }
  }

  async function handleAddComment(body: string) {
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div>
          <p className="font-mono text-xs text-slate-400">{wo.work_order_number}</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 leading-snug">{wo.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <WorkOrderStatusBadge status={wo.status} />
            <WorkOrderPriorityBadge priority={wo.priority} />
          </div>
          {wo.description && (
            <p className="mt-2 text-sm text-slate-600">{wo.description}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {asset && (
              <div>
                <dt className="text-xs text-slate-400">Asset</dt>
                <dd>
                  <Link href={`/assets/${asset.id}`} className="text-sm font-medium text-blue-600 hover:underline">
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
              <div className="col-span-2">
                <dt className="text-xs text-slate-400">Due date</dt>
                <dd className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-sm font-medium text-slate-700">{formatDate(wo.due_date)}</span>
                  {dueStatus && isActive && <DueStatusBadge status={dueStatus} />}
                  <span className="text-xs text-slate-400">{dueDateLabel(wo.due_date, wo.completed_at)}</span>
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
          </dl>
        </div>

        {/* Status workflow */}
        <StatusWorkflow
          status={wo.status}
          onTransition={handleTransition}
          isUpdating={isUpdating}
        />

        {/* Comments */}
        <CommentThread
          comments={wo.comments ?? []}
          onAddComment={handleAddComment}
        />

        {/* Link to full page */}
        <Link
          href={`/work-orders/${wo.id}`}
          className="block text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Full Detail Page →
        </Link>
      </div>
    </div>
  )
}
