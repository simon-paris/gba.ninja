
self.addEventListener('install', function(event) {
    console.log("sw installed");
});

var cacheName = "gba-ninja";
self.addEventListener("fetch", function(event) {
    console.log("sw fetch " + event.request.url);
    event.respondWith(
        fetch(event.request).then(function (response) {
            return caches.open(cacheName).then(function (cache) {
                cache.put(event.request, response.clone());
                return response;
            });
        }).catch(function() {
            return caches.open(cacheName).then(function(cache) {
                return cache.match(event.request);
            });
        })
    );
});

console.log("sw loaded");
