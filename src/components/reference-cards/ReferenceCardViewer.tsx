'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ReferenceCard, ReferenceCardSection, ReferenceCardSectionType } from '@/types'
import SafetySection from './sections/SafetySection'
import ProceduresSection from './sections/ProceduresSection'
import FailuresSection from './sections/FailuresSection'
import SparePartsSection from './sections/SparePartsSection'
import LubricationSection from './sections/LubricationSection'
import TroubleshootingSection from './sections/TroubleshootingSection'
import PhotosSection from './sections/PhotosSection'
import DocumentsSection from './sections/DocumentsSection'
import CustomSection from './sections/CustomSection'

const SECTION_RENDERERS: Record<ReferenceCardSectionType, React.ComponentType<{ content: Record<string, unknown> }>> = {
  safety: SafetySection,
  procedures: ProceduresSection,
  failures: FailuresSection,
  spare_parts: SparePartsSection,
  lubrication: LubricationSection,
  troubleshooting: TroubleshootingSection,
  photos: PhotosSection,
  documents: DocumentsSection,
  custom: CustomSection,
}

const SECTION_ICONS: Record<ReferenceCardSectionType, string> = {
  safety: '🛡️',
  procedures: '📋',
  failures: '⚠️',
  spare_parts: '🔧',
  lubrication: '💧',
  troubleshooting: '❓',
  photos: '📷',
  documents: '📄',
  custom: '📝',
}

interface Props {
  card: ReferenceCard
  compact?: boolean
}

export default function ReferenceCardViewer({ card, compact }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(compact ? [] : card.sections?.map((s) => s.id) ?? [])
  )

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  const sections = card.sections ?? []

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">{card.title}</h2>
          <p className="text-xs text-slate-500">
            Version {card.version} · {sections.length} sections
            {card.updated_by && <> · Updated by {card.updated_by.full_name}</>}
          </p>
        </div>
      )}

      {sections.map((section) => {
        const Renderer = SECTION_RENDERERS[section.section_type as ReferenceCardSectionType] ?? CustomSection
        const icon = SECTION_ICONS[section.section_type as ReferenceCardSectionType] ?? '📝'
        const isExpanded = expandedSections.has(section.id)

        return (
          <div key={section.id} className="rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-2 p-3 text-left hover:bg-slate-50 transition-colors"
            >
              {isExpanded
                ? <ChevronDown className="h-4 w-4 text-slate-400" />
                : <ChevronRight className="h-4 w-4 text-slate-400" />
              }
              <span className="text-sm">{icon}</span>
              <span className="text-sm font-medium text-slate-900">{section.title}</span>
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 pt-0">
                <Renderer content={section.content as Record<string, unknown>} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
