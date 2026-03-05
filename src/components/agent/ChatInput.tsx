'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Square } from 'lucide-react'
import VoiceInput from '@/components/ui/VoiceInput'

interface ChatInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isStreaming?: boolean
  disabled?: boolean
}

export default function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [value])

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isStreaming) return
      handleSubmit()
    }
  }

  function handleTranscript(text: string) {
    setValue((prev) => (prev ? prev + ' ' : '') + text)
  }

  return (
    <div className="border-t border-slate-200 p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            disabled={disabled}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none disabled:opacity-50"
          />
          <div className="absolute bottom-1.5 right-1.5">
            <VoiceInput onTranscript={handleTranscript} />
          </div>
        </div>
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Stop"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="flex-shrink-0 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
