'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { USE_MOCK } from '@/lib/config'

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { canRoute } = usePermissions()
  const pathname = usePathname()
  const router = useRouter()

  const allowed = USE_MOCK || canRoute(pathname)

  useEffect(() => {
    if (!allowed) {
      router.replace('/dashboard')
    }
  }, [allowed, router])

  if (!allowed) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-400">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return <>{children}</>
}
