'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus } from 'lucide-react'
import { useReferenceCardForAsset } from '@/hooks/useReferenceCard'
import { usePermissions } from '@/hooks/usePermissions'
import ReferenceCardViewer from '@/components/reference-cards/ReferenceCardViewer'
import FixModeToggle from '@/components/reference-cards/FixModeToggle'
import Can from '@/components/ui/Can'

export default function ReferenceCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { card, isLoading } = useReferenceCardForAsset(id)
  const { can } = usePermissions()

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading...</div>
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href={`/assets/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Asset
        </Link>
        {card && (
          <Can action="edit_reference_cards">
            <Link
              href={`/assets/${id}/reference-card/edit`}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" /> Edit
            </Link>
          </Can>
        )}
      </div>

      {card ? (
        <div className="space-y-4">
          <FixModeToggle />
          <ReferenceCardViewer card={card} />
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-lg font-medium text-slate-500">No Reference Card</p>
          <p className="text-sm text-slate-400 mt-1">
            No reference card has been created for this asset or its model.
          </p>
          <Can action="edit_reference_cards">
            <Link
              href={`/assets/${id}/reference-card/edit`}
              className="inline-flex items-center gap-2 mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Create Reference Card
            </Link>
          </Can>
        </div>
      )}
    </div>
  )
}
