import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PartForm from '@/components/parts/PartForm'

export default function NewPartPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/parts"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Parts Inventory
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Part</h1>
        <p className="text-sm text-slate-500 mt-1">Add a part or component to the inventory.</p>
      </div>

      <PartForm />
    </div>
  )
}
