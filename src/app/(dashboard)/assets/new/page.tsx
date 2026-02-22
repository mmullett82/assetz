import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AssetForm from '@/components/assets/AssetForm'

export const metadata: Metadata = { title: 'New Asset' }

export default function NewAssetPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/assets"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Assets
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">New Asset</h1>
      </div>

      <AssetForm />
    </div>
  )
}
