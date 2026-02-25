/**
 * DXF → SVG coordinate transform for the SOLLiD Cabinetry floor plan.
 *
 * DXF coordinate system: X increases east, Y increases north. 1 unit = 1 inch.
 * SVG coordinate system: X increases east, Y increases south (standard SVG).
 *
 * Building bounds (DXF inches):  X: 500–9808  ·  Y: 0–4500
 * SVG canvas size:               1862 × 900 px  (scale = 0.2 px/inch)
 */

export const DXF_X_MIN = 500
export const DXF_X_MAX = 9808
export const DXF_Y_MIN = 0
export const DXF_Y_MAX = 4500

/** Scale factor: SVG pixels per DXF inch */
export const SCALE = 0.2

/** SVG canvas width in pixels */
export const SVG_W = Math.round((DXF_X_MAX - DXF_X_MIN) * SCALE)  // 1862

/** SVG canvas height in pixels */
export const SVG_H = Math.round(DXF_Y_MAX * SCALE)  // 900

/**
 * Convert a DXF (x, y) point in inches to SVG pixel coordinates.
 * Y-axis is flipped: high DXF-Y (north) → small SVG-Y (top of canvas).
 */
export function dxfToSvg(dxfX: number, dxfY: number): [number, number] {
  return [
    (dxfX - DXF_X_MIN) * SCALE,
    (DXF_Y_MAX - dxfY) * SCALE,
  ]
}

/** Convert DXF inches to SVG pixels (for sizes/dimensions). */
export const inchesToPx = (inches: number): number => inches * SCALE

/**
 * Find the smallest zone containing the given DXF point.
 * Returns null if the point is outside all zones.
 */
export function getZoneForPoint(
  x: number,
  y: number,
  zones: { id: string; x1: number; y1: number; x2: number; y2: number }[],
): { id: string; x1: number; y1: number; x2: number; y2: number } | null {
  let best: typeof zones[number] | null = null
  let bestArea = Infinity

  for (const zone of zones) {
    if (x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2) {
      const area = (zone.x2 - zone.x1) * (zone.y2 - zone.y1)
      if (area < bestArea) {
        best = zone
        bestArea = area
      }
    }
  }

  return best
}
