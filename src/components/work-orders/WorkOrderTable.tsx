'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, Eye, Cpu, Copy, Trash2 } from 'lucide-react'
import type { WorkOrder } from '@/types'
import apiClient from '@/lib/api-client'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { showToast } from '@/hooks/useToast'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import WorkOrderStatusBadge from './WorkOrderStatusBadge'
import WorkOrderPriorityBadge from './WorkOrderPriorityBadge'
import DueStatusBadge from '@/components/ui/DueStatusBadge'
import { computeDueStatus, formatDate } from '@/lib/due-status'
import { MOCK_ASSETS } from '@/lib/mock-data'
import DotsMenu from '@/components/ui/DotsMenu'
import DuplicateModal from '@/components/ui/DuplicateModal'
import type { ColumnDef } from '@/components/ui/ColumnChooser'

export type WOCol = 'wo_number' | 'title' | 'asset' | 'priority' | 'status' | 'due'

export const COLUMN_DEFS: ColumnDef<WOCol>[] = [
  { key: 'wo_number', label: 'WO #',     required: true },
  { key: 'title',     label: 'Title',    required: true },
  { key: 'priority',  label: 'Priority', required: true },
  { key: 'status',    label: 'Status',   required: true },
  { key: 'asset',     label: 'Asset'                    },
  { key: 'due',       label: 'Due Date'                 },
]

export const COLUMN_DEFAULTS: Record<WOCol, boolean> = {
  wo_number: true,
  title:     true,
  priority:  true,
  status:    true,
  asset:     true,
  due:       true,
}

interface WorkOrderTableProps {
  workOrders: WorkOrder[]
  visibility: Record<WOCol, boolean>
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
}

export default function WorkOrderTable({ workOrders, visibility, selectedIds = new Set(), onSelectionChange }: WorkOrderTableProps) {
  const router = useRouter()
  const headerCheckRef = useRef<HTMLInputElement>(null)
  const { mutate } = useWorkOrders()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [dupTarget, setDupTarget] = useState<{ id: string; title: string; assetId: string } | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.workOrders.delete(deleteTarget.id)
      await mutate()
      showToast('success', `"${deleteTarget.title}" deleted`)
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete work order')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const allSelected  = workOrders.length > 0 && workOrders.every((w) => selectedIds.has(w.id))
  const someSelected = workOrders.some((w) => selectedIds.has(w.id)) && !allSelected

  if (headerCheckRef.current) {
    headerCheckRef.current.indeterminate = someSelected
  }

  function toggleAll() {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? new Set() : new Set(workOrders.map((w) => w.id)))
  }

  function toggleOne(id: string) {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectionChange(next)
  }

  if (workOrders.length === 0) return null

  return (
    <>
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
              {visibility.wo_number && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">WO #</th>
              )}
              {visibility.title && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
              )}
              {visibility.asset && (
                <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Asset</th>
              )}
              {visibility.priority && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
              )}
              {visibility.status && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              )}
              {visibility.due && (
                <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Due</th>
              )}
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workOrders.map((wo) => {
              const asset     = MOCK_ASSETS.find((a) => a.id === wo.asset_id)
              const isActive  = wo.status !== 'completed' && wo.status !== 'cancelled'
              const dueStatus = wo.due_date
                ? computeDueStatus(wo.due_date, wo.completed_at)
                : undefined

              return (
                <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(wo.id)}
                      onChange={() => toggleOne(wo.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                      aria-label={`Select ${wo.title}`}
                    />
                  </td>

                  {visibility.wo_number && (
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {wo.work_order_number}
                    </td>
                  )}

                  {visibility.title && (
                    <td className="px-4 py-3 max-w-xs">
                      <Link
                        href={`/work-orders/${wo.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {wo.title}
                      </Link>
                    </td>
                  )}

                  {visibility.asset && (
                    <td className="hidden md:table-cell px-4 py-3 text-slate-600 whitespace-nowrap">
                      {asset?.name ?? '—'}
                    </td>
                  )}

                  {visibility.priority && (
                    <td className="px-4 py-3">
                      <WorkOrderPriorityBadge priority={wo.priority} />
                    </td>
                  )}

                  {visibility.status && (
                    <td className="px-4 py-3">
                      <WorkOrderStatusBadge status={wo.status} />
                    </td>
                  )}

                  {visibility.due && (
                    <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap">
                      {wo.due_date ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-500">{formatDate(wo.due_date)}</span>
                          {dueStatus && isActive && (
                            <DueStatusBadge status={dueStatus} />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  )}

                  <td className="px-4 py-3 text-right">
                    <DotsMenu
                      size="sm"
                      align="right"
                      items={[
                        {
                          label: 'Edit',
                          icon: <Edit className="h-4 w-4" />,
                          onClick: () => router.push(`/work-orders/${wo.id}/edit`),
                        },
                        {
                          label: 'View Detail',
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => router.push(`/work-orders/${wo.id}`),
                        },
                        {
                          separator: true,
                          label: 'Show Asset',
                          icon: <Cpu className="h-4 w-4" />,
                          onClick: () => router.push(`/assets/${wo.asset_id}`),
                        },
                        {
                        label: 'Duplicate',
                        icon: <Copy className="h-4 w-4" />,
                        onClick: () => setDupTarget({ id: wo.id, title: wo.title, assetId: wo.asset_id }),
                        },
                        {
                          separator: true,
                          label: 'Delete',
                          icon: <Trash2 className="h-4 w-4" />,
                          onClick: () => setDeleteTarget({ id: wo.id, title: wo.title }),
                          destructive: true,
                        },
                      ]}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <DuplicateModal
        open={!!dupTarget}
        type="wo"
        sourceId={dupTarget?.id ?? ''}
        currentAssetId={dupTarget?.assetId}
        itemTitle={dupTarget?.title ?? ''}
        onClose={() => setDupTarget(null)}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Work Order"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
