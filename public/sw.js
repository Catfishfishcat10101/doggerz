// sw.js
self.addEventListener("install", () => {
  console.log("Service Worker installed.");
});
self.addEventListener("activate", () => {
  console.log("Service Worker activated.");
});
self.addEventListener("fetch", (event) => {
  console.log("Fetching:", event.request.url);
});