console.log("Loaded service worker!");
self.addEventListener("push", (ev) => {
  const data = ev.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "favicon.ico",
  });
});
