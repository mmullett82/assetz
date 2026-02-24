'use client'

import { useState, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { dxfToSvg, SVG_W, SVG_H, SCALE } from '@/lib/floor-plan-transform'
import { ZONES, GRID_COLS } from '@/data/floor-plan/sollid-building'
import AssetPin from './AssetPin'
import LayerControls, { type LayerState } from './LayerControls'
import type { DxfAsset } from './DxfAssetPanel'

// ─── Data types matching public/data/sollid-assets.json ───────────────────────

interface MachineFootprint {
  id: string
  blockName: string
  displayName: string
  equipmentType: string
  x: number
  y: number
  rotation: number
  hw: number   // half-width in DXF inches
  hh: number   // half-height in DXF inches
  layer: 'Machines' | 'Phase2'
}

interface FloorData {
  assetPins: DxfAsset[]
  machineFootprints: MachineFootprint[]
}

// ─── Status and equipment styling ──────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  operational:    '#22c55e',
  maintenance:    '#f59e0b',
  down:           '#ef4444',
  decommissioned: '#94a3b8',
}

const EQUIP_FILL: Record<string, string> = {
  cnc:         '#dbeafe',
  panel_saw:   '#ffedd5',
  edge_bander: '#fef9c3',
  boring:      '#ede9fe',
  finishing:   '#fee2e2',
  conveyor:    '#f1f5f9',
  clamp:       '#f1f5f9',
  press:       '#f0fdf4',
  woodworking: '#fef3c7',
  sander:      '#fef3c7',
  saw:         '#fef3c7',
  utility:     '#dcfce7',
  equipment:   '#f8fafc',
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
  const [data, setData] = useState<FloorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [layers, setLayers] = useState<LayerState>({
    zones:     true,
    equipment: true,
    pins:      true,
    grid:      true,
    phase2:    false,
    labels:    true,
  })
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)

  // Load floor data from public/data/sollid-assets.json
  useEffect(() => {
    fetch('/data/sollid-assets.json')
      .then(r => r.json())
      .then((d: FloorData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!data && !loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Failed to load floor plan data.
      </div>
    )
  }

  const pins = data?.assetPins ?? []
  const allFootprints = data?.machineFootprints ?? []

  // Show Phase2 or current Machines layer
  const footprints = allFootprints.filter(f =>
    layers.phase2 ? f.layer === 'Phase2' : f.layer === 'Machines'
  )

  // Apply status filter to pins
  const visiblePins = statusFilter
    ? pins.filter(p => p.status === statusFilter)
    : pins

  // ─── Machine footprint renderer ────────────────────────────────────────────

  const renderFootprint = (f: MachineFootprint) => {
    const [cx, cy] = dxfToSvg(f.x, f.y)
    const w = f.hw * 2 * SCALE
    const h = f.hh * 2 * SCALE
    const fill = EQUIP_FILL[f.equipmentType] ?? EQUIP_FILL.equipment
    const stroke = f.layer === 'Phase2' ? '#64748b' : '#475569'
    const opacity = f.layer === 'Phase2' ? 0.5 : 0.8
    // Negate rotation because SVG Y-axis is flipped relative to DXF
    const rot = -f.rotation

    return (
      <g key={f.id} transform={`rotate(${rot}, ${cx}, ${cy})`} opacity={opacity}>
        <rect
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          fill={fill}
          stroke={stroke}
          strokeWidth={0.6}
          rx={1}
        />
        {layers.labels && w > 25 && h > 14 && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(8, w / 7, h / 3.5)}
            fill="#334155"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {f.blockName.replace(/([A-Z])/g, ' $1').trim().slice(0, 18)}
          </text>
        )}
        <title>{f.displayName || f.blockName}{f.layer === 'Phase2' ? ' (Phase 2)' : ''}</title>
      </g>
    )
  }

  // ─── Zone renderer ──────────────────────────────────────────────────────────

  const renderZone = (zone: typeof ZONES[0]) => {
    // DXF y2 (north = high) → SVG y_top (small); DXF y1 (south = low) → SVG y_bot (large)
    const [svgX1, svgYTop] = dxfToSvg(zone.x1, zone.y2)
    const [svgX2, svgYBot] = dxfToSvg(zone.x2, zone.y1)
    const w = svgX2 - svgX1
    const h = svgYBot - svgYTop

    return (
      <g key={zone.id}>
        <rect
          x={svgX1}
          y={svgYTop}
          width={w}
          height={h}
          fill={zone.fill}
          stroke={zone.stroke}
          strokeWidth={0.75}
        />
        {layers.labels && w > 55 && h > 18 && (
          <text
            x={svgX1 + w / 2}
            y={svgYTop + Math.min(h / 2, 16)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(10, w / 11, h / 3)}
            fontWeight="500"
            fill="#475569"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {zone.label}
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-lg overflow-hidden select-none">

      {/* Layer toggle */}
      <LayerControls layers={layers} onChange={setLayers} />

      {/* Loading overlay */}
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
            {/* Building outline */}
            <rect
              x={0} y={0}
              width={SVG_W} height={SVG_H}
              fill="white"
              stroke="#374151"
              strokeWidth={2}
            />

            {/* Department zones */}
            {layers.zones && ZONES.map(renderZone)}

            {/* Column grid lines */}
            {layers.grid && GRID_COLS.map((col, i) => {
              const [svgX] = dxfToSvg(col.x, 0)
              if (svgX < 0 || svgX > SVG_W) return null
              return (
                <g key={i}>
                  <line
                    x1={svgX} y1={0}
                    x2={svgX} y2={SVG_H}
                    stroke="#94a3b8"
                    strokeWidth={0.5}
                    strokeDasharray="3 5"
                    strokeOpacity={0.5}
                  />
                  <text
                    x={svgX}
                    y={SVG_H - 4}
                    textAnchor="middle"
                    fontSize={6}
                    fill="#94a3b8"
                    style={{ userSelect: 'none' }}
                  >
                    {col.label}
                  </text>
                </g>
              )
            })}

            {/* Machine footprints */}
            {layers.equipment && footprints.map(renderFootprint)}

            {/* Asset pins */}
            {layers.pins && visiblePins.map(pin => {
              const [svgX, svgY] = dxfToSvg(pin.x, pin.y)
              const color = STATUS_COLOR[pin.status] ?? STATUS_COLOR.decommissioned
              return (
                <AssetPin
                  key={pin.assetNumber}
                  assetNumber={pin.assetNumber}
                  displayName={pin.displayName}
                  x={svgX}
                  y={svgY}
                  color={color}
                  isSelected={selectedPinNumber === pin.assetNumber}
                  isHovered={hoveredPin === pin.assetNumber}
                  isNew={pin.isNew}
                  isFuture={pin.isFuture}
                  onSelect={() => onSelectPin?.(pin)}
                  onHover={over => setHoveredPin(over ? pin.assetNumber : null)}
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
