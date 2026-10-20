const CACHE_NAME = 'poke-pwa-v4';

// Archivos locales que deben estar precacheados de inmediato
const STATIC_ASSETS = [
    './',
    './index.html',
    './detalle.html',
    './css/style.css',
    './js/app.js',
    './js/detalle.js',
    './manifest.json'
];

// 1. Instalación: Precacheamos todos los archivos locales
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Guardando recursos estáticos en caché...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Activación: Eliminamos cachés viejas y tomamos control inmediato
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Intercepción de Peticiones (Fetch)
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);

    // Manejo de Navegación HTML (incluyendo detalle.html?id=X)
    if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
        e.respondWith(
            fetch(e.request)
                .then(response => {
                    // Si hay red, clonamos y guardamos la página en caché
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
                    return response;
                })
                .catch(async () => {
                    // Si no hay internet:
                    // 1. Intentamos buscar la URL exacta en la caché
                    const cachedResponse = await caches.match(e.request);
                    if (cachedResponse) return cachedResponse;

                    // 2. Si es la página de detalle (detalle.html?id=...), devolvemos 'detalle.html' precacheado
                    if (url.pathname.includes('detalle.html')) {
                        const fallbackDetail = await caches.match('./detalle.html');
                        if (fallbackDetail) return fallbackDetail;
                    }

                    // 3. Si es la principal, devolvemos index.html
                    return caches.match('./index.html');
                })
        );
        return;
    }

    // Manejo de peticiones a la API, imágenes y recursos estáticos
    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            if (cachedResponse) {
                // Si ya está en caché, devolvemos de inmediato (y actualizamos en segundo plano si hay red)
                fetch(e.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResponse));
                    }
                }).catch(() => {/* Ignore network errors offline */});

                return cachedResponse;
            }

            // Si no está en caché, lo traemos de la red y lo guardamos
            return fetch(e.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, responseToCache);
                });

                return networkResponse;
            });
        })
    );
});