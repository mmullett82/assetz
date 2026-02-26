/**
 * SOLLiD Cabinetry building geometry — department zones and structural grid.
 * All coordinates are in DXF inches.
 *
 * Building bounds: X: 500–9808 · Y: 0–4500
 * Column grid: corrected bay widths from screenshot
 *   Bay 1→2:  568" (47'-4")
 *   Bays 2→14: 672" each (56'-0")
 *   Bay 14→15: 676" (56'-4")
 * Y increases north in DXF; SVG transform flips Y so north appears at top.
 *
 * Zone positions corrected from SOLLiD-floor-plan.png annotated screenshot.
 * Key fix: Mill (grids 3-6), Kitting (grids 6-10), Assembly (grids 10-12)
 * do NOT overlap — they are side-by-side with clean boundaries.
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
}

export interface GridCol {
  x: number      // DXF inches
  label: string  // "1" … "15"
}

// ─── Structural column grid (corrected bay widths) ───────────────────────────
// C1=500, C2=1068 (+568), C3=1740 (+672), C4=2412, C5=3084, C6=3756,
// C7=4428, C8=5100, C9=5772, C10=6444, C11=7116, C12=7788, C13=8460,
// C14=9132, C15=9808 (+676)
export const GRID_COLS: GridCol[] = [
  { x: 500,  label: '1'  },
  { x: 1068, label: '2'  },
  { x: 1740, label: '3'  },
  { x: 2412, label: '4'  },
  { x: 3084, label: '5'  },
  { x: 3756, label: '6'  },
  { x: 4428, label: '7'  },
  { x: 5100, label: '8'  },
  { x: 5772, label: '9'  },
  { x: 6444, label: '10' },
  { x: 7116, label: '11' },
  { x: 7788, label: '12' },
  { x: 8460, label: '13' },
  { x: 9132, label: '14' },
  { x: 9808, label: '15' },
]

// ─── Grid rows (A–F, dividing building height) ──────────────────────────────
export interface GridRow {
  y: number      // DXF inches
  label: string  // "A" … "F"
}

export const GRID_ROWS: GridRow[] = [
  { y: 4500, label: 'A' },
  { y: 3750, label: 'B' },
  { y: 3000, label: 'C' },
  { y: 2250, label: 'D' },
  { y: 1500, label: 'E' },
  { y:  750, label: 'F' },
  { y:    0, label: 'G' },
]

// ─── Department zones (corrected from annotated screenshot) ──────────────────

export const ZONES: Zone[] = [
  // ── North strip (Y ~3200–4500) ──────────────────────────────────────────────
  {
    id: 'white-wood',
    label: 'White Wood',
    x1:  500, y1: 3200, x2: 3084, y2: 4500,
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    x1: 2412, y1: 3800, x2: 3084, y2: 4500,
  },
  {
    id: 'compressor-chiller',
    label: 'Air Compressor & Chiller',
    x1: 3084, y1: 4100, x2: 3756, y2: 4500,
  },
  {
    id: 'finishing',
    label: 'Finishing',
    x1: 3084, y1: 3200, x2: 7116, y2: 4500,
  },
  {
    id: 'showroom',
    label: 'Showroom',
    x1: 7116, y1: 3200, x2: 8460, y2: 4500,
  },
  {
    id: 'lobby',
    label: 'Lobby',
    x1: 8460, y1: 3800, x2: 9132, y2: 4500,
  },

  // ── Middle production (Y ~700–3200) ─────────────────────────────────────────
  {
    id: 'west-storage',
    label: 'West Storage & Racking',
    x1:  500, y1:  700, x2: 1740, y2: 3200,    // grids 1-3
  },
  {
    id: 'mill',
    label: 'Mill',
    x1: 1740, y1:  700, x2: 3756, y2: 3200,    // grids 3-6 (NOT overlapping kitting)
  },
  {
    id: 'kitting',
    label: 'Kitting',
    x1: 3756, y1:  700, x2: 6444, y2: 3200,    // grids 6-10 (center of building)
  },
  {
    id: 'assembly',
    label: 'Assembly',
    x1: 6444, y1:  700, x2: 7788, y2: 3200,    // grids 10-12 (right of kitting)
  },
  {
    id: 'ops-offices',
    label: 'Operations Offices',
    x1: 7116, y1: 2600, x2: 9132, y2: 3200,    // grids 11-14, upper strip
  },
  {
    id: 'east-storage',
    label: 'East End Storage & Racking',
    x1: 7788, y1:  700, x2: 9808, y2: 2600,    // grids 12-15
  },
  {
    id: 'sales-tools',
    label: 'Sales Tools',
    x1: 9132, y1: 2200, x2: 9808, y2: 2600,
  },
  {
    id: 'breakroom',
    label: 'Breakroom & Food',
    x1: 9132, y1: 1600, x2: 9808, y2: 2200,
  },
  {
    id: 'grill-patio',
    label: 'Grill Patio',
    x1: 9808, y1: 1600, x2: 10200, y2: 2600,
  },

  // ── South strip (Y ~0–700) ────────────────────────────────────────────────
  {
    id: 'forklift-repair',
    label: 'Forklift Repair',
    x1:  500, y1:  0, x2: 1740, y2:  700,       // grids 1-3
  },
  {
    id: 'receiving',
    label: 'Receiving',
    x1: 1740, y1:  0, x2: 3756, y2:  700,       // grids 3-6
  },
  {
    id: 'welding',
    label: 'Welding',
    x1: 3756, y1:  0, x2: 5100, y2:  700,       // grids 6-8
  },
  {
    id: 'dust-collector',
    label: 'Dust Collector Storage',
    x1: 3756, y1: -400, x2: 5100, y2:  0,       // below welding
  },
  {
    id: 'shipping',
    label: 'Shipping',
    x1: 5100, y1:  0, x2: 9808, y2:  700,       // grids 8-15
  },

  // ── Inside offices (approximate) ───────────────────────────────────────────
  {
    id: 'bathrooms-storage',
    label: 'Bathrooms & Storage',
    x1: 8460, y1: 3200, x2: 9132, y2: 3800,
  },
  {
    id: 'conference-room',
    label: 'Conference Room',
    x1: 9132, y1: 3200, x2: 9808, y2: 3800,
  },
]
