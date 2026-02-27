import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'assetz-dev-secret'

export interface JWTPayload {
  user_id: string
  org_id: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Extract and verify the authenticated user from a request.
 * Returns the user record or null if not authenticated.
 */
export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.user_id },
    })
    if (!user || !user.is_active) return null
    return user
  } catch {
    return null
  }
}

/**
 * Require authentication — returns user or throws 401 response.
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Response(JSON.stringify({ detail: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return user
}
