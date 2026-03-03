import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const card = await prisma.referenceCard.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!card) return errorResponse('Reference card not found', 404)

    const versions = await prisma.referenceCardVersion.findMany({
      where: { reference_card_id: id },
      include: {
        changed_by: { select: { id: true, full_name: true } },
      },
      orderBy: { version: 'desc' },
    })

    return NextResponse.json(versions)
  } catch (err) {
    return handleApiError(err)
  }
}
