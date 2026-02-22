'use client'

import { useState, useRef, useEffect } from 'react'
import type { ConfigItem, ExtraColumnDef } from '@/lib/mock-settings'
import ToggleSwitch from './ToggleSwitch'

interface ConfigItemModalProps {
  item?: ConfigItem
  allowColor?: boolean
  allowDefault?: boolean
  extraColumns?: ExtraColumnDef[]
  systemKeys?: string[]
  onSave: (item: ConfigItem) => void
  onCancel: () => void
}

function labelToKey(label: string): string {
  return label.toLowerCase().trim()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
}

export default function ConfigItemModal({
  item,
  allowColor = false,
  allowDefault = true,
  extraColumns = [],
  systemKeys = [],
  onSave,
  onCancel,
}: ConfigItemModalProps) {
  const isNew = !item
  const isSystem = item ? systemKeys.includes(item.key) : false

  const [label, setLabel]       = useState(item?.label ?? '')
  const [key, setKey]           = useState(item?.key ?? '')
  const [color, setColor]       = useState(item?.color ?? '#3b82f6')
  const [isDefault, setIsDefault] = useState(item?.is_default ?? false)
  const [isActive, setIsActive]   = useState(item?.is_active ?? true)
  const [extras, setExtras]       = useState<Record<string, string | number>>(item?.extra ?? {})
  const [keyTouched, setKeyTouched] = useState(false)

  const colorInputRef = useRef<HTMLInputElement>(null)
  const overlayRef    = useRef<HTMLDivElement>(null)

  // Auto-generate key from label in new mode
  useEffect(() => {
    if (isNew && !keyTouched) {
      setKey(labelToKey(label))
    }
  }, [label, isNew, keyTouched])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onCancel()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !key.trim()) return
    onSave({
      key: key.trim(),
      label: label.trim(),
      sort_order: item?.sort_order ?? 0,
      is_default: isDefault,
      is_active: isActive,
      ...(allowColor ? { color } : {}),
      ...(extraColumns.length > 0 ? { extra: extras } : {}),
    })
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center p-4 bg-black/50"
    >
      <div className="w-full max-w-md mx-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {isNew ? 'Add Item' : 'Edit Item'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Enter label"
              autoFocus
            />
          </div>

          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Key
            </label>
            {isNew ? (
              <input
                type="text"
                required
                value={key}
                onChange={e => { setKey(e.target.value); setKeyTouched(true) }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="auto_generated_key"
              />
            ) : (
              <code className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {item?.key}
              </code>
            )}
            {isNew && (
              <p className="mt-1 text-xs text-slate-400">Auto-filled from label. Cannot be changed after creation.</p>
            )}
          </div>

          {/* Color picker */}
          {allowColor && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Color
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="h-8 w-8 rounded border border-slate-300 cursor-pointer shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => colorInputRef.current?.click()}
                  />
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="absolute opacity-0 h-0 w-0"
                  />
                </div>
                <span className="font-mono text-sm text-slate-600">{color}</span>
              </div>
            </div>
          )}

          {/* Extra columns */}
          {extraColumns.map(col => (
            <div key={col.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {col.label}
              </label>
              <input
                type={col.type === 'number' ? 'number' : 'text'}
                value={extras[col.key] ?? ''}
                onChange={e => setExtras(prev => ({
                  ...prev,
                  [col.key]: col.type === 'number' ? Number(e.target.value) : e.target.value,
                }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          ))}

          {/* Is Default */}
          {allowDefault && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is-default"
                checked={isDefault}
                onChange={e => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is-default" className="text-sm text-slate-700">
                Set as default
              </label>
            </div>
          )}

          {/* Is Active (edit mode only) */}
          {!isNew && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Active</span>
              <ToggleSwitch
                checked={isActive}
                onChange={setIsActive}
                label="Toggle active status"
                disabled={isSystem}
              />
            </div>
          )}
          {!isNew && isSystem && (
            <p className="text-xs text-slate-400 -mt-2">
              System items cannot be deactivated.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {isNew ? 'Add Item' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
