/**
 * Red/Yellow/Green badge — measured against DUE DATE, not creation date.
 *  Green:  on-time completion OR 3+ days remaining
 *  Yellow: 1–2 days remaining
 *  Red:    past due
 */
import type { DueStatus } from '@/types'
import Badge from './Badge'

const CONFIG: Record<DueStatus, { label: string; variant: 'green' | 'yellow' | 'red' }> = {
  green:  { label: 'On time', variant: 'green'  },
  yellow: { label: 'Due soon', variant: 'yellow' },
  red:    { label: 'Overdue',  variant: 'red'    },
}

export default function DueStatusBadge({ status }: { status: DueStatus }) {
  const { label, variant } = CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
