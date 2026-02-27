import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ category: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { category } = await context.params

    const items = await prisma.configItem.findMany({
      where: { organization_id: user.organization_id, category },
      orderBy: { sort_order: 'asc' },
    })

    return NextResponse.json(items)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const { category } = await context.params
    const items = await request.json()

    // Replace all items for this category in a transaction
    await prisma.$transaction([
      prisma.configItem.deleteMany({
        where: { organization_id: user.organization_id, category },
      }),
      ...items.map((item: { key: string; label: string; sort_order: number; is_default: boolean; is_active: boolean; color?: string; extra?: unknown }) =>
        prisma.configItem.create({
          data: {
            organization_id: user.organization_id,
            category,
            key: item.key,
            label: item.label,
            sort_order: item.sort_order,
            is_default: item.is_default,
            is_active: item.is_active,
            color: item.color,
            extra: item.extra as object ?? undefined,
          },
        })
      ),
    ])

    const updated = await prisma.configItem.findMany({
      where: { organization_id: user.organization_id, category },
      orderBy: { sort_order: 'asc' },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}
