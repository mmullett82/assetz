import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.tag.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Tag not found', 404)

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
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

    const existing = await prisma.tag.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Tag not found', 404)

    await prisma.tag.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
