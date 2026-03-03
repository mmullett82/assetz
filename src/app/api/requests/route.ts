import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { handleApiError, paginate, parsePagination } from '@/lib/api-helpers'
import { notifyManagers } from '@/lib/notification-helpers'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const sp = request.nextUrl.searchParams
    const { page, pageSize, skip } = parsePagination(sp)

    const where: Prisma.WorkRequestWhereInput = { organization_id: user.organization_id }

    // Requesters only see their own
    if (user.role === 'requester') {
      where.requester_id = user.id
    } else if (sp.get('requester_id')) {
      where.requester_id = sp.get('requester_id')!
    }

    if (sp.get('status')) {
      const statuses = sp.get('status')!.split(',')
      where.status = { in: statuses }
    }

    if (sp.get('urgency')) where.urgency = sp.get('urgency')!

    if (sp.get('period') === 'today') {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      where.created_at = { gte: start }
    }

    const [data, total] = await Promise.all([
      prisma.workRequest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        include: {
          asset: { select: { id: true, name: true, facility_asset_id: true } },
          reviewed_by: { select: { id: true, full_name: true } },
          assigned_tech: { select: { id: true, full_name: true } },
        },
      }),
      prisma.workRequest.count({ where }),
    ])

    return NextResponse.json(paginate(data, total, page, pageSize))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    if (!body.title) {
      return NextResponse.json({ detail: 'Title is required' }, { status: 400 })
    }

    const req = await prisma.workRequest.create({
      data: {
        organization_id: user.organization_id,
        requester_id: user.id,
        requester_name: user.full_name,
        asset_id: body.asset_id || undefined,
        asset_identifier: body.asset_identifier || undefined,
        title: body.title,
        description: body.description || undefined,
        urgency: body.urgency || 'normal',
        location_description: body.location_description || undefined,
        photo_urls: body.photo_urls || undefined,
        notify_on_assignment: body.notify_on_assignment ?? true,
        notify_on_completion: body.notify_on_completion ?? true,
        notify_on_queue_update: body.notify_on_queue_update ?? false,
      },
      include: {
        asset: { select: { id: true, name: true, facility_asset_id: true } },
      },
    })

    // Notify managers
    await notifyManagers(
      user.organization_id,
      'New maintenance request',
      `${user.full_name}: ${body.title}`,
      `/requests/${req.id}`
    )

    return NextResponse.json(req, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
