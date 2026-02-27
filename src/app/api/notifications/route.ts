import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const notifications = await prisma.notification.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 50,
    })

    return NextResponse.json(notifications)
  } catch (err) {
    return handleApiError(err)
  }
}
