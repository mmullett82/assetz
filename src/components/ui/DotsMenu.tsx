'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { ContextMenuItem } from './ContextMenu'

interface DotsMenuProps {
  items: ContextMenuItem[]
  align?: 'left' | 'right'
  size?: 'sm' | 'md'
}

export default function DotsMenu({ items, align = 'right', size = 'md' }: DotsMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className={[
          'flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors',
          btnSize,
        ].join(' ')}
        aria-label="More options"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          className={[
            'absolute top-full mt-1 z-20 rounded-xl bg-white shadow-2xl border border-slate-100 py-1.5 min-w-[180px]',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
          role="menu"
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && <hr className="my-1 border-slate-100" />}
              <button
                role="menuitem"
                type="button"
                onClick={() => { item.onClick(); setOpen(false) }}
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
      )}
    </div>
  )
}
