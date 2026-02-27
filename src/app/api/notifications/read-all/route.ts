import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    await prisma.notification.updateMany({
      where: { user_id: user.id, read: false },
      data: { read: true },
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
