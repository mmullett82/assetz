import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const sp = request.nextUrl.searchParams

    const where: Record<string, unknown> = { organization_id: user.organization_id }
    if (sp.get('asset_id')) where.asset_id = sp.get('asset_id')

    const cards = await prisma.referenceCard.findMany({
      where,
      include: {
        sections: { orderBy: { sort_order: 'asc' } },
        created_by: { select: { id: true, full_name: true } },
        updated_by: { select: { id: true, full_name: true } },
      },
      orderBy: { updated_at: 'desc' },
    })

    return NextResponse.json(cards)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const body = await request.json()

    const card = await prisma.referenceCard.create({
      data: {
        organization_id: user.organization_id,
        asset_id: body.asset_id || undefined,
        asset_model: body.asset_model || undefined,
        title: body.title,
        is_published: body.is_published ?? false,
        created_by_id: user.id,
        updated_by_id: user.id,
      },
      include: {
        sections: true,
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
