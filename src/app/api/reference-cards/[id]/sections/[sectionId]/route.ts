import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string; sectionId: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const { id, sectionId } = await context.params
    const body = await request.json()

    const card = await prisma.referenceCard.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!card) return errorResponse('Reference card not found', 404)

    const section = await prisma.referenceCardSection.update({
      where: { id: sectionId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.section_type && { section_type: body.section_type }),
        ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
        ...(body.content && { content: body.content }),
      },
    })

    await prisma.referenceCard.update({
      where: { id },
      data: { updated_by_id: user.id },
    })

    return NextResponse.json(section)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const { id, sectionId } = await context.params

    const card = await prisma.referenceCard.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!card) return errorResponse('Reference card not found', 404)

    await prisma.referenceCardSection.delete({ where: { id: sectionId } })

    await prisma.referenceCard.update({
      where: { id },
      data: { updated_by_id: user.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
