'use client'

import PlatformWizard from '@/components/import/PlatformWizard'
import { use } from 'react'

export default function PlatformImportPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = use(params)
  return <PlatformWizard platform={platform} />
}
