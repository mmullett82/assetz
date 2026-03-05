'use client'

import { useState } from 'react'
import { Mic, Sparkles, Check, Loader2 } from 'lucide-react'
import VoiceInput from '@/components/ui/VoiceInput'

interface ParsedCompletion {
  action_taken?: string
  root_cause?: string
  time_logged_minutes?: number
  parts_used?: Array<{ name: string; quantity: number }>
}

interface AICompletionHelperProps {
  assetName?: string
  onApply: (data: ParsedCompletion) => void
}

export default function AICompletionHelper({ assetName, onApply }: AICompletionHelperProps) {
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState<ParsedCompletion | null>(null)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleTranscript(text: string) {
    setTranscript((prev) => (prev ? prev + ' ' : '') + text)
    setParsed(null)
  }

  async function handleParse() {
    if (!transcript.trim()) return
    setParsing(true)
    setError(null)
    try {
      const res = await fetch('/api/agent/parse-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, asset_name: assetName }),
      })
      if (!res.ok) throw new Error('Failed to parse')
      const data = await res.json()
      setParsed(data)
    } catch {
      setError('Could not parse completion notes. Try again or enter manually.')
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-blue-800">AI Completion Assistant</p>
      </div>
      <p className="text-xs text-blue-700">
        Describe what you did using voice or text. AI will extract structured fields.
      </p>

      {/* Voice + text input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={transcript}
            onChange={(e) => { setTranscript(e.target.value); setParsed(null) }}
            rows={2}
            placeholder="Tap the mic or type: 'Replaced drive belt, took 45 minutes, used one Gates belt...'"
            className="block w-full rounded-lg border border-blue-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <div className="absolute top-2 right-2">
            <VoiceInput onTranscript={handleTranscript} />
          </div>
        </div>
      </div>

      {/* Parse button */}
      {transcript.trim() && !parsed && (
        <button
          type="button"
          onClick={handleParse}
          disabled={parsing}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {parsing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {parsing ? 'Parsing...' : 'Parse with AI'}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Parsed results */}
      {parsed && (
        <div className="rounded-lg border border-blue-200 bg-white p-3 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Parsed Fields</p>
          {parsed.action_taken && (
            <div>
              <span className="text-xs text-slate-500">Action Taken:</span>
              <p className="text-sm text-slate-800">{parsed.action_taken}</p>
            </div>
          )}
          {parsed.root_cause && (
            <div>
              <span className="text-xs text-slate-500">Root Cause:</span>
              <p className="text-sm text-slate-800">{parsed.root_cause}</p>
            </div>
          )}
          {parsed.time_logged_minutes && (
            <div>
              <span className="text-xs text-slate-500">Time:</span>
              <p className="text-sm text-slate-800">{parsed.time_logged_minutes} minutes</p>
            </div>
          )}
          {parsed.parts_used && parsed.parts_used.length > 0 && (
            <div>
              <span className="text-xs text-slate-500">Parts Used:</span>
              {parsed.parts_used.map((p, i) => (
                <p key={i} className="text-sm text-slate-800">{p.quantity}x {p.name}</p>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onApply(parsed)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            Apply to Form
          </button>
        </div>
      )}
    </div>
  )
}
