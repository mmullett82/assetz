'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { dxfToSvg, SVG_W, SVG_H, SCALE } from '@/lib/floor-plan-transform'
import { ZONES, GRID_COLS, type Zone } from '@/data/floor-plan/sollid-building'
import LayerControls, { type LayerState } from './LayerControls'
import EquipmentFootprint from './EquipmentFootprint'
import DepartmentZone from './DepartmentZone'
import type { DxfAsset } from './DxfAssetPanel'

// ─── Asset data types (from public/data/sollid-assets.json) ───────────────────

interface MachineFootprint {
  id: string
  blockName: string
  displayName: string
  equipmentType: string
  x: number
  y: number
  rotation: number
  hw: number
  hh: number
  layer: 'Machines' | 'Phase2'
}

interface FloorData {
  assetPins: DxfAsset[]
  machineFootprints: MachineFootprint[]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FacilityMapProps {
  statusFilter?: string
  selectedPinNumber?: string | null
  onSelectPin?: (asset: DxfAsset | null) => void
}

export default function FacilityMap({
  statusFilter = '',
  selectedPinNumber,
  onSelectPin,
}: FacilityMapProps) {
  const [floorData, setFloorData] = useState<FloorData | null>(null)
  const [blueprintSvg, setBlueprintSvg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const blueprintRef = useRef<SVGGElement>(null)
  const [layers, setLayers] = useState<LayerState>({
    structure:    true,
    grid:         true,
    equipment:    true,
    storage:      true,
    aisles:       true,
    labels:       true,
    maintenance:  true,
    phase2:       false,
  })

  useEffect(() => {
    Promise.all([
      fetch('/data/sollid-assets.json').then(r => r.json()),
      fetch('/data/sollid-blueprint.svg').then(r => r.text()),
    ]).then(([assets, svgText]: [FloorData, string]) => {
      setFloorData(assets)
      // Strip outer <svg> tags, keep inner content
      const inner = svgText
        .replace(/^<svg[^>]*>/, '')
        .replace(/<\/svg>\s*$/, '')
      setBlueprintSvg(inner)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Toggle layer visibility via DOM refs on the blueprint SVG groups
  useEffect(() => {
    const g = blueprintRef.current
    if (!g) return

    const layerMap: Record<string, string[]> = {
      structure: ['layer-building'],
      storage:   ['layer-storage', 'layer-workbenches'],
      aisles:    ['layer-aisles'],
      equipment: ['layer-machines'],
      phase2:    ['layer-phase2'],
    }

    for (const [key, ids] of Object.entries(layerMap)) {
      const visible = layers[key as keyof LayerState]
      for (const id of ids) {
        const el = g.querySelector(`#${id}`)
        if (el) (el as SVGElement).style.display = visible ? '' : 'none'
      }
    }
  }, [layers, blueprintSvg])

  const handleZoneClick = useCallback((zoneId: string) => {
    setActiveZone(prev => prev === zoneId ? null : zoneId)
  }, [])

  if (!floorData && !loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Failed to load floor plan data.
      </div>
    )
  }

  const allFootprints = floorData?.machineFootprints ?? []
  const allPins = floorData?.assetPins ?? []

  // Build blockName → DxfAsset[] map for click handling
  const machineToAssets = new Map<string, DxfAsset[]>()
  for (const pin of allPins) {
    if (!pin.nearestMachine) continue
    const arr = machineToAssets.get(pin.nearestMachine) ?? []
    arr.push(pin)
    machineToAssets.set(pin.nearestMachine, arr)
  }

  // Show Phase2 or current Machines layer footprints
  const footprints = allFootprints.filter(f =>
    layers.phase2 ? f.layer === 'Phase2' : f.layer === 'Machines'
  )

  // Get active zone bounds for filtering
  const activeZoneData = activeZone ? ZONES.find(z => z.id === activeZone) : null

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-lg overflow-hidden select-none">

      <LayerControls layers={layers} onChange={setLayers} />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-30">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-sm">Loading floor plan…</span>
          </div>
        </div>
      )}

      <TransformWrapper
        initialScale={0.65}
        minScale={0.15}
        maxScale={8}
        centerOnInit
        limitToBounds={false}
        wheel={{ step: 0.08 }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ display: 'block' }}
        >
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W}
            height={SVG_H}
            style={{ display: 'block', background: 'white' }}
          >
            {/* 1. White background */}
            <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

            {/* 2. Blueprint SVG layers (building, aisles, storage, workbenches, machines, phase2) */}
            {blueprintSvg && (
              <g
                ref={blueprintRef}
                dangerouslySetInnerHTML={{ __html: blueprintSvg }}
              />
            )}

            {/* 3. Column grid (React-rendered) */}
            {layers.grid && GRID_COLS.map((col, i) => {
              const [svgX] = dxfToSvg(col.x, 0)
              if (svgX < -2 || svgX > SVG_W + 2) return null
              return (
                <g key={i}>
                  <line
                    x1={svgX} y1={0}
                    x2={svgX} y2={SVG_H}
                    stroke="#cbd5e1"
                    strokeWidth={0.4}
                    strokeDasharray="3 7"
                  />
                  <text
                    x={svgX + 2}
                    y={8}
                    fontSize={6}
                    fill="#94a3b8"
                    style={{ userSelect: 'none' }}
                  >
                    {col.label}
                  </text>
                </g>
              )
            })}

            {/* 4. Department zones (invisible until hovered/clicked) */}
            {layers.labels && ZONES.map(zone => (
              <DepartmentZone
                key={zone.id}
                zone={zone}
                isActive={activeZone === zone.id}
                onClick={handleZoneClick}
              />
            ))}

            {/* 5. Equipment footprints (status LED, clickable) */}
            {layers.equipment && footprints.map(fp => {
              const assets = machineToAssets.get(fp.blockName) ?? []
              const firstAsset = assets[0]
              const status = firstAsset?.status ?? 'decommissioned'

              // Determine if this footprint is in the active zone
              const inActiveZone = !activeZoneData || isInZone(fp.x, fp.y, activeZoneData)
              // Determine if status-filtered
              const matchesFilter = !statusFilter || status === statusFilter

              return (
                <EquipmentFootprint
                  key={fp.id}
                  footprint={fp}
                  asset={firstAsset ?? null}
                  status={status}
                  isSelected={!!firstAsset && selectedPinNumber === firstAsset.assetNumber}
                  dimmed={(!matchesFilter || !inActiveZone)}
                  showLabel={layers.labels}
                  showMaintenance={layers.maintenance}
                  onClick={() => {
                    if (firstAsset) onSelectPin?.(firstAsset)
                  }}
                />
              )
            })}

            {/* Scale bar: bottom-right, 500" = 100px */}
            <g transform={`translate(${SVG_W - 130}, ${SVG_H - 18})`}>
              <line x1={0} y1={0} x2={100} y2={0} stroke="#64748b" strokeWidth={1.5} />
              <line x1={0} y1={-4} x2={0} y2={4} stroke="#64748b" strokeWidth={1.5} />
              <line x1={100} y1={-4} x2={100} y2={4} stroke="#64748b" strokeWidth={1.5} />
              <text x={50} y={-5} textAnchor="middle" fontSize={6} fill="#64748b" style={{ userSelect: 'none' }}>
                500&quot; (41&apos;-8&quot;)
              </text>
            </g>

          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isInZone(x: number, y: number, zone: Zone): boolean {
  return x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2
}
