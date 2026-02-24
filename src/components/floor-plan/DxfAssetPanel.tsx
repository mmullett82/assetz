'use client'

import Link from 'next/link'
import { X, ExternalLink, ClipboardList, CalendarClock, MapPin, Cpu } from 'lucide-react'

export interface DxfAsset {
  assetNumber: string
  displayName: string
  equipmentType: string
  x: number
  y: number
  dxfLabel: string
  nearestMachine: string | null
  nearestMachineDist: number | null
  departmentZone: string
  status: 'operational' | 'maintenance' | 'down' | 'decommissioned'
  isNew: boolean
  isFuture: boolean
  notes: string
}

const STATUS_COLOR = {
  operational:    'bg-green-100 text-green-800',
  maintenance:    'bg-yellow-100 text-yellow-800',
  down:           'bg-red-100 text-red-800',
  decommissioned: 'bg-slate-100 text-slate-600',
}

const STATUS_DOT = {
  operational:    'bg-green-500',
  maintenance:    'bg-yellow-500',
  down:           'bg-red-500',
  decommissioned: 'bg-slate-400',
}

const EQUIP_LABELS: Record<string, string> = {
  cnc:         'CNC Router',
  panel_saw:   'Panel Saw',
  edge_bander: 'Edge Bander',
  boring:      'Boring / Drill',
  finishing:   'Finishing',
  conveyor:    'Conveyor',
  clamp:       'Clamp',
  press:       'Press',
  woodworking: 'Woodworking',
  sander:      'Sander',
  saw:         'Saw',
  utility:     'Utility',
  equipment:   'Equipment',
}

interface DxfAssetPanelProps {
  asset: DxfAsset
  onClose: () => void
}

export default function DxfAssetPanel({ asset, onClose }: DxfAssetPanelProps) {
  const status = asset.status

  return (
    <aside
      className="absolute inset-y-0 right-0 z-10 w-72 flex flex-col bg-white border-l border-slate-200 shadow-xl"
      aria-label={`Asset detail: ${asset.assetNumber}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-100">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
            Floor Plan Asset
          </p>
          <h2 className="text-lg font-bold text-slate-900 leading-tight font-mono">
            {asset.assetNumber}
          </h2>
          {asset.displayName && (
            <p className="text-xs text-slate-600 mt-0.5">{asset.displayName}</p>
          )}
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
      <div className="px-4 pt-3 pb-2 flex items-center gap-2">
        <span className={[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
          STATUS_COLOR[status],
        ].join(' ')}>
          <span className={['h-1.5 w-1.5 rounded-full', STATUS_DOT[status]].join(' ')} />
          {status.replace('_', ' ')}
        </span>
        {asset.isNew && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">New</span>
        )}
        {asset.isFuture && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Future</span>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

        {/* Equipment type */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Equipment</p>
          <div className="flex items-center gap-2 text-sm">
            <Cpu className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="text-slate-700">
              {EQUIP_LABELS[asset.equipmentType] ?? asset.equipmentType}
            </span>
          </div>
        </section>

        {/* Location on floor */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Location</p>
          <div className="space-y-1.5">
            {asset.departmentZone && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="text-slate-700">{asset.departmentZone}</span>
              </div>
            )}
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">DXF Coordinates</p>
              <p className="text-xs font-mono text-slate-700">
                X: {asset.x.toLocaleString()}&quot; · Y: {asset.y.toLocaleString()}&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Nearest machine */}
        {asset.nearestMachine && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Nearest Machine</p>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-xs font-mono text-slate-700">{asset.nearestMachine}</p>
              {asset.nearestMachineDist !== null && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {Math.round(asset.nearestMachineDist / 12)}&apos; away
                </p>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {asset.notes && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Notes</p>
            <p className="text-sm text-slate-700">{asset.notes}</p>
          </section>
        )}

        {/* Raw DXF label */}
        {asset.dxfLabel !== asset.assetNumber && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">DXF Label</p>
            <p className="text-xs font-mono text-slate-500">{asset.dxfLabel}</p>
          </section>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t border-slate-100 p-4 space-y-2">
        <Link
          href="/assets"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Find in Asset Registry
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/work-orders/new"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Work Order
          </Link>
          <Link
            href="/pm/new"
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
