import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, errorResponse, sanitizeUser } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authUser = await requireAuth(request)
    const { id } = await context.params

    const user = await prisma.user.findFirst({
      where: { id, organization_id: authUser.organization_id },
    })
    if (!user) return errorResponse('User not found', 404)

    return NextResponse.json(sanitizeUser(user))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authUser = await requireAuth(request)
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.user.findFirst({
      where: { id, organization_id: authUser.organization_id },
    })
    if (!existing) return errorResponse('User not found', 404)

    // Don't allow password changes through this endpoint
    const { password_hash, password, ...updateData } = body

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(sanitizeUser(updated))
  } catch (err) {
    return handleApiError(err)
  }
}
