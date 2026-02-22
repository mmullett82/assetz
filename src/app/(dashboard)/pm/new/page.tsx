import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PMForm from '@/components/pm/PMForm'

export default function NewPMPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/pm"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          PM Schedules
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">New PM Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Define a recurring maintenance task for an asset.</p>
      </div>

      <PMForm />
    </div>
  )
}
