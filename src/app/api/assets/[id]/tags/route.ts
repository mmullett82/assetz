import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

// PUT /api/assets/[id]/tags — replace all tags for an asset
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager', 'technician')
    const { id } = await context.params
    const body = await request.json()
    const tag_ids: string[] = body.tag_ids ?? []

    const existing = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Asset not found', 404)

    // Replace all asset tags in a transaction
    await prisma.$transaction([
      prisma.assetTag.deleteMany({ where: { asset_id: id } }),
      ...(tag_ids.length > 0
        ? [prisma.assetTag.createMany({
            data: tag_ids.map((tag_id) => ({ asset_id: id, tag_id })),
          })]
        : []),
    ])

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
