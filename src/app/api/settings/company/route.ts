import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const org = await prisma.organization.findUnique({
      where: { id: user.organization_id },
    })

    return NextResponse.json(org)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const updated = await prisma.organization.update({
      where: { id: user.organization_id },
      data: { name: body.name, slug: body.slug },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
