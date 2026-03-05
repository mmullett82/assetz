'use client'

import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

let _listeners: Array<(t: Toast) => void> = []

/** Fire a toast from anywhere (even outside React) */
export function showToast(type: ToastType, message: string) {
  const t: Toast = { id: crypto.randomUUID(), type, message }
  _listeners.forEach((fn) => fn(t))
}

/** Hook — mounts in AppShell to render toasts */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id))
    }, 4000)
  }, [])

  // Register/unregister listener
  useState(() => {
    _listeners.push(add)
    return () => {
      _listeners = _listeners.filter((fn) => fn !== add)
    }
  })

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, dismiss }
}
