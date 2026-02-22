import type { WorkOrderPriority } from '@/types'

const CONFIG: Record<WorkOrderPriority, { label: string; classes: string }> = {
  low:      { label: 'Low',      classes: 'bg-slate-100 text-slate-500' },
  medium:   { label: 'Medium',   classes: 'bg-blue-100 text-blue-700'   },
  high:     { label: 'High',     classes: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', classes: 'bg-red-100 text-red-700 font-bold' },
}

export default function WorkOrderPriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  const { label, classes } = CONFIG[priority]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${classes}`}>
      {priority === 'critical' && <span className="mr-1" aria-hidden="true">!</span>}
      {label}
    </span>
  )
}
