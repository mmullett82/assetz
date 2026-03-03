import { Droplets } from 'lucide-react'

interface LubPoint {
  location: string
  lubricant: string
  interval: string
  method: string
}

interface Props {
  content: { points?: LubPoint[] }
}

export default function LubricationSection({ content }: Props) {
  if (!content.points?.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="pb-2 pr-4 text-xs font-semibold text-slate-500 uppercase">Location</th>
            <th className="pb-2 pr-4 text-xs font-semibold text-slate-500 uppercase">Lubricant</th>
            <th className="pb-2 pr-4 text-xs font-semibold text-slate-500 uppercase">Interval</th>
            <th className="pb-2 text-xs font-semibold text-slate-500 uppercase">Method</th>
          </tr>
        </thead>
        <tbody>
          {content.points.map((p, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-blue-400" />
                  {p.location}
                </span>
              </td>
              <td className="py-2 pr-4 text-slate-600">{p.lubricant}</td>
              <td className="py-2 pr-4 text-slate-600">{p.interval}</td>
              <td className="py-2 text-slate-500">{p.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
