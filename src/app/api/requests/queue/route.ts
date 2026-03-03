import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

const URGENCY_WEIGHT: Record<string, number> = {
  emergency: 100,
  high: 75,
  normal: 50,
  low: 25,
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const requests = await prisma.workRequest.findMany({
      where: {
        organization_id: user.organization_id,
        status: 'submitted',
      },
      include: {
        asset: { select: { id: true, name: true, facility_asset_id: true } },
      },
      orderBy: { created_at: 'asc' },
    })

    // Sort by urgency weight DESC, then created_at ASC
    const sorted = requests.sort((a, b) => {
      const wa = URGENCY_WEIGHT[a.urgency] ?? 50
      const wb = URGENCY_WEIGHT[b.urgency] ?? 50
      if (wb !== wa) return wb - wa
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    // Add queue positions
    const withPositions = sorted.map((r, i) => ({
      ...r,
      queue_position: i + 1,
    }))

    return NextResponse.json(withPositions)
  } catch (err) {
    return handleApiError(err)
  }
}
