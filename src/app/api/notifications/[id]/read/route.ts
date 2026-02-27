import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const notification = await prisma.notification.findFirst({
      where: { id, user_id: user.id },
    })
    if (!notification) return errorResponse('Notification not found', 404)

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
