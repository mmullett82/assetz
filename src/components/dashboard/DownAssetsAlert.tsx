import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { MOCK_ASSETS } from '@/lib/mock-data'

export default function DownAssetsAlert() {
  const downAssets = MOCK_ASSETS.filter((a) => a.status === 'down')

  if (downAssets.length === 0) return null

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-bold text-red-700">
          {downAssets.length} Asset{downAssets.length !== 1 ? 's' : ''} Down
        </h2>
      </div>

      <ul className="space-y-2">
        {downAssets.map((asset) => (
          <li key={asset.id}>
            <Link
              href={`/assets/${asset.id}`}
              className="flex items-center justify-between rounded-lg bg-white border border-red-200 px-3 py-2.5 hover:border-red-300 hover:shadow-sm transition-all group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-red-700 transition-colors">
                  {asset.name}
                </p>
                <p className="font-mono text-xs text-slate-400">{asset.facility_asset_id}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/work-orders/new?asset_id=${asset.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition-colors min-h-[32px] flex items-center"
                >
                  + WO
                </Link>
                <span className="text-slate-300" aria-hidden="true">→</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
