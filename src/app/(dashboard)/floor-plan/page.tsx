'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Map, Wifi, WifiOff, Pencil } from 'lucide-react'
import FacilityMap from '@/components/floor-plan/FacilityMap'
import DxfAssetPanel, { type DxfAsset } from '@/components/floor-plan/DxfAssetPanel'

type StatusFilter = 'operational' | 'maintenance' | 'down' | 'decommissioned' | ''

export default function FloorPlanPage() {
  const [selectedPin, setSelectedPin] = useState<DxfAsset | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')

  const wsConnected = false  // TODO: wire when backend is live

  const STATUS_CHIPS: { value: StatusFilter; label: string; dot: string }[] = [
    { value: '',            label: 'All',           dot: 'bg-slate-400'  },
    { value: 'operational', label: 'Operational',   dot: 'bg-green-500'  },
    { value: 'maintenance', label: 'Maintenance',   dot: 'bg-yellow-500' },
    { value: 'down',        label: 'Down',          dot: 'bg-red-500'    },
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

        {/* Status filter chips */}
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

        {/* Edit Map button */}
        <Link
          href="/floor-plan/builder"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Map Builder
        </Link>
      </div>

      {/* Canvas + detail panel */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* DXF facility map */}
        <div className="flex-1 min-w-0 p-2">
          <FacilityMap
            statusFilter={statusFilter}
            selectedPinNumber={selectedPin?.assetNumber ?? null}
            onSelectPin={(pin) => setSelectedPin(
              pin?.assetNumber === selectedPin?.assetNumber ? null : pin
            )}
          />
        </div>

        {/* Asset detail panel */}
        {selectedPin && (
          <DxfAssetPanel
            asset={selectedPin}
            onClose={() => setSelectedPin(null)}
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
          <span className="h-3 w-5 rounded-sm bg-blue-100 border border-blue-300 shrink-0" />
          CNC
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm bg-yellow-100 border border-yellow-300 shrink-0" />
          Edge Bander
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm bg-orange-100 border border-orange-300 shrink-0" />
          Panel Saw
        </div>

        <span className="ml-auto hidden md:inline text-slate-400">
          Scroll to zoom · Drag to pan · Click pin to select · 107 DXF assets
        </span>
      </div>
    </div>
  )
}
