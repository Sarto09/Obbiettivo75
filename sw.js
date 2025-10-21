// Service Worker for Trasformazione 2025
//
// Caches static assets on first load to enable offline access and
// implements a network-first strategy for navigation requests.  If
// network is unavailable, it falls back to the cached index.html.

const CACHE_NAME = 'tracker-cache-v1';

// List of files to cache during the install phase.  If you add other
// files (e.g. additional scripts, images) to the project, list them
// here so they get cached on first load.
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install event: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate event: purge old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
      )
    )
  );
  self.clients.claim();
});

// Fetch event: network-first for navigations, cache-first for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  // For navigations (HTML pages), try network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(response => {
          // Optionally cache new requests here (not done to avoid unexpected behaviour)
          return response;
        })
      );
    })
  );
});