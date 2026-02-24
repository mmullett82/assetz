'use client'

import {
  MousePointer2,
  Pentagon,
  Minus,
  ArrowRight,
  Type,
  Grid2X2,
  Magnet,
  Undo2,
  Redo2,
  LayoutTemplate,
  Save,
  Upload,
  ImageIcon,
} from 'lucide-react'
import type { Tool } from '@/lib/builder-state'

interface BuilderToolbarProps {
  activeTool:  Tool
  snapEnabled: boolean
  showGrid:    boolean
  canUndo:     boolean
  canRedo:     boolean
  onTool:      (t: Tool) => void
  onSnapToggle: () => void
  onGridToggle: () => void
  onUndo:      () => void
  onRedo:      () => void
  onTemplates: () => void
  onSaveDraft: () => void
  onPublish:   () => void
  onBgImage:   (dataUrl: string) => void
}

const TOOLS: { id: Tool; icon: React.ReactNode; label: string; key: string }[] = [
  { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select (V)',  key: 'V' },
  { id: 'zone',   icon: <Pentagon       className="h-4 w-4" />, label: 'Zone (Z)',   key: 'Z' },
  { id: 'wall',   icon: <Minus          className="h-4 w-4" />, label: 'Wall (W)',   key: 'W' },
  { id: 'flow',   icon: <ArrowRight     className="h-4 w-4" />, label: 'Flow (F)',   key: 'F' },
  { id: 'label',  icon: <Type           className="h-4 w-4" />, label: 'Label (L)',  key: 'L' },
]

export default function BuilderToolbar({
  activeTool,
  snapEnabled,
  showGrid,
  canUndo,
  canRedo,
  onTool,
  onSnapToggle,
  onGridToggle,
  onUndo,
  onRedo,
  onTemplates,
  onSaveDraft,
  onPublish,
  onBgImage,
}: BuilderToolbarProps) {

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') onBgImage(result)
    }
    reader.readAsDataURL(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-3 py-2 shrink-0 overflow-x-auto">

      {/* Tool group */}
      <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => onTool(t.id)}
            className={[
              'flex items-center justify-center h-8 w-8 rounded-md transition-colors',
              activeTool === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700',
            ].join(' ')}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <span className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

      {/* Snap + grid toggles */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          title={`Snap to grid (${snapEnabled ? 'on' : 'off'})`}
          onClick={onSnapToggle}
          className={[
            'flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-colors',
            snapEnabled
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
          ].join(' ')}
        >
          <Magnet className="h-3.5 w-3.5" />
          Snap
        </button>
        <button
          type="button"
          title={`Grid overlay (${showGrid ? 'on' : 'off'})`}
          onClick={onGridToggle}
          className={[
            'flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-colors',
            showGrid
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
          ].join(' ')}
        >
          <Grid2X2 className="h-3.5 w-3.5" />
          Grid
        </button>
      </div>

      <span className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Y)"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <span className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

      {/* Templates */}
      <button
        type="button"
        title="Starter templates"
        onClick={onTemplates}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
        Templates
      </button>

      {/* Background image upload */}
      <label
        title="Upload background image (JPG/PNG)"
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        BG Image
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={handleImageUpload} />
      </label>

      <div className="flex-1 min-w-2" />

      {/* Save / Publish */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Publish
        </button>
      </div>
    </div>
  )
}
