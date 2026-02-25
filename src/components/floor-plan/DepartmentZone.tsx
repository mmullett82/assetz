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

  return (
    <g
      onClick={() => onClick(zone.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <title>{zone.label}</title>

      {/* Invisible click target */}
      <rect
        x={svgX1}
        y={svgYTop}
        width={w}
        height={h}
        fill="transparent"
        pointerEvents="all"
      />

      {/* Active state: dashed highlight border */}
      {isActive && (
        <rect
          x={svgX1 + 1}
          y={svgYTop + 1}
          width={w - 2}
          height={h - 2}
          fill="none"
          stroke="#2563eb"
          strokeWidth={1.2}
          strokeDasharray="6 3"
          rx={2}
        />
      )}

      {/* Hover tooltip: zone label */}
      {(hovered || isActive) && (
        <text
          x={svgX1 + w / 2}
          y={svgYTop + h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.min(12, w / 10, h / 4)}
          fontWeight="500"
          fill={isActive ? '#2563eb' : '#94a3b8'}
          opacity={isActive ? 0.9 : 0.6}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {zone.label}
        </text>
      )}
    </g>
  )
}
