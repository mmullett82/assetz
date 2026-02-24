'use client'

import { Trash2 } from 'lucide-react'
import type {
  AssetPin,
  BuilderFloor,
  BuilderLabel,
  BuilderWall,
  BuilderZone,
  SelectedItem,
} from '@/lib/builder-state'
import type { Asset } from '@/types'

const ZONE_COLORS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899',
]

interface PropertiesPanelProps {
  selected:      SelectedItem | null
  floor:         BuilderFloor
  assets:        Asset[]
  onFloorChange: (next: BuilderFloor) => void
  onDeselect:    () => void
}

export default function PropertiesPanel({
  selected,
  floor,
  assets,
  onFloorChange,
  onDeselect,
}: PropertiesPanelProps) {

  if (!selected) {
    return (
      <div className="w-64 shrink-0 border-l border-slate-200 bg-white flex flex-col items-center justify-center text-center px-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          Select an item on the canvas to edit its properties.
        </p>
      </div>
    )
  }

  // ── Zone properties ────────────────────────────────────────────────────────
  if (selected.kind === 'zone') {
    const zoneId = selected.id
    const zone = floor.zones.find((z) => z.id === zoneId)
    if (!zone) return null

    function updateZone(patch: Partial<BuilderZone>) {
      onFloorChange({
        ...floor,
        zones: floor.zones.map((z) => z.id === zoneId ? { ...z, ...patch } : z),
      })
    }
    function deleteZone() {
      onFloorChange({ ...floor, zones: floor.zones.filter((z) => z.id !== zoneId) })
      onDeselect()
    }

    return (
      <Panel title="Zone">
        <Field label="Name">
          <input
            value={zone.name}
            onChange={(e) => updateZone({ name: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>
        <Field label="Color">
          <div className="flex flex-wrap gap-1.5">
            {ZONE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateZone({ color: c })}
                className={[
                  'h-6 w-6 rounded-full border-2 transition-all',
                  zone.color === c ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105',
                ].join(' ')}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </Field>
        <Field label="Vertices">
          <span className="text-sm text-slate-500">{zone.points.length}</span>
        </Field>
        <DeleteBtn onClick={deleteZone} label="Remove zone" />
      </Panel>
    )
  }

  // ── Wall properties ────────────────────────────────────────────────────────
  if (selected.kind === 'wall') {
    const wallId = selected.id
    const wall = floor.walls.find((w) => w.id === wallId)
    if (!wall) return null

    function updateWall(patch: Partial<BuilderWall>) {
      onFloorChange({
        ...floor,
        walls: floor.walls.map((w) => w.id === wallId ? { ...w, ...patch } : w),
      })
    }
    function deleteWall() {
      onFloorChange({ ...floor, walls: floor.walls.filter((w) => w.id !== wallId) })
      onDeselect()
    }

    return (
      <Panel title="Wall">
        <Field label="Style">
          <div className="flex gap-1.5">
            {(['solid', 'dashed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateWall({ style: s })}
                className={[
                  'flex-1 py-1 text-xs rounded-md border transition-colors capitalize',
                  wall.style === s
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Points">
          <span className="text-sm text-slate-500">{wall.points.length}</span>
        </Field>
        <DeleteBtn onClick={deleteWall} label="Remove wall" />
      </Panel>
    )
  }

  // ── Flow properties ────────────────────────────────────────────────────────
  if (selected.kind === 'flow') {
    const flowId = selected.id
    const flow = floor.flows.find((f) => f.id === flowId)
    if (!flow) return null

    function updateFlow(patch: { label?: string }) {
      onFloorChange({
        ...floor,
        flows: floor.flows.map((f) => f.id === flowId ? { ...f, ...patch } : f),
      })
    }
    function deleteFlow() {
      onFloorChange({ ...floor, flows: floor.flows.filter((f) => f.id !== flowId) })
      onDeselect()
    }

    return (
      <Panel title="Flow Arrow">
        <Field label="Label (optional)">
          <input
            value={flow.label ?? ''}
            onChange={(e) => updateFlow({ label: e.target.value })}
            placeholder="e.g. Material flow"
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>
        <Field label="Points">
          <span className="text-sm text-slate-500">{flow.points.length}</span>
        </Field>
        <DeleteBtn onClick={deleteFlow} label="Remove flow" />
      </Panel>
    )
  }

  // ── Label properties ───────────────────────────────────────────────────────
  if (selected.kind === 'label') {
    const labelId = selected.id
    const label = floor.labels.find((l) => l.id === labelId)
    if (!label) return null

    function updateLabel(patch: Partial<BuilderLabel>) {
      onFloorChange({
        ...floor,
        labels: floor.labels.map((l) => l.id === labelId ? { ...l, ...patch } : l),
      })
    }
    function deleteLabel() {
      onFloorChange({ ...floor, labels: floor.labels.filter((l) => l.id !== labelId) })
      onDeselect()
    }

    return (
      <Panel title="Label">
        <Field label="Text">
          <input
            value={label.text}
            onChange={(e) => updateLabel({ text: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Field>
        <Field label={`Font size (${label.fontSize}px)`}>
          <input
            type="range"
            min={12} max={32} step={1}
            value={label.fontSize}
            onChange={(e) => updateLabel({ fontSize: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </Field>
        <DeleteBtn onClick={deleteLabel} label="Remove label" />
      </Panel>
    )
  }

  // ── Pin properties ─────────────────────────────────────────────────────────
  if (selected.kind === 'pin') {
    const pinAssetId = selected.assetId
    const pin = floor.pins.find((p) => p.assetId === pinAssetId)
    if (!pin) return null
    const asset = assets.find((a) => a.id === pin.assetId)

    function updatePin(patch: Partial<AssetPin>) {
      onFloorChange({
        ...floor,
        pins: floor.pins.map((p) => p.assetId === pinAssetId ? { ...p, ...patch } : p),
      })
    }
    function removePin() {
      onFloorChange({ ...floor, pins: floor.pins.filter((p) => p.assetId !== pinAssetId) })
      onDeselect()
    }

    return (
      <Panel title="Asset Pin">
        <Field label="Asset">
          <span className="text-sm font-medium text-slate-700">{asset?.name ?? pin.assetId}</span>
        </Field>
        <Field label="Shape">
          <div className="flex gap-1.5">
            {(['circle', 'diamond', 'square'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updatePin({ shape: s })}
                className={[
                  'flex-1 py-1 text-xs rounded-md border transition-colors capitalize',
                  pin.shape === s
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Size">
          <div className="flex gap-1.5">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updatePin({ size: s })}
                className={[
                  'flex-1 py-1 text-xs rounded-md border transition-colors uppercase',
                  pin.size === s
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
        <DeleteBtn onClick={removePin} label="Remove from map" />
      </Panel>
    )
  }

  return null
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-64 shrink-0 border-l border-slate-200 bg-white flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  )
}

function DeleteBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="mt-auto pt-2">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 w-full justify-center text-xs text-red-600 hover:text-red-700 py-1.5 rounded-md hover:bg-red-50 border border-red-200 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {label}
      </button>
    </div>
  )
}
