'use client'

import { useState, useRef } from 'react'
import { ChevronDown, ChevronRight, Pencil, AlertTriangle } from 'lucide-react'
import { MOCK_FACILITY_SETTINGS, type MockBuilding, type MockDepartment } from '@/lib/mock-settings'

interface BuildingWithDepts extends MockBuilding {
  departments: MockDepartment[]
}

function buildTree(facility: typeof MOCK_FACILITY_SETTINGS): BuildingWithDepts[] {
  return facility.buildings.map(b => ({
    ...b,
    departments: facility.departments.filter(d => d.building_id === b.id),
  }))
}

// ─── Small inline modal ────────────────────────────────────────────────────────
interface InlineModalProps {
  title: string
  onClose: () => void
  onSave: (data: { name: string; code: string }) => void
  initial?: { name: string; code: string }
  codePlaceholder?: string
  showWarning?: boolean
}

function InlineModal({ title, onClose, onSave, initial, codePlaceholder, showWarning }: InlineModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const overlayRef = useRef<HTMLDivElement>(null)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return
    onSave({ name: name.trim(), code: code.trim().toUpperCase() })
  }

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-end sm:items-center p-4 bg-black/50"
    >
      <div className="w-full max-w-sm mx-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
            <input
              required
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={codePlaceholder ?? 'e.g. B1'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {showWarning && (
              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>Changing a building code won&apos;t auto-update existing asset IDs.</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FacilitySection() {
  const [tree, setTree] = useState<BuildingWithDepts[]>(buildTree(MOCK_FACILITY_SETTINGS))
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'bldg-1': true })

  type ModalState =
    | { type: 'add-building' }
    | { type: 'edit-building'; bldgId: string }
    | { type: 'add-dept'; bldgId: string }
    | { type: 'edit-dept'; bldgId: string; deptId: string }
    | null

  const [modal, setModal] = useState<ModalState>(null)

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleSaveBldg(data: { name: string; code: string }) {
    if (modal?.type === 'add-building') {
      setTree(prev => [...prev, { id: `bldg-${Date.now()}`, name: data.name, code: data.code, departments: [] }])
    } else if (modal?.type === 'edit-building') {
      setTree(prev => prev.map(b => b.id === modal.bldgId ? { ...b, ...data } : b))
    }
    setModal(null)
  }

  function handleSaveDept(data: { name: string; code: string }) {
    if (!modal || (modal.type !== 'add-dept' && modal.type !== 'edit-dept')) return
    const bldgId = modal.bldgId

    if (modal.type === 'add-dept') {
      const newDept: MockDepartment = { id: `dept-${Date.now()}`, building_id: bldgId, name: data.name, code: data.code }
      setTree(prev => prev.map(b => b.id === bldgId ? { ...b, departments: [...b.departments, newDept] } : b))
    } else if (modal.type === 'edit-dept') {
      const deptId = modal.deptId
      setTree(prev => prev.map(b => b.id === bldgId
        ? { ...b, departments: b.departments.map(d => d.id === deptId ? { ...d, ...data } : d) }
        : b
      ))
    }
    setModal(null)
  }

  function getModalProps() {
    if (!modal) return null
    if (modal.type === 'add-building') {
      return { title: 'Add Building', onSave: handleSaveBldg, showWarning: false, codePlaceholder: 'e.g. B2' }
    }
    if (modal.type === 'edit-building') {
      const b = tree.find(b => b.id === modal.bldgId)
      return { title: 'Edit Building', onSave: handleSaveBldg, initial: { name: b?.name ?? '', code: b?.code ?? '' }, showWarning: true, codePlaceholder: 'e.g. B1' }
    }
    if (modal.type === 'add-dept') {
      return { title: 'Add Department', onSave: handleSaveDept, showWarning: false, codePlaceholder: 'e.g. MIL' }
    }
    if (modal.type === 'edit-dept') {
      const b = tree.find(b => b.id === modal.bldgId)
      const d = b?.departments.find(d => d.id === modal.deptId)
      return { title: 'Edit Department', onSave: handleSaveDept, initial: { name: d?.name ?? '', code: d?.code ?? '' }, showWarning: false, codePlaceholder: 'e.g. MIL' }
    }
    return null
  }

  const modalProps = getModalProps()

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Facility Structure</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Buildings and departments. Codes are used in Facility Asset IDs.
            </p>
          </div>
          <button
            onClick={() => setModal({ type: 'add-building' })}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Add Building
          </button>
        </div>

        <div className="space-y-2">
          {tree.map(bldg => (
            <div key={bldg.id} className="rounded-lg border border-slate-200 overflow-hidden">
              {/* Building row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                   onClick={() => toggleExpand(bldg.id)}>
                <button className="text-slate-400 shrink-0">
                  {expanded[bldg.id]
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />
                  }
                </button>
                <span className="flex-1 font-medium text-sm text-slate-900">{bldg.name}</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                  {bldg.code}
                </span>
                <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setModal({ type: 'edit-building', bldgId: bldg.id })}
                    className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setModal({ type: 'add-dept', bldgId: bldg.id }); setExpanded(p => ({ ...p, [bldg.id]: true })) }}
                    className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-white hover:text-blue-700 font-medium"
                  >
                    + Dept
                  </button>
                </div>
              </div>

              {/* Departments */}
              {expanded[bldg.id] && (
                <div className="divide-y divide-slate-50">
                  {bldg.departments.length === 0 && (
                    <div className="px-10 py-2 text-xs text-slate-400">No departments yet.</div>
                  )}
                  {bldg.departments.map(dept => (
                    <div key={dept.id} className="flex items-center gap-3 px-10 py-2.5 hover:bg-slate-50/50">
                      <span className="flex-1 text-sm text-slate-700">{dept.name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
                        {dept.code}
                      </span>
                      <button
                        onClick={() => setModal({ type: 'edit-dept', bldgId: bldg.id, deptId: dept.id })}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {tree.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
              No buildings yet. Click &quot;+ Add Building&quot; to get started.
            </div>
          )}
        </div>
      </div>

      {modal && modalProps && (
        <InlineModal
          {...modalProps}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
