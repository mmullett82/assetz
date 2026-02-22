'use client'

import { useState } from 'react'
import { X, BookmarkPlus } from 'lucide-react'
import type { Part } from '@/types'
import Button from '@/components/ui/Button'
import { MOCK_WORK_ORDERS } from '@/lib/mock-work-orders'
import { availableQty } from './PartStockBadge'

interface ReserveModalProps {
  part: Part
  onConfirm: (data: { workOrderId: string; quantity: number }) => Promise<void>
  onCancel: () => void
}

const ACTIVE_STATUSES = new Set(['open', 'in_progress'])

export default function ReserveModal({ part, onConfirm, onCancel }: ReserveModalProps) {
  const activeWOs = MOCK_WORK_ORDERS.filter((wo) => ACTIVE_STATUSES.has(wo.status))
  const avail     = availableQty(part)

  const [workOrderId, setWorkOrderId] = useState(activeWOs[0]?.id ?? '')
  const [quantity,    setQuantity]    = useState(1)
  const [isSaving,    setSaving]      = useState(false)

  const afterReserve = avail - quantity

  async function handleConfirm() {
    if (!workOrderId || quantity < 1 || quantity > avail) return
    setSaving(true)
    try {
      await onConfirm({ workOrderId, quantity })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BookmarkPlus className="h-5 w-5 text-slate-700 shrink-0" aria-hidden="true" />
              <h2 className="text-base font-bold text-slate-900">Reserve Part</h2>
            </div>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{part.part_number}</p>
            <p className="text-sm text-slate-700 font-medium">{part.name}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Available info */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm flex items-center gap-6">
            <span className="text-slate-500">On hand: <span className="font-semibold text-slate-700">{part.quantity_on_hand}</span></span>
            <span className="text-slate-500">Reserved: <span className="font-semibold text-slate-700">{part.quantity_reserved}</span></span>
            <span className="text-slate-500">Available: <span className="font-semibold text-green-700">{avail}</span></span>
          </div>

          {/* Work order select */}
          <div>
            <label htmlFor="reserve-wo" className="block text-sm font-medium text-slate-700 mb-1.5">
              Work Order
            </label>
            {activeWOs.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No open work orders found.</p>
            ) : (
              <select
                id="reserve-wo"
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              >
                {activeWOs.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    {wo.work_order_number} — {wo.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="reserve-qty" className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantity
            </label>
            <input
              id="reserve-qty"
              type="number"
              min={1}
              max={avail}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(avail, parseInt(e.target.value) || 1)))}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
            <p className="mt-1 text-xs text-slate-400">Max: {avail} available</p>
          </div>

          {/* After reservation preview */}
          <div className={[
            'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm',
            afterReserve < 0
              ? 'bg-red-50 border-red-200 text-red-700'
              : afterReserve === 0
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-green-50 border-green-200 text-green-700',
          ].join(' ')}>
            <BookmarkPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {afterReserve} available after reservation
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-slate-100">
          <Button
            onClick={handleConfirm}
            loading={isSaving}
            disabled={!workOrderId || quantity < 1 || quantity > avail || activeWOs.length === 0}
            className="flex-1"
          >
            <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
            Reserve
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
