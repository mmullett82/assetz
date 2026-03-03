interface Failure {
  symptom: string
  cause: string
  fix: string
}

interface Props {
  content: { failures?: Failure[] }
}

export default function FailuresSection({ content }: Props) {
  if (!content.failures?.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="pb-2 pr-4 text-xs font-semibold text-slate-500 uppercase">Symptom</th>
            <th className="pb-2 pr-4 text-xs font-semibold text-slate-500 uppercase">Likely Cause</th>
            <th className="pb-2 text-xs font-semibold text-slate-500 uppercase">Fix</th>
          </tr>
        </thead>
        <tbody>
          {content.failures.map((f, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium text-red-700">{f.symptom}</td>
              <td className="py-2 pr-4 text-slate-600">{f.cause}</td>
              <td className="py-2 text-slate-700">{f.fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
