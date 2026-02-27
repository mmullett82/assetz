import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

function computePartStatus(available: number, reorderPoint: number | null): string {
  if (available <= 0) return 'out_of_stock'
  if (reorderPoint && available <= reorderPoint) return 'low_stock'
  return 'in_stock'
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const part = await prisma.part.findFirst({
      where: { id, organization_id: user.organization_id },
      include: {
        reservations: {
          include: {
            reserved_by: { select: { id: true, full_name: true } },
            work_order: { select: { id: true, work_order_number: true, title: true } },
          },
        },
        asset_parts: {
          include: {
            asset: { select: { id: true, name: true, facility_asset_id: true } },
          },
        },
      },
    })

    if (!part) return errorResponse('Part not found', 404)

    return NextResponse.json({
      ...part,
      compatible_assets: part.asset_parts.map((ap) => ap.asset_id),
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

    const existing = await prisma.part.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Part not found', 404)

    // Remove relational fields
    const { compatible_assets, reservations, asset_parts, ...updateData } = body

    // Auto-recompute status if quantity changes
    const qoh = updateData.quantity_on_hand ?? existing.quantity_on_hand
    const qr = updateData.quantity_reserved ?? existing.quantity_reserved
    const rp = updateData.reorder_point ?? existing.reorder_point
    const available = qoh - qr
    if (existing.status !== 'on_order') {
      updateData.status = computePartStatus(available, rp)
    }

    const updated = await prisma.part.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
