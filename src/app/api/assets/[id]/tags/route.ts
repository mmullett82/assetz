import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

/** Replace all tags on an asset with the provided tag IDs */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const { tag_ids }: { tag_ids: string[] } = await request.json()

    const asset = await prisma.asset.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!asset) return errorResponse('Asset not found', 404)

    // Replace all asset tags in a transaction
    await prisma.$transaction([
      prisma.assetTag.deleteMany({ where: { asset_id: id } }),
      ...(tag_ids.length > 0
        ? [prisma.assetTag.createMany({
            data: tag_ids.map((tag_id) => ({ asset_id: id, tag_id })),
            skipDuplicates: true,
          })]
        : []),
    ])

    return NextResponse.json({ asset_id: id, tag_ids })
  } catch (err) {
    return handleApiError(err)
  }
}
