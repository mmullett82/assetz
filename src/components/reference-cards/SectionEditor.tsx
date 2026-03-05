'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { ReferenceCardSectionType } from '@/types'

interface SectionEditorProps {
  sectionType: ReferenceCardSectionType
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export default function SectionEditor({ sectionType, content, onChange }: SectionEditorProps) {
  switch (sectionType) {
    case 'procedures':
      return <ProceduresEditor content={content} onChange={onChange} />
    case 'safety':
      return <SafetyEditor content={content} onChange={onChange} />
    case 'failures':
      return <FailuresEditor content={content} onChange={onChange} />
    case 'spare_parts':
      return <SparePartsEditor content={content} onChange={onChange} />
    case 'lubrication':
      return <LubricationEditor content={content} onChange={onChange} />
    case 'troubleshooting':
      return <TroubleshootingEditor content={content} onChange={onChange} />
    case 'documents':
      return <DocumentsEditor content={content} onChange={onChange} />
    case 'photos':
      return <PhotosEditor content={content} onChange={onChange} />
    case 'custom':
    default:
      return <CustomEditor content={content} onChange={onChange} />
  }
}

// ─── Procedures: numbered step list ─────────────────────────────────────────

function ProceduresEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const steps = (content.steps as string[]) ?? ['']

  function setSteps(newSteps: string[]) {
    onChange({ ...content, steps: newSteps })
  }

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 text-xs font-medium text-slate-400 w-5 text-right">{i + 1}.</span>
          <input
            type="text"
            value={step}
            onChange={(e) => { const s = [...steps]; s[i] = e.target.value; setSteps(s) }}
            placeholder={`Step ${i + 1}...`}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setSteps(steps.filter((_, j) => j !== i))}
            className="mt-1 p-1 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setSteps([...steps, ''])}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
      >
        <Plus className="h-3 w-3" /> Add step
      </button>
    </div>
  )
}

// ─── Safety: warning level + message ────────────────────────────────────────

function SafetyEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const warnings = (content.warnings as Array<{ level: string; message: string }>) ?? [{ level: 'warning', message: '' }]

  function setWarnings(w: Array<{ level: string; message: string }>) {
    onChange({ ...content, warnings: w })
  }

  return (
    <div className="space-y-3">
      {warnings.map((w, i) => (
        <div key={i} className="flex gap-2">
          <select
            value={w.level}
            onChange={(e) => { const ww = [...warnings]; ww[i] = { ...ww[i], level: e.target.value }; setWarnings(ww) }}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm w-28"
          >
            <option value="danger">Danger</option>
            <option value="warning">Warning</option>
            <option value="caution">Caution</option>
          </select>
          <textarea
            value={w.message}
            onChange={(e) => { const ww = [...warnings]; ww[i] = { ...ww[i], message: e.target.value }; setWarnings(ww) }}
            rows={2}
            placeholder="Safety warning message..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button onClick={() => setWarnings(warnings.filter((_, j) => j !== i))} className="mt-1 p-1 text-slate-400 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setWarnings([...warnings, { level: 'warning', message: '' }])} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus className="h-3 w-3" /> Add warning
      </button>
    </div>
  )
}

// ─── Failures: table with symptom, cause, fix ───────────────────────────────

function FailuresEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const failures = (content.failures as Array<{ symptom: string; cause: string; fix: string }>) ?? [{ symptom: '', cause: '', fix: '' }]

  function setFailures(f: Array<{ symptom: string; cause: string; fix: string }>) {
    onChange({ ...content, failures: f })
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-slate-500">
        <span>Symptom</span><span>Cause</span><span>Fix</span><span className="w-7" />
      </div>
      {failures.map((f, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <input value={f.symptom} onChange={(e) => { const ff = [...failures]; ff[i] = { ...ff[i], symptom: e.target.value }; setFailures(ff) }} placeholder="Symptom..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={f.cause} onChange={(e) => { const ff = [...failures]; ff[i] = { ...ff[i], cause: e.target.value }; setFailures(ff) }} placeholder="Cause..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={f.fix} onChange={(e) => { const ff = [...failures]; ff[i] = { ...ff[i], fix: e.target.value }; setFailures(ff) }} placeholder="Fix..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <button onClick={() => setFailures(failures.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setFailures([...failures, { symptom: '', cause: '', fix: '' }])} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus className="h-3 w-3" /> Add failure
      </button>
    </div>
  )
}

// ─── Spare Parts: part number + name + qty ──────────────────────────────────

function SparePartsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const parts = (content.parts as Array<{ part_number: string; name: string; quantity: number }>) ?? [{ part_number: '', name: '', quantity: 1 }]

  function setParts(p: Array<{ part_number: string; name: string; quantity: number }>) {
    onChange({ ...content, parts: p })
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1.5fr_80px_auto] gap-2 text-xs font-medium text-slate-500">
        <span>Part #</span><span>Name</span><span>Qty</span><span className="w-7" />
      </div>
      {parts.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.5fr_80px_auto] gap-2">
          <input value={p.part_number} onChange={(e) => { const pp = [...parts]; pp[i] = { ...pp[i], part_number: e.target.value }; setParts(pp) }} placeholder="PN-001" className="rounded border border-slate-300 px-2 py-1.5 text-sm font-mono" />
          <input value={p.name} onChange={(e) => { const pp = [...parts]; pp[i] = { ...pp[i], name: e.target.value }; setParts(pp) }} placeholder="Part name..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input type="number" value={p.quantity} onChange={(e) => { const pp = [...parts]; pp[i] = { ...pp[i], quantity: parseInt(e.target.value) || 0 }; setParts(pp) }} min={0} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <button onClick={() => setParts(parts.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setParts([...parts, { part_number: '', name: '', quantity: 1 }])} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus className="h-3 w-3" /> Add part
      </button>
    </div>
  )
}

// ─── Lubrication: point, type, frequency, qty ───────────────────────────────

function LubricationEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const points = (content.points as Array<{ point: string; lubricant: string; frequency: string; quantity: string }>) ?? [{ point: '', lubricant: '', frequency: '', quantity: '' }]

  function setPoints(p: Array<{ point: string; lubricant: string; frequency: string; quantity: string }>) {
    onChange({ ...content, points: p })
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_1fr_80px_auto] gap-2 text-xs font-medium text-slate-500">
        <span>Point</span><span>Lubricant</span><span>Frequency</span><span>Qty</span><span className="w-7" />
      </div>
      {points.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_80px_auto] gap-2">
          <input value={p.point} onChange={(e) => { const pp = [...points]; pp[i] = { ...pp[i], point: e.target.value }; setPoints(pp) }} placeholder="Bearing A..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={p.lubricant} onChange={(e) => { const pp = [...points]; pp[i] = { ...pp[i], lubricant: e.target.value }; setPoints(pp) }} placeholder="Grease type..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={p.frequency} onChange={(e) => { const pp = [...points]; pp[i] = { ...pp[i], frequency: e.target.value }; setPoints(pp) }} placeholder="Monthly..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={p.quantity} onChange={(e) => { const pp = [...points]; pp[i] = { ...pp[i], quantity: e.target.value }; setPoints(pp) }} placeholder="2 oz" className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <button onClick={() => setPoints(points.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setPoints([...points, { point: '', lubricant: '', frequency: '', quantity: '' }])} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus className="h-3 w-3" /> Add point
      </button>
    </div>
  )
}

