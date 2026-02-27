import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.crew.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Crew not found', 404)

    // Update crew name/lead and replace members
    await prisma.$transaction([
      prisma.crew.update({
        where: { id },
        data: { name: body.name, lead_user_id: body.lead_user_id },
      }),
      ...(body.member_ids ? [
        prisma.crewMember.deleteMany({ where: { crew_id: id } }),
        ...body.member_ids.map((uid: string) =>
          prisma.crewMember.create({ data: { crew_id: id, user_id: uid } })
        ),
      ] : []),
    ])

    const updated = await prisma.crew.findUnique({
      where: { id },
      include: { members: { include: { user: { select: { id: true, full_name: true } } } } },
    })

    return NextResponse.json({
      id: updated!.id,
      name: updated!.name,
      lead_user_id: updated!.lead_user_id,
      member_ids: updated!.members.map((m) => m.user_id),
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { id } = await context.params

    const existing = await prisma.crew.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Crew not found', 404)

    await prisma.crew.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
