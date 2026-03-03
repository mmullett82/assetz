interface Props {
  position: number
}

export default function QueuePositionBadge({ position }: Props) {
  const bg = position <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${bg}`}>
      #{position}
    </span>
  )
}
