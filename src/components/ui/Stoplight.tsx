/**
 * Stoplight — three stacked circles like a real traffic signal.
 *
 * All three circles (red, yellow, green) are always visible.
 * The active status is full brightness with a subtle glow.
 * Inactive circles show their real color at ~18% opacity.
 */

type Status = 'green' | 'yellow' | 'red'

const COLORS = {
  red:    '#ef4444',
  yellow: '#eab308',
  green:  '#22c55e',
} as const

const SIZES = {
  sm: { w: 14, h: 34, r: 4, rx: 4, pad: 1 },
  lg: { w: 30, h: 74, r: 10, rx: 8, pad: 1 },
} as const

interface StoplightProps {
  status: Status
  size?: 'sm' | 'lg'
}

export default function Stoplight({ status, size = 'sm' }: StoplightProps) {
  const { w, h, r, rx, pad } = SIZES[size]
  const cx = w / 2
  const spacing = (h - 2 * pad) / 3
  const cyRed    = pad + spacing / 2
  const cyYellow = pad + spacing + spacing / 2
  const cyGreen  = pad + 2 * spacing + spacing / 2

  const filterId = `glow-${size}`

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={size === 'lg' ? 4 : 3} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Housing */}
      <rect x={pad} y={pad} width={w - 2 * pad} height={h - 2 * pad} rx={rx} fill="#0f172a" />

      {/* Red */}
      <circle
        cx={cx}
        cy={cyRed}
        r={r}
        fill={COLORS.red}
        opacity={status === 'red' ? 1 : 0.18}
        filter={status === 'red' ? `url(#${filterId})` : undefined}
      />
      {/* Yellow */}
      <circle
        cx={cx}
        cy={cyYellow}
        r={r}
        fill={COLORS.yellow}
        opacity={status === 'yellow' ? 1 : 0.18}
        filter={status === 'yellow' ? `url(#${filterId})` : undefined}
      />
      {/* Green */}
      <circle
        cx={cx}
        cy={cyGreen}
        r={r}
        fill={COLORS.green}
        opacity={status === 'green' ? 1 : 0.18}
        filter={status === 'green' ? `url(#${filterId})` : undefined}
      />
    </svg>
  )
}
