/**
 * Compute Red/Yellow/Green due status from a due date.
 *
 * Rules (measured against DUE DATE, not creation date):
 *  Green:  completed on time, OR 3+ days remaining
 *  Yellow: 1–2 days remaining
 *  Red:    past due
 */

import type { DueStatus } from '@/types'

export function computeDueStatus(
  dueDateIso: string | undefined,
  completedAt?: string | undefined
): DueStatus {
  if (!dueDateIso) return 'green'

  const due  = new Date(dueDateIso).getTime()
  const now  = completedAt ? new Date(completedAt).getTime() : Date.now()
  const diffMs   = due - now
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (completedAt) {
    // Completed: green if on time, red if late
    return now <= due ? 'green' : 'red'
  }

  if (diffDays < 0)  return 'red'
  if (diffDays < 3)  return 'yellow'
  return 'green'
}

/** Relative due-date label for display (e.g. "2 days left", "3 days overdue") */
export function dueDateLabel(
  dueDateIso: string | undefined,
  completedAt?: string | undefined
): string {
  if (!dueDateIso) return ''

  const due  = new Date(dueDateIso)
  const now  = completedAt ? new Date(completedAt) : new Date()
  const diffMs   = due.getTime() - now.getTime()
  const diffDays = Math.round(Math.abs(diffMs) / (1000 * 60 * 60 * 24))

  if (completedAt) {
    const wasLate = now > due
    return wasLate
      ? `Completed ${diffDays}d late`
      : `Completed on time`
  }

  if (diffMs < 0) return `${diffDays}d overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `${diffDays}d left`
}

/** Short formatted date string */
export function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
}
