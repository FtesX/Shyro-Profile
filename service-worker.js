// ==========================
// SHYRO PROFILE — SERVICE WORKER
// ==========================
// Зорилго: сайтыг offline үед ч (интернэт тасарсан, weak сүлжээтэй үед) нээгдэх
// боломжтой болгох. Firebase / Lanyard зэрэг live датаг cache-лэхгүй —
// зөвхөн статик файлуудыг (HTML/CSS/JS/зураг/дуу) offline ажиллуулна.

const CACHE_VERSION = "shyro-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/music.mp3"
];

// ==========================
// INSTALL — үндсэн файлуудыг урьдчилж cache-лэнэ
// ==========================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        // Нэг файл татагдахгүй байлаа ч бусад нь ажиллаж чадна
        console.log("SW install cache error:", err);
      });
    })
  );
  self.skipWaiting();
});

// ==========================
// ACTIVATE — хуучин cache-үүдийг устгана
// ==========================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ==========================
// FETCH STRATEGY
// ==========================
// - Firebase / Lanyard зэрэг гадаад API руу хийсэн хүсэлтэд SW огт хөндлөнгөөс
//   оролцохгүй (network-only) — realtime мэдээлэл заавал шинэ байх ёстой.
// - Өөрийн статик файлуудад: network-first, интернэт байхгүй үед cache руу
//   унана. Ингэснээр шинэчлэлт нэн даруй харагдана, offline үед хуучин
//   хувилбар ажиллана.

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Гадаад (Firebase/Lanyard/Google Fonts гм) хүсэлтийг SW-ээр дамжуулахгүй
  if (!isSameOrigin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
  );
});
