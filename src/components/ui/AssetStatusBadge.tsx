import type { AssetStatus } from '@/types'
import Badge from './Badge'

const CONFIG: Record<AssetStatus, { label: string; variant: 'green' | 'red' | 'yellow' | 'slate' }> = {
  operational:     { label: 'Operational',     variant: 'green'  },
  down:            { label: 'Down',            variant: 'red'    },
  maintenance:     { label: 'Maintenance',     variant: 'yellow' },
  decommissioned:  { label: 'Decommissioned',  variant: 'slate'  },
}

export default function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const { label, variant } = CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
