'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import type { ContextMenuItem } from './ContextMenu'

interface DotsMenuProps {
  items: ContextMenuItem[]
  align?: 'left' | 'right'
  size?: 'sm' | 'md'
}

export default function DotsMenu({ items, align = 'right', size = 'md' }: DotsMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleOutside(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        dropRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    // Close on any scroll so the menu doesn't float away from its button
    function handleScroll() { setOpen(false) }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    document.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
      document.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [open])

  function handleButtonClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + 4,
        ...(align === 'right'
          ? { right: window.innerWidth - rect.right }
          : { left: rect.left }),
      })
    }
    setOpen((v) => !v)
  }

  const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleButtonClick}
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

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropRef}
          style={{
            position: 'fixed',
            top: pos.top,
            ...(pos.right !== undefined ? { right: pos.right } : { left: pos.left }),
            zIndex: 9999,
          }}
          className="rounded-xl bg-white shadow-2xl border border-slate-100 py-1.5 min-w-[180px]"
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
        </div>,
        document.body
      )}
    </>
  )
}
