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

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        color: body.color ?? existing.color,
        sort_order: body.sort_order ?? existing.sort_order,
      },
    })
    return NextResponse.json(tag)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
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
