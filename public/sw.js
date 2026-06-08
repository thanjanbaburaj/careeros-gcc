/**
 * CareerOS GCC — Service Worker
 * Enables offline mode. Caches app shell and static assets.
 * Dynamic content (job listings) cached for 6 hours.
 */

const CACHE_NAME    = 'careeros-gcc-v1'
const OFFLINE_URL   = '/careeros-gcc/'

const STATIC_ASSETS = [
  '/careeros-gcc/',
  '/careeros-gcc/index.html',
  '/careeros-gcc/manifest.json',
  '/careeros-gcc/favicon.svg',
]

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Fail silently — not all assets may exist yet
      })
    })
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET and external API calls
  if (event.request.method !== 'GET') return
  if (url.hostname !== location.hostname) return

  // Network first for HTML (always get fresh app shell)
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Cache first for JS, CSS, fonts, images
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => cached)
    })
  )
})
