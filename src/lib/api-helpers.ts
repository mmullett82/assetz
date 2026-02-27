import { NextResponse } from 'next/server'
import type { User as PrismaUser } from '@prisma/client'
import type { DueStatus } from '@/types'

/** Standard error response */
export function errorResponse(detail: string, status: number) {
  return NextResponse.json({ detail, status_code: status }, { status })
}

/** Catch-all error handler for API routes */
export function handleApiError(err: unknown) {
  if (err instanceof Response) {
    return new NextResponse(err.body, {
      status: err.status,
      headers: err.headers,
    })
  }
  console.error('API Error:', err)
  const message = err instanceof Error ? err.message : 'Internal server error'
  return errorResponse(message, 500)
}

/** Strip password_hash from user before sending to client */
export function sanitizeUser(user: PrismaUser) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safe } = user
  return safe
}

/**
 * Compute red/yellow/green due status from a due date.
 * Green: 3+ days remaining or completed on time
 * Yellow: 1-2 days remaining
 * Red: past due
 */
export function computeDueStatus(dueDate: Date | string | null | undefined): DueStatus {
  if (!dueDate) return 'green'
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 0) return 'red'
  if (diffDays < 3) return 'yellow'
  return 'green'
}

/** Build paginated response wrapper */
export function paginate<T>(data: T[], total: number, page: number, pageSize: number) {
  return {
    data,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  }
}

/** Parse page/page_size from URL search params */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '50', 10)))
  return { page, pageSize, skip: (page - 1) * pageSize }
}
