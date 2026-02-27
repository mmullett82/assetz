import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse, computeDueStatus } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

/** Calculate next due date based on frequency */
function calcNextDue(frequency: string, from: Date): Date {
  const next = new Date(from)
  switch (frequency) {
    case 'daily': next.setDate(next.getDate() + 1); break
    case 'weekly': next.setDate(next.getDate() + 7); break
    case 'biweekly': next.setDate(next.getDate() + 14); break
    case 'monthly': next.setMonth(next.getMonth() + 1); break
    case 'quarterly': next.setMonth(next.getMonth() + 3); break
    case 'semiannual': next.setMonth(next.getMonth() + 6); break
    case 'annual': next.setFullYear(next.getFullYear() + 1); break
    default: next.setMonth(next.getMonth() + 1); break // default monthly
  }
  return next
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.pMSchedule.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('PM schedule not found', 404)

    const completedAt = body.completed_at ? new Date(body.completed_at) : new Date()
    const nextDue = calcNextDue(existing.frequency, completedAt)

    const updated = await prisma.pMSchedule.update({
      where: { id },
      data: {
        last_completed_at: completedAt,
        next_due_at: nextDue,
      },
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
