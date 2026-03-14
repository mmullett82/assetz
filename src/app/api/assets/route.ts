import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { handleApiError, errorResponse, paginate, parsePagination, computeDueStatus } from '@/lib/api-helpers'
import type { Prisma } from '@prisma/client'

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

    // Auto-derive department_id if not provided (use first dept in org)
    let departmentId = body.department_id
    if (!departmentId) {
      const dept = await prisma.department.findFirst({
        where: { organization_id: user.organization_id },
        select: { id: true, code: true },
      })
      if (dept) departmentId = dept.id
    }

    // For imports: auto-generate unique facility_asset_id and asset_number if missing
    let facilityAssetId = body.facility_asset_id
    let assetNumber = body.asset_number
    if (!facilityAssetId || !assetNumber) {
      // Use timestamp + random to guarantee uniqueness across concurrent requests
      const uid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
      if (!facilityAssetId) {
        const cc = body.company_code || 'SC'
        const bc = body.building_code || 'B1'
        const dc = body.department_code || 'IMP'
        const st = body.system_type || 'GEN'
        const ut = body.unit_type || 'EQUIPMENT'
        facilityAssetId = `${cc}-${bc}-${dc}-${st}-${ut}-C1-${uid}`
      }
      if (!assetNumber) {
        assetNumber = `IMP-${uid}`
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
        department_code: body.department_code || 'IMP',
        system_type: body.system_type || 'GEN',
        unit_type: body.unit_type || 'EQUIPMENT',
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
