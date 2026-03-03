import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'
import { createNotification } from '@/lib/notification-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const { id } = await context.params
    const body = await request.json()

    const req = await prisma.workRequest.findFirst({
      where: { id, organization_id: user.organization_id, status: 'submitted' },
      include: { asset: true },
    })
    if (!req) return errorResponse('Request not found or already processed', 404)

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

    // Create WO from the request
    const wo = await prisma.workOrder.create({
      data: {
        organization_id: user.organization_id,
        work_order_number,
        asset_id: req.asset_id!,
        type: 'corrective',
        status: 'open',
        priority: body.priority || 'medium',
        title: req.title,
        description: req.description || req.title,
        requested_by_id: req.requester_id,
        assigned_to_id: body.assigned_to_id || undefined,
        due_date: body.due_date ? new Date(body.due_date) : undefined,
        origin_type: 'request',
      },
    })

    // Update the request
    await prisma.workRequest.update({
      where: { id },
      data: {
        status: 'approved',
        reviewed_by_id: user.id,
        reviewed_at: new Date(),
        assigned_priority: body.priority,
        assigned_tech_id: body.assigned_to_id || undefined,
        work_order_id: wo.id,
      },
    })

    // Notify requester
    await createNotification({
      organization_id: user.organization_id,
      user_id: req.requester_id,
      title: 'Request approved',
      body: `Your request "${req.title}" has been approved and a work order created.`,
      type: 'info',
      link: `/requests/${id}`,
    })

    return NextResponse.json({ ...req, status: 'approved', work_order_id: wo.id })
  } catch (err) {
    return handleApiError(err)
  }
}
