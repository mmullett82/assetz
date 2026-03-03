import { HelpCircle, ArrowRight } from 'lucide-react'

interface TreeNode {
  question: string
  yes: string
  no: string
}

interface Props {
  content: { tree?: TreeNode[] }
}

export default function TroubleshootingSection({ content }: Props) {
  if (!content.tree?.length) return null
  return (
    <div className="space-y-3">
      {content.tree.map((node, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start gap-2 mb-3">
            <HelpCircle className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-slate-900">{node.question}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 ml-7">
            <div className="rounded-lg bg-green-50 border border-green-200 p-2.5">
              <p className="text-xs font-bold text-green-700 uppercase mb-1 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> Yes
              </p>
              <p className="text-xs text-green-800">{node.yes}</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
              <p className="text-xs font-bold text-red-700 uppercase mb-1 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> No
              </p>
              <p className="text-xs text-red-800">{node.no}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
