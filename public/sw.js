// Minimal service worker: exists only to satisfy PWA installability
// (a registered SW with a fetch handler). No offline caching yet —
// that comes later as a separate, deliberate pass.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
