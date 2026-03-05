'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const colors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: { id: string; type: 'success' | 'error' | 'info'; message: string }; onDismiss: () => void }) {
  const [show, setShow] = useState(false)
  const Icon = icons[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
  }, [])

  return (
    <div
      className={[
        'pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg max-w-sm transition-all duration-300',
        colors[toast.type],
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      ].join(' ')}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[toast.type]}`} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
