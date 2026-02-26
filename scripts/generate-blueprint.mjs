/**
 * Generate a static SVG blueprint from the SOLLiD DXF file.
 *
 * Outputs:
 *   public/data/sollid-blueprint.svg   — full-building SVG with layered <g> groups
 *   public/data/block-bounds.json      — bounding box per machine block name
 *
 * Layers (vibrant color palette on #0f172a canvas):
 *   Building                   → <g id="layer-building">  #e2e8f0 warm white 2px
 *   Aisles                     → <g id="layer-aisles">    #6366f1 indigo dotted 0.5px
 *   Storage and Buffer         → <g id="layer-storage">   #92400e amber 0.3px @ 40%
 *   Workbenches Plantequipment → <g id="layer-workbenches"> same as storage
 *   Machines (INSERT → rect)   → <g id="layer-machines">  #06b6d4 cyan 1.2px
 *   Phase2                     → <g id="layer-phase2">    #10b981 emerald 1px dashed
 *
 * Coordinate transform: svgX = (dxfX - 500) * 0.2, svgY = (4500 - dxfY) * 0.2
 * ViewBox: 0 0 1862 900
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import DxfParser from 'dxf-parser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DXF_PATH = resolve(ROOT, 'G2.5 EQUIPMENT LAYOUT EGRESS-2.dxf')
const SVG_OUT  = resolve(ROOT, 'public/data/sollid-blueprint.svg')
const BBOX_OUT = resolve(ROOT, 'public/data/block-bounds.json')

// ─── Constants ─────────────────────────────────────────────────────────────────

const DXF_X_MIN = 500
const DXF_Y_MAX = 4500
const SCALE     = 0.2
const SVG_W     = 1862
const SVG_H     = 900

// Bounds filter
const X_LO = 300, X_HI = 10200
const Y_LO = -700, Y_HI = 4700

// ─── Layer config — vibrant, distinct colors per layer ─────────────────────────

const LAYER_CFG = {
  'Building': {
    id: 'layer-building',
    stroke: '#e2e8f0',       // Bright warm white — building shell / walls / columns
    strokeWidth: 2,
  },
  'Aisles': {
    id: 'layer-aisles',
    stroke: '#6366f1',       // Indigo/purple — distinct from dept boundaries
    strokeWidth: 0.5,
    strokeDasharray: '2 4',  // dotted, not dashed
  },
  'Storage and Buffer': {
    id: 'layer-storage',
    stroke: '#92400e',       // Dim amber/orange — background texture
    strokeWidth: 0.3,
    strokeOpacity: 0.4,
  },
  'Workbenches Plantequipment': {
    id: 'layer-workbenches',
    stroke: '#92400e',       // Same as storage
    strokeWidth: 0.3,
    strokeOpacity: 0.4,
  },
  'Machines': {
    id: 'layer-machines',
    stroke: '#06b6d4',       // Bright cyan/teal — BRIGHTEST interactive elements
    strokeWidth: 1.2,
  },
  'Phase2': {
    id: 'layer-phase2',
    stroke: '#10b981',       // Vibrant emerald green — future overlay
    strokeWidth: 1,
    strokeDasharray: '4 3',
    opacity: 0.7,
  },
}

// ─── Coordinate transform ──────────────────────────────────────────────────────

function svgX(dxfX) { return (dxfX - DXF_X_MIN) * SCALE }
function svgY(dxfY) { return (DXF_Y_MAX - dxfY) * SCALE }
function f(n) { return +n.toFixed(2) }

function inBounds(x, y) {
  return x >= X_LO && x <= X_HI && y >= Y_LO && y <= Y_HI
}

// ─── SVG element builders ──────────────────────────────────────────────────────

function verticesFromEntity(e) {
  if (Array.isArray(e.vertices)) return e.vertices
  if (Array.isArray(e.points)) return e.points
  return []
}

function polyToPath(e, cfg) {
  const verts = verticesFromEntity(e)
  if (verts.length < 2) return ''
  if (!verts.some(v => inBounds(v.x ?? 0, v.y ?? 0))) return ''

  const closed = !!(e.shape || e.closed)
  const parts = []
  for (let i = 0; i < verts.length; i++) {
    const x = f(svgX(verts[i].x ?? 0))
    const y = f(svgY(verts[i].y ?? 0))
    parts.push(i === 0 ? `M${x},${y}` : `L${x},${y}`)
  }
  if (closed) parts.push('Z')

  // Outline only — no fills on dark canvas
  return `<path d="${parts.join(' ')}" fill="none" />`
}

function lineToPath(e) {
  const verts = e.vertices || []
  if (verts.length >= 2) {
    const [a, b] = verts
    if (!inBounds(a.x, a.y) && !inBounds(b.x, b.y)) return ''
    return `<path d="M${f(svgX(a.x))},${f(svgY(a.y))} L${f(svgX(b.x))},${f(svgY(b.y))}" fill="none" />`
  }
  const s = e.start || e.startPoint || {}
  const end = e.end || e.endPoint || {}
  if (!inBounds(s.x ?? 0, s.y ?? 0) && !inBounds(end.x ?? 0, end.y ?? 0)) return ''
  return `<path d="M${f(svgX(s.x ?? 0))},${f(svgY(s.y ?? 0))} L${f(svgX(end.x ?? 0))},${f(svgY(end.y ?? 0))}" fill="none" />`
}

function arcToPath(e) {
  const cx = e.center?.x ?? 0
  const cy = e.center?.y ?? 0
  const r  = e.radius ?? 0
  if (!inBounds(cx, cy)) return ''

  const startAngle = (e.startAngle ?? 0) * Math.PI / 180
  const endAngle   = (e.endAngle ?? 360) * Math.PI / 180

  const sx = f(svgX(cx + r * Math.cos(startAngle)))
  const sy = f(svgY(cy + r * Math.sin(startAngle)))
  const ex = f(svgX(cx + r * Math.cos(endAngle)))
  const ey = f(svgY(cy + r * Math.sin(endAngle)))
  const sr = f(r * SCALE)

  let angleDiff = endAngle - startAngle
  if (angleDiff < 0) angleDiff += 2 * Math.PI
  const largeArc = angleDiff > Math.PI ? 1 : 0

  return `<path d="M${sx},${sy} A${sr},${sr} 0 ${largeArc},0 ${ex},${ey}" fill="none" />`
}

function circleToElement(e) {
  const cx = e.center?.x ?? 0
  const cy = e.center?.y ?? 0
  if (!inBounds(cx, cy)) return ''
  return `<circle cx="${f(svgX(cx))}" cy="${f(svgY(cy))}" r="${f((e.radius ?? 0) * SCALE)}" fill="none" />`
}

// ─── Parse DXF ─────────────────────────────────────────────────────────────────

console.log('Parsing DXF...')
const raw = readFileSync(DXF_PATH, 'utf-8')
const parser = new DxfParser()
const dxf = parser.parseSync(raw)
const entities = dxf.entities || []
console.log(`  Total entities: ${entities.length}`)

// ─── Compute block bounding boxes ──────────────────────────────────────────────

const blockBounds = {}

function computeBlockBbox(blockName) {
  if (blockBounds[blockName]) return blockBounds[blockName]
  const block = dxf.blocks?.[blockName]
  if (!block || !block.entities) {
    blockBounds[blockName] = null
    return null
  }

  const xs = [], ys = []

  for (const e of block.entities) {
    if (['TEXT', 'MTEXT', 'DIMENSION', 'ATTDEF', 'ATTRIB', 'INSERT', 'SOLID', 'POINT'].includes(e.type)) continue

    const addPt = (x, y) => { xs.push(x); ys.push(y) }

    if (e.type === 'LINE') {
      const verts = e.vertices || []
      if (verts.length >= 2) {
        addPt(verts[0].x, verts[0].y)
        addPt(verts[1].x, verts[1].y)
      } else {
        const s = e.start || e.startPoint || {}
        const end = e.end || e.endPoint || {}
        addPt(s.x ?? 0, s.y ?? 0)
        addPt(end.x ?? 0, end.y ?? 0)
      }
    } else if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
      const verts = verticesFromEntity(e)
      for (const v of verts) addPt(v.x ?? 0, v.y ?? 0)
    } else if (e.type === 'ARC' || e.type === 'CIRCLE') {
      const r = e.radius ?? 0
      const cx = e.center?.x ?? 0
      const cy = e.center?.y ?? 0
      addPt(cx - r, cy - r)
      addPt(cx + r, cy + r)
    }
  }

  if (xs.length === 0) {
    blockBounds[blockName] = null
    return null
  }

  xs.sort((a, b) => a - b)
  ys.sort((a, b) => a - b)

  const pct = (arr, p) => arr[Math.floor(arr.length * p)] ?? arr[0]
  const q1x = pct(xs, 0.02), q3x = pct(xs, 0.98)
  const q1y = pct(ys, 0.02), q3y = pct(ys, 0.98)

  blockBounds[blockName] = {
    minX: q1x, minY: q1y, maxX: q3x, maxY: q3y,
    width: q3x - q1x,
    height: q3y - q1y,
  }
  return blockBounds[blockName]
}

// ─── Load footprint lookup from sollid-assets.json ─────────────────────────────

const assetsData = JSON.parse(readFileSync(resolve(ROOT, 'public/data/sollid-assets.json'), 'utf-8'))
const footprintLookup = new Map()
for (const fp of assetsData.machineFootprints || []) {
  footprintLookup.set(`${Math.round(fp.x)},${Math.round(fp.y)}`, fp)
}
console.log(`  Footprint lookup: ${footprintLookup.size} entries`)

// ─── Collect layer elements ────────────────────────────────────────────────────

const layerElements = {}
for (const layerName of Object.keys(LAYER_CFG)) {
  layerElements[layerName] = []
}

const counts = { lwp: 0, line: 0, arc: 0, circle: 0, insert: 0, poly: 0 }

for (const e of entities) {
  const layerName = e.layer
  if (!LAYER_CFG[layerName]) continue
  const cfg = LAYER_CFG[layerName]

  if (layerName === 'Machines' && e.type === 'INSERT') {
    const ix = e.position?.x ?? e.x ?? 0
    const iy = e.position?.y ?? e.y ?? 0
    if (!inBounds(ix, iy)) continue

    const fp = footprintLookup.get(`${Math.round(ix)},${Math.round(iy)}`)
    if (!fp) continue

    const rot = e.rotation ?? 0
    const scx = f(svgX(ix))
    const scy = f(svgY(iy))
    const sw = f(fp.hw * 2 * SCALE)
    const sh = f(fp.hh * 2 * SCALE)
    const srot = f(-rot)

    let rectStr = `<rect x="${f(scx - sw/2)}" y="${f(scy - sh/2)}" width="${sw}" height="${sh}" fill="none" rx="0.5"`
    if (rot !== 0) {
      rectStr += ` transform="rotate(${srot},${scx},${scy})"`
    }
    rectStr += ` data-block="${e.name}" />`
    layerElements[layerName].push(rectStr)
    counts.insert++
    continue
  }

  // Skip INSERT on non-Machines layers
  if (e.type === 'INSERT') continue

  let svg = ''
  if (e.type === 'LWPOLYLINE') {
    svg = polyToPath(e, cfg)
    if (svg) counts.lwp++
  } else if (e.type === 'POLYLINE') {
    svg = polyToPath(e, cfg)
    if (svg) counts.poly++
  } else if (e.type === 'LINE') {
    svg = lineToPath(e)
    if (svg) counts.line++
  } else if (e.type === 'ARC') {
    svg = arcToPath(e)
    if (svg) counts.arc++
  } else if (e.type === 'CIRCLE') {
    svg = circleToElement(e)
    if (svg) counts.circle++
  }

  if (svg) layerElements[layerName].push(svg)
}

// ─── Build SVG ─────────────────────────────────────────────────────────────────

const svgParts = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" width="${SVG_W}" height="${SVG_H}">`,
]

for (const [layerName, cfg] of Object.entries(LAYER_CFG)) {
  const elems = layerElements[layerName]
  if (!elems || elems.length === 0) continue

  const attrs = [
    `id="${cfg.id}"`,
    `stroke="${cfg.stroke}"`,
    `stroke-width="${cfg.strokeWidth}"`,
    `stroke-linecap="round"`,
    `stroke-linejoin="round"`,
    `fill="none"`,
  ]
  if (cfg.strokeDasharray) attrs.push(`stroke-dasharray="${cfg.strokeDasharray}"`)
  if (cfg.strokeOpacity) attrs.push(`stroke-opacity="${cfg.strokeOpacity}"`)
  if (cfg.opacity) attrs.push(`opacity="${cfg.opacity}"`)

  svgParts.push(`<g ${attrs.join(' ')}>`)
  for (const el of elems) {
    svgParts.push(el)
  }
  svgParts.push('</g>')
}

svgParts.push('</svg>')

// ─── Write outputs ─────────────────────────────────────────────────────────────

mkdirSync(dirname(SVG_OUT), { recursive: true })
const svgStr = svgParts.join('\n')
writeFileSync(SVG_OUT, svgStr)

const assetsJson = JSON.parse(readFileSync(resolve(ROOT, 'public/data/sollid-assets.json'), 'utf-8'))
const blockBoundsOut = {}
for (const fp of assetsJson.machineFootprints || []) {
  if (blockBoundsOut[fp.blockName]) continue
  blockBoundsOut[fp.blockName] = {
    hw: fp.hw,
    hh: fp.hh,
    widthPx: +(fp.hw * 2 * SCALE).toFixed(2),
    heightPx: +(fp.hh * 2 * SCALE).toFixed(2),
  }
}
writeFileSync(BBOX_OUT, JSON.stringify(blockBoundsOut, null, 2))

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n=== BLUEPRINT GENERATED ===')
for (const [layerName, elems] of Object.entries(layerElements)) {
  console.log(`  ${layerName.padEnd(32)}: ${elems.length} elements`)
}
console.log(`\nEntity types: ${counts.lwp} LWPOLYLINE, ${counts.line} LINE, ${counts.poly} POLYLINE, ${counts.arc} ARC, ${counts.circle} CIRCLE, ${counts.insert} INSERT`)
console.log(`Block names: ${Object.keys(blockBounds).filter(k => blockBounds[k]).length} unique`)
console.log(`\n✓ SVG: ${SVG_OUT}  (${(svgStr.length / 1024).toFixed(0)} KB)`)
console.log(`✓ Block bounds: ${BBOX_OUT}`)
