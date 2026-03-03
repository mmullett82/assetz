interface Props {
  content: { text?: string; html?: string }
}

export default function CustomSection({ content }: Props) {
  if (content.html) {
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content.html }} />
  }
  if (content.text) {
    return <p className="text-sm text-slate-700 whitespace-pre-wrap">{content.text}</p>
  }
  return <p className="text-sm text-slate-400 italic">No content</p>
}
