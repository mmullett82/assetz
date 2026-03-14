import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { handleApiError, errorResponse, paginate, parsePagination, computeDueStatus } from '@/lib/api-helpers'
import type { Prisma } from '@prisma/client'

// ─── Smart ID derivation helpers ──────────────────────────────────────────────

const SYSTEM_TYPE_MAP: Record<string, string> = {
  'cnc':          'CNC',
  'router':       'CNC',
  'nesting':      'CNC',
  'drill':        'CNC',
  'boring':       'CNC',
  'edge bander':  'EDGE',
  'edgebander':   'EDGE',
  'edge band':    'EDGE',
  'panel saw':    'SAW',
  'beam saw':     'SAW',
  'saw':          'SAW',
  'miter':        'SAW',
  'spray':        'SPRAY',
  'spraybooth':   'SPRAY',
  'finishing':    'SPRAY',
  'paint':        'SPRAY',
  'lacquer':      'SPRAY',
  'sander':       'SAND',
  'sanding':      'SAND',
  'press':        'PRESS',
  'clamp':        'PRESS',
  'conveyor':     'CONV',
  'compressor':   'AIR',
  'air':          'AIR',
  'dust':         'DUST',
  'collector':    'DUST',
  'hvac':         'HVAC',
  'chiller':      'HVAC',
  'forklift':     'FORK',
  'lift':         'LIFT',
  'pallet':       'LIFT',
  'pump':         'PUMP',
  'planer':       'PLAN',
  'jointer':      'JOIN',
  'dovetail':     'JOIN',
  'mortise':      'JOIN',
  'tenon':        'JOIN',
  'laser':        'LASER',
  'welder':       'WELD',
  'welding':      'WELD',
  'generator':    'GEN',
  'power':        'PWR',
  'desk':         'FURN',
  'table':        'WORK',
  'workbench':    'WORK',
}

const UNIT_TYPE_MAP: Record<string, string> = {
  'rover':        'ROVER',
  'beam saw':     'BEAM_SAW',
  'beam_saw':     'BEAM_SAW',
  'holzma':       'BEAM_SAW',
  'panel saw':    'PANEL_SAW',
  'edge bander':  'EDGE_BANDER',
  'edgebander':   'EDGE_BANDER',
  'akron':        'EDGE_BANDER',
  'spraybooth':   'SPRAYBOOTH',
  'spray booth':  'SPRAYBOOTH',
  'sander':       'SANDER',
  'dovetail':     'DOVETAILER',
  'dovetailer':   'DOVETAILER',
  'drill':        'DRILL',
  'drillteq':     'DRILLTEQ',
  'bhx':          'DRILL',
  'boring':       'BORING',
  'pocket':       'POCKET_BORING',
  'conveyor':     'CONVEYOR',
  'compressor':   'COMPRESSOR',
  'dust collector': 'DUST_COLLECTOR',
  'collector':    'DUST_COLLECTOR',
  'forklift':     'FORKLIFT',
  'raymond':      'FORKLIFT',
  'lift':         'LIFT',
  'pump':         'PUMP',
  'planer':       'PLANER',
  'press':        'PRESS',
  'clamp':        'CLAMP',
  'laser':        'LASER',
  'notcher':      'NOTCHER',
  'welder':       'WELDER',
  'generator':    'GENERATOR',
  'desk':         'DESK',
}

/** Try to derive a system type code from a descriptive string (e.g. category, name) */
function deriveSystemType(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [keyword, code] of Object.entries(SYSTEM_TYPE_MAP)) {
    if (lower.includes(keyword)) return code
  }
  return null
}

