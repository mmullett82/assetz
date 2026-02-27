import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { errorResponse, handleApiError, sanitizeUser } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, organization_name } = await request.json()

    if (!email || !password || !full_name || !organization_name) {
      return errorResponse('All fields are required', 400)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return errorResponse('Email already registered', 409)
    }

    const password_hash = await hashPassword(password)
    const slug = organization_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const org = await prisma.organization.create({
      data: { name: organization_name, slug },
    })

    const user = await prisma.user.create({
      data: {
        organization_id: org.id,
        email,
        password_hash,
        full_name,
        role: 'admin',
      },
    })

    const token = signToken({ user_id: user.id, org_id: org.id })

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: sanitizeUser(user),
    }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
