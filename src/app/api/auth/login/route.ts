import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { errorResponse, handleApiError, sanitizeUser } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return errorResponse('Email and password are required', 400)
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    if (!user.is_active) {
      return errorResponse('Account is deactivated', 403)
    }

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      return errorResponse('Invalid email or password', 401)
    }

    const token = signToken({ user_id: user.id, org_id: user.organization_id })

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: sanitizeUser(user),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
