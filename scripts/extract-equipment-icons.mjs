/**
 * Extract simplified SVG icons for each unique machine block in the DXF.
 *
 * For each block, renders geometric entities as SVG paths with a viewBox
 * set to the block bounding box + small padding.
 *
 * Outputs:
 *   public/assets/equipment-icons/{kebab-case-name}.svg
 *   public/assets/equipment-icons/index.json  — manifest
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import DxfParser from 'dxf-parser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DXF_PATH = resolve(ROOT, 'G2.5 EQUIPMENT LAYOUT EGRESS-2.dxf')
const ICONS_DIR = resolve(ROOT, 'public/assets/equipment-icons')
const BLOCK_BOUNDS = JSON.parse(readFileSync(resolve(ROOT, 'public/data/block-bounds.json'), 'utf-8'))

// ─── Category guesses based on block name ──────────────────────────────────────

const CATEGORY_MAP = {
  BiesseRover: 'CNC',
  Holzma: 'Panel Saws',
  HOMAG: 'CNC',
  HomagRobSaw: 'Panel Saws',
  HomagASR: 'Panel Saws',
  NestingInOutFeed: 'CNC',
  EB_Biesse: 'Edge Banders',
  EdgeBander: 'Edge Banders',
  Biesse_Elix: 'Edge Banders',
  Cefla: 'Finishing',
  CaseClamp: 'Clamps & Presses',
  FaceFrameClamp: 'Clamps & Presses',
  DoorPress: 'Clamps & Presses',
  PillarMortise: 'Woodworking',
  DrawerBox: 'Woodworking',
  SanderWB: 'Woodworking',
  PocketBoring: 'CNC',
  BlumHinge: 'Woodworking',
  MITERSAW: 'Woodworking',
  Mitersaw: 'Woodworking',
  SAWSTOP: 'Woodworking',
}

function guessCategory(blockName) {
  for (const [prefix, cat] of Object.entries(CATEGORY_MAP)) {
    if (blockName.includes(prefix)) return cat
  }
  return 'Equipment'
}

function toKebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_ ]+/g, '-')
    .toLowerCase()
}

function toDisplayName(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\d+$/, m => ' ' + m)
    .trim()
}

// ─── Parse DXF ─────────────────────────────────────────────────────────────────

console.log('Parsing DXF...')
const raw = readFileSync(DXF_PATH, 'utf-8')
const parser = new DxfParser()
const dxf = parser.parseSync(raw)

// Find unique block names used by Machines layer INSERTs
const usedBlocks = new Set()
for (const e of dxf.entities || []) {
  if (e.type === 'INSERT' && (e.layer === 'Machines' || e.layer === 'Phase2')) {
    usedBlocks.add(e.name)
  }
}

console.log(`  Blocks used by Machines/Phase2: ${usedBlocks.size}`)

// ─── Generate icons ────────────────────────────────────────────────────────────

mkdirSync(ICONS_DIR, { recursive: true })

function f(n) { return +n.toFixed(2) }

const manifest = []

for (const blockName of usedBlocks) {
  const block = dxf.blocks?.[blockName]
  if (!block || !block.entities) continue
  const bounds = BLOCK_BOUNDS[blockName]
  if (!bounds) continue

  // Use hw/hh from block-bounds.json (these are in DXF inches, hand-tuned)
  // Scale factor from INSERT: typically 0.03937 (mm→inches)
  // We need the block's native coordinate extent for the viewBox
  // Compute from entities
  const xs = [], ys = []
  const svgElements = []

  for (const e of block.entities) {
    if (['TEXT', 'MTEXT', 'DIMENSION', 'ATTDEF', 'ATTRIB', 'INSERT', 'SOLID', 'POINT', 'ELLIPSE', 'SPLINE'].includes(e.type)) continue

    if (e.type === 'LINE') {
      const verts = e.vertices || []
      if (verts.length >= 2) {
        xs.push(verts[0].x, verts[1].x)
        ys.push(verts[0].y, verts[1].y)
        svgElements.push(`<line x1="${f(verts[0].x)}" y1="${f(-verts[0].y)}" x2="${f(verts[1].x)}" y2="${f(-verts[1].y)}" />`)
      }
    } else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
      const verts = Array.isArray(e.vertices) ? e.vertices : (e.points || [])
      if (verts.length < 2) continue
      for (const v of verts) { xs.push(v.x ?? 0); ys.push(v.y ?? 0) }
      const closed = !!(e.shape || e.closed)
      const parts = verts.map((v, i) => {
        const px = f(v.x ?? 0)
        const py = f(-(v.y ?? 0))
        return i === 0 ? `M${px},${py}` : `L${px},${py}`
      })
      if (closed) parts.push('Z')
      svgElements.push(`<path d="${parts.join(' ')}" />`)
    } else if (e.type === 'ARC') {
      const cx = e.center?.x ?? 0
      const cy = e.center?.y ?? 0
      const r = e.radius ?? 0
      xs.push(cx - r, cx + r)
      ys.push(cy - r, cy + r)

      const sa = (e.startAngle ?? 0) * Math.PI / 180
      const ea = (e.endAngle ?? 360) * Math.PI / 180
      const sx = f(cx + r * Math.cos(sa))
      const sy = f(-(cy + r * Math.sin(sa)))
      const ex = f(cx + r * Math.cos(ea))
      const ey = f(-(cy + r * Math.sin(ea)))
      let ad = ea - sa
      if (ad < 0) ad += 2 * Math.PI
      const la = ad > Math.PI ? 1 : 0
      svgElements.push(`<path d="M${sx},${sy} A${f(r)},${f(r)} 0 ${la},0 ${ex},${ey}" />`)
    } else if (e.type === 'CIRCLE') {
      const cx = e.center?.x ?? 0
      const cy = e.center?.y ?? 0
      const r = e.radius ?? 0
      xs.push(cx - r, cx + r)
      ys.push(cy - r, cy + r)
      svgElements.push(`<circle cx="${f(cx)}" cy="${f(-cy)}" r="${f(r)}" />`)
    }
  }

  if (svgElements.length === 0 || xs.length === 0) continue

  // Compute viewBox with clipping (2nd-98th percentile)
  xs.sort((a, b) => a - b)
  ys.sort((a, b) => a - b)
  const pct = (arr, p) => arr[Math.floor(arr.length * p)] ?? arr[0]
  const pad = 50
  const vbMinX = pct(xs, 0.02) - pad
  const vbMaxX = pct(xs, 0.98) + pad
  const vbMinY = -(pct(ys, 0.98) + pad) // flip Y
  const vbMaxY = -(pct(ys, 0.02) - pad)
  const vbW = vbMaxX - vbMinX
  const vbH = vbMaxY - vbMinY

  const filename = toKebab(blockName) + '.svg'
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(vbMinX)} ${f(vbMinY)} ${f(vbW)} ${f(vbH)}" width="200" height="${f(200 * vbH / vbW)}">`,
    `<g stroke="#1e293b" stroke-width="${f(Math.max(vbW, vbH) * 0.003)}" fill="none" stroke-linecap="round" stroke-linejoin="round">`,
    ...svgElements,
    '</g>',
    '</svg>',
  ].join('\n')

  writeFileSync(resolve(ICONS_DIR, filename), svg)

  manifest.push({
    blockName,
    filename,
    displayName: toDisplayName(blockName),
    category: guessCategory(blockName),
    widthInches: bounds.hw * 2,
    heightInches: bounds.hh * 2,
  })

  console.log(`  ✓ ${filename} (${svgElements.length} elements)`)
}

// Write manifest
writeFileSync(resolve(ICONS_DIR, 'index.json'), JSON.stringify(manifest, null, 2))

console.log(`\n=== EQUIPMENT ICONS ===`)
console.log(`  ${manifest.length} icons generated`)
console.log(`  Manifest: public/assets/equipment-icons/index.json`)
