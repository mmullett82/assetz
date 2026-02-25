'use client'

import { dxfToSvg, SCALE } from '@/lib/floor-plan-transform'
import type { DxfAsset } from './DxfAssetPanel'

// ─── Status LED colors ─────────────────────────────────────────────────────────

const STATUS_LED: Record<string, string> = {
  operational:    '#22c55e',
  maintenance:    '#eab308',
  down:           '#ef4444',
  decommissioned: '#94a3b8',
}

// ─── Types ─────────────────────────────────────────────────────────────────────

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

interface EquipmentFootprintProps {
  footprint: MachineFootprint
  asset: DxfAsset | null
  status: string
  isSelected: boolean
  dimmed: boolean
  showLabel: boolean
  showMaintenance: boolean
  onClick: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EquipmentFootprint({
  footprint: fp,
  asset,
  status,
  isSelected,
  dimmed,
  showLabel,
  showMaintenance,
  onClick,
}: EquipmentFootprintProps) {
  const [cx, cy] = dxfToSvg(fp.x, fp.y)
  const w = fp.hw * 2 * SCALE
  const h = fp.hh * 2 * SCALE
  const rot = -fp.rotation // negate because SVG Y-axis is flipped

  const ledColor = STATUS_LED[status] ?? STATUS_LED.decommissioned
  const label = asset?.assetNumber ?? fp.blockName.slice(0, 10)
  const isActiveMaintenance = showMaintenance && status === 'maintenance'

  // LED dot position: top-right corner of the rect (before rotation)
  const ledX = w / 2 - 3
  const ledY = -(h / 2 - 3)

  return (
    <g
      transform={`translate(${cx},${cy}) rotate(${rot})`}
      onClick={asset ? onClick : undefined}
      style={{
        cursor: asset ? 'pointer' : 'default',
        opacity: dimmed ? 0.15 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <title>
        {asset?.assetNumber ?? fp.blockName}
        {fp.displayName ? ` — ${fp.displayName}` : ''}
        {` (${status})`}
        {fp.layer === 'Phase2' ? ' [Phase 2]' : ''}
      </title>

      {/* Selection highlight ring */}
      {isSelected && (
        <rect
          x={-w / 2 - 2}
          y={-h / 2 - 2}
          width={w + 4}
          height={h + 4}
          fill="none"
          stroke="#2563eb"
          strokeWidth={1.5}
          rx={1.5}
          strokeOpacity={0.5}
        />
      )}

      {/* Equipment outline */}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill="none"
        stroke={isSelected ? '#2563eb' : '#1e293b'}
        strokeWidth={1}
        rx={0.5}
      />

      {/* Status LED dot */}
      <circle
        cx={ledX}
        cy={ledY}
        r={3}
        fill={ledColor}
        stroke="white"
        strokeWidth={0.8}
      />

      {/* Pulsing ring for active maintenance */}
      {isActiveMaintenance && (
        <circle
          cx={ledX}
          cy={ledY}
          r={5}
          fill="none"
          stroke={ledColor}
          strokeWidth={0.8}
          opacity={0.6}
        >
          <animate
            attributeName="r"
            values="3;7;3"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Asset number label */}
      {showLabel && w > 12 && h > 6 && (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.min(7, w / 5, h / 3)}
          fontWeight="600"
          fill="#0f172a"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}
