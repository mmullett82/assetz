'use client'

import { useState, useEffect } from 'react'
import { Search, GripVertical } from 'lucide-react'

interface EquipmentIcon {
  blockName: string
  filename: string
  displayName: string
  category: string
  widthInches: number
  heightInches: number
}

interface EquipmentLibraryProps {
  onDragStart: (icon: EquipmentIcon) => void
}

export default function EquipmentLibrary({ onDragStart }: EquipmentLibraryProps) {
  const [icons, setIcons] = useState<EquipmentIcon[]>([])
  const [search, setSearch] = useState('')
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  useEffect(() => {
    fetch('/assets/equipment-icons/index.json')
      .then(r => r.json())
      .then((data: EquipmentIcon[]) => setIcons(data))
      .catch(() => {})
  }, [])

  // Filter by search
  const filtered = search
    ? icons.filter(i =>
        i.displayName.toLowerCase().includes(search.toLowerCase()) ||
        i.blockName.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      )
    : icons

  // Group by category
  const grouped = new Map<string, EquipmentIcon[]>()
  for (const icon of filtered) {
    const arr = grouped.get(icon.category) ?? []
    arr.push(icon)
    grouped.set(icon.category, arr)
  }

  // Sort categories
  const categories = [...grouped.keys()].sort()

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Equipment Library</p>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search equipment..."
            className="w-full rounded-md border border-slate-200 bg-white pl-7 pr-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {icons.length === 0 && (
          <p className="text-xs text-slate-400 px-2 py-4 text-center">
            No equipment icons found. Run extract-equipment-icons.mjs first.
          </p>
        )}

        {categories.map(cat => {
          const items = grouped.get(cat) ?? []
          const isExpanded = expandedCat === cat || search.length > 0

          return (
            <div key={cat}>
              <button
                type="button"
                onClick={() => setExpandedCat(prev => prev === cat ? null : cat)}
                className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                {cat}
                <span className="ml-auto text-[10px] text-slate-400 font-normal">{items.length}</span>
              </button>

              {isExpanded && (
                <div className="ml-2 space-y-0.5">
                  {items.map(icon => (
                    <div
                      key={icon.blockName}
                      draggable
                      onDragStart={() => onDragStart(icon)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-blue-50 cursor-grab active:cursor-grabbing group"
                    >
                      <GripVertical className="h-3 w-3 text-slate-300 group-hover:text-slate-400 shrink-0" />
                      <img
                        src={`/assets/equipment-icons/${icon.filename}`}
                        alt={icon.displayName}
                        className="h-6 w-8 object-contain shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-700 truncate">{icon.displayName}</p>
                        <p className="text-[10px] text-slate-400">
                          {Math.round(icon.widthInches / 12)}&apos; x {Math.round(icon.heightInches / 12)}&apos;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
