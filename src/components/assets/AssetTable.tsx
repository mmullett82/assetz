/**
 * Desktop table view for the asset list.
 */
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, Eye, CalendarClock, ClipboardList, Package, Copy, Trash2 } from 'lucide-react'
import type { Asset } from '@/types'
import AssetStatusBadge from '@/components/ui/AssetStatusBadge'
import DependencyBadge from './DependencyBadge'
import ContextMenu, { type ContextMenuItem } from '@/components/ui/ContextMenu'
import ColumnChooser, { type ColumnDef } from '@/components/ui/ColumnChooser'
import { useColumnVisibility } from '@/hooks/useColumnVisibility'

type AssetCol = 'name' | 'facility_id' | 'barcode' | 'department' | 'type' | 'status'

const COLUMN_DEFS: ColumnDef<AssetCol>[] = [
  { key: 'name',        label: 'Asset Name',  required: true  },
  { key: 'facility_id', label: 'Facility ID', required: true  },
  { key: 'status',      label: 'Status',      required: true  },
  { key: 'barcode',     label: 'Barcode #'                    },
  { key: 'department',  label: 'Department'                   },
  { key: 'type',        label: 'Dep. Type'                    },
]

const COLUMN_DEFAULTS: Record<AssetCol, boolean> = {
  name:        true,
  facility_id: true,
  status:      true,
  barcode:     true,
  department:  true,
  type:        true,
}

interface AssetTableProps {
  assets: Asset[]
}

type CtxState = { items: ContextMenuItem[]; x: number; y: number } | null

export default function AssetTable({ assets }: AssetTableProps) {
  const router = useRouter()
  const [ctx, setCtx] = useState<CtxState>(null)
  const [visibility, setColumn] = useColumnVisibility('assets-columns', COLUMN_DEFAULTS)

  function resetColumns() {
    COLUMN_DEFS.forEach((col) => setColumn(col.key, COLUMN_DEFAULTS[col.key]))
  }

  const openCtx = useCallback((e: React.MouseEvent, asset: Asset) => {
    e.preventDefault()
    setCtx({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          onClick: () => router.push(`/assets/${asset.id}/edit`),
        },
        {
          label: 'View Detail',
          icon: <Eye className="h-4 w-4" />,
          onClick: () => router.push(`/assets/${asset.id}`),
        },
        {
          separator: true,
          label: 'Create Work Order',
          icon: <ClipboardList className="h-4 w-4" />,
          onClick: () => console.log('TODO: create WO for', asset.id),
        },
        {
          label: 'Create PM',
          icon: <CalendarClock className="h-4 w-4" />,
          onClick: () => console.log('TODO: create PM for', asset.id),
        },
        {
          label: 'Show Work Orders',
          icon: <ClipboardList className="h-4 w-4" />,
          onClick: () => router.push(`/work-orders?asset_id=${asset.id}`),
        },
        {
          label: 'Show Parts',
          icon: <Package className="h-4 w-4" />,
          onClick: () => router.push(`/parts?asset_id=${asset.id}`),
        },
        {
          separator: true,
          label: 'Duplicate',
          icon: <Copy className="h-4 w-4" />,
          onClick: () => console.log('TODO: duplicate', asset.id),
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => console.log('TODO: delete', asset.id),
          destructive: true,
        },
      ],
    })
  }, [router])

  if (assets.length === 0) return null

  return (
    <>
      {ctx && <ContextMenu items={ctx.items} position={{ x: ctx.x, y: ctx.y }} onClose={() => setCtx(null)} />}

      {/* Column chooser toolbar */}
      <div className="flex justify-end mb-2">
        <ColumnChooser
          columns={COLUMN_DEFS}
          visibility={visibility}
          onChange={setColumn}
          onReset={resetColumns}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="bg-slate-50">
              {visibility.name && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Asset
                </th>
              )}
              {visibility.facility_id && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Facility ID
                </th>
              )}
              {visibility.barcode && (
                <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Barcode #
                </th>
              )}
              {visibility.department && (
                <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </th>
              )}
              {visibility.type && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
              )}
              {visibility.status && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              )}
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
                onContextMenu={(e) => openCtx(e, asset)}
              >
                {visibility.name && (
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
                )}
                {visibility.facility_id && (
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-blue-700 whitespace-nowrap">
                      {asset.facility_asset_id}
                    </span>
                  </td>
                )}
                {visibility.barcode && (
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span className="font-mono text-xs text-slate-500">
                      {asset.asset_number}
                    </span>
                  </td>
                )}
                {visibility.department && (
                  <td className="hidden md:table-cell px-4 py-3 text-slate-600 capitalize">
                    {asset.department_code}
                  </td>
                )}
                {visibility.type && (
                  <td className="px-4 py-3">
                    <DependencyBadge code={asset.dependency_code} />
                  </td>
                )}
                {visibility.status && (
                  <td className="px-4 py-3">
                    <AssetStatusBadge status={asset.status} />
                  </td>
                )}
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
    </>
  )
}
