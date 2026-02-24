'use client'

interface AssetPinProps {
  assetNumber: string
  displayName: string
  x: number
  y: number
  color: string
  isSelected: boolean
  isHovered: boolean
  isNew: boolean
  isFuture: boolean
  onSelect: () => void
  onHover: (over: boolean) => void
}

export default function AssetPin({
  assetNumber,
  displayName,
  x,
  y,
  color,
  isSelected,
  isHovered,
  isNew,
  isFuture,
  onSelect,
  onHover,
}: AssetPinProps) {
  const active = isSelected || isHovered
  const r = active ? 9 : 7
  const stroke = isSelected ? '#1d4ed8' : isHovered ? '#374151' : 'white'
  const strokeW = isSelected ? 2.5 : 1.5
  const opacity = isFuture ? 0.5 : 1
  const label = assetNumber.replace('#', '')

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: 'pointer' }}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      opacity={opacity}
    >
      <title>{assetNumber}{displayName ? ` — ${displayName}` : ''}{isFuture ? ' (Future)' : ''}{isNew ? ' (New)' : ''}</title>

      {/* Selection ring */}
      {isSelected && (
        <circle r={r + 4} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeOpacity={0.4} />
      )}

      {/* Pin body */}
      <circle
        r={r}
        fill={color}
        stroke={stroke}
        strokeWidth={strokeW}
      />

      {/* NEW indicator */}
      {isNew && (
        <circle r={3} cx={r - 1} cy={-(r - 1)} fill="#3b82f6" />
      )}

      {/* Asset number label */}
      <text
        y={r + 7}
        textAnchor="middle"
        fontSize={7}
        fontWeight="600"
        fill="#1e293b"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  )
}
