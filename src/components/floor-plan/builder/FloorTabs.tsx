'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import type { BuilderFloor } from '@/lib/builder-state'

interface FloorTabsProps {
  floors:        BuilderFloor[]
  activeFloorId: string
  onSelect:      (id: string) => void
  onAdd:         () => void
  onRename:      (id: string, name: string) => void
  onDelete:      (id: string) => void
}

export default function FloorTabs({
  floors,
  activeFloorId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: FloorTabsProps) {
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function startEdit(floor: BuilderFloor, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingId(floor.id)
    setEditingName(floor.name)
  }

  function commitEdit() {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim())
    }
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (floors.length <= 1) return  // keep at least one floor
    onDelete(id)
  }

  return (
    <div className="flex items-center gap-0.5 border-t border-slate-200 bg-white px-3 py-1.5 shrink-0 overflow-x-auto">
      {floors.map((floor) => {
        const isActive  = floor.id === activeFloorId
        const isEditing = editingId === floor.id

        return (
          <div
            key={floor.id}
            onClick={() => !isEditing && onSelect(floor.id)}
            className={[
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors group shrink-0',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
            ].join(' ')}
          >
            {isEditing ? (
              <>
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')  commitEdit()
                    if (e.key === 'Escape') cancelEdit()
                    e.stopPropagation()
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-24 bg-white text-slate-900 border border-slate-300 rounded px-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={(e) => { e.stopPropagation(); commitEdit() }}
                  className="text-green-600 hover:text-green-700">
                  <Check className="h-3 w-3" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); cancelEdit() }}
                  className="text-slate-400 hover:text-slate-600">
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                {floor.name}
                {/* Actions shown on hover for active tab */}
                {isActive && (
                  <span className="flex items-center gap-0.5 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => startEdit(floor, e)}
                      className="p-0.5 rounded hover:bg-white/20"
                      title="Rename floor"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    {floors.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(floor.id, e)}
                        className="p-0.5 rounded hover:bg-white/20 text-red-300 hover:text-red-200"
                        title="Delete floor"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}

      {/* Add floor */}
      <button
        type="button"
        onClick={onAdd}
        title="Add floor"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Floor
      </button>
    </div>
  )
}
