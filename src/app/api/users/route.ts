import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, sanitizeUser } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const users = await prisma.user.findMany({
      where: { organization_id: user.organization_id },
      orderBy: { full_name: 'asc' },
    })

    return NextResponse.json(users.map(sanitizeUser))
  } catch (err) {
    return handleApiError(err)
  }
}
