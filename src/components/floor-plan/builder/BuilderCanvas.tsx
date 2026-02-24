'use client'

/**
 * BuilderCanvas — the interactive SVG editing surface.
 *
 * Handles:
 *  - Pan (Space+drag or middle-mouse)
 *  - Zoom (scroll wheel)
 *  - Tool: Select (click to select, drag to move)
 *  - Tool: Zone   (click to add vertices, close on first-vertex click or double-click)
 *  - Tool: Wall   (click to add vertices, double-click to finish)
 *  - Tool: Flow   (same as wall, gets arrowhead)
 *  - Tool: Label  (click canvas → inline input)
 *  - Pin drag-and-drop from AssetSidebar
 *  - Grid overlay (20-unit grid lines)
 *
 * Rendering layers (bottom → top):
 *  1. Background image
 *  2. Grid overlay
 *  3. Zones
 *  4. Walls
 *  5. Flows (with arrowheads)
 *  6. Labels
 *  7. Asset pins
 *  8. In-progress drawing overlay
 *  9. Selection highlight
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AssetPin,
  BuilderFloor,
  BuilderFlow,
  BuilderLabel,
  BuilderWall,
  BuilderZone,
  SelectedItem,
  Tool,
  ViewBox,
} from '@/lib/builder-state'
import { GRID, snap, snapPt, toSVGCoords } from '@/lib/builder-state'
import type { Asset } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_W = 1000
const CANVAS_H = 700
const INITIAL_VB: ViewBox = { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H }
const CLOSE_RADIUS = 15   // SVG units — snap to close polygon

const PIN_SIZE: Record<AssetPin['size'], number> = { sm: 16, md: 22, lg: 30 }

const ZONE_COLORS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface BuilderCanvasProps {
  floor:         BuilderFloor
  assets:        Asset[]
  activeTool:    Tool
  snapEnabled:   boolean
  showGrid:      boolean
  selected:      SelectedItem | null
  onFloorChange: (next: BuilderFloor) => void
  onSelect:      (item: SelectedItem | null) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clampVB(vb: ViewBox): ViewBox {
  const margin = Math.min(vb.w, vb.h) * 0.3
  return {
    x: Math.max(-margin, Math.min(CANVAS_W - vb.w + margin, vb.x)),
    y: Math.max(-margin, Math.min(CANVAS_H - vb.h + margin, vb.y)),
    w: vb.w,
    h: vb.h,
  }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function ptStr(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

function polyPath(points: { x: number; y: number }[], closed: boolean) {
  if (points.length < 2) return ''
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  return closed ? d + ' Z' : d
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GridLines({ vb, show }: { vb: ViewBox; show: boolean }) {
  if (!show) return null
  const lines: React.ReactElement[] = []
  const startX = Math.floor(vb.x / GRID) * GRID
  const startY = Math.floor(vb.y / GRID) * GRID
  const endX   = vb.x + vb.w + GRID
  const endY   = vb.y + vb.h + GRID
  for (let x = startX; x <= endX; x += GRID) {
    lines.push(
      <line key={`gx${x}`} x1={x} y1={vb.y - GRID} x2={x} y2={vb.y + vb.h + GRID}
        stroke="#e2e8f0" strokeWidth={0.5} />
    )
  }
  for (let y = startY; y <= endY; y += GRID) {
    lines.push(
      <line key={`gy${y}`} x1={vb.x - GRID} y1={y} x2={vb.x + vb.w + GRID} y2={y}
        stroke="#e2e8f0" strokeWidth={0.5} />
    )
  }
  return <g>{lines}</g>
}

interface ZoneShapeProps {
  zone:     BuilderZone
  selected: boolean
  onClick:  (e: React.MouseEvent) => void
}
function ZoneShape({ zone, selected, onClick }: ZoneShapeProps) {
  if (zone.points.length < 3) return null
  return (
    <g>
      <polygon
        points={ptStr(zone.points)}
        fill={zone.color}
        fillOpacity={0.12}
        stroke={zone.color}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeDasharray={selected ? '6 3' : undefined}
        strokeOpacity={0.7}
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      />
      {/* Vertex handles when selected */}
      {selected && zone.points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5}
          fill="white" stroke={zone.color} strokeWidth={1.5} />
      ))}
      <text
        x={zone.points[0].x + 8} y={zone.points[0].y + 18}
        fontSize={12} fontWeight={700}
        fill={zone.color} fillOpacity={0.85}
        style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none', pointerEvents: 'none' }}
      >
        {zone.name.toUpperCase()}
      </text>
    </g>
  )
}

