'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Sparkles, X, Trash2 } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { useAgentChat } from '@/hooks/useAgentChat'

// Smart prompt suggestions based on current page
function getSuggestions(pathname: string): string[] {
  if (pathname.startsWith('/work-orders/') && pathname !== '/work-orders') {
    return ['Summarize this WO', 'Suggest root cause', 'Find similar past WOs']
  }
  if (pathname.startsWith('/assets/') && pathname !== '/assets') {
    return ['Show maintenance history', 'Suggest PM schedule', 'Check warranty status']
  }
  if (pathname.startsWith('/pm/') && pathname.includes('/new')) {
    return ['Suggest frequency', 'Recommend parts list']
  }
  if (pathname === '/dashboard') {
    return ['What needs attention today?', 'Summary of overdue items']
  }
  if (pathname === '/work-orders') {
    return ['Show overdue work orders', 'Most common failure types']
  }
  if (pathname === '/assets') {
    return ['Which assets need attention?', 'Show down equipment']
  }
  if (pathname === '/pm') {
    return ['What PMs are overdue?', 'Show upcoming PMs this week']
  }
  return ['What needs attention today?', 'Show overdue items', 'Help me get started']
}

export default function AgentChatPanel() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isStreaming, sendMessage, clearMessages, stopStreaming } = useAgentChat()

  const suggestions = getSuggestions(pathname)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(content: string) {
    sendMessage(content, {
      page: pathname,
    })
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center group"
          title="AI Assistant"
        >
          <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[400px] h-full sm:h-[600px] sm:bottom-6 sm:right-6 sm:rounded-xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">AI Assistant</p>
                <p className="text-[11px] text-slate-500">Powered by Claude</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">How can I help?</p>
                <p className="text-xs text-slate-500 mb-6">
                  Ask about assets, work orders, PMs, or maintenance procedures.
                </p>

                {/* Smart prompt chips */}
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick suggestions when not empty */}
          {messages.length > 0 && !isStreaming && (
            <div className="px-4 pb-1 flex flex-wrap gap-1.5">
              {suggestions.slice(0, 2).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      )}
    </>
  )
}