/** Try to derive a unit type code from a descriptive string (e.g. name, model) */
function deriveUnitType(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [keyword, code] of Object.entries(UNIT_TYPE_MAP)) {
    if (lower.includes(keyword)) return code
  }
  // If we can't match, try to create a reasonable code from the first significant word
  const words = text.trim().split(/\s+/).filter(w => w.length > 2)
  if (words.length > 0) {
    return words[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const sp = request.nextUrl.searchParams
    const { page, pageSize, skip } = parsePagination(sp)

    const where: Prisma.AssetWhereInput = { organization_id: user.organization_id }

    if (sp.get('status')) where.status = sp.get('status')!
    if (sp.get('department_id')) where.department_id = sp.get('department_id')!
    if (sp.get('sub_location')) where.sub_location = sp.get('sub_location')!
    if (sp.get('category')) where.category = sp.get('category')!
    if (sp.get('tag_id')) where.asset_tags = { some: { tag_id: sp.get('tag_id')! } }
    if (sp.get('search')) {
      const q = sp.get('search')!
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { facility_asset_id: { contains: q, mode: 'insensitive' } },
        { asset_number: { contains: q, mode: 'insensitive' } },
        { manufacturer: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        include: {
          depends_on_edges: { select: { provider_id: true, type: true } },
          provider_edges: { select: { dependent_id: true, type: true } },
          asset_tags: { include: { tag: true } },
        },
      }),
      prisma.asset.count({ where }),
    ])

    const transformed = data.map((a) => {
      const { depends_on_edges, provider_edges, asset_tags, ...rest } = a
      return {
        ...rest,
        depends_on: depends_on_edges.filter((e) => e.type === 'DEPENDS_ON').map((e) => e.provider_id),
        feeds: depends_on_edges.filter((e) => e.type === 'FEEDS').map((e) => e.provider_id),
        dependents: provider_edges.map((e) => e.dependent_id),
        tags: asset_tags.map((at) => at.tag),
      }
    })

    return NextResponse.json(paginate(transformed, total, page, pageSize))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const body = await request.json()

    // Auto-derive facility_id from the org if not provided
    let facilityId = body.facility_id
    if (!facilityId) {
      const facility = await prisma.facility.findFirst({
        where: { organization_id: user.organization_id },
        select: { id: true },
      })
      if (!facility) return errorResponse('No facility found for this organization', 400)
      facilityId = facility.id
    }

    // Smart department matching: if department_id not provided, try to match by name/code
    let departmentId = body.department_id
    let departmentCode = body.department_code
    if (!departmentId) {
      const allDepts = await prisma.department.findMany({
        where: { organization_id: user.organization_id },
        select: { id: true, name: true, code: true },
      })
      const rawDept = (body.department || '').trim().toLowerCase()
      if (rawDept && allDepts.length > 0) {
        // Try exact match on code or name (case-insensitive)
        const match = allDepts.find(
          (d) => d.code.toLowerCase() === rawDept || d.name.toLowerCase() === rawDept
        )
        // Try partial/contains match
        const partial = !match
          ? allDepts.find(
              (d) => d.name.toLowerCase().includes(rawDept) || rawDept.includes(d.name.toLowerCase())
            )
          : null
        const dept = match || partial
        if (dept) {
          departmentId = dept.id
          departmentCode = departmentCode || dept.code
        }
      }
      // Fallback to first department
      if (!departmentId && allDepts.length > 0) {
        departmentId = allDepts[0].id
        departmentCode = departmentCode || allDepts[0].code
      }
    }

    // ─── Smart ID auto-generation ─────────────────────────────────────────────
    // Facility Asset ID format: SC-B1-MIL-CNC-ROUTER-C3-01
    // Asset Number format: SLD-CNC-0001
    let facilityAssetId = body.facility_asset_id
    let assetNumber = body.asset_number

    const cc = body.company_code || 'SC'
    const bc = body.building_code || 'B1'
    const dc = departmentCode || body.department_code || 'GEN'
    // Derive system type from category, or body field, or default
    const st = body.system_type || deriveSystemType(body.category || body.name || '') || 'GEN'
    // Derive unit type from name/model, or body field, or default
    const ut = body.unit_type || deriveUnitType(body.name || body.model || '') || 'EQUIPMENT'
    const depCode = body.dependency_code || 'C'

    if (!facilityAssetId) {
      // Find the next available cell group and sequence for this dept+system+unit combo
      const existing = await prisma.asset.findMany({
        where: {
          organization_id: user.organization_id,
          department_code: dc,
          system_type: st,
          unit_type: ut,
        },
        select: { dependency_group: true, sequence: true },
        orderBy: [{ dependency_group: 'desc' }, { sequence: 'desc' }],
      })

      let group = 1
      let seq = 1
      if (existing.length > 0) {
        // Use the highest existing group for this dept+system+unit combo
        group = existing[0].dependency_group
        // Find the max sequence in that group
        const maxSeq = Math.max(...existing.filter(e => e.dependency_group === group).map(e => e.sequence))
        seq = maxSeq + 1
      }

      const seqStr = String(seq).padStart(2, '0')
      facilityAssetId = `${cc}-${bc}-${dc}-${st}-${ut}-${depCode}${group}-${seqStr}`

      // Check for uniqueness — if collision, increment sequence
      let collision = await prisma.asset.findUnique({ where: { facility_asset_id: facilityAssetId }, select: { id: true } })
      while (collision) {
        seq++
        const newSeqStr = String(seq).padStart(2, '0')
        facilityAssetId = `${cc}-${bc}-${dc}-${st}-${ut}-${depCode}${group}-${newSeqStr}`
        collision = await prisma.asset.findUnique({ where: { facility_asset_id: facilityAssetId }, select: { id: true } })
      }

      // Update body values for storage
      body.dependency_group = group
      body.sequence = seq
    }

    if (!assetNumber) {
      // Asset Number format: SLD-{TYPE}-{0001}
      const prefix = `SLD-${st}`
      const existingBarcodes = await prisma.asset.findMany({
        where: {
          organization_id: user.organization_id,
          asset_number: { startsWith: prefix },
        },
        select: { asset_number: true },
        orderBy: { asset_number: 'desc' },
      })

      let nextNum = 1
      if (existingBarcodes.length > 0) {
        // Extract the numeric suffix from the highest existing barcode
        const last = existingBarcodes[0].asset_number
        const numPart = last.split('-').pop()
        const parsed = parseInt(numPart || '0')
        if (!isNaN(parsed)) nextNum = parsed + 1
      }

      assetNumber = `${prefix}-${String(nextNum).padStart(4, '0')}`

      // Check uniqueness
      let bcCollision = await prisma.asset.findUnique({ where: { asset_number: assetNumber }, select: { id: true } })
      while (bcCollision) {
        nextNum++
        assetNumber = `${prefix}-${String(nextNum).padStart(4, '0')}`
        bcCollision = await prisma.asset.findUnique({ where: { asset_number: assetNumber }, select: { id: true } })
      }
    }

    const dateField = (v: unknown) => (v ? new Date(v as string) : undefined)

    const asset = await prisma.asset.create({
      data: {
        organization_id: user.organization_id,
        facility_id: facilityId,
        department_id: departmentId,
        facility_asset_id: facilityAssetId,
        asset_number: assetNumber,
        name: body.name,
        description: body.description,
        manufacturer: body.manufacturer,
        model: body.model,
        serial_number: body.serial_number,
        year_installed: body.year_installed,
        company_code: body.company_code || 'SC',
        building_code: body.building_code || 'B1',
        department_code: departmentCode || body.department_code || 'GEN',
        system_type: st,
        unit_type: ut,
        dependency_code: body.dependency_code || 'C',
        dependency_group: body.dependency_group ?? 1,
        sequence: body.sequence ?? 1,
        status: body.status || 'operational',
        sub_location: body.sub_location,
        category: body.category,
        electrical_panel_specs: body.electrical_panel_specs,
        imported_photo_ref: body.imported_photo_ref,
        imported_document_ref: body.imported_document_ref,
        location_notes: body.location_notes,
        floor_plan_x: body.floor_plan_x,
        floor_plan_y: body.floor_plan_y,
        floor_plan_zone: body.floor_plan_zone,
        current_meter_value: body.current_meter_value,
        meter_unit: body.meter_unit,
        last_meter_update: dateField(body.last_meter_update),
        // Purchase info
        purchase_price: body.purchase_price,
        purchase_date: dateField(body.purchase_date),
        purchase_invoice_number: body.purchase_invoice_number,
        expected_life_years: body.expected_life_years,
        replacement_cost: body.replacement_cost,
        salvage_value: body.salvage_value,
        // Warranty
        warranty_title: body.warranty_title,
        warranty_expiration_date: dateField(body.warranty_expiration_date),
        warranty_vendor: body.warranty_vendor,
        // Dates
        date_of_manufacture: dateField(body.date_of_manufacture),
        date_placed_in_service: dateField(body.date_placed_in_service),
        date_removed: dateField(body.date_removed),
        out_of_service_begin: dateField(body.out_of_service_begin),
        out_of_service_end: dateField(body.out_of_service_end),
        // Condition
        current_condition: body.current_condition,
        condition_date: dateField(body.condition_date),
        estimated_replace_date: dateField(body.estimated_replace_date),
        assessment_note: body.assessment_note,
        // Safety & procedures
        safety_note: body.safety_note,
        training_note: body.training_note,
        shutdown_procedure_note: body.shutdown_procedure_note,
        loto_procedure_note: body.loto_procedure_note,
        emergency_note: body.emergency_note,
        // Assignment
        assigned_to_id: body.assigned_to_id,
        emergency_contact_id: body.emergency_contact_id,
        tag_number: body.tag_number,
        rfid: body.rfid,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
