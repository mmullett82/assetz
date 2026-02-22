import type { Part, PartStatus } from '@/types'

const STATUS_STYLES: Record<PartStatus, string> = {
  in_stock:     'bg-green-100 text-green-700',
  low_stock:    'bg-yellow-100 text-yellow-700',
  out_of_stock: 'bg-red-100 text-red-700',
  on_order:     'bg-blue-100 text-blue-700',
}

const STATUS_LABELS: Record<PartStatus, string> = {
  in_stock:     'In Stock',
  low_stock:    'Low Stock',
  out_of_stock: 'Out of Stock',
  on_order:     'On Order',
}

interface PartStockBadgeProps {
  status: PartStatus
}

export default function PartStockBadge({ status }: PartStockBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        STATUS_STYLES[status],
      ].join(' ')}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

/** Computed available quantity = on_hand - reserved */
export function availableQty(part: Part): number {
  return part.quantity_on_hand - part.quantity_reserved
}
