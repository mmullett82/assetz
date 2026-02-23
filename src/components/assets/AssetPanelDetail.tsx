'use client'

import { X, Pencil, ClipboardList, MapPin, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useAsset } from '@/hooks/useAsset'
import AssetStatusBadge from '@/components/ui/AssetStatusBadge'
import DependencyBadge from './DependencyBadge'
import BarcodeDisplay from './BarcodeDisplay'
import { MOCK_ASSETS } from '@/lib/mock-data'

interface AssetPanelDetailProps {
  assetId: string
  onEdit: () => void
  onCreateWO: () => void
  onClose: () => void
}

export default function AssetPanelDetail({ assetId, onEdit, onCreateWO, onClose }: AssetPanelDetailProps) {
  const { asset, isLoading, error } = useAsset(assetId)

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-6 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-500">Asset not found</p>
      </div>
    )
  }

  const dependsOnAssets = (asset.depends_on ?? []).map((aid) => MOCK_ASSETS.find((a) => a.id === aid)).filter(Boolean)
  const feedsAssets     = (asset.feeds ?? []).map((aid) => MOCK_ASSETS.find((a) => a.id === aid)).filter(Boolean)
  const dependentAssets = (asset.dependents ?? []).map((aid) => MOCK_ASSETS.find((a) => a.id === aid)).filter(Boolean)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onCreateWO}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Create WO
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <AssetStatusBadge status={asset.status} />
            <DependencyBadge code={asset.dependency_code} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{asset.name}</h2>
          <p className="font-mono text-xs text-blue-700">{asset.facility_asset_id}</p>
          {asset.description && (
            <p className="mt-1.5 text-sm text-slate-600">{asset.description}</p>
          )}
          {asset.location_notes && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {asset.location_notes}
            </div>
          )}
        </div>

        {/* Equipment details */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Equipment Details</h3>
          <dl className="divide-y divide-slate-100">
            {[
              ['Manufacturer', asset.manufacturer],
              ['Model',        asset.model],
              ['Serial No.',   asset.serial_number],
              ['Year',         asset.year_installed],
              ['Department',   asset.department_code],
              ['Building',     asset.building_code],
            ].map(([label, value]) =>
              value ? (
                <div key={String(label)} className="flex justify-between py-2 text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900 text-right">{String(value)}</dd>
                </div>
              ) : null
            )}
          </dl>
        </div>

        {/* Meter */}
        {asset.current_meter_value !== undefined && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Meter Reading</h3>
            <p className="text-2xl font-bold text-slate-900">
              {asset.current_meter_value.toLocaleString()}
              <span className="ml-1.5 text-sm font-normal text-slate-500">{asset.meter_unit}</span>
            </p>
          </div>
        )}

        {/* Dependencies */}
        {(dependsOnAssets.length > 0 || feedsAssets.length > 0 || dependentAssets.length > 0) && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Dependencies</h3>
            {dependsOnAssets.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-500 font-medium mb-1">Depends On</p>
                {dependsOnAssets.map((a) => a && (
                  <Link key={a.id} href={`/assets/${a.id}`} className="block text-sm text-blue-600 hover:underline">{a.name}</Link>
                ))}
              </div>
            )}
            {feedsAssets.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-500 font-medium mb-1">Feeds</p>
                {feedsAssets.map((a) => a && (
                  <Link key={a.id} href={`/assets/${a.id}`} className="block text-sm text-blue-600 hover:underline">{a.name}</Link>
                ))}
              </div>
            )}
            {dependentAssets.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Dependents</p>
                {dependentAssets.map((a) => a && (
                  <Link key={a.id} href={`/assets/${a.id}`} className="block text-sm text-blue-600 hover:underline">{a.name}</Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Barcode */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Barcode</h3>
          <BarcodeDisplay assetNumber={asset.asset_number} facilityAssetId={asset.facility_asset_id} />
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/assets/${asset.id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Full Detail Page →
          </Link>
          <Link
            href={`/work-orders?asset_id=${asset.id}`}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            Work Orders →
          </Link>
          <Link
            href={`/pm?asset_id=${asset.id}`}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            PM Schedules →
          </Link>
        </div>
      </div>
    </div>
  )
}
