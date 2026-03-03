'use client'

import { useCallback } from 'react'
import { useAuth } from './useAuth'
import type { UserRole } from '@/types'
import { hasPermission, canAccessRoute, type Action } from '@/lib/permissions'

export function usePermissions() {
  const { user } = useAuth()
  const role = (user?.role ?? 'viewer') as UserRole

  const can = useCallback(
    (action: Action) => hasPermission(role, action),
    [role]
  )

  const canRoute = useCallback(
    (path: string) => canAccessRoute(role, path),
    [role]
  )

  return { role, can, canRoute, user }
}
