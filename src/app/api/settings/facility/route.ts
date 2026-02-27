import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const facilities = await prisma.facility.findMany({
      where: { organization_id: user.organization_id },
      include: { departments: { orderBy: { name: 'asc' } } },
    })

    return NextResponse.json(facilities)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ detail: 'Facility ID required' }, { status: 400 })
    }

    const updated = await prisma.facility.update({
      where: { id: body.id },
      data: {
        name: body.name,
        building_code: body.building_code,
        address: body.address,
        timezone: body.timezone,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
