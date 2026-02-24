/**
 * DXF → SVG coordinate transform for the SOLLiD Cabinetry floor plan.
 *
 * DXF coordinate system: X increases east, Y increases north. 1 unit = 1 inch.
 * SVG coordinate system: X increases east, Y increases south (standard SVG).
 *
 * Building bounds (DXF inches):  X: 500–9900  ·  Y: 100–4640
 * SVG canvas size:               1880 × 908 px  (scale = 0.2 px/inch)
 */

export const DXF_X_MIN = 500
export const DXF_X_MAX = 9900
export const DXF_Y_MIN = 100
export const DXF_Y_MAX = 4640

/** Scale factor: SVG pixels per DXF inch */
export const SCALE = 0.2

/** SVG canvas width in pixels */
export const SVG_W = Math.round((DXF_X_MAX - DXF_X_MIN) * SCALE)  // 1880

/** SVG canvas height in pixels */
export const SVG_H = Math.round((DXF_Y_MAX - DXF_Y_MIN) * SCALE)  // 908

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
