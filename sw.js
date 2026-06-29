// FAST Journey - Service Worker
// シンプルなオフラインキャッシュ（ネットワーク優先 → 失敗時キャッシュ）
const CACHE_NAME = 'fast-journey-cache-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-180.png',
  './assets/sonobo_2.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .catch(() => {}) // 一部アセットが無くても失敗させない
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // ナビゲーション以外（http/https）のみ処理
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 取得できたら最新版をキャッシュに保存しておく
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone).catch(() => {});
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // オフライン時はキャッシュから返す
  );
});
