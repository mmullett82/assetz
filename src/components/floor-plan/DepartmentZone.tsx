'use client'

import { useState } from 'react'
import { dxfToSvg } from '@/lib/floor-plan-transform'
import type { Zone } from '@/data/floor-plan/sollid-building'

interface DepartmentZoneProps {
  zone: Zone
  isActive: boolean
  onClick: (zoneId: string) => void
}

export default function DepartmentZone({ zone, isActive, onClick }: DepartmentZoneProps) {
  const [hovered, setHovered] = useState(false)

  const [svgX1, svgYTop] = dxfToSvg(zone.x1, zone.y2)
  const [svgX2, svgYBot] = dxfToSvg(zone.x2, zone.y1)
  const w = svgX2 - svgX1
  const h = svgYBot - svgYTop

  if (w < 10 || h < 8) return null

  // Label color: default #94a3b8, hover #e2e8f0 white, click #38bdf8 sky blue
  const labelColor = isActive ? '#38bdf8' : hovered ? '#e2e8f0' : '#94a3b8'

  return (
    <g
      onClick={() => onClick(zone.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <title>{zone.label}</title>

      {/* Invisible click target — NO fill overlay on click */}
      <rect
        x={svgX1}
        y={svgYTop}
        width={w}
        height={h}
        fill="transparent"
        pointerEvents="all"
      />

      {/* Zone boundary — ALWAYS visible dashed lines, no color change on click */}
      <rect
        x={svgX1 + 0.5}
        y={svgYTop + 0.5}
        width={w - 1}
        height={h - 1}
        fill="none"
        stroke="#64748b"
        strokeWidth={1}
        strokeDasharray="6 4"
        strokeOpacity={0.5}
        rx={1}
      />

      {/* Zone label — always visible, brightens on hover/click */}
      <text
        x={svgX1 + w / 2}
        y={svgYTop + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.min(12, w / 10, h / 4)}
        fontWeight="500"
        fill={labelColor}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {zone.label}
      </text>
    </g>
  )
}
