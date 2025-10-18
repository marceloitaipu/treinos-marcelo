const CACHE_NAME = 'treinos-marcelo-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('💪 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('💪 Service Worker: Cache criado');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('💪 Service Worker: Erro no cache:', err);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('💪 Service Worker: Servindo do cache:', event.request.url);
          return response;
        }
        console.log('💪 Service Worker: Buscando da rede:', event.request.url);
        return fetch(event.request);
      })
      .catch(err => {
        console.error('💪 Service Worker: Erro no fetch:', err);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('💪 Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('💪 Service Worker: Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Update found
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('💪 Service Worker: Registrado com sucesso!');