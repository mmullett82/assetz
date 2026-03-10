'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, ArrowRight } from 'lucide-react'
import AssetCombobox from './AssetCombobox'

interface DuplicateModalProps {
  open: boolean
  /** 'wo' or 'pm' */
  type: 'wo' | 'pm'
  /** The ID of the item being duplicated */
  sourceId: string
  /** Current asset ID on the source item */
  currentAssetId?: string
  /** Name of the item being duplicated (for display) */
  itemTitle: string
  onClose: () => void
}

export default function DuplicateModal({
  open,
  type,
  sourceId,
  currentAssetId,
  itemTitle,
  onClose,
}: DuplicateModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'choose' | 'pick-asset'>('choose')
  const [newAssetId, setNewAssetId] = useState('')

  if (!open) return null

  const basePath = type === 'wo' ? '/work-orders/new' : '/pm/new'

  function handleSameAsset() {
    router.push(`${basePath}?duplicate=${sourceId}`)
    onClose()
  }

  function handleDifferentAsset() {
    setMode('pick-asset')
  }

  function handleConfirmNewAsset() {
    if (!newAssetId) return
    router.push(`${basePath}?duplicate=${sourceId}&asset_id=${newAssetId}`)
    onClose()
  }

  function handleClose() {
    setMode('choose')
    setNewAssetId('')
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <Copy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Duplicate {type === 'wo' ? 'Work Order' : 'PM Schedule'}
                </h2>
                <p className="text-sm text-slate-500 truncate max-w-[280px]">{itemTitle}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {mode === 'choose' ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 mb-4">
                  Is this duplicate for the same asset, or a different one?
                </p>

                <button
                  type="button"
                  onClick={handleSameAsset}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Same asset</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Keep the same asset, just tweak the details
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={handleDifferentAsset}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Different asset</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Apply similar work to a different piece of equipment
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Select the asset for the new {type === 'wo' ? 'work order' : 'PM schedule'}:
                </p>

                <AssetCombobox
                  label="New Asset"
                  value={newAssetId}
                  onChange={setNewAssetId}
                  required
                />

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmNewAsset}
                    disabled={!newAssetId}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Form
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('choose'); setNewAssetId('') }}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {mode === 'choose' && (
            <div className="border-t border-slate-100 px-6 py-3">
              <button
                type="button"
                onClick={handleClose}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
