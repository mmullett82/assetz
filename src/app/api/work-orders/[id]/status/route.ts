import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse, computeDueStatus } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const { status } = await request.json()

    const existing = await prisma.workOrder.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Work order not found', 404)

    const now = new Date()
    const updateData: Record<string, unknown> = { status }

    // Auto-set timestamps on status transitions
    if (status === 'in_progress' && !existing.started_at) {
      updateData.started_at = now
    }
    if (status === 'completed') {
      updateData.completed_at = now
      updateData.completed_datetime = now
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        asset: { select: { id: true, name: true, facility_asset_id: true } },
        assigned_to: { select: { id: true, full_name: true, role: true } },
      },
    })

    return NextResponse.json({ ...updated, due_status: computeDueStatus(updated.due_date) })
  } catch (err) {
    return handleApiError(err)
  }
}
