import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse, computeDueStatus, sanitizeUser } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const wo = await prisma.workOrder.findFirst({
      where: { id, organization_id: user.organization_id },
      include: {
        asset: true,
        requested_by: true,
        assigned_to: true,
        comments: {
          include: { user: true },
          orderBy: { created_at: 'asc' },
        },
        photos: { orderBy: { created_at: 'desc' } },
        parts_used: { include: { part: true } },
        labor_entries: {
          include: { user: { select: { id: true, full_name: true, role: true } } },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!wo) return errorResponse('Work order not found', 404)

    // Sanitize user objects
    const result = {
      ...wo,
      due_status: computeDueStatus(wo.due_date),
      requested_by: wo.requested_by ? sanitizeUser(wo.requested_by) : undefined,
      assigned_to: wo.assigned_to ? sanitizeUser(wo.assigned_to) : undefined,
      comments: wo.comments.map((c) => ({
        ...c,
        user: c.user ? sanitizeUser(c.user) : undefined,
      })),
    }

    return NextResponse.json(result)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.workOrder.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Work order not found', 404)

    // Remove relational fields
    const { asset, requested_by, assigned_to, comments, photos, parts_used, labor_entries, due_status, ...updateData } = body

    // Convert date strings
    for (const field of ['due_date', 'started_at', 'completed_at', 'originated_date', 'assigned_date', 'completed_datetime']) {
      if (updateData[field] && typeof updateData[field] === 'string') {
        updateData[field] = new Date(updateData[field])
      }
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
