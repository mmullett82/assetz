import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, paginate, parsePagination } from '@/lib/api-helpers'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const sp = request.nextUrl.searchParams
    const { page, pageSize, skip } = parsePagination(sp)

    const where: Prisma.PartWhereInput = { organization_id: user.organization_id }

    if (sp.get('status')) where.status = sp.get('status')!
    if (sp.get('low_stock_only') === 'true') {
      where.status = { in: ['low_stock', 'out_of_stock'] }
    }
    if (sp.get('search')) {
      const q = sp.get('search')!
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { part_number: { contains: q, mode: 'insensitive' } },
        { manufacturer: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (sp.get('asset_id')) {
      where.asset_parts = { some: { asset_id: sp.get('asset_id')! } }
    }

    const [data, total] = await Promise.all([
      prisma.part.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
        include: {
          asset_parts: { select: { asset_id: true } },
        },
      }),
      prisma.part.count({ where }),
    ])

    const transformed = data.map((p) => ({
      ...p,
      compatible_assets: p.asset_parts.map((ap) => ap.asset_id),
      asset_parts: undefined,
    }))

    return NextResponse.json(paginate(transformed, total, page, pageSize))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const part = await prisma.part.create({
      data: {
        organization_id: user.organization_id,
        part_number: body.part_number,
        name: body.name,
        description: body.description,
        manufacturer: body.manufacturer,
        vendor: body.vendor,
        vendor_part_number: body.vendor_part_number,
        unit_of_measure: body.unit_of_measure || 'ea',
        unit_cost: body.unit_cost,
        quantity_on_hand: body.quantity_on_hand || 0,
        quantity_reserved: 0,
        reorder_point: body.reorder_point,
        reorder_quantity: body.reorder_quantity,
        status: body.status || 'in_stock',
        location: body.location,
        alternate_part_number: body.alternate_part_number,
        manufacturer_barcode: body.manufacturer_barcode,
        par_quantity: body.par_quantity,
        min_level: body.min_level,
        max_level: body.max_level,
      },
    })

    return NextResponse.json(part, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
