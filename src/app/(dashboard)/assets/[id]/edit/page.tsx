'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useAsset } from '@/hooks/useAsset'
import AssetForm from '@/components/assets/AssetForm'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditAssetPage({ params }: Props) {
  const { id } = use(params)
  const { asset, isLoading, error } = useAsset(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-96 rounded-xl bg-slate-100 animate-pulse" />
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

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/assets/${asset.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {asset.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Asset</h1>
      </div>

      <AssetForm asset={asset} />
    </div>
  )
}
