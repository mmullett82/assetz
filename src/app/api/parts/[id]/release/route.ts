import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const { work_order_id } = await request.json()

    if (!work_order_id) {
      return errorResponse('work_order_id required', 400)
    }

    const reservations = await prisma.partReservation.findMany({
      where: { part_id: id, work_order_id },
    })

    if (reservations.length === 0) {
      return errorResponse('No reservation found for this part and work order', 404)
    }

    const totalReleased = reservations.reduce((sum, r) => sum + r.quantity_reserved, 0)

    await prisma.$transaction([
      prisma.partReservation.deleteMany({
        where: { part_id: id, work_order_id },
      }),
      prisma.part.update({
        where: { id },
        data: {
          quantity_reserved: { decrement: totalReleased },
        },
      }),
    ])

    // Recompute status
    const part = await prisma.part.findUnique({ where: { id } })
    if (part && part.status !== 'on_order') {
      const available = part.quantity_on_hand - part.quantity_reserved
      let status = 'in_stock'
      if (available <= 0) status = 'out_of_stock'
      else if (part.reorder_point && available <= part.reorder_point) status = 'low_stock'
      await prisma.part.update({ where: { id }, data: { status } })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
