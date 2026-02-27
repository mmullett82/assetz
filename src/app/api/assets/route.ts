import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
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
    if (sp.get('search')) {
      const q = sp.get('search')!
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { facility_asset_id: { contains: q, mode: 'insensitive' } },
        { asset_number: { contains: q, mode: 'insensitive' } },
        { manufacturer: { contains: q, mode: 'insensitive' } },
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
        },
      }),
      prisma.asset.count({ where }),
    ])

    const transformed = data.map((a) => {
      const { depends_on_edges, provider_edges, ...rest } = a
      return {
        ...rest,
        depends_on: depends_on_edges.filter((e) => e.type === 'DEPENDS_ON').map((e) => e.provider_id),
        feeds: depends_on_edges.filter((e) => e.type === 'FEEDS').map((e) => e.provider_id),
        dependents: provider_edges.map((e) => e.dependent_id),
      }
    })

    return NextResponse.json(paginate(transformed, total, page, pageSize))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const asset = await prisma.asset.create({
      data: {
        organization_id: user.organization_id,
        facility_id: body.facility_id,
        department_id: body.department_id,
        facility_asset_id: body.facility_asset_id,
        asset_number: body.asset_number,
        name: body.name,
        description: body.description,
        manufacturer: body.manufacturer,
        model: body.model,
        serial_number: body.serial_number,
        year_installed: body.year_installed,
        company_code: body.company_code,
        building_code: body.building_code,
        department_code: body.department_code,
        system_type: body.system_type,
        unit_type: body.unit_type,
        dependency_code: body.dependency_code,
        dependency_group: body.dependency_group,
        sequence: body.sequence,
        status: body.status || 'operational',
        location_notes: body.location_notes,
        floor_plan_x: body.floor_plan_x,
        floor_plan_y: body.floor_plan_y,
        floor_plan_zone: body.floor_plan_zone,
        current_meter_value: body.current_meter_value,
        meter_unit: body.meter_unit,
        purchase_price: body.purchase_price,
        purchase_date: body.purchase_date ? new Date(body.purchase_date) : undefined,
        warranty_title: body.warranty_title,
        warranty_expiration_date: body.warranty_expiration_date ? new Date(body.warranty_expiration_date) : undefined,
        warranty_vendor: body.warranty_vendor,
        safety_note: body.safety_note,
        assigned_to_id: body.assigned_to_id,
        tag_number: body.tag_number,
        rfid: body.rfid,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
