import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { handleApiError, errorResponse } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const departments = await prisma.department.findMany({
      where: { organization_id: user.organization_id },
      orderBy: { name: 'asc' },
    })

    // Cast sub_locations from Json to string[]
    const transformed = departments.map((d) => ({
      ...d,
      sub_locations: (d.sub_locations as string[] | null) ?? [],
    }))

    return NextResponse.json(transformed)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const body = await request.json()

    if (!body.name || !body.code) return errorResponse('name and code are required', 400)

    const facility = await prisma.facility.findFirst({
      where: { organization_id: user.organization_id },
      select: { id: true },
    })
    if (!facility) return errorResponse('No facility found', 400)

    const dept = await prisma.department.create({
      data: {
        organization_id: user.organization_id,
        facility_id: facility.id,
        name: body.name,
        code: body.code.toUpperCase(),
        sub_locations: body.sub_locations ?? [],
      },
    })
    return NextResponse.json({ ...dept, sub_locations: (dept.sub_locations as string[] | null) ?? [] }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
