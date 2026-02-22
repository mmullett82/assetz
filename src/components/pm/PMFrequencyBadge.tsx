import type { PMFrequency } from '@/types'
import { frequencyLabel } from '@/lib/pm-utils'
import { Repeat } from 'lucide-react'

interface PMFrequencyBadgeProps {
  frequency: PMFrequency
  intervalValue?: number
}

export default function PMFrequencyBadge({ frequency, intervalValue }: PMFrequencyBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      <Repeat className="h-3 w-3 shrink-0" aria-hidden="true" />
      {frequencyLabel(frequency, intervalValue)}
    </span>
  )
}
