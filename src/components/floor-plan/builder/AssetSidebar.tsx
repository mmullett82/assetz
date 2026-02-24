'use client'

import { useState } from 'react'
import { Search, FileUp } from 'lucide-react'
import type { Asset } from '@/types'
import type { AssetPin, BuilderFloor } from '@/lib/builder-state'

// Category → accent color (matches mock data system_type values)
const CATEGORY_COLORS: Record<string, string> = {
  CNC:  '#8b5cf6',
  EDGE: '#3b82f6',
  SPRAY:'#ec4899',
  AIR:  '#10b981',
  DUST: '#f59e0b',
  JOIN: '#f97316',
}

function categoryColor(asset: Asset): string {
  const st = (asset.system_type ?? '').toUpperCase().slice(0, 4)
  return CATEGORY_COLORS[st] ?? '#64748b'
}

interface AssetSidebarProps {
  assets:       Asset[]
  floor:        BuilderFloor
  onCSVImport:  () => void
}

export default function AssetSidebar({ assets, floor, onCSVImport }: AssetSidebarProps) {
  const [q, setQ] = useState('')

  const placed = new Set<string>(floor.pins.map((p: AssetPin) => p.assetId))

  const filtered = assets.filter((a) =>
    !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col min-h-0">

      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-100 shrink-0">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Assets</p>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search assets…"
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto py-1">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 px-3 py-4 text-center">No assets found</p>
        )}
        {filtered.map((asset) => {
          const isPlaced = placed.has(asset.id)
          return (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('assetId', asset.id)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              className={[
                'flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing',
                'text-xs hover:bg-slate-50 transition-colors select-none',
                isPlaced ? 'opacity-50' : '',
              ].join(' ')}
              title={isPlaced ? `${asset.name} — already on map` : `Drag to place ${asset.name}`}
            >
              {/* Color dot */}
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: categoryColor(asset) }}
              />
              <span className="flex-1 truncate text-slate-700 font-medium">{asset.name}</span>
              {isPlaced && (
                <span className="text-slate-400 text-[10px] shrink-0">on map</span>
              )}
            </div>
          )
        })}
      </div>

      {/* CSV import footer */}
      <div className="border-t border-slate-100 px-3 py-2 shrink-0">
        <button
          type="button"
          onClick={onCSVImport}
          className="flex items-center gap-1.5 w-full justify-center text-xs text-slate-500 hover:text-slate-700 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
        >
          <FileUp className="h-3.5 w-3.5" />
          Bulk CSV Import
        </button>
      </div>
    </div>
  )
}
