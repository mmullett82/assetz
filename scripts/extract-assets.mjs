/**
 * Extracts all asset number labels + machine insert positions from the DXF
 * and writes public/data/sollid-assets.json
 *
 * Matching logic:
 *   1. Collect all MTEXT/TEXT on "Asset Number" layer → these are the asset pins
 *   2. Collect all INSERT on "Machines" layer → production equipment footprints
 *   3. Proximity-match each asset label to nearest machine INSERT (within 800")
 *   4. Also collect Phase2 INSERTs (future layout machines)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import DxfParser from 'dxf-parser'
import path from 'path'

const DXF_PATH = '/Users/mmullett/Desktop/assetz/G2.5 EQUIPMENT LAYOUT EGRESS-2.dxf'

console.log('Parsing DXF (this takes ~30s for a 46MB file)...')
const raw = readFileSync(DXF_PATH, 'utf-8')
const parser = new DxfParser()
const dxf = parser.parseSync(raw)
const entities = dxf.entities || []

// ─── Strip MTEXT formatting codes ────────────────────────────────────────────
const stripMtext = s => s
  .replace(/\\[pPHhWwCcQqOoLlKk][^;]*;/g, '')
  .replace(/\\[A-Za-z]\d*;/g, '')
  .replace(/[{}]/g, '')
  .replace(/\\P/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim()

// ─── Asset Number labels ──────────────────────────────────────────────────────
const assetLabels = entities
  .filter(e => (e.type === 'MTEXT' || e.type === 'TEXT') && e.layer === 'Asset Number')
  .map(e => {
    const pt = e.position || e.insertionPoint || e.startPoint || {}
    const raw = (e.text || e.string || e.value || '')
    const label = stripMtext(raw)
    // Extract numeric ID — handle "NEW #257", "#9 / #189 FUTURE" etc.
    const primary = label.match(/#(\d+)/)?.[1] || null
    const isNew = /NEW/i.test(label)
    const isFuture = /FUTURE/i.test(label)
    return {
      raw: label,
      assetNumber: primary ? `#${primary}` : label,
      assetId: primary || null,
      x: pt.x || 0,
      y: pt.y || 0,
      isNew,
      isFuture,
    }
  })
  .filter(a => a.x !== 0 && a.y !== 0)
  .sort((a, b) => (Number(a.assetId) || 9999) - (Number(b.assetId) || 9999))

console.log(`  Found ${assetLabels.length} asset labels`)

// ─── Machine inserts (Machines layer) ─────────────────────────────────────────
const machineInserts = entities
  .filter(e => e.type === 'INSERT' && e.layer === 'Machines')
  .map(e => {
    const pt = e.position || e.insertionPoint || {}
    return {
      blockName: e.name,
      x: pt.x || 0,
      y: pt.y || 0,
      rotation: e.rotation || 0,
      xScale: e.xScale || 1,
      yScale: e.yScale || 1,
      layer: 'Machines',
    }
  })

console.log(`  Found ${machineInserts.length} machine inserts`)

// ─── Phase2 machine inserts ────────────────────────────────────────────────────
const phase2Inserts = entities
  .filter(e => e.type === 'INSERT' && e.layer === 'Phase2' && (
    machineInserts.some(m => m.blockName === e.name) ||
    ['HomagRobSaw1','HomagASR1','EdgeBander_Magazine','BlumHingeInsert','DoorPress',
     'MitersawTigerstop','HOMAG BHX 500','CeflaLines_20200916_V2'].includes(e.name)
  ))
  .map(e => {
    const pt = e.position || e.insertionPoint || {}
    return {
      blockName: e.name,
      x: pt.x || 0,
      y: pt.y || 0,
      rotation: e.rotation || 0,
      xScale: e.xScale || 1,
      yScale: e.yScale || 1,
      layer: 'Phase2',
    }
  })

// ─── Machine display names and sizes (half-width, half-height in DXF inches) ──
const MACHINE_META = {
  'BiesseRover1531LR':          { name: 'Biesse Rover B 1531 (CNC)',   type: 'cnc',          hw: 90, hh: 175 },
  'BiesseRover1531RL':          { name: 'Biesse Rover B 1531 (CNC)',   type: 'cnc',          hw: 90, hh: 175 },
  'Biesse Elix K3':             { name: 'Biesse Elix K3 (CNC Drill)',  type: 'cnc',          hw: 55, hh: 100 },
  'EB_Biesse_Akron_1440A':      { name: 'Biesse Akron 1440A (Edge Bander)', type: 'edge_bander', hw: 55, hh: 225 },
  'HOMAG BHX 500':              { name: 'HOMAG BHX 500 (Boring/Insert)', type: 'boring',     hw: 65, hh: 110 },
  'Holzma HPL400_2con':         { name: 'Holzma HPL400 (Panel Saw)',   type: 'panel_saw',    hw: 85, hh: 190 },
  'NestingInOutFeed4x10':       { name: 'CNC Nesting + In/Out Feed',   type: 'cnc',          hw: 65, hh: 350 },
  'CaseClampFeedThrough':       { name: 'Case Clamp',                  type: 'clamp',        hw: 80, hh: 190 },
  'CeflaLines_20200916_V2':     { name: 'Cefla Finishing Line',        type: 'finishing',    hw: 600, hh: 250 },
  'HomagRobSaw1':               { name: 'HOMAG Robot Beam Saw',        type: 'panel_saw',    hw: 120, hh: 250 },
  'HomagASR1':                  { name: 'HOMAG ASR1',                  type: 'conveyor',     hw: 60, hh: 150 },
  'EdgeBander_Magazine':        { name: 'Edge Bander + Magazine',      type: 'edge_bander',  hw: 50, hh: 200 },
  'DrawerBoxDovetail':          { name: 'Drawer Box Dovetail',         type: 'woodworking',  hw: 40, hh: 60  },
  'DrawerBoxNotcher':           { name: 'Drawer Box Notcher',          type: 'woodworking',  hw: 40, hh: 60  },
  'DrawerBoxLaser':             { name: 'Drawer Box Laser',            type: 'woodworking',  hw: 35, hh: 50  },
  'SanderWB':                   { name: 'Sander (Workbench)',          type: 'sander',       hw: 40, hh: 60  },
  'MITERSAW_TABLE3658X610':     { name: 'Miter Saw + Table',           type: 'saw',          hw: 35, hh: 150 },
  'MitersawTigerstop':          { name: 'Miter Saw (Tigerstop)',       type: 'saw',          hw: 35, hh: 130 },
  'PocketBoring':               { name: 'Pocket Boring Machine',       type: 'boring',       hw: 30, hh: 60  },
  'FaceFrameClamp':             { name: 'Face Frame Clamp',            type: 'clamp',        hw: 35, hh: 50  },
  'PillarMortiseTenonFaceFrame':{ name: 'Pillar/Mortise/Tenon (FF)',   type: 'woodworking',  hw: 45, hh: 100 },
  'SAWSTOP':                    { name: 'SawStop Table Saw',           type: 'saw',          hw: 35, hh: 60  },
  'DrawerPress':                { name: 'Drawer Press',                type: 'press',        hw: 30, hh: 50  },
  'BlumHingeInsert':            { name: 'Blum Hinge Insert',           type: 'woodworking',  hw: 30, hh: 50  },
  'DoorPress':                  { name: 'Door Press',                  type: 'press',        hw: 40, hh: 80  },
  'Transfer_Finish':            { name: 'Transfer Conveyor (Finish)',  type: 'conveyor',     hw: 50, hh: 100 },
  'DustCollect_2019_0351_i':    { name: 'Dust Collector System',       type: 'utility',      hw: 150, hh: 150},
  'PANEL SAW FL':               { name: 'Panel Saw',                   type: 'panel_saw',    hw: 60, hh: 180 },
  'MITERSAW_TABLE3658X610':     { name: 'Miter Saw + Table',           type: 'saw',          hw: 35, hh: 150 },
}
const DEFAULT_META = { name: '', type: 'equipment', hw: 40, hh: 60 }

// ─── Proximity match: asset label → nearest machine ───────────────────────────
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by)

// Filter out extreme outlier machines (SAWSTOP at X>10000 etc)
const validMachines = machineInserts.filter(m => m.x > 500 && m.x < 10000 && m.y > 0 && m.y < 5000)

const MATCH_RADIUS = 600 // inches — look for nearest machine within 50'

const matchedAssets = assetLabels.map(a => {
  // Find nearest valid machine
  let bestMachine = null
  let bestDist = MATCH_RADIUS
  for (const m of validMachines) {
    const d = dist(a.x, a.y, m.x, m.y)
    if (d < bestDist) {
      bestDist = d
      bestMachine = m
    }
  }

  const meta = bestMachine ? (MACHINE_META[bestMachine.blockName] || DEFAULT_META) : DEFAULT_META

  return {
    assetNumber: a.assetNumber,
    displayName: meta.name || (bestMachine?.blockName ?? ''),
    equipmentType: meta.type,
    x: Math.round(a.x),
    y: Math.round(a.y),
    dxfLabel: a.raw,
    nearestMachine: bestMachine?.blockName ?? null,
    nearestMachineDist: bestMachine ? Math.round(bestDist) : null,
    departmentZone: '',   // to be filled manually
    status: 'operational',
    isNew: a.isNew,
    isFuture: a.isFuture,
    notes: '',
  }
})

// ─── Machine footprints (separate from asset pins — for visual footprint) ─────
const machineFootprints = validMachines.map((m, i) => {
  const meta = MACHINE_META[m.blockName] || DEFAULT_META
  return {
    id: `machine-${i}`,
    blockName: m.blockName,
    displayName: meta.name || m.blockName,
    equipmentType: meta.type,
    x: Math.round(m.x),
    y: Math.round(m.y),
    rotation: Math.round(m.rotation),
    hw: meta.hw,
    hh: meta.hh,
    layer: m.layer,
  }
})

const phase2Footprints = phase2Inserts
  .filter(m => m.x > 500 && m.x < 10000 && m.y > 0 && m.y < 5000)
  .map((m, i) => {
    const meta = MACHINE_META[m.blockName] || DEFAULT_META
    return {
      id: `phase2-${i}`,
      blockName: m.blockName,
      displayName: meta.name || m.blockName,
      equipmentType: meta.type,
      x: Math.round(m.x),
      y: Math.round(m.y),
      rotation: Math.round(m.rotation),
      hw: meta.hw,
      hh: meta.hh,
      layer: 'Phase2',
    }
  })

// ─── Output ───────────────────────────────────────────────────────────────────
const output = {
  _meta: {
    source: 'G2.5 EQUIPMENT LAYOUT EGRESS-2.dxf',
    units: 'inches (1 DXF unit = 1 inch)',
    coordinateSystem: 'X increases east, Y increases north',
    facilityBounds: { xMin: 200, xMax: 10000, yMin: 0, yMax: 4800 },
    lastExtracted: new Date().toISOString(),
    instructions: 'Edit departmentZone and displayName manually. Add/remove entries freely. Positions are in DXF inches.',
  },
  assetPins: matchedAssets,
  machineFootprints: [
    ...machineFootprints,
    ...phase2Footprints.filter(p2 =>
      !machineFootprints.some(m => dist(m.x, m.y, p2.x, p2.y) < 200)
    ),
  ],
}

mkdirSync('/Users/mmullett/Desktop/assetz/public/data', { recursive: true })
writeFileSync(
  '/Users/mmullett/Desktop/assetz/public/data/sollid-assets.json',
  JSON.stringify(output, null, 2)
)

// ─── Print summary for verification ──────────────────────────────────────────
console.log('\n=== ASSET PINS EXTRACTED ===')
console.log(`Total: ${matchedAssets.length} asset labels`)
console.log('\nAll asset pins (assetNumber | x | y | nearestMachine | dist):')
matchedAssets.forEach(a => {
  const match = a.nearestMachine ? `${a.nearestMachine} (${a.nearestMachineDist}")` : '(unmatched)'
  const flags = [a.isNew && 'NEW', a.isFuture && 'FUTURE'].filter(Boolean).join(' ')
  console.log(`  ${(a.assetNumber).padEnd(12)} (${String(a.x).padStart(5)}, ${String(a.y).padStart(5)})  ${flags.padEnd(7)}  → ${match}`)
})

console.log('\n=== MACHINE FOOTPRINTS EXTRACTED ===')
machineFootprints.forEach(m => {
  console.log(`  ${m.blockName.padEnd(35)} @ (${m.x}, ${m.y}) rot=${m.rotation}°  ${m.hw*2}"×${m.hh*2}"`)
})

console.log('\n=== PHASE2 FOOTPRINTS (additional) ===')
phase2Footprints.filter(p2 => !machineFootprints.some(m => dist(m.x,m.y,p2.x,p2.y)<200)).forEach(m=>{
  console.log(`  ${m.blockName.padEnd(35)} @ (${m.x}, ${m.y}) rot=${m.rotation}°`)
})

console.log('\n✓ Wrote public/data/sollid-assets.json')
