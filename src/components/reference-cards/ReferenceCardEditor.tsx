'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Trash2, GripVertical, Loader2, Sparkles } from 'lucide-react'
import type { ReferenceCard, ReferenceCardSection, ReferenceCardSectionType } from '@/types'
import apiClient from '@/lib/api-client'
import { USE_MOCK } from '@/lib/config'
import SectionEditor from './SectionEditor'
import { showToast } from '@/hooks/useToast'

const SECTION_TYPES: { value: ReferenceCardSectionType; label: string }[] = [
  { value: 'safety', label: 'Safety Warnings' },
  { value: 'procedures', label: 'Procedures / Checklist' },
  { value: 'failures', label: 'Common Failures' },
  { value: 'spare_parts', label: 'Spare Parts' },
  { value: 'lubrication', label: 'Lubrication Schedule' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'photos', label: 'Photos' },
  { value: 'documents', label: 'Documents' },
  { value: 'custom', label: 'Custom / Notes' },
]

interface Props {
  card: ReferenceCard
  assetId: string
  onSave?: () => void
}

interface DraftSection {
  id: string
  section_type: ReferenceCardSectionType
  title: string
  sort_order: number
  content: Record<string, unknown>
  isNew?: boolean
}

export default function ReferenceCardEditor({ card, assetId, onSave }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(card.title)
  const [assetModel, setAssetModel] = useState(card.asset_model ?? '')
  const [isPublished, setIsPublished] = useState(card.is_published)
  const [sections, setSections] = useState<DraftSection[]>(
    (card.sections ?? []).map((s) => ({
      id: s.id,
      section_type: s.section_type as ReferenceCardSectionType,
      title: s.title,
      sort_order: s.sort_order,
      content: (typeof s.content === 'object' && s.content !== null ? s.content : {}) as Record<string, unknown>,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        section_type: 'custom',
        title: 'New Section',
        sort_order: prev.length,
        content: {},
        isNew: true,
      },
    ])
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  function updateSection(id: string, field: keyof DraftSection, value: string | number | Record<string, unknown>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (!USE_MOCK) {
        await apiClient.referenceCards.update(card.id, {
          title,
          asset_model: assetModel || undefined,
          is_published: isPublished,
        })

        // Save sections
        for (const section of sections) {
          if (section.isNew) {
            await apiClient.referenceCards.addSection(card.id, {
              section_type: section.section_type,
              title: section.title,
              sort_order: section.sort_order,
              content: section.content,
            })
          } else {
            await apiClient.referenceCards.updateSection(card.id, section.id, {
              section_type: section.section_type,
              title: section.title,
              sort_order: section.sort_order,
              content: section.content,
            })
          }
        }
      }
      showToast('success', 'Reference card saved')
      onSave?.()
      router.push(`/assets/${assetId}/reference-card`)
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerateAI() {
    if (!assetModel.trim()) {
      showToast('error', 'Enter an asset model name first')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/agent/generate-reference-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: assetModel }),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      if (data.sections && Array.isArray(data.sections)) {
        setSections(data.sections.map((s: { section_type: string; title: string; content: Record<string, unknown> }, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          section_type: s.section_type as ReferenceCardSectionType,
          title: s.title,
          sort_order: i,
          content: s.content,
          isNew: true,
        })))
        if (data.title) setTitle(data.title)
        showToast('success', 'AI-generated draft ready for review')
      }
    } catch {
      showToast('error', 'Could not generate reference card. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Card metadata */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Asset Model (shared across all assets of this model)
          </label>
          <input
            type="text"
            value={assetModel}
            onChange={(e) => setAssetModel(e.target.value)}
            placeholder="e.g. Biesse Rover B 1531"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-slate-300 text-blue-600"
          />
          <span className="text-sm text-slate-700">Published (visible to all users)</span>
        </label>

        {/* AI Generate button */}
        {sections.length === 0 && (
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={generating || !assetModel.trim()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Generating...' : 'Generate with AI'}
          </button>
        )}
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Sections</h3>
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add Section
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GripVertical className="h-4 w-4 text-slate-300" />
                <select
                  value={section.section_type}
                  onChange={(e) => updateSection(section.id, 'section_type', e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => removeSection(section.id)}
                  className="rounded-lg p-1 text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <SectionEditor
                sectionType={section.section_type}
                content={section.content}
                onChange={(newContent) => updateSection(section.id, 'content', newContent)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Reference Card
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
