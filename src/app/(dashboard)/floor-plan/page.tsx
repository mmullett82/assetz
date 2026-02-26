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
    { value: 'maintenance', label: 'Maintenance',   dot: 'bg-amber-500'  },
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
        <div className="flex-1 min-w-0 p-2">
          <FacilityMap
            statusFilter={statusFilter}
            selectedPinNumber={selectedPin?.assetNumber ?? null}
            onSelectPin={(pin) => setSelectedPin(
              pin?.assetNumber === selectedPin?.assetNumber ? null : pin
            )}
          />
        </div>

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

        <div className="hidden sm:flex items-center gap-1.5">
          <svg width="20" height="10" className="shrink-0">
            <line x1="0" y1="5" x2="20" y2="5" stroke="#e2e8f0" strokeWidth="2" />
          </svg>
          Walls
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <svg width="20" height="10" className="shrink-0">
            <rect x="1" y="1" width="18" height="8" fill="none" stroke="#06b6d4" strokeWidth="1.2" />
          </svg>
          Equipment
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <svg width="20" height="10" className="shrink-0">
            <rect x="1" y="1" width="18" height="8" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 3" />
          </svg>
          Dept Zone
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <svg width="20" height="10" className="shrink-0">
            <rect x="1" y="1" width="18" height="8" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" />
          </svg>
          Phase 2
        </div>

        <span className="hidden sm:inline h-3.5 w-px bg-slate-200" />

        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
          Operational
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
          PM Due
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
          Down
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="16" className="shrink-0">
            <circle cx="8" cy="8" r="4" fill="#f59e0b" />
            <circle cx="8" cy="8" r="6" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.5" />
          </svg>
          Active Maint.
        </div>

        <span className="ml-auto hidden md:inline text-slate-400">
          Scroll to zoom · Drag to pan · Click equipment to select · Click zone to filter
        </span>
      </div>
    </div>
  )
}
