import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const tags = await prisma.tag.findMany({
      where: { organization_id: user.organization_id },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(tags)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'admin', 'manager')
    const body = await request.json()
    const tag = await prisma.tag.create({
      data: {
        organization_id: user.organization_id,
        name: body.name,
        color: body.color,
        sort_order: body.sort_order ?? 0,
      },
    })
    return NextResponse.json(tag, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
