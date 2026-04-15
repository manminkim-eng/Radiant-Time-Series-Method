/* =====================================================
   RTS-MANMIN Service Worker  Ver 3.0
   ASHRAE 2009 RTS 건축물 부하계산서 PWA
   ===================================================== */

const CACHE_NAME    = 'rts-manmin-v3.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap'
];

/* ── Install : 정적 자산 캐시 ── */
self.addEventListener('install', event => {
  console.log('[SW] Installing RTS-MANMIN v3.0.0...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Cache miss:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate : 구버전 캐시 정리 ── */
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch : Cache-First + Network Fallback ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Google Fonts → Network First (폰트는 온라인 우선) */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      fetch(request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* 나머지 → Cache First */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(resp => {
          if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return resp;
        })
        .catch(() => {
          /* 오프라인 & 미캐시 → index.html 반환 */
          if (request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

/* ── Background Sync (계산 결과 자동 저장용) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-calc-data') {
    console.log('[SW] Background sync: calc-data');
  }
});

/* ── Push Notification (업데이트 알림 예비) ── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'RTS-MANMIN', {
    body:    data.body    || '새 업데이트가 있습니다.',
    icon:    './icons/icon-192x192.png',
    badge:   './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data:    { url: data.url || './' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || './')
  );
});

console.log('[SW] RTS-MANMIN Service Worker loaded.');
