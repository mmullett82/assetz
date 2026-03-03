import { AlertTriangle, AlertOctagon, Info } from 'lucide-react'

interface SafetyItem {
  level: 'danger' | 'warning' | 'caution'
  text: string
}

const LEVEL_STYLES = {
  danger: { bg: 'bg-red-50 border-red-200', icon: AlertOctagon, iconColor: 'text-red-600', label: 'DANGER', labelColor: 'text-red-700' },
  warning: { bg: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-600', label: 'WARNING', labelColor: 'text-yellow-700' },
  caution: { bg: 'bg-blue-50 border-blue-200', icon: Info, iconColor: 'text-blue-600', label: 'CAUTION', labelColor: 'text-blue-700' },
}

interface Props {
  content: { items?: SafetyItem[] }
}

export default function SafetySection({ content }: Props) {
  if (!content.items?.length) return null
  return (
    <div className="space-y-2">
      {content.items.map((item, i) => {
        const style = LEVEL_STYLES[item.level] ?? LEVEL_STYLES.caution
        const Icon = style.icon
        return (
          <div key={i} className={`rounded-lg border p-3 ${style.bg}`}>
            <div className="flex items-start gap-2">
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.iconColor}`} />
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${style.labelColor}`}>{style.label}</span>
                <p className="text-sm text-slate-700 mt-0.5">{item.text}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
