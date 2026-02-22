'use client'

import { useState } from 'react'
import type { WorkOrderComment } from '@/types'
import { formatDate } from '@/lib/due-status'
import { Send } from 'lucide-react'

interface CommentThreadProps {
  comments: WorkOrderComment[]
  onAddComment: (body: string) => Promise<void>
  isReadOnly?: boolean
}

export default function CommentThread({ comments, onAddComment, isReadOnly = false }: CommentThreadProps) {
  const [body, setBody]         = useState('')
  const [isSending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    setSending(true)
    try {
      await onAddComment(trimmed)
      setBody('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700">
        Comments{comments.length > 0 && <span className="ml-1.5 text-slate-400 font-normal">({comments.length})</span>}
      </h2>

      {/* Thread */}
      {comments.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold select-none">
                {comment.user?.full_name?.charAt(0).toUpperCase() ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900">
                    {comment.user?.full_name ?? 'Unknown'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add comment */}
      {!isReadOnly && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-100">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            onKeyDown={(e) => {
              // Ctrl/Cmd+Enter to submit
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
          />
          <button
            type="submit"
            disabled={!body.trim() || isSending}
            aria-label="Send comment"
            className="flex items-center justify-center rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  )
}
