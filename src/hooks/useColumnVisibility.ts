import { useState, useCallback } from 'react'

/**
 * Persists column visibility state in localStorage.
 * Returns [visibility record, setter function].
 */
export function useColumnVisibility<T extends string>(
  key: string,
  defaults: Record<T, boolean>
): [Record<T, boolean>, (col: T, visible: boolean) => void] {
  const [visibility, setVisibility] = useState<Record<T, boolean>>(() => {
    if (typeof window === 'undefined') return defaults
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return defaults
      const parsed = JSON.parse(stored) as Record<string, boolean>
      // Merge stored values over defaults (new columns get default visibility)
      return Object.fromEntries(
        (Object.keys(defaults) as T[]).map((col) => [
          col,
          col in parsed ? parsed[col] : defaults[col],
        ])
      ) as Record<T, boolean>
    } catch {
      return defaults
    }
  })

  const setColumn = useCallback((col: T, visible: boolean) => {
    setVisibility((prev) => {
      const next = { ...prev, [col]: visible }
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }, [key])

  return [visibility, setColumn]
}
