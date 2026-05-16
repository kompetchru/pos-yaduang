// bump this when deploying UI changes to force clients to fetch new assets
const CACHE_NAME = 'yaduang-pos-v1.5.6'

self.addEventListener('install', (e) => {
  // activate the new SW immediately on install
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  )
})

// network-first for everything (POS app — fresh UI matters more than offline)
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  e.respondWith(
    fetch(req)
      .then((res) => {
        // only cache successful basic/cors responses
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req))
  )
})
