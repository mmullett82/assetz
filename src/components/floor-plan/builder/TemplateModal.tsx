'use client'

import { X } from 'lucide-react'
import { TEMPLATES, type Template, type TemplateId } from '@/lib/builder-state'

// ─── SVG mini-previews for each template ─────────────────────────────────────

function TemplateMini({ id }: { id: TemplateId }) {
  const W = 160; const H = 100
  switch (id) {
    case 'linear':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full">
          <rect x={4}   y={20} width={34} height={60} rx={3} fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" strokeWidth={1.5} />
          <rect x={42}  y={20} width={34} height={60} rx={3} fill="#8b5cf6" fillOpacity={0.15} stroke="#8b5cf6" strokeWidth={1.5} />
          <rect x={80}  y={20} width={34} height={60} rx={3} fill="#f59e0b" fillOpacity={0.15} stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={118} y={20} width={38} height={60} rx={3} fill="#10b981" fillOpacity={0.15} stroke="#10b981" strokeWidth={1.5} />
          {/* Flow arrows */}
          <line x1={38} y1={50} x2={41} y2={50} stroke="#64748b" strokeWidth={1} markerEnd="url(#t-arr)" />
          <line x1={76} y1={50} x2={79} y2={50} stroke="#64748b" strokeWidth={1} markerEnd="url(#t-arr)" />
          <line x1={114} y1={50} x2={117} y2={50} stroke="#64748b" strokeWidth={1} markerEnd="url(#t-arr)" />
          <defs><marker id="t-arr" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L0,4 L4,2 z" fill="#64748b"/></marker></defs>
        </svg>
      )
    case 'u-shape':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full">
          <rect x={4}  y={4}  width={34} height={92} rx={3} fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" strokeWidth={1.5} />
          <rect x={42} y={52} width={76} height={44} rx={3} fill="#f59e0b" fillOpacity={0.15} stroke="#f59e0b" strokeWidth={1.5} />
          <rect x={122} y={4} width={34} height={92} rx={3} fill="#10b981" fillOpacity={0.15} stroke="#10b981" strokeWidth={1.5} />
        </svg>
      )
    case 'l-shape':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full">
          <rect x={4}  y={4}  width={100} height={58} rx={3} fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" strokeWidth={1.5} />
          <rect x={4}  y={66} width={50}  height={30} rx={3} fill="#8b5cf6" fillOpacity={0.15} stroke="#8b5cf6" strokeWidth={1.5} />
        </svg>
      )
    case 'open':
      return (
        <svg viewBox="0 0 160 100" className="w-full h-full">
          <rect x={4} y={4} width={152} height={92} rx={3} fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" strokeWidth={1.5} />
          <text x={80} y={55} textAnchor="middle" fontSize={12} fontWeight={600} fill="#3b82f6" fillOpacity={0.6}
            style={{ fontFamily: 'system-ui, sans-serif' }}>Production</text>
        </svg>
      )
    default:
      return null
  }
}

interface TemplateModalProps {
  hasContent: boolean
  onApply:    (t: Template) => void
  onClose:    () => void
}

export default function TemplateModal({ hasContent, onApply, onClose }: TemplateModalProps) {

  function handleApply(t: Template) {
    if (hasContent) {
      if (!confirm(`Replace current floor content with the "${t.name}" template?`)) return
    }
    onApply(t)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Starter Templates</h2>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-4 p-5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleApply(t)}
              className="group flex flex-col gap-2 rounded-xl border-2 border-slate-200 p-3 text-left hover:border-blue-400 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* Mini SVG preview */}
              <div className="w-full aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-100 group-hover:border-blue-200 transition-colors">
                <TemplateMini id={t.id} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 pb-4 text-xs text-slate-400 text-center">
          Templates provide a starting layout — you can customise everything after applying.
        </div>
      </div>
    </div>
  )
}
