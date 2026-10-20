const CACHE_NAME = 'poke-pwa-v3';


const urlsToCache = [
    './',
    './index.html',
    './detalle.html',
    './css/styles.css',
    './js/app.js',
    './js/detalle.js',
    './manifest.json'
];


self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Abriendo caché y guardando archivos estáticos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});


self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});


self.addEventListener('fetch', e => {

    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
          
            if (cachedResponse) {
                return cachedResponse;
            }

          
            return fetch(e.request).then(networkResponse => {
             
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !e.request.url.includes('pokeapi') && !e.request.url.includes('raw.githubusercontent.com')) {
                    return networkResponse;
                }

           
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
               
                console.log('Fallo la conexión de red para:', e.request.url);
            });
        })
    );
});