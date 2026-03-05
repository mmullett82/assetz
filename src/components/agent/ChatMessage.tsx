'use client'

import { Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/hooks/useAgentChat'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={[
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-100' : 'bg-slate-100',
        ].join(' ')}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-blue-600" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-slate-600" />
        )}
      </div>
      <div
        className={[
          'flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white ml-8'
            : 'bg-slate-100 text-slate-800 mr-8',
        ].join(' ')}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {isStreaming && !message.content && (
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
