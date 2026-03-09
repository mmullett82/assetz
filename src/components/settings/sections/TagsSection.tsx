'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { useTags } from '@/hooks/useTags'
import apiClient from '@/lib/api-client'
import type { Tag } from '@/types'
import { showToast } from '@/hooks/useToast'

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#64748b', // slate
]

interface TagForm {
  name: string
  color: string
}

const EMPTY_FORM: TagForm = { name: '', color: PRESET_COLORS[0] }

export default function TagsSection() {
  const { tags, mutate } = useTags()
  const [editing, setEditing] = useState<string | null>(null) // tag id or 'new'
  const [form, setForm] = useState<TagForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function startNew() {
    setEditing('new')
    setForm(EMPTY_FORM)
  }

  function startEdit(tag: Tag) {
    setEditing(tag.id)
    setForm({ name: tag.name, color: tag.color ?? PRESET_COLORS[0] })
  }

  function cancel() {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast('error', 'Tag name is required')
      return
    }
    setSaving(true)
    try {
      if (editing === 'new') {
        await apiClient.tags.create({ name: form.name.trim(), color: form.color })
      } else if (editing) {
        await apiClient.tags.update(editing, { name: form.name.trim(), color: form.color })
      }
      await mutate()
      cancel()
      showToast('success', editing === 'new' ? 'Tag created' : 'Tag updated')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tag: Tag) {
    if (!confirm(`Delete tag "${tag.name}"? It will be removed from all assets.`)) return
    try {
      await apiClient.tags.delete(tag.id)
      await mutate()
      showToast('success', 'Tag deleted')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const inputClass = 'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

  function TagFormFields({ onCancel }: { onCancel: () => void }) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tag Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave() } }}
            placeholder="Critical Equipment"
            className={inputClass}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color }))}
                className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: form.color === color ? 'white' : color,
                  boxShadow: form.color === color ? `0 0 0 2px ${color}` : undefined,
                }}
                aria-label={color}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {saving ? 'Saving…' : editing === 'new' ? 'Create' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Asset Labels / Tags</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Create color-coded tags to label and filter assets across the system.
          </p>
        </div>
        {editing !== 'new' && (
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Tag
          </button>
        )}
      </div>

      {/* New tag form */}
      {editing === 'new' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800 mb-3">New Tag</p>
          <TagFormFields onCancel={cancel} />
        </div>
      )}

      {/* Tag list */}
      {tags.length === 0 && editing !== 'new' ? (
        <p className="py-6 text-center text-sm text-slate-400">No tags yet. Add one above.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {tags.map((tag) => (
            <div key={tag.id} className="py-3">
              {editing === tag.id ? (
                <TagFormFields onCancel={cancel} />
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color ?? '#64748b' }}
                    />
                    <span className="text-sm font-medium text-slate-800">{tag.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
