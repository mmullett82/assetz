'use client'

import { useState } from 'react'
import { GripVertical, ChevronUp, ChevronDown, Pencil, Eye, EyeOff } from 'lucide-react'
import type { ConfigItem, ExtraColumnDef } from '@/lib/mock-settings'
import ConfigItemModal from './ConfigItemModal'

interface ConfigListProps {
  title: string
  description?: string
  items: ConfigItem[]
  onChange: (items: ConfigItem[]) => void
  allowColor?: boolean
  allowDefault?: boolean
  extraColumns?: ExtraColumnDef[]
  systemKeys?: string[]
}

function moveItem(items: ConfigItem[], key: string, dir: 'up' | 'down'): ConfigItem[] {
  const idx = items.findIndex(i => i.key === key)
  if (idx < 0) return items
  if (dir === 'up'   && idx === 0)               return items
  if (dir === 'down' && idx === items.length - 1) return items

  const next = [...items]
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  const a = next[idx]
  const b = next[swapIdx]
  // Swap sort_order values
  next[idx]     = { ...b, sort_order: a.sort_order }
  next[swapIdx] = { ...a, sort_order: b.sort_order }
  return next
}

function toggleActive(items: ConfigItem[], key: string, systemKeys: string[]): ConfigItem[] {
  if (systemKeys.includes(key)) return items
  return items.map(i => i.key === key ? { ...i, is_active: !i.is_active } : i)
}

function nextSortOrder(items: ConfigItem[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.sort_order)) + 1
}

export default function ConfigList({
  title,
  description,
  items,
  onChange,
  allowColor = false,
  allowDefault = true,
  extraColumns = [],
  systemKeys = [],
}: ConfigListProps) {
  const [editItem, setEditItem]   = useState<ConfigItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isNewItem, setIsNewItem]  = useState(false)

  function openAdd() {
    setEditItem(null)
    setIsNewItem(true)
    setShowModal(true)
  }

  function openEdit(item: ConfigItem) {
    setEditItem(item)
    setIsNewItem(false)
    setShowModal(true)
  }

  function handleSave(saved: ConfigItem) {
    if (isNewItem) {
      const withOrder = { ...saved, sort_order: nextSortOrder(items) }
      let next = [...items, withOrder]
      if (withOrder.is_default) {
        next = next.map(i => i.key !== withOrder.key ? { ...i, is_default: false } : i)
      }
      onChange(next)
    } else {
      let next = items.map(i => i.key === saved.key ? saved : i)
      if (saved.is_default) {
        next = next.map(i => i.key !== saved.key ? { ...i, is_default: false } : i)
      }
      onChange(next)
    }
    setShowModal(false)
  }

  const activeCount = items.filter(i => i.is_active).length

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {activeCount} active
              </span>
            </div>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            )}
          </div>
          <button
            onClick={openAdd}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Add Item
          </button>
        </div>

        {/* Desktop table */}
        <table className="hidden sm:table w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
              <th className="w-8 px-3 py-2" />
              {allowColor && <th className="w-10 px-2 py-2">Color</th>}
              <th className="px-4 py-2 text-left">Label</th>
              <th className="px-4 py-2 text-left font-mono">Key</th>
              {extraColumns.map(col => (
                <th key={col.key} className="px-4 py-2 text-left">{col.label}</th>
              ))}
              <th className="w-20 px-2 py-2 text-center">Order</th>
              <th className="w-24 px-2 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.key}
                className={[
                  'border-b border-slate-50 hover:bg-slate-50/50',
                  !item.is_active ? 'opacity-50' : '',
                ].join(' ')}
              >
                {/* Grip */}
                <td className="px-3 py-2 text-slate-300">
                  <GripVertical className="h-4 w-4" />
                </td>

                {/* Color swatch */}
                {allowColor && (
                  <td className="px-2 py-2">
                    <div
                      className="h-5 w-5 rounded-full border border-slate-200"
                      style={{ backgroundColor: item.color ?? '#94a3b8' }}
                    />
                  </td>
                )}

                {/* Label + default badge */}
                <td className="px-4 py-2 font-medium text-slate-900">
                  <span className={!item.is_active ? 'line-through' : ''}>{item.label}</span>
                  {item.is_default && (
                    <span className="ml-2 rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                      default
                    </span>
                  )}
                </td>

                {/* Key */}
                <td className="px-4 py-2">
                  <code className="font-mono text-xs text-slate-500">{item.key}</code>
                </td>

                {/* Extra columns */}
                {extraColumns.map(col => (
                  <td key={col.key} className="px-4 py-2 text-slate-600">
                    {item.extra?.[col.key] ?? '—'}
                  </td>
                ))}

                {/* Reorder buttons */}
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      onClick={() => onChange(moveItem(items, item.key, 'up'))}
                      disabled={idx === 0}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onChange(moveItem(items, item.key, 'down'))}
                      disabled={idx === items.length - 1}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>

                {/* Edit + Toggle */}
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Edit item"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onChange(toggleActive(items, item.key, systemKeys))}
                      disabled={systemKeys.includes(item.key)}
                      className={[
                        'rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600',
                        systemKeys.includes(item.key) ? 'opacity-40 cursor-not-allowed' : '',
                      ].join(' ')}
                      aria-label={item.is_active ? 'Deactivate item' : 'Activate item'}
                    >
                      {item.is_active
                        ? <Eye className="h-3.5 w-3.5" />
                        : <EyeOff className="h-3.5 w-3.5" />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={4 + (allowColor ? 1 : 0) + extraColumns.length}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No items yet. Click &quot;+ Add Item&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile card stack */}
        <div className="sm:hidden divide-y divide-slate-100">
          {items.map((item, idx) => (
            <div
              key={item.key}
              className={['px-4 py-3', !item.is_active ? 'opacity-50' : ''].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {allowColor && (
                      <div
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-200"
                        style={{ backgroundColor: item.color ?? '#94a3b8' }}
                      />
                    )}
                    <span className={['font-medium text-sm text-slate-900', !item.is_active ? 'line-through' : ''].join(' ')}>
                      {item.label}
                    </span>
                    {item.is_default && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                        default
                      </span>
                    )}
                  </div>
                  <code className="mt-0.5 block font-mono text-xs text-slate-400">{item.key}</code>
                  {extraColumns.map(col => (
                    <div key={col.key} className="mt-0.5 text-xs text-slate-500">
                      {col.label}: {item.extra?.[col.key] ?? '—'}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onChange(moveItem(items, item.key, 'up'))}
                    disabled={idx === 0}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onChange(moveItem(items, item.key, 'down'))}
                    disabled={idx === items.length - 1}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onChange(toggleActive(items, item.key, systemKeys))}
                    disabled={systemKeys.includes(item.key)}
                    className={['rounded p-1.5 text-slate-400 hover:bg-slate-100', systemKeys.includes(item.key) ? 'opacity-40 cursor-not-allowed' : ''].join(' ')}
                  >
                    {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No items yet.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ConfigItemModal
          item={editItem ?? undefined}
          allowColor={allowColor}
          allowDefault={allowDefault}
          extraColumns={extraColumns}
          systemKeys={systemKeys}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}