interface WallShapeProps {
  wall:     BuilderWall
  selected: boolean
  onClick:  (e: React.MouseEvent) => void
}
function WallShape({ wall, selected, onClick }: WallShapeProps) {
  if (wall.points.length < 2) return null
  return (
    <polyline
      points={ptStr(wall.points)}
      fill="none"
      stroke={selected ? '#2563eb' : '#475569'}
      strokeWidth={selected ? 3.5 : 2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={wall.style === 'dashed' ? '8 5' : undefined}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    />
  )
}

interface FlowShapeProps {
  flow:     BuilderFlow
  selected: boolean
  onClick:  (e: React.MouseEvent) => void
}
function FlowShape({ flow, selected, onClick }: FlowShapeProps) {
  if (flow.points.length < 2) return null
  return (
    <>
      <polyline
        points={ptStr(flow.points)}
        fill="none"
        stroke={selected ? '#1d4ed8' : '#3b82f6'}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd="url(#builder-arrow)"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      />
      {flow.label && (
        <text
          x={(flow.points[0].x + flow.points[flow.points.length - 1].x) / 2}
          y={(flow.points[0].y + flow.points[flow.points.length - 1].y) / 2 - 6}
          fontSize={10} fill="#1d4ed8" textAnchor="middle"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {flow.label}
        </text>
      )}
    </>
  )
}

interface LabelShapeProps {
  label:    BuilderLabel
  selected: boolean
  onClick:  (e: React.MouseEvent) => void
}
function LabelShape({ label, selected, onClick }: LabelShapeProps) {
  return (
    <text
      x={label.x} y={label.y}
      fontSize={label.fontSize}
      fill={selected ? '#2563eb' : '#1e293b'}
      fontWeight={600}
      style={{
        fontFamily: 'system-ui, sans-serif',
        userSelect: 'none',
        cursor: 'pointer',
        textDecoration: selected ? 'underline' : undefined,
      }}
      onClick={onClick}
    >
      {label.text}
    </text>
  )
}

interface PinShapeProps {
  pin:      AssetPin
  label:    string
  selected: boolean
  onClick:  (e: React.MouseEvent) => void
}
function PinShape({ pin, label, selected, onClick }: PinShapeProps) {
  const r = PIN_SIZE[pin.size]
  const color = selected ? '#2563eb' : '#64748b'
  const bg    = selected ? '#eff6ff' : '#f8fafc'
  const selRing = selected ? (
    <circle r={r + 6} fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 2" />
  ) : null

  let shape: React.ReactElement
  if (pin.shape === 'diamond') {
    const d = `M0,${-r} L${r},0 L0,${r} L${-r},0 Z`
    shape = (
      <>
        {selected && <path d={`M0,${-(r+6)} L${r+6},0 L0,${r+6} L${-(r+6)},0 Z`}
          fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 2" />}
        <path d={d} fill={bg} stroke={color} strokeWidth={selected ? 2.5 : 1.5} />
      </>
    )
  } else if (pin.shape === 'square') {
    shape = (
      <>
        {selected && <rect x={-(r+6)} y={-(r+6)} width={(r+6)*2} height={(r+6)*2}
          fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 2" />}
        <rect x={-r} y={-r} width={r*2} height={r*2} rx={3}
          fill={bg} stroke={color} strokeWidth={selected ? 2.5 : 1.5} />
      </>
    )
  } else {
    shape = (
      <>
        {selRing}
        <circle r={r} fill={bg} stroke={color} strokeWidth={selected ? 2.5 : 1.5} />
      </>
    )
  }

  const short = label.length > 14 ? label.slice(0, 12) + '…' : label

  return (
    <g transform={`translate(${pin.x},${pin.y})`} style={{ cursor: 'pointer' }} onClick={onClick}>
      {shape}
      <text y={r + 12} textAnchor="middle" fontSize={10} fill="#334155"
        fontWeight={selected ? 600 : 400}
        style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none', pointerEvents: 'none' }}
      >
        {short}
      </text>
    </g>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BuilderCanvas({
  floor,
  assets,
  activeTool,
  snapEnabled,
  showGrid,
  selected,
  onFloorChange,
  onSelect,
}: BuilderCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const [vb, setVb]   = useState<ViewBox>(INITIAL_VB)

  // ── In-progress drawing (ephemeral, NOT in history) ──────────────────────
  const [inProgress, setInProgress] = useState<{ x: number; y: number }[] | null>(null)
  const [hoverPt,    setHoverPt]    = useState<{ x: number; y: number } | null>(null)

  // ── Inline label input ────────────────────────────────────────────────────
  const [labelInput, setLabelInput] = useState<{ x: number; y: number } | null>(null)
  const [labelText,  setLabelText]  = useState('')
  const labelInputRef = useRef<HTMLInputElement>(null)

  // ── Pan state ─────────────────────────────────────────────────────────────
  const isPanning  = useRef(false)
  const spaceDown  = useRef(false)
  const panStart   = useRef({ mx: 0, my: 0, vbx: 0, vby: 0 })

  // ── Drag-move state (select tool) ─────────────────────────────────────────
  const isDraggingItem = useRef(false)
  const dragItemStart  = useRef<{ mx: number; my: number; vb: ViewBox } | null>(null)
  const dragItemOrigin = useRef<{ x: number; y: number } | null>(null)

  // ─── Keyboard: Space for pan, Ctrl+Z/Y for undo/redo (forwarded via event) ────

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        spaceDown.current = true
        e.preventDefault()
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceDown.current = false
        isPanning.current = false
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
    }
  }, [])

  // ─── Zoom wheel ───────────────────────────────────────────────────────────

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      const rect   = el!.getBoundingClientRect()
      const factor = e.deltaY > 0 ? 1.12 : 0.89
      setVb((prev) => {
        const mx   = prev.x + (e.clientX - rect.left) * (prev.w / rect.width)
        const my   = prev.y + (e.clientY - rect.top)  * (prev.h / rect.height)
        const newW = Math.max(200, Math.min(CANVAS_W * 2, prev.w * factor))
        const newH = newW * (CANVAS_H / CANVAS_W)
        return clampVB({
          x: mx - (mx - prev.x) * (newW / prev.w),
          y: my - (my - prev.y) * (newH / prev.h),
          w: newW, h: newH,
        })
      })
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  // ─── Mouse helpers ────────────────────────────────────────────────────────

  function getSVGPt(e: React.MouseEvent): { x: number; y: number } {
    if (!svgRef.current) return { x: 0, y: 0 }
    return toSVGCoords(svgRef.current, e.clientX, e.clientY, vb)
  }

  function getSnappedPt(e: React.MouseEvent) {
    return snapPt(getSVGPt(e), snapEnabled)
  }

  // ─── Mouse down ───────────────────────────────────────────────────────────

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    // Middle-mouse or Space+left → pan
    if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
      isPanning.current = true
      panStart.current = { mx: e.clientX, my: e.clientY, vbx: vb.x, vby: vb.y }
      e.preventDefault()
      return
    }
    if (e.button !== 0) return

    // If a label input is active → commit it first
    if (labelInput) { commitLabel(); return }

    const pt = getSnappedPt(e)

    // ── Label tool: place inline input ─────────────────────────────────────
    if (activeTool === 'label') {
      setLabelInput(pt)
      setLabelText('')
      setTimeout(() => labelInputRef.current?.focus(), 30)
      return
    }

    // ── Zone / wall / flow: add vertex ─────────────────────────────────────
    if (activeTool === 'zone' || activeTool === 'wall' || activeTool === 'flow') {
      if (!inProgress) {
        setInProgress([pt])
      } else {
        // Zone: close if near first vertex
        if (activeTool === 'zone' && inProgress.length >= 3) {
          const d = dist(pt, inProgress[0])
          if (d < CLOSE_RADIUS) {
            commitZone(inProgress)
            return
          }
        }
        setInProgress([...inProgress, pt])
      }
      return
    }
  }

  // ─── Mouse move ───────────────────────────────────────────────────────────

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (isPanning.current) {
      const rect = svgRef.current!.getBoundingClientRect()
      const dx = (e.clientX - panStart.current.mx) / rect.width  * vb.w
      const dy = (e.clientY - panStart.current.my) / rect.height * vb.h
      setVb(clampVB({ ...vb, x: panStart.current.vbx - dx, y: panStart.current.vby - dy }))
      return
    }

    // Update hover preview for drawing tools
    if (inProgress && (activeTool === 'zone' || activeTool === 'wall' || activeTool === 'flow')) {
      setHoverPt(getSnappedPt(e))
    }

    // Drag selected item
    if (isDraggingItem.current && selected && dragItemStart.current && dragItemOrigin.current) {
      const rect = svgRef.current!.getBoundingClientRect()
      const dx = (e.clientX - dragItemStart.current.mx) / rect.width  * dragItemStart.current.vb.w
      const dy = (e.clientY - dragItemStart.current.my) / rect.height * dragItemStart.current.vb.h
      const nx = snap(dragItemOrigin.current.x + dx, snapEnabled)
      const ny = snap(dragItemOrigin.current.y + dy, snapEnabled)
      moveSelected(nx, ny)
    }
  }

  // ─── Mouse up ─────────────────────────────────────────────────────────────

  function handleMouseUp(e: React.MouseEvent) {
    if (isPanning.current) { isPanning.current = false; return }
    if (isDraggingItem.current) {
      isDraggingItem.current = false
      dragItemStart.current  = null
      dragItemOrigin.current = null
    }
  }

  // ─── Double click: finish wall/flow, close zone ───────────────────────────

  function handleDblClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!inProgress) return
    if (activeTool === 'zone' && inProgress.length >= 3) {
      commitZone(inProgress)
    } else if ((activeTool === 'wall' || activeTool === 'flow') && inProgress.length >= 2) {
      if (activeTool === 'wall') commitWall(inProgress)
      else commitFlow(inProgress)
    }
  }

  // ─── Canvas click (deselect) ──────────────────────────────────────────────

  function handleCanvasClick(e: React.MouseEvent<SVGSVGElement>) {
    if (activeTool === 'select' && !(e.target as Element).closest('[data-builder-item]')) {
      onSelect(null)
    }
  }

  // ─── Drag-and-drop pin from AssetSidebar ─────────────────────────────────

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const assetId = e.dataTransfer.getData('assetId')
    if (!assetId || !svgRef.current) return
    const raw = toSVGCoords(svgRef.current, e.clientX, e.clientY, vb)
    const pt  = snapPt(raw, snapEnabled)
    placePin(assetId, pt.x, pt.y)
  }

  // ─── Move selected item ───────────────────────────────────────────────────

  function moveSelected(nx: number, ny: number) {
    if (!selected) return
    if (selected.kind === 'pin') {
      onFloorChange({
        ...floor,
        pins: floor.pins.map((p) =>
          p.assetId === selected.assetId ? { ...p, x: nx, y: ny } : p
        ),
      })
    } else if (selected.kind === 'label') {
      onFloorChange({
        ...floor,
        labels: floor.labels.map((l) =>
          l.id === selected.id ? { ...l, x: nx, y: ny } : l
        ),
      })
    }
    // Zone/wall/flow drag not in scope (vertex stretch not required)
  }

  // ─── Item mousedown for drag (select tool) ────────────────────────────────

  function startDragItem(e: React.MouseEvent, origin: { x: number; y: number }) {
    if (activeTool !== 'select') return
    e.stopPropagation()
    isDraggingItem.current = true
    dragItemStart.current  = { mx: e.clientX, my: e.clientY, vb: { ...vb } }
    dragItemOrigin.current = origin
  }

  // ─── Commit shapes ────────────────────────────────────────────────────────

  function commitZone(points: { x: number; y: number }[]) {
    const nextColor = ZONE_COLORS[floor.zones.length % ZONE_COLORS.length]
    const newZone: BuilderZone = {
      id:     `zone-${Date.now()}`,
      name:   `Zone ${floor.zones.length + 1}`,
      color:  nextColor,
      points,
    }
    onFloorChange({ ...floor, zones: [...floor.zones, newZone] })
    onSelect({ kind: 'zone', id: newZone.id })
    setInProgress(null)
    setHoverPt(null)
  }

  function commitWall(points: { x: number; y: number }[]) {
    const newWall: BuilderWall = {
      id:     `wall-${Date.now()}`,
      style:  'solid',
      points,
    }
    onFloorChange({ ...floor, walls: [...floor.walls, newWall] })
    onSelect({ kind: 'wall', id: newWall.id })
    setInProgress(null)
    setHoverPt(null)
  }

  function commitFlow(points: { x: number; y: number }[]) {
    const newFlow: BuilderFlow = {
      id:     `flow-${Date.now()}`,
      points,
    }
    onFloorChange({ ...floor, flows: [...floor.flows, newFlow] })
    onSelect({ kind: 'flow', id: newFlow.id })
    setInProgress(null)
    setHoverPt(null)
  }

  function commitLabel() {
    if (!labelInput || !labelText.trim()) {
      setLabelInput(null)
      setLabelText('')
      return
    }
    const newLabel: BuilderLabel = {
      id:       `label-${Date.now()}`,
      text:     labelText.trim(),
      x:        labelInput.x,
      y:        labelInput.y,
      fontSize: 16,
    }
    onFloorChange({ ...floor, labels: [...floor.labels, newLabel] })
    onSelect({ kind: 'label', id: newLabel.id })
    setLabelInput(null)
    setLabelText('')
  }

  function placePin(assetId: string, x: number, y: number) {
    // Remove existing pin for this asset if present
    const without = floor.pins.filter((p) => p.assetId !== assetId)
    onFloorChange({
      ...floor,
      pins: [...without, { assetId, x, y, shape: 'circle', size: 'md' }],
    })
    onSelect({ kind: 'pin', assetId })
  }

  // ─── Cursor style ─────────────────────────────────────────────────────────

  function getCursor() {
    if (spaceDown.current || isPanning.current) return 'grabbing'
    if (activeTool === 'select') return 'default'
    if (activeTool === 'label') return 'text'
    return 'crosshair'
  }

  // ─── In-progress drawing preview ─────────────────────────────────────────

  function renderInProgress() {
    if (!inProgress || inProgress.length === 0) return null
    const preview = hoverPt ? [...inProgress, hoverPt] : inProgress

    const closeable =
      activeTool === 'zone' &&
      inProgress.length >= 3 &&
      hoverPt &&
      dist(hoverPt, inProgress[0]) < CLOSE_RADIUS

    return (
      <g>
        {/* Lines between committed vertices */}
        {preview.length >= 2 && (
          <polyline
            points={ptStr(preview)}
            fill="none"
            stroke="#2563eb"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            strokeLinecap="round"
          />
        )}
        {/* Committed vertex dots */}
        {inProgress.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill={i === 0 && activeTool === 'zone' ? '#2563eb' : 'white'}
            stroke="#2563eb" strokeWidth={1.5}
          />
        ))}
        {/* Close-zone indicator */}
        {closeable && (
          <circle cx={inProgress[0].x} cy={inProgress[0].y} r={CLOSE_RADIUS}
            fill="none" stroke="#2563eb" strokeWidth={1} strokeDasharray="3 2" opacity={0.5}
          />
        )}
      </g>
    )
  }

  // ─── Asset name lookup ────────────────────────────────────────────────────

  function assetName(assetId: string) {
    return assets.find((a) => a.id === assetId)?.name ?? assetId
  }

  // ─── Inline label input overlay ──────────────────────────────────────────

  function renderLabelInput() {
    if (!labelInput || !svgRef.current) return null
    // Convert SVG point back to screen coords
    const rect = svgRef.current.getBoundingClientRect()
    const sx = ((labelInput.x - vb.x) / vb.w) * rect.width  + rect.left
    const sy = ((labelInput.y - vb.y) / vb.h) * rect.height + rect.top
    return (
      <input
        ref={labelInputRef}
        value={labelText}
        onChange={(e) => setLabelText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitLabel()
          if (e.key === 'Escape') { setLabelInput(null); setLabelText('') }
        }}
        onBlur={commitLabel}
        className="fixed z-50 bg-white border-2 border-blue-500 rounded px-2 py-0.5 text-sm font-semibold outline-none shadow-lg"
        style={{ left: sx, top: sy - 14, minWidth: 120 }}
        placeholder="Type label…"
      />
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden select-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDblClick}
        onClick={handleCanvasClick}
        aria-label="Map builder canvas"
      >
        <defs>
          <marker id="builder-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6" />
          </marker>
        </defs>

        {/* 1. Background image */}
        {floor.backgroundImage && (
          <image href={floor.backgroundImage} x={0} y={0} width={CANVAS_W} height={CANVAS_H}
            preserveAspectRatio="xMidYMid meet" opacity={0.4} />
        )}

        {/* 2. Canvas boundary */}
        <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H}
          rx={20} fill="white" stroke="#e2e8f0" strokeWidth={2}
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))' }}
        />

        {/* 3. Grid overlay */}
        <GridLines vb={vb} show={showGrid} />

        {/* 4. Zones */}
        {floor.zones.map((zone) => (
          <g key={zone.id} data-builder-item="zone">
            <ZoneShape
              zone={zone}
              selected={selected?.kind === 'zone' && selected.id === zone.id}
              onClick={(e) => {
                e.stopPropagation()
                if (activeTool === 'select') onSelect({ kind: 'zone', id: zone.id })
              }}
            />
          </g>
        ))}

        {/* 5. Walls */}
        {floor.walls.map((wall) => (
          <g key={wall.id} data-builder-item="wall">
            <WallShape
              wall={wall}
              selected={selected?.kind === 'wall' && selected.id === wall.id}
              onClick={(e) => {
                e.stopPropagation()
                if (activeTool === 'select') onSelect({ kind: 'wall', id: wall.id })
              }}
            />
          </g>
        ))}

        {/* 6. Flows */}
        {floor.flows.map((flow) => (
          <g key={flow.id} data-builder-item="flow">
            <FlowShape
              flow={flow}
              selected={selected?.kind === 'flow' && selected.id === flow.id}
              onClick={(e) => {
                e.stopPropagation()
                if (activeTool === 'select') onSelect({ kind: 'flow', id: flow.id })
              }}
            />
          </g>
        ))}

        {/* 7. Labels */}
        {floor.labels.map((lbl) => (
          <g key={lbl.id} data-builder-item="label"
            onMouseDown={(e) => {
              if (activeTool !== 'select') return
              onSelect({ kind: 'label', id: lbl.id })
              startDragItem(e, { x: lbl.x, y: lbl.y })
            }}
          >
            <LabelShape
              label={lbl}
              selected={selected?.kind === 'label' && selected.id === lbl.id}
              onClick={(e) => {
                e.stopPropagation()
                if (activeTool === 'select') onSelect({ kind: 'label', id: lbl.id })
              }}
            />
          </g>
        ))}

        {/* 8. Asset pins */}
        {floor.pins.map((pin) => (
          <g key={pin.assetId} data-builder-item="pin"
            onMouseDown={(e) => {
              if (activeTool !== 'select') return
              onSelect({ kind: 'pin', assetId: pin.assetId })
              startDragItem(e, { x: pin.x, y: pin.y })
            }}
          >
            <PinShape
              pin={pin}
              label={assetName(pin.assetId)}
              selected={selected?.kind === 'pin' && selected.assetId === pin.assetId}
              onClick={(e) => {
                e.stopPropagation()
                if (activeTool === 'select') onSelect({ kind: 'pin', assetId: pin.assetId })
              }}
            />
          </g>
        ))}

        {/* 9. In-progress drawing overlay */}
        {renderInProgress()}
      </svg>

      {/* Inline label input (positioned fixed over canvas) */}
      {renderLabelInput()}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
        <button type="button" onClick={() => setVb((v) => {
            const cx = v.x + v.w/2; const cy = v.y + v.h/2
            const nw = Math.max(200, v.w * 0.75); const nh = nw * (CANVAS_H/CANVAS_W)
            return clampVB({ x: cx - nw/2, y: cy - nh/2, w: nw, h: nh })
          })}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm text-lg font-bold"
          aria-label="Zoom in"
        >+</button>
        <button type="button" onClick={() => setVb((v) => {
            const cx = v.x + v.w/2; const cy = v.y + v.h/2
            const nw = Math.min(CANVAS_W*2, v.w * 1.33); const nh = nw * (CANVAS_H/CANVAS_W)
            return clampVB({ x: cx - nw/2, y: cy - nh/2, w: nw, h: nh })
          })}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm text-lg font-bold"
          aria-label="Zoom out"
        >−</button>
        <button type="button" onClick={() => setVb(INITIAL_VB)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm text-xs font-semibold"
          aria-label="Reset view"
        >⌂</button>
      </div>

      {/* Drawing hint */}
      {inProgress && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full shadow pointer-events-none z-10">
          {activeTool === 'zone'
            ? inProgress.length >= 3
              ? 'Click near first vertex or double-click to close'
              : `${inProgress.length} point${inProgress.length === 1 ? '' : 's'} — click to add more`
            : 'Double-click to finish'}
        </div>
      )}
    </div>
  )
}
