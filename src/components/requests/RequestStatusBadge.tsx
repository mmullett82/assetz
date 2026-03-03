import type { RequestStatus } from '@/types'

const STATUS_STYLES: Record<RequestStatus, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

interface Props {
  status: RequestStatus
}

export default function RequestStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.submitted}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
