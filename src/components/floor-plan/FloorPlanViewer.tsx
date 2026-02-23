'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Asset, AssetStatus } from '@/types'
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  FLOOR_ZONES, ASSET_POSITIONS, DEPENDENCY_EDGES,
  type FloorZone,
} from '@/lib/mock-floor-plan'

// ─── Constants ────────────────────────────────────────────────────────────────

const PIN_RADIUS = 22
const ARROW_OFFSET = PIN_RADIUS + 6  // arrowhead stops before pin edge

const STATUS_COLOR: Record<AssetStatus, string> = {
  operational:    '#22c55e',   // green-500
  maintenance:    '#eab308',   // yellow-500
  down:           '#ef4444',   // red-500
  decommissioned: '#94a3b8',   // slate-400
}

const STATUS_BG: Record<AssetStatus, string> = {
  operational:    '#f0fdf4',
  maintenance:    '#fefce8',
  down:           '#fef2f2',
  decommissioned: '#f8fafc',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ViewBox { x: number; y: number; w: number; h: number }

const INITIAL_VB: ViewBox = { x: 0, y: 0, w: CANVAS_WIDTH, h: CANVAS_HEIGHT }

/** Clamp viewBox so you can't pan off the canvas entirely. */
function clampVB(vb: ViewBox): ViewBox {
  const margin = Math.min(vb.w, vb.h) * 0.3
  return {
    x: Math.max(-margin, Math.min(CANVAS_WIDTH  - vb.w + margin, vb.x)),
    y: Math.max(-margin, Math.min(CANVAS_HEIGHT - vb.h + margin, vb.y)),
    w: vb.w,
    h: vb.h,
  }
}

/** Compute the two line endpoints, offset from pin centres by ARROW_OFFSET. */
function edgeEndpoints(fromPos: { x: number; y: number }, toPos: { x: number; y: number }) {
  const dx = toPos.x - fromPos.x
  const dy = toPos.y - fromPos.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  return {
    x1: fromPos.x + ux * ARROW_OFFSET,
    y1: fromPos.y + uy * ARROW_OFFSET,
    x2: toPos.x   - ux * ARROW_OFFSET,
    y2: toPos.y   - uy * ARROW_OFFSET,
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ZoneRect({ zone }: { zone: FloorZone }) {
  return (
    <g>
      <rect
        x={zone.x} y={zone.y}
        width={zone.width} height={zone.height}
        rx={14}
        fill={zone.color} fillOpacity={0.07}
        stroke={zone.color} strokeWidth={1.5} strokeOpacity={0.35}
      />
      <text
        x={zone.x + 16} y={zone.y + 26}
        fontSize={13} fontWeight={700}
        fill={zone.color} fillOpacity={0.8}
        style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
      >
        {zone.name.toUpperCase()}
      </text>
    </g>
  )
}

interface AssetPinProps {
  asset: Asset
  liveStatus?: AssetStatus
  selected: boolean
  hovered: boolean
  onSelect: () => void
  onHover: (id: string | null) => void
}

function AssetPin({ asset, liveStatus, selected, hovered, onSelect, onHover }: AssetPinProps) {
  const pos = ASSET_POSITIONS[asset.id]
  if (!pos) return null

  const status = liveStatus ?? asset.status
  const color  = STATUS_COLOR[status]
  const bg     = STATUS_BG[status]
  const label  = asset.name.length > 16 ? asset.name.slice(0, 14) + '…' : asset.name

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onMouseEnter={() => onHover(asset.id)}
      onMouseLeave={() => onHover(null)}
      role="button"
      aria-label={`${asset.name} — ${status}`}
    >
      {/* Pulse ring for DOWN assets */}
      {status === 'down' && (
        <circle r={PIN_RADIUS + 8} fill="none" stroke={color} strokeWidth={2} opacity={0.4}>
          <animate attributeName="r"     values={`${PIN_RADIUS + 4};${PIN_RADIUS + 14};${PIN_RADIUS + 4}`} dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5"   dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Selection ring */}
      {selected && (
        <circle r={PIN_RADIUS + 6} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeDasharray="4 2" />
      )}

      {/* Outer status ring */}
      <circle r={PIN_RADIUS} fill={bg} stroke={color} strokeWidth={hovered || selected ? 3.5 : 2.5} />

      {/* System type initial */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={color}
        style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
      >
        {asset.system_type.slice(0, 3)}
      </text>

      {/* Asset name label */}
      <text
        y={PIN_RADIUS + 13}
        textAnchor="middle"
        fontSize={10}
        fontWeight={hovered || selected ? 600 : 400}
        fill="#334155"
        style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FloorPlanViewerProps {
  assets: Asset[]
  liveStatuses: Record<string, AssetStatus>
  selectedId:   string | null
  statusFilter: AssetStatus | ''
  showFeeds:    boolean
  showDepends:  boolean
  onSelect:     (id: string | null) => void
}

export default function FloorPlanViewer({
  assets,
  liveStatuses,
  selectedId,
  statusFilter,
  showFeeds,
  showDepends,
  onSelect,
}: FloorPlanViewerProps) {
  const svgRef   = useRef<SVGSVGElement>(null)
  const [vb, setVb]       = useState<ViewBox>(INITIAL_VB)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, startVBX: 0, startVBY: 0 })
  const [tooltip, setTooltip] = useState<{ id: string; x: number; y: number } | null>(null)

  // ── Pan ──────────────────────────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest('[role="button"]')) return
    setIsDragging(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, startVBX: vb.x, startVBY: vb.y }
  }, [vb.x, vb.y])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return
    const rect = svgRef.current!.getBoundingClientRect()
    const dx = (e.clientX - dragRef.current.startX) / rect.width  * vb.w
    const dy = (e.clientY - dragRef.current.startY) / rect.height * vb.h
    setVb((prev) => clampVB({ ...prev, x: dragRef.current.startVBX - dx, y: dragRef.current.startVBY - dy }))
  }, [isDragging, vb.w, vb.h])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  // ── Zoom (wheel) ─────────────────────────────────────────────────────────

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      const rect = el!.getBoundingClientRect()
      const mx = vb.x + (e.clientX - rect.left) / rect.width  * vb.w
      const my = vb.y + (e.clientY - rect.top)  / rect.height * vb.h
      const factor = e.deltaY > 0 ? 1.12 : 0.89
      const newW = Math.max(200, Math.min(CANVAS_WIDTH  * 2, vb.w * factor))
      const newH = newW * (CANVAS_HEIGHT / CANVAS_WIDTH)
      setVb(clampVB({
        x: mx - (mx - vb.x) * (newW / vb.w),
        y: my - (my - vb.y) * (newH / vb.h),
        w: newW,
        h: newH,
      }))
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [vb])

  // ── Touch: simple pinch-to-zoom ──────────────────────────────────────────
  const lastTouchDist = useRef<number | null>(null)
  const lastTouchMid  = useRef<{ x: number; y: number } | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      lastTouchDist.current = Math.hypot(dx, dy)
      lastTouchMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    } else if (e.touches.length === 1) {
      dragRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, startVBX: vb.x, startVBY: vb.y }
      setIsDragging(true)
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    if (e.touches.length === 2 && lastTouchDist.current && lastTouchMid.current) {
      const dx   = e.touches[1].clientX - e.touches[0].clientX
      const dy   = e.touches[1].clientY - e.touches[0].clientY
      const dist = Math.hypot(dx, dy)
      const factor = lastTouchDist.current / dist
      const rect = svgRef.current!.getBoundingClientRect()
      const mx = vb.x + (lastTouchMid.current.x - rect.left) / rect.width  * vb.w
      const my = vb.y + (lastTouchMid.current.y - rect.top)  / rect.height * vb.h
      const newW = Math.max(200, Math.min(CANVAS_WIDTH * 2, vb.w * factor))
      const newH = newW * (CANVAS_HEIGHT / CANVAS_WIDTH)
      setVb(clampVB({
        x: mx - (mx - vb.x) * (newW / vb.w),
        y: my - (my - vb.y) * (newH / vb.h),
        w: newW, h: newH,
      }))
      lastTouchDist.current = dist
    } else if (e.touches.length === 1 && isDragging) {
      const rect = svgRef.current!.getBoundingClientRect()
      const dx = (e.touches[0].clientX - dragRef.current.startX) / rect.width  * vb.w
      const dy = (e.touches[0].clientY - dragRef.current.startY) / rect.height * vb.h
      setVb((prev) => clampVB({ ...prev, x: dragRef.current.startVBX - dx, y: dragRef.current.startVBY - dy }))
    }
  }

  function handleTouchEnd() {
    lastTouchDist.current = null
    lastTouchMid.current  = null
    setIsDragging(false)
  }

  // ── Zoom controls ─────────────────────────────────────────────────────────

  function zoomBy(factor: number) {
    const cx = vb.x + vb.w / 2
    const cy = vb.y + vb.h / 2
    const newW = Math.max(200, Math.min(CANVAS_WIDTH * 2, vb.w * factor))
    const newH = newW * (CANVAS_HEIGHT / CANVAS_WIDTH)
    setVb(clampVB({ x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH }))
  }

  function resetView() { setVb(INITIAL_VB) }

  // ── Hover tooltip position ────────────────────────────────────────────────

  function handlePinHover(id: string | null) {
    setHoverId(id)
    if (!id || !svgRef.current) { setTooltip(null); return }
    const pos  = ASSET_POSITIONS[id]
    if (!pos) { setTooltip(null); return }
    const rect = svgRef.current.getBoundingClientRect()
    const sx   = ((pos.x - vb.x) / vb.w) * rect.width  + rect.left
    const sy   = ((pos.y - vb.y) / vb.h) * rect.height + rect.top
    setTooltip({ id, x: sx, y: sy })
  }

  // ── Filtered asset list ───────────────────────────────────────────────────

  const visibleAssets = statusFilter
    ? assets.filter((a) => (liveStatuses[a.id] ?? a.status) === statusFilter)
    : assets

  const visibleIds = new Set(visibleAssets.map((a) => a.id))

  // ── Hover tooltip asset ───────────────────────────────────────────────────

  const hoveredAsset = hoverId ? assets.find((a) => a.id === hoverId) : null

  return (
    <div className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden select-none">

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        className={[
          'w-full h-full',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onSelect(null)}
        aria-label="Facility floor plan"
        role="img"
      >
        <defs>
          {/* Floor pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>

          {/* Arrow markers */}
          <marker id="arrow-feeds"   markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-depends" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" />
          </marker>
        </defs>

        {/* Grid background */}
        <rect x={-500} y={-500} width={CANVAS_WIDTH + 1000} height={CANVAS_HEIGHT + 1000} fill="url(#grid)" />

        {/* Canvas boundary shadow */}
        <rect
          x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
          rx={20} fill="white" stroke="#e2e8f0" strokeWidth={2}
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}
        />

        {/* Zone overlays */}
        {FLOOR_ZONES.map((zone) => (
          <ZoneRect key={zone.id} zone={zone} />
        ))}

        {/* Dependency lines (rendered below pins) */}
        {DEPENDENCY_EDGES.map((edge, i) => {
          if (edge.kind === 'feeds'      && !showFeeds)   return null
          if (edge.kind === 'depends_on' && !showDepends) return null
          if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return null

          const fromPos = ASSET_POSITIONS[edge.from]
          const toPos   = ASSET_POSITIONS[edge.to]
          if (!fromPos || !toPos) return null

          const { x1, y1, x2, y2 } = edgeEndpoints(fromPos, toPos)
          const isFeeds   = edge.kind === 'feeds'

          // Highlight when one of the endpoints is selected or hovered
          const highlighted = edge.from === selectedId || edge.to === selectedId ||
                              edge.from === hoverId    || edge.to === hoverId

          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isFeeds ? '#3b82f6' : '#ef4444'}
              strokeWidth={highlighted ? 2.5 : 1.5}
              strokeDasharray={isFeeds ? '6 4' : undefined}
              strokeOpacity={highlighted ? 1 : 0.55}
              markerEnd={isFeeds ? 'url(#arrow-feeds)' : 'url(#arrow-depends)'}
            />
          )
        })}

        {/* Asset pins */}
        {assets.map((asset) => {
          const inFilter = !statusFilter || (liveStatuses[asset.id] ?? asset.status) === statusFilter
          return (
            <g key={asset.id} opacity={inFilter ? 1 : 0.2}>
              <AssetPin
                asset={asset}
                liveStatus={liveStatuses[asset.id]}
                selected={asset.id === selectedId}
                hovered={asset.id === hoverId}
                onSelect={() => onSelect(asset.id)}
                onHover={handlePinHover}
              />
            </g>
          )
        })}
      </svg>

      {/* Zoom controls (bottom-right) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => zoomBy(0.75)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm text-lg leading-none font-bold transition-colors"
          aria-label="Zoom in"
        >+</button>
        <button
          type="button"
          onClick={() => zoomBy(1.33)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm text-lg leading-none font-bold transition-colors"
          aria-label="Zoom out"
        >−</button>
        <button
          type="button"
          onClick={resetView}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm text-xs font-semibold transition-colors"
          aria-label="Reset view"
        >⌂</button>
      </div>

      {/* Hover tooltip */}
      {tooltip && hoveredAsset && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-xl"
          style={{
            left:      tooltip.x,
            top:       tooltip.y - 60,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-semibold">{hoveredAsset.name}</p>
          <p className="text-slate-300 capitalize">{liveStatuses[hoveredAsset.id] ?? hoveredAsset.status}</p>
          <p className="text-slate-400">{hoveredAsset.department_code} · {hoveredAsset.manufacturer}</p>
          {/* Tiny triangle */}
          <span
            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 border-4 border-transparent border-t-slate-900"
            style={{ content: '""' }}
          />
        </div>
      )}
    </div>
  )
}
