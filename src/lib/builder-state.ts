/**
 * Map Builder — state types, undo/redo hook, snap helper, templates, CSV parser.
 * localStorage keys used by both builder and floor plan viewer.
 */

import { useCallback, useRef, useState } from 'react'

// ─── localStorage keys ────────────────────────────────────────────────────────

export const DRAFT_KEY     = 'floor-plan-builder-draft'
export const PUBLISHED_KEY = 'floor-plan-builder-published'

// ─── Tool ─────────────────────────────────────────────────────────────────────

export type Tool = 'select' | 'zone' | 'wall' | 'flow' | 'label'

// ─── Data model ───────────────────────────────────────────────────────────────

export interface BuilderZone {
  id: string
  name: string
  color: string
  points: { x: number; y: number }[]   // polygon (≥3 pts)
}

export interface BuilderWall {
  id: string
  points: { x: number; y: number }[]   // polyline
  style: 'solid' | 'dashed'
}

export interface BuilderFlow {
  id: string
  label?: string
  points: { x: number; y: number }[]   // polyline with arrowhead
}

export interface BuilderLabel {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
}

export interface AssetPin {
  assetId: string
  x: number
  y: number
  shape: 'circle' | 'diamond' | 'square'
  size: 'sm' | 'md' | 'lg'
}

export interface EquipmentPlacement {
  id: string
  blockName: string
  displayName: string
  assetId?: string
  department?: string
  x: number
  y: number
  rotation: number       // degrees
  widthInches: number
  heightInches: number
}

export interface BuilderFloor {
  id: string
  name: string
  backgroundImage?: string    // base64 data URL
  zones: BuilderZone[]
  walls: BuilderWall[]
  flows: BuilderFlow[]
  labels: BuilderLabel[]
  pins: AssetPin[]
  equipment: EquipmentPlacement[]
}

export interface BuilderDoc {
  floors: BuilderFloor[]
}

// ─── Selected item union ──────────────────────────────────────────────────────

export type SelectedItem =
  | { kind: 'zone';  id: string }
  | { kind: 'wall';  id: string }
  | { kind: 'flow';  id: string }
  | { kind: 'label'; id: string }
  | { kind: 'pin';   assetId: string }

// ─── Snap helper ─────────────────────────────────────────────────────────────

export const GRID = 20

export function snap(v: number, enabled: boolean): number {
  return enabled ? Math.round(v / GRID) * GRID : v
}

export function snapPt(
  pt: { x: number; y: number },
  enabled: boolean,
): { x: number; y: number } {
  return { x: snap(pt.x, enabled), y: snap(pt.y, enabled) }
}

// ─── SVG coordinate conversion ────────────────────────────────────────────────

export interface ViewBox { x: number; y: number; w: number; h: number }

export function toSVGCoords(
  svgEl: SVGSVGElement,
  clientX: number,
  clientY: number,
  vb: ViewBox,
): { x: number; y: number } {
  const r = svgEl.getBoundingClientRect()
  return {
    x: vb.x + (clientX - r.left) * (vb.w / r.width),
    y: vb.y + (clientY - r.top)  * (vb.h / r.height),
  }
}

// ─── Undo / redo hook ────────────────────────────────────────────────────────

const MAX_HISTORY = 50

export interface UseHistoryResult<T> {
  state:    T
  set:      (next: T) => void
  undo:     () => void
  redo:     () => void
  canUndo:  boolean
  canRedo:  boolean
}

