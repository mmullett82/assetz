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
 * No fill/stroke colors — blueprint style uses no zone fills.
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

// ─── Department zones (~22 zones from annotated screenshot) ──────────────────

export const ZONES: Zone[] = [
  // ── North strip (Y ~3200–4400) ──────────────────────────────────────────────
  {
    id: 'white-wood',
    label: 'White Wood',
    x1:  500, y1: 3200, x2: 3084, y2: 4400,
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    x1: 2500, y1: 3800, x2: 3200, y2: 4400,
  },
  {
    id: 'compressor-chiller',
    label: 'Air Compressor & Chiller',
    x1: 3084, y1: 4000, x2: 3756, y2: 4400,
  },
  {
    id: 'finishing',
    label: 'Finishing',
    x1: 3084, y1: 3200, x2: 7116, y2: 4400,
  },
  {
    id: 'showroom',
    label: 'Showroom',
    x1: 7116, y1: 3200, x2: 8460, y2: 4400,
  },
  {
    id: 'lobby',
    label: 'Lobby',
    x1: 8460, y1: 3800, x2: 9200, y2: 4400,
  },

  // ── Middle production (Y ~700–3200) ─────────────────────────────────────────
  {
    id: 'west-storage',
    label: 'West Storage & Racking',
    x1:  500, y1:  700, x2: 1068, y2: 3200,
  },
  {
    id: 'mill',
    label: 'Mill',
    x1: 1068, y1:  700, x2: 3756, y2: 3200,
  },
  {
    id: 'kitting',
    label: 'Kitting',
    x1: 3756, y1:  700, x2: 7116, y2: 3200,
  },
  {
    id: 'assembly',
    label: 'Assembly',
    x1: 7116, y1:  700, x2: 8460, y2: 3200,
  },
  {
    id: 'ops-offices',
    label: 'Operations Offices',
    x1: 8460, y1: 2600, x2: 9808, y2: 3200,
  },
  {
    id: 'east-storage',
    label: 'East End Storage & Racking',
    x1: 8460, y1:  700, x2: 9808, y2: 2600,
  },
  {
    id: 'sales-tools',
    label: 'Sales Tools',
    x1: 9200, y1: 2200, x2: 9808, y2: 2600,
  },
  {
    id: 'breakroom',
    label: 'Breakroom & Food',
    x1: 9200, y1: 1800, x2: 9808, y2: 2200,
  },
  {
    id: 'grill-patio',
    label: 'Grill Patio',
    x1: 9808, y1: 1800, x2: 10200, y2: 2600,
  },

  // ── South strip (Y ~100–700) ────────────────────────────────────────────────
  {
    id: 'forklift-repair',
    label: 'Forklift Repair',
    x1:  500, y1:  100, x2: 1068, y2:  700,
  },
  {
    id: 'receiving',
    label: 'Receiving',
    x1: 1068, y1:  100, x2: 3756, y2:  700,
  },
  {
    id: 'welding',
    label: 'Welding',
    x1: 3756, y1:  100, x2: 5100, y2:  700,
  },
  {
    id: 'dust-collector',
    label: 'Dust Collector Storage',
    x1: 3756, y1: -200, x2: 5100, y2:  100,
  },
  {
    id: 'shipping',
    label: 'Shipping',
    x1: 5100, y1:  100, x2: 9808, y2:  700,
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
