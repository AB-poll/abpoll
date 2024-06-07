const staticCacheName = 'cache-v11';
const dynamicCacheName = 'runtimeCache-v11';

// Pre Caching Assets
//removed '/' from bellow
const precacheAssets = [
    '/manifest.json',
    '/fallback.html',
    '/js/app.js',
    '/js/plugins.init.js',
    '/js/payments.js',
    '/js/abpoll.js',
    '/js/chat.js',
    '/js/chat-2.js',
    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/6.5.95/css/materialdesignicons.min.css',
    'https://cdn.jsdelivr.net/npm/@iconscout/unicons@3.0.6/css/line.css',
    'https://sc-static.net/scevent.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery.lazy/1.7.11/jquery.lazy.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.28.0/feather.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment-with-locales.min.js',
    'https://cdn.jsdelivr.net/npm/shareon@2/dist/shareon.min.css',
    'https://cdn.jsdelivr.net/npm/shareon@2/dist/shareon.iife.js',
    '/css/colors/default.css',
    '/css/style.css',
    '/css/font/stylesheet.css',
    '/css/font/HelveticaNowText-Black.woff',
    '/css/font/HelveticaNowText-Black.woff2',
    '/css/font/HelveticaNowText-BlackItalic.woff',
    '/css/font/HelveticaNowText-BlackItalic.woff2',
    '/css/font/HelveticaNowText-Bold.woff',
    '/css/font/HelveticaNowText-Bold.woff2',
    '/css/font/HelveticaNowText-BoldItalic.woff',
    '/css/font/HelveticaNowText-BoldItalic.woff2',
    '/css/font/HelveticaNowText-ExtBdIta.woff',
    '/css/font/HelveticaNowText-ExtBdIta.woff2',
    '/css/font/HelveticaNowText-ExtLtIta.woff',
    '/css/font/HelveticaNowText-ExtLtIta.woff2',
    '/css/font/HelveticaNowText-ExtraBold.woff',
    '/css/font/HelveticaNowText-ExtraBold.woff2',
    '/css/font/HelveticaNowText-ExtraLight.woff',
    '/css/font/HelveticaNowText-ExtraLight.woff2',
    '/css/font/HelveticaNowText-Light.woff',
    '/css/font/HelveticaNowText-Light.woff2',
    '/css/font/HelveticaNowText-LightItalic.woff',
    '/css/font/HelveticaNowText-LightItalic.woff2',
    '/css/font/HelveticaNowText-Medium.woff',
    '/css/font/HelveticaNowText-Medium.woff2',
    '/css/font/HelveticaNowText-MediumItalic.woff',
    '/css/font/HelveticaNowText-MediumItalic.woff2',
    '/css/font/HelveticaNowText-RegIta.woff',
    '/css/font/HelveticaNowText-RegIta.woff2',
    '/css/font/HelveticaNowText-Regular.woff',
    '/css/font/HelveticaNowText-Regular.woff2',
    '/css/font/HelveticaNowText-Thin.woff',
    '/css/font/HelveticaNowText-Thin.woff2',
    '/css/font/HelveticaNowText-ThinItalic.woff',
    '/css/font/HelveticaNowText-ThinItalic.woff2',
]

// Install Event
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll(precacheAssets);
            console.log('successfully installed')
        })
    );
});

// Activate Event
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(keys => {
            console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(cacheRes => {
            return cacheRes || fetch(event.request).then(response => {
                return caches.open(dynamicCacheName).then(function (cache) {
                    // the line bellow is trying to cache post requests
                    //cache.put(event.request, response.clone());
                    return response;
                })
            });
        }).catch(function() {
            // Fallback Page, When No Internet Connection
            return caches.match('/fallback.html');
          })
    );
});