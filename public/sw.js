// Simple Service Worker - Minimal caching to avoid errors
const CACHE_NAME = 'pieces-auto-renault-v5'

// Install event - minimal setup
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - very minimal caching, skip development files
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip all Next.js development files
  if (url.pathname.includes('/_next/static/') || 
      url.pathname.includes('/_next/webpack-hmr') ||
      url.pathname.includes('webpack.js') ||
      url.pathname.includes('app-pages-internals.js') ||
      url.pathname.includes('main-app.js') ||
      url.pathname.includes('layout.js') ||
      url.pathname.includes('page.js') ||
      url.pathname.includes('layout.css') ||
      url.pathname.includes('page.css')) {
    return // Let the browser handle these files normally
  }

  // Only handle same-origin GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return
  }

  // Only cache specific static assets
  if (url.pathname === '/' || url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }

          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.ok) {
                const responseClone = fetchResponse.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
                  .catch((error) => {
                    console.log('Cache error (ignored):', error)
                  })
              }
              return fetchResponse
            })
        })
    )
  }
})
