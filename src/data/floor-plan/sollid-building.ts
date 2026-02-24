/**
 * SOLLiD Cabinetry building geometry — department zones and structural grid.
 * All coordinates are in DXF inches.
 *
 * Building bounds: X: 500–9900 · Y: 100–4640
 * Column grid:     15 columns at 56' (672") spacing starting at X=500
 * Y increases north in DXF; SVG transform flips Y so north appears at top.
 */

export interface Zone {
  id: string
  label: string
  /** West edge (DXF inches) */
  x1: number
  /** East edge (DXF inches) */
  x2: number
  /** South edge — low DXF Y (bottom of screen in SVG) */
  y1: number
  /** North edge — high DXF Y (top of screen in SVG) */
  y2: number
  fill: string
  stroke: string
}

export interface GridCol {
  x: number      // DXF inches
  label: string  // "1" … "15"
}

// ─── Structural column grid (56' = 672" bay spacing) ────────────────────────
export const GRID_COLS: GridCol[] = Array.from({ length: 15 }, (_, i) => ({
  x: 500 + i * 672,
  label: String(i + 1),
}))
// Col 1: 500 · Col 2: 1172 · Col 3: 1844 · … · Col 15: 9908

// ─── Department zones (non-overlapping, tile the full building floor) ────────
export const ZONES: Zone[] = [
  // ── North band  (Y: 3300–4640) ─────────────────────────────────────────────
  {
    id: 'offices',
    label: 'Offices',
    x1:  500, y1: 3300, x2: 1700, y2: 4640,
    fill: '#eff6ff', stroke: '#93c5fd',
  },
  {
    id: 'maint',
    label: 'Maintenance',
    x1: 1700, y1: 3300, x2: 4000, y2: 4640,
    fill: '#fef2f2', stroke: '#fca5a5',
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    x1: 4000, y1: 3300, x2: 9900, y2: 4640,
    fill: '#f8fafc', stroke: '#cbd5e1',
  },

  // ── Middle band  (Y: 2000–3300) ─────────────────────────────────────────────
  {
    id: 'lumber',
    label: 'Raw Material',
    x1:  500, y1: 2000, x2: 1700, y2: 3300,
    fill: '#f0fdf4', stroke: '#86efac',
  },
  {
    id: 'drawers',
    label: 'Drawer / Face Frame',
    x1: 1700, y1: 2000, x2: 4000, y2: 3300,
    fill: '#fdf4ff', stroke: '#d8b4fe',
  },
  {
    id: 'assembly',
    label: 'Assembly',
    x1: 4000, y1: 2000, x2: 6500, y2: 3300,
    fill: '#fefce8', stroke: '#fde047',
  },
  {
    id: 'fin-staging',
    label: 'Finishing Staging',
    x1: 6500, y1: 2000, x2: 9900, y2: 3300,
    fill: '#fff7ed', stroke: '#fb923c',
  },

  // ── South band  (Y: 100–2000) ────────────────────────────────────────────────
  // West & mid columns span full south band height
  {
    id: 'receiving',
    label: 'Receiving',
    x1:  500, y1:  100, x2: 1700, y2: 2000,
    fill: '#f0f9ff', stroke: '#7dd3fc',
  },
  {
    id: 'cnc',
    label: 'CNC / Millwork',
    x1: 1700, y1:  100, x2: 4000, y2: 2000,
    fill: '#dcfce7', stroke: '#4ade80',
  },
  {
    id: 'edge-bore',
    label: 'Edge Band / Boring',
    x1: 4000, y1:  100, x2: 6500, y2: 2000,
    fill: '#fffbeb', stroke: '#fbbf24',
  },
  // East column is split: Shipping Docks (low), Finishing (upper)
  {
    id: 'shipping',
    label: 'Shipping Docks',
    x1: 6500, y1:  100, x2: 9900, y2: 1000,
    fill: '#ecfdf5', stroke: '#6ee7b7',
  },
  {
    id: 'finishing',
    label: 'Finishing',
    x1: 6500, y1: 1000, x2: 9900, y2: 2000,
    fill: '#fff1f2', stroke: '#fda4af',
  },
]
