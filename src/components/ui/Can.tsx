'use client'

import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import type { Action } from '@/lib/permissions'

interface CanProps {
  action: Action
  children: ReactNode
  fallback?: ReactNode
}

export default function Can({ action, children, fallback = null }: CanProps) {
  const { can } = usePermissions()
  return can(action) ? <>{children}</> : <>{fallback}</>
}
