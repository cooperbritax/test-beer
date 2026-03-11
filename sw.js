const CACHE_NAME = "beertracker-v3";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./assets/css/styles.css",
  "./assets/js/app.js",
  "./assets/js/state.js",
  "./assets/js/storage.js",
  "./assets/js/ui.js",
  "./assets/js/keg.js",
  "./assets/images/beer_glass_bg.png",
  "./assets/images/icon-192.png",
  "./assets/images/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
