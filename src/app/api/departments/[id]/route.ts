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

    const existing = await prisma.department.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Department not found', 404)

    const updated = await prisma.department.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code.toUpperCase() }),
        ...(body.sub_locations !== undefined && { sub_locations: body.sub_locations }),
      },
    })

    return NextResponse.json({ ...updated, sub_locations: (updated.sub_locations as string[] | null) ?? [] })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole(request, 'admin')
    const { id } = await context.params

    const existing = await prisma.department.findFirst({
      where: { id, organization_id: user.organization_id },
    })
    if (!existing) return errorResponse('Department not found', 404)

    await prisma.department.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
