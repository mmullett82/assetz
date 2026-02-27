import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { handleApiError, sanitizeUser } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    return NextResponse.json(sanitizeUser(user))
  } catch (err) {
    return handleApiError(err)
  }
}
