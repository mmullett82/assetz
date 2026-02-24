'use client'

import { Layers } from 'lucide-react'
import { useState } from 'react'

export interface LayerState {
  zones: boolean
  equipment: boolean
  pins: boolean
  grid: boolean
  phase2: boolean
  labels: boolean
}

interface LayerControlsProps {
  layers: LayerState
  onChange: (layers: LayerState) => void
}

const LAYER_DEFS: { key: keyof LayerState; label: string }[] = [
  { key: 'zones',     label: 'Department Zones' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'pins',      label: 'Asset Pins' },
  { key: 'grid',      label: 'Column Grid' },
  { key: 'labels',    label: 'Labels' },
  { key: 'phase2',    label: 'Phase 2 Layout' },
]

export default function LayerControls({ layers, onChange }: LayerControlsProps) {
  const [open, setOpen] = useState(false)

  const toggle = (key: keyof LayerState) => {
    // Phase2 and equipment are mutually exclusive for footprints
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
        <div className="mt-1.5 w-44 rounded-xl border border-slate-200 bg-white shadow-lg p-2 space-y-0.5">
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
                <span className="ml-auto text-[10px] text-amber-600 font-medium">ON</span>
              )}
            </label>
          ))}

          <div className="pt-1 mt-1 border-t border-slate-100">
            <p className="px-2 text-[10px] text-slate-400 leading-tight">
              Phase 2 replaces current equipment with future layout
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
