import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const asset = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
      include: {
        department: true,
        depends_on_edges: { select: { provider_id: true, type: true } },
        provider_edges: { select: { dependent_id: true, type: true } },
      },
    })

    if (!asset) return errorResponse('Asset not found', 404)

    const { depends_on_edges, provider_edges, ...rest } = asset
    return NextResponse.json({
      ...rest,
      depends_on: depends_on_edges.filter((e) => e.type === 'DEPENDS_ON').map((e) => e.provider_id),
      feeds: depends_on_edges.filter((e) => e.type === 'FEEDS').map((e) => e.provider_id),
      dependents: provider_edges.map((e) => e.dependent_id),
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

    const existing = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Asset not found', 404)

    // Remove relational fields from update
    const { depends_on, feeds, dependents, asset, department, ...updateData } = body

    // Convert date strings to Date objects where needed
    const dateFields = ['purchase_date', 'warranty_expiration_date', 'date_of_manufacture', 'date_placed_in_service', 'date_removed', 'out_of_service_begin', 'out_of_service_end', 'condition_date', 'estimated_replace_date', 'last_meter_update']
    for (const field of dateFields) {
      if (updateData[field] && typeof updateData[field] === 'string') {
        updateData[field] = new Date(updateData[field])
      }
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const existing = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Asset not found', 404)

    await prisma.asset.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
