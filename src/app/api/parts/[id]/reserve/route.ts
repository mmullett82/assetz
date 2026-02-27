import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const { work_order_id, quantity } = await request.json()

    if (!work_order_id || !quantity || quantity <= 0) {
      return errorResponse('work_order_id and positive quantity required', 400)
    }

    const part = await prisma.part.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!part) return errorResponse('Part not found', 404)

    const available = part.quantity_on_hand - part.quantity_reserved
    if (quantity > available) {
      return errorResponse(`Only ${available} available (${part.quantity_on_hand} on hand, ${part.quantity_reserved} reserved)`, 400)
    }

    // Create reservation and update part in a transaction
    await prisma.$transaction([
      prisma.partReservation.create({
        data: {
          part_id: id,
          work_order_id,
          quantity_reserved: quantity,
          reserved_by_id: user.id,
        },
      }),
      prisma.part.update({
        where: { id },
        data: {
          quantity_reserved: { increment: quantity },
          status: (part.quantity_on_hand - part.quantity_reserved - quantity) <= 0
            ? 'out_of_stock'
            : (part.reorder_point && (part.quantity_on_hand - part.quantity_reserved - quantity) <= part.reorder_point)
              ? 'low_stock'
              : part.status,
        },
      }),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
