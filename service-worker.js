const CACHE_NAME = 'komeda-ticket-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/icon-192.png',
  '/images/icon-512.png'
];
// スコープを明示的に設定
self.addEventListener('install', (event) => {
  self.scope = '/';
  // 他の処理...
});

// インストール時にキャッシュを設定
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時にキャッシュしたリソースを使用
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュが見つかればそれを返す
        if (response) {
          return response;
        }
        
        // キャッシュが見つからなければネットワークから取得
        return fetch(event.request)
          .then((response) => {
            // 無効なレスポンスは使わない
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // レスポンスをクローンしてキャッシュ
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});