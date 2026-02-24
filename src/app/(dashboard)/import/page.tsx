'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileUp, ArrowRight } from 'lucide-react'
import { PLATFORM_META } from '@/lib/mock-import-data'

export default function ImportPage() {
  const router = useRouter()

  const platforms = Object.entries(PLATFORM_META)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Import Data</h1>
        <p className="mt-1 text-slate-500">Migrate your existing data into assetZ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV / File upload path */}
        <div className="rounded-2xl border-2 border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <FileUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upload a File</h2>
              <p className="text-sm text-slate-500">.csv or .xlsx</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4 flex-1">
            Import from a CSV or Excel file. Works with any platform — export your data, upload here,
            and our AI will auto-map your columns to assetZ fields.
          </p>

          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">.csv</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">.xlsx</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">.xls</span>
          </div>

          <Link
            href="/import/csv"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Start CSV Import
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Platform direct connect path */}
        <div className="rounded-2xl border-2 border-slate-200 p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Connect Your Platform</h2>
            <p className="mt-1 text-sm text-slate-500">
              Direct import from your current CMMS. We pull everything automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {platforms.map(([id, meta]) => (
              <button
                key={id}
                onClick={() => router.push(`/import/platform/${id}`)}
                className={[
                  'cursor-pointer rounded-xl border-2 p-4 text-left',
                  'hover:shadow-md transition-all',
                  meta.borderClass,
                  meta.hoverBorderClass,
                ].join(' ')}
              >
                <p className={`text-sm font-semibold ${meta.textClass}`}>{meta.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{meta.tagline}</p>
              </button>
            ))}

            {/* Other Platform → CSV path */}
            <button
              onClick={() => router.push('/import/csv')}
              className="cursor-pointer rounded-xl border-2 border-slate-200 hover:border-slate-400 p-4 text-left hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-slate-700">Other Platform</p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">Use CSV export instead</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