// ─── Troubleshooting: symptom → check → action ─────────────────────────────

function TroubleshootingEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const tree = (content.tree as Array<{ symptom: string; check: string; action: string }>) ?? [{ symptom: '', check: '', action: '' }]

  function setTree(t: Array<{ symptom: string; check: string; action: string }>) {
    onChange({ ...content, tree: t })
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-slate-500">
        <span>If symptom...</span><span>Check...</span><span>Then do...</span><span className="w-7" />
      </div>
      {tree.map((t, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <input value={t.symptom} onChange={(e) => { const tt = [...tree]; tt[i] = { ...tt[i], symptom: e.target.value }; setTree(tt) }} placeholder="Symptom..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={t.check} onChange={(e) => { const tt = [...tree]; tt[i] = { ...tt[i], check: e.target.value }; setTree(tt) }} placeholder="Check..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={t.action} onChange={(e) => { const tt = [...tree]; tt[i] = { ...tt[i], action: e.target.value }; setTree(tt) }} placeholder="Action..." className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <button onClick={() => setTree(tree.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setTree([...tree, { symptom: '', check: '', action: '' }])} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus className="h-3 w-3" /> Add entry
      </button>
    </div>
  )
}

// ─── Documents: url + title ─────────────────────────────────────────────────

function DocumentsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const docs = (content.documents as Array<{ title: string; url: string }>) ?? [{ title: '', url: '' }]

  function setDocs(d: Array<{ title: string; url: string }>) {
    onChange({ ...content, documents: d })
  }

  return (
    <div className="space-y-2">
      {docs.map((d, i) => (
        <div key={i} className="flex gap-2">
          <input value={d.title} onChange={(e) => { const dd = [...docs]; dd[i] = { ...dd[i], title: e.target.value }; setDocs(dd) }} placeholder="Document title..." className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={d.url} onChange={(e) => { const dd = [...docs]; dd[i] = { ...dd[i], url: e.target.value }; setDocs(dd) }} placeholder="https://..." className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm font-mono" />
          <button onClick={() => setDocs(docs.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setDocs([...docs, { title: '', url: '' }])} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus className="h-3 w-3" /> Add document
      </button>
    </div>
  )
}

// ─── Photos: caption grid (placeholder, no upload yet) ──────────────────────

function PhotosEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const photos = (content.photos as Array<{ caption: string; url: string }>) ?? []

  function setPhotos(p: Array<{ caption: string; url: string }>) {
    onChange({ ...content, photos: p })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">Photo upload coming soon. Add captions and URLs for now.</p>
      {photos.map((p, i) => (
        <div key={i} className="flex gap-2">
          <input value={p.caption} onChange={(e) => { const pp = [...photos]; pp[i] = { ...pp[i], caption: e.target.value }; setPhotos(pp) }} placeholder="Caption..." className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input value={p.url} onChange={(e) => { const pp = [...photos]; pp[i] = { ...pp[i], url: e.target.value }; setPhotos(pp) }} placeholder="Image URL..." className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setPhotos([...photos, { caption: '', url: '' }])} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        <Plus className="h-3 w-3" /> Add photo
      </button>
    </div>
  )
}

// ─── Custom: rich textarea ──────────────────────────────────────────────────

function CustomEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const text = (content.text as string) ?? ''

  return (
    <textarea
      value={text}
      onChange={(e) => onChange({ ...content, text: e.target.value })}
      rows={4}
      placeholder="Enter custom notes or content..."
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
    />
  )
}
