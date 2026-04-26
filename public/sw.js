// Brofit Service Worker — minimal, required for PWA installability
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  // If we don't intend to cache, we can just return or use a passive listener.
  // Passive listeners (no respondWith) satisfy PWA requirements without the fetch overhead.
});
