import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const req = await prisma.workRequest.findFirst({
      where: { id, organization_id: user.organization_id },
      include: {
        asset: { select: { id: true, name: true, facility_asset_id: true, status: true } },
        reviewed_by: { select: { id: true, full_name: true } },
        assigned_tech: { select: { id: true, full_name: true } },
        work_order: { select: { id: true, work_order_number: true, status: true } },
      },
    })

    if (!req) return errorResponse('Request not found', 404)

    // Requesters can only view their own
    if (user.role === 'requester' && req.requester_id !== user.id) {
      return errorResponse('Not authorized', 403)
    }

    return NextResponse.json(req)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.workRequest.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Request not found', 404)

    // Only requester can cancel their own request
    if (body.status === 'cancelled' && existing.requester_id !== user.id && user.role !== 'admin') {
      return errorResponse('Only the requester or admin can cancel', 403)
    }

    const updated = await prisma.workRequest.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.urgency && { urgency: body.urgency }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.notify_on_queue_update !== undefined && { notify_on_queue_update: body.notify_on_queue_update }),
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
