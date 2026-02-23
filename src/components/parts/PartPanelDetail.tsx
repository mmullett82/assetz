'use client'

import { useState } from 'react'
import { X, Pencil, BookmarkPlus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { usePart } from '@/hooks/usePart'
import PartStockBadge, { availableQty } from './PartStockBadge'
import ReserveModal from './ReserveModal'
import { MOCK_ASSETS } from '@/lib/mock-data'
import { MOCK_WORK_ORDERS } from '@/lib/mock-work-orders'
import { MOCK_PART_RESERVATIONS } from '@/lib/mock-parts'
import { formatDate } from '@/lib/due-status'

type Tab = 'overview' | 'assets' | 'work-orders' | 'reservations'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',     label: 'Overview'     },
  { key: 'assets',       label: 'Assets'       },
  { key: 'work-orders',  label: 'Work Orders'  },
  { key: 'reservations', label: 'Reservations' },
]

interface PartPanelDetailProps {
  partId: string
  onEdit: () => void
  onClose: () => void
}

export default function PartPanelDetail({ partId, onEdit, onClose }: PartPanelDetailProps) {
  const { part, isLoading, error, mutate } = usePart(partId)
  const [activeTab, setTab]     = useState<Tab>('overview')
  const [reserving, setReserving] = useState(false)

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !part) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-500">Part not found</p>
      </div>
    )
  }

  const avail        = availableQty(part)
  const reservations = MOCK_PART_RESERVATIONS.filter((r) => r.part_id === part.id)
  const compatAssets = (part.compatible_assets ?? [])
    .map((aid) => MOCK_ASSETS.find((a) => a.id === aid))
    .filter(Boolean) as typeof MOCK_ASSETS
  const linkedWOs = MOCK_WORK_ORDERS.filter((wo) =>
    wo.parts_used?.some((pu) => pu.part_id === part.id)
  )

  async function handleReserve(data: { workOrderId: string; quantity: number }) {
    await mutate(
      (prev) => prev
        ? { ...prev, quantity_reserved: prev.quantity_reserved + data.quantity }
        : prev,
      { revalidate: false }
    )
    setReserving(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReserving(true)}
            disabled={avail === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Reserve
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
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
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-blue-700">{part.part_number}</p>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900">{part.name}</h2>
              {part.manufacturer && (
                <p className="text-sm text-slate-500">{part.manufacturer}</p>
              )}
            </div>
            <PartStockBadge status={part.status} />
          </div>

          {/* Stock summary */}
          <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{part.quantity_on_hand}</p>
              <p className="text-xs text-slate-500">On Hand</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-600">{part.quantity_reserved}</p>
              <p className="text-xs text-slate-500">Reserved</p>
            </div>
            <div className="text-center">
              <p className={['text-xl font-bold', avail === 0 ? 'text-red-600' : 'text-green-700'].join(' ')}>
                {avail}
              </p>
              <p className="text-xs text-slate-500">Available</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                'shrink-0 px-3 py-2 text-xs font-semibold border-b-2 transition-colors',
                activeTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {activeTab === 'overview' && (
            <dl className="divide-y divide-slate-100">
              {[
                ['Part Number',   part.part_number],
                ['Description',   part.description],
                ['Manufacturer',  part.manufacturer],
                ['Vendor',        part.vendor],
                ['Unit of Measure', part.unit_of_measure],
                ['Unit Cost',     part.unit_cost !== undefined ? `$${part.unit_cost.toFixed(2)}` : undefined],
                ['Location',      part.location],
                ['Reorder Point', part.reorder_point],
              ].map(([label, value]) =>
                value !== undefined && value !== null && value !== '' ? (
                  <div key={String(label)} className="flex justify-between py-2.5 text-sm">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-900 text-right">{String(value)}</dd>
                  </div>
                ) : null
              )}
            </dl>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-2">
              {compatAssets.length === 0 ? (
                <p className="text-sm text-slate-400">No compatible assets</p>
              ) : compatAssets.map((a) => (
                <Link
                  key={a.id}
                  href={`/assets/${a.id}`}
                  className="block rounded-lg border border-slate-100 bg-white p-3 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                  <p className="text-xs text-blue-600 font-mono">{a.facility_asset_id}</p>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'work-orders' && (
            <div className="space-y-2">
              {linkedWOs.length === 0 ? (
                <p className="text-sm text-slate-400">No linked work orders</p>
              ) : linkedWOs.map((wo) => (
                <Link
                  key={wo.id}
                  href={`/work-orders/${wo.id}`}
                  className="block rounded-lg border border-slate-100 bg-white p-3 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{wo.title}</p>
                  <p className="font-mono text-xs text-slate-400">{wo.work_order_number}</p>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-2">
              {reservations.length === 0 ? (
                <p className="text-sm text-slate-400">No active reservations</p>
              ) : reservations.map((r) => (
                <div key={r.id} className="rounded-lg border border-slate-100 bg-white p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      WO: {r.work_order_id}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      Qty: {r.quantity_reserved}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(r.reserved_at)}</p>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/parts/${part.id}`}
            className="block text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Full Detail Page →
          </Link>
        </div>
      </div>

      {/* Reserve modal */}
      {reserving && (
        <ReserveModal
          part={part}
          onConfirm={handleReserve}
          onCancel={() => setReserving(false)}
        />
      )}
    </div>
  )
}
