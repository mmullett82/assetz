import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const card = await prisma.referenceCard.findFirst({
      where: { id, organization_id: user.organization_id },
      include: {
        sections: { orderBy: { sort_order: 'asc' } },
        created_by: { select: { id: true, full_name: true } },
        updated_by: { select: { id: true, full_name: true } },
      },
    })

    if (!card) return errorResponse('Reference card not found', 404)
    return NextResponse.json(card)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.referenceCard.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Reference card not found', 404)

    const updated = await prisma.referenceCard.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.asset_model !== undefined && { asset_model: body.asset_model }),
        ...(body.is_published !== undefined && { is_published: body.is_published }),
        updated_by_id: user.id,
        version: { increment: 1 },
      },
      include: {
        sections: { orderBy: { sort_order: 'asc' } },
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin')
    const { id } = await context.params

    const existing = await prisma.referenceCard.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Reference card not found', 404)

    await prisma.referenceCard.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
