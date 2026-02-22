'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil, AlertTriangle, BookmarkPlus, Package, X } from 'lucide-react'
import { usePart } from '@/hooks/usePart'
import PartStockBadge, { availableQty } from '@/components/parts/PartStockBadge'
import ReserveModal from '@/components/parts/ReserveModal'
import { MOCK_ASSETS } from '@/lib/mock-data'
import { MOCK_WORK_ORDERS } from '@/lib/mock-work-orders'
import { MOCK_PART_RESERVATIONS } from '@/lib/mock-parts'
import { formatDate } from '@/lib/due-status'

type Tab = 'overview' | 'assets' | 'work-orders' | 'reservations'

interface Props {
  params: Promise<{ id: string }>
}

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: 'overview',     label: 'Overview'     },
  { key: 'assets',       label: 'Assets'       },
  { key: 'work-orders',  label: 'Work Orders'  },
  { key: 'reservations', label: 'Reservations' },
]

export default function PartDetailPage({ params }: Props) {
  const { id }                        = use(params)
  const { part, isLoading, error, mutate } = usePart(id)
  const [activeTab, setTab]           = useState<Tab>('overview')
  const [reserving, setReserving]     = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !part) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-10 w-10 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-600">Part not found</p>
        <Link href="/parts" className="mt-3 text-sm text-blue-600 hover:underline">← Back to Parts Inventory</Link>
      </div>
    )
  }

  const avail        = availableQty(part)
  const reservations = MOCK_PART_RESERVATIONS.filter((r) => r.part_id === part.id)
  const compatAssets = (part.compatible_assets ?? [])
    .map((aid) => MOCK_ASSETS.find((a) => a.id === aid))
    .filter(Boolean) as typeof MOCK_ASSETS

  // WOs that used this part (checking parts_used array)
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
    // TODO: await apiClient.parts.reserve(part.id, data.workOrderId, data.quantity)
    setReserving(false)
  }

  async function handleRelease(reservationId: string, qty: number) {
    await mutate(
      (prev) => prev
        ? { ...prev, quantity_reserved: Math.max(0, prev.quantity_reserved - qty) }
        : prev,
      { revalidate: false }
    )
    // TODO: await apiClient.parts.release(part.id, workOrderId)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/parts"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Parts Inventory
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReserving(true)}
            disabled={avail === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BookmarkPlus className="h-4 w-4" />
            Reserve
          </button>
          <Link
            href={`/parts/${part.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-slate-500">{part.part_number}</p>
            <h1 className="text-xl font-bold text-slate-900 leading-snug mt-0.5">{part.name}</h1>
          </div>
          <PartStockBadge status={part.status} />
        </div>

        {/* Stock summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{part.quantity_on_hand}</p>
            <p className="text-xs text-slate-500 mt-0.5">On Hand</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-500">{part.quantity_reserved}</p>
            <p className="text-xs text-slate-500 mt-0.5">Reserved</p>
          </div>
          <div className="text-center">
            <p className={[
              'text-2xl font-bold',
              avail === 0 ? 'text-red-600' : avail <= (part.reorder_point ?? 0) ? 'text-yellow-600' : 'text-green-700',
            ].join(' ')}>
              {avail}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Available</p>
          </div>
          {part.reorder_point !== undefined && (
            <div className="text-center hidden sm:block">
              <p className="text-2xl font-bold text-slate-400">{part.reorder_point}</p>
              <p className="text-xs text-slate-500 mt-0.5">Reorder Pt</p>
            </div>
          )}
        </div>

        {/* Reservation breakdown */}
        {reservations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
            {reservations.map((r) => {
              const wo = MOCK_WORK_ORDERS.find((w) => w.id === r.work_order_id)
              return (
                <div key={r.id} className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{r.quantity_reserved} reserved for</span>
                  {wo ? (
                    <Link
                      href={`/work-orders/${wo.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {wo.work_order_number} →
                    </Link>
                  ) : (
                    <span className="font-mono">{r.work_order_id}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tab strip */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={[
                'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      <div>
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {part.description && (
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-xs text-slate-400">Description</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{part.description}</dd>
                </div>
              )}
              {part.manufacturer && (
                <div>
                  <dt className="text-xs text-slate-400">Manufacturer</dt>
                  <dd className="text-sm font-medium text-slate-700">{part.manufacturer}</dd>
                </div>
              )}
              {part.vendor && (
                <div>
                  <dt className="text-xs text-slate-400">Vendor / Supplier</dt>
                  <dd className="text-sm font-medium text-slate-700">{part.vendor}</dd>
                </div>
              )}
              {part.vendor_part_number && (
                <div>
                  <dt className="text-xs text-slate-400">Vendor Part #</dt>
                  <dd className="font-mono text-sm text-slate-700">{part.vendor_part_number}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400">Unit of Measure</dt>
                <dd className="text-sm font-medium text-slate-700">{part.unit_of_measure}</dd>
              </div>
              {part.unit_cost !== undefined && (
                <div>
                  <dt className="text-xs text-slate-400">Unit Cost</dt>
                  <dd className="text-sm font-medium text-slate-700">${part.unit_cost.toFixed(2)}</dd>
                </div>
              )}
              {part.reorder_point !== undefined && (
                <div>
                  <dt className="text-xs text-slate-400">Reorder Point</dt>
                  <dd className="text-sm font-medium text-slate-700">{part.reorder_point}</dd>
                </div>
              )}
              {part.reorder_quantity !== undefined && (
                <div>
                  <dt className="text-xs text-slate-400">Reorder Qty</dt>
                  <dd className="text-sm font-medium text-slate-700">{part.reorder_quantity}</dd>
                </div>
              )}
              {part.location && (
                <div>
                  <dt className="text-xs text-slate-400">Location</dt>
                  <dd className="text-sm font-medium text-slate-700">{part.location}</dd>
                </div>
              )}
            </dl>

            {/* Compatible assets list */}
            {compatAssets.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  Compatible Assets
                </h3>
                <ul className="space-y-1">
                  {compatAssets.map((asset) => (
                    <li key={asset.id}>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {asset.name}
                      </Link>
                      <span className="ml-2 font-mono text-xs text-slate-400">{asset.facility_asset_id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Assets tab */}
        {activeTab === 'assets' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {compatAssets.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No compatible assets recorded.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {compatAssets.map((asset) => (
                  <li key={asset.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {asset.name}
                      </Link>
                      <p className="font-mono text-xs text-slate-400 mt-0.5">{asset.facility_asset_id}</p>
                    </div>
                    <span className={[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      asset.status === 'operational' ? 'bg-green-100 text-green-700'
                      : asset.status === 'down'        ? 'bg-red-100 text-red-700'
                      : asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-slate-100 text-slate-500',
                    ].join(' ')}>
                      {asset.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Work Orders tab */}
        {activeTab === 'work-orders' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {linkedWOs.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No work orders recorded for this part.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {linkedWOs.map((wo) => (
                  <li key={wo.id} className="py-3">
                    <Link
                      href={`/work-orders/${wo.id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {wo.work_order_number}
                    </Link>
                    <p className="text-sm text-slate-700 mt-0.5">{wo.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Reservations tab */}
        {activeTab === 'reservations' && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {reservations.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No active reservations.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reservations.map((r) => {
                  const wo = MOCK_WORK_ORDERS.find((w) => w.id === r.work_order_id)
                  return (
                    <li key={r.id} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-700">
                            Qty {r.quantity_reserved}
                          </span>
                          {wo && (
                            <Link
                              href={`/work-orders/${wo.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {wo.work_order_number} →
                            </Link>
                          )}
                        </div>
                        {wo && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{wo.title}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                          Reserved {formatDate(r.reserved_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRelease(r.id, r.quantity_reserved)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-h-[36px] shrink-0"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        Release
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
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
