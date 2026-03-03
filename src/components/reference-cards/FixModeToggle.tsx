'use client'

import { useState } from 'react'
import { Zap, GraduationCap } from 'lucide-react'

type FixMode = 'quick' | 'learn'

export default function FixModeToggle() {
  const [mode, setMode] = useState<FixMode>('quick')

  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
      <button
        onClick={() => setMode('quick')}
        className={[
          'flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'quick'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700',
        ].join(' ')}
      >
        <Zap className="h-3.5 w-3.5" />
        Quick Fix
      </button>
      <button
        onClick={() => setMode('learn')}
        className={[
          'flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          mode === 'learn'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700',
        ].join(' ')}
        title="AI-enhanced learning mode (Coming soon)"
      >
        <GraduationCap className="h-3.5 w-3.5" />
        Learn & Fix
        <span className="text-[10px] text-slate-400">(Soon)</span>
      </button>
    </div>
  )
}
