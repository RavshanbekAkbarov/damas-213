// Service worker: Chrome saytni "o'rnatiladigan ilova" deb tanishi uchun.
// Hozircha hech narsani keshlamaydi, so'rovlar odatdagidek internetdan keladi.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("fetch", () => {});
