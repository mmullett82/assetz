'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useReferenceCardForAsset } from '@/hooks/useReferenceCard'
import ReferenceCardEditor from '@/components/reference-cards/ReferenceCardEditor'
import type { ReferenceCard } from '@/types'

const EMPTY_CARD: ReferenceCard = {
  id: '',
  organization_id: '',
  title: 'New Reference Card',
  version: 1,
  is_published: false,
  created_by_id: '',
  updated_by_id: '',
  sections: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default function EditReferenceCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { card, isLoading } = useReferenceCardForAsset(id)

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading...</div>
  }

  const effectiveCard = card ?? EMPTY_CARD

  return (
    <div className="space-y-5 max-w-3xl">
      <Link
        href={`/assets/${id}/reference-card`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reference Card
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">
        {card ? 'Edit Reference Card' : 'Create Reference Card'}
      </h1>

      <ReferenceCardEditor card={effectiveCard} assetId={id} />
    </div>
  )
}
