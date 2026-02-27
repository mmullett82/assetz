import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse, computeDueStatus, sanitizeUser } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const pm = await prisma.pMSchedule.findFirst({
      where: { id, organization_id: user.organization_id },
      include: {
        asset: true,
        assigned_to: true,
      },
    })

    if (!pm) return errorResponse('PM schedule not found', 404)

    return NextResponse.json({
      ...pm,
      due_status: computeDueStatus(pm.next_due_at),
      assigned_to: pm.assigned_to ? sanitizeUser(pm.assigned_to) : undefined,
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.pMSchedule.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('PM schedule not found', 404)

    // Remove relational/computed fields
    const { asset, assigned_to, due_status, ...updateData } = body

    for (const field of ['next_due_at', 'last_completed_at', 'end_date']) {
      if (updateData[field] && typeof updateData[field] === 'string') {
        updateData[field] = new Date(updateData[field])
      }
    }

    const updated = await prisma.pMSchedule.update({
      where: { id },
      data: updateData,
      include: {
        asset: { select: { id: true, name: true, facility_asset_id: true } },
        assigned_to: { select: { id: true, full_name: true, role: true } },
      },
    })

    return NextResponse.json({ ...updated, due_status: computeDueStatus(updated.next_due_at) })
  } catch (err) {
    return handleApiError(err)
  }
}
