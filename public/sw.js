// Service Worker desativado.
// A versão anterior guardava uma cópia fixa do app (cache-first) e nunca
// buscava atualizações, fazendo o navegador mostrar código antigo mesmo
// depois de novos deploys. Este arquivo limpa esse cache automaticamente
// e se desinstala, pra todo mundo voltar a receber a versão mais recente.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
  );
});
