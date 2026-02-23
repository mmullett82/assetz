'use client'

import { useEffect, useRef } from 'react'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
  separator?: boolean   // renders a <hr> before this item
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number }
  onClose: () => void
}

export default function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Clamp position so menu never overflows viewport
  const x = Math.min(position.x, (typeof window !== 'undefined' ? window.innerWidth : 0) - 200)
  const y = Math.min(position.y, (typeof window !== 'undefined' ? window.innerHeight : 0) - (items.length * 36 + 16))

  useEffect(() => {
    function handleClose(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      onClose()
    }
    function handleScroll() { onClose() }

    window.addEventListener('click', handleClose)
    window.addEventListener('keydown', handleClose)
    window.addEventListener('contextmenu', onClose)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('click', handleClose)
      window.removeEventListener('keydown', handleClose)
      window.removeEventListener('contextmenu', onClose)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Context menu"
      style={{ top: y, left: x }}
      className="fixed z-[100] rounded-xl bg-white shadow-2xl border border-slate-100 py-1.5 min-w-[180px]"
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.separator && (
            <hr className="my-1 border-slate-100" />
          )}
          <button
            role="menuitem"
            type="button"
            onClick={() => { item.onClick(); onClose() }}
            className={[
              'flex w-full items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors text-left',
              item.destructive
                ? 'text-red-600 hover:bg-red-50'
                : 'text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            {item.icon && (
              <span className="h-4 w-4 shrink-0" aria-hidden="true">{item.icon}</span>
            )}
            {item.label}
          </button>
        </div>
      ))}
    </div>
  )
}