export function useHistory<T>(initial: T): UseHistoryResult<T> {
  const [current, setCurrent] = useState<T>(initial)
  const past   = useRef<T[]>([])
  const future = useRef<T[]>([])

  const set = useCallback((next: T) => {
    past.current = [...past.current.slice(-MAX_HISTORY), current]
    future.current = []
    setCurrent(next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const undo = useCallback(() => {
    if (past.current.length === 0) return
    const prev = past.current[past.current.length - 1]
    past.current = past.current.slice(0, -1)
    future.current = [current, ...future.current]
    setCurrent(prev)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const redo = useCallback(() => {
    if (future.current.length === 0) return
    const next = future.current[0]
    future.current = future.current.slice(1)
    past.current = [...past.current, current]
    setCurrent(next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return {
    state:   current,
    set,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }
}

// ─── Empty floor factory ─────────────────────────────────────────────────────

export function makeFloor(name: string): BuilderFloor {
  return {
    id:     `floor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    zones:     [],
    walls:     [],
    flows:     [],
    labels:    [],
    pins:      [],
    equipment: [],
  }
}

// ─── Template presets ────────────────────────────────────────────────────────

/** Template IDs */
export type TemplateId = 'linear' | 'u-shape' | 'l-shape' | 'open'

export interface Template {
  id:          TemplateId
  name:        string
  description: string
  floor:       Omit<BuilderFloor, 'id' | 'name'>
}

export const TEMPLATES: Template[] = [
  {
    id:          'linear',
    name:        'Linear Flow',
    description: '4 zones arranged left-to-right — ideal for straight production lines.',
    floor: {
      zones: [
        { id: 't-z1', name: 'Receiving',   color: '#3b82f6', points: [{x:20,y:60},{x:220,y:60},{x:220,y:340},{x:20,y:340}] },
        { id: 't-z2', name: 'Millwork',    color: '#8b5cf6', points: [{x:240,y:60},{x:470,y:60},{x:470,y:340},{x:240,y:340}] },
        { id: 't-z3', name: 'Assembly',    color: '#f59e0b', points: [{x:490,y:60},{x:720,y:60},{x:720,y:340},{x:490,y:340}] },
        { id: 't-z4', name: 'Shipping',    color: '#10b981', points: [{x:740,y:60},{x:980,y:60},{x:980,y:340},{x:740,y:340}] },
      ],
      walls: [], flows: [], labels: [], pins: [], equipment: [],
    },
  },
  {
    id:          'u-shape',
    name:        'U-Shape',
    description: '3 zones in a U-arrangement — left wing, bottom, right wing.',
    floor: {
      zones: [
        { id: 't-z1', name: 'Left Wing',   color: '#3b82f6', points: [{x:20,y:60},{x:280,y:60},{x:280,y:640},{x:20,y:640}] },
        { id: 't-z2', name: 'Production',  color: '#f59e0b', points: [{x:300,y:400},{x:700,y:400},{x:700,y:640},{x:300,y:640}] },
        { id: 't-z3', name: 'Right Wing',  color: '#10b981', points: [{x:720,y:60},{x:980,y:60},{x:980,y:640},{x:720,y:640}] },
      ],
      walls: [], flows: [], labels: [], pins: [], equipment: [],
    },
  },
  {
    id:          'l-shape',
    name:        'L-Shape',
    description: '2 zones forming an L — main floor plus a side department.',
    floor: {
      zones: [
        { id: 't-z1', name: 'Main Floor',  color: '#3b82f6', points: [{x:20,y:60},{x:700,y:60},{x:700,y:400},{x:20,y:400}] },
        { id: 't-z2', name: 'Side Dept',   color: '#8b5cf6', points: [{x:20,y:420},{x:340,y:420},{x:340,y:640},{x:20,y:640}] },
      ],
      walls: [], flows: [], labels: [], pins: [], equipment: [],
    },
  },
  {
    id:          'open',
    name:        'Open Floor',
    description: 'One large production zone — minimal structure, maximum flexibility.',
    floor: {
      zones: [
        { id: 't-z1', name: 'Production',  color: '#3b82f6', points: [{x:20,y:60},{x:980,y:60},{x:980,y:640},{x:20,y:640}] },
      ],
      walls: [], flows: [], labels: [], pins: [], equipment: [],
    },
  },
]

// ─── CSV pin import ───────────────────────────────────────────────────────────

export interface CSVPinRow {
  assetId: string
  x: number
  y: number
  valid: boolean
  error?: string
}

/**
 * Parse a CSV string into pin rows.
 * Expected format: header row "asset_id,x,y" then data rows.
 * Header row is optional — if first row doesn't parse as numbers, it's skipped.
 */
export function parseCSVPins(csv: string): CSVPinRow[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  // Detect and skip header
  const startIdx = lines[0].toLowerCase().includes('asset_id') ? 1 : 0

  return lines.slice(startIdx).map((line) => {
    const parts = line.split(',').map((p) => p.trim())
    if (parts.length < 3) {
      return { assetId: parts[0] ?? '', x: 0, y: 0, valid: false, error: 'Expected 3 columns' }
    }
    const [assetId, xStr, yStr] = parts
    const x = parseFloat(xStr)
    const y = parseFloat(yStr)
    if (!assetId) {
      return { assetId: '', x, y, valid: false, error: 'Missing asset_id' }
    }
    if (isNaN(x) || isNaN(y)) {
      return { assetId, x: 0, y: 0, valid: false, error: 'x/y must be numbers' }
    }
    return { assetId, x, y, valid: true }
  })
}

/** Convert parsed rows into AssetPin objects (valid only) */
export function csvRowsToPins(rows: CSVPinRow[]): AssetPin[] {
  return rows
    .filter((r) => r.valid)
    .map((r) => ({
      assetId: r.assetId,
      x: r.x,
      y: r.y,
      shape: 'circle' as const,
      size:  'md'    as const,
    }))
}
