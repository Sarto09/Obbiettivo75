// Service Worker per Trasformazione 2025 – versione estesa offline
// Cache aggiornata con Chart.js e adapter per garantire grafico anche offline.

const CACHE_NAME = 'tracker-cache-v4';

// Elenco file da cachare durante l'installazione
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4',
  'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3'
];

// Installazione: salva tutti i file base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Attivazione: rimuove vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

// Strategia di fetch
self.addEventListener('fetch', event => {
  const { request } = event;

  // Navigazioni (HTML) → network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Altri file → cache first, poi network
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(response => {
          // Copia eventuali nuove versioni nella cache per uso futuro
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
      );
    })
  );
});
