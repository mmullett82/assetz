import type { WorkOrderStatus } from '@/types'
import Badge from '@/components/ui/Badge'

const CONFIG: Record<WorkOrderStatus, { label: string; variant: 'blue' | 'green' | 'yellow' | 'red' | 'slate' | 'default' }> = {
  open:        { label: 'Open',        variant: 'blue'    },
  in_progress: { label: 'In Progress', variant: 'yellow'  },
  on_hold:     { label: 'On Hold',     variant: 'slate'   },
  completed:   { label: 'Completed',   variant: 'green'   },
  cancelled:   { label: 'Cancelled',   variant: 'default' },
}

export default function WorkOrderStatusBadge({ status }: { status: WorkOrderStatus }) {
  const { label, variant } = CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
