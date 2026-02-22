/**
 * Mobile card view for an individual asset — used in the list on small screens.
 * Large tap target, status-colored left border.
 */
import Link from 'next/link'
import type { Asset } from '@/types'
import AssetStatusBadge from '@/components/ui/AssetStatusBadge'
import DependencyBadge from './DependencyBadge'
import { ChevronRight, MapPin } from 'lucide-react'

const STATUS_BORDER: Record<Asset['status'], string> = {
  operational:    'border-l-green-500',
  down:           'border-l-red-500',
  maintenance:    'border-l-yellow-400',
  decommissioned: 'border-l-slate-300',
}

export default function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Link
      href={`/assets/${asset.id}`}
      className={[
        'flex items-center gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm',
        'border border-slate-200 hover:border-blue-200 hover:shadow transition-all',
        'active:scale-[0.99]',
        STATUS_BORDER[asset.status],
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm truncate">
            {asset.name}
          </span>
          <AssetStatusBadge status={asset.status} />
        </div>

        <p className="mt-0.5 font-mono text-xs text-blue-700 truncate">
          {asset.facility_asset_id}
        </p>

        <div className="mt-1.5 flex items-center gap-3 flex-wrap">
          <DependencyBadge code={asset.dependency_code} />
          {asset.location_notes && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {asset.location_notes}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-400 font-mono">{asset.asset_number}</p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
    </Link>
  )
}
