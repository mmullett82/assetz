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
    const { reason } = await request.json()

    if (!reason) return errorResponse('Rejection reason is required', 400)

    const req = await prisma.workRequest.findFirst({
      where: { id, organization_id: user.organization_id, status: 'submitted' },
    })
    if (!req) return errorResponse('Request not found or already processed', 404)

    const updated = await prisma.workRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewed_by_id: user.id,
        reviewed_at: new Date(),
        rejection_reason: reason,
      },
    })

    // Notify requester
    await createNotification({
      organization_id: user.organization_id,
      user_id: req.requester_id,
      title: 'Request update',
      body: `Your request "${req.title}" was not approved: ${reason}`,
      type: 'warning',
      link: `/requests/${id}`,
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
