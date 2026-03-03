import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const { id } = await context.params
    const body = await request.json()

    const card = await prisma.referenceCard.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!card) return errorResponse('Reference card not found', 404)

    const section = await prisma.referenceCardSection.create({
      data: {
        reference_card_id: id,
        section_type: body.section_type,
        title: body.title,
        sort_order: body.sort_order ?? 0,
        content: body.content ?? {},
      },
    })

    // Update card's updated_by
    await prisma.referenceCard.update({
      where: { id },
      data: { updated_by_id: user.id },
    })

    return NextResponse.json(section, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
