import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WorkOrderForm from '@/components/work-orders/WorkOrderForm'

export const metadata: Metadata = { title: 'New Work Order' }

export default async function NewWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ asset_id?: string; duplicate?: string }>
}) {
  const params = await searchParams
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/work-orders"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Work Orders
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">New Work Order</h1>
      </div>

      <WorkOrderForm defaultAssetId={params.asset_id} duplicateId={params.duplicate} />
    </div>
  )
}
