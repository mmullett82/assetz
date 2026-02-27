import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, paginate, parsePagination, computeDueStatus } from '@/lib/api-helpers'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const sp = request.nextUrl.searchParams
    const { page, pageSize, skip } = parsePagination(sp)

    const where: Prisma.PMScheduleWhereInput = { organization_id: user.organization_id }

    if (sp.get('asset_id')) where.asset_id = sp.get('asset_id')!
    if (sp.get('is_active') !== null && sp.get('is_active') !== undefined) {
      where.is_active = sp.get('is_active') === 'true'
    }
    if (sp.get('overdue_only') === 'true') {
      where.next_due_at = { lt: new Date() }
      where.is_active = true
    }

    const [data, total] = await Promise.all([
      prisma.pMSchedule.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { next_due_at: 'asc' },
        include: {
          asset: { select: { id: true, name: true, facility_asset_id: true, status: true } },
          assigned_to: { select: { id: true, full_name: true, role: true } },
        },
      }),
      prisma.pMSchedule.count({ where }),
    ])

    const transformed = data.map((pm) => ({
      ...pm,
      due_status: computeDueStatus(pm.next_due_at),
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

    const pm = await prisma.pMSchedule.create({
      data: {
        organization_id: user.organization_id,
        asset_id: body.asset_id,
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        frequency: body.frequency || 'monthly',
        interval_value: body.interval_value,
        meter_interval: body.meter_interval,
        estimated_hours: body.estimated_hours,
        assigned_to_id: body.assigned_to_id,
        next_due_at: body.next_due_at ? new Date(body.next_due_at) : undefined,
        is_active: body.is_active ?? true,
        pm_type: body.pm_type,
        skip_if_open: body.skip_if_open,
        required_parts: body.required_parts,
      },
      include: {
        asset: { select: { id: true, name: true, facility_asset_id: true } },
        assigned_to: { select: { id: true, full_name: true, role: true } },
      },
    })

    return NextResponse.json({ ...pm, due_status: computeDueStatus(pm.next_due_at) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
