const CACHE = "ledger-v2";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(cache){ return cache.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Network-first for the page itself, so updates always show up.
// Falls back to cache only when offline.
self.addEventListener("fetch", function(e){
  e.respondWith(
    fetch(e.request).then(function(res){
      return caches.open(CACHE).then(function(cache){
        cache.put(e.request, res.clone());
        return res;
      });
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
