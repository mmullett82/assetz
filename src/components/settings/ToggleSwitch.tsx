'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}: ToggleSwitchProps) {
  const pillW = size === 'sm' ? 'w-9'  : 'w-11'
  const pillH = size === 'sm' ? 'h-5'  : 'h-6'
  const dotSz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const dotOff = size === 'sm' ? 'translate-x-0.5' : 'translate-x-1'
  const dotOn  = size === 'sm' ? 'translate-x-[1.125rem]' : 'translate-x-[1.375rem]'

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        // Minimum 44px touch target via padding wrapper
        'p-[10px] -m-[10px]',
        pillW, pillH,
        checked ? 'bg-blue-600' : 'bg-slate-300',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
          dotSz,
          checked ? dotOn : dotOff,
        ].join(' ')}
      />
    </button>
  )
}
