// bump this when deploying UI changes to force clients to fetch new assets
const CACHE_NAME = 'yaduang-pos-v1.6.1'

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

  // ไม่ intercept cross-origin requests (เช่น API ที่ Render) — ปล่อยให้ browser จัดการ CORS เอง
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // ไม่ intercept Next.js RSC / data requests ด้วย เพราะ revalidate เอง
  if (url.pathname.startsWith('/_next/')) return

  e.respondWith(
    fetch(req)
      .then((res) => {
        // only cache successful basic responses (same-origin)
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req))
  )
})
