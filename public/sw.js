// Service Worker — Quantum Falcon PWA
// November 26, 2025 — Launch Day

const CACHE_NAME = 'quantum-falcon-v2025.1.0';
const OFFLINE_URL = '/404.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/falcon-head-official.png',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Fallback to cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // For navigation requests, return offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        return new Response('Offline', { status: 503 });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Quantum Falcon';
  const options = {
    body: data.body || 'New trading signal detected',
    icon: '/falcon-head-official.png',
    badge: '/falcon-head-official.png',
    vibrate: [100, 50, 100],
    data: data.url || '/',
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

