import { Package } from 'lucide-react'

interface SparePart {
  part_number: string
  name: string
  quantity?: number
  vendor?: string
}

interface Props {
  content: { parts?: SparePart[] }
}

export default function SparePartsSection({ content }: Props) {
  if (!content.parts?.length) return null
  return (
    <div className="space-y-2">
      {content.parts.map((part, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
          <Package className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">{part.name}</p>
            <p className="text-xs text-slate-500">
              PN: {part.part_number}
              {part.vendor && <> · {part.vendor}</>}
            </p>
          </div>
          {part.quantity && (
            <span className="text-xs text-slate-500">Keep {part.quantity} on hand</span>
          )}
        </div>
      ))}
    </div>
  )
}
