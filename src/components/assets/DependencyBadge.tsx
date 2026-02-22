import type { DependencyCode } from '@/types'

const CONFIG: Record<DependencyCode, { label: string; title: string; classes: string }> = {
  L: {
    label: 'Line',
    title: 'Production Line — direct dependency. One stops, line stops.',
    classes: 'bg-red-100 text-red-700 border border-red-200',
  },
  C: {
    label: 'Cell',
    title: 'Independent Cell — same-type group, not mechanically coupled.',
    classes: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  U: {
    label: 'Utility',
    title: 'Utility — serves multiple departments.',
    classes: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
}

export default function DependencyBadge({ code }: { code: DependencyCode }) {
  const { label, title, classes } = CONFIG[code]
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${classes}`}
    >
      {code} · {label}
    </span>
  )
}
