'use client'

import { useEffect } from 'react'
import wsManager from '@/lib/ws-manager'
import type { WSEventType, WSEvent } from '@/types'

/**
 * Subscribe to a WebSocket event type and run a handler when it fires.
 * Automatically unsubscribes on unmount.
 */
export function useWebSocket<T = unknown>(
  eventType: WSEventType,
  handler: (event: WSEvent<T>) => void
): void {
  useEffect(() => {
    const unsubscribe = wsManager.on<T>(eventType, handler)
    return unsubscribe
  }, [eventType, handler])
}
