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
    })
    if (!asset) return errorResponse('Asset not found', 404)

    // Get all dependency edges
    const [outgoing, incoming] = await Promise.all([
      prisma.assetDependency.findMany({
        where: { dependent_id: id },
        include: { provider: true },
      }),
      prisma.assetDependency.findMany({
        where: { provider_id: id },
        include: { dependent: true },
      }),
    ])

    return NextResponse.json({
      depends_on: outgoing.filter((e) => e.type === 'DEPENDS_ON').map((e) => e.provider),
      feeds: outgoing.filter((e) => e.type === 'FEEDS').map((e) => e.provider),
      dependents: incoming.map((e) => e.dependent),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
