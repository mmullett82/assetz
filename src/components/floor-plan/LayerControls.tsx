'use client'

import { Layers } from 'lucide-react'
import { useState } from 'react'

export interface LayerState {
  structure:    boolean
  grid:         boolean
  equipment:    boolean
  storage:      boolean
  aisles:       boolean
  labels:       boolean
  maintenance:  boolean
  phase2:       boolean
}

interface LayerControlsProps {
  layers: LayerState
  onChange: (layers: LayerState) => void
}

const LAYER_DEFS: { key: keyof LayerState; label: string }[] = [
  { key: 'structure',    label: 'Building Structure' },
  { key: 'grid',         label: 'Column Grid' },
  { key: 'equipment',    label: 'Assets' },
  { key: 'storage',      label: 'Storage & Racking' },
  { key: 'aisles',       label: 'Aisles & Transport' },
  { key: 'labels',       label: 'Department Labels' },
  { key: 'maintenance',  label: 'Active Maintenance' },
  { key: 'phase2',       label: 'Phase 2 Layout' },
]

export default function LayerControls({ layers, onChange }: LayerControlsProps) {
  const [open, setOpen] = useState(false)

  const toggle = (key: keyof LayerState) => {
    onChange({ ...layers, [key]: !layers[key] })
  }

  return (
    <div className="absolute top-3 left-3 z-20">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={[
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm border transition-colors',
          open
            ? 'bg-slate-800 text-white border-slate-700'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
        ].join(' ')}
        aria-label="Toggle layer controls"
      >
        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
        Layers
      </button>

      {open && (
        <div className="mt-1.5 w-48 rounded-xl border border-slate-200 bg-white shadow-lg p-2 space-y-0.5">
          {LAYER_DEFS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={() => toggle(key)}
                className="accent-blue-600 h-3.5 w-3.5"
              />
              <span className="text-xs text-slate-700">{label}</span>
              {key === 'phase2' && layers.phase2 && (
                <span className="ml-auto text-[10px] text-blue-600 font-medium">ON</span>
              )}
              {key === 'maintenance' && layers.maintenance && (
                <span className="ml-auto text-[10px] text-yellow-600 font-medium">ON</span>
              )}
            </label>
          ))}

          <div className="pt-1 mt-1 border-t border-slate-100">
            <p className="px-2 text-[10px] text-slate-400 leading-tight">
              Phase 2 shows future layout overlay
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
