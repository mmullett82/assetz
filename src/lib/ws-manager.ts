/**
 * WebSocket manager for assetZ real-time updates.
 *
 * Connects to the backend WebSocket endpoint and dispatches typed events
 * to registered handlers. Handles reconnection automatically.
 *
 * Backend broadcasts:
 *  - work_order.created / updated / completed
 *  - asset.status_changed
 *  - kpi.updated
 *  - notification
 */

import type { WSEvent, WSEventType } from '@/types'

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws'

type EventHandler<T = unknown> = (event: WSEvent<T>) => void

class WebSocketManager {
  private ws: WebSocket | null = null
  private token: string | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 2000     // ms, doubles on each failure
  private maxReconnectDelay = 30000  // 30s cap
  private handlers = new Map<WSEventType, Set<EventHandler>>()
  private isIntentionallyClosed = false

  connect(token: string): void {
    this.token = token
    this.isIntentionallyClosed = false
    this._open()
  }

  disconnect(): void {
    this.isIntentionallyClosed = true
    this._clearReconnect()
    if (this.ws) {
      this.ws.close(1000, 'user logout')
      this.ws = null
    }
  }

  on<T = unknown>(eventType: WSEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler as EventHandler)

    // Return an unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler)
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private _open(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    const url = `${WS_BASE}?token=${encodeURIComponent(this.token ?? '')}`

    try {
      this.ws = new WebSocket(url)
    } catch (err) {
      console.warn('[WS] Failed to construct WebSocket:', err)
      this._scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      console.log('[WS] Connected')
      this.reconnectDelay = 2000  // reset backoff on success
    }

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WSEvent
        this._dispatch(parsed)
      } catch {
        console.warn('[WS] Unparseable message:', event.data)
      }
    }

    this.ws.onerror = (err) => {
      console.warn('[WS] Error:', err)
    }

    this.ws.onclose = (event) => {
      console.log(`[WS] Closed (${event.code})`)
      this.ws = null
      if (!this.isIntentionallyClosed) {
        this._scheduleReconnect()
      }
    }
  }

  private _dispatch(event: WSEvent): void {
    const handlers = this.handlers.get(event.type)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        handler(event)
      } catch (err) {
        console.error('[WS] Handler threw:', err)
      }
    }
  }

  private _scheduleReconnect(): void {
    this._clearReconnect()
    console.log(`[WS] Reconnecting in ${this.reconnectDelay}ms`)
    this.reconnectTimer = setTimeout(() => {
      this._open()
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        this.maxReconnectDelay
      )
    }, this.reconnectDelay)
  }

  private _clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// Singleton — one WS connection for the whole app
const wsManager = new WebSocketManager()
export default wsManager
