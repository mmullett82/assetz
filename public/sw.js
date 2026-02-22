/**
 * assetZ Service Worker
 *
 * Strategy: Network-first for API calls, cache-first for static assets.
 * This ensures technicians always get fresh data when online, but the
 * app shell still loads offline.
 */

const CACHE_NAME = 'assetz-v1'

// App shell resources to precache on install
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/login',
  '/offline',
]

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // API calls: network-first, no caching
  if (url.pathname.startsWith('/api') || url.hostname === 'localhost') {
    event.respondWith(fetch(request))
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          // Only cache successful responses for same-origin resources
          if (
            response.ok &&
            response.type === 'basic' &&
            !url.pathname.startsWith('/_next/data')
          ) {
            const toCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, toCache))
          }
          return response
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline') ?? new Response('Offline', { status: 503 })
          }
          return new Response('', { status: 503 })
        })
    })
  )
})
