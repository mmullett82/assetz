'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatContext {
  page?: string
  entityType?: string
  entityData?: Record<string, unknown>
  userRole?: string
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string, context?: ChatContext) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    // Build message history for API (last 20 messages for context window)
    const history = [...messages, userMsg].slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `Error: ${err.error || 'Failed to get response'}` }
              : m
          )
        )
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              )
            }
            if (parsed.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: `Error: ${parsed.error}` }
                    : m
                )
              )
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Failed to connect to AI assistant.' }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsStreaming(false)
  }, [])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
    stopStreaming,
  }
}
