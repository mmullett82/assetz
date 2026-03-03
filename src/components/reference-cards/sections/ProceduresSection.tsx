interface Step {
  number: number
  text: string
  estimated_minutes?: number
}

interface Props {
  content: { steps?: Step[] }
}

export default function ProceduresSection({ content }: Props) {
  if (!content.steps?.length) return null
  return (
    <ol className="space-y-2">
      {content.steps.map((step) => (
        <li key={step.number} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {step.number}
          </span>
          <div className="flex-1">
            <p className="text-sm text-slate-700">{step.text}</p>
            {step.estimated_minutes && (
              <p className="text-xs text-slate-400 mt-0.5">~{step.estimated_minutes} min</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
