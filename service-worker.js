const CACHE_NAME = 'offline-v1';

// Fichiers indispensables au fonctionnement hors-ligne (le « app shell »)
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/reservation.html',
    '/commande.html',
    '/confirmation-reservation.html',
    '/offline.html',
    '/assets/css/styles.css',
    '/assets/js/script.js',
    '/js/ios-hint.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/assets/img/alex-haney-CAhjZmVk5H4-unsplash.jpg',
    '/assets/img/alex-suprun.png',
    '/assets/img/casey-lee-awj7sRviVXo-unsplash.jpg',
    '/assets/img/dan-rooney-qm6yxe7SjWg-unsplash.jpg',
    '/assets/img/Daniel_David.jpg',
    '/assets/img/davey-gravy-DmO662qvWO8-unsplash.jpg',
    '/assets/img/edward-howell-R8HoXig87p8-unsplash.jpg',
    '/assets/img/fabrizio-magoni-boaDpmC-_Xo-unsplash.jpg',
    '/assets/img/filipp-romanovski-naSJ-jJyqNQ-unsplash.jpg',
    '/assets/img/gatoozo_favicon.png',
    '/assets/img/gatoozo_logo-2.png',
    '/assets/img/gatoozo_logo.png',
    '/assets/img/illustrations_beer.png',
    '/assets/img/illustrations_cabin.png',
    '/assets/img/illustrations_touski.png',
    '/assets/img/illustrations_island.png',
    '/assets/img/jakub-kapusnak-4f4YZfDMLeU-unsplash.jpg',
    '/assets/img/jane-nackos.jpg',
    '/assets/img/jason-leung--eKZLpj7U0E-unsplash.jpg',
    '/assets/img/joseph-gonzalez.jpg',
    '/assets/img/Lea_Boutin.jpg',
    '/assets/img/michele-blackwell-rAyCBQTH7ws-unsplash.jpg',
    '/assets/img/pablo-merchan-montes-Orz90t6o0e4-unsplash.jpg',
    '/assets/img/paulo-doi-6uTQmtqcAzs-unsplash.jpg',
    '/assets/img/sebastian-coman-photography-nQqNjfOVvrs-unsplash.jpg',
    '/assets/img/Sophie_Martin.jpg'
];

// ----- INSTALL : on précache l'app shell -----
self.addEventListener('install', (evt) => {
    console.log('[SW] Install');
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pré-cache de l\'app shell');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ----- ACTIVATE : on supprime les anciennes caches -----
self.addEventListener('activate', (evt) => {
    console.log('[SW] Activate');
    evt.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Suppression de l\'ancienne cache', key);
                        return caches.delete(key);
                    }
                    return Promise.resolve();
                })
            )
        )
    );
    self.clients.claim();
});

// ----- FETCH : stratégies selon la requête -----
self.addEventListener('fetch', (evt) => {
    const { request } = evt;

    if (request.method !== 'GET') return;

    // 1) Navigation -> NETWORK FIRST (avec fallback offline.html)
    if (request.mode === 'navigate') {
        evt.respondWith(
            fetch(request)
                .then((response) => {
                    // Sécurité : On ne cache que les réponses valides
                    if (response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached || caches.match('/offline.html');
                })
        );
        return;
    }

    // 2) Autres ressources -> CACHE FIRST
    evt.respondWith(
        caches.match(request).then((cached) => {
            return (
                cached ||
                fetch(request).then((response) => {
                    // Sécurité : On ne cache que si c'est un succès du réseau
                    if (response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
            );
        })
    );
});