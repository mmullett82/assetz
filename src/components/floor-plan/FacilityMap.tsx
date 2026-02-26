'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { dxfToSvg, SVG_W, SVG_H, SCALE } from '@/lib/floor-plan-transform'
import { ZONES, GRID_COLS, GRID_ROWS, type Zone } from '@/data/floor-plan/sollid-building'
import LayerControls, { type LayerState } from './LayerControls'
import EquipmentFootprint from './EquipmentFootprint'
import DepartmentZone from './DepartmentZone'
import type { DxfAsset } from './DxfAssetPanel'

// Canvas background — dark navy for maximum contrast
const CANVAS_BG = '#0f172a'

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
    zones:        true,
    maintenance:  true,
    phase2:       false,
  })

  useEffect(() => {
    Promise.all([
      fetch('/data/sollid-assets.json').then(r => r.json()),
      fetch('/data/sollid-blueprint.svg').then(r => r.text()),
    ]).then(([assets, svgText]: [FloorData, string]) => {
      setFloorData(assets)
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
      zones:     ['layer-aisles'],
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

  // Build blockName → DxfAsset[] map
  const machineToAssets = new Map<string, DxfAsset[]>()
  for (const pin of allPins) {
    if (!pin.nearestMachine) continue
    const arr = machineToAssets.get(pin.nearestMachine) ?? []
    arr.push(pin)
    machineToAssets.set(pin.nearestMachine, arr)
  }

  // Current + Phase 2 equipment (Phase 2 OVERLAYS, doesn't replace)
  const currentFootprints = allFootprints.filter(f => f.layer === 'Machines')
  const phase2Footprints = allFootprints.filter(f => f.layer === 'Phase2')

  // Active zone for filtering
  const activeZoneData = activeZone ? ZONES.find(z => z.id === activeZone) : null

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden select-none" style={{ backgroundColor: CANVAS_BG }}>

      <LayerControls layers={layers} onChange={setLayers} />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-30" style={{ backgroundColor: 'rgba(15,23,42,0.9)' }}>
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
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
            style={{ display: 'block', background: CANVAS_BG }}
          >
            {/* 1. Dark canvas background */}
            <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={CANVAS_BG} />

            {/* 2. Blueprint SVG layers */}
            {blueprintSvg && (
              <g
                ref={blueprintRef}
                dangerouslySetInnerHTML={{ __html: blueprintSvg }}
              />
            )}

            {/* 3. Column grid lines + numbers */}
            {layers.grid && (
              <>
                {GRID_COLS.map((col, i) => {
                  const [svgX] = dxfToSvg(col.x, 0)
                  if (svgX < -2 || svgX > SVG_W + 2) return null
                  return (
                    <g key={`col-${i}`}>
                      <line
                        x1={svgX} y1={0}
                        x2={svgX} y2={SVG_H}
                        stroke="#334155"
                        strokeWidth={0.5}
                        strokeDasharray="3 7"
                      />
                      <text
                        x={svgX + 3}
                        y={14}
                        fontSize={12}
                        fill="#94a3b8"
                        fontFamily="monospace"
                        fontWeight="600"
                        style={{ userSelect: 'none' }}
                      >
                        {col.label}
                      </text>
                    </g>
                  )
                })}
                {/* Row grid lines + letters */}
                {GRID_ROWS.map((row, i) => {
                  const [, svgY] = dxfToSvg(0, row.y)
                  if (svgY < -2 || svgY > SVG_H + 2) return null
                  return (
                    <g key={`row-${i}`}>
                      <line
                        x1={0} y1={svgY}
                        x2={SVG_W} y2={svgY}
                        stroke="#334155"
                        strokeWidth={0.5}
                        strokeDasharray="3 7"
                      />
                      <text
                        x={5}
                        y={svgY - 3}
                        fontSize={12}
                        fill="#94a3b8"
                        fontFamily="monospace"
                        fontWeight="600"
                        style={{ userSelect: 'none' }}
                      >
                        {row.label}
                      </text>
                    </g>
                  )
                })}
              </>
            )}

            {/* 4. Department zones — always-visible dashed boundaries, no click highlight */}
            {layers.zones && ZONES.map(zone => (
              <DepartmentZone
                key={zone.id}
                zone={zone}
                isActive={activeZone === zone.id}
                onClick={handleZoneClick}
              />
            ))}

            {/* 5. Current equipment — bright cyan, ALWAYS rendered */}
            {layers.equipment && currentFootprints.map(fp => {
              const assets = machineToAssets.get(fp.blockName) ?? []
              const firstAsset = assets[0]
              const status = firstAsset?.status ?? 'decommissioned'

              const inActiveZone = !activeZoneData || isInZone(fp.x, fp.y, activeZoneData)
              const matchesFilter = !statusFilter || status === statusFilter

              return (
                <EquipmentFootprint
                  key={fp.id}
                  footprint={fp}
                  asset={firstAsset ?? null}
                  status={status}
                  isSelected={!!firstAsset && selectedPinNumber === firstAsset.assetNumber}
                  dimmed={(!matchesFilter || !inActiveZone)}
                  showLabel={layers.zones}
                  showMaintenance={layers.maintenance}
                  onClick={() => {
                    if (firstAsset) onSelectPin?.(firstAsset)
                  }}
                />
              )
            })}

            {/* 6. Phase 2 equipment OVERLAY — emerald green dashed, on top */}
            {layers.phase2 && phase2Footprints.map(fp => (
              <EquipmentFootprint
                key={fp.id}
                footprint={fp}
                asset={null}
                status="decommissioned"
                isSelected={false}
                dimmed={false}
                isPhase2
                showLabel={layers.zones}
                showMaintenance={false}
                onClick={() => {}}
              />
            ))}

            {/* Scale bar */}
            <g transform={`translate(${SVG_W - 130}, ${SVG_H - 18})`}>
              <line x1={0} y1={0} x2={100} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
              <line x1={0} y1={-4} x2={0} y2={4} stroke="#94a3b8" strokeWidth={1.5} />
              <line x1={100} y1={-4} x2={100} y2={4} stroke="#94a3b8" strokeWidth={1.5} />
              <text x={50} y={-5} textAnchor="middle" fontSize={7} fill="#94a3b8" fontFamily="monospace" style={{ userSelect: 'none' }}>
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
