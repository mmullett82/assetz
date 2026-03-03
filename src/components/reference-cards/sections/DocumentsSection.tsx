import { FileText, ExternalLink } from 'lucide-react'

interface Doc {
  name: string
  url: string
  type?: string
}

interface Props {
  content: { documents?: Doc[] }
}

export default function DocumentsSection({ content }: Props) {
  if (!content.documents?.length) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No documents linked</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {content.documents.map((doc, i) => (
        <a
          key={i}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
        >
          <FileText className="h-5 w-5 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
            {doc.type && <p className="text-xs text-slate-400">{doc.type}</p>}
          </div>
          <ExternalLink className="h-4 w-4 text-slate-400" />
        </a>
      ))}
    </div>
  )
}
