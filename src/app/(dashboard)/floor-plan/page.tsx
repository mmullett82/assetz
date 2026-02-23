'use client'

import { useState, useCallback } from 'react'
import { Map, Wifi, WifiOff } from 'lucide-react'
import type { Asset, AssetStatus } from '@/types'
import { MOCK_ASSETS } from '@/lib/mock-data'
import { useWebSocket } from '@/hooks/useWebSocket'
import FloorPlanViewer from '@/components/floor-plan/FloorPlanViewer'
import AssetDetailPanel from '@/components/floor-plan/AssetDetailPanel'

type StatusFilter = AssetStatus | ''

function statusCount(assets: Asset[], statuses: Record<string, AssetStatus>, status: AssetStatus) {
  return assets.filter((a) => (statuses[a.id] ?? a.status) === status).length
}

export default function FloorPlanPage() {
  const assets = MOCK_ASSETS   // TODO: swap for useAssets() once backend is live

  const [liveStatuses, setLiveStatuses] = useState<Record<string, AssetStatus>>({})
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [showFeeds,    setShowFeeds]    = useState(true)
  const [showDepends,  setShowDepends]  = useState(true)

  useWebSocket<{ asset_id: string; status: AssetStatus }>(
    'asset.status_changed',
    useCallback((evt) => {
      setLiveStatuses((prev) => ({ ...prev, [evt.payload.asset_id]: evt.payload.status }))
    }, [])
  )

  const wsConnected  = false  // TODO: expose from wsManager when backend is live
  const selectedAsset = selectedId ? assets.find((a) => a.id === selectedId) ?? null : null

  const downCount        = statusCount(assets, liveStatuses, 'down')
  const maintenanceCount = statusCount(assets, liveStatuses, 'maintenance')
  const operationalCount = statusCount(assets, liveStatuses, 'operational')

  const STATUS_CHIPS: { value: StatusFilter; label: string; dot: string }[] = [
    { value: '',            label: `All (${assets.length})`,            dot: 'bg-slate-400'  },
    { value: 'operational', label: `Operational (${operationalCount})`, dot: 'bg-green-500'  },
    { value: 'maintenance', label: `Maintenance (${maintenanceCount})`, dot: 'bg-yellow-500' },
    { value: 'down',        label: `Down (${downCount})`,               dot: 'bg-red-500'    },
  ]

  return (
    <div className="-m-4 sm:-m-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 py-3 shrink-0">

        <div className="flex items-center gap-2 mr-2">
          <Map className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <h1 className="text-sm font-bold text-slate-900">Floor Plan</h1>
          <span className="hidden sm:inline text-xs text-slate-400">— SOLLiD Cabinetry, Main Plant B1</span>
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setStatusFilter(chip.value)}
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                statusFilter === chip.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              <span className={['h-1.5 w-1.5 rounded-full', chip.dot].join(' ')} />
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Line toggles */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFeeds}
              onChange={(e) => setShowFeeds(e.target.checked)}
              className="accent-blue-600"
            />
            <span className="text-slate-600">Feeds</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDepends}
              onChange={(e) => setShowDepends(e.target.checked)}
              className="accent-red-600"
            />
            <span className="text-slate-600">Depends On</span>
          </label>
        </div>

        {/* Live / mock indicator */}
        <div className={[
          'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
          wsConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500',
        ].join(' ')}>
          {wsConnected
            ? <><Wifi className="h-3 w-3" aria-hidden="true" /> Live</>
            : <><WifiOff className="h-3 w-3" aria-hidden="true" /> Mock</>
          }
        </div>
      </div>

      {/* Canvas + detail panel */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* SVG viewer */}
        <div className="flex-1 min-w-0 p-3">
          <FloorPlanViewer
            assets={assets}
            liveStatuses={liveStatuses}
            selectedId={selectedId}
            statusFilter={statusFilter}
            showFeeds={showFeeds}
            showDepends={showDepends}
            onSelect={setSelectedId}
          />
        </div>

        {/* Detail panel — fixed to right side of canvas area */}
        {selectedAsset && (
          <AssetDetailPanel
            asset={selectedAsset}
            liveStatus={liveStatuses[selectedAsset.id]}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* Legend bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-slate-200 bg-white px-4 sm:px-6 py-2 shrink-0 text-xs text-slate-500">
        <span className="font-semibold text-slate-400 uppercase tracking-wide">Legend</span>

        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
          Operational
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 shrink-0" />
          Maintenance
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
          Down
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shrink-0" />
          Decommissioned
        </div>

        <span className="hidden sm:inline h-3.5 w-px bg-slate-200" />

        <div className="hidden sm:flex items-center gap-1.5">
          {/* Dashed blue = feeds */}
          <svg width="26" height="6" aria-hidden="true" className="shrink-0 overflow-visible">
            <defs>
              <marker id="l-feeds" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L5,2.5 z" fill="#3b82f6" />
              </marker>
            </defs>
            <line x1="0" y1="3" x2="20" y2="3" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#l-feeds)" />
          </svg>
          Feeds
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          {/* Solid red = depends on */}
          <svg width="26" height="6" aria-hidden="true" className="shrink-0 overflow-visible">
            <defs>
              <marker id="l-depends" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L5,2.5 z" fill="#ef4444" />
              </marker>
            </defs>
            <line x1="0" y1="3" x2="20" y2="3" stroke="#ef4444" strokeWidth="2" markerEnd="url(#l-depends)" />
          </svg>
          Depends On
        </div>

        <span className="ml-auto hidden md:inline text-slate-400">
          Scroll to zoom · Drag to pan · Click asset to select
        </span>
      </div>
    </div>
  )
}
