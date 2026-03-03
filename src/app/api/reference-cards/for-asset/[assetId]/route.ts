import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ assetId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { assetId } = await context.params

    const asset = await prisma.asset.findFirst({
      where: { id: assetId, organization_id: user.organization_id },
    })
    if (!asset) return errorResponse('Asset not found', 404)

    // Resolution: specific asset first, then model match
    let card = await prisma.referenceCard.findFirst({
      where: { asset_id: assetId, organization_id: user.organization_id },
      include: {
        sections: { orderBy: { sort_order: 'asc' } },
        created_by: { select: { id: true, full_name: true } },
        updated_by: { select: { id: true, full_name: true } },
      },
    })

    if (!card && asset.model && asset.manufacturer) {
      const modelKey = `${asset.manufacturer} ${asset.model}`
      card = await prisma.referenceCard.findFirst({
        where: {
          asset_model: modelKey,
          organization_id: user.organization_id,
        },
        include: {
          sections: { orderBy: { sort_order: 'asc' } },
          created_by: { select: { id: true, full_name: true } },
          updated_by: { select: { id: true, full_name: true } },
        },
      })
    }

    return NextResponse.json(card)
  } catch (err) {
    return handleApiError(err)
  }
}
