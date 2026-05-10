// ═══════════════════════════════════════════════════════
// HR Mármores e Granitos — Service Worker v17
// ═══════════════════════════════════════════════════════

var CACHE_VERSION = 'hr-app-v17';

var APP_SHELL = [
  '/Novo-app/index.html',
  '/Novo-app/styles.css',
  '/Novo-app/manifest.json',
  '/Novo-app/icon-192.png',
  '/Novo-app/icon-512.png',
  '/Novo-app/app-core.js'
];
// ── INSTALL: pré-cacheia o app shell ──
self.addEventListener('install', function(e) {
  // Força assumir controle imediatamente sem esperar
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return Promise.all(
        APP_SHELL.map(function(url) {
          return fetch(url, { cache: 'no-store' })
            .then(function(res) {
              if (res.ok) return cache.put(url, res);
            })
            .catch(function() {});
        })
      );
    })
  );
});

// ── ACTIVATE: apaga TODOS os caches antigos ──
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          // Apaga qualquer cache que não seja o atual
          if (key !== CACHE_VERSION) {
            console.log('[SW] Apagando cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      // Assume controle de todas as abas imediatamente
      return self.clients.claim();
    }).then(function() {
      // Força todas as abas a recarregar para pegar versão nova
      return self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
          // Força reload em todas as abas abertas
          client.navigate(client.url);
        });
      });
    })
  );
});

// ── MESSAGE: força atualização quando solicitado ──
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── FETCH: Network-first — sempre busca da rede primeiro ──
self.addEventListener('fetch', function(e) {
  var req = e.request;

  if (req.method !== 'GET') return;
  if (req.url.startsWith('chrome-extension://')) return;

  // Fontes externas: cache-first
  var isExternal = req.url.startsWith('https://fonts.') ||
                   req.url.startsWith('https://cdnjs.') ||
                   req.url.indexOf('googleapis.com') > -1 ||
                   req.url.indexOf('gstatic.com') > -1;

  if (isExternal) {
    e.respondWith(
      caches.match(req).then(function(cached) {
        if (cached) return cached;
        return fetch(req).then(function(res) {
          if (res && res.ok) {
            var clone = res.clone();
            caches.open(CACHE_VERSION).then(function(c) { c.put(req, clone); });
          }
          return res;
        }).catch(function() {
          return new Response('', { status: 408 });
        });
      })
    );
    return;
  }

  // App files: Network-first, sem cache de fallback para JS/HTML
  e.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(function(res) {
        if (res && res.ok) {
          var clone = res.clone();
          caches.open(CACHE_VERSION).then(function(c) { c.put(req, clone); });
        }
        return res;
      })
      .catch(function() {
        return caches.match(req).then(function(cached) {
          if (cached) return cached;
          var accept = req.headers.get('accept') || '';
          if (accept.indexOf('text/html') > -1) {
            return new Response(OFFLINE_HTML, {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
          return new Response('', { status: 503 });
        });
      })
  );
});

// ── OFFLINE FALLBACK ──
var OFFLINE_HTML = '<!DOCTYPE html><html lang="pt-BR"><head>' +
  '<meta charset="UTF-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>HR Mármores</title>' +
  '<style>body{background:#070709;color:#F4EFE8;font-family:sans-serif;' +
  'display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}' +
  'h2{color:#C9A84C}button{background:#C9A84C;color:#000;border:none;' +
  'border-radius:12px;padding:14px 28px;font-size:.9rem;font-weight:700;cursor:pointer}' +
  '</style></head><body>' +
  '<div><div style="font-size:3rem">📡</div>' +
  '<h2>Sem conexão</h2>' +
  '<p style="opacity:.6;margin:12px 0 24px">Verifique sua conexão e tente novamente.</p>' +
  '<button onclick="window.location.reload()">Tentar novamente</button>' +
  '</div></body></html>';

