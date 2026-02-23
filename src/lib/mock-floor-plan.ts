/**
 * Floor plan layout data for SOLLiD Cabinetry — Main Plant (B1).
 * Canvas coordinate space: 1000 × 700 SVG units.
 * Zone rectangles define department boundaries.
 * Asset positions are pinned within their zones.
 */

export const CANVAS_WIDTH  = 1000
export const CANVAS_HEIGHT = 700

// ─── Department Zones ─────────────────────────────────────────────────────────

export interface FloorZone {
  id: string
  name: string
  code: string        // matches department_code on assets
  x: number
  y: number
  width: number
  height: number
  color: string       // hex, used for zone fill + border
}

export const FLOOR_ZONES: FloorZone[] = [
  {
    id: 'zone-mil',
    name: 'Millwork',
    code: 'MIL',
    x: 30,   y: 30,
    width: 570, height: 390,
    color: '#3b82f6',   // blue
  },
  {
    id: 'zone-fin',
    name: 'Finishing',
    code: 'FIN',
    x: 645,  y: 30,
    width: 325, height: 210,
    color: '#8b5cf6',   // violet
  },
  {
    id: 'zone-join',
    name: 'Joinery',
    code: 'JOIN',
    x: 645,  y: 280,
    width: 325, height: 170,
    color: '#f59e0b',   // amber
  },
  {
    id: 'zone-fac',
    name: 'Facilities',
    code: 'FAC',
    x: 30,   y: 470,
    width: 265, height: 200,
    color: '#10b981',   // emerald
  },
]

// ─── Asset Pin Positions ──────────────────────────────────────────────────────

/** Position of each asset pin center in canvas coordinates. */
export const ASSET_POSITIONS: Record<string, { x: number; y: number }> = {
  'ast-004': { x: 115,  y: 175 },   // Beam Saw     — Millwork, far left (upstream)
  'ast-001': { x: 285,  y: 145 },   // Edge Bander  — Millwork, upper center
  'ast-002': { x: 450,  y: 145 },   // Rover CNC    — Millwork, upper right
  'ast-003': { x: 450,  y: 310 },   // Skill CNC    — Millwork, lower right
  'ast-008': { x: 285,  y: 310 },   // Drillteq CNC — Millwork, lower center
  'ast-007': { x: 808,  y: 145 },   // Spray Booth  — Finishing
  'ast-005': { x: 808,  y: 368 },   // Dovetailer   — Joinery
  'ast-006': { x: 163,  y: 570 },   // Compressor   — Facilities
  'ast-009': { x: 240,  y: 620 },   // Dust Collector — Facilities
}

// ─── Dependency Edges ─────────────────────────────────────────────────────────

export type EdgeKind = 'feeds' | 'depends_on'

export interface DependencyEdge {
  from: string      // asset ID (source of the arrow)
  to:   string      // asset ID (head of the arrow)
  kind: EdgeKind
}

/**
 * Derived from mock asset depends_on / feeds arrays.
 * Arrows drawn from → to, indicating flow or dependency direction.
 *   feeds:      source FEEDS consumer  (dashed blue)
 *   depends_on: dependency → dependent (solid red)
 */
export const DEPENDENCY_EDGES: DependencyEdge[] = [
  // FEEDS — Beam Saw output feeds downstream machines
  { from: 'ast-004', to: 'ast-001', kind: 'feeds' },
  { from: 'ast-004', to: 'ast-002', kind: 'feeds' },
  { from: 'ast-004', to: 'ast-003', kind: 'feeds' },
  // FEEDS — Edge Bander output feeds Joinery
  { from: 'ast-001', to: 'ast-005', kind: 'feeds' },
  // FEEDS — Beam Saw also feeds Drillteq
  { from: 'ast-004', to: 'ast-008', kind: 'feeds' },
  // DEPENDS_ON — All three CNCs require the Air Compressor
  { from: 'ast-006', to: 'ast-002', kind: 'depends_on' },
  { from: 'ast-006', to: 'ast-003', kind: 'depends_on' },
  { from: 'ast-006', to: 'ast-008', kind: 'depends_on' },
]
