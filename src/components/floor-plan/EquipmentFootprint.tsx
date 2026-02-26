'use client'

import { useState } from 'react'
import { dxfToSvg, SCALE } from '@/lib/floor-plan-transform'
import type { DxfAsset } from './DxfAssetPanel'

// ─── Status LED colors — vivid on #0f172a canvas ───────────────────────────────

const STATUS_LED: Record<string, string> = {
  operational:    '#22c55e',   // bright green
  maintenance:    '#f59e0b',   // amber
  down:           '#ef4444',   // red
  decommissioned: '#6b7280',   // gray
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
  isPhase2?: boolean
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
  isPhase2 = false,
  showLabel,
  showMaintenance,
  onClick,
}: EquipmentFootprintProps) {
  const [hovered, setHovered] = useState(false)
  const [cx, cy] = dxfToSvg(fp.x, fp.y)
  const w = fp.hw * 2 * SCALE
  const h = fp.hh * 2 * SCALE
  const rot = -fp.rotation

  const ledColor = STATUS_LED[status] ?? STATUS_LED.decommissioned
  const label = asset?.assetNumber ?? fp.blockName.slice(0, 10)
  const isActiveMaintenance = showMaintenance && status === 'maintenance'
  const isDown = status === 'down'

  // LED dot position: top-right corner
  const ledX = w / 2 - 3
  const ledY = -(h / 2 - 3)

  // ── Phase 2: emerald green dashed overlay ──
  if (isPhase2) {
    return (
      <g
        transform={`translate(${cx},${cy}) rotate(${rot})`}
        style={{ opacity: 0.7 }}
      >
        <title>{fp.blockName}{fp.displayName ? ` — ${fp.displayName}` : ''} [Phase 2 — Planned]</title>
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          fill="transparent"
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="4 3"
          rx={0.5}
        />
        {showLabel && w > 14 && h > 8 && (
          <text
            x={0}
            y={h / 2 + 5}
            textAnchor="middle"
            fontSize={Math.min(5, w / 6)}
            fontWeight="500"
            fontFamily="monospace"
            fill="#10b981"
            opacity={0.7}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {fp.blockName.slice(0, 8)}
          </text>
        )}
      </g>
    )
  }

  // ── Current equipment: bright cyan ──
  const strokeColor = hovered ? '#22d3ee' : isSelected ? '#22d3ee' : '#06b6d4'
  const strokeW = hovered || isSelected ? 1.5 : 1.2
  const rectFill = isSelected ? '#06b6d415' : hovered ? '#06b6d408' : 'transparent'

  return (
    <g
      transform={`translate(${cx},${cy}) rotate(${rot})`}
      onClick={asset ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: asset ? 'pointer' : 'default',
        opacity: dimmed ? 0.12 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <title>
        {asset?.assetNumber ?? fp.blockName}
        {fp.displayName ? ` — ${fp.displayName}` : ''}
        {` (${status})`}
      </title>

      {/* Down equipment: red glow border */}
      {isDown && !dimmed && (
        <rect
          x={-w / 2 - 2}
          y={-h / 2 - 2}
          width={w + 4}
          height={h + 4}
          fill="none"
          stroke="#ef4444"
          strokeWidth={1.2}
          strokeOpacity={0.4}
          rx={1.5}
        />
      )}

      {/* Selection highlight ring */}
      {isSelected && (
        <rect
          x={-w / 2 - 3}
          y={-h / 2 - 3}
          width={w + 6}
          height={h + 6}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={1.5}
          rx={2}
          strokeOpacity={0.6}
        />
      )}

      {/* Equipment outline — BRIGHTEST element: vibrant cyan */}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill={rectFill}
        stroke={strokeColor}
        strokeWidth={strokeW}
        rx={0.5}
      />

      {/* Status LED dot — vivid, always visible */}
      <circle
        cx={ledX}
        cy={ledY}
        r={3.5}
        fill={ledColor}
        stroke="#0f172a"
        strokeWidth={1}
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
            values="3.5;8;3.5"
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

      {/* Asset number label — below footprint */}
      {showLabel && w > 10 && (
        <text
          x={0}
          y={h / 2 + 6}
          textAnchor="middle"
          fontSize={Math.min(6, w / 5)}
          fontWeight="500"
          fontFamily="monospace"
          fill="#94a3b8"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}
