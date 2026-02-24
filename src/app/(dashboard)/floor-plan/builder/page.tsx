'use client'

/**
 * Map Builder page — /floor-plan/builder
 *
 * Layout:
 *   BuilderToolbar (top)
 *   ├── AssetSidebar (left, w-56)
 *   ├── BuilderCanvas (flex-1)
 *   └── PropertiesPanel (right, w-64)
 *   FloorTabs (bottom)
 *
 * State lives here and is passed down.
 * BuilderDoc (floors array) is owned by useHistory for undo/redo.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Map } from 'lucide-react'
import { MOCK_ASSETS } from '@/lib/mock-data'
import {
  useHistory,
  makeFloor,
  DRAFT_KEY,
  PUBLISHED_KEY,
  type BuilderDoc,
  type BuilderFloor,
  type SelectedItem,
  type Template,
  type Tool,
} from '@/lib/builder-state'

import BuilderCanvas    from '@/components/floor-plan/builder/BuilderCanvas'
import BuilderToolbar   from '@/components/floor-plan/builder/BuilderToolbar'
import AssetSidebar     from '@/components/floor-plan/builder/AssetSidebar'
import PropertiesPanel  from '@/components/floor-plan/builder/PropertiesPanel'
import FloorTabs        from '@/components/floor-plan/builder/FloorTabs'
import TemplateModal    from '@/components/floor-plan/builder/TemplateModal'
import CSVImportModal   from '@/components/floor-plan/builder/CSVImportModal'

// ─── Initial doc ─────────────────────────────────────────────────────────────

function loadInitialDoc(): BuilderDoc {
  if (typeof window === 'undefined') return { floors: [makeFloor('Floor 1')] }
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) return JSON.parse(saved) as BuilderDoc
  } catch {
    // ignore
  }
  return { floors: [makeFloor('Floor 1')] }
}

// ─── Toast helper ─────────────────────────────────────────────────────────────

type Toast = { id: number; msg: string; link?: { href: string; label: string } }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuilderPage() {
  const assets = MOCK_ASSETS   // TODO: swap for useAssets() when backend is live

  // ── Top-level doc state (undo/redo wraps this) ────────────────────────────
  const { state: doc, set: setDoc, undo, redo, canUndo, canRedo } = useHistory<BuilderDoc>(
    loadInitialDoc()
  )

  // ── Active floor index ────────────────────────────────────────────────────
  const [activeFloorId, setActiveFloorId] = useState<string>(() => {
    const d = loadInitialDoc()
    return d.floors[0]?.id ?? ''
  })

  // ── Tool / view state ─────────────────────────────────────────────────────
  const [activeTool,  setActiveTool]  = useState<Tool>('select')
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [showGrid,    setShowGrid]    = useState(true)
  const [selected,    setSelected]    = useState<SelectedItem | null>(null)

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showTemplates, setShowTemplates] = useState(false)
  const [showCSV,       setShowCSV]       = useState(false)

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  function addToast(msg: string, link?: { href: string; label: string }) {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, msg, link }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

  // ── Auto-save every 30s ───────────────────────────────────────────────────
  const docRef = useRef(doc)
  docRef.current = doc
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(docRef.current))
      } catch { /* storage full */ }
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  // ── Keyboard shortcuts (Ctrl+Z / Ctrl+Y) ─────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const map: Record<string, Tool> = { v: 'select', z: 'zone', w: 'wall', f: 'flow', l: 'label' }
        const t = map[e.key.toLowerCase()]
        if (t) setActiveTool(t)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  // ── Active floor ──────────────────────────────────────────────────────────
  const activeFloor: BuilderFloor = doc.floors.find((f) => f.id === activeFloorId)
    ?? doc.floors[0]

  // ── Update active floor ───────────────────────────────────────────────────
  const handleFloorChange = useCallback((next: BuilderFloor) => {
    setDoc({
      ...doc,
      floors: doc.floors.map((f) => f.id === next.id ? next : f),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc])

  // ── Floor management ──────────────────────────────────────────────────────
  function addFloor() {
    const name  = `Floor ${doc.floors.length + 1}`
    const floor = makeFloor(name)
    setDoc({ floors: [...doc.floors, floor] })
    setActiveFloorId(floor.id)
    setSelected(null)
  }

  function renameFloor(id: string, name: string) {
    setDoc({
      floors: doc.floors.map((f) => f.id === id ? { ...f, name } : f),
    })
  }

  function deleteFloor(id: string) {
    const next = doc.floors.filter((f) => f.id !== id)
    setDoc({ floors: next })
    if (activeFloorId === id) setActiveFloorId(next[0]?.id ?? '')
    setSelected(null)
  }

  // ── Template apply ────────────────────────────────────────────────────────
  function applyTemplate(t: Template) {
    const updated: BuilderFloor = {
      ...activeFloor,
      zones:  t.floor.zones.map((z) => ({ ...z, id: `${z.id}-${Date.now()}` })),
      walls:  [],
      flows:  [],
      labels: [],
      pins:   activeFloor.pins,   // keep existing pins
    }
    setDoc({
      ...doc,
      floors: doc.floors.map((f) => f.id === activeFloor.id ? updated : f),
    })
    setSelected(null)
  }

  // ── Background image ──────────────────────────────────────────────────────
  function handleBgImage(dataUrl: string) {
    handleFloorChange({ ...activeFloor, backgroundImage: dataUrl })
  }

  // ── Save draft ────────────────────────────────────────────────────────────
  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(doc))
      addToast('Draft saved')
    } catch {
      addToast('Save failed — storage may be full')
    }
  }

  // ── Publish ───────────────────────────────────────────────────────────────
  function publish() {
    try {
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(doc))
      localStorage.setItem(DRAFT_KEY,     JSON.stringify(doc))
      addToast('Published — floor plan is now live', { href: '/floor-plan', label: 'View published map →' })
    } catch {
      addToast('Publish failed — storage may be full')
    }
  }

  // ── Floor has content ─────────────────────────────────────────────────────
  const floorHasContent =
    activeFloor.zones.length  > 0 ||
    activeFloor.walls.length  > 0 ||
    activeFloor.flows.length  > 0 ||
    activeFloor.labels.length > 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="-m-4 sm:-m-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* Page title bar (above toolbar) */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 shrink-0">
        <Map className="h-4 w-4 text-slate-400" />
        <h1 className="text-sm font-bold text-slate-900">Map Builder</h1>
        <span className="text-xs text-slate-400">— SOLLiD Cabinetry, Main Plant B1</span>
        <div className="flex-1" />
        <Link href="/floor-plan"
          className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2">
          ← Back to viewer
        </Link>
      </div>

      {/* Toolbar */}
      <BuilderToolbar
        activeTool={activeTool}
        snapEnabled={snapEnabled}
        showGrid={showGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        onTool={setActiveTool}
        onSnapToggle={() => setSnapEnabled((v) => !v)}
        onGridToggle={() => setShowGrid((v) => !v)}
        onUndo={undo}
        onRedo={redo}
        onTemplates={() => setShowTemplates(true)}
        onSaveDraft={saveDraft}
        onPublish={publish}
        onBgImage={handleBgImage}
      />

      {/* Main area: sidebar | canvas | properties */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AssetSidebar
          assets={assets}
          floor={activeFloor}
          onCSVImport={() => setShowCSV(true)}
        />

        <div className="flex-1 min-w-0 p-3">
          <BuilderCanvas
            floor={activeFloor}
            assets={assets}
            activeTool={activeTool}
            snapEnabled={snapEnabled}
            showGrid={showGrid}
            selected={selected}
            onFloorChange={handleFloorChange}
            onSelect={setSelected}
          />
        </div>

        <PropertiesPanel
          selected={selected}
          floor={activeFloor}
          assets={assets}
          onFloorChange={handleFloorChange}
          onDeselect={() => setSelected(null)}
        />
      </div>

      {/* Floor tabs */}
      <FloorTabs
        floors={doc.floors}
        activeFloorId={activeFloor.id}
        onSelect={(id) => { setActiveFloorId(id); setSelected(null) }}
        onAdd={addFloor}
        onRename={renameFloor}
        onDelete={deleteFloor}
      />

      {/* Modals */}
      {showTemplates && (
        <TemplateModal
          hasContent={floorHasContent}
          onApply={applyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
      {showCSV && (
        <CSVImportModal
          floor={activeFloor}
          assets={assets}
          onFloorChange={(next) => { handleFloorChange(next); setShowCSV(false) }}
          onClose={() => setShowCSV(false)}
        />
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className="flex items-center gap-3 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl pointer-events-auto">
            {t.msg}
            {t.link && (
              <Link href={t.link.href}
                className="text-blue-300 hover:text-blue-200 underline underline-offset-2">
                {t.link.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
