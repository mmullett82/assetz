'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Pencil,
  ClipboardList,
  CalendarClock,
  MapPin,
  Info,
  Gauge,
  AlertTriangle,
} from 'lucide-react'
import { useAsset } from '@/hooks/useAsset'
import AssetStatusBadge from '@/components/ui/AssetStatusBadge'
import DependencyBadge from '@/components/assets/DependencyBadge'
import BarcodeDisplay from '@/components/assets/BarcodeDisplay'
import { dependencyCodeLabel } from '@/lib/asset-id'
import { MOCK_ASSETS } from '@/lib/mock-data'

interface Props {
  params: Promise<{ id: string }>
}

export default function AssetDetailPage({ params }: Props) {
  const { id } = use(params)
  const { asset, isLoading, error } = useAsset(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-10 w-10 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-600">Asset not found</p>
        <Link href="/assets" className="mt-3 text-sm text-blue-600 hover:underline">
          ← Back to Assets
        </Link>
      </div>
    )
  }

  // Resolve related asset names for dependency display
  const dependsOnAssets  = (asset.depends_on ?? []).map((aid) => MOCK_ASSETS.find((a) => a.id === aid))
  const feedsAssets      = (asset.feeds ?? []).map((aid) => MOCK_ASSETS.find((a) => a.id === aid))
  const dependentAssets  = (asset.dependents ?? []).map((aid) => MOCK_ASSETS.find((a) => a.id === aid))

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/assets"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Assets
        </Link>
        <Link
          href={`/assets/${asset.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
            <p className="mt-0.5 font-mono text-sm text-blue-700">{asset.facility_asset_id}</p>
            {asset.description && (
              <p className="mt-2 text-sm text-slate-600">{asset.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <AssetStatusBadge status={asset.status} />
            <DependencyBadge code={asset.dependency_code} />
          </div>
        </div>

        {asset.location_notes && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {asset.location_notes}
          </div>
        )}
      </div>

      {/* Two-column grid on larger screens */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          {/* Equipment details */}
          <Section title="Equipment Details" icon={<Info className="h-4 w-4" />}>
            <dl className="divide-y divide-slate-100">
              {[
                ['Manufacturer', asset.manufacturer],
                ['Model',        asset.model],
                ['Serial No.',   asset.serial_number],
                ['Year Installed', asset.year_installed],
                ['Department',   asset.department_code],
                ['Building',     asset.building_code],
              ].map(([label, value]) =>
                value ? (
                  <div key={String(label)} className="flex justify-between py-2.5 text-sm">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-900 text-right">{String(value)}</dd>
                  </div>
                ) : null
              )}
            </dl>
          </Section>

          {/* Meter / runtime */}
          {asset.current_meter_value !== undefined && (
            <Section title="Meter Reading" icon={<Gauge className="h-4 w-4" />}>
              <div className="py-2">
                <p className="text-3xl font-bold text-slate-900">
                  {asset.current_meter_value.toLocaleString()}
                  <span className="ml-1.5 text-base font-normal text-slate-500">
                    {asset.meter_unit}
                  </span>
                </p>
                {asset.last_meter_update && (
                  <p className="mt-1 text-xs text-slate-400">
                    Updated {new Date(asset.last_meter_update).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* Dependency info */}
          <Section title="Dependency Type" icon={<AlertTriangle className="h-4 w-4" />}>
            <p className="text-sm text-slate-600 py-2">
              {dependencyCodeLabel(asset.dependency_code)}
            </p>

            {dependsOnAssets.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Depends on (DEPENDS_ON)
                </p>
                <ul className="space-y-1">
                  {dependsOnAssets.map((a) => a && (
                    <li key={a.id}>
                      <Link
                        href={`/assets/${a.id}`}
                        className="text-sm text-blue-600 hover:underline font-mono"
                      >
                        {a.facility_asset_id}
                      </Link>
                      <span className="text-xs text-slate-400 ml-2">{a.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedsAssets.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Feeds (FEEDS)
                </p>
                <ul className="space-y-1">
                  {feedsAssets.map((a) => a && (
                    <li key={a.id}>
                      <Link
                        href={`/assets/${a.id}`}
                        className="text-sm text-blue-600 hover:underline font-mono"
                      >
                        {a.facility_asset_id}
                      </Link>
                      <span className="text-xs text-slate-400 ml-2">{a.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dependentAssets.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Dependents
                </p>
                <ul className="space-y-1">
                  {dependentAssets.map((a) => a && (
                    <li key={a.id}>
                      <Link
                        href={`/assets/${a.id}`}
                        className="text-sm text-blue-600 hover:underline font-mono"
                      >
                        {a.facility_asset_id}
                      </Link>
                      <span className="text-xs text-slate-400 ml-2">{a.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Barcode */}
          <BarcodeDisplay
            assetNumber={asset.asset_number}
            facilityAssetId={asset.facility_asset_id}
          />

          {/* Quick links */}
          <Section title="Related" icon={<ClipboardList className="h-4 w-4" />}>
            <div className="space-y-2 py-1">
              <Link
                href={`/work-orders?asset_id=${asset.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <ClipboardList className="h-4 w-4 text-slate-400" />
                  Work Orders
                </span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                href={`/pm?asset_id=${asset.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  PM Schedules
                </span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>
          </Section>

          {/* Timestamps */}
          <div className="text-xs text-slate-400 space-y-1 px-1">
            <p>Added: {new Date(asset.created_at).toLocaleDateString()}</p>
            <p>Updated: {new Date(asset.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
        {icon && <span className="text-slate-400">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  )
}
