'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  language?: string
  continuous?: boolean
  className?: string
}

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export default function VoiceInput({
  onTranscript,
  language = 'en-US',
  continuous = true,
  className = '',
}: VoiceInputProps) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    setSupported(!!getSpeechRecognition())
  }, [])

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = false
    recognition.lang = language
    recognitionRef.current = recognition

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          transcript += e.results[i][0].transcript
        }
      }
      if (transcript) {
        onTranscript(transcript)
      }
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
    setListening(true)
  }, [listening, onTranscript, language, continuous])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input not supported in this browser"
        className={`flex-shrink-0 p-1.5 text-slate-300 cursor-not-allowed ${className}`}
      >
        <MicOff className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? 'Stop listening' : 'Voice input'}
      className={[
        'flex-shrink-0 p-1.5 rounded-md transition-all',
        listening
          ? 'text-red-600 bg-red-50 animate-pulse'
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
        className,
      ].join(' ')}
    >
      <Mic className="h-4 w-4" />
      {listening && (
        <span className="sr-only">Listening...</span>
      )}
    </button>
  )
}

/** Wrapper that places a VoiceInput inside a textarea's container */
export function TextareaWithVoice({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleTranscript(text: string) {
    const el = textareaRef.current
    if (!el) return
    const val = typeof value === 'string' ? value : String(value ?? '')
    const start = el.selectionStart ?? val.length
    const before = val.slice(0, start)
    const after = val.slice(el.selectionEnd ?? start)
    const sep = before && !before.endsWith(' ') ? ' ' : ''
    const newValue = before + sep + text + after

    // Create a synthetic event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set
    nativeInputValueSetter?.call(el, newValue)
    el.dispatchEvent(new Event('input', { bubbles: true }))

    // Fallback: call onChange directly
    onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={className || 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'}
        {...props}
      />
      <div className="absolute top-2 right-2">
        <VoiceInput onTranscript={handleTranscript} />
      </div>
    </div>
  )
}
