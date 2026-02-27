import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const crews = await prisma.crew.findMany({
      where: { organization_id: user.organization_id },
      include: {
        members: {
          include: { user: { select: { id: true, full_name: true, email: true, role: true } } },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(crews.map((c) => ({
      id: c.id,
      name: c.name,
      lead_user_id: c.lead_user_id,
      member_ids: c.members.map((m) => m.user_id),
      members: c.members.map((m) => m.user),
    })))
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    const crew = await prisma.crew.create({
      data: {
        organization_id: user.organization_id,
        name: body.name,
        lead_user_id: body.lead_user_id,
        members: {
          create: (body.member_ids || []).map((uid: string) => ({ user_id: uid })),
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, full_name: true, email: true, role: true } } },
        },
      },
    })

    return NextResponse.json({
      id: crew.id,
      name: crew.name,
      lead_user_id: crew.lead_user_id,
      member_ids: crew.members.map((m) => m.user_id),
    }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
