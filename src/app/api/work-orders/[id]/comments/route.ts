import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse, sanitizeUser } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const { body } = await request.json()

    const wo = await prisma.workOrder.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!wo) return errorResponse('Work order not found', 404)

    const comment = await prisma.workOrderComment.create({
      data: {
        work_order_id: id,
        user_id: user.id,
        body,
      },
      include: { user: true },
    })

    return NextResponse.json({
      ...comment,
      user: sanitizeUser(comment.user),
    }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
