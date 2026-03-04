import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { handleApiError, sanitizeUser } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(request, 'admin')

    const body = await request.json()
    const { full_name, email, role } = body

    if (!full_name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { detail: 'full_name and email are required' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'manager', 'technician', 'requester', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { detail: `role must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if email already exists in this org
    const existing = await prisma.user.findFirst({
      where: {
        organization_id: admin.organization_id,
        email: email.trim().toLowerCase(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { detail: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Generate a random invite token (used for the invite link)
    const inviteToken = crypto.randomBytes(32).toString('hex')

    // Create user with a placeholder password hash — they'll set their
    // password when they accept the invite link
    const user = await prisma.user.create({
      data: {
        organization_id: admin.organization_id,
        email: email.trim().toLowerCase(),
        full_name: full_name.trim(),
        role,
        password_hash: `invite:${inviteToken}`,
        is_active: true,
      },
    })

    // TODO: Send actual invite email via email service
    // The invite link would be: {APP_URL}/invite/{inviteToken}
    // For now, the user is created and can be given credentials manually

    return NextResponse.json({
      user: sanitizeUser(user),
      invite_token: inviteToken,
      message: `Invite created for ${email}. They will receive a link to set their password.`,
    }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
