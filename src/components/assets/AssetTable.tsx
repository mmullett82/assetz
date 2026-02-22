/**
 * Desktop table view for the asset list.
 */
'use client'

import Link from 'next/link'
import type { Asset } from '@/types'
import AssetStatusBadge from '@/components/ui/AssetStatusBadge'
import DependencyBadge from './DependencyBadge'

interface AssetTableProps {
  assets: Asset[]
}

export default function AssetTable({ assets }: AssetTableProps) {
  if (assets.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Asset
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Facility ID
            </th>
            <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Barcode #
            </th>
            <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Department
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/assets/${asset.id}`}
                  className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {asset.name}
                </Link>
                {asset.manufacturer && (
                  <p className="text-xs text-slate-400">{asset.manufacturer} {asset.model}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-blue-700 whitespace-nowrap">
                  {asset.facility_asset_id}
                </span>
              </td>
              <td className="hidden sm:table-cell px-4 py-3">
                <span className="font-mono text-xs text-slate-500">
                  {asset.asset_number}
                </span>
              </td>
              <td className="hidden md:table-cell px-4 py-3 text-slate-600 capitalize">
                {asset.department_code}
              </td>
              <td className="px-4 py-3">
                <DependencyBadge code={asset.dependency_code} />
              </td>
              <td className="px-4 py-3">
                <AssetStatusBadge status={asset.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/assets/${asset.id}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
