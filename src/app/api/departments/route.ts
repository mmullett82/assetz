import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const departments = await prisma.department.findMany({
      where: { organization_id: user.organization_id },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(departments)
  } catch (err) {
    return handleApiError(err)
  }
}
