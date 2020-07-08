/***************************************************************
 * WORKBOX
 ***************************************************************/
workbox.setConfig({
  debug: true,
});

workbox.precaching.precacheAndRoute([]);

workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

workbox.routing.registerRoute(
  new RegExp('http://172.22.22.52:3000/api'),
  workbox.strategies.networkFirst({
    cacheName: 'api',
  })
);

workbox.routing.registerRoute(
  new RegExp('http://172.22.22.52:3000'),
  workbox.strategies.cacheFirst({
    cacheName: 'app',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 30,
      }),
    ],
  })
);
