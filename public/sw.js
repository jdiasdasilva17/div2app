self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Volei Div2 Tracker";
  const options = {
    body: data.body || "Atualizacao nova disponivel"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
