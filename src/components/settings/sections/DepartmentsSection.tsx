'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { useDepartments } from '@/hooks/useDepartments'
import apiClient from '@/lib/api-client'
import type { Department } from '@/types'
import { showToast } from '@/hooks/useToast'

interface DeptForm {
  name: string
  code: string
  sub_locations: string[]
  subInput: string
}

const EMPTY_FORM: DeptForm = { name: '', code: '', sub_locations: [], subInput: '' }

export default function DepartmentsSection() {
  const { departments, mutate } = useDepartments()
  const [editing, setEditing] = useState<string | null>(null) // dept id or 'new'
  const [form, setForm] = useState<DeptForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function startNew() {
    setEditing('new')
    setForm(EMPTY_FORM)
  }

  function startEdit(dept: Department) {
    setEditing(dept.id)
    setForm({
      name: dept.name,
      code: dept.code,
      sub_locations: dept.sub_locations ?? [],
      subInput: '',
    })
  }

  function cancel() {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  function addSubLocation() {
    const val = form.subInput.trim()
    if (!val || form.sub_locations.includes(val)) return
    setForm((f) => ({ ...f, sub_locations: [...f.sub_locations, val], subInput: '' }))
  }

  function removeSubLocation(loc: string) {
    setForm((f) => ({ ...f, sub_locations: f.sub_locations.filter((s) => s !== loc) }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.code.trim()) {
      showToast('error', 'Name and code are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        sub_locations: form.sub_locations,
      }
      if (editing === 'new') {
        await apiClient.departments.create(payload)
      } else if (editing) {
        await apiClient.departments.update(editing, payload)
      }
      await mutate()
      cancel()
      showToast('success', editing === 'new' ? 'Department created' : 'Department updated')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(dept: Department) {
    if (!confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return
    try {
      await apiClient.departments.delete(dept.id)
      await mutate()
      showToast('success', 'Department deleted')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const inputClass = 'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Departments</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Define departments and their sub-locations. Sub-locations appear as options when adding assets.
          </p>
        </div>
        {editing !== 'new' && (
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        )}
      </div>

      {/* New department form */}
      {editing === 'new' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-blue-800">New Department</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Mill"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="MIL"
                maxLength={8}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <SubLocationEditor
            subLocations={form.sub_locations}
            subInput={form.subInput}
            onInputChange={(v) => setForm((f) => ({ ...f, subInput: v }))}
            onAdd={addSubLocation}
            onRemove={removeSubLocation}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saving ? 'Saving…' : 'Create'}
            </button>
            <button type="button" onClick={cancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Department list */}
      <div className="divide-y divide-slate-100">
        {departments.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">No departments yet. Add one above.</p>
        )}
        {departments.map((dept) => (
          <div key={dept.id}>
            {editing === dept.id ? (
              /* Inline edit form */
              <div className="py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                      maxLength={8}
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <SubLocationEditor
                  subLocations={form.sub_locations}
                  subInput={form.subInput}
                  onInputChange={(v) => setForm((f) => ({ ...f, subInput: v }))}
                  onAdd={addSubLocation}
                  onRemove={removeSubLocation}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={cancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Read-only row */
              <div className="flex items-start justify-between py-3 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{dept.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">{dept.code}</span>
                  </div>
                  {(dept.sub_locations?.length ?? 0) > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {dept.sub_locations!.map((loc) => (
                        <span key={loc} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{loc}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(dept)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(dept)}
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
    </div>
  )
}

function SubLocationEditor({
  subLocations,
  subInput,
  onInputChange,
  onAdd,
  onRemove,
}: {
  subLocations: string[]
  subInput: string
  onInputChange: (v: string) => void
  onAdd: () => void
  onRemove: (loc: string) => void
}) {
  const inputClass = 'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Sub-locations <span className="font-normal text-slate-400">(e.g. Bay A, North Wall)</span>
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={subInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd() } }}
          placeholder="Add sub-location…"
          className={inputClass}
        />
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Add
        </button>
      </div>
      {subLocations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subLocations.map((loc) => (
            <span key={loc} className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs text-blue-700">
              {loc}
              <button type="button" onClick={() => onRemove(loc)} className="hover:text-blue-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
