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

    const where: Prisma.WorkOrderWhereInput = { organization_id: user.organization_id }

    if (sp.get('status')) where.status = sp.get('status')!
    if (sp.get('priority')) where.priority = sp.get('priority')!
    if (sp.get('asset_id')) where.asset_id = sp.get('asset_id')!
    if (sp.get('assigned_to_id')) where.assigned_to_id = sp.get('assigned_to_id')!
    if (sp.get('search')) {
      const q = sp.get('search')!
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { work_order_number: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        include: {
          asset: { select: { id: true, name: true, facility_asset_id: true, status: true } },
          requested_by: { select: { id: true, full_name: true, role: true, email: true } },
          assigned_to: { select: { id: true, full_name: true, role: true, email: true } },
        },
      }),
      prisma.workOrder.count({ where }),
    ])

    const transformed = data.map((wo) => ({
      ...wo,
      due_status: computeDueStatus(wo.due_date),
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

    // Auto-generate WO number
    const year = new Date().getFullYear()
    const lastWO = await prisma.workOrder.findFirst({
      where: {
        organization_id: user.organization_id,
        work_order_number: { startsWith: `WO-${year}-` },
      },
      orderBy: { work_order_number: 'desc' },
    })

    let nextSeq = 1
    if (lastWO) {
      const parts = lastWO.work_order_number.split('-')
      nextSeq = parseInt(parts[2]) + 1
    }
    const work_order_number = `WO-${year}-${String(nextSeq).padStart(4, '0')}`

    const wo = await prisma.workOrder.create({
      data: {
        organization_id: user.organization_id,
        work_order_number,
        asset_id: body.asset_id,
        type: body.type || 'corrective',
        status: body.status || 'open',
        priority: body.priority || 'medium',
        title: body.title,
        description: body.description,
        failure_code: body.failure_code,
        cause_code: body.cause_code,
        requested_by_id: body.requested_by_id || user.id,
        assigned_to_id: body.assigned_to_id,
        due_date: body.due_date ? new Date(body.due_date) : undefined,
        estimated_hours: body.estimated_hours,
        pm_schedule_id: body.pm_schedule_id,
        origin_type: body.origin_type || 'manual',
      },
      include: {
        asset: { select: { id: true, name: true, facility_asset_id: true } },
        requested_by: { select: { id: true, full_name: true, role: true } },
        assigned_to: { select: { id: true, full_name: true, role: true } },
      },
    })

    return NextResponse.json({ ...wo, due_status: computeDueStatus(wo.due_date) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
