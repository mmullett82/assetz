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

    const dept = await prisma.department.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        code: body.code ? body.code.toUpperCase() : existing.code,
        sub_locations: body.sub_locations ?? existing.sub_locations,
      },
    })
    return NextResponse.json({ ...dept, sub_locations: (dept.sub_locations as string[] | null) ?? [] })
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
