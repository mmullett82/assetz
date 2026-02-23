'use client'

import Link from 'next/link'
import { X, ExternalLink, ClipboardList, CalendarClock, Cpu, Zap } from 'lucide-react'
import type { Asset, AssetStatus } from '@/types'
import { MOCK_ASSETS } from '@/lib/mock-data'

const STATUS_COLOR: Record<AssetStatus, string> = {
  operational:    'bg-green-100 text-green-800',
  maintenance:    'bg-yellow-100 text-yellow-800',
  down:           'bg-red-100 text-red-800',
  decommissioned: 'bg-slate-100 text-slate-600',
}

const STATUS_DOT: Record<AssetStatus, string> = {
  operational:    'bg-green-500',
  maintenance:    'bg-yellow-500',
  down:           'bg-red-500',
  decommissioned: 'bg-slate-400',
}

interface AssetDetailPanelProps {
  asset:       Asset
  liveStatus?: AssetStatus
  onClose:     () => void
}

export default function AssetDetailPanel({ asset, liveStatus, onClose }: AssetDetailPanelProps) {
  const status = liveStatus ?? asset.status

  // Resolve asset names for dependency display
  const dependsOnAssets = asset.depends_on?.map((id) => MOCK_ASSETS.find((a) => a.id === id)).filter(Boolean) as Asset[] | undefined
  const feedsAssets     = asset.feeds?.map((id)     => MOCK_ASSETS.find((a) => a.id === id)).filter(Boolean) as Asset[] | undefined
  const dependentsAssets = asset.dependents?.map((id) => MOCK_ASSETS.find((a) => a.id === id)).filter(Boolean) as Asset[] | undefined

  return (
    <aside
      className="absolute inset-y-0 right-0 z-10 w-80 flex flex-col bg-white border-l border-slate-200 shadow-xl"
      aria-label={`Asset detail: ${asset.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-100">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
            {asset.department_code} · {asset.system_type}
          </p>
          <h2 className="text-base font-bold text-slate-900 leading-tight">{asset.name}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{asset.facility_asset_id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status badge */}
      <div className="px-4 pt-3 pb-2">
        <span className={[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
          STATUS_COLOR[status],
        ].join(' ')}>
          <span className={['h-1.5 w-1.5 rounded-full', STATUS_DOT[status]].join(' ')} />
          {status.replace('_', ' ')}
        </span>
        {liveStatus && liveStatus !== asset.status && (
          <span className="ml-2 text-xs text-blue-600 font-medium">· Live update</span>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Manufacturer / model */}
        {(asset.manufacturer || asset.model) && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Equipment</p>
            <div className="space-y-1 text-sm">
              {asset.manufacturer && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Manufacturer</span>
                  <span className="text-slate-800 font-medium">{asset.manufacturer}</span>
                </div>
              )}
              {asset.model && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Model</span>
                  <span className="text-slate-800 font-medium">{asset.model}</span>
                </div>
              )}
              {asset.serial_number && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Serial</span>
                  <span className="text-slate-800 font-mono text-xs">{asset.serial_number}</span>
                </div>
              )}
              {asset.year_installed && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Installed</span>
                  <span className="text-slate-800">{asset.year_installed}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Meter */}
        {asset.current_meter_value !== undefined && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Meter</p>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
              <span className="text-2xl font-bold text-slate-800 tabular-nums">
                {asset.current_meter_value.toLocaleString()}
              </span>
              <span className="ml-1.5 text-sm text-slate-500">{asset.meter_unit}</span>
            </div>
          </section>
        )}

        {/* Location */}
        {asset.location_notes && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Location</p>
            <p className="text-sm text-slate-700">{asset.location_notes}</p>
          </section>
        )}

        {/* Dependencies */}
        {(dependsOnAssets?.length || feedsAssets?.length || dependentsAssets?.length) && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Dependencies</p>
            <div className="space-y-2">
              {dependsOnAssets?.map((dep) => (
                <div key={dep.id} className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-red-800 truncate">{dep.name}</p>
                    <p className="text-xs text-red-600">Depends on (mechanical)</p>
                  </div>
                  <span className={['h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT[dep.status]].join(' ')} />
                </div>
              ))}
              {feedsAssets?.map((fed) => (
                <div key={fed.id} className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-blue-800 truncate">{fed.name}</p>
                    <p className="text-xs text-blue-600">Feeds (output)</p>
                  </div>
                  <span className={['h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT[fed.status]].join(' ')} />
                </div>
              ))}
              {dependentsAssets?.map((dep) => (
                <div key={dep.id} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-700 truncate">{dep.name}</p>
                    <p className="text-xs text-slate-500">Depends on this</p>
                  </div>
                  <span className={['h-1.5 w-1.5 rounded-full shrink-0', STATUS_DOT[dep.status]].join(' ')} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t border-slate-100 p-4 space-y-2">
        <Link
          href={`/assets/${asset.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Asset Detail
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/work-orders/new?asset_id=${asset.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Work Order
          </Link>
          <Link
            href={`/pm/new?asset_id=${asset.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            PM Schedule
          </Link>
        </div>
      </div>
    </aside>
  )
}
