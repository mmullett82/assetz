'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useReferenceCardForAsset } from '@/hooks/useReferenceCard'
import ReferenceCardViewer from './ReferenceCardViewer'
import FixModeToggle from './FixModeToggle'

interface Props {
  assetId: string
  assetModel?: string
}

export default function ReferenceCardCollapsible({ assetId, assetModel }: Props) {
  const { card, isLoading } = useReferenceCardForAsset(assetId, assetModel)
  const [expanded, setExpanded] = useState(false)

  if (isLoading) return null
  if (!card) return null

  const sectionCount = card.sections?.length ?? 0

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-3 text-left hover:bg-blue-50 transition-colors"
      >
        <BookOpen className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{card.title}</p>
          <p className="text-xs text-slate-500">{sectionCount} sections · v{card.version}</p>
        </div>
        <span className="text-xs text-blue-600 font-medium mr-1">
          {expanded ? 'Collapse' : 'View guide'}
        </span>
        {expanded
          ? <ChevronDown className="h-4 w-4 text-blue-400" />
          : <ChevronRight className="h-4 w-4 text-blue-400" />
        }
      </button>

      {expanded && (
        <div className="border-t border-blue-200 p-4 space-y-4">
          <FixModeToggle />
          <ReferenceCardViewer card={card} compact />
          <div className="flex justify-end">
            <Link
              href={`/assets/${assetId}/reference-card`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
            >
              Full reference card <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
