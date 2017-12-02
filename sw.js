
self.addEventListener('install', function(event) {
    console.log("sw installed");
});

var cacheName = "gba-ninja";
self.addEventListener("fetch", function(event) {
    
    if (event.request.method !== "GET" || event.request.url.indexOf(self.origin + "/") !== 0) {

        console.log("sw fetch [ignore] " + event.request.url);
        event.respondWith(fetch(event.request));

    } else {

        event.respondWith(
            fetch(event.request).then(function (response) {
                console.log("sw fetch [network] " + event.request.url);
                return caches.open(cacheName).then(function (cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            }).catch(function () {
                console.log("sw fetch [cache] " + event.request.url);
                return caches.open(cacheName).then(function(cache) {
                    return cache.match(event.request);
                });
            })
        );

    }
    
});

self.addEventListener("error", function (err) {
    var error = err.error;
    var str = "";
    str += " Message: " + error.message + "; ";
    try {
        str += " StackTop: " + error.stack.split(/\n/g)[1].trim() + "; ";
    } catch (e) {}

    // TODO: send this to google analytics
    console.error(str);
    
});

console.log("sw loaded");

