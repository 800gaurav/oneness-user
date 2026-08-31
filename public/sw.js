self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests, API calls, and non-http(s) / extension schemes
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http') ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return Response.error();
    })
  );
});
