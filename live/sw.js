// Free to Race Live: serve solo perche' Chrome proponga l'installazione con un tocco.
// Non tiene niente in memoria: le pagine arrivano dalla rete come sempre; il resto (feed, dati) non passa di qui.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">' +
    '<body style="margin:0;background:#0b0d12;color:#eef1f6;font:16px system-ui;padding:60px 20px;text-align:center">' +
    '<b>Free to Race</b><p>Senza connessione · Offline</p><button onclick="location.reload()">↻</button></body>',
    {headers: {'Content-Type': 'text/html; charset=utf-8'}})));
});
