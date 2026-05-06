// Versão com timestamp para forçar atualização
const CACHE_VERSION = 'v7.0.0';
const CACHE_NAME = `tm-${CACHE_VERSION}-${Date.now()}`;
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/utils.js',
    '/js/data.js',
    '/js/storage.js',
    '/js/series.js',
    '/js/timer.js',
    '/js/treinos.js',
    '/js/treino-session.js',
    '/js/historico-detalhado.js',
    '/js/historico.js',
    '/js/evolucao.js',
    '/js/backup.js',
    '/js/app.js'
];

self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker instalando versão:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Cacheando assets:', urlsToCache);
      // Adicionar query string para forçar atualização
      const urlsComTimestamp = urlsToCache.map(url => `${url}?v=${Date.now()}`);
      return cache.addAll(urlsComTimestamp);
    })
  );
  // Forçar ativação imediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativando versão:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('🗑️ Limpando caches antigos:', keys.filter(k => k !== CACHE_NAME));
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  // Assumir controle imediato de todas as páginas
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;

  // Estratégia: Network First para HTML (sempre busca do servidor)
  const isHTMLRequest = req.url.includes('.html') || req.url.endsWith('/');
  
  if (isHTMLRequest) {
    // Network First com cache-bypass - sempre busca a versão mais recente
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // Cache First para assets estáticos
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      })
    );
  }
});